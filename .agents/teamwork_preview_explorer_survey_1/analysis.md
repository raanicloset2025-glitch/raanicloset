# LCP & Above-the-Fold Asset Optimization Analysis (R1)

**Investigator**: `explorer_survey_1` (`teamwork_preview_explorer`)  
**Target Project**: `frontend` (Raani Atelier Luxury E-Commerce)  
**Date**: 2026-10-05 (UTC)  
**Status**: Comprehensive Survey Complete  

---

## 1. Executive Summary

A comprehensive architectural and asset survey was conducted across `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`, `frontend/src/components/navbar/index.tsx`, `frontend/src/components/NavbarWrapper.tsx`, `frontend/src/components/HeroSection.tsx`, `frontend/next.config.ts`, and `frontend/package.json`.

### Critical Highlights:
1. **Build Blocker Identified**: Running `npm run build` in `frontend/` currently **fails** with TypeScript error `TS2300` in `frontend/src/app/layout.tsx` (lines 1 & 17 contain duplicate `Metadata` imports from `"next"`). This must be rectified before any production verification can succeed.
2. **Hero LCP Bottleneck**: In default Clothing mode, the above-the-fold Hero background (`HeroSection.tsx`, line 51) uses an unoptimized native `<img>` tag pulling a massive remote image from Pexels (`https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg`). This bypasses Next.js image optimization, generates no `<link rel="preload">` in the SSR `<head>`, and downloads full-resolution uncompressed megabytes after client JS mounts.
3. **Mobile Navbar Logo Unoptimized**: In `NavbarWrapper.tsx` (line 59), the mobile navbar logo uses an unoptimized raw `<img>` tag without `priority`, explicit dimensions, or WebP/AVIF conversion for the 220 KB `/raani-logo-new.png`.
4. **Hero Video MIME & Preload Issues**: In Jewelry mode, `<video>` in `HeroSection.tsx` (line 48) hardcodes `type="video/webm"` for an `.mp4` file (`...large.mp4`), lacks `preload="metadata"`, and does not preload its poster image.
5. **Initial Network Contention**: Components situated far below the fold (`BespokeBanner.tsx` and `VideoCarousel.tsx`) compete for initial network bandwidth by requesting `fetchPriority="high"` on below-the-fold images and initiating autoplay video streams on page mount.
6. **Next.js Config Optimization Opportunities**: `next.config.ts` lacks AVIF/WebP image formats and cache TTL configuration.

---

## 2. Build System Diagnostics

- **Framework**: Next.js 16.3.6 (Turbopack bundler)
- **Runtime / Libraries**: React 19.2.8, Tailwind CSS v4, Zustand 5.0.15, Framer Motion 13.4.4
- **Build Script**: `npm run build` (`next build`) in `frontend/package.json`

### Build Verification Command:
```powershell
cd frontend
npm run build
```

### Compiler Failure Observed:
```
src/app/layout.tsx(1,15): error TS2300: Duplicate identifier 'Metadata'.
src/app/layout.tsx(17,10): error TS2300: Duplicate identifier 'Metadata'.
Failed to type check.
```

#### Exact Line Reference:
- `frontend/src/app/layout.tsx`:
  - Line 1: `import type { Metadata } from "next";`
  - Line 17: `import { Metadata, Viewport } from "next";`
- **Resolution**: Consolidate imports into `import type { Metadata, Viewport } from "next";` on line 1 and remove line 17.

---

## 3. Above-the-Fold Media Inventory & Loading Strategy

The initial viewport (first 100vh) consists of:
1. Top Navbar (`h-[85px]` desktop, `h-[40px]` mobile)
2. Hero Section (`h-[calc(100vh-85px)] shrink-0`)

### Detailed Asset Breakdown:

| Asset / Element | Location | Implementation | Current Attributes | Issues / Observations |
|---|---|---|---|---|
| **Desktop Boutique Logo** | `navbar/index.tsx:206-213` | Next.js `<Image>` | `width={130}`, `height={65}`, `priority` | Properly configured with `priority`. Default source is `/raani-logo-new.png` (220 KB). |
| **Desktop High Jewels Logo** | `navbar/index.tsx:226-233` | Next.js `<Image>` | `width={130}`, `height={65}`, `priority` | Properly configured with `priority`. |
| **Mobile Navbar Logo** | `NavbarWrapper.tsx:59` | Native `<img>` | `src="/raani-logo-new.png"` | **Flaw**: Standard `<img>`, no `priority`, no explicit width/height, downloads full 220 KB PNG without WebP/AVIF. |
| **Global Viewport Background** | `NavbarWrapper.tsx:28-40`, `navbar/index.tsx:157-161` | CSS background | Fixed `radial-gradient` / solid `#F9F6F0` | **Optimal**: Pure CSS, 0 HTTP requests. |
| **Hero Image (Clothing)** | `HeroSection.tsx:51-58` | Native `<img>` | `fetchPriority="high"`, `decoding="sync"` | **Critical LCP Flaw**: Default `clothingHeroVideo` is empty; fallback `<img>` loads remote Pexels image (`https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg`). Bypasses Next.js `<Image>`, no SSR `<link rel="preload">` in `<head>`, no responsive sizing, raw multi-megabyte payload. |
| **Hero Video (Jewelry)** | `HeroSection.tsx:38-49` | Native `<video>` | `autoPlay`, `loop`, `muted`, `playsInline`, `poster` | **Flaws**: Missing `preload="metadata"`; `<source type="video/webm">` MIME mismatch with `.mp4` file; poster image is not preloaded in head. |
| **Hero Typography Animation** | `HeroSection.tsx:118-144` | CSS `.rotate-in` | `opacity: 0.01`, delay `200ms`-`1500ms` | Starting opacity `0.01` and delayed keyframes can defer Google LCP text paint recognition. |
| **Favicons / App Icons** | `app/icon.png`, `app/apple-icon.png` | Next.js metadata route | Raw static PNGs | Each icon is **376 KB**, loaded in initial document head. |

---

## 4. Typography & Font Loading Survey

Declared in `frontend/src/app/layout.tsx` (lines 5-8):
```tsx
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["300", "400", "500"] });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-painter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-royal" });
```

### Assessment:
- Next.js `next/font/google` automatically self-hosts these fonts locally in `.next/static/media/` during build time, completely avoiding external third-party requests to `fonts.googleapis.com` or `fonts.gstatic.com`.
- Fonts are injected via CSS variables into `<body>` with `font-sans antialiased`.
- **Recommendation**: Explicitly specify `display: "swap"` in font configurations to eliminate any potential FOIT (Flash of Invisible Text) during font resolution.

---

## 5. Next.js Configuration (`next.config.ts`) Analysis

Current configuration in `frontend/next.config.ts`:
```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() { ... }
};
```

### Opportunities for Immediate LCP Gains:
1. **Modern Image Formats**: Add `formats: ['image/avif', 'image/webp']`. AVIF provides 20-30% smaller files than WebP for high-detail luxury fabric textures and diamond jewelry.
2. **Image Cache Duration**: Set `minimumCacheTTL: 2592000` (30 days) so optimized remote images (e.g. from Pexels or CDN) are cached aggressively by Next.js and Cloudflare.
3. **Compression**: Enable `compress: true` for Gzip/Brotli text compression on JSON and HTML payloads.

---

## 6. Below-the-Fold Bandwidth Contention (R1 / R2 Intersection)

Even when Hero assets are optimized, below-the-fold assets mounted synchronously in `page.tsx` directly steal connection sockets and bandwidth from the LCP asset during initial page load:

1. **`BespokeBanner.tsx` (lines 54-59)**:
   - Contains `<img src={bgImage} fetchPriority="high" />`.
   - **Hazard**: `fetchPriority="high"` on section 5 tells the browser's HTTP/2 multiplexer to prioritize this below-the-fold image over Hero assets. It should use `loading="lazy"` and `fetchPriority="low"`.
   - Lines 60-76: Auto-playing video in `BespokeBanner` triggers network buffering on mount.
2. **`VideoCarousel.tsx` (lines 200-210)**:
   - Renders 4 separate `<video autoPlay loop muted playsInline />` instances simultaneously on mount.
   - All 4 videos buffer immediately, saturating bandwidth even before the user scrolls past the Hero.
   - Video elements should have `preload="none"` unless active, or defer mount until scrolled into view.
3. **Static Page Assembly (`frontend/src/app/page.tsx`)**:
   - `page.tsx` synchronously imports all 10 components without `next/dynamic`.
   - Unused import: `MaisonDelivery` is imported at line 9 but never rendered.

---

## 7. Actionable Optimization Blueprint for Implementers

### A. Fix Compilation Failure
- **File**: `frontend/src/app/layout.tsx`
- **Action**: Combine lines 1 & 17:
  ```tsx
  import type { Metadata, Viewport } from "next";
  ```
  Remove duplicate `import { Metadata, Viewport } from "next";`.

### B. Convert Hero Background to Next.js `<Image>` with `priority`
- **File**: `frontend/src/components/HeroSection.tsx`
- **Action**: Replace fallback `<img>` with Next.js `<Image>`:
  ```tsx
  import Image from 'next/image';

  {videoSrc ? (
    <video
      key={videoSrc}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      suppressHydrationWarning
      poster={posterSrc || adminStore.clothingHeroBg}
      className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
    >
      <source src={videoSrc} type={videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
    </video>
  ) : (
    <Image
      src={posterSrc || adminStore.clothingHeroBg}
      alt="Hero Background"
      fill
      priority
      quality={85}
      sizes="100vw"
      className="object-cover opacity-40 transition-opacity duration-1000 pointer-events-none"
    />
  )}
  ```
- **Rationale**: Next.js automatically creates a `<link rel="preload" as="image" href="..." fetchpriority="high">` in the server-rendered HTML `<head>`. The browser requests the image immediately while HTML is parsing, before client scripts run. Viewport-optimized WebP/AVIF format shrinks payload from 2-4MB down to ~80KB.

### C. Optimize Mobile Navbar Logo
- **File**: `frontend/src/components/NavbarWrapper.tsx` (line 59)
- **Action**: Convert raw `<img>` to `<Image src="/raani-logo-new.png" alt="Logo" width={90} height={28} priority className="object-contain h-full w-auto mix-blend-multiply origin-left" />`.

### D. Update Next.js Configuration
- **File**: `frontend/next.config.ts`
- **Action**: Add `formats: ['image/avif', 'image/webp']`, `minimumCacheTTL: 2592000`, and `compress: true`.

### E. Demote Below-the-Fold Bandwidth Claims
- In `BespokeBanner.tsx`: Change `fetchPriority="high"` to `loading="lazy"` / `fetchPriority="low"`, and set `<video preload="none">`.
- In `VideoCarousel.tsx`: Add `preload="none"` to inactive card `<video>` elements to stop bandwidth competition on page load.
