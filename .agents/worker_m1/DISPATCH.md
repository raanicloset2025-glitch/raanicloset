# DISPATCH — Milestone 1: Backend D1 Settings Table & Endpoints

- Working Directory: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m1
- Role: Backend Rust D1 Worker
- Identity: teamwork_preview_worker
- Original Request: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md
- Scope Document: c:/Users/satya/Documents/antigravity/modest-hypatia/PROJECT.md
- Explorer Findings:
  - c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/explorer_survey_1/handoff.md
  - c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/explorer_survey_1/analysis.md

## Write Ownership
You EXCLUSIVELY own:
- `backend/schema.sql`
- `backend/src/lib.rs`
DO NOT modify any other files.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## CRITICAL CONSTRAINTS
- Read the target file completely 4 times before applying a replace_file_content.
- The Rust backend must compile with cargo check with 0 errors.

## Objectives & Requirements
1. Read `ORIGINAL_REQUEST.md` and the explorer analysis reports first.
2. Read `backend/schema.sql` completely 4 times. Update it to include the `settings` table:
   ```sql
   DROP TABLE IF EXISTS settings;
   CREATE TABLE settings (
       key TEXT PRIMARY KEY,
       value TEXT NOT NULL,
       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```
   Add seed data inserting an initial global JSON settings row under key = `'global'`.
3. Read `backend/src/lib.rs` completely 4 times.
4. Implement endpoints in `backend/src/lib.rs`:
   - `GET /api/settings`: Query `settings` table for `key = 'global'`. If found, parse JSON string and return `Response::from_json(&val)`. If not found, return an empty JSON object `{}` with HTTP 200.
   - `POST /api/settings`: Read incoming JSON body (`req.json::<serde_json::Value>()`). Upsert into `settings (key, value, updated_at) VALUES ('global', ?1, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = ?1, updated_at = CURRENT_TIMESTAMP`. If existing settings exist, merge new incoming keys so partial updates don't wipe out other store settings. Return `Response::from_json(&json!({"success": true, "message": "Settings updated successfully"}))` or updated settings.
   - Ensure CORS headers (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`, `Access-Control-Allow-Headers: *`) are returned, and OPTIONS preflight (`/api/*any`) returns HTTP 200.
5. Verification:
   - Run `cargo check` in `c:/Users/satya/Documents/antigravity/modest-hypatia/backend`.
   - Verify 0 errors and 0 warnings (or clean compilation).
6. Write your handoff report to `c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m1/handoff.md`.
7. Communicate completion back to the orchestrator via `send_message`.

## 2026-10-05T19:01:46Z
You are worker_m1 (teamwork_preview_worker).
Your working directory is: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m1
Your dispatch instructions are at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/worker_m1/DISPATCH.md
The authoritative original request is at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md
The project scope is at: c:/Users/satya/Documents/antigravity/modest-hypatia/PROJECT.md
The backend survey analysis is at: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/explorer_survey_1/analysis.md and c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/explorer_survey_1/handoff.md

You MUST read ORIGINAL_REQUEST.md first.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL CONSTRAINTS:
- Read each target file completely 4 times before applying replace_file_content.
- Write ownership: You EXCLUSIVELY own backend/schema.sql and backend/src/lib.rs. Do NOT touch any other files.
- The Rust backend must compile with cargo check with 0 errors.

Task:
1. Update backend/schema.sql to include the settings table (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP) and seed row for 'global'.
2. Update backend/src/lib.rs to implement GET /api/settings and POST /api/settings with proper JSON parsing, D1 query execution, error handling, and CORS headers.
3. Run cargo check in backend/ to verify it compiles with 0 errors.
4. Write handoff.md in your working directory and notify the orchestrator via send_message.

