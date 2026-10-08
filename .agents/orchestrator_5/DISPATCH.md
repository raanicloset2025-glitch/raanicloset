## 2026-10-08T08:36:00Z
You are the Project Orchestrator for the Raani Closet Massive General Cleanup & Logic Hardening project.

### Environment & Working Directories
- Your working directory: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/orchestrator_5
- Project workspace root: c:/Users/satya/Documents/antigravity/modest-hypatia
- Authoritative user request: c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/ORIGINAL_REQUEST.md (under headers ## 2026-10-08T08:34:37Z and ## 2026-10-08T08:35:20Z)

### Core Mission & Goals
Conduct a comprehensive general cleanup across the Raani Closet application to find and fix hidden bugs, logic errors, race conditions, hydration mismatches, and dead code across both `admin` and `frontend`.

### Special Focus & Critical User Instructions
- Prioritize and ensure absolute perfection in:
  1. The login system flow (authentication, session handling, redirection, state consistency).
  2. Photo upload logic (handling, validation, Cloudflare/R2 or storage endpoints, error recovery).
  3. Video upload logic (handling, validation, streaming/storage endpoints, error recovery).
- Scan `admin/src` and `frontend/src` for hidden logic bugs, race conditions, hydration mismatches, and dead code.

### Constraints
- Strict UI Preservation: Do NOT alter any user-facing UI, layouts, framer-motion animations, CSS styling, or colors. The aesthetic must remain exactly as it is; all changes must be strictly logical and functional.
- Integrity mode: development.

### Acceptance Criteria
1. `npx tsc --noEmit` in `admin` completes with 0 errors.
2. `npx tsc --noEmit` in `frontend` completes with 0 errors.
3. Both directories successfully complete an optimized Next.js build (`npm run build` or Next.js build equivalent) without crashing.
4. Login, photo upload, and video upload logic verified functional and robust.

### Operational Protocol
- Initialize your `BRIEFING.md` and `progress.md` in your working directory `c:/Users/satya/Documents/antigravity/modest-hypatia/.agents/orchestrator_5`.
- Formulate your milestone plan and team structure in `PROJECT.md`.
- Dispatch subagents (explorers, workers, reviewers, challengers, forensic auditor).
- Keep `progress.md` updated with every milestone and state change.
- When all milestones pass acceptance criteria and gates, report completion to the Sentinel.
