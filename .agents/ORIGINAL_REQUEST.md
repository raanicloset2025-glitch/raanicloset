# Original User Request

## Initial Request — 2026-10-01T11:46:52Z

<USER_REQUEST>
We are building a comprehensive, world-class luxury Admin Panel for "Raani Closet" so the client can update their entire storefront without any code changes. The structural UI and aesthetic must be premium (dark mode, gold accents, glassmorphic cards).

Working directory: c:\Users\satya\Documents\antigravity\modest-hypatia\admin

## Requirements

### R1. Full Frontend Scan & State Mapping
Scan the entire Raani Closet frontend (`src/app/page.tsx`, `src/components/`, `src/app/product/`). Identify every piece of static text, image, and video URL that a client would reasonably want to change (e.g., hero videos, category titles, product lists, story texts). Ensure `src/store/useAdminStore.ts` contains state variables for all of them.

### R2. Comprehensive Admin UI (`src/app/admin/page.tsx`)
Expand the existing Admin Dashboard to include form fields, textareas, and media URL inputs for every single field identified in R1. 
- The UI must remain clean, divided into logical tabs (Dashboard, Storefront Content, Products, Categories, Settings).
- Use premium styling: `bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8`, Lucide icons, and gold (`#CBA153`) accents.
- All "Add Product" or "Edit" buttons in the Products tab must be fully functional (opening a modal or inline form that saves to the Zustand store).
- Do not include any "Price" fields (as this is a display-only portfolio site).

### R3. Storefront Integration
Ensure that all storefront components (Hero, Categories, SearchOverlay, Product Detail `c1` page) are actually reading their data from `useAdminStore` instead of hardcoded strings or arrays. 

## Acceptance Criteria

### Verification
- [ ] Running the frontend and navigating to `http://localhost:3001/admin` shows a fully populated, premium dashboard.
- [ ] Modifying a hero title or category image in the admin panel instantly reflects on the storefront (`http://localhost:3001/`).
- [ ] The Product Catalog in the admin panel is fully functional (Create, Read, Update, Delete) and updates the `/product/[id]` pages.
- [ ] No price code exists in the frontend or admin panel.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-01T17:16:52+05:30.
</ADDITIONAL_METADATA>

## Follow-up — 2026-10-01T11:50:32Z

Make absolutely sure that the Product Detail page (`http://localhost:3001/product/c1` or similar) is fully editable and updatable from the Admin Panel. Furthermore, they emphasized that the Admin Panel UI MUST be absolutely stunning and premium—the client should be blown away and think "wow, what an amazing admin panel". Please ensure your UI implementation strictly follows the premium design specs outlined in the prompt (glassmorphism, luxury fonts, dark mode).

## Follow-up — 2026-10-01T11:56:54Z

The user has added another instruction: "achha se bolna story achha se porper tarika se". This means: "Make sure the 'Story/Legacy' copy is written beautifully and in a highly professional, premium tone." Please ensure the default text you populate into the Zustand store for the Story/Bespoke sections reads like a world-class luxury boutique's heritage.

## Follow-up — 2026-10-01T11:58:23Z

CRITICAL: The user explicitly wants to ensure you are scanning and updating the ENTIRE frontend to be editable, NOT just the C1 product page. Ensure every single page, hero, and component on the frontend is integrated with the Admin panel.

## Follow-up — 2026-10-01T12:00:46Z

User instruction regarding the copy/content flow: "Write the story so that there is continuity from one section to the next, just like scenes in a movie. One scene transitions smoothly into the next." Please ensure the default text you provide for the storefront's Story/Legacy/Bespoke sections flows sequentially and narratively like a high-end cinematic experience.

## Follow-up — 2026-10-01T12:25:47Z

CRITICAL USER REQUIREMENT: The user wants to confirm that BOTH Products AND Categories are fully customizable from the Admin Panel. This means:
1. Admin can ADD new products, EDIT existing ones, DELETE them
2. Admin can ADD new categories, EDIT category names and images, DELETE them
3. Everything must save to Zustand store and instantly reflect on the storefront
4. The Add/Edit modals must be fully functional with proper form fields (title, description, image URL, type clothing/jewelry, category)

Please confirm this is part of your Milestone 2 scope and ensure full CRUD for both Products AND Categories is implemented.

## 2026-10-05T18:33:23Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Requested team: Full Team (with strict 4x code review and validation)

Migrate the global store settings (Logos, Domain, SEO, Video links) to the Rust D1 backend so the system is fully compatible with Cloudflare deployment. **CRITICAL CONSTRAINT: Do not alter any existing UI or frontend/admin functionality. You must read and verify the code 4 times before making a single modification.**

Working directory: `c:/Users/satya/Documents/antigravity/modest-hypatia`
Integrity mode: benchmark (Absolute strictness on existing code)

## Requirements

### R1. Backend D1 Settings Table
Update `backend/schema.sql` and `backend/src/lib.rs` to include a `settings` table (key-value pair or single JSON row). Implement `GET /api/settings` and `POST /api/settings` for the Cloudflare Worker. Ensure CORS is enabled.

### R2. Safe Admin Integration
Update `admin/src/app/page.tsx` `handlePublish` to send the payload to the new Rust Worker endpoint (`http://localhost:8787/api/settings`) instead of the local Next.js `/api/store`. **DO NOT change any UI elements or states.**

### R3. Dynamic SEO in Frontend
Update `frontend/src/app/layout.tsx` to safely fetch the dynamic SEO metadata (Domain, Titles) from the Rust API during `generateMetadata`. **DO NOT break the existing layout or styling.**

## Acceptance Criteria

### Strict Code Verification
- [ ] Read the target file completely 4 times before applying a `replace_file_content`.
- [ ] The Next.js Admin build must still pass.
- [ ] The Next.js Frontend build must still pass.
- [ ] The Rust backend must compile with `cargo check` with 0 errors.

## 2026-10-05T18:40:43Z

# Teamwork Project Prompt — Performance & SEO Speed Optimization

> Status: Launched
> Requested team: Full Team (Performance & SEO Specialists)

Optimize the Next.js frontend of the Raani Atelier luxury e-commerce project for Google Core Web Vitals (LCP, CLS, FID) and Google AI SEO speed. 

**CRITICAL CONSTRAINT: You must achieve perfect speed scores WITHOUT removing, disabling, or degrading any UI elements, Framer Motion animations, or the Admin panel's functionality. The luxury feel must remain 100% intact.**

Working directory: `c:/Users/satya/Documents/antigravity/modest-hypatia`
Integrity mode: benchmark (Absolute strictness on existing UI code)

## Requirements

### R1. LCP & Asset Optimization
Analyze the `frontend/src/app/page.tsx`, `frontend/src/components/navbar/index.tsx`, and Hero components. Ensure all above-the-fold images and videos use optimal loading strategies (e.g., `priority` on Next.js `<Image>`, proper `preload` attributes on `<video>`).

### R2. Heavy Component Lazy Loading
Identify heavy components that are below the fold (e.g., Patron Reviews, Client Diaries, Footer) and implement `next/dynamic` to lazy-load them, freeing up the main thread for initial render and animations.

### R3. Animation Preservation
Verify that Framer Motion or CSS animations are using hardware-accelerated properties (`transform`, `opacity`) and not causing layout thrashing. **Do not remove any animations.**

## Acceptance Criteria

### Strict Code Verification
- [ ] No UI files lose their Framer Motion imports or animation tags.
- [ ] The Next.js Frontend build (`npm run build`) must pass successfully.
- [ ] Above-the-fold assets must load instantly to satisfy Google's LCP metrics.
- [ ] Existing functionality remains identical to the user.


