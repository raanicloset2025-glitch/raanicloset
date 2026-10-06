# DISPATCH — Worker M1: LCP & Above-the-Fold Asset Optimization

- Working Directory: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/teamwork_preview_worker_m1
- Role: LCP Optimization Worker
- Identity: teamwork_preview_worker
- Original Request: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md
- Scope Document: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/orchestrator_3/PROJECT.md
- Survey 1 Handoff: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/teamwork_preview_explorer_survey_1/handoff.md

## Exclusive Write Ownership
You own and may modify ONLY these files:
- `frontend/src/app/layout.tsx`
- `frontend/src/components/HeroSection.tsx`
- `frontend/src/components/NavbarWrapper.tsx`
- `frontend/next.config.ts`
- `frontend/src/components/BespokeBanner.tsx`

Do NOT modify any other files.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objective & Tasks
Read ORIGINAL_REQUEST.md first (under header ## 2026-10-05T18:40:43Z) and review Survey 1 Handoff.
Implement the following optimizations for Milestone 1:
1. **Fix `frontend/src/app/layout.tsx`**: Consolidate `Metadata, Viewport` imports (lines 1 & 17) to resolve TS2300 duplicate identifier. Do not alter any layout styling, fonts, or children rendering.
2. **Optimize `frontend/src/components/HeroSection.tsx`**:
   - In Clothing mode fallback (`videoSrc` is empty), replace the raw `<img>` tag with Next.js `<Image fill priority sizes="100vw" quality={85} />` (maintaining className `absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000` or equivalent fill styling, alt="Hero Background").
   - In Jewelry mode (`videoSrc` present), add `preload="metadata"` to `<video>` and dynamic MIME type handling (`type={videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'}`).
   - Keep all Framer Motion and CSS animations, text, gold accents, buttons, and store bindings 100% intact.
3. **Optimize `frontend/src/components/NavbarWrapper.tsx`**:
   - In line 59 (mobile logo), replace the unoptimized raw `<img>` tag with Next.js `<Image src="/raani-logo-new.png" alt="Logo" width={90} height={28} priority className="object-contain h-full w-auto mix-blend-multiply origin-left" />`.
4. **Enhance `frontend/next.config.ts`**:
   - In `images`, add `formats: ['image/avif', 'image/webp']` and `minimumCacheTTL: 31536000`. Add `compress: true` at root config.
5. **Deprioritize Below-the-Fold Asset in `frontend/src/components/BespokeBanner.tsx`**:
   - Remove `fetchPriority="high"` from line 58. Set `loading="lazy"` and `fetchPriority="low"` to prevent bandwidth contention with the Hero LCP asset.

## Verification Requirements
You MUST run:
```powershell
cd c:/Users/satya/Documents/antigravity/modest-hypatia/frontend
npx tsc --noEmit
```
Verify that TypeScript compiles with 0 errors.

Write your findings, changes, and verification outputs into `changes.md` and complete a structured `handoff.md` in your working directory.
When done, notify the orchestrator using send_message.

## 2026-10-05T19:18:44Z
Received assignment:
Implement Milestone 1 optimizations:
1. Fix duplicate Metadata import in frontend/src/app/layout.tsx (combine into import type { Metadata, Viewport } from "next";).
2. Upgrade HeroSection.tsx fallback to Next.js <Image fill priority sizes="100vw" quality={85} /> (keeping className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000" and alt="Hero Background"). Add preload="metadata" to <video> and dynamic MIME type handling for mp4/webm. Preserve all text, buttons, and Framer Motion / CSS animations.
3. Upgrade mobile logo in NavbarWrapper.tsx:59 to Next.js <Image src="/raani-logo-new.png" alt="Logo" width={90} height={28} priority className="object-contain h-full w-auto mix-blend-multiply origin-left" />.
4. Enhance frontend/next.config.ts with formats: ['image/avif', 'image/webp'], minimumCacheTTL: 31536000, and compress: true.
5. In frontend/src/components/BespokeBanner.tsx:58, remove fetchPriority="high" and use loading="lazy" / fetchPriority="low".
