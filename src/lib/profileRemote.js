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
  if (!sb) return;
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return;
  await sb.from('profiles').update(patch).eq('id', uid);
}
