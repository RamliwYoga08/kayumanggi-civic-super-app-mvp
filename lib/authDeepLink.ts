import { supabase } from '@/lib/supabase';

function collectParams(url: string) {
  const queryStart = url.indexOf('?');
  const hashStart = url.indexOf('#');
  const query = queryStart >= 0
    ? url.slice(queryStart + 1, hashStart >= 0 ? hashStart : undefined)
    : '';
  const hash = hashStart >= 0 ? url.slice(hashStart + 1) : '';
  const params = new URLSearchParams(query);
  const hashParams = new URLSearchParams(hash);
  hashParams.forEach((value, key) => {
    if (!params.has(key)) params.set(key, value);
  });
  return params;
}

/** Establishes a Supabase session from password-recovery/email-confirmation links. */
export async function handleSupabaseAuthUrl(url?: string | null) {
  if (!url) return false;
  const params = collectParams(url);
  const code = params.get('code');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return true;
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return true;
  }

  return false;
}
