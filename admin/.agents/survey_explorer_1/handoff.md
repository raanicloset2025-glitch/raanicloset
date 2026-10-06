# Handoff Report: Phase 0 Frontend Static Assets & Content Audit

**Agent**: Survey Explorer 1 (`survey_explorer_1`)  
**Mission**: Full frontend scan & content audit of Raani Closet Storefront for the Luxury Admin Panel project.  
**Target Project Directory**: `c:\Users\satya\Documents\antigravity\modest-hypatia\admin`  
**Date**: 2026-10-01  

---

## 1. Observation

A full systematic codebase scan was conducted across all files under `src/app/`, `src/components/`, `src/store/`, and `public/`. Below are the verbatim observations, file paths, line numbers, variable names, and current hardcoded values.

### 1.1 Store Mismatch & Broken State Variables
In `src/components/HeroSection.tsx` (lines 11–22):
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
**Observation**: In `src/store/useAdminStore.ts` (lines 13–68), the state defines:
- `clothingHeroTitle` and `clothingHeroSubtitle` (lines 27, 29)
- `jewelryHeroTitle` and `jewelryHeroSubtitle` (lines 35, 37)
It does **NOT** define `clothingHeroLine1`, `clothingHeroCursive`, `clothingHeroLine3`, `clothingHeroButtonText`, `jewelryHeroLine1`, `jewelryHeroCursive`, `jewelryHeroLine3`, or `jewelryHeroButtonText`. As a result, in `HeroSection.tsx`, these values evaluate to `undefined` at runtime.
Furthermore, `isEditMode` and `setEditMode` are called in:
- `src/components/admin/AdminBar.tsx` (line 16)
- `src/components/admin/EditableText.tsx` (line 20)
- `src/components/admin/EditableImage.tsx` (line 19)
- `src/components/admin/EditableVideo.tsx` (line 13)
- `src/components/ProductGrid.tsx` (line 29)
- `src/app/product/[id]/page.tsx` (line 42)
Yet `isEditMode` and `setEditMode` are completely absent from `src/store/useAdminStore.ts`.

In `src/components/CollectionHeader.tsx` (lines 24–27):
```tsx
const {
  clothingCollectionTitle, setClothingCollectionTitle,
  jewelryCollectionTitle, setJewelryCollectionTitle,
} = useAdminStore();
```
These properties do not exist in `src/store/useAdminStore.ts`.

---

### 1.2 Prices in Code and Storefront UI (Critical Violation)
The user specification strictly mandates:
- *"Do not include any 'Price' fields (as this is a display-only portfolio site)."*
- *"- [ ] No price code exists in the frontend or admin panel."*

During our inspection, active prices and price codes were discovered across multiple files:

1. **Active UI Price Rendering in `src/components/SearchOverlay.tsx`**:
   - Line 268: `<span className={`font-sans text-xs ${sub}`}>&#8377;{p.price.toLocaleString("en-IN")}</span>`
   - Line 305: `<span className={`font-sans text-xs ${sub}`}>&#8377;{p.price.toLocaleString("en-IN")}</span>`
   *Result*: Users searching for products currently see live prices like `₹4,499`, `₹12,499`, `₹45,000` rendered on screen!

2. **Hardcoded Price Data in `src/components/SearchOverlay.tsx` (lines 45–60)**:
   - Line 45: `{ id: "c1", ..., price: 4499 }`
   - Line 46: `{ id: "c2", ..., price: 5499 }`
   - Line 47: `{ id: "a1", ..., price: 12499 }`
   - Line 48: `{ id: "a2", ..., price: 24500 }`
   - Line 49: `{ id: "v1", ..., price: 3499 }`
   - Line 50: `{ id: "v2", ..., price: 6500 }`
   - Line 51: `{ id: "a3", ..., price: 35000 }`
   - Line 52: `{ id: "c3", ..., price: 4999 }`
   - Line 54: `{ id: "j1", ..., price: 45000 }`
   - Line 55: `{ id: "j2", ..., price: 120000 }`
   - Line 56: `{ id: "j3", ..., price: 28000 }`
   - Line 57: `{ id: "j4", ..., price: 15000 }`
   - Line 58: `{ id: "j5", ..., price: 8500 }`
   - Line 59: `{ id: "j6", ..., price: 22000 }`

3. **Hardcoded Price Data in `src/app/product/[id]/page.tsx` (lines 19–34, 47)**:
   - Lines 19–26: 8 clothing products with prices (`4499`, `5499`, `12499`, `24500`, `35000`, `3499`, `6500`, `4999`)
   - Lines 28–33: 6 jewelry products with prices (`45000`, `120000`, `28000`, `15000`, `8500`, `22000`)
   - Line 47: `price: 0` in fallback template

4. **Hardcoded Price Data in `src/components/ProductGrid.tsx` (lines 10–25)**:
   - Lines 10–15: `sizes: [ { id: 's1', label: 'S', price: 4499, stock: 5 } ]`, etc.
   - Lines 19–24: `sizes: [ { id: 's1', label: 'OS', price: 45000, stock: 1 } ]`, etc.

5. **Hardcoded Price in Admin Panel `src/app/admin/page.tsx` (lines 391–393)**:
   - Line 391: `{ title: "Ivory Chanderi Kurta", category: "Handcrafted Heritage", price: 4499, img: "/categories/simple_suit.jpg" }`
   - Line 392: `{ title: "Emerald Silk Anarkali", category: "Royal Collection", price: 12499, img: "/categories/party_wear.jpg" }`
   - Line 393: `{ title: "Kundan Choker Set", category: "Bridal Jewels", price: 34500, img: "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg" }`

6. **State & Component Interfaces passing `price`**:
   - `src/store/useStore.ts` line 6: `price: number;` in `CartItem`
   - `src/components/ProductCard.tsx` line 12: `price: number;`, lines 80, 151, 196, 201
   - `src/components/CuratedSlider.tsx` line 11: `price: number;`
   - `src/components/FloatingImageGallery.tsx` lines 86, 129: `price={product.price}`
   - `src/components/PDPAddToCartButton.tsx` line 22: `price: product.price`
   - `src/components/PDPWhatsAppButton.tsx` lines 13, 33: `price: product.price`, `total={product.price}`
   - `src/components/PDPWishlistButton.tsx` lines 10, 16, 36: `price: number`
   - `src/components/WhatsAppCheckoutModal.tsx` line 13: `total: number`

---

### 1.3 Full Inventory of Hardcoded Media, Text, and Components

#### A. Hero Section (`src/components/HeroSection.tsx`)
- Line 39–43: Video background `src={jewelryHeroBg}`
  *Default in store*: `'https://assets.mixkit.co/videos/preview/mixkit-sparkling-jewelry-on-a-black-background-34354-large.mp4'`
- Line 45–52: Image background `src={clothingHeroBg}`
  *Default in store*: `'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg'`
- Line 112: Line 1 (`clothingHeroLine1`) - Royal typography: uppercase eyebrow.
- Line 119: Line 2 (`clothingHeroCursive`) - Painter cursive typography: shimmer script.
- Line 126: Line 3 (`clothingHeroLine3`) - Royal typography: uppercase base.
- Line 136: Hardcoded subtext: `"Building Communities. Not Just Clients."`
- Line 154: Button text (`clothingHeroButtonText`): scrolls to `#bespoke-atelier`.
- *Deficiency*: When `isJewelry === true`, the text in `HeroSection.tsx` does NOT switch to `jewelryHeroLine1`, `jewelryHeroCursive`, etc. It only switches media background!

#### B. Category Carousel (`src/components/CategoryCarousel.tsx` & `src/components/CollectionHeader.tsx`)
- In `CategoryCarousel.tsx`:
  - Line 93–107: Hardcoded section title: `{isJewelry ? "Jewels" : "Suit"}`
  - Line 106: Current items read from `clothingCategories` and `jewelryCategories` in `useAdminStore`, but `CategoryCarousel.tsx` only allows title and image editing inline.
- In `CollectionHeader.tsx`:
  - Lines 8–12: Hardcoded `CLOTHING_CATEGORIES`:
    `[{ id: '1', title: 'Simple Suits', image: '/categories/simple_suit.jpg' }, { id: '2', title: 'Party Wear Suits', image: '/categories/party_wear.jpg' }, { id: '3', title: 'Kurtis', image: '/categories/kurti.jpg' }]`
  - Lines 14–18: Hardcoded `JEWELRY_CATEGORIES`:
    `[{ id: 'j1', title: 'Polki Sets', image: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800' }, { id: 'j2', title: 'Diamond Chokers', image: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800' }, { id: 'j3', title: 'Temple Jewelry', image: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800' }]`
  - Line 115: Hardcoded button text: `"View All"`

#### C. Product Grid & Product Catalog (`src/components/ProductGrid.tsx`, `ProductCard.tsx`)
- In `ProductGrid.tsx`:
  - Lines 9–16: Hardcoded `CLOTHING_PRODUCTS` (6 items):
    1. `c1`: "Ivory Chanderi Kurta", category: 'Simple Suits', imageSrc: '/categories/simple_suit.jpg'
    2. `c2`: "Mustard Chanderi Suit", category: 'Simple Suits', imageSrc: '/categories/simple_suit.jpg'
    3. `a1`: "Emerald Silk Anarkali", category: 'Party Wear Suits', imageSrc: '/categories/party_wear.jpg'
    4. `a2`: "Midnight Velvet Lehenga", category: 'Party Wear Suits', imageSrc: '/categories/party_wear.jpg'
    5. `v1`: "Rose Silk Kurti", category: 'Kurtis', imageSrc: '/categories/kurti.jpg'
    6. `v2`: "Maroon Velvet Kurti", category: 'Kurtis', imageSrc: '/categories/kurti.jpg'
  - Lines 18–25: Hardcoded `JEWELRY_PRODUCTS` (6 items):
    1. `j1`: "Kundan Choker Set", category: 'Polki Sets', imageSrc: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800'
    2. `j2`: "Polki Diamond Rani Haar", category: 'Polki Sets', imageSrc: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800'
    3. `j3`: "Emerald Jadau Bangles", category: 'Diamond Chokers', imageSrc: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800'
    4. `j4`: "Pearl Mathapatti", category: 'Diamond Chokers', imageSrc: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800'
    5. `j5`: "Gold Filigree Earrings", category: 'Temple Jewelry', imageSrc: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800'
    6. `j6`: "Antique Chandbali Set", category: 'Temple Jewelry', imageSrc: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800'
  - Line 49: Section Title: `"Signature Collection"`
  - Line 63: Filter button text: `"× View Signature Collection"`
  - Line 112: Button text: `"Explore Full Collection"`
- In `ProductCard.tsx`:
  - Line 87: `"Add to Trousseau"` / `"Remove from Trousseau"`
  - Line 160: `"Reserve"`
  - Line 172: `"Ask Stylist"`

#### D. Product Detail Page (`src/app/product/[id]/page.tsx` & related components)
- In `src/app/product/[id]/page.tsx`:
  - Lines 17–34: Hardcoded `ALL_PRODUCTS` array (14 products) completely disconnected from `useAdminStore`!
  - Lines 48: `ALL_PRODUCTS.find((p) => p.id === id) ?? ALL_PRODUCTS[0]`
  - Lines 50–53: Local React state only (`useState` for title, category, description, imageSrc). No updates persist back to store!
  - Line 68: `PDPMasthead`:
    - Line 32: `"← Back to Shop"`
    - Line 37: Brand name hardcoded as `"Raani Closet"` instead of reading `useAdminStore.brandName`
  - Lines 73–76: `FloatingImageGallery`:
    - Reads `product.images` (array of up to 3 images) or falls back to `[product.imageSrc, product.imageSrc, product.imageSrc]`
  - Lines 127–129: Craft Image Caption:
    - Jewelry: `"Master Crafted Detail"`
    - Clothing: `"Hand-Loomed Texture"`
  - Line 133: Heading: `"The Craft"`
  - Lines 135–138: Craft Story text:
    - Jewelry: `"Each piece is an act of devotion. Our master craftsmen spend weeks perfecting the placement of each stone, preserving an art form that has graced the necks of queens."`
    - Clothing: `"Rooted in centuries of heritage, every thread tells a story of dedication, carrying the weight of tradition and the lightness of modern elegance."`
  - Lines 140–149: Hardcoded Specification Table:
    - Jewelry specs:
      - Material: `"22K Gold & Uncut Polki"`
      - Origin: `"Handcrafted in Jaipur"`
      - Care: `"Store in velvet pouch"`
    - Clothing specs:
      - Material: `"Pure Chanderi / Silk"`
      - Origin: `"Woven in Madhya Pradesh"`
      - Care: `"Dry Clean Only"`
  - Lines 159–164: Related Products Section:
    - Headings: `"More from the Jewel Vault"` (Jewelry) / `"The Curated Ensemble"` (Clothing)
    - Subtitle: `"Companion Jewels from the Atelier"` (Jewelry) / `"Companion Pieces from the Atelier"` (Clothing)

#### E. Bespoke Atelier (`src/components/BespokeBanner.tsx`, `BespokeForm.tsx`, `src/app/bespoke/page.tsx`)
- In `BespokeBanner.tsx`:
  - Line 10–12: Hardcoded images:
    - Jewelry: `"https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=1200"`
    - Clothing: `"/bespoke_bg.jpg"`
  - Line 14: Title: `isJewelry ? "Bespoke Jewelry" : "Bespoke Tailoring"`
  - Line 15: Subtitle: `isJewelry ? "Commission Your Heritage Piece" : "Commission Your Custom Design"`
  - Line 39: Monogram: `"RC"`
  - Line 43: Eyebrow: `"The Atelier"`
  - Line 57: Button text: `"Begin Your Journey"`
- In `BespokeForm.tsx`:
  - Line 42: Image: `"/bespoke_bg.jpg"`
  - Line 52: Heading: `"The Atelier Experience"`
  - Line 54: Subtitle: `"Where your imagination meets our master craftsmanship."`
  - Line 64: Eyebrow: `"Begin Your Journey"`
  - Line 65: Heading: `"Commission Your Design"`
  - Line 141: Submit button: `"Continue to WhatsApp"`
  - Line 149: Note: `"Our master artisans will respond within 24 hours."`
  - Line 26: WhatsApp prompt template

#### F. Video Archives Carousel (`src/components/VideoCarousel.tsx`)
- Lines 7–12: Hardcoded `CLOTHING_CARDS`:
  1. `id: 1`, `video: 'https://www.w3schools.com/html/mov_bbb.mp4'`, `poster: '/bespoke_bg.jpg'`, `title: 'The Royal Drape'`, `no: 'Nº 01'`
  2. `id: 2`, `video: 'https://www.w3schools.com/html/mov_bbb.mp4'`, `poster: '/hero-suit.jpg'`, `title: 'Mastercraft Zardozi'`, `no: 'Nº 02'`
  3. `id: 3`, `video: 'https://www.w3schools.com/html/mov_bbb.mp4'`, `poster: '/hero-rose-pink.jpg'`, `title: 'Heirloom Trousseau'`, `no: 'Nº 03'`
  4. `id: 4`, `video: 'https://www.w3schools.com/html/mov_bbb.mp4'`, `poster: 'https://images.pexels.com/photos/1113554/pexels-photo-1113554.jpeg?auto=compress&cs=tinysrgb&w=800'`, `title: 'The Loom Heritage'`, `no: 'Nº 04'`
- Lines 14–19: Hardcoded `JEWELRY_CARDS`:
  1. `id: 1`, `video: 'https://www.w3schools.com/html/mov_bbb.mp4'`, `poster: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800'`, `title: 'Polki Diamonds'`, `no: 'Jº 01'`
  2. `id: 2`, `video: 'https://www.w3schools.com/html/mov_bbb.mp4'`, `poster: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800'`, `title: 'Ruby Choker'`, `no: 'Jº 02'`
  3. `id: 3`, `video: 'https://www.w3schools.com/html/mov_bbb.mp4'`, `poster: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800'`, `title: 'Emerald Cascade'`, `no: 'Jº 03'`
  4. `id: 4`, `video: 'https://www.w3schools.com/html/mov_bbb.mp4'`, `poster: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800'`, `title: 'Kundan Heritage'`, `no: 'Jº 04'`
- Line 48: Subtitle: `"Cinematic Archives"`
- Line 51: Heading: `isJewelry ? 'The High Jewels' : 'The Living Atelier'`
*Zero store integration currently exists.*

#### G. Story Epilogue (`src/components/StoryEpilogue.tsx`)
- Lines 51–54: Hardcoded philosophy quote:
  `"Preserving the royal threads of Rajasthan, one bespoke silhouette at a time."`
- Line 70: Signature title: `"The Master Artisans"`
- Line 75: Signature subtitle: `"Raani Closet Atelier"`
*Deficiency*: Does NOT read `storyHeading` or `storyText` from `useAdminStore`!

#### H. Luxury Footer (`src/components/LuxuryFooter.tsx`)
- Line 45: Eyebrow: `"The Digital Sanctuary"`
- Line 50: Heading: `"Imperial Concierge"`
- Lines 53–57: Paragraph:
  `"An exclusive enclave dedicated to the preservation of Indian royal heritage. From bespoke zardozi bridal trousseaus to archival polki jewelry, Raani Closet offers private commissions and digital styling engagements for the modern aristocrat."`
- Lines 64 & 74: Links: `"Salon Privé"`, `"Archival Jewels"`
- Line 90: Eyebrow: `"Pocket Atelier"`
- Line 94: Heading: `"Raani Couture App"`
- Lines 96–98: Description: `"Experience augmented 3D silhouette fitting, track handloom timelines, and connect instantly with your assigned master artisan."`
- Lines 106 & 109: Label: `"Download"`, `"Scan for private access"`
- Line 117: Eyebrow: `"Direct Channels"`
- Line 121: Heading: `"Atelier Directory"`
- Lines 128–130: Flagship Jaipur: `"Flagship (Jaipur)"`, `"Narain Niwas Palace Courtyard, C-Scheme, Rajasthan"`
- Lines 135–137: Salon Privé New Delhi: `"Salon Privé (New Delhi)"`, `"The Crescent at Qutab, Mehrauli Heritage Quarter"`
- Line 142: Phone: `"+91 141 256 7890"`
- Line 147: VIP WhatsApp Line (linked to `whatsappNumber`)
- Line 151: Email: `"concierge@raanicloset.com"` (Note: store has `care@raanicloset.com`)
- Line 175: Copyright: `"© 2026 Maison Raani. All Rights Reserved."`
- Lines 179–180: Links: `"Privacy"`, `"Terms"`

#### I. Search Overlay (`src/components/SearchOverlay.tsx`)
- Lines 12–13: Default trends:
  - Clothing: `["Bridal Lehenga", "Silk Kurti", "Chanderi Suit", "Velvet Anarkali", "Georgette Dupatta"]`
  - Jewelry: `["Kundan Choker", "Polki Haar", "Jadau Bangles", "Pearl Mathapatti", "Chandbali Earrings"]`
- Line 43–60: Hardcoded products (14 items) with prices.
- Lines 268 & 305: Hardcoded price rendering with currency symbol.
- Line 317: Empty state title: `"Nothing Found"`
- Line 318: Subtitle: `"Try a different keyword"`

#### J. Floating Concierge (`src/components/FloatingWhatsApp.tsx`)
- Line 26: Pre-filled WhatsApp message: `"Hello Raani Closet, I would like to speak with a Bespoke Concierge."`
- Line 42: Tooltip: `"Bespoke Concierge"`

#### K. Trousseau Page (`src/app/trousseau/page.tsx`)
- Line 49: Back button: `"Back to Shop"`
- Line 58: Eyebrow: `"Your Private Vault"`
- Lines 61–65: Title: `"The Trousseau"`
- Line 68: Subtitle: `"Curated heirlooms and bespoke pieces saved for your celebrations."`
- Line 100: Empty state heading: `"Your Trousseau Awaits Its First Masterpiece"`
- Line 102: Empty state description: `"Curate your dream ensemble for private styling consultations. Save the artisan crafts you cherish."`
- Line 108: Button: `"Explore Haute Couture"`
- Line 148: Action button: `"Reserve"`
- Line 159: Banner heading: `"Commission a Custom Look"`
- Line 161: Banner text: `"Love the embroidery of one piece but the silhouette of another? Send your curated Trousseau directly to our Master Stylists via WhatsApp for a bespoke consultation."`
- Line 170: Action button: `"Consult Stylist on WhatsApp"`

---

## 2. Logic Chain

1. **Premise**: The client requirement is an end-to-end luxury Admin Panel where the client can edit every piece of static text, image, and video across the entire storefront without code changes, and where no price code or price display exists.
2. **Observation 1 (State Disconnection)**: The storefront currently has 3 disparate hardcoded arrays for products (`src/components/ProductGrid.tsx`, `src/app/product/[id]/page.tsx`, and `src/components/SearchOverlay.tsx`). None of these three read from `useAdminStore.products`. When products are updated or added in the admin panel, the storefront does not reflect them.
3. **Observation 2 (Hero Section Variable Desynchronization)**: In `HeroSection.tsx`, lines 11–22, the component attempts to destructure `clothingHeroLine1`, `clothingHeroCursive`, `clothingHeroLine3`, and `clothingHeroButtonText`, but `useAdminStore.ts` only provides `clothingHeroTitle` and `clothingHeroSubtitle`. These values are `undefined`, causing the hero text animation to break or render blanks.
4. **Observation 3 (Product Detail Page Invalidation)**: In `src/app/product/[id]/page.tsx`, product details are looked up from the local `ALL_PRODUCTS` static constant (line 48). When a user navigates to `/product/c1`, it renders hardcoded fields. Any edits made via `EditableText` only mutate component local state (`setTitle`, `setDescription`, etc.) and disappear immediately upon page navigation or reload. Furthermore, "The Craft" section (materials, origin, care, and paragraph) are statically hardcoded and cannot be customized per product.
5. **Observation 4 (Price Violations)**: The client requested a display-only portfolio site with zero prices. `SearchOverlay.tsx` explicitly formats and prints prices with `₹` (lines 268 & 305). Hardcoded price numbers exist in `ProductGrid`, `ALL_PRODUCTS`, `useStore.ts`, and `admin/page.tsx`. These must be removed from the UI and schemas.
6. **Observation 5 (Copywriting & Tone Directive)**: In accordance with the user directive *"achha se bolna story achha se porper tarika se"*, the current placeholder story texts (such as `"A heritage woven through generations..."` and `"Book an appointment to create your own masterpiece."`) lack the evocative, high-luxury imperial heritage tone expected for Raani Closet. We need rich, poetic, royal default copy in the store.
7. **Conclusion**: To fulfill the requirements, `useAdminStore.ts` must be expanded into a unified, single source of truth containing all identified sections. `src/app/admin/page.tsx` must be refactored into a luxury, glassmorphic multi-tab dashboard with complete CRUD support for products and field editors for all sections. All storefront components must be connected to `useAdminStore`.

---

## 3. Caveats

1. **3D Assets & Models**: `public/models` directory was noted; Three.js is installed (`three`, `@react-three/fiber`). 3D models do not have text content to edit, but fallback textures are standard images.
2. **Local Storage Persistence**: `useAdminStore` uses Zustand's `persist` middleware with key `'raani-admin-store-v3'`. If users have old cached schemas in `localStorage`, a version bump or reset helper will ensure clean state migration.
3. **Price Removal in Checkout**: Cart and Wishlist items currently pass `price: number` to `WhatsAppCheckoutModal`. Since no prices should exist, total and item price lines in the WhatsApp message generator should be converted to item counts (e.g. `Quantity: 1`) and portfolio consultation inquiries without monetary totals.

---

## 4. Conclusion & Structured Field Inventory

### 4.1 Complete Field Inventory for `useAdminStore.ts`

To make the entire storefront client-editable, the following structured fields must exist in `AdminState`:

| Group | Field Name | Type | Storefront Usage | Current Default Value |
|---|---|---|---|---|
| **Global / Identity** | `brandName` | `string` | Navbar, Masthead, Footer | `"Raani Closet"` |
| | `brandSubtitleClothing` | `string` | Desktop Navbar | `"Boutique"` |
| | `brandSubtitleJewelry` | `string` | Desktop Navbar | `"High Jewels"` |
| | `whatsappNumber` | `string` | Bespoke, Cart, PDP, Float | `"919876543210"` |
| | `supportEmail` | `string` | Footer, Contact | `"care@raanicloset.com"` |
| | `conciergeEmail` | `string` | Luxury Footer | `"concierge@raanicloset.com"` |
| | `instagramUrl` | `string` | Admin, Footer | `"https://instagram.com"` |
| | `flagshipJaipurAddress` | `string` | Luxury Footer | `"Narain Niwas Palace Courtyard, C-Scheme, Rajasthan"` |
| | `salonDelhiAddress` | `string` | Luxury Footer | `"The Crescent at Qutab, Mehrauli Heritage Quarter"` |
| | `conciergePhone` | `string` | Luxury Footer | `"+91 141 256 7890"` |
| | `isEditMode` | `boolean` | Storefront In-place edit toggle | `false` |
| **Hero (Clothing)** | `clothingHeroBg` | `string` | Hero Background Image | `"/categories/party_wear.jpg"` or Pexels URL |
| | `clothingHeroLine1` | `string` | Line 1 Royal Font | `"Where Elegance"` |
| | `clothingHeroCursive` | `string` | Line 2 Painter Font | `"Meets Heritage"` |
| | `clothingHeroLine3` | `string` | Line 3 Royal Font | `"In Every Thread"` |
| | `clothingHeroSubtext` | `string` | Line 4 Subtext | `"Building Communities. Not Just Clients."` |
| | `clothingHeroButtonText`| `string` | Hero CTA Button | `"Commission Bespoke"` |
| **Hero (Jewelry)** | `jewelryHeroBg` | `string` | Hero Background Video | `"https://assets.mixkit.co/videos/preview/mixkit-sparkling-jewelry-on-a-black-background-34354-large.mp4"` |
| | `jewelryHeroLine1` | `string` | Line 1 Royal Font | `"High Jewels"` |
| | `jewelryHeroCursive` | `string` | Line 2 Painter Font | `"The Art of Adornment"` |
| | `jewelryHeroLine3` | `string` | Line 3 Royal Font | `"Imperial Grandeur"` |
| | `jewelryHeroSubtext` | `string` | Line 4 Subtext | `"Handcrafted in 22K Gold & Uncut Polki"` |
| | `jewelryHeroButtonText`| `string` | Hero CTA Button | `"Explore Vault"` |
| **Categories** | `clothingCategoriesTitle`| `string` | Category Section Header | `"Suits & Couture"` |
| | `clothingCategories` | `CategoryItem[]`| Carousel & Collection Header | 3 items: Simple Suits, Party Wear, Kurtis |
| | `jewelryCategoriesTitle`| `string` | Category Section Header | `"Jewels & Heirlooms"` |
| | `jewelryCategories` | `CategoryItem[]`| Carousel & Collection Header | 3 items: Polki Sets, Diamond Chokers, Kundan Heritage |
| **Bespoke Atelier** | `bespokeEyebrow` | `string` | Eyebrow above title | `"The Atelier"` |
| | `bespokeHeading` | `string` | Main Banner Title | `"Bespoke Tailoring & Haute Couture"` |
| | `bespokeSubtitle` | `string` | Italic Subtitle | `"Commission Your Heirloom Masterpiece"` |
| | `bespokeText` | `string` | Story description | `"Where your imagination meets the timeless precision of master Rajasthani zardozi artisans."` |
| | `bespokeBgImage` | `string` | Banner Background Image | `"/bespoke_bg.jpg"` |
| | `bespokeButtonText` | `string` | Action Button | `"Begin Your Journey"` |
| **Video Archives** | `videoArchiveEyebrow`| `string` | Eyebrow | `"Cinematic Archives"` |
| | `videoArchiveHeading`| `string` | Section Heading | `"The Living Atelier"` |
| | `clothingVideos` | `VideoCard[]` | Video Carousel Cards | 4 items: Royal Drape, Mastercraft Zardozi, Heirloom Trousseau, Loom Heritage |
| | `jewelryVideos` | `VideoCard[]` | Video Carousel Cards | 4 items: Polki Diamonds, Ruby Choker, Emerald Cascade, Kundan Heritage |
| **Story Epilogue** | `storyQuote` | `string` | Main Philosophy Quote | `"Preserving the royal threads of Rajasthan, one bespoke silhouette at a time."` |
| | `storySignature` | `string` | Painter Script Signature | `"The Master Artisans"` |
| | `storySubSignature` | `string` | Atelier Tagline | `"Raani Closet Atelier"` |
| | `storyFullText` | `string` | Long-form Story/Heritage | World-Class Luxury Boutique Copy (see 4.2) |
| **Products (Full CRUD)**| `products` | `Product[]` | Storefront Grid, PDP, Search | 14 Complete Products (8 Clothing, 6 Jewelry) |

---

### 4.2 Enhanced Luxury Heritage Story Copy (Fulfilling *"achha se bolna story achha se porper tarika se"*)

```markdown
"Rooted in the royal courtyards of Jaipur and the historic weaving clusters of Chanderi, 
Raani Closet was born from an unwavering devotion to imperial craftsmanship. 
We do not merely tailor garments or set stones; we resurrect ancestral art forms. 
Every gold zari thread is guided by hand, every uncut polki diamond is placed with meditative precision, 
and every silhouette is cut to bestow grace upon the modern aristocrat. 
Raani Closet is an intimate sanctuary of quiet luxury, where heritage is not remembered—it is lived."
```

---

### 4.3 Comprehensive Product Schema for Display-Only Portfolio
Each `Product` in `useAdminStore` must include all PDP attributes:
```ts
export interface Product {
  id: string;
  title: string;
  category: string;
  type: 'clothing' | 'jewelry';
  imageSrc: string;
  images: string[]; // up to 3 gallery images for FloatingImageGallery
  description: string;
  // PDP "The Craft" Details
  craftTitle?: string;       // e.g. "The Craft"
  craftSubtitle?: string;    // e.g. "Hand-Loomed Texture" or "Master Crafted Detail"
  craftStory?: string;       // Rich paragraph on craftsmanship
  material?: string;         // e.g. "Pure Chanderi Silk & Real Zari"
  origin?: string;           // e.g. "Chanderi, Madhya Pradesh"
  care?: string;             // e.g. "Dry Clean Only / Preserve in Muslin"
}
```
*Note: Notice `price` is intentionally omitted from the schema!*

---

## 5. Verification Method

To verify these observations and validate downstream implementations:

1. **Verify Price Cleanliness**:
   ```powershell
   git grep -n -i "price" src/
   ```
   *Expected condition after Phase 1*: 0 occurrences in `SearchOverlay.tsx`, `useAdminStore.ts`, `ProductGrid.tsx`, and `product/[id]/page.tsx`.
2. **Verify Hero Section Synchronization**:
   Inspect `src/components/HeroSection.tsx` and ensure all destructured variables match `src/store/useAdminStore.ts`.
3. **Verify Product Catalog Synchronization**:
   Check `src/components/ProductGrid.tsx`, `src/app/product/[id]/page.tsx`, and `src/components/SearchOverlay.tsx`. Verify they import `useAdminStore` and read `state.products` instead of hardcoded `ALL_PRODUCTS` or `CLOTHING_PRODUCTS`.
4. **Verify Dynamic PDP Rendering**:
   Navigate to `http://localhost:3001/product/c1`. Ensure title, category, description, gallery images, craft paragraph, and specs table are rendered dynamically from `useAdminStore.products.find(p => p.id === 'c1')`.
5. **Verify Admin Dashboard Navigation**:
   Navigate to `http://localhost:3001/admin`. Verify that:
   - All 5 tabs (`Dashboard`, `Products`, `Categories`, `Storefront Content`, `Settings`) render.
   - Products tab lists all products from `useAdminStore` without prices.
   - "Add Product" and "Edit Product" open modals/forms that save directly to Zustand store.
   - Updating any text or image in admin immediately reflects on `http://localhost:3001/` and `http://localhost:3001/product/[id]`.
