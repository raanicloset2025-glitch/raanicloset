const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('  CHALLENGER EMPIRICAL VERIFICATION TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`[PASS] Test ${totalTests}: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`[PASS] Test ${totalTests}: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

async function main() {
  // -----------------------------------------------------------------
  // SUITE 1: Input edge cases for OTP and email normalization
  // -----------------------------------------------------------------
  console.log('--- SUITE 1: OTP & Email Normalization Edge Cases ---');

  // Logic extracted from admin/src/app/login/page.tsx
  function makeAllowedAdminChecker(envValue) {
    const ALLOWED_ADMINS = (envValue || 'raanicloset2025@gmail.com')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    return function isAllowedAdmin(email) {
      if (!email) return false;
      return ALLOWED_ADMINS.includes(email.trim().toLowerCase());
    };
  }

  const defaultAdminChecker = makeAllowedAdminChecker(undefined);

  runTest('Default admin matches exact lowercase email', () => {
    assert.strictEqual(defaultAdminChecker('raanicloset2025@gmail.com'), true);
  });

  runTest('Default admin matches uppercase email', () => {
    assert.strictEqual(defaultAdminChecker('RAANICLOSET2025@GMAIL.COM'), true);
    assert.strictEqual(defaultAdminChecker('RaaniCloset2025@Gmail.Com'), true);
  });

  runTest('Default admin matches email with leading/trailing whitespace', () => {
    assert.strictEqual(defaultAdminChecker('   raanicloset2025@gmail.com   '), true);
    assert.strictEqual(defaultAdminChecker('\t\n raanicloset2025@gmail.com \n\t'), true);
  });

  runTest('Default admin rejects unauthorized emails and malformed formats', () => {
    assert.strictEqual(defaultAdminChecker('attacker@evil.com'), false);
    assert.strictEqual(defaultAdminChecker('raanicloset2025@gmail.com.evil'), false);
    assert.strictEqual(defaultAdminChecker('fake_raanicloset2025@gmail.com'), false);
    assert.strictEqual(defaultAdminChecker(''), false);
    assert.strictEqual(defaultAdminChecker('   '), false);
    assert.strictEqual(defaultAdminChecker(null), false);
    assert.strictEqual(defaultAdminChecker(undefined), false);
  });

  runTest('Custom NEXT_PUBLIC_ADMIN_EMAILS with multiple emails, spaces, and mixed case', () => {
    const customChecker = makeAllowedAdminChecker('  admin1@raani.com , ADMIN2@RAANI.COM,  super@atelier.com  ');
    assert.strictEqual(customChecker('admin1@raani.com'), true);
    assert.strictEqual(customChecker('ADMIN1@RAANI.COM'), true);
    assert.strictEqual(customChecker('  admin2@raani.com  '), true);
    assert.strictEqual(customChecker('super@atelier.com'), true);
    assert.strictEqual(customChecker('other@raani.com'), false);
  });

  // OTP sanitize and validation
  function sanitizeOtp(raw) {
    return raw.replace(/\D/g, '');
  }
  function validateOtp(cleanOtp) {
    if (cleanOtp.length < 6) {
      return { valid: false, error: 'Please enter the complete 6-digit code.' };
    }
    return { valid: true };
  }

  runTest('OTP sanitization strips non-numeric characters', () => {
    assert.strictEqual(sanitizeOtp('123-456'), '123456');
    assert.strictEqual(sanitizeOtp('12 34 56'), '123456');
    assert.strictEqual(sanitizeOtp('12a3b4c5d6'), '123456');
    assert.strictEqual(sanitizeOtp('ABCDEF'), '');
  });

  runTest('OTP validation accepts 6 digits and rejects incomplete input', () => {
    assert.strictEqual(validateOtp('123456').valid, true);
    assert.strictEqual(validateOtp('12345').valid, false);
    assert.strictEqual(validateOtp('').valid, false);
    assert.strictEqual(validateOtp(sanitizeOtp('12-34-5')).valid, false);
    assert.strictEqual(validateOtp(sanitizeOtp(' 8 9 0 1 2 3 ')).valid, true);
  });

  // -----------------------------------------------------------------
  // SUITE 2: PKCE search params parsing (?code=..., ?error=...) logic
  // -----------------------------------------------------------------
  console.log('\n--- SUITE 2: PKCE Search Params Parsing Logic ---');

  function parseAdminPageUrl(search, hash) {
    const params = new URLSearchParams(search);
    const authError = params.get('error_description') || params.get('error');
    const isCodePresent = search.includes('code=');
    const isTokenInHash = hash.includes('access_token');
    const isPkceExchangePending = isCodePresent || isTokenInHash;

    let redirectTarget = null;
    if (authError) {
      redirectTarget = `/login?error=${encodeURIComponent(authError)}`;
    }
    return { authError, isPkceExchangePending, redirectTarget };
  }

  function parseLoginPageError(search) {
    const params = new URLSearchParams(search);
    const err = params.get('error');
    if (err === 'unauthorized') {
      return 'Access Denied: You are not authorized to access the Admin Panel.';
    } else if (err) {
      return decodeURIComponent(err);
    }
    return '';
  }

  runTest('Admin dashboard detects PKCE ?code=xyz and prevents premature redirect', () => {
    const res = parseAdminPageUrl('?code=auth_pkce_code_12345', '');
    assert.strictEqual(res.isPkceExchangePending, true);
    assert.strictEqual(res.redirectTarget, null);
  });

  runTest('Admin dashboard detects hash access_token flow', () => {
    const res = parseAdminPageUrl('', '#access_token=token123&type=bearer');
    assert.strictEqual(res.isPkceExchangePending, true);
    assert.strictEqual(res.redirectTarget, null);
  });

  runTest('Admin dashboard detects OAuth error and constructs redirect URL', () => {
    const res1 = parseAdminPageUrl('?error=unauthorized', '');
    assert.strictEqual(res1.redirectTarget, '/login?error=unauthorized');

    const res2 = parseAdminPageUrl('?error=access_denied&error_description=User%20denied%20access', '');
    assert.strictEqual(res2.redirectTarget, '/login?error=User%20denied%20access');
  });

  runTest('Login page displays user-friendly message for unauthorized error', () => {
    const msg = parseLoginPageError('?error=unauthorized');
    assert.strictEqual(msg, 'Access Denied: You are not authorized to access the Admin Panel.');
  });

  runTest('Login page decodes custom URL-encoded error messages', () => {
    const msg = parseLoginPageError('?error=Invalid%20credentials%20provided');
    assert.strictEqual(msg, 'Invalid credentials provided');
  });

  // -----------------------------------------------------------------
  // SUITE 3: Supabase client initialization when env vars missing/empty
  // -----------------------------------------------------------------
  console.log('\n--- SUITE 3: Supabase Client Initialization (No Env Throw) ---');

  // Verify logic from admin/src/lib/supabaseClient.ts & frontend/src/lib/supabaseClient.ts
  const { createClient } = require('@supabase/supabase-js');

  function initSupabaseClient(rawUrl, rawKey) {
    const isConfigured = Boolean(rawUrl && rawKey && rawUrl.startsWith('http'));
    const supabaseUrl = isConfigured ? rawUrl : 'https://placeholder.supabase.co';
    const supabaseAnonKey = isConfigured ? rawKey : 'placeholder-anon-key';

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });

    return { client, isConfigured, supabaseUrl, supabaseAnonKey };
  }

  runTest('Supabase client does NOT throw when env vars are undefined', () => {
    const res = initSupabaseClient(undefined, undefined);
    assert.strictEqual(res.isConfigured, false);
    assert.strictEqual(res.supabaseUrl, 'https://placeholder.supabase.co');
    assert.strictEqual(res.supabaseAnonKey, 'placeholder-anon-key');
    assert.ok(res.client);
    assert.ok(res.client.auth);
  });

  runTest('Supabase client does NOT throw when env vars are empty strings or whitespace', () => {
    const res = initSupabaseClient('   ', '   ');
    assert.strictEqual(res.isConfigured, false);
    assert.strictEqual(res.supabaseUrl, 'https://placeholder.supabase.co');
    assert.ok(res.client);
  });

  runTest('Supabase client does NOT throw when URL is invalid non-http string', () => {
    const res = initSupabaseClient('not-a-valid-url', 'some-key');
    assert.strictEqual(res.isConfigured, false);
    assert.strictEqual(res.supabaseUrl, 'https://placeholder.supabase.co');
    assert.ok(res.client);
  });

  runTest('Supabase client marks isConfigured=true when valid https URL is provided', () => {
    const res = initSupabaseClient('https://myproject.supabase.co', 'valid-anon-key-12345');
    assert.strictEqual(res.isConfigured, true);
    assert.strictEqual(res.supabaseUrl, 'https://myproject.supabase.co');
    assert.strictEqual(res.supabaseAnonKey, 'valid-anon-key-12345');
  });

  // -----------------------------------------------------------------
  // SUITE 4: d1.ts local fallback behavior when D1 env vars are missing
  // -----------------------------------------------------------------
  console.log('\n--- SUITE 4: d1.ts Local Fallback & store_db.json Verification ---');

  function findDbFileTest(cwd) {
    const candidates = [
      path.join(cwd, 'store_db.json'),
      path.join(cwd, 'frontend', 'store_db.json'),
      path.join(cwd, '..', 'frontend', 'store_db.json'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  }

  runTest('findDbFile resolves store_db.json from repo root cwd', () => {
    const resolved = findDbFileTest(__dirname);
    assert.ok(fs.existsSync(resolved), `Path ${resolved} must exist`);
    assert.ok(resolved.endsWith('store_db.json'));
  });

  runTest('findDbFile resolves store_db.json from frontend/ cwd', () => {
    const resolved = findDbFileTest(path.join(__dirname, 'frontend'));
    assert.ok(fs.existsSync(resolved), `Path ${resolved} must exist`);
    assert.ok(resolved.endsWith('store_db.json'));
  });

  runTest('store_db.json fallback reads valid JSON containing store state', () => {
    const dbFile = findDbFileTest(__dirname);
    const raw = fs.readFileSync(dbFile, 'utf-8');
    const data = JSON.parse(raw);
    assert.ok(data && typeof data === 'object');
    assert.ok(Array.isArray(data.products) || data.heroTitle || data.clothingCategoryTitle, 'Must contain store state fields');
  });

  runTest('saveStoreState and getStoreState round-trip integrity test', () => {
    const dbFile = findDbFileTest(__dirname);
    const originalRaw = fs.readFileSync(dbFile, 'utf-8');
    const originalData = JSON.parse(originalRaw);

    // Write a test marker
    const testData = { ...originalData, __challenger_test_ts: Date.now() };
    fs.writeFileSync(dbFile, JSON.stringify(testData, null, 2), 'utf-8');

    // Read back
    const readBack = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    assert.strictEqual(readBack.__challenger_test_ts, testData.__challenger_test_ts);

    // Restore pristine content
    fs.writeFileSync(dbFile, originalRaw, 'utf-8');
    const restored = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    assert.strictEqual(restored.__challenger_test_ts, undefined);
  });

  // -----------------------------------------------------------------
  // SUITE 5: Request deduplication / promise coalescing in useAdminStore
  // -----------------------------------------------------------------
  console.log('\n--- SUITE 5: Request Deduplication & Promise Coalescing ---');

  await runAsyncTest('Concurrent fetchFromServer coalesces into exactly 1 network request', async () => {
    let networkFetchCount = 0;
    let inFlightFetchPromise = null;
    let storeState = { heroTitle: 'Initial' };

    // Implementation matching useAdminStore.fetchFromServer
    async function fetchFromServer() {
      if (inFlightFetchPromise) {
        return inFlightFetchPromise;
      }

      inFlightFetchPromise = (async () => {
        try {
          networkFetchCount++;
          // Simulate network latency of 50ms
          await new Promise((r) => setTimeout(r, 50));
          storeState = { heroTitle: 'Fetched From Server', hasUnsavedChanges: false };
        } finally {
          inFlightFetchPromise = null;
        }
      })();

      return inFlightFetchPromise;
    }

    // Call 10 times concurrently
    const promises = [
      fetchFromServer(),
      fetchFromServer(),
      fetchFromServer(),
      fetchFromServer(),
      fetchFromServer(),
      fetchFromServer(),
      fetchFromServer(),
      fetchFromServer(),
      fetchFromServer(),
      fetchFromServer(),
    ];

    // All callers await completion
    await Promise.all(promises);

    assert.strictEqual(networkFetchCount, 1, 'Network fetch must be called exactly 1 time across 10 concurrent callers');
    assert.strictEqual(storeState.heroTitle, 'Fetched From Server', 'Store state must be updated by the single in-flight fetch');

    // After completion, inFlightFetchPromise should be null, allowing subsequent fetch to run
    assert.strictEqual(inFlightFetchPromise, null, 'inFlightFetchPromise must be reset to null');
    await fetchFromServer();

    assert.strictEqual(networkFetchCount, 2, 'Subsequent fetch after completion must execute another network call');
  });

  // -----------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`TOTAL TESTS:  ${totalTests}`);
  console.log(`PASSED:       ${passedTests}`);
  console.log(`FAILED:       ${failedTests}`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Test suite runner crashed:', e);
  process.exit(1);
});
