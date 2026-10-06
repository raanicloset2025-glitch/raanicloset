# Orchestration Plan: Raani Closet Luxury Admin Panel

## Objective
Coordinate specialists/workers to achieve all requirements (R1 Full Frontend Scan & State Mapping, R2 Comprehensive Admin UI, R3 Storefront Integration) and satisfy all acceptance criteria. Deliver an awe-inspiring, world-class luxury Admin Panel UI and 100% dynamic storefront integration including Product Detail `/product/c1`.

## Target Workspace
`c:\Users\satya\Documents\antigravity\modest-hypatia\admin`

## Plan Phases
1. **Phase 0: Scope Survey (3 Explorers in parallel)**
   - Explorer 1: Map all frontend components, static texts, image URLs, video URLs, categories, products, stories in `src/app/page.tsx`, `src/components/`, `src/app/product/` (especially `/product/c1` detail fields: gallery images, description, tags, care details, story, etc.).
   - Explorer 2: Analyze current `src/store/useAdminStore.ts` and design complete Zustand state structure with persistence, full CRUD operations, and all product fields (title, slug, category, images, description, details/specs, story, tags — ZERO price).
   - Explorer 3: Analyze `src/app/admin/page.tsx` and design a world-class luxury UI (glassmorphism `bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8`, gold `#CBA153` accents, Lucide icons, luxury typography, live preview, smooth animations) across 5 tabs: Dashboard, Storefront Content, Products, Categories, Settings.
   - Merge findings into `PROJECT.md` Feature Inventory & Architecture.

2. **Milestone 1: R1 Full Frontend Scan & State Mapping**
   - Implement comprehensive state store in `src/store/useAdminStore.ts`.
   - Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Auditor -> Gate.

3. **Milestone 2: R2 Comprehensive Admin UI**
   - Implement 5 tabs: Dashboard, Storefront Content, Products, Categories, Settings.
   - World-class luxury aesthetic with modal/inline forms for full product & category editing.
   - Complete product detail field support (images, description, details, story, tags).
   - Strict absence of any price fields.
   - Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Auditor -> Gate.

4. **Milestone 3: R3 Storefront Integration**
   - Wire storefront components (`src/app/page.tsx`, Hero, Categories, SearchOverlay, Product Detail `c1` `/product/[id]`) to read reactively from `useAdminStore`.
   - Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Auditor -> Gate.

5. **Milestone 4: E2E Verification & Audit**
   - Run dev/build verification.
   - Test instant reactivity from Admin modifications to Storefront (`http://localhost:3001/` and `http://localhost:3001/admin`).
   - Validate full CRUD for products and categories.
   - Validate that modifying product details in Admin immediately updates `/product/c1`.
   - Verify no price code exists.
   - Final audit and synthesis.
