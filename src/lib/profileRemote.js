import { mergeUserPreferences } from './supabase/mergeUserPreferences';
import { getSupabase } from './supabaseClient';

export async function fetchProfile() {
  const sb = getSupabase();
  if (!sb) return { ok: false, data: null, error: 'no_client' };
  const { data: sessionData, error: sessionError } = await sb.auth.getSession();
  if (sessionError) return { ok: false, data: null, error: sessionError.message };
  const uid = sessionData?.session?.user?.id;
  if (!uid) return { ok: false, data: null, error: 'no_session' };
  const { data, error } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (error) return { ok: false, data: null, error: error.message };
  return { ok: true, data: data ?? null, error: null };
}

export async function pushProfilePatch(patch) {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'no_client' };
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return { ok: false, error: 'no_session' };
  return mergeUserPreferences(sb, uid, patch);
}
