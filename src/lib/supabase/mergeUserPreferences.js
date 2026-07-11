export async function mergeUserPreferences(client, userId, patch) {
  if (!client || !userId) return { ok: false, error: 'missing_client_or_user' };

  const { data: row, error: fetchErr } = await client
    .from('profiles')
    .select('theme_mode, completion_tally, notifications_enabled, language_code')
    .eq('id', userId)
    .maybeSingle();

  if (fetchErr) {
    console.warn('[supabase] profiles select', fetchErr.message);
    return { ok: false, error: fetchErr.message };
  }

  const merged = {
    id: userId,
    theme_mode: row?.theme_mode ?? 'light',
    completion_tally: row?.completion_tally ?? 0,
    notifications_enabled: row?.notifications_enabled ?? true,
    language_code: row?.language_code ?? 'tr',
    ...patch,
  };

  const { error } = await client.from('profiles').upsert(merged, { onConflict: 'id' });
  if (error) {
    console.warn('[supabase] profiles upsert', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
