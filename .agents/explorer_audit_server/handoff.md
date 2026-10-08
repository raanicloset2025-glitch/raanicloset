# Server Communication Technical Audit & Remediation Report

**Target Scope**: Next.js API Routes, Supabase Client/Storage/Auth network calls, Cloudflare D1 query bridges, and Rust Worker communication across `admin` and `frontend`.  
**Agent**: `explorer_audit_server`  
**Date**: 2026-10-08  

---

## 1. Observation

Direct observations and evidence across `admin/` and `frontend/`:

### 1.1 Phantom Route Call `/api/upload` (`admin/src/lib/uploadMedia.ts:9`)
- **Code**:
  ```ts
  // admin/src/lib/uploadMedia.ts:9
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || `Upload failed (${res.status})`);
  }
  ```
- **Filesystem Observation**: Directory search for `upload` in `admin/src/app/api` returned 0 matches (`admin/src/app/api` only contains `store/route.ts`).
- **Result**: Any call to `uploadMedia()` immediately returns HTTP 404 from Next.js, and throws `Error: Upload failed (404)`.

---

### 1.2 Broken Local Fallback & Environment Variable Discrepancy in `d1.ts` (`frontend/src/lib/d1.ts:7-16`)
- **Code**:
  ```ts
  // frontend/src/lib/d1.ts:7-16
  function getLocalState() {
    if (false) {
      return {}
    }
    return {};
  }

  function saveLocalState(state: any) {
  }
  ```
- **Environment Configuration**:
  - `admin/.env.local`: Contains `CLOUDFLARE_ACCOUNT_ID=474f...`, `CLOUDFLARE_DATABASE_ID=5933...`, `CLOUDFLARE_API_TOKEN=cfut_...`.
  - `frontend/.env.local`: Contains ONLY `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. D1 variables are completely absent.
- **Git History**: Commit `9a6a31ddefe283a9beb75f0bd84be52048ab73b6` ("Remove fs from d1.ts") wiped out `fs.readFileSync(DB_FILE)`.
- **Database Status**: `frontend/store_db.json` exists (152 KB, 964 lines, 130+ store keys).
- **Result**: In `frontend`, `isD1Configured` evaluates to `false`. Every call to `GET /api/store` executes `getStoreState()`, which calls `getLocalState()` and returns `{}`. The 152 KB `store_db.json` fallback is completely ignored in `frontend`.

---

### 1.3 Module Import Crash on Missing `NEXT_PUBLIC_SUPABASE_URL` (`admin` & `frontend`)
- **Code**:
  ```ts
  // admin/src/lib/supabaseClient.ts:3-6
  // frontend/src/lib/supabaseClient.ts:3-6
  // admin/src/lib/supabase.ts:3-6
  // frontend/src/lib/supabase.ts:3-6
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```
- **Live Node Verification**:
  ```
  createClient('', '') -> Error: supabaseUrl is required.
  ```
- **Result**: If `NEXT_PUBLIC_SUPABASE_URL` is omitted (e.g. during CI builds, Docker stages, testing, or fresh setups), every module importing `supabaseClient` or `supabase` throws an unhandled top-level exception at parse/evaluation time, preventing the app from booting.

---

### 1.4 Duplicate Supabase Client Instantiation (`supabase.ts` vs `supabaseClient.ts`)
- In both `admin/src/lib/` and `frontend/src/lib/`, there are two files: `supabase.ts` and `supabaseClient.ts`.
- Both instantiate `createClient(supabaseUrl, supabaseAnonKey)`.
- `admin/src/lib/uploadHelper.ts` imports from `./supabaseClient`.
- `admin/src/lib/supabase.ts` creates another instance and exports `uploadMediaToSupabase`.
- **Result**: Two separate `GoTrueClient` instances are running in memory. Auth listeners registered on one client do not notify listeners on the second client, and auth token refreshes occur redundantly.

---

### 1.5 Silent Video Chunk Upload Failures in FFmpeg HLS Processing (`admin/src/lib/uploadHelper.ts:119-136`)
- **Code**:
  ```ts
  // admin/src/lib/uploadHelper.ts:119-132
  for (const f of hlsFiles) {
    const fileData = await ff.readFile(f.name);
    const blob = new Blob([fileData as any]);
    const filePath = `videos/${folderId}/${f.name}`;
    
    await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, { upsert: true });
      
    uploadedCount++;
    const upProgress = 70 + Math.floor((uploadedCount / hlsFiles.length) * 30);
    onProgress?.(upProgress);
  }

  onProgress?.(100);
  const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`videos/${folderId}/${outputPlaylist}`);
  return publicUrlData.publicUrl;
  ```
- **Observation**:
  - The return value `{ data, error }` of `supabase.storage.from(BUCKET_NAME).upload(...)` is completely uninspected in the loop.
  - If chunk upload fails (network blip, rate limit 429, payload rejection), no error is caught or thrown.
  - The function returns `publicUrl` to the playlist (`.m3u8`), but the referenced `.ts` video segments are missing in Supabase storage, creating a corrupt video playback failure in the storefront.
  - Additionally, line 135 returns `publicUrlData.publicUrl` without encoding spaces, whereas line 35 uses `.replace(/\s/g, '%20')` for `BUCKET_NAME = 'raani closet image and product'`.

---

### 1.6 Uncaught Promise Rejections & Infinite Spinner Freezes in Auth (`admin/src/app/login/page.tsx` & `frontend/src/components/AuthModal.tsx`)
- **Code in `admin/src/app/login/page.tsx`**:
  ```ts
  // Line 48:
  supabase.auth.getSession().then(async ({ data: { session } }) => { ... }); // NO .catch()

  // Lines 79-84:
  setAuthLoading(true);
  const { error } = await supabase.auth.signInWithOtp({ email: email });
  setAuthLoading(false); // If fetch throws (offline/CORS), NEVER runs!

  // Lines 97-103:
  setAuthLoading(true);
  const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
  setAuthLoading(false); // If fetch throws, NEVER runs!

  // Lines 116-121:
  setStep('google-loading');
  const { error } = await supabase.auth.signInWithOAuth({ ... });
  // If fetch throws, stays in 'google-loading' indefinitely!
  ```
- **Code in `frontend/src/components/AuthModal.tsx`**:
  - Lines 41-45, lines 59-65, and lines 77-83 contain the exact same pattern without `try/catch/finally`.
- **Result**: When client is offline, DNS resolution fails, or Supabase is unreachable, `await` throws `TypeError: Failed to fetch`. Because there is no `try/catch`, `setAuthLoading(false)` is skipped. The user interface remains frozen with a spinning button forever, and an unhandled rejection is logged in the console.

---

### 1.7 Redundant `signOut()` Invocations in `frontend/src/components/AccountMenu.tsx` & `frontend/src/store/useStore.ts`
- **Code**:
  ```ts
  // frontend/src/components/AccountMenu.tsx:65-75
  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
    logout();
    setIsOpen(false);
  };

  // frontend/src/store/useStore.ts:121-124
  logout: () => {
    supabase.auth.signOut(); // Called AGAIN! Promise ignored without await or .catch()
    set({ user: null });
  },
  ```
- **Result**: `supabase.auth.signOut()` is executed twice consecutively. The second call in `useStore.ts` produces a floating unhandled promise rejection if session is already terminated or network fails.

---

### 1.8 Concurrent Thundering Herd of `fetchFromServer()` Calls
- **Grep Observations**:
  - `frontend/src/app/Providers.tsx:10`: `useAdminStore.getState().fetchFromServer();` (no `.catch()`)
  - `frontend/src/store/useAdminStore.ts:1333`: `state.fetchFromServer();` inside `onRehydrateStorage`
  - `frontend/src/components/HeroSection.tsx:19`: `useAdminStore.getState().fetchFromServer().then(...)` (no `.catch()`)
  - `frontend/src/components/LuxuryFooter.tsx:43`: `useAdminStore.getState().fetchFromServer().then(...)` (no `.catch()`)
  - `admin/src/store/useAdminStore.ts:1324`: `state.fetchFromServer();` inside `onRehydrateStorage`
  - `admin/src/components/HeroEditor.tsx:16`: `useAdminStore.getState().fetchFromServer?.().then(...)` (no `.catch()`)
  - `admin/src/components/BespokeEditor.tsx:21`: `useAdminStore.getState().fetchFromServer?.().then(...)`
  - `admin/src/components/FooterEditor.tsx:36`: `useAdminStore.getState().fetchFromServer?.().then(...)`
  - `admin/src/components/NavbarEditor.tsx:15`: `useAdminStore.getState().fetchFromServer?.().then(...)`
  - `admin/src/components/StoryEditor.tsx:14`: `useAdminStore.getState().fetchFromServer?.().then(...)`
  - `admin/src/components/SearchEditor.tsx:15`: `useAdminStore.getState().fetchFromServer?.().then(...)`
- **Result**: On initial page render, 5 to 8 separate HTTP `GET /api/store` requests fire simultaneously. There is no request deduplication or Promise coalescing in `fetchFromServer`. Each completing promise triggers a store state replacement and subscriber re-render wave.

---

### 1.9 Browser Cache Invalidation Flaw in Admin (`admin/src/store/useAdminStore.ts:1305`)
- **Code in `frontend/src/store/useAdminStore.ts:1314`**:
  `const res = await fetch('/api/store', { cache: 'no-store' });`
- **Code in `admin/src/store/useAdminStore.ts:1305`**:
  `const res = await fetch('/api/store');`
- **Observation**: `admin` omits `{ cache: 'no-store' }`. Browsers and Next.js client-side router cache HTTP GET responses.
- **Result**: When an administrator publishes changes via `POST /api/store` and reloads the admin dashboard or switches tabs, `fetch('/api/store')` may return a stale 304 / cached 200 payload, reverting changes in the editor.

---

### 1.10 Inadequate Status Codes and Input Validation in Next.js Store API Routes
- **Code in `admin/src/app/api/store/route.ts` & `frontend/src/app/api/store/route.ts`**:
  ```ts
  export async function GET() {
    try {
      const data = await getStoreState();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: "Failed to read store" }, { status: 500 });
    }
  }

  export async function POST(request: Request) {
    try {
      const data = await request.json();
      await saveStoreState(data);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: "Failed to write store" }, { status: 500 });
    }
  }
  ```
- **Observations**:
  1. `GET` response lacks explicit `Cache-Control: no-store, max-age=0, must-revalidate` headers.
  2. In `POST`, if `request.json()` fails (e.g. empty body or invalid JSON), it returns HTTP 500 instead of HTTP 400 Bad Request.
  3. No body validation: `data` can be non-object, empty, or oversized.
  4. Neither route includes CORS headers (`Access-Control-Allow-Origin`). Cross-origin requests between admin (`:3001`) and frontend (`:3000`) are blocked by the browser.

---

### 1.11 Mixed Content Blocking & Unimplemented Product CRUD (`frontend/src/store/useAdminStore.ts`)
- **Code**:
  ```ts
  // Lines 984 & 1004:
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
  const res = await fetch(`${apiUrl}/api/products`);
  ...
  await fetch(`${apiUrl}/api/products`, { method: "POST", ... });

  // Lines 1012-1023:
  updateProduct: async (id, updates) => {
    set((state) => ({ products: state.products.map(...) }));
    // Real-world: Need a PUT endpoint in Rust
  },
  deleteProduct: async (id) => {
    set((state) => ({ products: state.products.filter(...) }));
    // Real-world: Need a DELETE endpoint in Rust
  },
  ```
- **Observations**:
  1. In production (deployed at `https://raani.pages.dev`), `http://localhost:8787` is blocked by modern browsers under the **Mixed Content** security policy (HTTPS page requesting HTTP resource).
  2. If `NEXT_PUBLIC_API_URL` has a trailing slash (`https://api.example.com/`), it generates a broken double slash URL: `https://api.example.com//api/products`.
  3. In `addProduct`, `res.ok` is never checked. If the backend fails (400, 500), the error is lost.
  4. `updateProduct` and `deleteProduct` are stubs that do not call the backend, even though `PUT /api/products/:id` and `DELETE /api/products/:id` are already implemented in `backend/src/lib.rs:84,103,142,165`.

---

### 1.12 Timer Leak & Localhost Hang in `frontend/src/app/layout.tsx:96-134`
- **Code**:
  ```ts
  const SETTINGS_ENDPOINT = process.env.SETTINGS_API_URL || "http://localhost:8787/api/settings";

  async function fetchDynamicSettings(): Promise<SettingsPayload | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(SETTINGS_ENDPOINT, {
        signal: controller.signal,
        next: { revalidate: 60 },
      });

      clearTimeout(timeoutId);
      ...
    } catch {
      return null;
    }
  }
  ```
- **Observations**:
  1. If `fetch()` rejects immediately (e.g. connection refused on port 8787), execution jumps to `catch` before reaching `clearTimeout(timeoutId)`. The active Node.js timer is not cleaned up in a `finally` block.
  2. In production SSR builds where `SETTINGS_API_URL` is unset, every static/SSR generation hits `http://localhost:8787/api/settings` and stalls for the full 1500ms timeout.

---

### 1.13 D1 REST API Client Unsafe Indexing & Missing Timeouts (`admin/src/lib/d1.ts:25-52`)
- **Code**:
  ```ts
  const data = await res.json();
  if (!data.success) {
    throw new Error("D1 Query Failed: " + JSON.stringify(data.errors));
  }
  return data.result[0].results;
  ```
- **Observations**:
  1. No fetch timeout (`AbortSignal.timeout(10000)`). If Cloudflare API stalls, the Next.js API route hangs indefinitely.
  2. If `data.result` is empty `[]` or undefined, `data.result[0].results` throws `TypeError: Cannot read properties of undefined (reading 'results')`.
  3. In `admin/src/lib/d1.ts:5`, `const DB_FILE = path.join(process.cwd(), "../frontend/store_db.json");` assumes `admin` is run from its subdirectory. When executed from the repo root or in standalone container deployments, `process.cwd()` does not resolve to `../frontend/store_db.json`.

---

### 1.14 Ephemeral Object URLs in `frontend/src/app/admin/page.tsx:58,123`
- **Code**:
  ```ts
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateProduct(product.id, { imageSrc: url, images: [url, url, url] });
  };
  ```
- **Observation**: Uses `URL.createObjectURL(file)` which creates a temporary browser memory pointer. The image is never uploaded to Supabase or any storage service, and `frontend/src/app/admin/page.tsx` has no "Publish" button to push changes to the server. On browser refresh, all newly added images turn into broken links.

---

## 2. Logic Chain

1. **Premise A (Routes & Missing Endpoints)**: Next.js routes only respond to files matching the App Router route convention. `admin/src/lib/uploadMedia.ts` dispatches `POST /api/upload`, but no `upload/route.ts` exists. Therefore, any invocation of `uploadMedia()` will unconditionally fail with HTTP 404.
2. **Premise B (D1 Credentials & Fallback)**: `frontend/.env.local` lacks Cloudflare credentials, forcing `isD1Configured` to `false`. When `isD1Configured` is `false`, `frontend/src/lib/d1.ts` delegates to `getLocalState()`, which was gutted in commit `9a6a31d` to return `{}`. As a consequence, `frontend` neither queries D1 nor reads `frontend/store_db.json`. All calls to `GET /api/store` in `frontend` return an empty object `{}`.
3. **Premise C (Supabase Initialization)**: `@supabase/supabase-js` `createClient(url, key)` validates arguments synchronously. When `NEXT_PUBLIC_SUPABASE_URL` is empty, it throws `Error: supabaseUrl is required.` at module initialization. Since `supabaseClient.ts` executes at module scope, this brings down any SSR render or test suite that imports it.
4. **Premise D (Async Auth Exceptions)**: `supabase.auth.signInWithOtp`, `verifyOtp`, and `signInWithOAuth` communicate over network. When network is severed or DNS fails, `fetch` throws `TypeError: Failed to fetch`. In `admin/src/app/login/page.tsx` and `frontend/src/components/AuthModal.tsx`, the state flag `authLoading` is set to `true` before the await, and reset only after the await with no `try/finally` wrapper. The thrown exception bypasses the reset statement, leaving `authLoading` locked at `true` and the UI completely unresponsive.
5. **Premise E (HLS Video Integrity)**: An HLS stream consists of a master playlist (`.m3u8`) and segmented transport stream files (`.ts`). `uploadHelper.ts` iterates through `hlsFiles` and uploads them to Supabase without evaluating the `{ error }` response object. If any segment upload errors out, the loop continues and returns a public URL to an `.m3u8` playlist whose constituent segments are missing from storage, causing playback failures for high-resolution video assets.
6. **Premise F (Concurrent Request Flooding)**: `useAdminStore.fetchFromServer` is called independently by 8+ component `useEffect` hooks on mount, and on Zustand store rehydration. Without request deduplication, all components fire simultaneous HTTP `GET /api/store` calls. This causes uncoordinated SQLite reads on D1 and repeated Zustand store replacements.

---

## 3. Caveats

1. **Cloudflare Worker Deployment**: The Rust backend code in `backend/src/lib.rs` has full CRUD support for products, categories, users, bespoke requests, client diaries, and settings. However, whether the Rust worker is deployed to a live Cloudflare Worker domain (e.g., `https://api.raanicloset.com`) or only run locally with `wrangler dev` determines whether `NEXT_PUBLIC_API_URL` should point to a remote URL or Next.js internal API proxy.
2. **Supabase RLS Policies**: Direct uploads to bucket `raani closet image and product` succeed with the anon key (verified via test upload of `images/ping_test.txt`). However, storage bucket policies must remain configured to allow public reads and authorized writes.
3. **Environment Isolation**: In local development, `admin` runs on `http://localhost:3001` and `frontend` runs on `http://localhost:3000`. Any cross-port API calls between the two require CORS headers (`Access-Control-Allow-Origin: *` or allowed origins).

---

## 4. Conclusion & Concrete Code Improvement Specifications

To achieve 100% bug-free, resilient server communication while strictly preserving UI styling and Framer Motion animations, the following exact code improvements must be applied:

### Improvement 1: Create Resilient Supabase Client Singletons with Safe Fallback
Consolidate `supabase.ts` and `supabaseClient.ts` in both `admin` and `frontend`. Provide a safe client factory that validates `NEXT_PUBLIC_SUPABASE_URL` and prevents runtime module crashes:

```ts
// admin/src/lib/supabaseClient.ts & frontend/src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Fallback dummy client for build-time safety if env vars are unset
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false },
    });

export const isSupabaseConfigured = isConfigured;
```
And re-export `supabase` from `supabase.ts` instead of creating duplicate clients.

---

### Improvement 2: Restore Resilient `store_db.json` Fallback and Robust Querying in `d1.ts`
1. Copy D1 credentials to `frontend/.env.local` or provide unified D1 access.
2. Update `frontend/src/lib/d1.ts` so `getLocalState()` securely reads `store_db.json` via Node.js `fs` or bundled JSON fallback:

```ts
// frontend/src/lib/d1.ts
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "store_db.json");

function getLocalState(): Record<string, any> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read store_db.json:", err);
  }
  return {};
}

function saveLocalState(state: any): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write store_db.json:", err);
  }
}
```

3. Harden `queryD1` with timeout and safe optional chaining:
```ts
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
```

---

### Improvement 3: Fix Store API Routes with Caching Headers, CORS, and Status Codes
Update `admin/src/app/api/store/route.ts` and `frontend/src/app/api/store/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getStoreState, saveStoreState } from "@/lib/d1";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const data = await getStoreState();
    return NextResponse.json(data ?? {}, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("GET /api/store error:", error);
    return NextResponse.json(
      { error: "Failed to read store" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    if (!bodyText || !bodyText.trim()) {
      return NextResponse.json(
        { error: "Payload cannot be empty" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    let data: any;
    try {
      data = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return NextResponse.json(
        { error: "Payload must be a JSON object" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    await saveStoreState(data);
    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("POST /api/store error:", error);
    return NextResponse.json(
      { error: "Failed to write store" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
```

---

### Improvement 4: Request Deduplication & In-Flight Coalescing in `fetchFromServer`
In `useAdminStore.ts` (both `admin` and `frontend`), implement request coalescing so concurrent calls to `fetchFromServer()` share a single in-flight network request:

```ts
let inFlightFetchPromise: Promise<void> | null = null;

fetchFromServer: async () => {
  if (inFlightFetchPromise) {
    return inFlightFetchPromise;
  }

  inFlightFetchPromise = (async () => {
    try {
      const res = await fetch('/api/store', {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        console.warn(`GET /api/store responded with status ${res.status}`);
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.warn('GET /api/store did not return JSON');
        return;
      }

      const data = await res.json();
      if (data && typeof data === 'object' && !data.error && Object.keys(data).length > 0) {
        set({ ...data, hasUnsavedChanges: false });
      }
    } catch (e) {
      console.error("Failed to fetch server state:", e);
    } finally {
      inFlightFetchPromise = null;
    }
  })();

  return inFlightFetchPromise;
},
```

---

### Improvement 5: Bulletproof Auth Network Error Handling in `login/page.tsx` & `AuthModal.tsx`
Wrap all Supabase auth operations in `try/catch/finally` blocks so `setAuthLoading(false)` always executes, and display friendly error messages:

```ts
const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || resendCooldown > 0 || authLoading) return;

  setErrorMsg("");
  setAuthLoading(true);

  try {
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setResendCooldown(60);
      setStep('otp');
    }
  } catch (err: any) {
    console.error("OTP send error:", err);
    setErrorMsg(err?.message || "Network error. Please check your connection and retry.");
  } finally {
    setAuthLoading(false);
  }
};

const handleOtpSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (otp.length < 6 || authLoading) return;

  setErrorMsg("");
  setAuthLoading(true);

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email',
    });

    if (error) {
      setErrorMsg(error.message);
    } else if (data?.session || data?.user) {
      // success navigation
    }
  } catch (err: any) {
    console.error("OTP verification error:", err);
    setErrorMsg(err?.message || "Verification failed due to a network error.");
  } finally {
    setAuthLoading(false);
  }
};

const handleGoogleLogin = async () => {
  setErrorMsg("");
  setStep('google-loading');

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setErrorMsg(error.message);
      setStep('email');
    }
  } catch (err: any) {
    console.error("OAuth error:", err);
    setErrorMsg(err?.message || "Failed to initialize Google login.");
    setStep('email');
  }
};
```

---

### Improvement 6: Video Upload Chunk Verification & Percent-Encoding Normalization
In `admin/src/lib/uploadHelper.ts`, verify every chunk upload and normalize URL generation:

```ts
// Line 120-135 update:
for (const f of hlsFiles) {
  const fileData = await ff.readFile(f.name);
  const blob = new Blob([fileData as any]);
  const filePath = `videos/${folderId}/${f.name}`;
  
  const { error: chunkError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, blob, { upsert: true });

  if (chunkError) {
    throw new Error(`Failed to upload video chunk ${f.name}: ${chunkError.message}`);
  }
    
  uploadedCount++;
  const upProgress = 70 + Math.floor((uploadedCount / hlsFiles.length) * 30);
  onProgress?.(upProgress);
}

onProgress?.(100);
const { data: publicUrlData } = supabase.storage
  .from(BUCKET_NAME)
  .getPublicUrl(`videos/${folderId}/${outputPlaylist}`);

const cleanUrl = publicUrlData.publicUrl.replace(/\s/g, '%20');
return cleanUrl;
```

---

### Improvement 7: URL Normalization & Full Product CRUD Bridge
In `frontend/src/store/useAdminStore.ts`, sanitize `apiUrl` and implement `updateProduct` and `deleteProduct` calls:

```ts
const getCleanApiUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return raw.replace(/\/+$/, '');
};

updateProduct: async (id, updates) => {
  set((state) => ({
    products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  }));

  try {
    const apiUrl = getCleanApiUrl();
    if (apiUrl && !apiUrl.includes('localhost:8787')) {
      await fetch(`${apiUrl}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    }
  } catch (e) {
    console.warn("Product sync to backend skipped/failed:", e);
  }
},

deleteProduct: async (id) => {
  set((state) => ({
    products: state.products.filter((p) => p.id !== id),
  }));

  try {
    const apiUrl = getCleanApiUrl();
    if (apiUrl && !apiUrl.includes('localhost:8787')) {
      await fetch(`${apiUrl}/api/products/${id}`, {
        method: "DELETE",
      });
    }
  } catch (e) {
    console.warn("Product deletion from backend skipped/failed:", e);
  }
},
```

---

## 5. Verification Method

To independently verify all findings and validate that the codebase remains fully functional and compliant:

1. **Type Checking**:
   ```powershell
   cd C:\Users\satya\Documents\antigravity\modest-hypatia\admin
   npx tsc --noEmit
   cd C:\Users\satya\Documents\antigravity\modest-hypatia\frontend
   npx tsc --noEmit
   ```
   Both must finish with 0 errors.

2. **Next.js Production Builds**:
   ```powershell
   cd C:\Users\satya\Documents\antigravity\modest-hypatia\admin
   npm run build
   cd C:\Users\satya\Documents\antigravity\modest-hypatia\frontend
   npm run build
   ```
   Must successfully generate static assets without crashing.

3. **Verify Supabase Fallback Resilience**:
   Simulate missing environment variables:
   ```powershell
   node -e "delete process.env.NEXT_PUBLIC_SUPABASE_URL; const { supabase } = require('./admin/src/lib/supabaseClient'); console.log('Client loaded successfully:', !!supabase);"
   ```

4. **Verify Store API Route Response**:
   ```powershell
   # GET store state
   curl -i http://localhost:3000/api/store
   # Verify response headers contain Cache-Control: no-store and valid JSON payload.
   ```

5. **Invalidation Conditions**:
   - If Cloudflare D1 settings table structure changes, update `backend/src/lib.rs` and `d1.ts` query mappings accordingly.
   - If Supabase bucket permissions are restricted from public uploads, verify user session propagation before initiating multipart HLS uploads.
