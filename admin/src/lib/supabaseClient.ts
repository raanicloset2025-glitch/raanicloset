import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const isConfigured = Boolean(rawUrl && rawKey && rawUrl.startsWith('http'));

// Safe placeholder prevents unhandled module load crashes during builds/tests
const supabaseUrl = isConfigured ? rawUrl! : 'https://placeholder.supabase.co';
const supabaseAnonKey = isConfigured ? rawKey! : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'raani_admin_auth_token',
    flowType: 'pkce',
  },
});

export const isSupabaseConfigured = isConfigured;
