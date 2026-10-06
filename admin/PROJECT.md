# Project: Raani Closet Luxury Admin Panel & Storefront Integration

## Architecture
- **State Layer**: Zustand store with persistence in `src/store/useAdminStore.ts`. Exposes complete configuration across 7 narrative scenes, full CRUD for products and categories, luxury brand settings, and zero price fields.
- **Admin UI Layer**: Premium glassmorphic interface in `src/app/admin/page.tsx` (`bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8`, `#CBA153` gold accents). Divided into 5 logical tabs: Dashboard, Storefront Content, Products (with full PDP edit modal), Categories, and Settings.
- **Storefront Consumer Layer**: All public pages and components (`src/app/page.tsx`, `HeroSection`, `CategoryCarousel`, `ProductGrid`, `BespokeBanner`, `VideoCarousel`, `StoryEpilogue`, `LuxuryFooter`, `SearchOverlay`, `src/app/product/[id]/page.tsx`) reactively consume `useAdminStore`.
- **Zero Price Enforcement**: Complete excision of price displays, currency formatting, and numeric price variables across all storefront components and admin panel.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Unified Zustand Store | Complete schema with all scene variables, `isEditMode`, CRUD actions, and persistence in `useAdminStore.ts` | M1 | Survey (E1, E2) |
| F2 | Zero-Price Sanity | Excision of price labels, `₹` formatting, and price data from `SearchOverlay`, `ProductGrid`, `useStore`, and PDP | M1 | Survey (E1, E2) |
| F3 | Cinematic 7-Scene Copy | Beautiful heritage narrative copy with cinematic continuity across all sections | M1 | User Request & E2 |
| F4 | Admin Dashboard Tab | Metric vitrines (product count, categories), quick actions, live store status | M2 | Survey (E3) |
| F5 | Admin Storefront Content Tab | Editors for Hero, Story/Legacy, Bespoke Atelier, Video Carousel, and Announcements | M2 | Survey (E3) |
| F6 | Admin Products Tab & PDP Modal | Full catalog table and ProductModal editing title, type, category, images, craft specs, tags (NO price) | M2 | User Request & E3 |
| F7 | Admin Categories Tab | Category CRUD with title, circular image preview, slug, and delete safeguards | M2 | Survey (E3) |
| F8 | Admin Settings Tab | Brand identity, WhatsApp concierge, email, addresses, config JSON backup/restore | M2 | Survey (E3) |
| F9 | Storefront Hero & Header Wiring | Connect `HeroSection` and `CollectionHeader` to `useAdminStore` variables | M3 | Survey (E1, E2) |
| F10 | Storefront Categories & Products | Connect `CategoryCarousel`, `ProductGrid`, and `SearchOverlay` to `useAdminStore` | M3 | Survey (E1, E2) |
| F11 | Storefront PDP `/product/[id]` Wiring | Connect `/product/[id]` (including `/product/c1`) to `useAdminStore` products & craft specs | M3 | User Request & E1 |
| F12 | Storefront Bespoke, Video & Footer | Connect `BespokeBanner`, `VideoCarousel`, `StoryEpilogue`, `LuxuryFooter` to store | M3 | Survey (E1, E2) |
| F13 | E2E Verification & Audit | Dev build test, live reactivity test between admin and storefront, zero-price verification | M4 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | R1 State Store Engine & Zero-Price Sanity | Implement comprehensive `useAdminStore.ts`, sanitize price types | none | READY |
| 2 | R2 Comprehensive Luxury Admin UI | Build 5-tab glassmorphic Admin Panel with full Product & Category CRUD | M1 | PLANNED |
| 3 | R3 Storefront Integration & PDP Wiring | Wire all storefront components and `/product/[id]` to `useAdminStore` | M1, M2 | PLANNED |
| 4 | Verification & Acceptance Testing | Dev build, verify live updates, confirm zero prices, test `/product/c1` | M1, M2, M3 | PLANNED |

## Interface Contracts
### `useAdminStore.ts` ↔ Admin UI & Storefront Components
```typescript
export interface ProductCraftSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  type: 'clothing' | 'jewelry';
  imageSrc: string;
  images: string[];
  description: string;
  story?: string;
  craftTitle?: string;
  craftText?: string;
  craftSpecs?: ProductCraftSpec[];
  tags?: string[];
  isFeatured?: boolean;
}

export interface CategoryItem {
  id: string;
  title: string;
  image: string;
  tagline?: string;
}

export interface VideoCard {
  id: string | number;
  video: string;
  poster: string;
  title: string;
  no: string;
}
```

## Code Layout
- `src/store/useAdminStore.ts`: Single source of truth for all editable content and catalog.
- `src/app/admin/page.tsx`: Main Admin page with tabs and ProductModal.
- `src/components/admin/`: Admin UI components (`AdminBar`, `EditableText`, `EditableImage`, `EditableVideo`).
- `src/components/`: Storefront components (`HeroSection`, `CategoryCarousel`, `ProductGrid`, `BespokeBanner`, `VideoCarousel`, `StoryEpilogue`, `LuxuryFooter`, `SearchOverlay`).
- `src/app/product/[id]/page.tsx`: Dynamic Product Detail Page (`c1`, `j1`, etc.).
- `src/app/page.tsx`: Storefront home page.
