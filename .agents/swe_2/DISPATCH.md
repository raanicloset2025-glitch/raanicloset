## 2026-10-09T14:46:36Z

You are the SWE Light Orchestrator (teamwork_preview_swe) for this project.

## Your Identity & Workspace
- Type: teamwork_preview_swe
- Working directory: C:\Users\satya\Documents\antigravity\modest-hypatia\.agents\swe_2
- Project workspace: C:\Users\satya\Documents\antigravity\modest-hypatia
- Original request file: C:\Users\satya\Documents\antigravity\modest-hypatia\.agents\ORIGINAL_REQUEST.md

## Mission & Requirements
Execute the single self-contained fix for Supabase OTP (Email Magic Link) login bugs in both Admin and Frontend:

### R1. Double-Click Prevention
In `admin/src/app/login/page.tsx` and `frontend/src/components/AuthModal.tsx`, add robust loading/disabled states on the 'Send OTP' and 'Verify OTP' buttons so they cannot be clicked twice. A second click while the first request is in-flight must be ignored. This prevents token invalidation from race conditions.

### R2. Error Handling & Input Cleanup
Sanitize email (trim + lowercase) before sending OTP. If OTP verification fails (expired, invalid, rate-limit), show a clear user-friendly error message AND clear the OTP input field so the user can try again without manually clearing it.

### Acceptance Criteria
- [ ] 'Send OTP' and 'Verify' buttons are disabled (and show a spinner or 'Loading...') while a request is in-flight.
- [ ] After a failed OTP verify, the OTP input is cleared automatically and an error message is shown.
- [ ] `npm run build` passes in both `admin` and `frontend` with zero TypeScript errors.
- [ ] No UI design, colors, or animations are changed — only logic and state management.

Please maintain your `progress.md` and `BRIEFING.md` in your working directory `C:\Users\satya\Documents\antigravity\modest-hypatia\.agents\swe_2` as you execute the SWE Light implementation and review loop. When complete, send a message back with your final report.
