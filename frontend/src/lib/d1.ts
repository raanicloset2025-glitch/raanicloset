


// For local fallback if D1 is not configured


function getLocalState() {
  if (false) {
    return {}
  }
  return {};
}

function saveLocalState(state: any) {
  
}

// D1 Config
const D1_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const D1_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const D1_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const isD1Configured = D1_ACCOUNT_ID && D1_DATABASE_ID && D1_API_TOKEN;

async function queryD1(sql: string, params: any[] = []) {
  if (!isD1Configured) throw new Error("D1 is not configured");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${D1_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${D1_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("D1 Query Error:", errorText);
    throw new Error(`D1 HTTP Error: ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error("D1 Query Failed: " + JSON.stringify(data.errors));
  }

  return data.result[0].results; // D1 returns an array of result sets
}

export async function getStoreState() {
  if (!isD1Configured) {
    console.log("Using Local store_db.json fallback");
    return getLocalState();
  }

  try {
    const results = await queryD1("SELECT data FROM store_state WHERE id = 'production'");
    if (results && results.length > 0) {
      return JSON.parse(results[0].data);
    } else {
      // Initialize if empty
      await queryD1("INSERT INTO store_state (id, data) VALUES ('production', '{}')");
      return {};
    }
  } catch (error) {
    console.error("D1 Fetch Error, falling back to local:", error);
    return getLocalState();
  }
}

export async function saveStoreState(state: any) {
  if (!isD1Configured) {
    console.log("Saving to Local store_db.json fallback");
    return saveLocalState(state);
  }

  try {
    const jsonStr = JSON.stringify(state);
    
    // UPSERT logic for SQLite
    await queryD1(`
      INSERT INTO store_state (id, data) VALUES ('production', ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data
    `, [jsonStr]);
    
  } catch (error) {
    console.error("D1 Save Error, saving to local instead:", error);
    saveLocalState(state);
  }
}
