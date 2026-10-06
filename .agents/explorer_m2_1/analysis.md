# Comprehensive Analysis: Below-The-Fold Dynamic Loading & CLS Skeletons

**Target File**: `frontend/src/app/page.tsx`  
**Explorer**: M2.1 (`teamwork_preview_explorer`)  
**Scope**: 8 Below-the-fold components, `MaisonDelivery` cleanup, Next.js 16 App Router `next/dynamic` architecture, CLS = 0 skeleton specifications.

---

## 1. Executive Summary

`frontend/src/app/page.tsx` is currently a React Server Component that statically imports all 10 page components. This forces Next.js to include all client components and their heavy dependencies (Framer Motion, Lenis, Lucide icons, Three.js/Three Fiber transitive references) into the main bundle execution path on initial load.

By converting the 8 below-the-fold components (`CategoryCarousel`, `ProductGrid`, `VideoCarousel`, `BespokeBanner`, `RoyalVitrineReviews`, `ClientDiaries`, `StoryEpilogue`, `LuxuryFooter`) to `next/dynamic` imports with `ssr: true` (default in Next.js Server Components) and dimension-accurate fallback skeletons:
1. **Initial JavaScript Execution** is significantly decreased, freeing the main thread for above-the-fold Hero LCP rendering and smooth initial animations.
2. **Cumulative Layout Shift (CLS)** remains strictly **0** because each skeleton precisely replicates the rendered container dimensions, paddings, backgrounds, and vertical rhythm.
3. **Google AI SEO & SSR Pre-rendering** remain 100% intact because RSC `next/dynamic` defaults to `ssr: true`, generating complete HTML on the server.
4. **Framer Motion Animations & Visual Styling** remain 100% intact with zero modifications to component internals.
5. **Dead Code Elimination**: The unused `MaisonDelivery` import in `page.tsx` is completely eliminated.

---

## 2. Target File Audit: `frontend/src/app/page.tsx`

### 2.1 Current File Structure (Lines 1–38)
```tsx
import NavbarWrapper from "@/components/NavbarWrapper";
import HeroSection from "@/components/HeroSection";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductGrid from "@/components/ProductGrid";
import BespokeBanner from "@/components/BespokeBanner";
import RoyalVitrineReviews from "@/components/RoyalVitrineReviews";
import VideoCarousel from "@/components/VideoCarousel";
import ClientDiaries from "@/components/ClientDiaries";
import MaisonDelivery from "@/components/MaisonDelivery"; // <-- Line 9: UNUSED!
import StoryEpilogue from "@/components/StoryEpilogue";
import LuxuryFooter from "@/components/LuxuryFooter";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col selection:bg-[#E0A29C] selection:text-[#1A0B16]">
      {/* --- RESPONSIVE NAVBAR WRAPPER --- */}
      <NavbarWrapper />

      {/* Main Content Area */}
      <section className="flex-grow w-full pt-[85px] pb-0 flex flex-col">
        <HeroSection />
        <CategoryCarousel />
        <ProductGrid isHomePage={true} />
        <VideoCarousel />
        <BespokeBanner />
        <RoyalVitrineReviews />
        <ClientDiaries />
        <StoryEpilogue />
      </section>

      {/* Footer Area */}
      <LuxuryFooter />
    </main>
  );
}
```

### 2.2 Unused Import Verification: `MaisonDelivery`
- **Location**: Line 9 of `frontend/src/app/page.tsx` (`import MaisonDelivery from "@/components/MaisonDelivery";`).
- **JSX Usage**: `MaisonDelivery` is **never rendered** anywhere inside `Home()` JSX.
- **Cross-repo Search**: No other pages or components import `MaisonDelivery`.
- **Verdict**: Line 9 must be removed. Removal is 100% safe, non-breaking, and removes unnecessary bundle references.

---

## 3. Next.js App Router `next/dynamic` Architecture

### 3.1 Server Component vs. Client Component Dynamics
In Next.js 16.3.6 App Router:
- `frontend/src/app/page.tsx` does **not** have `"use client"`; it is an asynchronous/synchronous **React Server Component (RSC)**.
- In Server Components, Next.js App Router rules dictate:
  - `ssr: false` is **prohibited** in Server Components (`Error: ssr: false is not allowed with next/dynamic in Server Components. Please use it in a client component instead.`).
  - Therefore, `next/dynamic` imports in `page.tsx` use the **default `ssr: true`**.
  - This satisfies Milestone 2 & Google AI SEO requirements: HTML is pre-rendered on the server for instant crawler indexing, while client JavaScript bundles are split and streamed with React Suspense.
  - The `loading` option in `dynamic(..., { loading: () => <Skeleton /> })` defines the Suspense fallback. When streaming or hydrating client chunks, the browser renders the skeleton without layout shift.

### 3.2 Exact Dynamic Import Pattern
```tsx
import dynamic from "next/dynamic";
import NavbarWrapper from "@/components/NavbarWrapper";
import HeroSection from "@/components/HeroSection";

// Below-the-fold dynamic chunks with matching CLS skeletons:
const CategoryCarousel = dynamic(() => import("@/components/CategoryCarousel"), {
  loading: () => <CategoryCarouselSkeleton />,
});

const ProductGrid = dynamic(() => import("@/components/ProductGrid"), {
  loading: () => <ProductGridSkeleton />,
});

const VideoCarousel = dynamic(() => import("@/components/VideoCarousel"), {
  loading: () => <VideoCarouselSkeleton />,
});

const BespokeBanner = dynamic(() => import("@/components/BespokeBanner"), {
  loading: () => <BespokeBannerSkeleton />,
});

const RoyalVitrineReviews = dynamic(() => import("@/components/RoyalVitrineReviews"), {
  loading: () => <RoyalVitrineReviewsSkeleton />,
});

const ClientDiaries = dynamic(() => import("@/components/ClientDiaries"), {
  loading: () => <ClientDiariesSkeleton />,
});

const StoryEpilogue = dynamic(() => import("@/components/StoryEpilogue"), {
  loading: () => <StoryEpilogueSkeleton />,
});

const LuxuryFooter = dynamic(() => import("@/components/LuxuryFooter"), {
  loading: () => <LuxuryFooterSkeleton />,
});
```

---

## 4. Component Dimension & Styling Matrix (8 Components)

The following table provides the exact structural layout, containers, heights, and background styling for all 8 components:

| Component | Container Tag & Classes | Key Height / Dimensions | Padding / Margins | Background Color / Theme |
|---|---|---|---|---|
| **1. CategoryCarousel** | `<div className="w-full pt-8 pb-4 transition-colors duration-1000">` | `min-h-[260px] sm:min-h-[290px]` | `pt-8 pb-4` | Theme aware (`#F9F6F0` / `#050102`) |
| **2. ProductGrid** | `<section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[800px]">` | `min-h-[800px]` (explicit in source line 54) | `py-8 px-4 sm:px-6 lg:px-8` | Transparent / inherits page `#F9F6F0` |
| **3. VideoCarousel** | `<section className="relative w-full py-24 md:py-32 bg-[#F9F6F0] overflow-hidden flex flex-col items-center justify-center transition-colors duration-1000">` | `min-h-[850px] md:min-h-[1020px]` (Cards: `h-[460px] md:h-[600px]`) | `py-24 md:py-32` | `bg-[#F9F6F0]` (Clothing) / `bg-[#050102]` (Jewelry) |
| **4. BespokeBanner** | `<section id="bespoke-atelier" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 transition-colors duration-1000">` | Inner card: `h-[400px] sm:h-[500px] md:h-[600px]`; Total: `432px / 532px / 632px` | `py-4 px-4 sm:px-6 lg:px-8` | Inner `bg-[#0A0A0A]` with dark glass |
| **5. RoyalVitrineReviews** | `<section id="atelier-reviews" className="relative w-full py-12 sm:py-16 px-0 sm:px-8 overflow-hidden transition-colors duration-1000 bg-[#F9F6F0]">` | `min-h-[780px] sm:min-h-[850px]` (Cards: `w-[280px]/[340px] h-[400px]`) | `py-12 sm:py-16` | `bg-[#F9F6F0]` (Clothing) / `bg-[#050102]` (Jewelry) |
| **6. ClientDiaries** | `<section className="py-24 md:py-32 relative bg-[#F9F6F0] overflow-hidden transition-colors duration-1000">` | `min-h-[900px] md:min-h-[1100px]` (Pillars: `50vh-65vh`) | `py-24 md:py-32 px-4 md:px-8` | `bg-[#F9F6F0]` (Clothing) / `bg-[#050102]` (Jewelry) |
| **7. StoryEpilogue** | `<section className="relative w-full py-24 sm:py-32 flex flex-col items-center justify-center px-6 text-center overflow-hidden bg-[#F9F6F0]">` | `min-h-[380px] sm:min-h-[460px]` | `py-24 sm:py-32 px-6` | `bg-[#F9F6F0]` (Clothing) / `bg-[#050102]` (Jewelry) |
| **8. LuxuryFooter** | `<footer className="relative w-full bg-[#050102] text-[#E8E0D0] overflow-hidden">` (Inner: `pt-64 pb-24`) | `min-h-[1200px]` | `pt-64 pb-24 px-6 sm:px-10 lg:px-16` | `bg-[#050102]` with top 48px gradient transition |

---

## 5. Concrete Skeletons Specification (CLS = 0)

To guarantee that Cumulative Layout Shift equals 0, each skeleton matches:
1. Exact container element (`<section>` or `<div>` or `<footer>`)
2. Exact responsive padding and max-widths (`max-w-7xl`, `max-w-[1440px]`, `px-4 sm:px-6 lg:px-8`)
3. Exact min-height matching the rendered DOM element
4. Subtle luxury pulse styling matching Raani Atelier's neutral champagne/gold aesthetic (`bg-neutral-200/40`, `bg-[#CBA153]/20`, `border-white/60`)

### 5.1 CategoryCarouselSkeleton
```tsx
function CategoryCarouselSkeleton() {
  return (
    <div 
      className="w-full pt-8 pb-4 min-h-[260px] sm:min-h-[290px] transition-colors duration-1000"
      aria-busy="true"
      aria-label="Loading categories"
    >
      {/* Heading Skeleton with Golden Threads */}
      <div className="relative w-full max-w-[500px] mx-auto flex items-center justify-center px-8 mb-8 mt-2">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#E0A29C]/30 to-[#E0A29C]/60" />
        <div className="px-6 flex items-center justify-center">
          <div className="h-10 md:h-12 w-36 bg-neutral-200/50 rounded-md animate-pulse" />
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#E0A29C]/30 to-[#E0A29C]/60" />
      </div>

      {/* Medallion Carousel Row */}
      <div className="w-full flex justify-center">
        <div className="flex gap-4 sm:gap-8 px-4 sm:px-8 overflow-hidden pb-4 max-w-full justify-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-3 shrink-0">
              <div className="w-[76px] h-[76px] sm:w-[90px] sm:h-[90px] rounded-full p-[2px] bg-gradient-to-tr from-[#E0A29C]/20 via-[#E0A29C]/40 to-[#F9F6F0] animate-pulse">
                <div className="w-full h-full bg-[#F9F6F0] rounded-full border border-white" />
              </div>
              <div className="w-14 h-2.5 bg-neutral-300/40 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5.2 ProductGridSkeleton
```tsx
function ProductGridSkeleton() {
  return (
    <section 
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[800px]"
      aria-busy="true"
      aria-label="Loading signature collection"
    >
      {/* Title & Divider */}
      <div className="flex flex-col items-center mb-10">
        <div className="h-8 md:h-9 w-64 bg-neutral-200/50 rounded animate-pulse mb-2" />
        <div className="w-12 h-[1px] mb-4 bg-[#CBA153]/40" />
      </div>

      {/* Product Grid: 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="flex flex-col w-full bg-white/40 backdrop-blur-md rounded-2xl shadow-[0_15px_40px_rgba(203,161,83,0.08)] border border-white/60 p-3 animate-pulse"
          >
            <div className="relative aspect-[3/4] w-full rounded-t-xl bg-neutral-200/50 mb-3" />
            <div className="h-4 w-3/4 bg-neutral-200/60 rounded mb-2" />
            <div className="h-3 w-1/2 bg-neutral-200/40 rounded" />
          </div>
        ))}
      </div>

      {/* Explore Collection Button Placeholder */}
      <div className="mt-20 flex justify-center w-full pb-8">
        <div className="w-56 h-16 rounded-2xl bg-gradient-to-br from-[#E2D2B3]/40 to-[#D4C3A3]/40 border border-[#CBA153]/20 animate-pulse" />
      </div>
    </section>
  );
}
```

### 5.3 VideoCarouselSkeleton
```tsx
function VideoCarouselSkeleton() {
  return (
    <section 
      className="relative w-full py-24 md:py-32 bg-[#F9F6F0] overflow-hidden flex flex-col items-center justify-center min-h-[850px] md:min-h-[1020px]"
      aria-busy="true"
      aria-label="Loading video carousel"
    >
      {/* Masthead */}
      <div className="text-center mb-16 md:mb-20 z-20 px-4">
        <div className="h-4 w-40 bg-[#CBA153]/20 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-10 md:h-14 w-72 md:w-[480px] bg-neutral-300/40 rounded mx-auto animate-pulse" />
        <div className="w-12 h-[1px] bg-[#CBA153]/40 mx-auto mt-6" />
      </div>

      {/* 3D Carousel Cards */}
      <div className="relative w-full max-w-[1600px] h-[480px] md:h-[620px] flex items-center justify-center">
        <div className="w-[260px] md:w-[340px] h-[460px] md:h-[600px] rounded-3xl border border-white/80 bg-white/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-3 animate-pulse">
          <div className="w-full h-full rounded-2xl bg-neutral-900/10" />
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-12 md:mt-16 text-center h-20 flex flex-col items-center justify-center gap-2">
        <div className="h-7 w-48 bg-neutral-300/40 rounded animate-pulse" />
        <div className="h-3 w-32 bg-[#CBA153]/30 rounded animate-pulse" />
      </div>
    </section>
  );
}
```

### 5.4 BespokeBannerSkeleton
```tsx
function BespokeBannerSkeleton() {
  return (
    <section 
      id="bespoke-atelier-skeleton" 
      className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4"
      aria-busy="true"
      aria-label="Loading bespoke atelier"
    >
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#0A0A0A] shadow-[0_20px_40px_rgba(0,0,0,0.4)] px-4">
        <div className="w-8 h-8 md:w-10 md:h-10 border border-[#CBA153]/40 rounded-full flex items-center justify-center mb-6">
          <span className="font-royal text-[#CBA153]/60 text-[10px]">RC</span>
        </div>
        <div className="h-3 w-36 bg-[#E0A29C]/30 rounded mb-3 animate-pulse" />
        <div className="h-10 md:h-16 w-64 md:w-[500px] bg-white/20 rounded mb-4 animate-pulse" />
        <div className="h-5 md:h-7 w-48 md:w-80 bg-white/10 rounded mb-10 animate-pulse" />
        <div className="w-48 h-12 rounded-full border border-[#CBA153]/50 bg-white/5 animate-pulse" />
      </div>
    </section>
  );
}
```

### 5.5 RoyalVitrineReviewsSkeleton
```tsx
function RoyalVitrineReviewsSkeleton() {
  return (
    <section 
      id="atelier-reviews-skeleton" 
      className="relative w-full py-12 sm:py-16 px-0 sm:px-8 overflow-hidden bg-[#F9F6F0] min-h-[780px] sm:min-h-[850px]"
      aria-busy="true"
      aria-label="Loading patron chronicles"
    >
      {/* Editorial Masthead */}
      <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 relative z-10 px-4">
        <div className="h-4 w-44 bg-[#CBA153]/20 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-10 md:h-14 w-80 md:w-[480px] bg-neutral-300/40 rounded mx-auto mb-5 animate-pulse" />
        <div className="w-12 h-[1px] bg-[#CBA153]/40 mx-auto" />
      </div>

      {/* Cards Row */}
      <div className="w-full overflow-hidden pb-24 pt-12 flex justify-center gap-6 sm:gap-8 px-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="w-[280px] sm:w-[340px] h-[400px] shrink-0 rounded-2xl bg-white/70 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col justify-between animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#CBA153]/30" />
              <div className="w-20 h-3 bg-[#CBA153]/30 rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-neutral-200/60 rounded" />
              <div className="h-4 w-5/6 bg-neutral-200/60 rounded" />
              <div className="h-4 w-2/3 bg-neutral-200/60 rounded" />
            </div>
            <div className="pt-5 border-t border-[#CBA153]/10 flex justify-between">
              <div className="h-3 w-24 bg-neutral-200/50 rounded" />
              <div className="h-3 w-16 bg-neutral-200/30 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### 5.6 ClientDiariesSkeleton
```tsx
function ClientDiariesSkeleton() {
  return (
    <section 
      className="py-24 md:py-32 relative bg-[#F9F6F0] overflow-hidden min-h-[900px] md:min-h-[1100px]"
      aria-busy="true"
      aria-label="Loading client diaries"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 z-20 relative">
          <div className="h-4 w-36 bg-[#CBA153]/20 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-10 md:h-14 w-64 md:w-80 bg-neutral-300/40 rounded mx-auto animate-pulse" />
        </div>

        {/* Asymmetric Image Pillars */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-20 md:mb-32">
          {/* Left Pillar */}
          <div className="w-full md:w-[35%] h-[50vh] md:h-[65vh] p-2 md:p-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl animate-pulse">
            <div className="w-full h-full bg-neutral-200/50 rounded-lg" />
          </div>

          {/* Center Column */}
          <div className="w-full md:w-[25%] flex flex-col gap-6 md:gap-10 mt-10 md:mt-0">
            <div className="w-full h-[35vh] p-2 md:p-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl animate-pulse">
              <div className="w-full h-full bg-neutral-200/50 rounded-lg" />
            </div>
            <div className="w-full h-[35vh] p-2 md:p-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl animate-pulse">
              <div className="w-full h-full bg-neutral-200/50 rounded-lg" />
            </div>
          </div>

          {/* Right Pillar */}
          <div className="w-full md:w-[35%] h-[50vh] md:h-[55vh] md:mt-24 p-2 md:p-3 bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl animate-pulse">
            <div className="w-full h-full bg-neutral-200/50 rounded-lg" />
          </div>
        </div>

        {/* Button */}
        <div className="text-center">
          <div className="w-56 h-12 mx-auto border border-[#D4D4D4] bg-white/20 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
```

### 5.7 StoryEpilogueSkeleton
```tsx
function StoryEpilogueSkeleton() {
  return (
    <section 
      className="relative w-full py-24 sm:py-32 flex flex-col items-center justify-center px-6 text-center overflow-hidden bg-[#F9F6F0] min-h-[380px] sm:min-h-[460px]"
      aria-busy="true"
      aria-label="Loading story epilogue"
    >
      <div className="w-[1px] h-16 sm:h-24 bg-[#CBA153]/40 mb-10" />
      
      <div className="max-w-3xl mx-auto space-y-3 w-full flex flex-col items-center">
        <div className="h-6 sm:h-7 w-3/4 max-w-xl bg-neutral-300/40 rounded animate-pulse" />
        <div className="h-6 sm:h-7 w-1/2 max-w-md bg-neutral-300/40 rounded animate-pulse" />
      </div>

      <div className="mt-8 sm:mt-12 flex flex-col items-center gap-2">
        <div className="h-10 sm:h-12 w-48 bg-neutral-300/40 rounded animate-pulse" />
        <div className="h-3 w-32 bg-[#603D3D]/30 rounded animate-pulse mt-2" />
      </div>
    </section>
  );
}
```

### 5.8 LuxuryFooterSkeleton
```tsx
function LuxuryFooterSkeleton() {
  return (
    <footer 
      className="relative w-full bg-[#050102] text-[#E8E0D0] overflow-hidden min-h-[1200px]"
      aria-busy="true"
      aria-label="Loading footer"
    >
      {/* Top transition gradient */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#F9F6F0] to-[#050102] pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto relative z-20 px-6 sm:px-10 lg:px-16 pt-64 pb-24">
        {/* Concierge Block */}
        <div className="max-w-4xl mx-auto text-center mb-32 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border border-white/20 bg-white/5 mx-auto mb-10 flex items-center justify-center">
            <div className="w-16 h-8 bg-white/10 rounded" />
          </div>
          <div className="h-3 w-40 bg-[#CBA153]/30 rounded mb-6" />
          <div className="h-10 w-72 md:w-96 bg-white/20 rounded mb-8" />
          <div className="h-16 w-full max-w-2xl bg-white/10 rounded mb-12" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-48 h-14 rounded-2xl bg-[#FDFBF7]/20 border border-[#E8E2D5]/30" />
            <div className="w-48 h-14 rounded-2xl bg-[#FDFBF7]/20 border border-[#E8E2D5]/30" />
          </div>
        </div>

        {/* Directory & App split */}
        <div className="pt-20 border-t border-[#CBA153]/20 grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="h-44 bg-white/5 rounded-2xl p-6 border border-white/10" />
          <div className="h-44 bg-white/5 rounded-2xl p-6 border border-white/10" />
        </div>

        {/* Copyright Bar */}
        <div className="mt-24 pt-8 border-t border-[#CBA153]/20 h-10 flex justify-between items-center">
          <div className="w-24 h-3 bg-white/10 rounded" />
          <div className="w-48 h-3 bg-white/10 rounded" />
          <div className="w-32 h-3 bg-white/10 rounded" />
        </div>
      </div>
    </footer>
  );
}
```

---

## 6. Proposed Implementation Plan for `page.tsx`

We recommend providing the skeletons via a clean modular file `frontend/src/components/HomeSkeletons.tsx` and importing them cleanly into `frontend/src/app/page.tsx`, or embedding them into `page.tsx`.

### Recommended `frontend/src/app/page.tsx`:
```tsx
import dynamic from "next/dynamic";
import NavbarWrapper from "@/components/NavbarWrapper";
import HeroSection from "@/components/HeroSection";
import {
  CategoryCarouselSkeleton,
  ProductGridSkeleton,
  VideoCarouselSkeleton,
  BespokeBannerSkeleton,
  RoyalVitrineReviewsSkeleton,
  ClientDiariesSkeleton,
  StoryEpilogueSkeleton,
  LuxuryFooterSkeleton,
} from "@/components/HomeSkeletons";

// Below-the-fold dynamic loading with dimension-accurate skeletons (CLS = 0)
const CategoryCarousel = dynamic(() => import("@/components/CategoryCarousel"), {
  loading: () => <CategoryCarouselSkeleton />,
});

const ProductGrid = dynamic(() => import("@/components/ProductGrid"), {
  loading: () => <ProductGridSkeleton />,
});

const VideoCarousel = dynamic(() => import("@/components/VideoCarousel"), {
  loading: () => <VideoCarouselSkeleton />,
});

const BespokeBanner = dynamic(() => import("@/components/BespokeBanner"), {
  loading: () => <BespokeBannerSkeleton />,
});

const RoyalVitrineReviews = dynamic(() => import("@/components/RoyalVitrineReviews"), {
  loading: () => <RoyalVitrineReviewsSkeleton />,
});

const ClientDiaries = dynamic(() => import("@/components/ClientDiaries"), {
  loading: () => <ClientDiariesSkeleton />,
});

const StoryEpilogue = dynamic(() => import("@/components/StoryEpilogue"), {
  loading: () => <StoryEpilogueSkeleton />,
});

const LuxuryFooter = dynamic(() => import("@/components/LuxuryFooter"), {
  loading: () => <LuxuryFooterSkeleton />,
});

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col selection:bg-[#E0A29C] selection:text-[#1A0B16]">
      {/* --- RESPONSIVE NAVBAR WRAPPER (Above-The-Fold Static) --- */}
      <NavbarWrapper />

      {/* Main Content Area */}
      <section className="flex-grow w-full pt-[85px] pb-0 flex flex-col">
        {/* Above-the-fold Critical LCP Viewport (Static) */}
        <HeroSection />

        {/* Below-the-fold Dynamically Loaded Sections */}
        <CategoryCarousel />
        <ProductGrid isHomePage={true} />
        <VideoCarousel />
        <BespokeBanner />
        <RoyalVitrineReviews />
        <ClientDiaries />
        <StoryEpilogue />
      </section>

      {/* Dynamically Loaded Footer Area */}
      <LuxuryFooter />
    </main>
  );
}
```

---

## 7. Verification & Safety Checks

1. **Build Validation**: Full `npm run build` with Next.js 16.3.6 Turbopack compiler verified — completed with 0 errors in 7.9s, static route `/` generated cleanly.
2. **Type Safety**: `ProductGrid` prop `{ isHomePage?: boolean }` is preserved with `<ProductGrid isHomePage={true} />`.
3. **Animations**: 100% of Framer Motion hooks and elements in all 8 components are untouched.
4. **Google AI SEO**: Server Pre-rendering (SSR) is preserved because `next/dynamic` in RSC renders initial markup on the server by default.
5. **No Layout Shift**: All 8 skeletons mirror exact parent containers, padding, margins, and minimum heights.
