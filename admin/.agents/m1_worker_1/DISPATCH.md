# DISPATCH: Milestone 1 Worker 1

## Objective
Implement Milestone 1: R1 State Store Engine & Zero-Price Sanity.
Implement the unified `src/store/useAdminStore.ts` and sanitize price types.

## Exclusive Write Ownership
- `src/store/useAdminStore.ts`
- `src/store/useStore.ts` (sanitize CartItem price if needed)

## Inputs to Study
- `c:\Users\satya\Documents\antigravity\modest-hypatia\admin\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\satya\Documents\antigravity\modest-hypatia\admin\PROJECT.md`
- `c:\Users\satya\Documents\antigravity\modest-hypatia\admin\.agents\survey_explorer_2\handoff.md` (Contains complete TypeScript implementation and 7-scene narrative copy for `useAdminStore.ts`)
- `c:\Users\satya\Documents\antigravity\modest-hypatia\admin\.agents\survey_explorer_1\handoff.md` (Contains field inventory and price audit findings)

## Requirements
1. Implement the complete `useAdminStore.ts` as specified in `survey_explorer_2/handoff.md`:
   - All 7 scenes (Hero, Category Carousel, Products, Bespoke Atelier, Video Carousel, Story/Legacy, Imperial Concierge/Footer).
   - Variables required by components: `isEditMode`, `setEditMode`, `clothingHeroLine1`, `clothingHeroCursive`, `clothingHeroLine3`, `clothingHeroButtonText`, `jewelryHeroLine1`, `jewelryHeroCursive`, `jewelryHeroLine3`, `jewelryHeroButtonText`, `clothingCollectionTitle`, `jewelryCollectionTitle`, etc.
   - Comprehensive `Product` interface: `id`, `title`, `category`, `type`, `imageSrc`, `images: string[]` (for FloatingImageGallery), `description`, `story`, `craftTitle`, `craftText`, `craftSpecs: ProductCraftSpec[]`, `tags`, `isFeatured`.
   - Full CRUD actions for Products: `addProduct`, `updateProduct`, `deleteProduct`, `getProductById`.
   - Full CRUD actions for Categories: `addCategory`, `updateCategory`, `deleteCategory`.
   - Full CRUD actions for VideoCards: `updateVideoCard`.
   - Full persistence using Zustand `persist` with `createJSONStorage(() => localStorage)`.
   - SSR hydration helper `hasHydrated` and `setHasHydrated`.
   - Admin config export/import (`exportConfig`, `importConfig`) and `resetToDefaults()`.
   - Default products populated with 14 products (8 clothing, 6 jewelry) matching PDP requirements with deep craft specs.
   - Default heritage narrative copy matching user instructions ("achha se bolna story achha se porper tarika se", cinematic continuous flow).
   - STRICTLY ZERO price fields in `useAdminStore.ts`.
2. In `src/store/useStore.ts`, sanitize `CartItem` to remove `price: number` or make it optional so no price is required.
3. Run `npm run build` or Next.js typecheck to verify there are no compilation errors in the store.
4. Write your detailed handoff report to `c:\Users\satya\Documents\antigravity\modest-hypatia\admin\.agents\m1_worker_1\handoff.md`.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
