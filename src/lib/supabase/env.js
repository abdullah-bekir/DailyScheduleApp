import Constants from 'expo-constants';

export function getSupabaseEnv() {
  const extra = Constants.expoConfig?.extra ?? Constants.expo?.extra ?? {};
  const url = (process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabaseUrl || '').trim();
  const anonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.supabaseAnonKey || '').trim();
  return { url, anonKey };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url.startsWith('http') && anonKey.length > 20);
}
