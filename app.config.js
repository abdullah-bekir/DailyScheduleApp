// Expo: app.json içeriği `config` olarak gelir; .env içindeki EXPO_PUBLIC_* burada extra'ya da yazılır
// (bazı ortamlarda process.env okunur, Constants.expoConfig.extra yedek olur).

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
});
