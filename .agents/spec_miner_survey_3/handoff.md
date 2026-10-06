# Handoff Report: Frontend Dynamic SEO & Layout Specification

**Agent**: `spec_miner_survey_3` (`teamwork_preview_spec_miner`)  
**Date**: 2026-10-06  
**Type**: Hard Handoff (Task Complete)  
**Target Recipient**: Orchestrator (`44ab93d7-d8b8-4293-92d7-c5de155d5331`) / Downstream Planner & Workers  

---

## 1. Observation

1. **Baseline Layout Code Inspection (`frontend/src/app/layout.tsx`)**:
   - Line 1: `import type { Metadata } from "next";`
   - Line 2: `import { Playfair_Display, Montserrat, Great_Vibes, Cinzel } from "next/font/google";`
   - Line 3: `import "./globals.css";`
   - Lines 5–8: Font instances: `playfair` (`--font-playfair`), `montserrat` (`--font-montserrat`), `greatVibes` (`--font-painter`), `cinzel` (`--font-royal`).
   - Lines 10–15: Component imports: `SmoothScrolling`, `CartDrawer`, `FloatingWhatsApp`, `AuthModal`, `Providers`.
   - Line 17: `import { Metadata, Viewport } from "next";`
   - Lines 19–24: `export const viewport: Viewport = { themeColor: "#1A0B16", width: "device-width", initialScale: 1, maximumScale: 1 };`
   - Lines 26–68: `export const metadata: Metadata = { ... }` (static metadata definition).
   - Lines 70–87: `const jsonLd = { "@context": "https://schema.org", "@type": "Store", ... };`
   - Lines 89–112: `export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) { ... }`
2. **Verbatim Build & Typecheck Errors**:
   - Command run: `npm run build` in `frontend/` (Task-86):
     ```
     > frontend@0.1.0 build
     > next build
     ▲ Next.js 16.3.6 (Turbopack)
     - Environments: .env.local
     ✓ Running next.config.ts took 2.4s
       Creating an optimized production build ...
     ✓ Compiled successfully in 2.8min
       Running TypeScript ...
     src/app/layout.tsx(1,15): error TS2300: Duplicate identifier 'Metadata'.
     src/app/layout.tsx(17,10): error TS2300: Duplicate identifier 'Metadata'.
     Failed to type check.
     ```
   - Command run: `npx tsc --noEmit` in `frontend/` (Task-109):
     ```
     src/app/layout.tsx(1,15): error TS2300: Duplicate identifier 'Metadata'.
     src/app/layout.tsx(17,10): error TS2300: Duplicate identifier 'Metadata'.
     ```
   - *Direct finding*: Zero other TypeScript errors exist across `frontend/`. Only the duplicate `Metadata` import on lines 1 and 17 prevents typecheck and build from succeeding.
3. **Backend API Target & Contract**:
   - `ORIGINAL_REQUEST.md` (R1 & R3): Rust D1 backend serves `GET /api/settings` and `POST /api/settings` at `http://localhost:8787/api/settings`.
   - `explorer_survey_1` analysis: Cloudflare Worker stores global settings in table `settings` (`key TEXT PRIMARY KEY, value TEXT NOT NULL`) under `key = 'global'` and returns JSON with CORS headers (`Access-Control-Allow-Origin: *`).
   - `explorer_survey_2` analysis: Admin publishes fields including `brandName`, `clothingLogo`, `jewelryLogo`, `clothingCategoryHeading`, `clothingSubtext`, `domain`, `seoTitle`, `seoDescription`.

---

## 2. Logic Chain

1. **Observation 1 & 2 -> Import Deduplication**:
   Line 1 imports `type { Metadata }` while Line 17 imports `{ Metadata, Viewport }`. This exact syntax creates TypeScript error `TS2300`. Consolidating this import to `import type { Metadata, Viewport } from "next";` at the top and eliminating Line 17 resolves all TypeScript errors in `frontend/`, allowing `npx tsc --noEmit` to pass cleanly.
2. **Next.js App Router Invariants -> Replacing `metadata` with `generateMetadata`**:
   In Next.js App Router, exporting both static `metadata` and async `generateMetadata` in `layout.tsx` is strictly prohibited. Therefore, the static object must be renamed to `DEFAULT_METADATA: Metadata`, and `export async function generateMetadata(): Promise<Metadata>` must be exported in its place.
3. **Build Prerendering & Network Failure -> Defensive Fetch Architecture**:
   During `npm run build`, Next.js executes `generateMetadata` statically. If the Cloudflare Worker on `http://localhost:8787` is offline (normal during build time or offline environments), an unhandled `fetch` throws `TypeError: fetch failed` (`ECONNREFUSED`), aborting the build. Furthermore, a hanging connection can stall builds.
   *Inference*: Wrapping `fetch` with an `AbortController` (1500ms timeout) inside a comprehensive `try/catch` that returns `DEFAULT_METADATA` guarantees that `generateMetadata` never throws and never crashes the build or SSR.
4. **Zero UI / Layout Breakage -> Server Component Head Injection**:
   In Next.js App Router, `generateMetadata` automatically injects tags into `<head>` without modifying `RootLayout`'s JSX return.
   *Inference*: `RootLayout` can remain 100% byte-for-byte untouched in its returned JSX tree (`<html>`, `<body>`, font CSS variables, `Providers`, `SmoothScrolling`, and child components). This guarantees zero visual regression, zero styling changes, and zero animation interference.

---

## 3. Caveats

1. **Local Worker Port**: The default backend endpoint is assumed to be `http://localhost:8787/api/settings`. It is recommended to use `process.env.SETTINGS_API_URL || "http://localhost:8787/api/settings"` so custom ports or Cloudflare Worker preview URLs can be overridden in staging/production without code modification.
2. **JSON-LD Schema Dynamic Hydration**: `RootLayout` currently embeds static `jsonLd`. While `jsonLd` can also be dynamically parameterized, modifying it inside `RootLayout` is optional and should only be touched if explicitly requested, ensuring zero risk to the root JSX render tree.

---

## 4. Conclusion

1. **Specification is Fully Defined**:
   - Convert static `metadata` to `DEFAULT_METADATA`.
   - Export async `generateMetadata(): Promise<Metadata>` with a 1500ms timeout `fetch` to `http://localhost:8787/api/settings`.
   - Map `brandName`, `domain`, `seoTitle`, `seoDescription`, and `clothingLogo` / `jewelryLogo` to title, description, openGraph, and twitter tags.
   - Fall back to `DEFAULT_METADATA` on any network failure, timeout, non-2xx status, or empty response.
2. **Fix Duplicate Import**:
   - Merge `Metadata` and `Viewport` imports into line 1: `import type { Metadata, Viewport } from "next";` and remove line 17.
3. **Zero UI Regression**:
   - Keep `RootLayout` JSX return and Google Fonts variables completely identical.
4. **Verification**:
   - Once implemented by the worker agent, running `npx tsc --noEmit` and `npm run build` will verify build integrity.

---

## 5. Verification Method

1. **Typecheck Verification**:
   ```powershell
   cd frontend
   npx tsc --noEmit
   ```
   *Expected Result*: Exits with code 0 (0 errors).
2. **Build Verification (Offline / Safe Fallback)**:
   ```powershell
   cd frontend
   npm run build
   ```
   *Expected Result*: Exits with code 0. Next.js creates optimized production build without crashing even when backend `localhost:8787` is not running.
3. **Inspect Specification Document**:
   Read `c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/spec_miner_survey_3/analysis.md` for complete mappings, failure matrices, and implementation code snippets.
