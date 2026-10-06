# Project: Raani Atelier Performance & SEO Speed Optimization

## Architecture
- **Framework**: Next.js 16.3.6 (Turbopack, App Router)
- **Frontend Target**: `c:/Users/satya/Documents/antigravity/modest-hypatia/frontend`
- **Core Technologies**: React 19, TypeScript, Tailwind CSS, Framer Motion (v13.4.4), Zustand (v5.0.3), Lenis (v1.3.26)
- **Architecture Flow**:
  1. `frontend/src/app/layout.tsx`: Root Layout (Server Component) self-hosting fonts (`Playfair_Display`, `Montserrat`, `Great_Vibes`, `Cinzel`), injecting dynamic SEO metadata from Rust backend / settings, wrapping children in `SmoothScrolling` (Lenis).
  2. `frontend/src/app/page.tsx`: Home Page (Server Component) rendering above-the-fold critical path (`NavbarWrapper` + `HeroSection`), followed by dynamically loaded below-the-fold sections.
  3. `frontend/src/components/NavbarWrapper.tsx`: Fixed top navbar containing `Navbar` and client `SearchOverlay` (modal).
  4. `frontend/src/components/HeroSection.tsx`: Critical LCP viewport (`h-[calc(100vh-85px)]`), dynamically toggling Clothing (Hero image) vs Jewelry (Hero video).
  5. Below-The-Fold Sections: `CategoryCarousel`, `ProductGrid`, `VideoCarousel`, `BespokeBanner`, `RoyalVitrineReviews`, `ClientDiaries`, `StoryEpilogue`, `LuxuryFooter`.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Fix TypeScript build blocker | Resolve duplicate `Metadata` import in `frontend/src/app/layout.tsx` | M1 | Survey Obs 1 | DONE |
| 2 | Hero LCP Image Optimization | Replace raw `<img>` in `HeroSection.tsx` with Next.js `<Image fill priority sizes="100vw" quality={85} />` | M1 | Survey Obs 2 | DONE |
| 3 | Hero Video Preload & MIME | Optimize Hero `<video>` with `preload="metadata"` and dynamic MIME type | M1 | Survey Obs 2 | DONE |
| 4 | Mobile Navbar Logo Optimization | Replace raw `<img>` in `NavbarWrapper.tsx` with optimized Next.js `<Image width={90} height={28} priority />` | M1 | Survey Obs 3 | DONE |
| 5 | Modern Image Formats & Cache | Add `formats: ['image/avif', 'image/webp']`, `minimumCacheTTL: 31536000`, and `compress: true` in `next.config.ts` | M1 | Survey Obs 5 | DONE |
| 6 | Below-the-fold Fetch Deprioritization | Remove `fetchPriority="high"` on `BespokeBanner.tsx` offscreen image | M1 | Survey Obs 6 | DONE |
| 7 | Clean Unused Import | Remove dead import `MaisonDelivery` in `page.tsx` | M2 | Survey Obs 6 | PENDING |
| 8 | Below-the-fold Dynamic Loading | Convert 8 below-the-fold sections in `page.tsx` to `next/dynamic` with dimension-accurate fallback skeletons | M2 | Survey Obs 1-5 | PENDING |
| 9 | Client Modal Lazy Loading | Convert heavy action modals (`SearchOverlay`, `ClientDiariesGallery`, `WhatsAppCheckoutModal`) to `next/dynamic(..., { ssr: false })` | M2 | Survey Obs 6 | PENDING |
| 10 | Framer Motion Preservation | Verify all 8 files using `framer-motion` keep 100% of motion imports and elements | M3 | Survey Obs 1.1 | PENDING |
| 11 | Hardware Acceleration Audit | Verify animated properties use composite-only GPU properties (`transform`, `opacity`) without layout thrashing | M3 | Survey Obs 1.2 | PENDING |
| 12 | End-to-End Build & Gate Verification | Verify full production build passes (`npm run build`) with zero TypeScript or Turbopack errors | M3 | Acceptance Criteria | PENDING |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | LCP & Above-the-Fold Asset Optimization | `layout.tsx`, `HeroSection.tsx`, `NavbarWrapper.tsx`, `next.config.ts`, `BespokeBanner.tsx` | none | COMPLETED |
| M2 | Heavy Component Lazy Loading | `page.tsx`, `NavbarWrapper.tsx`, `ClientDiaries.tsx`, `ProductCard.tsx` (next/dynamic + skeletons) | M1 | IN-PROGRESS |
| M3 | Animation Preservation & Build Verification | Full frontend motion audit, hardware acceleration verification, production build verification | M1, M2 | PLANNED |

## Interface Contracts
### M1 ↔ M2: Layout & Critical Path Contract
- `HeroSection.tsx` and `NavbarWrapper.tsx` must remain statically imported in `page.tsx` as the above-the-fold critical render tree.
- `useAdminStore` state variables (`clothingHeroBg`, `clothingHeroFallbackImage`, `clothingHeroVideo`, `jewelryHeroVideo`, `jewelryHeroFallbackImage`, `clothingLogoUrl`, `jewelryLogoUrl`) must remain fully reactive.
- `layout.tsx` must export valid `metadata` and `viewport` without type errors.

### M2 ↔ M3: Dynamic Imports & Animation Contract
- `next/dynamic` in `page.tsx` (RSC) must use default `ssr: true` to preserve Google AI SEO pre-rendered HTML while splitting client JS bundles.
- All dynamic components must retain their exact props and Zustand store hooks.
- Skeletons must match the bounding box of target components to maintain CLS = 0.
- All Framer Motion components (`motion.div`, `AnimatePresence`, spring transitions) inside dynamically imported components must remain completely intact.

## Code Layout
- `frontend/src/app/layout.tsx`: Root Layout & Fonts
- `frontend/src/app/page.tsx`: Home Page Composition & Dynamic Imports
- `frontend/src/components/NavbarWrapper.tsx`: Top Navbar & Mobile Logo
- `frontend/src/components/navbar/index.tsx`: Desktop Navbar
- `frontend/src/components/HeroSection.tsx`: LCP Critical Viewport
- `frontend/src/components/BespokeBanner.tsx`: Below-the-fold Banner
- `frontend/src/components/ClientDiaries.tsx`: Parallax Pillars & Gallery trigger
- `frontend/src/components/ClientDiariesGallery.tsx`: Fullscreen Gallery with Lenis
- `frontend/src/components/ProductCard.tsx`: Product item card & checkout modal trigger
- `frontend/src/components/SearchOverlay.tsx`: Search dialog
- `frontend/next.config.ts`: Next.js image optimization and compiler options
