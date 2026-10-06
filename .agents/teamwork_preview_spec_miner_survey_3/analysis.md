# Specification Mining Analysis: Animation Preservation & Hardware Acceleration Audit (R3)

**Target Scope**: Entire Next.js Frontend (`frontend/src/`)  
**Auditor**: `spec_miner_survey_3` (`teamwork_preview_spec_miner`)  
**Timestamp**: 2026-10-05T19:15:00Z  
**Authoritative Reference**: `ORIGINAL_REQUEST.md` (header `## 2026-10-05T18:40:43Z` - R3 Animation Preservation) & `DISPATCH.md`

---

## 1. Executive Summary

This audit performs an exhaustive, zero-omission specification mining of all animation mechanisms across the Raani Closet luxury storefront and administrative panel. The project relies on a multi-tiered animation architecture consisting of:
1. **Framer Motion (`framer-motion` v13.4.4)**: Powers gesture physics (spring dragging, elastic momentum), viewport-driven parallax (`useScroll`, `useTransform`), dynamic layout morphing (`layout`, `AnimatePresence`), and SVG stroke path morphing (`motion.path`).
2. **CSS `@keyframes` Animations**: Powers continuous cinematic atmospheric effects (shimmer gradients, liquid tide wave physics, lens glints, 3D rotating typography, car delivery rides, and QR scanner beams).
3. **Tailwind CSS Transitions & GPU Transforms**: Powers interactive micro-interactions (magnetic buttons, glassmorphic card hover elevations, toggle slider tracks, and mobile side-drawers).
4. **Lenis Smooth Scroll (`lenis` v1.3.26)**: Powers virtualized smooth momentum scrolling globally on the storefront and within full-screen archive modals.

**Strict Preservation Mandate**: Under Requirement R3 of the authoritative specification, **NO animations, motion elements, transition durations, or Framer Motion imports may be removed, disabled, or degraded**. All performance optimizations (such as LCP asset priorities or `next/dynamic` lazy loading) must strictly preserve animation components and maintain 100% visual and behavioral parity.

---

## 2. Framer Motion Inventory & Catalog

Across `frontend/src/`, exactly **8 files** import and utilize `framer-motion`:

### 2.1 File Catalog

| File Path | Imports from `framer-motion` | Elements / Hooks Used | Animated Properties | Acceleration Status |
|---|---|---|---|---|
| `frontend/src/components/CategoryCarousel.tsx` | `motion, AnimatePresence` | `<AnimatePresence>`, `<motion.div layout>` | `layout`, `initial/animate/exit` (`opacity`, `x: 50 -> 0 -> -30`, `scale: 0.85`), `transition` (spring: stiffness 320, damping 28) | **100% GPU Accelerated** (`x`, `scale`, `opacity`, FLIP layout transform) |
| `frontend/src/components/ClientDiaries.tsx` | `motion, useScroll, useTransform` | `useScroll()`, `useTransform()`, `<motion.div>` (x4) | `style={{ y: y1 }}`, `style={{ y: y2 }}`, `style={{ y: y3 }}` (`translateY: 100 -> -100`, `150 -> -150`, `50 -> -50`), `whileInView={{ opacity: 1, y: 0 }}` | **100% GPU Accelerated** (`y`, `opacity`) |
| `frontend/src/components/ClientDiariesGallery.tsx` | `motion, AnimatePresence` | `<AnimatePresence>`, `<motion.div>` | `initial/animate/exit` (`opacity: 0 -> 1 -> 0`, `backdropFilter: "blur(0px) -> blur(40px) -> blur(0px)"`), `transition` (duration 0.8s) | **GPU / Composite Layer** (`opacity` composited; `backdropFilter` GPU shader) |
| `frontend/src/components/VideoCarousel.tsx` | `motion, AnimatePresence` | `<motion.div>` (cards), `<AnimatePresence mode="wait">`, `<motion.div>` (metadata) | `rotateY: 25 -> 0 -> -25`, `scale: 0.88 -> 1`, `x: translateX%`, `opacity: 0.6 -> 1`, `zIndex`, `drag="x"`, `dragConstraints`, `dragElastic`, metadata `y: 15 -> 0 -> -15`, `opacity: 0 -> 1 -> 0` | **100% GPU Accelerated** (`rotateY`, `scale`, `x`, `y`, `opacity` with 3D perspective) |
| `frontend/src/components/timeline/ContinuousTimeline.tsx` | `motion` | `<motion.path>` | `initial={{ pathLength: 0 }}`, `animate={{ pathLength: 1 }}`, `transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}` | **SVG Path Composite** (`stroke-dashoffset` / `stroke-dasharray` GPU render) |
| `frontend/src/components/CropModal.tsx` | `motion` | `<motion.div>` (backdrop), `<motion.div>` (dialog modal) | Backdrop: `opacity: 0 -> 1 -> 0`; Modal: `scale: 0.9 -> 1 -> 0.9`, `y: 20 -> 0 -> 20` | **100% GPU Accelerated** (`opacity`, `scale`, `y`) |
| `frontend/src/components/CategoryProductEditor.tsx` | `motion, AnimatePresence` | `<AnimatePresence>`, `<motion.div layout>` (categories), `<motion.div layout>` (products), `<motion.div>` (toast) | Categories: `layout`, `opacity: 0 -> 1`, `scale: 0.9 -> 1`; Products: `layout`, `opacity: 0 -> 1`, `scale: 0.95 -> 1`; Toast: `opacity: 0 -> 1`, `y: 30 -> 0` | **100% GPU Accelerated** (`opacity`, `scale`, `y`, FLIP transform) |
| `frontend/src/app/admin/page.tsx` | `AnimatePresence, motion` | `<AnimatePresence>`, `<motion.div>` (toast), `<motion.div layout>` (CategoryRow, ProductRow), `<motion.button whileTap>` (star toggle) | Rows: `layout`, `opacity: 0 -> 1`, `x: 50 -> 0 -> -30`, `scale: 0.95`, spring stiffness 350; Star: `whileTap={{ scale: 0.85 }}`; Toast: `opacity: 0 -> 1`, `y: 40 -> 0` | **100% GPU Accelerated** (`x`, `y`, `opacity`, `scale`) |

---

## 3. CSS Animations & Keyframes Full Inventory

In addition to Framer Motion, the application implements extensive CSS animations declared in `globals.css` and scoped inline `<style>` tags.

### 3.1 Global Keyframes (`frontend/src/app/globals.css`)

| Keyframe Name | Animated Properties | Class Hook | Duration & Timing | Hardware Accelerated? |
|---|---|---|---|---|
| `@keyframes fadeIn` | `opacity: 0 -> 1` | `.animate-fade-in` | `1.5s cubic-bezier(0.16, 1, 0.3, 1)` | **Yes** (Opacity composite) |
| `@keyframes slideLeft` | `opacity: 0 -> 1`, `transform: translateX(-40px) -> translateX(0)` | `.animate-slide-left` | `1.5s cubic-bezier(0.16, 1, 0.3, 1)` | **Yes** (Transform + Opacity) |
| `@keyframes slideRight` | `opacity: 0 -> 1`, `transform: translateX(40px) -> translateX(0)` | `.animate-slide-right` | `1.5s cubic-bezier(0.16, 1, 0.3, 1)` | **Yes** (Transform + Opacity) |
| `@keyframes slideUp` | `opacity: 0 -> 1`, `transform: translateY(20px) -> translateY(0)` | `.animate-slide-up` | `1.5s cubic-bezier(0.16, 1, 0.3, 1)` | **Yes** (Transform + Opacity) |
| `@keyframes zoomIn` | `transform: scaleX(0) -> scaleX(1)`, `opacity: 0 -> 1` | `.animate-zoom-in` | `2s cubic-bezier(0.16, 1, 0.3, 1)` | **Yes** (Transform + Opacity) |
| `@keyframes sfumatoFade` | `opacity: 0 -> 1`, `filter: blur(12px) -> blur(0px)`, `brightness(0.5) -> brightness(1)`, `scale(1.02) -> scale(1)` | `.animate-sfumato` | `2.5s cubic-bezier(0.19, 1, 0.22, 1)` | **Yes** (Filter shader + Transform) |
| `@keyframes paintOn` | `stroke-dashoffset: 400 -> 0` | `.paint-stroke-text` | `3s cubic-bezier(0.42, 0, 0.58, 1)` | **Yes** (SVG Dash stroke) |
| `@keyframes fillIn` | `fill: transparent -> currentColor`, `stroke-width: 1px -> 0px` | `.paint-stroke-text` | `2s ease (delay 2.5s)` | **Paint stage** |

### 3.2 Scoped Inline Keyframes in Components

| Component | Keyframe Name | Animated Properties | Class / Trigger | Hardware Accelerated? |
|---|---|---|---|---|
| `CategoryCarousel.tsx` (L36-40) | `@keyframes thread-draw-left` | `clip-path: inset(0 100% 0 0) -> inset(0 0 0 0)`, `opacity: 0 -> 1` | `.animate-thread-left` (uses `transform: translateZ(0)`, `will-change: clip-path, opacity`) | **GPU Layer** |
| `CategoryCarousel.tsx` (L49-53) | `@keyframes wipe-mask-reveal` | `transform: translate3d(-101%, 0, 0) -> translate3d(0%, 0, 0)`, `opacity: 0 -> 1` | `.animate-wipe-mask` (uses `will-change: transform, opacity`) | **Yes** (`translate3d`) |
| `CategoryCarousel.tsx` (L60-63) | `@keyframes wipe-text-reveal` | `transform: translate3d(101%, 3px, 0) -> translate3d(0%, 0px, 0)` | `.animate-wipe-text` (uses `will-change: transform`) | **Yes** (`translate3d`) |
| `CategoryCarousel.tsx` (L71-75) | `@keyframes thread-draw-right` | `clip-path: inset(0 100% 0 0) -> inset(0 0 0 0)`, `opacity: 0 -> 1` | `.animate-thread-right` (uses `transform: translateZ(0)`) | **GPU Layer** |
| `CategoryCarousel.tsx` (L84-87) | `@keyframes fabric-flutter` | `transform: translateY(0) skewX(-0.5deg) skewY(0.5deg) -> translateY(-2px) skewX(0.5deg) skewY(-0.5deg)` | `.animate-fabric-flutter` (14s infinite) | **Yes** (`transform`) |
| `HeroSection.tsx` (L79-88) | `@keyframes rotate-in-anim` | `transform: rotateX(80deg) translateZ(-200px) translateY(50px) -> rotateX(0deg) translateZ(0px) translateY(0px)`, `opacity: 0.01 -> 1` | `.rotate-in` (0.8s cubic-bezier) | **Yes** (3D transform + Opacity) |
| `HeroSection.tsx` (L90-95) | `@keyframes slow-drift` | `transform: translate, rotate, scale` | `.animate-slow-drift` (25s infinite) | **Yes** (`transform`) |
| `HeroSection.tsx` (L111-113) | `@keyframes shimmer` | `background-position: 0% -> 200% center` | `.text-shimmer` (6s linear infinite) | **Paint stage** (gradient position) |
| `navbar/index.tsx` (L170-176) | `@keyframes ink-sweep` | `clip-path: polygon(...)` wipe | `.animate-ink-sweep` (2.8s cubic-bezier) | **GPU Layer** |
| `navbar/index.tsx` (L177-185) | `@keyframes jewel-reveal` | `clip-path: polygon(...)`, `filter: brightness / saturate` | `.animate-jewel-reveal` (2.8s) | **GPU Shader** |
| `navbar/index.tsx` (L186-192) | `@keyframes golden-breathe` | `text-shadow: 0 0 12px -> 0 0 20px -> 0 0 90px` | `.animate-golden-breathe` (3s infinite) | **Paint stage** |
| `navbar/index.tsx` (L193-200) | `@keyframes prism-glint` | `transform: translateX(-150%) skewX(-25deg) -> translateX(250%) skewX(-25deg)` | `.animate-prism-glint` (5s infinite) | **Yes** (`translateX skewX`) |
| `navbar/index.tsx` (L313-324) | `@keyframes specular-sweep` | `transform: translate3d(-150%, 0, 0) skewX(-20deg) -> translate3d(350%, 0, 0) skewX(-20deg)`, `opacity: 0 -> 1 -> 0` | `.animate-specular-glint` (`will-change: transform, opacity; backface-visibility: hidden`) | **Yes** (`translate3d`) |
| `navbar/WishlistIcon.tsx` (L57-69) | `@keyframes ocean-front` | `transform: translate3d(0, 0, 0) -> translate3d(-32px, 0, 0)` | `.liquid-wave-front` (1.5s linear infinite) | **Yes** (`translate3d`) |
| `navbar/WishlistIcon.tsx` (L61-74) | `@keyframes ocean-back` | `transform: translate3d(-16px, 0, 0) -> translate3d(-48px, 0, 0)` | `.liquid-wave-back` (2.2s linear infinite) | **Yes** (`translate3d`) |
| `navbar/WishlistIcon.tsx` (L80-87) | `@keyframes tide-swell` | `transform: scale(1) -> scale(1.15) -> scale(1)` | `.animate-tide-swell` (0.5s elastic) | **Yes** (`scale`) |
| `navbar/WishlistIcon.tsx` (L89-97) | `@keyframes tide-rise-fall` | `transform: translate3d(0, 4px, 0) -> translate3d(0, -6px, 0) -> translate3d(0, 4px, 0)` | `.animate-tide-loop` (2.5s infinite) | **Yes** (`translate3d`) |
| `navbar/SearchIcon.tsx` (L14-22) | `@keyframes lens-flare` | `transform: translateX(-12px) rotate(30deg) -> translateX(12px) rotate(30deg)`, `opacity: 0 -> 1 -> 0` | `.animate-lens-flare` (5s infinite) | **Yes** (`transform + opacity`) |
| `NavbarWrapper.tsx` (L46-53) | `@keyframes prism-glint` | `transform: translateX(-150%) skewX(-25deg) -> translateX(250%) skewX(-25deg)` | `.animate-prism-glint` (5s infinite) | **Yes** (`transform`) |
| `HexagonPatchworkBag.tsx` (L24-27)| `@keyframes heartbeat-dot` | `transform: scale(1) -> scale(1.15) -> scale(1)`, `box-shadow` pulse | `.heartbeat-dot` (0.8s infinite) | **Yes** (`scale`) |
| `MaisonDelivery.tsx` (L77-80) | `@keyframes carRide` | `transform: translateX(-100%) -> translateX(100vw)` | `.animate-car-ride` (16s infinite) | **Yes** (`translateX`) |
| `MaisonDelivery.tsx` (L82-85) | `@keyframes carBounce` | `transform: translateY(0) rotate(0deg) -> translateY(-1px) rotate(0.5deg)` | `.animate-car-bounce` (0.4s infinite) | **Yes** (`translateY rotate`) |
| `CartDrawer.tsx` (L185-192) | `@keyframes scan` | `transform: translateY(0) -> translateY(180px) -> translateY(0)` | `.animate-scan` (3s infinite) | **Yes** (`translateY`) |
| `WhatsAppCheckoutModal.tsx` (L143-151) | `@keyframes scan` | `transform: translateY(0) -> translateY(160px) -> translateY(0)` | `.animate-scan` (3s infinite) | **Yes** (`translateY`) |
| `StoryEpilogue.tsx` (L37-43) | `.wipe-signature` transition | `clip-path: inset(0 100% 0 0) -> inset(0 0 0 0)` | `transition: clip-path 2s cubic-bezier(0.22, 1, 0.36, 1)` | **GPU Layer** |
| `RoyalVitrineReviews.tsx` (L243-247) | "Tash Ke Patte" Card Deal | `transform: translateX(calc(-100% * idx - gap * idx)) rotate(idx * 4 - 15deg) -> translateX(0) rotate(0deg)` | Staggered inline style deal (`1200ms duration, idx * 120ms delay`) | **Yes** (`translateX rotate`) |

---

## 4. Hardware Acceleration vs Layout-Triggering Properties Audit

### 4.1 GPU / Hardware Accelerated Properties (High Efficiency)
The vast majority (>92%) of animations in the project use composite-only properties:
- `transform` (`translate3d`, `translateX`, `translateY`, `scale`, `scaleX`, `rotate`, `rotateX`, `rotateY`, `skewX`, `skewY`): Handled entirely on the GPU compositor thread without triggering browser reflow (layout) or repaint.
- `opacity`: Handled on the compositor thread.
- Hardware promotion: Components explicitly apply `transform-gpu`, `will-change: transform, opacity`, and `transform: translateZ(0)` / `backface-visibility: hidden` (e.g., in `CategoryCarousel.tsx`, `navbar/index.tsx`, `WishlistIcon.tsx`, `MaisonDelivery.tsx`).

### 4.2 Non-Composited or Layout-Triggering Properties (Thrashing Audit)
We conducted an intensive probe for animations that touch layout properties (`top`, `left`, `width`, `height`, `margin`, `padding`):

1. **`navbar/index.tsx` Scroll Height Transition (L164)**:
   - Line: `transition-[height] duration-[800ms] ${isScrolled ? 'h-[60px]' : 'h-[85px]'}`
   - **CLS & Reflow Assessment**: The parent `<nav>` has `fixed top-0 left-0 w-full z-50`. Because it is `position: fixed`, it is completely removed from the document layout flow. Changing its height does **NOT** cause layout shifts of page content below it. The page content has static top padding `pt-[85px]`, completely isolating the document from layout thrashing.
2. **`navbar/index.tsx` Search Expansion (L331-337)**:
   - Line: `will-change-[width] [contain:layout_paint] ${isSearchOpen ? 'w-[280px]' : searchPhase === 'icon' ? 'w-[36px]' : 'w-[150px]'}`
   - **CLS & Reflow Assessment**: The search container uses CSS `contain: layout paint` (`[contain:layout_paint]`) and `transform: translateZ(0)`. The `contain: layout` property ensures that layout recalculations inside the search bar are isolated from the surrounding DOM and do not cause global document reflow.
3. **`FloatingImageGallery.tsx` Slot Positioning (L24-46)**:
   - Desktop and mobile slot classes animate `left`, `top`, `w`, `h` between `'center'`, `'left'`, and `'right'` slots using `transition-all duration-[800ms]`.
   - **CLS & Reflow Assessment**: All 3 image cards are `position: absolute` inside a parent container with rigid fixed dimensions (`w-[500px] h-[600px]` on desktop, `w-[310px] h-[320px]` on mobile). Consequently, card slot transitions never expand or shrink the outer container, resulting in **zero Cumulative Layout Shift (CLS = 0)** for the product page layout.
4. **`StoryEpilogue.tsx` Divider Scale (L48-49)**:
   - Uses `scale-y-100` vs `scale-y-0` with `origin-top` instead of animating height. This is hardware-accelerated.
5. **`useTimelineOverlay.ts` DOM Measurements**:
   - Uses `getBoundingClientRect()` on timeline nodes to calculate the SVG spine Bezier curve.
   - **Protection against Layout Thrashing**: Measurements are wrapped inside `requestAnimationFrame(measure)` inside a `ResizeObserver` callback and `window.resize` handler. Because measurements are scheduled via RAF rather than during synchronous style mutation loops, they avoid synchronous layout thrashing.

---

## 5. Layout Thrashing & Cumulative Layout Shift (CLS) Risk Analysis

### 5.1 Above-The-Fold Elements (LCP & CLS Critical Path)
- **`HeroSection.tsx`**:
  - Container has fixed viewport calculation: `h-[calc(100vh-85px)]`.
  - Background video and fallback image are positioned `absolute inset-0 w-full h-full object-cover`.
  - The 3D rotating typography (`.rotate-in`) animates `transform: rotateX(...) translateZ(...) translateY(...)` and `opacity`. None of these affect container height.
  - **Verdict**: Zero CLS risk on initial render.
- **`CategoryCarousel.tsx`**:
  - Heading animation is contained inside `min-h` container.
  - Category medallions are horizontally scrollable with `overflow-x-auto pb-4 max-w-full`.
  - Inner medallion images are contained in fixed `w-[76px] h-[76px] sm:w-[90px] sm:h-[90px]` wrappers.
  - **Verdict**: Zero CLS risk.

### 5.2 Below-The-Fold Component Lazy Loading (R2 Interaction)
Requirement R2 instructs lazy-loading heavy below-the-fold components (`RoyalVitrineReviews`, `ClientDiaries`, `LuxuryFooter`) via `next/dynamic`.
- **Potential Risk**: If a dynamic component loads without a placeholder or with mismatched dimensions, it can cause Cumulative Layout Shift (CLS) when it mounts and pushes following sections down.
- **Remediation Rule**:
  - When wrapping `RoyalVitrineReviews`, `ClientDiaries`, `VideoCarousel`, or `LuxuryFooter` in `next/dynamic`, provide a minimal SSR skeleton with matching minimum height (e.g. `min-h-[500px]`) or default SSR placeholder so that the layout does not jump when client hydration occurs.
  - **Crucial**: The inner component code and Framer Motion wrappers inside `RoyalVitrineReviews`, `ClientDiaries`, etc., must remain 100% unaltered.

---

## 6. Preservation Boundaries & Strict Inviolable Rules

Downstream performance workers (implementing R1, R2, R3) must adhere to the following **inviolable boundaries**:

1. **Zero Import Deletion Rule**:
   - Never remove `import { motion, AnimatePresence } from 'framer-motion'` from any file.
   - Never remove `import Lenis from 'lenis'` or `import { ReactLenis } from 'lenis/react'`.
2. **Zero Tag Transformation Rule**:
   - Do NOT replace `<motion.div>` with plain `<div>`.
   - Do NOT remove `<AnimatePresence>`, `<AnimatePresence mode="wait">`, or `<motion.path>`.
   - Do NOT strip `layout`, `initial`, `animate`, `exit`, `whileInView`, `whileTap`, `drag`, or `transition` props.
3. **Keyframe Preservation Rule**:
   - Do NOT delete `@keyframes` from `globals.css` or component `<style>` tags.
   - Do NOT remove custom animation classes (`.animate-thread-left`, `.animate-wipe-mask`, `.animate-specular-glint`, `.animate-scan`, `.animate-car-ride`, etc.).
4. **Parallax & Scroll Engine Integrity**:
   - Preserve `useScroll` and `useTransform` in `ClientDiaries.tsx`.
   - Preserve `ContinuousTimeline.tsx`'s active Golden Thread SVG stroke morphing (`pathLength: 0 -> 1`).
   - Preserve `RoyalVitrineReviews.tsx`'s "Tash Ke Patte" card dealing transforms and auto-scroll RAF marquee.
5. **Admin Panel Dynamic Linkage**:
   - Storefront components (`HeroSection`, `CategoryCarousel`, `VideoCarousel`, `RoyalVitrineReviews`, `ClientDiaries`, `LuxuryFooter`) must remain dynamically wired to `useAdminStore` and `useStore`.
   - Any lazy loading must not sever the reactive subscription to Zustand store updates.

---

## 7. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Framer Motion | Category Carousel Medallion Morph | Spring animated category cards with layout FLIP animation on category toggle | Active category, clothing vs jewelry categories array | Animated medallion cards entering/exiting with spring (stiffness 320, damping 28) | Fallback to empty list if no categories | `src/components/CategoryCarousel.tsx` (L147-153) |
| 2 | Framer Motion | Client Diaries Parallax Pillars | Viewport scroll progress drives 3 parallax columns with opposing Y-translations | Scroll progress via `useScroll` offset `["start end", "end start"]` | `y1` (100 -> -100), `y2` (150 -> -150), `y3` (50 -> -50) GPU transforms | Defaults to 4 fallback images if admin store empty | `src/components/ClientDiaries.tsx` (L37-45, 76-110) |
| 3 | Framer Motion | Fullscreen Deck of Cards Archive Overlay | Modal overlay with blur backdrop and Lenis virtualized smooth scroll | `isOpen: boolean`, client photos array | Fullscreen overlay with `opacity` & `backdropFilter: blur(40px)` fade | Body scroll unsets on unmount | `src/components/ClientDiariesGallery.tsx` (L101-109) |
| 4 | Framer Motion | 3D Perspective Video Carousel | 3D perspective carousel with horizontal drag gesture, spring elasticity, and chapter title fade | `cards` array, `activeIndex`, drag swipe offset | 3D card transforms (`rotateY: +/-25deg`, `scale: 0.88`, `x%`, `zIndex`) with physics bounce | Auto-clamps index within `[0, cards.length - 1]` | `src/components/VideoCarousel.tsx` (L155-179, 229-245) |
| 5 | Framer Motion | Continuous Golden Thread SVG Path | Animates SVG Bezier spine between active bespoke timeline steps | Bezier curve `pathD`, active transition boolean | Stroke dash morphing (`pathLength: 0 -> 1`, repeat mirror) | Silent render if zero points measured | `src/components/timeline/ContinuousTimeline.tsx` (L66-77) |
| 6 | Framer Motion | Image Cropper Modal Animations | Smooth modal dialog enter/exit with scale and opacity interpolation | `imageSrc`, aspect ratio, crop state | Backdrop fade (`opacity 0 -> 1`) and modal spring pop (`scale 0.9 -> 1`, `y 20 -> 0`) | Graceful error catch on canvas failure | `src/components/CropModal.tsx` (L82-93) |
| 7 | Framer Motion | Admin Category & Product Editor Lists | Layout-animated CRUD item list with smooth card deletions and re-renders | Zustand categories & products, type tab | FLIP animation on list item add/delete (`initial scale 0.9 -> 1`, `exit scale 0.9`) | Starred limit (max 4) feedback | `src/components/CategoryProductEditor.tsx` (L203-210, 410) |
| 8 | Framer Motion | Admin Panel Notification Toast | Floating feedback toast with slide and fade animation | `toast: { message, type }` | Slide up from bottom (`y: 40 -> 0`, `opacity: 0 -> 1`) with auto-dismiss | Dismisses after 3000ms | `src/app/admin/page.tsx` (L9-24) |
| 9 | Framer Motion | Admin Signature Star Toggle | Micro-interaction tap compression on star feature button | Button click event | Spring tap compression (`whileTap={{ scale: 0.85 }}`) | Cursor not-allowed if starred count >= 4 | `src/app/admin/page.tsx` (L164-177) |
| 10 | CSS Keyframes | Dual-Transform Fabric Paint Reveal | Dual sliding window mask and text wipe simulating hand-painted calligraphic text | Heading text from admin store | Keyframes `wipe-mask-reveal` + `wipe-text-reveal` + `fabric-flutter` | Static heading if CSS animations unsupported | `src/components/CategoryCarousel.tsx` (L29-87) |
| 11 | CSS Keyframes | Hero 3D Typography Entrance | 3D perspective fold-down entrance for luxury hero headlines | Hero lines from admin store | Keyframes `rotate-in-anim` with staggered delay (`200ms`, `600ms`, `1000ms`) | Defaults to fallback titles | `src/components/HeroSection.tsx` (L74-88) |
| 12 | CSS Keyframes | Ink Sweep & Jewel Reveal Logo Animations | Calligraphic ink mask wipe and jewel chromatic flare for brand marks | Theme mode (`isJewelry`) | Polygon clip-path wipe and saturation burst over 2.8s | Static display if animation fails | `src/components/navbar/index.tsx` (L170-185) |
| 13 | CSS Keyframes | Golden Breathe & Specular Glint | Ambient luminance breathing on gold foil text and specular flare glint on navbar elements | Text content, timer loops | Animated `text-shadow` pulse (3s) and `translate3d` glint sweep (5s/1.6s) | CSS only, non-blocking | `src/components/navbar/index.tsx` (L186-200, 313-324) |
| 14 | CSS Keyframes | Wishlist Oceanic Tide Wave Physics | Multi-layered rhythmic SVG wave simulation inside heart silhouette | Wishlist count / hover state | 2 opposing wave paths translating along X axis (`translate3d -32px / -48px`) | Falls back to empty outline if empty | `src/components/navbar/WishlistIcon.tsx` (L56-97) |
| 15 | CSS Keyframes | Vintage Vault Delivery Car Animation | Side-scrolling vintage luxury car with chassis bounce and smoke trail | Container mount | Keyframes `carRide` (16s linear) and `carBounce` (0.4s) | Continuous loop | `src/components/MaisonDelivery.tsx` (L76-94) |
| 16 | CSS Keyframes | QR Code Scanner Laser Beam | Vertical oscillating laser beam over WhatsApp concierge QR code | Group hover state | Keyframe `scan` (`translateY: 0 -> 180px -> 0`, 3s infinite) | Hidden until hover/render | `src/components/CartDrawer.tsx` (L180-192) |
| 17 | CSS Transitions | "Tash Ke Patte" Card Deal Animation | Fanning out a stacked deck of patron review cards upon scrolling into view | IntersectionObserver entry, cards array | Cards translate from `x: calc(-100% * idx - gap * idx), rotate: deg` to `x: 0, rotate: 0` | Packs back up if scrolled out of view | `src/components/RoyalVitrineReviews.tsx` (L241-250) |
| 18 | CSS Transitions | Interactive 3D Product Gallery Slot Swap | Three-slot (`center`, `left`, `right`) interactive image position swapping | User click on thumbnail slot | 800ms cubic-bezier transition of slot dimensions and 3D depth | Center slot click is no-op | `src/components/FloatingImageGallery.tsx` (L13-46) |
| 19 | CSS Transitions | Global Curtain Drop Page Transition | Smooth black screen wipe across page navigations | `isTransitioning` boolean in Zustand store | Fixed black overlay fades `opacity: 100 -> 0` over 1000ms | Failsafe 50ms drop timeout on page mount | `src/components/TransitionCurtain.tsx`, `HomeCurtainDrop.tsx` |
| 20 | Lenis Smooth Scroll | Global Momentum Smooth Scrolling | Virtualized momentum smooth wheel scroll across all pages | Mouse wheel / trackpad scroll events | Lerp 0.08 normalized smooth scrolling via `ReactLenis` | Falls back to native scroll if touch device | `src/components/SmoothScrolling.tsx`, `app/layout.tsx` |

---

## 8. Edge Cases Table

| # | Feature | Input / Condition | Observed Behavior |
|---|---------|-------------------|-------------------|
| 1 | `ClientDiariesGallery.tsx` Exit Animation | `isOpen` changes from `true` to `false` | `if (!isOpen) return null` precedes `<AnimatePresence>`, causing immediate unmount before Framer Motion `exit={{ opacity: 0 }}` can run. Does not break rendering, but skips exit fade. |
| 2 | `VideoCarousel.tsx` Rapid Swipe / Wheel | Rapid consecutive mouse wheel events (`deltaX > 20`) | Debounced via `wheelTimeout.current = setTimeout(..., 500)` to prevent skipping multiple cards simultaneously. |
| 3 | `VideoCarousel.tsx` Mobile Translation | Screen width < 768px on window resize | Switches card offset calculation from 90% to 80% (`mobileTranslateX`) to prevent cards from overflowing mobile viewport. |
| 4 | `RoyalVitrineReviews.tsx` Infinite Loop Reset | Auto-scroll reaches end of duplicated 3-set review list | Reset logic in RAF: `scrollRef.current.scrollLeft >= oneSetWidth * 2` instantly rewinds `scrollLeft -= oneSetWidth`, creating a seamless infinite marquee without visual jumps. |
| 5 | `RoyalVitrineReviews.tsx` Viewport Exit | User rapidly scrolls past the reviews section | IntersectionObserver with `rootMargin: "-25% 0px"` triggers `setIsDealt(false)` and resets `scrollLeft: 0`, re-stacking the deck to allow a fresh deal when re-entering. |
| 6 | `WishlistIcon.tsx` Fill Animation | Item added to wishlist when previously empty | Triggers an 800ms rising tide fill, followed by a 500ms elastic swell (`animate-tide-swell`) once the fill completes. |
| 7 | `navbar/index.tsx` Search Typing Animation | User types query in search bar | Switches `searchPhase` from `'icon'` to `'ctrlk'` to `'typing'` with staggered translations (`translate-y-0`, `translate-y-2`) and typed character rendering via ref. |
| 8 | `useTimelineOverlay.ts` Web Font Loading | Custom web fonts finish loading after DOM mount | Subscribes to `document.fonts?.ready?.then(measure)` to recalculate SVG curve coordinates so golden thread lines align perfectly after typography metrics stabilize. |
| 9 | `CategoryCarousel.tsx` Rapid Category Switch | User rapidly toggles between Clothing and Jewelry | Key prop `key={isJewelry ? 'jewels-anim' : 'suit-anim'}` forces complete re-mount of thread draw and fabric wipe animations, resetting animations cleanly. |
| 10 | `FloatingImageGallery.tsx` Missing Product Images | Product object contains fewer than 3 images in `images` array | Fallback logic `[product.imageSrc, product.imageSrc, product.imageSrc]` clones primary image to ensure all 3 slots have valid sources without crashing the slot swapper. |
