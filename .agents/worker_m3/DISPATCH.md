# DISPATCH — Milestone 3: Dynamic SEO in Frontend

- Working Directory: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m3
- Role: Frontend SEO Worker
- Identity: teamwork_preview_worker
- Original Request: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md
- Scope Document: c:/Users/satya/Documents/antigravity/modest-hypatia/PROJECT.md
- Explorer Findings:
  - c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/spec_miner_survey_3/handoff.md
  - c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/spec_miner_survey_3/analysis.md

## Write Ownership
You EXCLUSIVELY own:
- `frontend/src/app/layout.tsx`
DO NOT modify any other files.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## CRITICAL CONSTRAINTS
- Read the target file completely 4 times before applying a replace_file_content.
- DO NOT break the existing layout or styling! Keep the JSX structure returned by `RootLayout`, Google Fonts configuration, font variables, and CSS imports 100% intact.
- The Next.js Frontend build must pass (`npm run build` in `frontend/`).

## Objectives & Requirements
1. Read `ORIGINAL_REQUEST.md` and the spec miner analysis reports first.
2. Read `frontend/src/app/layout.tsx` completely 4 times.
3. Clean up the duplicate `Metadata` import on lines 1 and 17:
   - Consolidate to `import type { Metadata, Viewport } from "next";` at the top.
4. Implement dynamic SEO metadata:
   - Convert static `metadata` into a fallback object `DEFAULT_METADATA: Metadata`.
   - Export async function `generateMetadata(): Promise<Metadata>`.
   - In `generateMetadata`, fetch from `http://localhost:8787/api/settings` (or `process.env.SETTINGS_API_URL || "http://localhost:8787/api/settings"`) with an `AbortController` (1500ms timeout) and defensive `try/catch`.
   - If the fetch fails, times out, returns non-200, or returns invalid data, safely fall back to `DEFAULT_METADATA` so the build and runtime NEVER crash.
   - If settings are returned, map dynamic domain (`domain`), titles (`seoTitle`, `brandName`), description (`seoDescription`), and logos (`clothingLogo`, `jewelryLogo`) into the returned `Metadata` object.
5. Keep `RootLayout` JSX return completely identical: `<html lang="en">`, fonts class names, `jsonLd` script, `Providers`, `SmoothScrolling`, `CartDrawer`, `AuthModal`, `FloatingWhatsApp`.
6. Verification:
   - Run `npx tsc --noEmit` in `frontend/` to verify 0 TypeScript errors.
   - Run `npm run build` in `frontend/` to verify exit code 0.
7. Write your handoff report to `c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m3/handoff.md`.
8. Communicate completion back to the orchestrator via `send_message`.

## 2026-10-05T19:23:35Z
You are worker_m3 (teamwork_preview_worker).
Your working directory is: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m3
Your dispatch instructions are at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m3/DISPATCH.md
The authoritative original request is at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md
The project scope is at: c:/Users/satya/Documents/antigravity/modest-hypatia/PROJECT.md
The spec miner analysis is at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/spec_miner_survey_3/analysis.md and c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/spec_miner_survey_3/handoff.md

