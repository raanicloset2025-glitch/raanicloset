# Supabase Google OAuth Setup & Troubleshooting Guide

This guide provides complete, authoritative instructions for configuring and resolving the **"Unable to exchange external code"** error in Supabase Google OAuth authentication across the Raani Closet storefront (Cloudflare Pages) and Admin panel (Render / Localhost).

---

## 1. Root Cause Analysis: "Unable to exchange external code"

### The OAuth 2.0 & PKCE Flow Mechanics
When a user initiates authentication via `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`:

1. **Client Authorization Request**:
   The client generates a code challenge / verifier (for PKCE) and directs the user to Google's OAuth consent screen via Supabase GoTrue (`https://<project-ref>.supabase.co/auth/v1/authorize`).
2. **Google Authorization Code Grant**:
   Once the user consents, Google redirects back to Supabase's callback URL:
   `https://<project-ref>.supabase.co/auth/v1/callback?code=4/0A...`
3. **GoTrue Server-to-Server Token Exchange**:
   The GoTrue authentication server makes an **out-of-band HTTPS POST request** directly from Supabase's backend to Google's token endpoint (`https://oauth2.googleapis.com/token`) to exchange the external Google authorization code for Google ID/access tokens:
   ```http
   POST /token HTTP/1.1
   Host: oauth2.googleapis.com
   Content-Type: application/x-www-form-urlencoded

   code=4/0A...&client_id=<GOOGLE_CLIENT_ID>&client_secret=<GOOGLE_CLIENT_SECRET>&redirect_uri=https://<project-ref>.supabase.co/auth/v1/callback&grant_type=authorization_code
   ```
4. **Client Session Finalization**:
   Supabase GoTrue creates a Supabase session/refresh token and redirects back to the client application (`redirectTo` URL) with Supabase's own PKCE authorization code:
   `https://raani.pages.dev/?code=<supabase-pkce-code>`
   The client SDK exchanges this internal code with Supabase using local storage credentials.

### Why "Unable to exchange external code" Occurs
The error message `Unable to exchange external code` is generated strictly in **Step 3** by Supabase GoTrue when its backend call to Google fails. Common root causes include:

- **Redirect URI Mismatch in Google Console**:
  Google validates that the `redirect_uri` sent in the token exchange POST request *exactly matches* an entry in the "Authorized redirect URIs" list of the Google Cloud Console OAuth 2.0 Client. If developers mistakenly enter the frontend application URL (e.g., `https://raani.pages.dev` or `http://localhost:3000`) instead of the Supabase GoTrue callback (`https://xrrvjgjemerbuqqwwqkt.supabase.co/auth/v1/callback`), Google rejects the token exchange with `redirect_uri_mismatch`, which GoTrue surfaces as `Unable to exchange external code`.
- **Invalid or Stale Client Secret in Supabase**:
  If the Google OAuth Client Secret was regenerated or incorrectly copied (e.g. trailing whitespaces, truncated secret) into the Supabase Dashboard, Google returns an `invalid_client` HTTP 401 error during the exchange.
- **Client-Side PKCE Verifier vs Server Exchange Confusion**:
  While the client application uses PKCE to finalize the Supabase session, the external code exchange is entirely server-to-server between GoTrue and Google. Client-side URL manipulations cannot resolve a server-side exchange failure.
- **Publishing Status / Test Users Limitation**:
  When the OAuth Consent Screen is in "Testing" mode, any Google account not explicitly added as a test user is rejected by Google during token validation.

---

## 2. Google Cloud Console Configuration

Navigate to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).

### A. OAuth 2.0 Client ID Settings
Select or create the **Web application** credential.

#### 1. Authorized JavaScript Origins
Add all production and local origins hosting your frontend or admin panel:
- `http://localhost:3000` (Frontend local development)
- `http://localhost:3001` (Admin local development)
- `https://xrrvjgjemerbuqqwwqkt.supabase.co` (Supabase Project Domain)
- `https://raani.pages.dev` (Cloudflare Pages Production Storefront)
- `https://*.pages.dev` (Cloudflare Pages Preview Deployments)
- `https://*.onrender.com` (Render Production Admin Panel)
- *(Optional: Add custom domains if configured, e.g., `https://raanicloset.com`, `https://admin.raanicloset.com`)*

#### 2. Authorized Redirect URIs (CRITICAL)
Google requires the exact callback handler URL hosted by Supabase GoTrue.
**MUST BE**:
```
https://xrrvjgjemerbuqqwwqkt.supabase.co/auth/v1/callback
```
> **IMPORTANT NOTE**:
> Do NOT set the Authorized redirect URI to `http://localhost:3000`, `http://localhost:3001`, or `https://raani.pages.dev`.
> The Google authorization code is exchanged **by Supabase**, not directly by the browser. If the redirect URI points to your frontend, GoTrue cannot intercept and exchange the code.

### B. OAuth Consent Screen
Navigate to **APIs & Services > OAuth consent screen**:
1. **User Type**: External (or Internal if Google Workspace organization).
2. **App Name**: Raani Closet Atelier.
3. **User support email**: `raanicloset2025@gmail.com` (or project admin email).
4. **Developer contact email**: `raanicloset2025@gmail.com`.
5. **Scopes**: Ensure default `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid` are selected.
6. **Publishing Status & Test Users**:
   - If **Publishing status** is **Testing**, you MUST add all test email addresses (e.g., `raanicloset2025@gmail.com`, tester emails) under the **Test users** section. Unlisted users will receive an access denied error.
   - For public production use, submit the app to **In production** status (no Google verification required if only standard `email`, `profile`, and `openid` scopes are requested).

---

## 3. Supabase Dashboard Configuration

Navigate to the [Supabase Dashboard](https://supabase.com/dashboard/project/xrrvjgjemerbuqqwwqkt).

### A. Authentication -> Providers -> Google
1. Open **Authentication** in the left sidebar, click **Providers**, and expand **Google**.
2. Toggle **Enable Google provider** to **ON**.
3. **Client ID**: Paste the Client ID from Google Cloud Console (format: `xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`).
4. **Client Secret**: Paste the Client Secret from Google Cloud Console. Ensure no leading or trailing whitespace.
5. Click **Save**.

### B. Authentication -> URL Configuration
1. Open **Authentication > URL Configuration**.
2. **Site URL**:
   Set this to your primary production domain:
   ```
   https://raani.pages.dev
   ```
   *(For local testing, this can be `http://localhost:3000`)*
3. **Redirect URLs (Allowlist)**:
   Add every origin/path that your frontend or admin application passes as `redirectTo`:
   - `http://localhost:3000/**`
   - `http://localhost:3001/**`
   - `https://raani.pages.dev/**`
   - `https://*.pages.dev/**`
   - `https://*.onrender.com/**`
   - *(Optional: Custom domains such as `https://raanicloset.com/**`)*
4. Click **Save**.

---

## 4. Diagnostic Procedures & Log Inspection

When troubleshooting OAuth failures, check the Supabase Auth Logs to view the exact upstream response from Google.

### A. Supabase Auth Logs
1. In the Supabase Dashboard, go to **Logs > Auth Logs**.
2. Filter or search for events with:
   - `msg: "GetToken"`
   - `msg: "login error"`
   - `path: "/auth/v1/callback"`
   - HTTP status code `400` or `500`.
3. Inspect the JSON payload:
   - If the log shows `{"error": "redirect_uri_mismatch", "error_description": "Bad Request"}`:
     **Fix**: The redirect URI in Google Cloud Console does not match `https://xrrvjgjemerbuqqwwqkt.supabase.co/auth/v1/callback`.
   - If the log shows `{"error": "invalid_client", "error_description": "Unauthorized"}`:
     **Fix**: The Google Client Secret or Client ID entered in Supabase Dashboard is invalid.
   - If the log shows `{"error": "access_denied"}`:
     **Fix**: The user was not added to the Google OAuth Consent Screen Test Users list while the app is in Testing mode.

### B. Client-Side Verification
Both the `frontend` and `admin` applications in this codebase contain built-in defensive handlers:
- **`frontend/src/store/useStore.ts`**:
  Intercepts `error` and `error_description` query parameters from the redirect URL, stores them in Zustand state, displays user-friendly errors in `AuthModal.tsx`, and strips parameters via `window.history.replaceState`.
- **`admin/src/app/login/page.tsx`**:
  Detects `error` or `error_description` in URL parameters, shows actionable feedback in the login card, and purges query parameters from history.
- **`admin/src/app/page.tsx`**:
  Redirects unauthorized or error-bearing callbacks directly to `/login?error=...`.

---

## 5. Summary Checklist

| Configuration Item | Required Value | Location |
|---|---|---|
| Google Authorized JavaScript Origins | `http://localhost:3000`, `http://localhost:3001`, `https://xrrvjgjemerbuqqwwqkt.supabase.co`, `https://raani.pages.dev`, `https://*.onrender.com` | Google Cloud Console > Credentials |
| Google Authorized Redirect URI | `https://xrrvjgjemerbuqqwwqkt.supabase.co/auth/v1/callback` | Google Cloud Console > Credentials |
| Google OAuth Consent Status | In Production OR Authorized Test Users added | Google Cloud Console > OAuth consent screen |
| Supabase Google Client ID | Google Client ID | Supabase Dashboard > Authentication > Providers > Google |
| Supabase Google Client Secret | Google Client Secret | Supabase Dashboard > Authentication > Providers > Google |
| Supabase Site URL | `https://raani.pages.dev` | Supabase Dashboard > Authentication > URL Configuration |
| Supabase Redirect URLs | `http://localhost:3000/**`, `http://localhost:3001/**`, `https://raani.pages.dev/**`, `https://*.onrender.com/**` | Supabase Dashboard > Authentication > URL Configuration |
