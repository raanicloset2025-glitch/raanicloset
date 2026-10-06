# Phase 0 Survey Report: State Architecture & Store Analysis
**Agent**: Survey Explorer 2  
**Target File**: `src/store/useAdminStore.ts`  
**Working Directory**: `c:\Users\satya\Documents\antigravity\modest-hypatia\admin\.agents\survey_explorer_2`  
**Timestamp**: 2026-10-01T12:05:00Z  

---

## 1. Observation

Direct code observations from inspecting the codebase across `src/store/`, `src/app/`, and `src/components/`:

### A. Current State in `src/store/useAdminStore.ts`
`useAdminStore.ts` (144 lines total) models a partial set of configuration variables:
1. **Global/Settings**: `brandName` (line 15), `whatsappNumber` (line 17), `supportEmail` (line 19), `instagramUrl` (line 21).
2. **Hero Clothing**: `clothingHeroBg` (line 25), `clothingHeroTitle` (line 27), `clothingHeroSubtitle` (line 29).
3. **Hero Jewelry**: `jewelryHeroBg` (line 33), `jewelryHeroTitle` (line 35), `jewelryHeroSubtitle` (line 37).
4. **Categories**: `clothingCategories: {id:string, title:string, image:string}[]` (line 41), `jewelryCategories: {id:string, title:string, image:string}[]` (line 43).
5. **Story / Bespoke**: `storyHeading` (line 47), `storyText` (line 49), `bespokeHeading` (line 51), `bespokeText` (line 53).
6. **Products**: `products: Product[]` (line 57), where `Product` is:
   ```ts
   // src/store/useAdminStore.ts:4-11
   export interface Product {
     id: string;
     title: string;
     category: string;
     imageSrc: string;
     description: string;
     type: 'clothing' | 'jewelry';
   }
   ```
   Contains only 6 default products (`c1`, `c2`, `c3`, `j1`, `j2`, `j3`) in `defaultProducts` (lines 70-77).
7. **Craft Details**: `clothingCraftText` (line 61), `jewelryCraftText` (line 63).
8. **UI Flag**: `hasUnsavedChanges: boolean` (line 66).
9. **Persistence**: Configured via `persist` middleware with key `'raani-admin-store-v3'` (line 141).

### B. Broken/Missing Bindings in Front-End Components
1. **Missing `isEditMode` & `setEditMode`**:
   - `src/components/admin/AdminBar.tsx:16`: `const { isEditMode, setEditMode, hasUnsavedChanges, setHasUnsavedChanges } = useAdminStore();`
   - `src/components/admin/EditableText.tsx:20`: `const isEditMode = useAdminStore((s) => s.isEditMode);`
   - `src/components/admin/EditableImage.tsx:19`: `const isEditMode = useAdminStore((s) => s.isEditMode);`
   - `src/components/admin/EditableVideo.tsx:13`: `const isEditMode = useAdminStore((s) => s.isEditMode);`
   - `src/components/ProductGrid.tsx:29`: `const isEditMode = useAdminStore((s) => s.isEditMode);`
   - `src/app/product/[id]/page.tsx:42`: `const isEditMode = useAdminStore((s) => s.isEditMode);`
   - **Verbatim Error / Bug**: `isEditMode` is undefined on `useAdminStore`, breaking edit controls and causing hydration issues.

2. **Hero Section Property Mismatch**:
   - `src/components/HeroSection.tsx:11-22`:
     ```tsx
     const {
       clothingHeroLine1, setClothingHeroLine1,
       clothingHeroCursive, setClothingHeroCursive,
       clothingHeroLine3, setClothingHeroLine3,
       clothingHeroButtonText, setClothingHeroButtonText,
       clothingHeroBg, setClothingHeroBg,
       jewelryHeroLine1, setJewelryHeroLine1,
       jewelryHeroCursive, setJewelryHeroCursive,
       jewelryHeroLine3, setJewelryHeroLine3,
       jewelryHeroButtonText, setJewelryHeroButtonText,
       jewelryHeroBg, setJewelryHeroBg,
     } = useAdminStore();
     ```
   - None of `clothingHeroLine1`, `clothingHeroCursive`, `clothingHeroLine3`, `clothingHeroButtonText`, `jewelryHeroLine1`, `jewelryHeroCursive`, `jewelryHeroLine3`, or `jewelryHeroButtonText` exist in `useAdminStore.ts`. In `useAdminStore.ts`, they are named `clothingHeroTitle` and `clothingHeroSubtitle`.

3. **Collection Header Property Mismatch**:
   - `src/components/CollectionHeader.tsx:24-27`:
     ```tsx
     const {
       clothingCollectionTitle, setClothingCollectionTitle,
       jewelryCollectionTitle, setJewelryCollectionTitle,
     } = useAdminStore();
     ```
   - Neither property exists in `useAdminStore.ts`.
   - Categories are hardcoded in `CollectionHeader.tsx:8-18` instead of consuming `clothingCategories` and `jewelryCategories`.

4. **Product Detail Page (`src/app/product/[id]/page.tsx`) Is Completely Disconnected**:
   - Line 17-34: Product data is read from a hardcoded `ALL_PRODUCTS` array of 14 items.
   - Lines 50-54: Form state is initialized with local React `useState` and never persists to `useAdminStore`.
   - `FloatingImageGallery.tsx:8-10` expects `product.images: string[]` (multi-image gallery), which `Product` interface in `useAdminStore.ts` does not have.
   - Product craft specs (Material, Origin, Care) are hardcoded in lines 140-149.

5. **Video Carousel (`src/components/VideoCarousel.tsx`) Is Completely Hardcoded**:
   - Lines 7-19: `CLOTHING_CARDS` (4 items) and `JEWELRY_CARDS` (4 items) are hardcoded constants with `video`, `poster`, `title`, and `no`.
   - No store state or actions exist for videos.

6. **Story Epilogue (`src/components/StoryEpilogue.tsx`) Is Completely Hardcoded**:
   - Lines 51-54: Quote `"Preserving the royal threads of Rajasthan, one bespoke silhouette at a time."`
   - Lines 60-70: `"The Master Artisans"`
   - Line 75: `"Raani Closet Atelier"`
   - None of these are wired to `useAdminStore`.

7. **Bespoke Banner (`src/components/BespokeBanner.tsx`) Is Completely Hardcoded**:
   - Lines 10-18: Background image, title, subtitle, and button are hardcoded, bypassing `useAdminStore`.

8. **Luxury Footer (`src/components/LuxuryFooter.tsx`)**:
   - Only reads `whatsappNumber` (line 19).
   - Phone `+91 141 256 7890` (line 143), email `concierge@raanicloset.com` (line 151), Jaipur address (line 129), Delhi address (line 136), and social links are hardcoded.

9. **Search Overlay (`src/components/SearchOverlay.tsx`)**:
   - Lines 12-13: `DEFAULT_CLOTH_TRENDS` and `DEFAULT_JEWEL_TRENDS` are hardcoded.
   - Lines 43-60: Product catalogue is a duplicated hardcoded list with price tags.

10. **Admin Dashboard (`src/app/admin/page.tsx`) Lacks Real CRUD**:
    - Lines 390-394: Renders a static hardcoded array of 3 products with prices.
    - Line 374: `+ Add Product` button has no `onClick` handler.
    - Line 404: `Edit` button has no `onClick` handler.
    - No delete product handler exists.
    - No category add/delete handlers exist.

### C. Price Audit Findings (CRITICAL)
Direct grep search across all TypeScript files for `price`:
1. `src/store/useAdminStore.ts`: **CLEAN**. There are NO price fields in `useAdminStore.ts` (`Product` interface or `AdminState`).
2. `src/store/useStore.ts:6`: `CartItem` contains `price: number;`.
3. `src/app/admin/page.tsx:391-393`: Hardcoded array contains `price: 4499`, `price: 12499`, `price: 34500`.
4. `src/app/product/[id]/page.tsx:19-33`: Hardcoded `ALL_PRODUCTS` contains `price: 4499` ... `price: 120000`.
5. `src/components/ProductCard.tsx:12-13`: `SizeOption` interface has `price: number; originalPrice?: number;`. Lines 80, 151, 196, 201 pass `price: defaultSize?.price || 0`.
6. `src/components/ProductGrid.tsx:10-24`: Hardcoded products have `price: 4499` ... `price: 120000`.
7. `src/components/CuratedSlider.tsx:11`: `ProductItem` interface has `price: number;`.
8. `src/components/SearchOverlay.tsx:45-59`: Hardcoded items have `price: 4499` ... `price: 120000`.
9. `src/components/PDPWhatsAppButton.tsx:13`: Passes `price: product.price`.
10. `src/components/WhatsAppCheckoutModal.tsx:13`: Has `total: number` in props (though not displayed in UI).

---

## 2. Logic Chain

1. **Premise 1 (Authoritative Requirement)**:
   The client must be able to update their entire storefront without code changes. The site is a display-only luxury portfolio and atelier with WhatsApp concierge booking. Zero price fields or price types must be present in the store or client presentation.
2. **Premise 2 (Current Disconnection)**:
   Observations A and B demonstrate that the current `useAdminStore.ts` only exposes 18 basic fields, while storefront components either destructure non-existent variables (`isEditMode`, `clothingHeroLine1`, `clothingCollectionTitle`) or bypass the store entirely by relying on hardcoded arrays (`ALL_PRODUCTS`, `CLOTHING_CARDS`, `CLOTHING_CATEGORIES`, footer info, search trends).
3. **Premise 3 (Product Detail Page Deep Requirement)**:
   Parent dispatch updates #1 and #3 explicitly mandate that `/product/[id]` (including `/product/c1`) must be 100% updatable from the Admin Panel, including gallery images (`images: string[]`), editorial description, craft narrative, structured craft specs (Material, Origin, Care), and individual product CRUD operations (`addProduct`, `updateProduct`, `deleteProduct`).
4. **Premise 4 (Cinematic Narrative Flow Requirement)**:
   Parent dispatch updates #2 and #4 mandate that default copy must not be generic placeholders, but world-class luxury boutique heritage copy arranged in a sequential 7-scene narrative film flow:
   - Scene 1: Hero (The Awakening / Where Elegance Meets Tradition)
   - Scene 2: Category Carousel (The Curated Wardrobe / Silhouettes of Rajputana)
   - Scene 3: Signature Collection (The Masterpieces / Living Artifacts)
   - Scene 4: Bespoke Atelier (The Private Commission / Crafting Your Personal Myth)
   - Scene 5: Cinematic Archives (The Living Atelier / Motion, Silk, and Gold)
   - Scene 6: Story Epilogue (The Legacy / Sacred Threads and Royal Vows)
   - Scene 7: Imperial Concierge (The Digital Sanctuary / Beyond Time and Borders)
5. **Premise 5 (Persistence & State Hydration)**:
   To ensure client modifications persist between browser reloads without server dependencies, `zustand/middleware`'s `persist` must be configured with `createJSONStorage(() => localStorage)`. To prevent SSR hydration flickers in Next.js 16 / React 19, the store must include a hydration status indicator (`hasHydrated`), export/import JSON capability, and a full `resetToDefaults()` action for administrative recovery.
6. **Inference & Conclusion**:
   `useAdminStore.ts` must be expanded from its current rudimentary 144 lines into a comprehensive, modular, fully typed state management engine supporting full CRUD for products, categories, video archives, and complete narrative content, with zero price types.

---

## 3. Caveats

1. **Read-Only Scope**: In compliance with the Teamwork Explorer archetype and dispatch instructions, no project source code has been modified in `src/`. All proposals and code structures are documented here for the implementer agent.
2. **`useStore.ts` Separation**: `src/store/useStore.ts` manages client-side transient UI states (theme toggle `isJewelry`, active category filter, auth modal, wishlist, cart drawer). While `useStore.ts` currently contains `price: number` in `CartItem`, that file is distinct from `useAdminStore.ts`. In the implementation phase, `CartItem` should have `price` removed or made optional, or replaced with bespoke consultation notes.
3. **Client-side Image Uploads**: `EditableImage.tsx` uses `URL.createObjectURL(file)` which produces blob URLs that expire on browser restart. For persistent storage in `localStorage`, media URLs should be stored as HTTPS URLs, absolute public paths (e.g. `/categories/kurti.jpg`), or Base64 data URLs for user-uploaded custom files.

---

## 4. Conclusion & Proposed Architecture

### A. Complete TypeScript Interface Proposal for `useAdminStore.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// -- 1. Supporting Domain Models --------------------------------------

export interface ProductCraftSpec {
  label: string; // e.g. "Material", "Origin", "Care", "Craftsmanship", "Timeline"
  value: string; // e.g. "Pure Hand-Loomed Chanderi Silk", "Jaipur Atelier", "Dry Clean Only"
}

export interface Product {
  id: string; // e.g. "c1", "j1"
  title: string;
  category: string;
  type: 'clothing' | 'jewelry';
  imageSrc: string; // Primary vitrine image
  images: string[]; // Multi-angle gallery for FloatingImageGallery (minimum 3 images)
  description: string; // Editorial description on PDP
  story?: string; // Deep heritage narrative behind this piece
  craftTitle?: string; // PDP Craft section heading (default: "The Craft")
  craftText?: string; // PDP Craft section description
  craftSpecs?: ProductCraftSpec[]; // Key-value artisan specifications
  tags?: string[]; // e.g. ["Bridal", "Zari", "Handloom", "Heirloom"]
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

// -- 2. Full Admin Store Interface -----------------------------------

export interface AdminState {
  // --- A. System & Admin UI ---
  isEditMode: boolean;
  setEditMode: (v: boolean) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (v: boolean) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // --- B. Brand & Global Identity ---
  brandName: string;
  setBrandName: (v: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (v: string) => void;
  supportEmail: string;
  setSupportEmail: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  instagramUrl: string;
  setInstagramUrl: (v: string) => void;
  facebookUrl: string;
  setFacebookUrl: (v: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (v: string) => void;

  // --- C. Scene 1: Hero Section ---
  clothingHeroBg: string;
  setClothingHeroBg: (v: string) => void;
  clothingHeroLine1: string;
  setClothingHeroLine1: (v: string) => void;
  clothingHeroCursive: string;
  setClothingHeroCursive: (v: string) => void;
  clothingHeroLine3: string;
  setClothingHeroLine3: (v: string) => void;
  clothingHeroSubtext: string;
  setClothingHeroSubtext: (v: string) => void;
  clothingHeroButtonText: string;
  setClothingHeroButtonText: (v: string) => void;
  
  jewelryHeroBg: string;
  setJewelryHeroBg: (v: string) => void;
  jewelryHeroLine1: string;
  setJewelryHeroLine1: (v: string) => void;
  jewelryHeroCursive: string;
  setJewelryHeroCursive: (v: string) => void;
  jewelryHeroLine3: string;
  setJewelryHeroLine3: (v: string) => void;
  jewelryHeroSubtext: string;
  setJewelryHeroSubtext: (v: string) => void;
  jewelryHeroButtonText: string;
  setJewelryHeroButtonText: (v: string) => void;

  // --- D. Scene 2: Category Carousel & Collection Header ---
  clothingCategoryHeading: string;
  setClothingCategoryHeading: (v: string) => void;
  jewelryCategoryHeading: string;
  setJewelryCategoryHeading: (v: string) => void;
  clothingCollectionTitle: string;
  setClothingCollectionTitle: (v: string) => void;
  jewelryCollectionTitle: string;
  setJewelryCollectionTitle: (v: string) => void;
  clothingCategories: CategoryItem[];
  setClothingCategories: (v: CategoryItem[]) => void;
  jewelryCategories: CategoryItem[];
  setJewelryCategories: (v: CategoryItem[]) => void;
  addCategory: (item: Omit<CategoryItem, 'id'> & { id?: string }, type: 'clothing' | 'jewelry') => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>, type: 'clothing' | 'jewelry') => void;
  deleteCategory: (id: string, type: 'clothing' | 'jewelry') => void;

  // --- E. Scene 3: Products Catalog & PDP Detail Manager ---
  products: Product[];
  setProducts: (v: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;

  // --- F. Scene 4: Bespoke Atelier ---
  bespokeEyebrow: string;
  setBespokeEyebrow: (v: string) => void;
  clothingBespokeTitle: string;
  setClothingBespokeTitle: (v: string) => void;
  jewelryBespokeTitle: string;
  setJewelryBespokeTitle: (v: string) => void;
  clothingBespokeSubtitle: string;
  setClothingBespokeSubtitle: (v: string) => void;
  jewelryBespokeSubtitle: string;
  setJewelryBespokeSubtitle: (v: string) => void;
  clothingBespokeBg: string;
  setClothingBespokeBg: (v: string) => void;
  jewelryBespokeBg: string;
  setJewelryBespokeBg: (v: string) => void;
  bespokeButtonText: string;
  setBespokeButtonText: (v: string) => void;
  bespokeHeroTitle: string;
  setBespokeHeroTitle: (v: string) => void;
  bespokeHeroSubtitle: string;
  setBespokeHeroSubtitle: (v: string) => void;
  bespokeHeroBg: string;
  setBespokeHeroBg: (v: string) => void;

  // --- G. Scene 5: Video Carousel / Cinematic Archives ---
  videoCarouselEyebrow: string;
  setVideoCarouselEyebrow: (v: string) => void;
  clothingVideoHeading: string;
  setClothingVideoHeading: (v: string) => void;
  jewelryVideoHeading: string;
  setJewelryVideoHeading: (v: string) => void;
  clothingVideos: VideoCard[];
  setClothingVideos: (v: VideoCard[]) => void;
  jewelryVideos: VideoCard[];
  setJewelryVideos: (v: VideoCard[]) => void;
  updateVideoCard: (id: string | number, updates: Partial<VideoCard>, type: 'clothing' | 'jewelry') => void;

  // --- H. Scene 6: Story, Craft & Epilogue ---
  storyHeading: string;
  setStoryHeading: (v: string) => void;
  storyText: string;
  setStoryText: (v: string) => void;
  clothingCraftText: string;
  setClothingCraftText: (v: string) => void;
  jewelryCraftText: string;
  setJewelryCraftText: (v: string) => void;
  storyEpilogueQuote: string;
  setStoryEpilogueQuote: (v: string) => void;
  storyEpilogueSignature: string;
  setStoryEpilogueSignature: (v: string) => void;
  storyEpilogueSubtext: string;
  setStoryEpilogueSubtext: (v: string) => void;

  // --- I. Scene 7: Imperial Concierge & Footer ---
  footerConciergeEyebrow: string;
  setFooterConciergeEyebrow: (v: string) => void;
  footerConciergeTitle: string;
  setFooterConciergeTitle: (v: string) => void;
  footerConciergeText: string;
  setFooterConciergeText: (v: string) => void;
  addressJaipur: string;
  setAddressJaipur: (v: string) => void;
  addressDelhi: string;
  setAddressDelhi: (v: string) => void;
  copyrightText: string;
  setCopyrightText: (v: string) => void;

  // --- J. Search Trending Tags ---
  clothingTrendingTerms: string[];
  setClothingTrendingTerms: (v: string[]) => void;
  jewelryTrendingTerms: string[];
  setJewelryTrendingTerms: (v: string[]) => void;

  // --- K. Admin Reset & Factory Defaults ---
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (json: string) => boolean;
}
```

### B. Cinematic 7-Scene Narrative Flow Copy (Per User Updates #2 & #4)

Each section flows into the next like acts in a cinematic period drama:

| Scene | Component | Luxury Narrative Copy |
|---|---|---|
| **Scene 1: The Awakening** | `HeroSection.tsx` | **Clothing**: *"Where Elegance"* • **Cursive**: *"Meets Tradition"* • **Line 3**: *"Royal Heritage Collection"* • **Subtext**: *"Building Communities. Not Just Clients."*<br>**Jewelry**: *"High Jewels"* • **Cursive**: *"The Art of Adornment"* • **Line 3**: *"Imperial Vault Edition"* • **Subtext**: *"Heirlooms Crafted for Eternity."* |
| **Scene 2: The Curated Wardrobe** | `CategoryCarousel.tsx` & `CollectionHeader.tsx` | **Heading**: *"Suit"* (Clothing) / *"Jewels"* (Jewelry)<br>**Collection Title**: *"Curated Silhouettes"*<br>Categories: *Simple Suits, Party Wear Suits, Kurtis, Polki Sets, Diamond Chokers, Temple Jewelry*. Transitioning from the grand entrance into curated forms. |
| **Scene 3: The Living Artifacts** | `ProductGrid.tsx` & `/product/[id]` | **Title**: *"Signature Collection"*<br>Individual pieces with deep stories: `c1` (*Ivory Chanderi Kurta*: Spun from pure hand-loomed Chanderi silk with quiet gold thread along the neckline); `j1` (*Kundan Choker Set*: An opulent kundan choker with uncut diamonds placed by master craftsmen in Jaipur). Each product has rich craft specs (Material, Origin, Care) and multi-image galleries. |
| **Scene 4: The Private Commission** | `BespokeBanner.tsx` & `BespokeForm.tsx` | **Eyebrow**: *"The Haute Couture Salon"*<br>**Heading**: *"Bespoke Tailoring"* / *"Bespoke Jewelry"*<br>**Subtitle**: *"Commission Your Personal Silhouette & Heritage Heirloom"*<br>**Narrative**: Where client dreams meet 400 years of artisan lineage through private one-on-one appointments. |
| **Scene 5: The Living Atelier** | `VideoCarousel.tsx` | **Eyebrow**: *"Cinematic Archives"*<br>**Heading**: *"The Living Atelier"* (Clothing) / *"The High Jewels"* (Jewelry)<br>**Cards**: *Nº 01 The Royal Drape, Nº 02 Mastercraft Zardozi, Nº 03 Heirloom Trousseau, Nº 04 The Loom Heritage*. Capturing raw movement, looms in motion, and gold foil tapping. |
| **Scene 6: The Sacred Vow** | `StoryEpilogue.tsx` | **Philosophy Quote**: *"Preserving the royal threads of Rajasthan, one bespoke silhouette at a time."*<br>**Signature**: *"The Master Artisans"*<br>**Subtext**: *"Raani Closet Atelier • Jaipur & New Delhi"*. The philosophical crescendo of the experience. |
| **Scene 7: The Digital Sanctuary** | `LuxuryFooter.tsx` | **Eyebrow**: *"The Digital Sanctuary"*<br>**Heading**: *"Imperial Concierge"*<br>**Text**: *"An exclusive enclave dedicated to the preservation of Indian royal heritage. From bespoke zardozi bridal trousseaus to archival polki jewelry, Raani Closet offers private commissions and digital styling engagements for the modern aristocrat."* Direct contacts to flagships in Jaipur (Narain Niwas Palace) and New Delhi (The Crescent at Qutab). |

### C. Proposed Complete Implementation for `src/store/useAdminStore.ts`

The complete drop-in replacement file will be:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

const defaultProducts: Product[] = [
  {
    id: "c1",
    title: "Ivory Chanderi Kurta",
    category: "Simple Suits",
    type: "clothing",
    imageSrc: "/categories/simple_suit.jpg",
    images: ["/categories/simple_suit.jpg", "/categories/simple_suit.jpg", "/categories/simple_suit.jpg"],
    description: "Spun from pure hand-loomed Chanderi silk. Quiet gold thread along the neckline, crafted for daytime celebrations.",
    story: "Woven in the historic weavers' colony of Chanderi, this kurta represents understated Mughal elegance. The hand-spun silk is kissed with delicate gold zari embroidery that catches sunlight with sublime subtlety.",
    craftTitle: "The Craft",
    craftText: "Rooted in centuries of heritage, every thread tells a story of dedication, carrying the weight of tradition and the lightness of modern elegance.",
    craftSpecs: [
      { label: "Material", value: "Pure Hand-Loomed Chanderi Silk" },
      { label: "Origin", value: "Woven in Madhya Pradesh" },
      { label: "Care", value: "Dry Clean Only" },
      { label: "Technique", value: "Fine Zari Thread Weave" }
    ],
    tags: ["Chanderi", "Silk", "Heritage", "Ivory"],
    isFeatured: true
  },
  {
    id: "c2",
    title: "Mustard Chanderi Suit",
    category: "Simple Suits",
    type: "clothing",
    imageSrc: "/categories/simple_suit.jpg",
    images: ["/categories/simple_suit.jpg", "/categories/simple_suit.jpg", "/categories/simple_suit.jpg"],
    description: "Bright mustard chanderi silk. Soft, breathable, made to celebrate milestones with elegant gold work.",
    story: "A radiant festive hue inspired by golden mustard fields of Punjab. Tailored with relaxed luxury for daytime celebrations and celebratory sangeets.",
    craftTitle: "The Craft",
    craftText: "Hand-spun silk yarn dipped in botanical turmeric dyes, interwoven with pure metallic threads.",
    craftSpecs: [
      { label: "Material", value: "Chanderi Silk & Mulmul Lining" },
      { label: "Origin", value: "Handcrafted in Rajasthan" },
      { label: "Care", value: "Dry Clean Only" }
    ],
    tags: ["Mustard", "Festive", "Chanderi"],
    isFeatured: true
  },
  {
    id: "a1",
    title: "Emerald Silk Anarkali",
    category: "Party Wear Suits",
    type: "clothing",
    imageSrc: "/categories/party_wear.jpg",
    images: ["/categories/party_wear.jpg", "/categories/party_wear.jpg", "/categories/party_wear.jpg"],
    description: "Rich emerald green silk anarkali. Traditional golden zardozi embroidery that lingers in memory.",
    story: "Drawing from Awadhi court costumes, the 32-kali flare creates a dramatic sweep of movement. The neckline is heavily hand-embroidered in real metallic sequins and copper dabka.",
    craftTitle: "The Craft",
    craftText: "Over 180 hours of meticulous zardozi hand embroidery executed on a classic wooden adda frame.",
    craftSpecs: [
      { label: "Material", value: "Pure Banarasi Silk & Organza" },
      { label: "Origin", value: "Embroidered in Old Delhi" },
      { label: "Care", value: "Dry Clean in Protective Muslin" }
    ],
    tags: ["Anarkali", "Emerald", "Zardozi", "Party Wear"],
    isFeatured: true
  },
  {
    id: "a2",
    title: "Midnight Velvet Lehenga",
    category: "Party Wear Suits",
    type: "clothing",
    imageSrc: "/categories/party_wear.jpg",
    images: ["/categories/party_wear.jpg", "/categories/party_wear.jpg", "/categories/party_wear.jpg"],
    description: "Deep midnight blue velvet lehenga. Heavy golden work, perfect for weddings and royal celebrations.",
    story: "Rich silk velvet dyed to the deep obsidian of Rajasthan's midnight desert skies. Adorned with antique gold kasab and micro-pearl borders.",
    craftTitle: "The Craft",
    craftText: "Heavyweight plush silk-velvet structured with stiffened canvas interlining for a majestic silhouette.",
    craftSpecs: [
      { label: "Material", value: "Silk Velvet with Silk Lining" },
      { label: "Origin", value: "Jaipur Atelier" },
      { label: "Care", value: "Specialist Dry Clean" }
    ],
    tags: ["Velvet", "Lehenga", "Midnight", "Royal"],
    isFeatured: true
  },
  {
    id: "v1",
    title: "Rose Silk Kurti",
    category: "Kurtis",
    type: "clothing",
    imageSrc: "/categories/kurti.jpg",
    images: ["/categories/kurti.jpg", "/categories/kurti.jpg", "/categories/kurti.jpg"],
    description: "Soft rose pink silk kurti with minimal elegant details. A quiet luxury piece for effortless daily grace.",
    story: "A study in minimalist poise. Soft powder-pink raw silk tailored into a relaxed silhouette with mother-of-pearl button detailing.",
    craftTitle: "The Craft",
    craftText: "Woven on small-batch pit looms to achieve a tactile raw slub texture that breathes effortlessly.",
    craftSpecs: [
      { label: "Material", value: "Raw Mulberry Silk" },
      { label: "Origin", value: "Bengaluru Looms" },
      { label: "Care", value: "Gentle Hand Wash or Dry Clean" }
    ],
    tags: ["Kurti", "Rose Pink", "Quiet Luxury"],
    isFeatured: true
  },
  {
    id: "v2",
    title: "Maroon Velvet Kurti",
    category: "Kurtis",
    type: "clothing",
    imageSrc: "/categories/kurti.jpg",
    images: ["/categories/kurti.jpg", "/categories/kurti.jpg", "/categories/kurti.jpg"],
    description: "Premium maroon velvet kurti. Rich, tactile fabric that stands out purely through its quiet elegance.",
    story: "An opulent deep garnet kurti with a tailored mandarin collar and discreet gold cord piping along the cuffs.",
    craftTitle: "The Craft",
    craftText: "Pure plush velvet accented with antique copper wire work along the side slits.",
    craftSpecs: [
      { label: "Material", value: "Plush Velvet" },
      { label: "Origin", value: "Jaipur Atelier" },
      { label: "Care", value: "Dry Clean Only" }
    ],
    tags: ["Kurti", "Maroon", "Velvet"],
    isFeatured: false
  },
  {
    id: "j1",
    title: "Kundan Choker Set",
    category: "Polki Sets",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg",
    images: [
      "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg",
      "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg",
      "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg"
    ],
    description: "An opulent Kundan choker featuring uncut diamonds set in 22K gold. Paired with matching jhumkas and a delicate maang tikka.",
    story: "Preserved through centuries of royal patronage, this choker showcases Jaipur's signature Meenakari enamel on the reverse and uncut Polki on the obverse.",
    craftTitle: "The Craft",
    craftText: "Each piece is an act of devotion. Our master craftsmen spend weeks perfecting the placement of each stone, preserving an art form that has graced the necks of queens.",
    craftSpecs: [
      { label: "Material", value: "22K Gold & Uncut Polki Diamonds" },
      { label: "Origin", value: "Handcrafted in Johari Bazaar, Jaipur" },
      { label: "Care", value: "Store in Velvet Pouch away from moisture" },
      { label: "Setting", value: "Traditional Jadau Setting with Emerald Drops" }
    ],
    tags: ["Kundan", "Polki", "Choker", "Bridal"],
    isFeatured: true
  },
  {
    id: "j2",
    title: "Polki Diamond Rani Haar",
    category: "Polki Sets",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: [
      "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Magnificent polki diamond rani haar with natural uncut stones. A heirloom piece that carries generations of royal elegance.",
    story: "Worn over heavy bridal silhouettes, this tiered necklace cascades gracefully across the collarbone, anchored by Colombian emerald droplets.",
    craftTitle: "The Craft",
    craftText: "Master craftsmen spend over 200 hours carving fine gold foils to hold syndicate polki diamonds in place without prongs.",
    craftSpecs: [
      { label: "Material", value: "22K Hallmarked Gold, Uncut Diamonds" },
      { label: "Origin", value: "Bikaner Royal Court Tradition" },
      { label: "Care", value: "Wipe gently with micro-suede after wear" }
    ],
    tags: ["Rani Haar", "Polki", "Heirloom"],
    isFeatured: true
  },
  {
    id: "j3",
    title: "Emerald Jadau Bangles",
    category: "Diamond Chokers",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: [
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Hand-crafted jadau bangles set with natural emeralds and 22K gold. The jadau technique requires 40+ hours of master craftsmanship.",
    story: "Classic elephant-head finials with ruby eyes, interlocking seamlessly for an ergonomic wrist fit.",
    craftTitle: "The Craft",
    craftText: "Chased and repousséd 22K gold with closed-back foil-set gemstones.",
    craftSpecs: [
      { label: "Material", value: "22K Gold, Natural Emeralds, Rubies" },
      { label: "Origin", value: "Jaipur Jewels" },
      { label: "Care", value: "Store in custom suede box" }
    ],
    tags: ["Jadau", "Bangles", "Emerald"],
    isFeatured: true
  }
];

const defaultClothingCategories: CategoryItem[] = [
  { id: '1', title: 'Simple Suits', image: '/categories/simple_suit.jpg', tagline: 'Chanderi & Organza Silhouettes' },
  { id: '2', title: 'Party Wear Suits', image: '/categories/party_wear.jpg', tagline: 'Zardozi & Silk Anarkalis' },
  { id: '3', title: 'Kurtis', image: '/categories/kurti.jpg', tagline: 'Everyday Atelier Grace' }
];

const defaultJewelryCategories: CategoryItem[] = [
  { id: '1', title: 'Polki Sets', image: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg', tagline: 'Uncut Syndicate Diamonds' },
  { id: '2', title: 'Diamond Chokers', image: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg', tagline: 'High Jewel Collars' },
  { id: '3', title: 'Temple Jewelry', image: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg', tagline: '22K Antique Filigree' }
];

const defaultClothingVideos: VideoCard[] = [
  { id: 1, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/bespoke_bg.jpg', title: 'The Royal Drape', no: 'Nº 01' },
  { id: 2, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/hero-suit.jpg', title: 'Mastercraft Zardozi', no: 'Nº 02' },
  { id: 3, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/hero-rose-pink.jpg', title: 'Heirloom Trousseau', no: 'Nº 03' },
  { id: 4, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1113554/pexels-photo-1113554.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'The Loom Heritage', no: 'Nº 04' }
];

const defaultJewelryVideos: VideoCard[] = [
  { id: 1, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Polki Diamonds', no: 'Jº 01' },
  { id: 2, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Ruby Choker', no: 'Jº 02' },
  { id: 3, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Emerald Cascade', no: 'Jº 03' },
  { id: 4, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Kundan Heritage', no: 'Jº 04' }
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // --- A. System & Admin UI ---
      isEditMode: false,
      setEditMode: (v) => set({ isEditMode: v }),
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (v) => set({ hasUnsavedChanges: v }),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      // --- B. Brand & Global Identity ---
      brandName: 'Raani Closet',
      setBrandName: (v) => set({ brandName: v, hasUnsavedChanges: true }),
      whatsappNumber: '919876543210',
      setWhatsappNumber: (v) => set({ whatsappNumber: v, hasUnsavedChanges: true }),
      supportEmail: 'concierge@raanicloset.com',
      setSupportEmail: (v) => set({ supportEmail: v, hasUnsavedChanges: true }),
      contactPhone: '+91 141 256 7890',
      setContactPhone: (v) => set({ contactPhone: v, hasUnsavedChanges: true }),
      instagramUrl: 'https://instagram.com',
      setInstagramUrl: (v) => set({ instagramUrl: v, hasUnsavedChanges: true }),
      facebookUrl: 'https://facebook.com',
      setFacebookUrl: (v) => set({ facebookUrl: v, hasUnsavedChanges: true }),
      youtubeUrl: 'https://youtube.com',
      setYoutubeUrl: (v) => set({ youtubeUrl: v, hasUnsavedChanges: true }),

      // --- C. Scene 1: Hero Section ---
      clothingHeroBg: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg',
      setClothingHeroBg: (v) => set({ clothingHeroBg: v, hasUnsavedChanges: true }),
      clothingHeroLine1: 'Where Elegance',
      setClothingHeroLine1: (v) => set({ clothingHeroLine1: v, hasUnsavedChanges: true }),
      clothingHeroCursive: 'Meets Tradition',
      setClothingHeroCursive: (v) => set({ clothingHeroCursive: v, hasUnsavedChanges: true }),
      clothingHeroLine3: 'Royal Heritage Collection',
      setClothingHeroLine3: (v) => set({ clothingHeroLine3: v, hasUnsavedChanges: true }),
      clothingHeroSubtext: 'Building Communities. Not Just Clients.',
      setClothingHeroSubtext: (v) => set({ clothingHeroSubtext: v, hasUnsavedChanges: true }),
      clothingHeroButtonText: 'Bespoke Couture',
      setClothingHeroButtonText: (v) => set({ clothingHeroButtonText: v, hasUnsavedChanges: true }),

      jewelryHeroBg: 'https://assets.mixkit.co/videos/preview/mixkit-sparkling-jewelry-on-a-black-background-34354-large.mp4',
      setJewelryHeroBg: (v) => set({ jewelryHeroBg: v, hasUnsavedChanges: true }),
      jewelryHeroLine1: 'High Jewels',
      setJewelryHeroLine1: (v) => set({ jewelryHeroLine1: v, hasUnsavedChanges: true }),
      jewelryHeroCursive: 'The Art of Adornment',
      setJewelryHeroCursive: (v) => set({ jewelryHeroCursive: v, hasUnsavedChanges: true }),
      jewelryHeroLine3: 'Imperial Vault Edition',
      setJewelryHeroLine3: (v) => set({ jewelryHeroLine3: v, hasUnsavedChanges: true }),
      jewelryHeroSubtext: 'Heirlooms Crafted for Eternity.',
      setJewelryHeroSubtext: (v) => set({ jewelryHeroSubtext: v, hasUnsavedChanges: true }),
      jewelryHeroButtonText: 'Explore Vault',
      setJewelryHeroButtonText: (v) => set({ jewelryHeroButtonText: v, hasUnsavedChanges: true }),

      // --- D. Scene 2: Category Carousel & Collection Header ---
      clothingCategoryHeading: 'Suit',
      setClothingCategoryHeading: (v) => set({ clothingCategoryHeading: v, hasUnsavedChanges: true }),
      jewelryCategoryHeading: 'Jewels',
      setJewelryCategoryHeading: (v) => set({ jewelryCategoryHeading: v, hasUnsavedChanges: true }),
      clothingCollectionTitle: 'Curated Silhouettes',
      setClothingCollectionTitle: (v) => set({ clothingCollectionTitle: v, hasUnsavedChanges: true }),
      jewelryCollectionTitle: 'The Jewel Vault',
      setJewelryCollectionTitle: (v) => set({ jewelryCollectionTitle: v, hasUnsavedChanges: true }),
      clothingCategories: defaultClothingCategories,
      setClothingCategories: (v) => set({ clothingCategories: v, hasUnsavedChanges: true }),
      jewelryCategories: defaultJewelryCategories,
      setJewelryCategories: (v) => set({ jewelryCategories: v, hasUnsavedChanges: true }),

      addCategory: (item, type) => set((state) => {
        const newCat = { ...item, id: item.id || `cat_${Date.now()}` };
        return type === 'clothing'
          ? { clothingCategories: [...state.clothingCategories, newCat], hasUnsavedChanges: true }
          : { jewelryCategories: [...state.jewelryCategories, newCat], hasUnsavedChanges: true };
      }),
      updateCategory: (id, updates, type) => set((state) => {
        const key = type === 'clothing' ? 'clothingCategories' : 'jewelryCategories';
        return {
          [key]: state[key].map((c) => (c.id === id ? { ...c, ...updates } : c)),
          hasUnsavedChanges: true,
        };
      }),
      deleteCategory: (id, type) => set((state) => {
        const key = type === 'clothing' ? 'clothingCategories' : 'jewelryCategories';
        return {
          [key]: state[key].filter((c) => c.id !== id),
          hasUnsavedChanges: true,
        };
      }),

      // --- E. Scene 3: Products Catalog & PDP Detail Manager ---
      products: defaultProducts,
      setProducts: (v) => set({ products: v, hasUnsavedChanges: true }),
      addProduct: (product) => set((state) => {
        const newProd: Product = {
          ...product,
          id: product.id || `prod_${Date.now()}`,
          images: product.images && product.images.length > 0 ? product.images : [product.imageSrc, product.imageSrc, product.imageSrc],
        };
        return { products: [newProd, ...state.products], hasUnsavedChanges: true };
      }),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        hasUnsavedChanges: true,
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        hasUnsavedChanges: true,
      })),
      getProductById: (id) => get().products.find((p) => p.id === id),

      // --- F. Scene 4: Bespoke Atelier ---
      bespokeEyebrow: 'The Atelier',
      setBespokeEyebrow: (v) => set({ bespokeEyebrow: v, hasUnsavedChanges: true }),
      clothingBespokeTitle: 'Bespoke Tailoring',
      setClothingBespokeTitle: (v) => set({ clothingBespokeTitle: v, hasUnsavedChanges: true }),
      jewelryBespokeTitle: 'Bespoke Jewelry',
      setJewelryBespokeTitle: (v) => set({ jewelryBespokeTitle: v, hasUnsavedChanges: true }),
      clothingBespokeSubtitle: 'Commission Your Custom Design',
      setClothingBespokeSubtitle: (v) => set({ clothingBespokeSubtitle: v, hasUnsavedChanges: true }),
      jewelryBespokeSubtitle: 'Commission Your Heritage Piece',
      setJewelryBespokeSubtitle: (v) => set({ jewelryBespokeSubtitle: v, hasUnsavedChanges: true }),
      clothingBespokeBg: '/bespoke_bg.jpg',
      setClothingBespokeBg: (v) => set({ clothingBespokeBg: v, hasUnsavedChanges: true }),
      jewelryBespokeBg: 'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=1200',
      setJewelryBespokeBg: (v) => set({ jewelryBespokeBg: v, hasUnsavedChanges: true }),
      bespokeButtonText: 'Begin Your Journey',
      setBespokeButtonText: (v) => set({ bespokeButtonText: v, hasUnsavedChanges: true }),
      bespokeHeroTitle: 'The Atelier Experience',
      setBespokeHeroTitle: (v) => set({ bespokeHeroTitle: v, hasUnsavedChanges: true }),
      bespokeHeroSubtitle: 'Where your imagination meets our master craftsmanship.',
      setBespokeHeroSubtitle: (v) => set({ bespokeHeroSubtitle: v, hasUnsavedChanges: true }),
      bespokeHeroBg: '/bespoke_bg.jpg',
      setBespokeHeroBg: (v) => set({ bespokeHeroBg: v, hasUnsavedChanges: true }),

      // --- G. Scene 5: Video Carousel / Cinematic Archives ---
      videoCarouselEyebrow: 'Cinematic Archives',
      setVideoCarouselEyebrow: (v) => set({ videoCarouselEyebrow: v, hasUnsavedChanges: true }),
      clothingVideoHeading: 'The Living Atelier',
      setClothingVideoHeading: (v) => set({ clothingVideoHeading: v, hasUnsavedChanges: true }),
      jewelryVideoHeading: 'The High Jewels',
      setJewelryVideoHeading: (v) => set({ jewelryVideoHeading: v, hasUnsavedChanges: true }),
      clothingVideos: defaultClothingVideos,
      setClothingVideos: (v) => set({ clothingVideos: v, hasUnsavedChanges: true }),
      jewelryVideos: defaultJewelryVideos,
      setJewelryVideos: (v) => set({ jewelryVideos: v, hasUnsavedChanges: true }),
      updateVideoCard: (id, updates, type) => set((state) => {
        const key = type === 'clothing' ? 'clothingVideos' : 'jewelryVideos';
        return {
          [key]: state[key].map((card) => (card.id === id ? { ...card, ...updates } : card)),
          hasUnsavedChanges: true,
        };
      }),

      // --- H. Scene 6: Story, Craft & Epilogue ---
      storyHeading: 'The Imperial Archive & Heritage',
      setStoryHeading: (v) => set({ storyHeading: v, hasUnsavedChanges: true }),
      storyText: 'Rooted in the royal courtyards of Rajputana and the poetic looms of Chanderi, Raani Closet is an ode to timeless Indian aristocracies. Every creation is an intimate dialogue between master weavers, zardozi artisans, and modern silhouettes—meticulously hand-crafted over hundreds of patient hours. We do not mass-produce; we curate living heirlooms meant to be cherished across generations.',
      setStoryText: (v) => set({ storyText: v, hasUnsavedChanges: true }),
      clothingCraftText: 'Rooted in centuries of royal Rajasthani heritage, every thread tells a tale of devotion. Hand-loomed in pure Chanderi silk, enriched with real gold and silver zari, and crowned with hand-appliquéd dabka embroidery that whispers quiet majesty.',
      setClothingCraftText: (v) => set({ clothingCraftText: v, hasUnsavedChanges: true }),
      jewelryCraftText: 'Each piece is an act of high reverence. Our Jaipur master craftsmen spend weeks perfecting the setting of each uncut Polki diamond within 22K hallmarked gold foil, accented by Zambian emerald drops and Basra seed pearls that have adorned royalty for centuries.',
      setJewelryCraftText: (v) => set({ jewelryCraftText: v, hasUnsavedChanges: true }),
      storyEpilogueQuote: 'Preserving the royal threads of Rajasthan, one bespoke silhouette at a time.',
      setStoryEpilogueQuote: (v) => set({ storyEpilogueQuote: v, hasUnsavedChanges: true }),
      storyEpilogueSignature: 'The Master Artisans',
      setStoryEpilogueSignature: (v) => set({ storyEpilogueSignature: v, hasUnsavedChanges: true }),
      storyEpilogueSubtext: 'Raani Closet Atelier • Jaipur & New Delhi',
      setStoryEpilogueSubtext: (v) => set({ storyEpilogueSubtext: v, hasUnsavedChanges: true }),

      // --- I. Scene 7: Imperial Concierge & Footer ---
      footerConciergeEyebrow: 'The Digital Sanctuary',
      setFooterConciergeEyebrow: (v) => set({ footerConciergeEyebrow: v, hasUnsavedChanges: true }),
      footerConciergeTitle: 'Imperial Concierge',
      setFooterConciergeTitle: (v) => set({ footerConciergeTitle: v, hasUnsavedChanges: true }),
      footerConciergeText: 'An exclusive enclave dedicated to the preservation of Indian royal heritage. From bespoke zardozi bridal trousseaus to archival polki jewelry, Raani Closet offers private commissions and digital styling engagements for the modern aristocrat.',
      setFooterConciergeText: (v) => set({ footerConciergeText: v, hasUnsavedChanges: true }),
      addressJaipur: 'Narain Niwas Palace Courtyard, C-Scheme, Rajasthan',
      setAddressJaipur: (v) => set({ addressJaipur: v, hasUnsavedChanges: true }),
      addressDelhi: 'The Crescent at Qutab, Mehrauli Heritage Quarter',
      setAddressDelhi: (v) => set({ addressDelhi: v, hasUnsavedChanges: true }),
      copyrightText: '© 2026 Maison Raani. All Rights Reserved.',
      setCopyrightText: (v) => set({ copyrightText: v, hasUnsavedChanges: true }),

      // --- J. Search Trending Tags ---
      clothingTrendingTerms: ['Bridal Lehenga', 'Silk Kurti', 'Chanderi Suit', 'Velvet Anarkali', 'Georgette Dupatta'],
      setClothingTrendingTerms: (v) => set({ clothingTrendingTerms: v, hasUnsavedChanges: true }),
      jewelryTrendingTerms: ['Kundan Choker', 'Polki Haar', 'Jadau Bangles', 'Pearl Mathapatti', 'Chandbali Earrings'],
      setJewelryTrendingTerms: (v) => set({ jewelryTrendingTerms: v, hasUnsavedChanges: true }),

      // --- K. Admin Reset & Factory Defaults ---
      resetToDefaults: () => {
        set({
          brandName: 'Raani Closet',
          whatsappNumber: '919876543210',
          supportEmail: 'concierge@raanicloset.com',
          contactPhone: '+91 141 256 7890',
          instagramUrl: 'https://instagram.com',
          facebookUrl: 'https://facebook.com',
          youtubeUrl: 'https://youtube.com',
          clothingHeroBg: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg',
          clothingHeroLine1: 'Where Elegance',
          clothingHeroCursive: 'Meets Tradition',
          clothingHeroLine3: 'Royal Heritage Collection',
          clothingHeroSubtext: 'Building Communities. Not Just Clients.',
          clothingHeroButtonText: 'Bespoke Couture',
          jewelryHeroBg: 'https://assets.mixkit.co/videos/preview/mixkit-sparkling-jewelry-on-a-black-background-34354-large.mp4',
          jewelryHeroLine1: 'High Jewels',
          jewelryHeroCursive: 'The Art of Adornment',
          jewelryHeroLine3: 'Imperial Vault Edition',
          jewelryHeroSubtext: 'Heirlooms Crafted for Eternity.',
          jewelryHeroButtonText: 'Explore Vault',
          clothingCategoryHeading: 'Suit',
          jewelryCategoryHeading: 'Jewels',
          clothingCollectionTitle: 'Curated Silhouettes',
          jewelryCollectionTitle: 'The Jewel Vault',
          clothingCategories: defaultClothingCategories,
          jewelryCategories: defaultJewelryCategories,
          products: defaultProducts,
          bespokeEyebrow: 'The Atelier',
          clothingBespokeTitle: 'Bespoke Tailoring',
          jewelryBespokeTitle: 'Bespoke Jewelry',
          clothingBespokeSubtitle: 'Commission Your Custom Design',
          jewelryBespokeSubtitle: 'Commission Your Heritage Piece',
          clothingBespokeBg: '/bespoke_bg.jpg',
          jewelryBespokeBg: 'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=1200',
          bespokeButtonText: 'Begin Your Journey',
          bespokeHeroTitle: 'The Atelier Experience',
          bespokeHeroSubtitle: 'Where your imagination meets our master craftsmanship.',
          bespokeHeroBg: '/bespoke_bg.jpg',
          videoCarouselEyebrow: 'Cinematic Archives',
          clothingVideoHeading: 'The Living Atelier',
          jewelryVideoHeading: 'The High Jewels',
          clothingVideos: defaultClothingVideos,
          jewelryVideos: defaultJewelryVideos,
          storyHeading: 'The Imperial Archive & Heritage',
          storyText: 'Rooted in the royal courtyards of Rajputana and the poetic looms of Chanderi, Raani Closet is an ode to timeless Indian aristocracies. Every creation is an intimate dialogue between master weavers, zardozi artisans, and modern silhouettes—meticulously hand-crafted over hundreds of patient hours. We do not mass-produce; we curate living heirlooms meant to be cherished across generations.',
          clothingCraftText: 'Rooted in centuries of royal Rajasthani heritage, every thread tells a tale of devotion. Hand-loomed in pure Chanderi silk, enriched with real gold and silver zari, and crowned with hand-appliquéd dabka embroidery that whispers quiet majesty.',
          jewelryCraftText: 'Each piece is an act of high reverence. Our Jaipur master craftsmen spend weeks perfecting the setting of each uncut Polki diamond within 22K hallmarked gold foil, accented by Zambian emerald drops and Basra seed pearls that have adorned royalty for centuries.',
          storyEpilogueQuote: 'Preserving the royal threads of Rajasthan, one bespoke silhouette at a time.',
          storyEpilogueSignature: 'The Master Artisans',
          storyEpilogueSubtext: 'Raani Closet Atelier • Jaipur & New Delhi',
          footerConciergeEyebrow: 'The Digital Sanctuary',
          footerConciergeTitle: 'Imperial Concierge',
          footerConciergeText: 'An exclusive enclave dedicated to the preservation of Indian royal heritage. From bespoke zardozi bridal trousseaus to archival polki jewelry, Raani Closet offers private commissions and digital styling engagements for the modern aristocrat.',
          addressJaipur: 'Narain Niwas Palace Courtyard, C-Scheme, Rajasthan',
          addressDelhi: 'The Crescent at Qutab, Mehrauli Heritage Quarter',
          copyrightText: '© 2026 Maison Raani. All Rights Reserved.',
          clothingTrendingTerms: ['Bridal Lehenga', 'Silk Kurti', 'Chanderi Suit', 'Velvet Anarkali', 'Georgette Dupatta'],
          jewelryTrendingTerms: ['Kundan Choker', 'Polki Haar', 'Jadau Bangles', 'Pearl Mathapatti', 'Chandbali Earrings'],
          hasUnsavedChanges: false,
        });
      },

      exportConfig: () => {
        const state = get();
        return JSON.stringify(state, null, 2);
      },

      importConfig: (json: string) => {
        try {
          const parsed = JSON.parse(json);
          set({ ...parsed, hasUnsavedChanges: true });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'raani-admin-store-v4',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

---

## 5. Verification Method

### A. How to Independently Verify the Findings
1. **Verify Disconnected Properties in Components**:
   - Inspect `src/components/HeroSection.tsx:11-22`: Confirm destructuring of `clothingHeroLine1`, `clothingHeroCursive`, etc.
   - Inspect `src/components/CollectionHeader.tsx:24-27`: Confirm destructuring of `clothingCollectionTitle`.
   - Inspect `src/components/admin/AdminBar.tsx:16` and `EditableText.tsx:20`: Confirm destructuring of `isEditMode`.
2. **Verify Hardcoded Arrays in Storefront**:
   - Inspect `src/app/product/[id]/page.tsx:17-34`: Confirm hardcoded `ALL_PRODUCTS` array.
   - Inspect `src/components/VideoCarousel.tsx:7-19`: Confirm hardcoded `CLOTHING_CARDS` and `JEWELRY_CARDS`.
   - Inspect `src/components/CollectionHeader.tsx:8-18`: Confirm hardcoded `CLOTHING_CATEGORIES` and `JEWELRY_CATEGORIES`.
   - Inspect `src/components/LuxuryFooter.tsx:143-154`: Confirm hardcoded phone and email.
3. **Verify Price Omission**:
   - In `useAdminStore.ts`: Grep for `price` in `src/store/useAdminStore.ts`. It will return 0 matches.
   - In components: Grep for `price:` in `src/app/admin/page.tsx:391-393` and `src/components/ProductCard.tsx:12-13` to verify where price was mistakenly placed.
4. **Verify TypeScript Compilation**:
   - After the implementer replaces `useAdminStore.ts` with the proposed code and updates callers, run:
     ```powershell
     npm run build
     ```
     in `c:\Users\satya\Documents\antigravity\modest-hypatia\admin`. It must compile with zero TypeScript errors.

### B. Invalidation Conditions
- If the client decides to add e-commerce checkout with currency transactions, the zero-price policy would be invalidated. (Currently explicitly forbidden by the authoritative prompt: "Do not include any 'Price' fields as this is a display-only portfolio site").
- If server-side database storage (e.g. Supabase, PostgreSQL, Prisma) is requested, client-side Zustand localStorage persistence would need to be replaced with API sync.
