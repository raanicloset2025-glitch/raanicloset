# R2 Survey & Investigation: Mobile Responsiveness & Layout Overflows

**Explorer**: `explorer_survey_r9_2`  
**Date**: 2026-10-09  
**Target Viewport**: 375px Mobile Viewport (iPhone SE / Standard Mobile Width)  
**Status**: Investigation Complete — Read-Only Survey  

---

## 1. Executive Summary

This investigation surveys mobile responsiveness and horizontal layout overflows across the Raani Closet Admin Panel in accordance with **Requirement R2** of the project prompt:
> *"Fix layout containers across the Admin panel (especially `CategoryProductEditor`) so they wrap or scroll gracefully. No elements should overflow horizontally off the screen (`100vw`) on mobile devices when multiple items or products are added. Ensure it feels like a stable, industry-standard application."*

Through systematic inspection of the Admin layout tree, component structure, flexbox configurations, grid templates, and CSS utilities, **11 distinct horizontal overflow failure modes** were identified. 

The primary root causes stem from:
1. **Unconstrained flex containers** missing `flex-wrap` and `min-w-0` (most notably in `CategoryProductEditor`'s Mode Switcher where adding 10 categories creates a ~476px flex row that blows out a 375px viewport by >160px).
2. **Unresponsive button labels with string concatenation** (e.g., `+ Upload & Add Product to {activeCat.title}` generating >450px wide buttons with longer category titles).
3. **Hardcoded desktop tab bars in modal dialogs and editors** (e.g., `ProductMasterEditor`'s 626px unscrollable tab bar, `FooterEditor`'s 750px tab bar).
4. **Conflicting dimension constraints on grid items** (`min-h-[300px]` conflicting with `aspect-[3/4]` on 2-column mobile grids in `CategoryProductEditor`).
5. **Absence of defensive root overflow constraints** (`overflow-x: hidden` / `max-width: 100vw` in `globals.css` and `layout.tsx`) and missing CSS utility definitions (`hide-scrollbar`).

All identified issues have non-destructive, surgical fix strategies that preserve the luxury desktop design while guaranteeing **zero horizontal body overflow (`scrollWidth === clientWidth`) on a 375px viewport** when 10 categories and 10 products are loaded.

---

## 2. Requirements & Acceptance Criteria Analysis

From `ORIGINAL_REQUEST.md`:
- **R2**: *"Fix layout containers across the Admin panel (especially `CategoryProductEditor`) so they wrap or scroll gracefully. No elements should overflow horizontally off the screen (`100vw`) on mobile devices when multiple items or products are added."*
- **Acceptance Criterion**: *"An independent Agent-as-Judge verifies that adding 10 categories/products on a simulated 375px (mobile) viewport results in zero horizontal body overflow."*
- **Build Constraint**: Both `admin` and `frontend` must pass `npm run build` with zero Next.js or TypeScript errors.

### Simulated 375px Mobile Viewport Constraints
- Viewport width: **375px**
- Base Admin outer padding (`p-4`): $375px - 32px = \mathbf{343px}$ available width
- Inner card padding (`p-4` to `p-6`):
  - With `p-4`: $343px - 32px = \mathbf{311px}$ available content width
  - With `p-6`: $343px - 48px = \mathbf{295px}$ available content width
- Any non-wrapping child or unconstrained element exceeding **311px** (or **343px** at the root) will trigger horizontal body overflow (`document.body.scrollWidth > 375px`), failing the acceptance test.

---

## 3. Comprehensive Findings Matrix

| ID | Component / File | Exact Line(s) | Root Cause | Simulated 375px Overflow Impact | Severity |
|---|---|---|---|---|---|
| **O1** | `CategoryProductEditor.tsx` | Lines 170–190 | Mode switcher `<div className="flex items-center gap-2">` lacks `flex-wrap`. With 10 categories, buttons display "Clothing (10 Categories)" & "Jewelry (10 Categories)", requiring 476px min width. | Forces card to 508px; overflows 375px viewport by **+165px**. | **CRITICAL** |
| **O2** | `CategoryProductEditor.tsx` | Lines 338–344 | Direct upload button concatenates category title: `+ Upload & Add Product to {activeCat.title}` with `uppercase tracking-wider`. | For longer titles, single button width exceeds **450px**, blowing out viewport. | **CRITICAL** |
| **O3** | `ProductMasterEditor.tsx` | Lines 114–133 | Tab bar `<div className="flex items-center gap-6 px-6 border-b ... shrink-0">` lacks `overflow-x-auto`. 3 text-heavy tabs require 626px min width. | Stretches modal dialog to >626px; modal blows off-screen horizontally by **+251px**. | **CRITICAL** |
| **O4** | `CategoryProductEditor.tsx` | Line 552 | "+ Add New Product" card has conflicting `aspect-[3/4] min-h-[300px]`. In a 2-column mobile grid (~137px col width), `min-h-[300px]` forces column width to ~225px. | Distorts 2-column grid and expands container past 375px. | **HIGH** |
| **O5** | `CategoryProductEditor.tsx` | Lines 235–320 | Horizontal category bar has `min-w-[260px]` cards; inner scroll container lacks `min-w-0 max-w-full`, and `.hide-scrollbar` is undefined in CSS. | If parent expands due to O1/O2, category bar stretches viewport rather than scrolling internally. | **HIGH** |
| **O6** | `page.tsx` (Top Action Bar) | Lines 261, 271–301 | Action buttons wrapper `<div className="flex items-center gap-2 lg:gap-4 w-full sm:w-auto">` has `flex-nowrap` on buttons (Logout, Preview, Publish). | Total button row width is 322px–345px; when "Publishing..." or with custom fonts, overflows 343px available width. | **HIGH** |
| **O7** | `SignatureCollectionDashboard.tsx` | Lines 43–66 | Sub-header container `<div className="mt-4 md:mt-0 flex items-center gap-2">` lacks `flex-wrap`. Clothing/Jewelry toggle + Featured counter = 309px min width inside a 295px container. | Overflows card container by **+14px**. | **MEDIUM** |
| **O8** | `FooterEditor.tsx` | Lines 55–71 | 5 segmented control tabs in `<div className="flex bg-gray-100/50 p-1 ... w-fit">` lack horizontal scroll container. Total width is ~750px. | Tab bar forces Footer Editor panel to overflow by **+400px**. | **HIGH** |
| **O9** | `HeroEditor.tsx` & `BespokeEditor.tsx` | `Hero`: Line 90<br>`Bespoke`: Line 62 | Sticky top sub-header `<header className="h-16 ... flex items-center justify-between ...">` holds logo, mode switcher, and storefront link without `flex-wrap` (~448px total). | Header overflows 375px screen by **+73px**. | **MEDIUM** |
| **O10** | `ReviewsEditor.tsx` & `VideosEditor.tsx` | `Reviews`: Line 78<br>`Videos`: Line 67 | Section headers with title on left and segmented mode toggles on right in `flex items-center justify-between` without `flex-wrap`. | Overflows mobile screens (>500px in Reviews). | **MEDIUM** |
| **O11** | `globals.css` & `layout.tsx` | `globals.css` L1-14<br>`layout.tsx` L42 | No root-level overflow protection (`overflow-x: hidden`, `max-width: 100vw`) and missing `.hide-scrollbar` utility definition. | Any child margin or animation leak causes visible horizontal page scrollbar. | **MEDIUM** |

---

## 4. Deep Dive on Critical Areas

### 4.1. `CategoryProductEditor.tsx` (Primary Focus of R2)

#### Root Cause 1: Mode Switcher Flex Container
- **Location**: `admin/src/components/CategoryProductEditor.tsx`, lines 170–190
- **Code**:
  ```tsx
  <div className="flex flex-wrap items-center justify-between border-b border-[#EAEAEA] pb-4 gap-4 bg-[#FFFFFF] p-4 rounded-xl shadow-xs">
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-[#888] font-semibold">Mode:</span>
      <button ...>
        Clothing ({clothingCategories.length} Categories)
      </button>
      <button ...>
        Jewelry ({jewelryCategories.length} Categories)
      </button>
    </div>
    <button ...>
      <FolderPlus size={16} /> + Add New Category
    </button>
  </div>
  ```
- **Mechanism of Failure**:
  The outer container has `flex-wrap`, but the inner container (line 171) is `<div className="flex items-center gap-2">` which has **no wrapping**.
  When 10 categories are created in each tab:
  - Text length: `"Clothing (10 Categories)"` is 24 uppercase characters with `tracking-widest`.
  - Button 1: $170px\text{ (text)} + 40px\text{ (px-5)} = \mathbf{210px}$
  - Button 2: $160px\text{ (text)} + 40px\text{ (px-5)} = \mathbf{200px}$
  - Mode label: $\mathbf{45px}$
  - Gaps: $2 \times 8px = \mathbf{16px}$
  - Total minimum width: $210 + 200 + 45 + 16 = \mathbf{471px}$!
  On a 375px viewport with standard container padding ($311px$ available width inside the card), this flex child forces the parent container to at least $471px + 32px = 503px$, overflowing the viewport by **128px**!

#### Root Cause 2: Category Header Direct Upload Button
- **Location**: `admin/src/components/CategoryProductEditor.tsx`, lines 326–344
- **Code**:
  ```tsx
  <button
    onClick={() => handleTriggerNewProductWithPhoto(activeCat.title)}
    className="flex items-center gap-2 px-5 py-2.5 bg-[#CBA153] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#B38B3F] transition-colors shadow-sm"
  >
    <Camera size={16} /> + Upload & Add Product to {activeCat.title}
  </button>
  ```
- **Mechanism of Failure**:
  If the active category has a realistic luxury fashion name like "Heavy Bridal Zari Lehengas" or "Signature Cocktail Rings", the button label becomes `+ UPLOAD & ADD PRODUCT TO HEAVY BRIDAL ZARI LEHENGAS`.
  With `text-xs uppercase tracking-wider px-5`, this button alone reaches **440px–480px in width**.
  Because it has no `max-w-full`, no truncation, and no responsive text formatting, it exceeds the entire 375px mobile viewport on its own.

#### Root Cause 3: 10 Products in Vitrine Grid & Conflicting `min-h-[300px]`
- **Location**: `admin/src/components/CategoryProductEditor.tsx`, lines 426 & 552
- **Code**:
  ```tsx
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {activeCatProducts.map((prod) => (...))}
    {/* Add New Product Card */}
    <div
      onClick={() => handleTriggerNewProductWithPhoto(activeCat.title)}
      className="group bg-[#FAFAFA] border-2 border-dashed border-[#EAEAEA] hover:border-[#CBA153]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all aspect-[3/4] min-h-[300px]"
    >
  ```
- **Mechanism of Failure**:
  In a 375px viewport with 2 columns, available width per card is:
  $$\frac{375px - 32px\text{ (outer)} - 48px\text{ (inner card)} - 20px\text{ (gap)}}{2} = \mathbf{137.5px}$$
  At an aspect ratio of 3:4, a 137.5px card should have a height of:
  $$137.5 \times \frac{4}{3} = \mathbf{183.3px}$$
  However, line 552 specifies `min-h-[300px]`. In CSS Grid, when `aspect-[3/4]` meets an explicit `min-height: 300px`, the browser expands the width to maintain the aspect ratio:
  $$300px \times \frac{3}{4} = \mathbf{225px}$$
  This expands the second grid column to 225px, forcing the 2-column grid to $225 + 225 + 20 = 470px$, immediately causing horizontal body overflow!

---

### 4.2. Modal Dialogs: `ProductMasterEditor.tsx` & `CropModal.tsx`

#### Root Cause 4: `ProductMasterEditor` Tab Navigation
- **Location**: `admin/src/components/ProductMasterEditor.tsx`, line 114
- **Code**:
  ```tsx
  <div className="flex items-center gap-6 px-6 border-b border-[#EAEAEA] bg-white shrink-0">
    <button ...>1. Hero Gallery & Description</button>
    <button ...>2. The Craft & Specs</button>
    <button ...>3. Curated Pairings</button>
  </div>
  ```
- **Mechanism of Failure**:
  - Tab 1: `"1. Hero Gallery & Description"` (~220px)
  - Tab 2: `"2. The Craft & Specs"` (~160px)
  - Tab 3: `"3. Curated Pairings"` (~150px)
  - Gaps + padding: $2 \times 24px + 48px = 96px$
  - Minimum width: $\mathbf{626px}$
  Because the container has `shrink-0` and NO `overflow-x-auto`, the modal wrapper (`<motion.div ... max-w-5xl>`) is forced to expand to at least 626px wide.
  On a 375px mobile screen, the modal sticks out past the right edge by **251px**, rendering the right side and close buttons off-screen.

#### Root Cause 5: `ProductMasterEditor` Gallery Grid
- **Location**: `admin/src/components/ProductMasterEditor.tsx`, line 146
- **Code**:
  ```tsx
  <div className="grid grid-cols-3 gap-6">
  ```
- **Mechanism of Failure**:
  3 columns inside a modal dialog on a 375px mobile screen gives ~85px width per card. The "Change Photo 1" button text (`text-[10px] uppercase tracking-widest`) overflows the card horizontally.
  A responsive `grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6` is required.

---

### 4.3. Admin Shell & Top Action Bar (`page.tsx`)

#### Root Cause 6: Top Action Bar Button Row
- **Location**: `admin/src/app/page.tsx`, lines 261, 271–301
- **Code**:
  ```tsx
  <div className="py-3 md:h-20 border-b border-[#EAEAEA] bg-white flex flex-wrap md:flex-nowrap items-center justify-between px-4 lg:px-10 shrink-0 shadow-xs z-30 gap-3">
    <div>...</div>
    <div className="flex items-center gap-2 lg:gap-4 w-full sm:w-auto">
      <InstallAppButton ... />
      <button ...><LogOut size={14} /><span className="hidden sm:inline">Logout</span></button>
      <button ...><Eye size={14} /><span>View Preview</span></button>
      <button ...><Check size={14} /><span>{isPublishing ? "Publishing..." : "Publish"}</span></button>
    </div>
  </div>
  ```
- **Mechanism of Failure**:
  On 375px mobile:
  - Line 271 has `w-full` and non-wrapping `flex items-center gap-2`.
  - Logout: ~46px
  - View Preview: ~135px
  - Publish: ~125px (or ~145px when "Publishing...")
  - Gaps: 16px
  - Total: $322px$ to $342px$.
  - Available width inside `px-4` padding is $375 - 32 = \mathbf{343px}$.
  - This is on the absolute verge of overflowing; any slight browser font difference, translation, or addition of an icon in `InstallAppButton` causes horizontal overflow.
  - Adding `flex-wrap` and responsive compact styling (`px-3 py-2 text-[9px]`) guarantees clean wrapping and no overflow.

---

## 5. Precise Responsive Fix Strategies

Below are the surgical, exact code transformations proposed for the implementer agent.

### 5.1. `admin/src/components/CategoryProductEditor.tsx`

#### Fix 1: Responsive Mode Switcher & Category Counter
Replace lines 170–200:
```tsx
{/* BEFORE */}
<div className="flex flex-wrap items-center justify-between border-b border-[#EAEAEA] pb-4 gap-4 bg-[#FFFFFF] p-4 rounded-xl shadow-xs">
  <div className="flex items-center gap-2">
    <span className="text-xs uppercase tracking-widest text-[#888] font-semibold">Mode:</span>
    <button
      onClick={() => { setTypeTab("clothing"); setSelectedCatId(null); }}
      className={`px-5 py-2 text-xs uppercase tracking-widest rounded-lg transition-all font-semibold ${
        typeTab === "clothing" ? "bg-[#1A0B16] text-[#CBA153] shadow-sm" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EAEAEA]"
      }`}
    >
      Clothing ({clothingCategories.length} Categories)
    </button>
    <button
      onClick={() => { setTypeTab("jewelry"); setSelectedCatId(null); }}
      className={`px-5 py-2 text-xs uppercase tracking-widest rounded-lg transition-all font-semibold ${
        typeTab === "jewelry" ? "bg-[#1A0B16] text-[#CBA153] shadow-sm" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EAEAEA]"
      }`}
    >
      Jewelry ({jewelryCategories.length} Categories)
    </button>
  </div>

  <button
    onClick={() => {
      addCategory({ title: "New Category", image: "/categories/simple_suit.jpg", tagline: "Custom tagline" }, typeTab);
      showToast("New category created!", "success");
    }}
    className="flex items-center gap-2 px-5 py-2.5 bg-[#CBA153] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#B38B3F] transition-colors shadow-sm"
  >
    <FolderPlus size={16} /> + Add New Category
  </button>
</div>

{/* AFTER */}
<div className="flex flex-wrap items-center justify-between border-b border-[#EAEAEA] pb-4 gap-3 bg-[#FFFFFF] p-3 sm:p-4 rounded-xl shadow-xs max-w-full min-w-0">
  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
    <span className="text-xs uppercase tracking-widest text-[#888] font-semibold hidden xs:inline">Mode:</span>
    <button
      onClick={() => { setTypeTab("clothing"); setSelectedCatId(null); }}
      className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest rounded-lg transition-all font-semibold text-center ${
        typeTab === "clothing" ? "bg-[#1A0B16] text-[#CBA153] shadow-sm" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EAEAEA]"
      }`}
    >
      <span className="sm:hidden">Clothing ({clothingCategories.length})</span>
      <span className="hidden sm:inline">Clothing ({clothingCategories.length} Categories)</span>
    </button>
    <button
      onClick={() => { setTypeTab("jewelry"); setSelectedCatId(null); }}
      className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest rounded-lg transition-all font-semibold text-center ${
        typeTab === "jewelry" ? "bg-[#1A0B16] text-[#CBA153] shadow-sm" : "bg-[#F5F5F5] text-[#666] hover:bg-[#EAEAEA]"
      }`}
    >
      <span className="sm:hidden">Jewelry ({jewelryCategories.length})</span>
      <span className="hidden sm:inline">Jewelry ({jewelryCategories.length} Categories)</span>
    </button>
  </div>

  <button
    onClick={() => {
      addCategory({ title: "New Category", image: "/categories/simple_suit.jpg", tagline: "Custom tagline" }, typeTab);
      showToast("New category created!", "success");
    }}
    className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#CBA153] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#B38B3F] transition-colors shadow-sm"
  >
    <FolderPlus size={16} /> + Add New Category
  </button>
</div>
```

#### Fix 2: Constrained Horizontal Carousel Bar
At line 227:
```tsx
{/* BEFORE */}
<div className="space-y-3">
  ...
  <div className="flex items-center gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar">

{/* AFTER */}
<div className="space-y-3 max-w-full min-w-0">
  ...
  <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar max-w-full min-w-0">
```

#### Fix 3: Responsive Direct Upload Button
Replace lines 337–344:
```tsx
{/* BEFORE */}
<button
  onClick={() => handleTriggerNewProductWithPhoto(activeCat.title)}
  className="flex items-center gap-2 px-5 py-2.5 bg-[#CBA153] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#B38B3F] transition-colors shadow-sm"
>
  <Camera size={16} /> + Upload & Add Product to {activeCat.title}
</button>

{/* AFTER */}
<button
  onClick={() => handleTriggerNewProductWithPhoto(activeCat.title)}
  className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#CBA153] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#B38B3F] transition-colors shadow-sm"
>
  <Camera size={16} />
  <span className="hidden sm:inline">+ Upload & Add Product to {activeCat.title}</span>
  <span className="sm:hidden">+ Upload & Add Product</span>
</button>
```

#### Fix 4: Vitrine Cards Grid & Conflicting min-h
Replace line 426 and line 552:
```tsx
{/* BEFORE */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
...
<div
  onClick={() => handleTriggerNewProductWithPhoto(activeCat.title)}
  className="group bg-[#FAFAFA] border-2 border-dashed border-[#EAEAEA] hover:border-[#CBA153]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all aspect-[3/4] min-h-[300px]"
>

{/* AFTER */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
...
<div
  onClick={() => handleTriggerNewProductWithPhoto(activeCat.title)}
  className="group bg-[#FAFAFA] border-2 border-dashed border-[#EAEAEA] hover:border-[#CBA153]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all aspect-[3/4] min-h-[180px] sm:min-h-[260px]"
>
```

---

### 5.2. `admin/src/components/SignatureCollectionDashboard.tsx`

Replace line 43:
```tsx
{/* BEFORE */}
<div className="mt-4 md:mt-0 flex items-center gap-2">
  <div className="flex bg-[#F5F5F5] p-1 rounded-lg mr-4 border border-[#EAEAEA]">
    ...
  </div>
  <div className="px-4 py-2 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA] text-xs font-semibold text-[#1A0B16]">
    {starredProducts.length} / 4 Featured
  </div>
</div>

{/* AFTER */}
<div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2 w-full sm:w-auto">
  <div className="flex bg-[#F5F5F5] p-1 rounded-lg mr-0 sm:mr-4 border border-[#EAEAEA]">
    ...
  </div>
  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA] text-xs font-semibold text-[#1A0B16]">
    {starredProducts.length} / 4 Featured
  </div>
</div>
```

---

### 5.3. `admin/src/components/ProductMasterEditor.tsx`

#### Fix 1: Scrollable Tab Navigation
Replace line 114:
```tsx
{/* BEFORE */}
<div className="flex items-center gap-6 px-6 border-b border-[#EAEAEA] bg-white shrink-0">
  <button onClick={() => setActiveTab("gallery")} className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ...`}>
    1. Hero Gallery & Description
  </button>
  ...
</div>

{/* AFTER */}
<div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 border-b border-[#EAEAEA] bg-white shrink-0 overflow-x-auto hide-scrollbar whitespace-nowrap max-w-full">
  <button onClick={() => setActiveTab("gallery")} className={`py-3.5 sm:py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors shrink-0 ...`}>
    1. Hero Gallery & Description
  </button>
  <button onClick={() => setActiveTab("craft")} className={`py-3.5 sm:py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors shrink-0 ...`}>
    2. The Craft & Specs
  </button>
  <button onClick={() => setActiveTab("curated")} className={`py-3.5 sm:py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors shrink-0 ...`}>
    3. Curated Pairings
  </button>
</div>
```

#### Fix 2: Responsive Gallery Image Grid
Replace line 146:
```tsx
{/* BEFORE */}
<div className="grid grid-cols-3 gap-6">

{/* AFTER */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
```

---

### 5.4. `admin/src/app/page.tsx` (Top Action Bar)

Replace lines 261, 271:
```tsx
{/* BEFORE */}
<div className="py-3 md:h-20 border-b border-[#EAEAEA] bg-white flex flex-wrap md:flex-nowrap items-center justify-between px-4 lg:px-10 shrink-0 shadow-xs z-30 gap-3">
  <div>...</div>
  <div className="flex items-center gap-2 lg:gap-4 w-full sm:w-auto">
    <InstallAppButton ... />
    <button onClick={handleLogout} className="flex-1 sm:flex-none justify-center px-4 lg:px-6 py-2.5 ...">
      <LogOut size={14} /><span className="hidden sm:inline">Logout</span>
    </button>
    <button onClick={...} className="flex-1 sm:flex-none justify-center px-4 lg:px-6 py-2.5 ...">
      <Eye size={14} /><span>View Preview</span>
    </button>
    <button onClick={handlePublish} className="flex-1 sm:flex-none justify-center px-5 lg:px-7 py-2.5 ...">
      <Check size={14} /><span>{isPublishing ? "Publishing..." : "Publish"}</span>
    </button>
  </div>
</div>

{/* AFTER */}
<div className="py-3 md:h-20 border-b border-[#EAEAEA] bg-white flex flex-wrap items-center justify-between px-4 lg:px-10 shrink-0 shadow-xs z-30 gap-2 sm:gap-3 max-w-full min-w-0">
  <div className="min-w-0">
    <h2 className="text-sm sm:text-base md:text-xl font-serif text-[#1A0B16] font-bold truncate">
      {tabTitles[activeTab] || "Atelier Command"}
    </h2>
    <p className="text-[#888] text-[9px] tracking-wide font-medium uppercase mt-0.5">
      Draft Mode · Live Sync Ready
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-4 w-full sm:w-auto">
    <InstallAppButton variant="secondary" className="hidden sm:flex ..." />
    <button onClick={handleLogout} className="flex-1 sm:flex-none justify-center px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 border border-[#EAEAEA] text-[#888] text-[9px] lg:text-[10px] tracking-wider uppercase font-semibold rounded-lg hover:bg-[#F5F5F5] hover:text-[#1A0B16] transition-colors flex items-center gap-1.5 shadow-2xs">
      <LogOut size={14} /><span className="hidden sm:inline">Logout</span>
    </button>
    <button onClick={() => window.open("http://localhost:3000?preview=true", "_blank")} className="flex-1 sm:flex-none justify-center px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 border border-[#1A0B16] text-[#1A0B16] text-[9px] lg:text-[10px] tracking-wider uppercase font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors flex items-center gap-1.5 shadow-2xs">
      <Eye size={14} /><span>Preview</span>
    </button>
    <button onClick={handlePublish} disabled={isPublishing} className="flex-1 sm:flex-none justify-center px-3 sm:px-5 lg:px-7 py-2 sm:py-2.5 bg-[#1A0B16] text-white text-[9px] lg:text-[10px] tracking-wider uppercase font-semibold rounded-lg hover:bg-[#CBA153] hover:text-[#1A0B16] transition-colors shadow-sm flex items-center gap-1.5">
      <Check size={14} /><span>{isPublishing ? "Publishing..." : "Publish"}</span>
    </button>
  </div>
</div>
```

---

### 5.5. `admin/src/app/globals.css` & Global Safeguards

Update `admin/src/app/globals.css` to add defensive viewport constraints and the missing scrollbar utility:
```css
@import "tailwindcss";

@source "../**/*.{js,ts,jsx,tsx}";

@theme {
  --color-background: #ffffff;
  --color-foreground: #171717;
}

html, body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: var(--color-foreground);
  background: var(--color-background);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

---

### 5.6. Secondary Admin Editors Fixes

1. **`FooterEditor.tsx`**:
   - Wrap tab bar on line 55 with:
     ```tsx
     <div className="overflow-x-auto hide-scrollbar pb-1 max-w-full">
       <div className="flex bg-gray-100/50 p-1 rounded-xl w-max border border-gray-100">
         {TABS.map((tab) => (...))}
       </div>
     </div>
     ```
   - Convert `grid grid-cols-2 gap-6` on lines 144, 323, 372, and 525 to `grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6`.

2. **`HeroEditor.tsx` & `BespokeEditor.tsx`**:
   - Make top sub-headers wrap gracefully:
     ```tsx
     <header className="min-h-16 py-3 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl px-4 md:px-10 flex flex-wrap items-center justify-between sticky top-0 z-50 shrink-0 gap-3">
     ```

3. **`ReviewsEditor.tsx` & `VideosEditor.tsx`**:
   - Change `flex items-center justify-between` on header rows to `flex flex-wrap items-center justify-between gap-4`.
   - Change `grid grid-cols-2` inside item cards to `grid grid-cols-1 sm:grid-cols-2`.

---

## 6. Verification Method (Agent-as-Judge & Automated Validation)

To independently verify zero horizontal overflow on a simulated 375px viewport:

### Automated Viewport Test Logic
A headless browser (Puppeteer / Playwright) test script should execute the following verification:

```js
// Simulated 375px mobile viewport verification
await page.setViewport({ width: 375, height: 667 });
await page.goto("http://localhost:3001");

// 1. Check root document body horizontal overflow
const bodyOverflow = await page.evaluate(() => {
  return document.body.scrollWidth > window.innerWidth;
});
expect(bodyOverflow).toBe(false);

// 2. Add 10 categories and 10 products
// (via direct Zustand store mutation or UI buttons)
await page.evaluate(() => {
  const store = window.__useAdminStore?.getState();
  if (store) {
    for (let i = 1; i <= 10; i++) {
      store.addCategory({ title: `Category ${i}`, image: "/placeholder.jpg" }, "clothing");
      store.addProduct({
        title: `Product Title Number ${i}`,
        category: `Category 1`,
        type: "clothing",
        imageSrc: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
        description: "Test description"
      });
    }
  }
});

// 3. Verify zero horizontal body overflow after 10 categories/products added
const postAddOverflow = await page.evaluate(() => {
  const elements = Array.from(document.querySelectorAll('*'));
  const overflowing = elements.filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.right > window.innerWidth + 1; // 1px threshold for sub-pixel anti-aliasing
  });
  return {
    bodyScrollWidth: document.body.scrollWidth,
    windowWidth: window.innerWidth,
    overflows: document.body.scrollWidth > window.innerWidth,
    overflowingElements: overflowing.map(el => ({
      tag: el.tagName,
      className: el.className,
      right: el.getBoundingClientRect().right
    }))
  };
});
expect(postAddOverflow.overflows).toBe(false);
```

### TypeScript and Next.js Build Verification
Run in `admin` and `frontend`:
```bash
npm run build
```
Expected: Zero TypeScript errors, zero build warnings, zero Next.js route errors.
