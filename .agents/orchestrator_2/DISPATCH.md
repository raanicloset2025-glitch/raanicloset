## 2026-10-05T18:40:18Z
You are the Project Orchestrator for the task defined in ORIGINAL_REQUEST.md.
Your working directory is: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/orchestrator_2
The project workspace root is: c:/Users/satya/Documents/antigravity/modest-hypatia
The authoritative user request is in: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md (under header ## 2026-10-05T18:33:23Z).

User Requirements Summary:
Migrate the global store settings (Logos, Domain, SEO, Video links) to the Rust D1 backend so the system is fully compatible with Cloudflare deployment.
CRITICAL CONSTRAINT: Do not alter any existing UI or frontend/admin functionality. You must read and verify the code 4 times before making a single modification.
Integrity mode: benchmark (Absolute strictness on existing code)

R1. Backend D1 Settings Table:
Update backend/schema.sql and backend/src/lib.rs to include a settings table (key-value pair or single JSON row). Implement GET /api/settings and POST /api/settings for the Cloudflare Worker. Ensure CORS is enabled.

R2. Safe Admin Integration:
Update admin/src/app/page.tsx handlePublish to send the payload to the new Rust Worker endpoint (http://localhost:8787/api/settings) instead of the local Next.js /api/store. DO NOT change any UI elements or states.

R3. Dynamic SEO in Frontend:
Update frontend/src/app/layout.tsx to safely fetch the dynamic SEO metadata (Domain, Titles) from the Rust API during generateMetadata. DO NOT break the existing layout or styling.

Acceptance Criteria:
- Read the target file completely 4 times before applying a replace_file_content.
- The Next.js Admin build must still pass.
- The Next.js Frontend build must still pass.
- The Rust backend must compile with cargo check with 0 errors.

Please maintain your BRIEFING.md and progress.md in your working directory (.agents/orchestrator_2). When complete, report your completion and results back to the Sentinel.
