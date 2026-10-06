# Handoff Report — Explorer Survey 1 (R1: LCP & Asset Optimization)

**Agent**: `explorer_survey_1` (`teamwork_preview_explorer`)  
**Working Directory**: `c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/teamwork_preview_explorer_survey_1`  
**Date**: 2026-10-05 (UTC)  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

### Obs 1: Build Blocker in `layout.tsx`
- **Command Executed**: `npm run build` in `c:/Users/satya/Documents/antigravity/modest-hypatia/frontend`
- **Exit Code**: 1
- **Verbatim Error Output**:
  ```
  ▲ Next.js 16.3.6 (Turbopack)
  - Environments: .env.local
  ✓ Running next.config.ts took 103ms

    Creating an optimized production build ...
  ✓ Compiled successfully in 5.9s
    Running TypeScript ...
  src/app/layout.tsx(1,15): error TS2300: Duplicate identifier 'Metadata'.
  src/app/layout.tsx(17,10): error TS2300: Duplicate identifier 'Metadata'.
  Failed to type check.
  ```
- **File Reference**: `frontend/src/app/layout.tsx`
  - Line 1: `import type { Metadata } from "next";`
  - Line 17: `import { Metadata, Viewport } from "next";`

### Obs 2: Above-the-Fold Hero Section Background Strategy
- **File Reference**: `frontend/src/components/HeroSection.tsx`
  - Lines 28-30:
    ```tsx
    const videoSrc = isJewelry ? adminStore.jewelryHeroVideo : adminStore.clothingHeroVideo;
    const posterSrc = isJewelry ? adminStore.jewelryHeroFallbackImage : adminStore.clothingHeroFallbackImage;
    ```
  - Lines 37-58:
    ```tsx
    {videoSrc ? (
      <video
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        suppressHydrationWarning
        poster={posterSrc || adminStore.clothingHeroBg}
        className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
      >
        <source src={videoSrc} type="video/webm" />
      </video>
    ) : (
      <img
        src={posterSrc || adminStore.clothingHeroBg}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
        fetchPriority="high"
        decoding="sync"
      />
    )}
    ```
- **File Reference**: `frontend/src/store/useAdminStore.ts`
  - Line 863: `clothingHeroVideo: '',`
  - Line 865: `clothingHeroFallbackImage: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg',`
  - Line 867: `clothingHeroBg: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg',`
  - Line 884: `jewelryHeroVideo: 'https://assets.mixkit.co/videos/preview/mixkit-sparkling-jewelry-on-a-black-background-34354-large.mp4',`
  - Line 886: `jewelryHeroFallbackImage: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg',`
- **Result**: In default Clothing mode, `videoSrc` is empty (`""`). The component renders raw `<img>` pointing directly to an external, uncompressed Pexels JPEG. Next.js `<Image>` is bypassed; no preload `<link>` is emitted in `<head>`. In Jewelry mode, `<source src={videoSrc} type="video/webm" />` points to an `.mp4` file with an incorrect `type="video/webm"` attribute and no `preload="metadata"` attribute.

### Obs 3: Navbar Brand Logos
- **Desktop Navbar**: `frontend/src/components/navbar/index.tsx`
  - Lines 206-213: Next.js `<Image src={clothingLogoUrl} alt="Raani Closet Boutique Logo" width={130} height={65} priority />`
  - Lines 226-233: Next.js `<Image src={jewelryLogoUrl} alt="Raani Closet High Jewels Logo" width={130} height={65} priority />`
  - Correctly utilizes `next/image` with `priority`.
- **Mobile Navbar**: `frontend/src/components/NavbarWrapper.tsx`
  - Line 59: `<img src="/raani-logo-new.png" alt="Logo" className="object-contain h-full w-auto mix-blend-multiply origin-left" />`
  - Uses raw `<img>` without `priority`, dimensions, or Next.js image optimization for the 220 KB `/raani-logo-new.png` file.

### Obs 4: Font Loading Configuration
- **File Reference**: `frontend/src/app/layout.tsx`
  - Lines 5-8:
    ```tsx
    const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
    const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["300", "400", "500"] });
    const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-painter" });
    const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-royal" });
    ```
- All 4 fonts are loaded via `next/font/google`, self-hosted at build time. No external Google Fonts CDN HTTP requests are generated. `display: 'swap'` is not explicitly specified in options.

### Obs 5: `next.config.ts` Image & Cache Configuration
- **File Reference**: `frontend/next.config.ts`
  - Lines 3-11:
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
      ...
    };
    ```
- Only `remotePatterns` with `**` is defined. `formats: ['image/avif', 'image/webp']`, `minimumCacheTTL`, and `compress: true` are absent.

### Obs 6: Below-the-Fold Bandwidth Contention
- **File Reference**: `frontend/src/components/BespokeBanner.tsx`
  - Line 58: `<img src={bgImage} alt={title} ... fetchPriority="high" />`
  - Deep below the fold (section 5), but requests high fetch priority over Hero assets.
- **File Reference**: `frontend/src/components/VideoCarousel.tsx`
  - Lines 200-210: 4 separate `<video autoPlay loop muted playsInline />` elements play and buffer simultaneously on mount without `preload="none"`.
- **File Reference**: `frontend/src/app/page.tsx`
  - Synchronously imports all 10 components without `next/dynamic`. `MaisonDelivery` is imported at line 9 but unused.

---

## 2. Logic Chain

1. **Premise**: Google Core Web Vitals LCP measures the render time of the largest visual element visible in the initial viewport (above the fold).
2. **From Obs 2**: In default storefront mode (Clothing), the Hero section (`HeroSection.tsx`) occupies the full initial viewport below the 85px navbar (`h-[calc(100vh-85px)]`). Because `adminStore.clothingHeroVideo` is `""`, the hero renders line 51: a raw HTML `<img>` tag with `src="https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg"`.
3. **Inference**: A raw `<img>` tag cannot participate in Next.js build-time or runtime image optimization. Next.js does not inject `<link rel="preload" as="image">` into the server-rendered `<head>` for raw `<img>` tags. Consequently, the browser parser cannot start downloading the image until client JS executes, and then downloads an uncompressed multi-megabyte JPEG instead of an optimized ~80KB AVIF/WebP image matching the device viewport.
4. **From Obs 2 & Obs 3**: Mobile users additionally download the 220 KB `/raani-logo-new.png` through an unoptimized `<img>` without `priority`.
5. **From Obs 6**: While the browser is attempting to download the Hero image, `BespokeBanner.tsx` requests `fetchPriority="high"` on its below-the-fold image, and `VideoCarousel.tsx` triggers 4 simultaneous video downloads via `autoPlay`. This leads to socket and bandwidth starvation for the Hero asset.
6. **From Obs 1**: Any modification to improve LCP will fail the project's build gate (`npm run build`) unless the duplicate `Metadata` import in `layout.tsx` is fixed.

---

## 3. Caveats

- **No live Lighthouse run**: Analysis is based on source code auditing and build execution rather than a headless browser trace, as the dev server was not launched during this survey.
- **Dynamic Admin URL Changes**: While default store values point to Pexels and Mixkit URLs, admins can input custom URLs via `useAdminStore`. Recommendations must support arbitrary remote URLs (which `remotePatterns: [{ protocol: "https", hostname: "**" }]` currently permits).
- **Three.js Dependencies**: `three` and `@react-three/fiber` exist in `package.json` but are not imported in `frontend/src/`, confirming they do not contribute to initial bundle weight.

---

## 4. Conclusion

The primary LCP bottleneck is `frontend/src/components/HeroSection.tsx` rendering a raw `<img>` tag pointing to an uncompressed external JPEG without Next.js preloading or responsive AVIF/WebP transformation.

### Prescribed Remediation Plan:
1. **Fix `layout.tsx`**: Consolidate `Metadata, Viewport` imports to satisfy `tsc` / `npm run build`.
2. **Upgrade `HeroSection.tsx`**:
   - Replace fallback `<img>` with Next.js `<Image fill priority sizes="100vw" quality={85} />`.
   - Update `<video>` tag with `preload="metadata"` and dynamic MIME type handling (`type={videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'}`).
3. **Upgrade Mobile Navbar**: In `NavbarWrapper.tsx`, replace raw `<img>` with `<Image width={90} height={28} priority />`.
4. **Enhance `next.config.ts`**: Enable AVIF/WebP formats, aggressive cache TTL, and payload compression.
5. **Throttle Below-the-Fold Preemptions**: Demote `BespokeBanner.tsx` fetch priority (`fetchPriority="low"`, `loading="lazy"`) and set `preload="none"` on inactive carousel videos.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Build Blocker**:
   ```powershell
   cd frontend
   npm run build
   ```
   *Expected result*: Compiler error TS2300 in `src/app/layout.tsx`.

2. **Verify Hero Asset Strategy**:
   Inspect `frontend/src/components/HeroSection.tsx` lines 37-58 and verify that raw `<img>` is rendered when `videoSrc` is empty.

3. **Verify Mobile Navbar Logo**:
   Inspect `frontend/src/components/NavbarWrapper.tsx` line 59 and verify raw `<img>` with no `priority`.

4. **Verify Invalidating Condition**:
   If `frontend/src/app/layout.tsx` lines 1 and 17 are merged into `import type { Metadata, Viewport } from "next";`, the TypeScript compiler error TS2300 is resolved.
