import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

let client = null;

export function getSupabaseConfig() {
  const extra = Constants.expoConfig?.extra ?? {};
  const url = (extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
  const anonKey = (extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

/**
 * Yapılandırma yoksa null döner; uygulama yalnızca yerel modda çalışır.
 */
export function getSupabase() {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
