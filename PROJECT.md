# Project: Store Settings D1 Migration

## Architecture
This project migrates global store settings (Logos, Domain, SEO, Video links) from legacy local files to a Cloudflare D1 SQL database backend powered by a Rust Worker (`worker-rs`), with seamless and non-regressive integration across the Next.js Admin dashboard and Next.js Frontend storefront.

```
+-------------------------------------------------------------------------------+
| Next.js Admin (localhost:3001)   |   Next.js Frontend (localhost:3000)       |
| - handlePublish() in page.tsx    |   - generateMetadata() in layout.tsx       |
| - Publishes 13+ settings fields  |   - Fetches SEO/Domain/Logos with fallback |
+----------------------------------+--------------------------------------------+
                 | POST /api/settings              | GET /api/settings
                 v                                 v
+-------------------------------------------------------------------------------+
| Cloudflare Rust Worker (backend/src/lib.rs, localhost:8787)                  |
| - Routes: GET /api/settings, POST /api/settings, OPTIONS /api/*any            |
| - CORS: Access-Control-Allow-Origin: *                                        |
+-------------------------------------------------------------------------------+
                                 | D1 Query
                                 v
+-------------------------------------------------------------------------------+
| Cloudflare D1 Database (`backend/schema.sql`)                                 |
| - Table: settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at)     |
| - Record: key = 'global' contains JSON serialized settings document           |
+-------------------------------------------------------------------------------+
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | D1 Settings Table Schema | Define `settings` table in `backend/schema.sql` (`key`, `value`, `updated_at`) with seed data | M1 | ORIGINAL_REQUEST R1, Survey |
| 2 | Rust GET /api/settings Endpoint | Retrieve settings from D1 where `key = 'global'`, returning JSON (or `{}`) | M1 | ORIGINAL_REQUEST R1, Survey |
| 3 | Rust POST /api/settings Endpoint | Upsert settings payload into D1 table under `key = 'global'` using atomic ON CONFLICT | M1 | ORIGINAL_REQUEST R1, Survey |
| 4 | Rust Worker CORS Headers | Ensure wildcard CORS headers on GET/POST and preflight OPTIONS handling | M1 | ORIGINAL_REQUEST R1, Survey |
| 5 | Rust Backend Build Verification | Ensure `cargo check` passes with 0 errors in `backend/` | M1 | ORIGINAL_REQUEST Acceptance Criteria |
| 6 | Safe Admin handlePublish Integration | Update `handlePublish` in `admin/src/app/page.tsx` to POST payload to `http://localhost:8787/api/settings` | M2 | ORIGINAL_REQUEST R2, Survey |
| 7 | Admin UI Preservation | Zero changes to UI elements, buttons, tabs, styles, or state variables in `admin/` | M2 | ORIGINAL_REQUEST R2 & Critical Constraint |
| 8 | Admin Build Verification | Ensure `npm run build` passes with exit code 0 in `admin/` | M2 | ORIGINAL_REQUEST Acceptance Criteria |
| 9 | Dynamic SEO in Frontend | Implement async `generateMetadata()` in `frontend/src/app/layout.tsx` fetching from `http://localhost:8787/api/settings` | M3 | ORIGINAL_REQUEST R3, Survey |
| 10 | Import Deduplication in Frontend | Fix duplicate `Metadata` import in `frontend/src/app/layout.tsx` (lines 1 & 17) | M3 | Survey Findings |
| 11 | Frontend UI & Layout Preservation | Zero changes to `RootLayout` JSX return, CSS variables, font loaders, or DOM structure | M3 | ORIGINAL_REQUEST R3 & Critical Constraint |
| 12 | Frontend Build Verification | Ensure `npm run build` passes with exit code 0 in `frontend/` | M3 | ORIGINAL_REQUEST Acceptance Criteria |
| 13 | End-to-End System Integration & Gate | Verify all three tiers simultaneously, test coverage, and forensic audit | M4 | ORIGINAL_REQUEST Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Backend D1 Settings Table & Endpoints | `backend/schema.sql`, `backend/src/lib.rs` | none | DONE |
| 2 | M2: Safe Admin Integration | `admin/src/app/page.tsx` | M1 interface defined | IN_PROGRESS |
| 3 | M3: Dynamic SEO in Frontend | `frontend/src/app/layout.tsx` | M1 interface defined | IN_PROGRESS |
| 4 | M4: Final Verification & Forensic Audit Gate | All targets (`cargo check`, admin build, frontend build, challenger & audit verification) | M1, M2, M3 | PLANNED |

## Interface Contracts
### Admin / Frontend ↔ Backend Cloudflare Worker (`http://localhost:8787/api/settings`)
- **GET /api/settings**:
  - Request: No body.
  - Response: HTTP 200 OK, `Content-Type: application/json`.
  - Body: JSON object representing the global settings, e.g.:
    ```json
    {
      "clothingCategories": [...],
      "jewelryCategories": [...],
      "products": [...],
      "clothingCategoryHeading": "...",
      "jewelryCategoryHeading": "...",
      "clientDiariesClothing": [...],
      "clientDiariesJewelry": [...],
      "clothingLogo": "...",
      "jewelryLogo": "...",
      "clothingSubtext": "...",
      "jewelrySubtext": "...",
      "clothingVideo": "...",
      "jewelryVideo": "..."
    }
    ```
    If not yet initialized, returns `{}` or empty object with HTTP 200.
  - Headers:
    - `Access-Control-Allow-Origin: *`
    - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
    - `Access-Control-Allow-Headers: *`

- **POST /api/settings**:
  - Request: `Content-Type: application/json`, JSON payload of settings.
  - Response: HTTP 200 OK.
  - Body: `{"success": true, "message": "Settings saved successfully"}` or the updated settings object.
  - Error: If parsing fails, HTTP 400 with `{"error": "Invalid JSON body"}`.

- **OPTIONS /api/*any**:
  - Response: HTTP 200/204 Empty, with CORS headers.

## Code Layout
- `backend/schema.sql`: D1 SQL table definitions and initial seed data.
- `backend/src/lib.rs`: Rust Cloudflare Worker handlers, router, and D1 database queries.
- `admin/src/app/page.tsx`: Next.js Admin dashboard main page containing `handlePublish`.
- `frontend/src/app/layout.tsx`: Next.js Frontend storefront root layout containing `generateMetadata`.
- `.agents/`: Agent workspaces, state tracking, and review reports.
