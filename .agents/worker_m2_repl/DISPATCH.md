# DISPATCH — Milestone 2: Safe Admin Integration (Replacement)

- Working Directory: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m2_repl
- Role: Admin App Worker
- Identity: teamwork_preview_worker
- Original Request: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md
- Scope Document: c:/Users/satya/Documents/antigravity/modest-hypatia/PROJECT.md
- Explorer Findings:
  - c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/explorer_survey_2/handoff.md
  - c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/explorer_survey_2/analysis.md

## Write Ownership
You EXCLUSIVELY own:
- `admin/src/app/page.tsx`
DO NOT modify any other files.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## CRITICAL CONSTRAINTS
- Read the target file completely 4 times before applying a replace_file_content.
- DO NOT change any UI elements or states! Keep all tabs, buttons, forms, and states untouched.
- The Next.js Admin build must still pass (`npm run build` in `admin/`).

## Objectives & Requirements
1. Read `ORIGINAL_REQUEST.md` and the explorer analysis reports first.
2. Read `admin/src/app/page.tsx` completely 4 times.
3. Update `handlePublish` in `admin/src/app/page.tsx`:
   - Change the fetch target from `"http://localhost:3000/api/store"` to `"http://localhost:8787/api/settings"`.
   - Update the success message if needed, e.g. `"✓ Changes Published to Live Settings Backend (localhost:8787)!"`.
   - Maintain the exact payload, headers, method, try/catch, error handling, and state toggles (`isPublishing`, `publishMessage`).
   - DO NOT alter any UI components, tab buttons, form fields, styling, or state hooks.
4. Verification:
   - Run `npm run build` in `c:/Users/satya/Documents/antigravity/modest-hypatia/admin`.
   - Verify exit code 0.
5. Write your handoff report to `c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m2_repl/handoff.md`.
6. Communicate completion back to the orchestrator via `send_message`.

## 2026-10-06T04:05:44Z
<USER_REQUEST>
You are worker_m2_repl (teamwork_preview_worker).
Your working directory is: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m2_repl
Your dispatch instructions are at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m2_repl/DISPATCH.md
The authoritative original request is at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md
The project scope is at: c:/Users/satya/Documents/antigravity/modest-hypatia/PROJECT.md
The explorer survey analysis is at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/explorer_survey_2/analysis.md and c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/explorer_survey_2/handoff.md

You MUST read ORIGINAL_REQUEST.md first.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINTS:
- Read target file completely 4 times before applying replace_file_content.
- Write ownership: You EXCLUSIVELY own admin/src/app/page.tsx. Do NOT touch any other files.
- DO NOT change any UI elements or states!
- The Next.js Admin build must pass (npm run build in admin/).

Task:
1. Update handlePublish in admin/src/app/page.tsx to send the payload to http://localhost:8787/api/settings instead of http://localhost:3000/api/store.
2. Ensure all UI elements, tabs, buttons, forms, and states are completely unchanged.
3. Verify by running npm run build in admin/.
4. Write handoff.md in your working directory and notify the orchestrator via send_message.
</USER_REQUEST>
