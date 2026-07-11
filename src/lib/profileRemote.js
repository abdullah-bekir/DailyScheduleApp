import { mergeUserPreferences } from './supabase/mergeUserPreferences';
import { getSupabase } from './supabaseClient';

export async function fetchProfile() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return null;
  const { data, error } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function pushProfilePatch(patch) {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'no_client' };
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return { ok: false, error: 'no_session' };
  return mergeUserPreferences(sb, uid, patch);
}
