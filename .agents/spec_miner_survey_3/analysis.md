# Technical Specification & Analysis: Frontend Dynamic SEO Metadata & Safe Migration

**Agent**: `spec_miner_survey_3` (`teamwork_preview_spec_miner`)  
**Date**: 2026-10-06  
**Workspace**: `c:/Users/satya/Documents/antigravity/modest-hypatia`  
**Target Codebase**: `frontend/` (`frontend/src/app/layout.tsx`, `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.ts`)  
**Authoritative References**: `ORIGINAL_REQUEST.md` (R3: Dynamic SEO in Frontend) & `DISPATCH.md`

---

## 1. Executive Summary

This specification report details the architecture, interfaces, network lifecycle, fallback mechanisms, and verification criteria for dynamically hydrating SEO metadata (Domain, Titles, Descriptions, Logos/Images) from the Rust Cloudflare Worker backend (`http://localhost:8787/api/settings`) inside `frontend/src/app/layout.tsx` using Next.js App Router's `generateMetadata` function.

### Key Discoveries & Pre-conditions:
1. **Critical Pre-existing Bug Discovered**: Running `npm run build` or `npx tsc --noEmit` on the current frontend baseline failed with:
   ```
   src/app/layout.tsx(1,15): error TS2300: Duplicate identifier 'Metadata'.
   src/app/layout.tsx(17,10): error TS2300: Duplicate identifier 'Metadata'.
   ```
   Line 1 imports `import type { Metadata } from "next";` and Line 17 duplicates `import { Metadata, Viewport } from "next";`. Consolidating imports to `import type { Metadata, Viewport } from "next";` resolves this defect completely, as zero other TypeScript errors exist in `frontend/`.
2. **Next.js App Router Metadata Invariant**: A Next.js route or layout **cannot** export both static `export const metadata: Metadata` and dynamic `export async function generateMetadata()`. Attempting to do so triggers a Next.js build-time error. The static object must be repurposed as `DEFAULT_METADATA` fallback.
3. **Zero UI / Layout Degradation Guarantee**: `RootLayout` remains a Server Component rendering the exact same JSX tree (`<html>`, `<body>`, Google Fonts variables, JSON-LD `<script>`, `<Providers>`, `<SmoothScrolling>`, `{children}`, `<CartDrawer />`, `<AuthModal />`, `<FloatingWhatsApp />`). Next.js injects `<head>` tags automatically via `generateMetadata()`, leaving the DOM tree, layout, and styling 100% unaltered.
4. **Resilient Network Safety (Zero Crashes)**: Next.js evaluates `generateMetadata` during static prerendering (`next build`) and server runtime. If `localhost:8787` is unreachable (e.g. during build, offline CI, network partitions, or initial database emptiness), an `AbortController` (1500ms timeout) combined with comprehensive `try/catch` guarantees that `generateMetadata` cleanly falls back to `DEFAULT_METADATA` without hanging or throwing exceptions.

---

## 2. Current Baseline State: `frontend/src/app/layout.tsx`

### 2.1 File Structure & Imports (Lines 1–18)
```tsx
import type { Metadata } from "next"; // Line 1 (Duplicate #1)
import { Playfair_Display, Montserrat, Great_Vibes, Cinzel } from "next/font/google"; // Line 2
import "./globals.css"; // Line 3

// Google Fonts configuration
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["300", "400", "500"] });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-painter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-royal" });

import SmoothScrolling from "@/components/SmoothScrolling";
import CartDrawer from '@/components/CartDrawer';
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AuthModal from "@/components/AuthModal";

import { Providers } from "./Providers";

import { Metadata, Viewport } from "next"; // Line 17 (Duplicate #2 -> causes TS2300)
```

### 2.2 Viewport Configuration (Lines 19–24)
```tsx
export const viewport: Viewport = {
  themeColor: "#1A0B16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
```
*Specification*: In Next.js 14+, `viewport` is separated from `metadata`. This static export must be retained untouched.

### 2.3 Static Metadata Baseline (Lines 26–68)
```tsx
export const metadata: Metadata = {
  title: {
    default: "Raani Closet | Bespoke Vintage Elegance & High Jewels",
    template: "%s | Raani Closet Boutique",
  },
  description: "Raani Closet is an ultra-luxury bespoke boutique offering handcrafted vintage suits, haute couture, and exquisite high jewelry.",
  keywords: ["Raani Closet", "Bespoke Vintage Elegance", "Luxury Boutique", "High Jewels", "Custom Suits", "Indian Haute Couture", "Raani Closet Boutique"],
  authors: [{ name: "Raani Closet" }],
  creator: "Raani Closet",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://raani.pages.dev",
    siteName: "Raani Closet",
    title: "Raani Closet | Bespoke Vintage Elegance & High Jewels",
    description: "Discover handcrafted vintage suits, haute couture, and exquisite high jewelry at Raani Closet.",
    images: [
      {
        url: "/raani-logo-new.png",
        width: 1200,
        height: 630,
        alt: "Raani Closet Luxury Boutique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raani Closet | Bespoke Vintage Elegance",
    description: "Discover handcrafted vintage suits, haute couture, and exquisite high jewelry at Raani Closet.",
    images: ["/raani-logo-new.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

### 2.4 JSON-LD Structured Data & RootLayout Component (Lines 70–112)
```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Raani Closet",
  "image": "https://raani.pages.dev/raani-logo-new.png",
  "description": "Raani Closet is an ultra-luxury bespoke boutique offering handcrafted vintage suits, haute couture, and exquisite high jewelry.",
  "url": "https://raani.pages.dev",
  "telephone": "+919876543210",
  "priceRange": "$$$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Luxury District",
    "addressLocality": "Mumbai",
    "addressRegion": "MH",
    "postalCode": "400001",
    "addressCountry": "IN"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${montserrat.variable} ${greatVibes.variable} ${cinzel.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <SmoothScrolling>
            {children}
            <CartDrawer />
            <AuthModal />
            <FloatingWhatsApp />
          </SmoothScrolling>
        </Providers>
      </body>
    </html>
  );
}
```

---

## 3. Dynamic SEO Specification & `generateMetadata` Architecture

### 3.1 Next.js App Router Invariants
1. **Mutual Exclusivity**: You cannot export both `metadata` and `generateMetadata` in `layout.tsx`.
   - **Specification**: Remove `export const metadata: Metadata` and rename to `const DEFAULT_METADATA: Metadata`.
   - Export an async function `export async function generateMetadata(): Promise<Metadata>`.
2. **Execution Timing**: Next.js calls `generateMetadata` during:
   - Server-side rendering (SSR) of each request if dynamic.
   - Build-time static generation (`npm run build`) during route optimization.
   - Incremental Static Regeneration (ISR) revalidation ticks.
3. **Head Tag Injection**: In Next.js App Router, layout components do **not** render `<head>` manually. The object returned by `generateMetadata()` is automatically transformed into HTML tags by Next.js:
   - `<title>`
   - `<meta name="description" content="...">`
   - `<meta property="og:title" content="...">`, `<meta property="og:description" content="...">`, `<meta property="og:url" content="...">`, `<meta property="og:image" content="...">`
   - `<meta name="twitter:card" content="...">`, `<meta name="twitter:title" content="...">`, `<meta name="twitter:image" content="...">`
   - `<meta name="robots" content="...">`

### 3.2 Backend Endpoint Contract (`http://localhost:8787/api/settings`)
As analyzed in `explorer_survey_1` (Backend) and `explorer_survey_2` (Admin):
- The Cloudflare Worker exposes `GET /api/settings`.
- In the D1 `settings` table (`key TEXT PRIMARY KEY, value TEXT NOT NULL`), settings are stored under `key = 'global'` as a JSON document.
- `GET /api/settings` returns either:
  - Direct JSON Object: `{ "brandName": "...", "clothingLogo": "...", "clothingCategoryHeading": "...", "domain": "...", "seoTitle": "...", "seoDescription": "..." }`
  - Or wrapped: `{ "value": "{...}" }` or `{ "data": { ... } }`
  - Or empty on fresh install: `{}` or `null`.
- CORS is enabled with `Access-Control-Allow-Origin: *`.

### 3.3 Data Mapping Specification
The dynamic settings payload maps to Next.js `Metadata` fields as follows:

| Settings Payload Field | Target Next.js Metadata Property | Transformation / Fallback Logic |
|---|---|---|
| `seoTitle` / `clothingCategoryHeading` / `brandName` | `title.default` | If `seoTitle` exists, use it. Else if `clothingCategoryHeading` exists, format as `${brandName} \| ${clothingCategoryHeading}`. Fallback: `"Raani Closet \| Bespoke Vintage Elegance & High Jewels"`. |
| `brandName` | `title.template` | Format as `"%s \| " + (brandName || "Raani Closet Boutique")`. |
| `seoDescription` / `clothingSubtext` | `description` | If `seoDescription` exists, use it. Else if `clothingSubtext`, format as `${brandName} - ${clothingSubtext}`. Fallback: `DEFAULT_METADATA.description`. |
| `domain` | `openGraph.url` & `metadataBase` | Use `new URL(domain)` or fallback to `"https://raani.pages.dev"`. |
| `clothingLogo` / `jewelryLogo` | `openGraph.images[0].url`, `twitter.images[0]` | If a valid logo URL is supplied, use it for social share preview image; fallback to `"/raani-logo-new.png"`. |
| `brandName` | `openGraph.siteName` | Use `settings.brandName || "Raani Closet"`. |
| `keywords` | `keywords` | If string or array in settings, sanitize; fallback to default luxury keyword list. |
| `robots` | `robots` | Retain default indexing rules (`index: true, follow: true`). |

---

## 4. Resilient Network Fetch & Fallback Mechanics (Zero Crashes Guarantee)

To guarantee that the frontend NEVER crashes during `npm run build` or runtime if the backend is down, slow, or returning invalid data, the implementation must adhere to this defensive fetch specification:

```tsx
interface SettingsPayload {
  brandName?: string;
  clothingCategoryHeading?: string;
  clothingSubtext?: string;
  clothingLogo?: string;
  jewelryLogo?: string;
  domain?: string;
  seoTitle?: string;
  seoDescription?: string;
  [key: string]: unknown;
}

const SETTINGS_ENDPOINT = process.env.SETTINGS_API_URL || "http://localhost:8787/api/settings";

async function fetchDynamicSettings(): Promise<SettingsPayload | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s hard timeout

    const res = await fetch(SETTINGS_ENDPOINT, {
      signal: controller.signal,
      next: { revalidate: 60 }, // ISR: cache for 60 seconds
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || typeof data !== "object") {
      return null;
    }

    // Handle single-row JSON string encapsulation if present
    if (typeof data.value === "string") {
      try {
        return JSON.parse(data.value);
      } catch {
        return null;
      }
    }

    return (data.data && typeof data.data === "object") ? data.data : data;
  } catch {
    // Gracefully catch ECONNREFUSED, AbortError, DNS failure, or JSON parse error
    return null;
  }
}
```

### Complete Failure Matrix

| Failure Mode | Root Cause / Trigger | Observable Exception | Mitigation in `generateMetadata` | Resulting UX |
|---|---|---|---|---|
| **Backend Offline** | Cloudflare Worker / Wrangler dev not running on port 8787 during `next build` | `TypeError: fetch failed` (`ECONNREFUSED`) | Caught by `catch { return null; }` | Returns `DEFAULT_METADATA`, build completes with 0 errors |
| **Backend Hang / Slow DB** | Cold start or hanging worker execution | Unresolved Promise / build hangs | `AbortController` triggers at 1500ms; caught by `catch` | Aborted cleanly within 1.5s; returns `DEFAULT_METADATA` |
| **HTTP 500 / 502 / 404** | D1 query syntax error or unseeded route | Non-2xx HTTP status | `if (!res.ok) return null;` | Bypasses parsing; returns `DEFAULT_METADATA` |
| **Corrupt JSON Response** | Worker returns HTML error page (Cloudflare 500 HTML) | `SyntaxError: Unexpected token '<'` | Caught by `catch` during `res.json()` | Bypasses error; returns `DEFAULT_METADATA` |
| **Empty Settings Table** | D1 table created but unseeded (`{}` or `null`) | Empty object or null data | Coalescing operator `settings.seoTitle || DEFAULT...` | Uses default values for every field |
| **Missing Individual Keys** | Settings contains only `clothingLogo`, no `seoTitle` | `undefined` properties | Deep spread of `DEFAULT_METADATA` with property fallback | Dynamic logo applied, titles remain defaults |

---

## 5. Ensuring Zero UI, Styling, and DOM Breakage

### Invariants for `RootLayout`:
1. **No JSX Modifications**: The JSX return statement inside `RootLayout` must remain byte-for-byte functionally identical to the baseline:
   ```tsx
   export default function RootLayout({
     children,
   }: Readonly<{
     children: React.ReactNode;
   }>) {
     return (
       <html lang="en">
         <body className={`${playfair.variable} ${montserrat.variable} ${greatVibes.variable} ${cinzel.variable} font-sans antialiased`}>
           <script
             type="application/ld+json"
             dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
           />
           <Providers>
             <SmoothScrolling>
               {children}
               <CartDrawer />
               <AuthModal />
               <FloatingWhatsApp />
             </SmoothScrolling>
           </Providers>
         </body>
       </html>
     );
   }
   ```
2. **Font Variables Preservation**: All 4 fonts (`playfair`, `montserrat`, `greatVibes`, `cinzel`) must stay initialized with their exact CSS variables (`--font-playfair`, `--font-montserrat`, `--font-painter`, `--font-royal`).
3. **Component Wrappers**: `<Providers>`, `<SmoothScrolling>`, `<CartDrawer />`, `<AuthModal />`, and `<FloatingWhatsApp />` must remain in exact positions and hierarchy.
4. **CSS Imports**: `import "./globals.css";` must remain at the top level.

---

## 6. Build and Verification Specifications

### 6.1 Build Pipeline Commands
All commands run in `frontend/`:
- **TypeScript Typecheck**:
  ```powershell
  npx tsc --noEmit
  ```
  *Baseline Observation*: Currently fails due to duplicate `Metadata` import on line 1 and 17. Once consolidated, passes with 0 errors.
- **Production Next.js Build**:
  ```powershell
  npm run build
  ```
  Runs `next build` with Turbopack and TypeScript verification. Must exit with code 0.

### 6.2 Testing Scenarios for Implementation Verification
1. **Offline Baseline Test**:
   - Ensure backend is NOT running on port 8787.
   - Run `npm run build` in `frontend/`.
   - **Expected**: Build passes with exit code 0. Static pages generate with fallback metadata.
2. **Online Dynamic Test**:
   - Start backend worker (`cd backend && npx wrangler dev --port 8787` or mock server on 8787).
   - Seed `{"brandName": "Raani Atelier", "seoTitle": "Raani Atelier | Imperial Couture", "clothingLogo": "https://example.com/logo.png"}`.
   - Run `npm run dev` in `frontend/`.
   - Inspect `curl http://localhost:3000` or view page source in browser: `<title>` should reflect `Raani Atelier | Imperial Couture`.
3. **Empty Data Test**:
   - Mock endpoint returns `{}` with 200 OK.
   - Inspect page source: all meta tags fall back to `DEFAULT_METADATA` values without errors.

---

## 7. Specification Tables

### Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Next.js Metadata | Static Metadata Export | Current static `metadata` export defining luxury titles, descriptions, OpenGraph, and Twitter tags | Static TS object in `layout.tsx` | Next.js `<head>` tags | Mutually exclusive with `generateMetadata` in Next.js App Router | `frontend/src/app/layout.tsx:26-68` |
| 2 | Next.js Metadata | Dynamic `generateMetadata` | Async function replacing static metadata to fetch runtime store settings | HTTP GET `http://localhost:8787/api/settings` | `Promise<Metadata>` | Must catch all network/parse errors and return `DEFAULT_METADATA` | Next.js App Router Spec & `ORIGINAL_REQUEST.md` R3 |
| 3 | Next.js Viewport | Static Viewport Export | Defines theme color (`#1A0B16`) and mobile viewport scaling | `Viewport` object | `<meta name="viewport">`, `<meta name="theme-color">` | Strict separate export per Next.js 14+ spec | `frontend/src/app/layout.tsx:19-24` |
| 4 | Font Typography | Google Font Variables | Loads Playfair Display, Montserrat, Great Vibes, Cinzel with CSS variables | Font subsets and weights | `--font-playfair`, `--font-montserrat`, `--font-painter`, `--font-royal` | Build error if fonts cannot be resolved | `frontend/src/app/layout.tsx:2-8` |
| 5 | SEO Structured Data | JSON-LD Script | Embedded Schema.org Store descriptor inside `RootLayout` | `jsonLd` object | `<script type="application/ld+json">` | Valid JSON required | `frontend/src/app/layout.tsx:70-87, 97-100` |
| 6 | Layout Providers | SmoothScrolling & Global Modals | Root body tree wrapping children with Lenis smooth scroll, AuthModal, CartDrawer, FloatingWhatsApp | `children: React.ReactNode` | Rendered DOM Tree | Zero changes permitted; must remain 100% untouched | `frontend/src/app/layout.tsx:101-108` |
| 7 | Network Transport | Settings Fetcher with AbortController | Defensive fetch function with 1500ms timeout querying Cloudflare Worker | `SETTINGS_ENDPOINT` URL | `SettingsPayload \| null` | Returns `null` on timeout or offline, never throws | Architecture Analysis |
| 8 | TypeScript Typings | Consolidated Next.js Imports | Single consolidated import for `Metadata` and `Viewport` | Next.js package types | Type annotations | Fixes TS2300 duplicate identifier error | `frontend/src/app/layout.tsx:1, 17` |

### Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Baseline Typecheck | `npx tsc --noEmit` on unmodified `layout.tsx` | Fails with `error TS2300: Duplicate identifier 'Metadata'` at line 1 and 17. |
| 2 | Dynamic Metadata Fetch | Backend port 8787 offline during `npm run build` | If unhandled, `fetch` throws `ECONNREFUSED` and halts build. Handled: caught in `try/catch`, returns `DEFAULT_METADATA`, build passes. |
| 3 | Dynamic Metadata Fetch | Backend hangs or exceeds 1500ms | Handled: `AbortController.abort()` fires, caught in `catch`, returns `DEFAULT_METADATA` without blocking SSR. |
| 4 | Dynamic Metadata Fetch | Backend returns HTTP 404 or 500 | Handled: `!res.ok` check triggers early exit returning `null` -> `DEFAULT_METADATA`. |
| 5 | Dynamic Metadata Fetch | Backend returns Cloudflare HTML error page | Handled: `res.json()` throws SyntaxError, caught in `catch`, returns `DEFAULT_METADATA`. |
| 6 | Dynamic Metadata Fetch | Backend returns `{}` (empty settings table) | Handled: Property access yields `undefined`, coalesces to `DEFAULT_METADATA` values. |
| 7 | Next.js Compilation | Both `metadata` and `generateMetadata` exported | Next.js App Router compiler throws error prohibiting both exports in same file. |
| 8 | Structured Data Script | Dynamic JSON-LD serialization | Unescaped string characters in custom title/description. Handled: `JSON.stringify` safely escapes strings. |
