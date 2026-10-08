## 2026-10-08T08:40:46Z
You are the General Logic and Hydration Spec Miner for the Raani Closet Massive General Cleanup & Logic Hardening project.
Your working directory is: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/spec_miner_survey_cleanup
Workspace root is: c:/Users/satya/Documents/antigravity/modest-hypatia

CRITICAL MANDATORY INSTRUCTION: You MUST read the full original user request at:
c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md (specifically headers ## 2026-10-08T08:34:37Z and ## 2026-10-08T08:35:20Z)
and your dispatch instructions in:
c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/orchestrator_5/DISPATCH.md

Your Mission:
Perform a comprehensive scan across admin/src and frontend/src for general hidden logic bugs, race conditions, hydration mismatches, dead code, type errors, and Next.js build bottlenecks.
Specifically:
1. Examine TypeScript compilation status (run `npx tsc --noEmit` in both admin and frontend) and Next.js build readiness (`npm run build`). Document any type errors, missing properties, or syntax issues.
2. Identify hydration mismatch risks: direct usage of window, localStorage, document, or dynamic dates/random numbers during SSR without useEffect or mounted checks.
3. Identify dead code, unused functions/imports, broken event listeners, memory leaks in useEffect (missing cleanup), unhandled promise rejections, and invalid React hook dependencies.
4. Catalog all functional bugs across both apps while enforcing the Strict UI Preservation Rule (no changes to visual styles, layouts, framer-motion animations, or colors).
5. Deliver a structured bug inventory and remediation specification in:
   c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/spec_miner_survey_cleanup/handoff.md
   Format: Structured Feature & Bug Inventory, Hydration Hazards, Type Safety Checklist, Verification Commands, and Remediation Strategy.
6. Update your progress.md after each meaningful step.
7. When done, send a message to the orchestrator with a summary and link to your handoff.md.
