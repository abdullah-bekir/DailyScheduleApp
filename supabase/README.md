# Supabase kurulumu (Planly / DailyscheduleApp)

Uygulama açılışında **kullanıcı adı + şifre** ile kayıt/giriş vardır. Bulut senkronu yalnızca **giriş yapmış** kullanıcılar için çalışır.

## Klasör yapısı (`supabase/sql/`)

| Klasör | İçerik |
|--------|--------|
| `sql/schema.sql` | İlk kurulum: tam şema (`profiles`, `tasks`, RLS, tetikleyiciler). |
| `sql/upgrades/` | Mevcut projeye **üst üste** uygulanan yükseltme betikleri. |
| `sql/optional_alternatives/` | Farklı senaryolar — **birini** seçin, hepsini değil. |
| `sql/settings/` | Ayarlar ekranı ile ilgili ek SQL. |

Dosya sırası: kökteki `ROLLOUT_ORDER.txt`.

## 1) Dashboard ayarları (sırayla)

Detaylı Türkçe adımlar: [`docs/SUPABASE_AUTH_KURULUM.md`](../docs/SUPABASE_AUTH_KURULUM.md)

Özet:

1. **Project Settings → API:** `Project URL` ve **anon public** anahtarını kopyala.
2. **Authentication → Providers → Email:** **Açık** (Sign up + Sign in).
3. **Authentication → Providers → Anonymous:** **Kapalı** (eski misafir oturumu artık kullanılmıyor).
4. **Authentication → Settings:** Kullanıcı hesap silme açık (`auth.deleteUser()` — Ayarlar → Hesabı sil).
5. **Confirm email:** Test için kapalı; canlıda açacaksan kayıttan sonra e-posta doğrulama gerekir.
6. (İsteğe bağlı) **Database → Replication:** `public.tasks` için realtime.

## 2) Uygulama ortam değişkenleri

Proje kökünde `.env` (`.env.example` şablonu):

```
EXPO_PUBLIC_SUPABASE_URL=https://PROJE_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`app.config.js` → `extra`; EAS **production** ortamında da aynı değişkenler tanımlı olmalı.

**Expo Go:** Supabase oturumu ve mağaza modülleri sınırlı çalışabilir; tam test için **EAS development build** veya **production / TestFlight** kullan.

## 3) Veritabanı şeması

**İlk kurulum:** SQL Editor’de `sql/schema.sql` dosyasının **tamamını** bir kez çalıştır.

## 4) Kod tarafı

| Öğe | Dosya |
|-----|--------|
| İstemci | `src/lib/supabaseClient.js` |
| Oturum (username auth) | `src/context/SupabaseContext.js`, `src/utils/authUsername.js` |
| Karşılama ekranı | `src/screens/AuthWelcomeScreen.js` |
| Görevler | `src/context/TasksContext.js` |
| Profil senkron | `src/components/sync/RemoteProfileSync.js`, `src/lib/profileRemote.js` |

Kullanıcı adı arayüzde görünür; Auth için dahili e-posta: `kullaniciadi@users.planly.app` (domain sabittir, kullanıcıya gösterilmez).
