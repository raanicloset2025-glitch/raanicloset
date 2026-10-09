import fs from "fs";
import path from "path";

// Locate store_db.json across varying working directories
function findDbFile(): string | null {
  try {
    if (typeof process === "undefined" || !process.cwd) return null;
    const fs = require("fs");
    const path = require("path");
    const candidates = [
      path.join(process.cwd(), "store_db.json"),
      path.join(process.cwd(), "frontend", "store_db.json"),
      path.join(process.cwd(), "..", "frontend", "store_db.json"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  } catch (e) {
    return null;
  }
}

function getLocalState(): Record<string, any> {
  try {
    const dbFile = findDbFile();
    if (dbFile) {
      const fs = require("fs");
      if (fs.existsSync(dbFile)) {
        const raw = fs.readFileSync(dbFile, "utf-8");
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.warn("[Frontend D1] Failed to read store_db.json fallback:", err);
  }
  return {};
}

function saveLocalState(state: any): void {
  try {
    const dbFile = findDbFile();
    if (dbFile) {
      const fs = require("fs");
      fs.writeFileSync(dbFile, JSON.stringify(state, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[Frontend D1] Failed to write store_db.json fallback:", err);
  }
}

// D1 Config
const D1_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const D1_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const D1_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const isD1Configured = Boolean(D1_ACCOUNT_ID && D1_DATABASE_ID && D1_API_TOKEN);

async function queryD1(sql: string, params: any[] = []): Promise<any[]> {
  if (!isD1Configured) throw new Error("D1 is not configured");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${D1_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${D1_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error("[Frontend D1] HTTP Error:", res.status, errorText);
      throw new Error(`D1 HTTP Error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error("D1 Query Failed: " + JSON.stringify(data.errors));
    }

    return data?.result?.[0]?.results ?? [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getStoreState(): Promise<Record<string, any>> {
  if (!isD1Configured) {
    return getLocalState();
  }

  try {
    const results = await queryD1("SELECT data FROM store_state WHERE id = 'production'");
    if (results && results.length > 0 && results[0]?.data) {
      return JSON.parse(results[0].data);
    } else {
      // Initialize if table exists but row is missing
      await queryD1("INSERT INTO store_state (id, data) VALUES ('production', '{}')");
      return {};
    }
  } catch (error) {
    console.error("[Frontend D1] Fetch error, falling back to local store_db.json:", error);
    return getLocalState();
  }
}

export async function saveStoreState(state: any): Promise<void> {
  if (!isD1Configured) {
    return saveLocalState(state);
  }

  try {
    const jsonStr = JSON.stringify(state);
    
    // UPSERT logic for SQLite / Cloudflare D1
    await queryD1(
      `INSERT INTO store_state (id, data) VALUES ('production', ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
      [jsonStr]
    );
  } catch (error) {
    console.error("[Frontend D1] Save error, saving to local fallback instead:", error);
    saveLocalState(state);
  }
}
