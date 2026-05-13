# Supabase kurulumu (DailyscheduleApp)

UI değiştirmeden backend’i devreye almak için sıra:

## Klasör yapısı (`supabase/sql/`)

| Klasör | İçerik |
|--------|--------|
| `sql/schema.sql` | İlk kurulum: tam şema (`profiles`, `tasks`, RLS, tetikleyiciler). |
| `sql/upgrades/` | Mevcut projeye **üst üste** uygulanan yükseltme betikleri. |
| `sql/optional_alternatives/` | Farklı senaryolar (yalnızca görevler tablosu vb.) — **birini** seçin, hepsini değil. |
| `sql/settings/` | Ayarlar ekranı ile ilgili ek SQL. |

Dosya sırası özeti: kökteki `ROLLOUT_ORDER.txt`.

## 1) Dashboard ayarları

1. **Project Settings → API:** `Project URL` ve `anon` `public` anahtarını kopyala.
2. **Authentication → Providers → Anonymous:** **Açık** olmalı (login ekranı yok; ilk açılışta anon kullanıcı).
3. (İsteğe bağlı) **Database → Replication:** `public.tasks` için realtime.

## 2) Uygulama ortam değişkenleri

Proje kökünde `.env` oluştur (`.env.example` şablonu):

```
EXPO_PUBLIC_SUPABASE_URL=https://PROJE_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`app.config.js` bu değerleri `extra` ile Expo’ya aktarır; `src/lib/supabaseClient.js` hem `extra` hem `process.env` okur.

Sunucuyu yeniden başlat: `npx expo start` (gerekirse `-c`).

## 3) Veritabanı şeması (SQL Editor)

**İlk kurulum (önerilen):** `sql/schema.sql` dosyasının **tamamını** tek seferde çalıştır → `profiles`, `tasks`, tetikleyiciler, RLS.

## 4) Kod tarafı (zaten bağlı)

| Öğe | Dosya |
|-----|--------|
| İstemci | `src/lib/supabaseClient.js` |
| Anon oturum | `src/context/SupabaseContext.js` |
| Görevler | `src/context/TasksContext.js` |
| Profil senkron | `src/components/sync/RemoteProfileSync.js`, `src/lib/profileRemote.js` |

Detaylı mimari: depo kökündeki `backend-plan` (veya `docs/` altı plan dosyaları).
