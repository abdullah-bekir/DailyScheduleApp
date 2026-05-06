export async function mergeUserPreferences(client, userId, patch) {
  if (!client || !userId) return;

  const { data: row, error: fetchErr } = await client
    .from('user_preferences')
    .select('theme_mode, completion_tally')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchErr) {
    console.warn('[supabase] user_preferences select', fetchErr.message);
    return;
  }

  const merged = {
    user_id: userId,
    theme_mode: row?.theme_mode ?? 'light',
    completion_tally: row?.completion_tally ?? 0,
    ...patch,
  };

  const { error } = await client.from('user_preferences').upsert(merged, { onConflict: 'user_id' });
  if (error) {
    console.warn('[supabase] user_preferences upsert', error.message);
  }
}
