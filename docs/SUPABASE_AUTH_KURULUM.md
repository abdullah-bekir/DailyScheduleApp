# Supabase — Planly hesap (kullanıcı adı) kurulumu

Bu rehberi **Supabase Dashboard** ve **EAS** ile birlikte uygula. Kod tarafı repoda hazır.

---

## Adım 1 — Projeyi aç

1. [supabase.com/dashboard](https://supabase.com/dashboard) → Planly projesi.
2. **Project Settings → API**
   - **Project URL** → kopyala
   - **Project API keys → anon public** → kopyala (service_role **asla** uygulamaya koyma)

---

## Adım 2 — Authentication sağlayıcıları

**Authentication → Providers**

| Sağlayıcı | Ayar |
|-----------|------|
| **Email** | **Enabled** — Giriş/kayıt gerçek e-posta ile. “Confirm email” test için **kapalı** (hemen giriş); canlıda açarsan kullanıcı gelen kutusundan onaylar. |
| **Anonymous** | **Disabled** — uygulama artık otomatik misafir oturumu açmıyor. |

Kaydet.

---

## Adım 3 — Hesap silme (mağaza uyumu)

**Authentication → Settings** (veya Users bölümü)

- **Allow users to delete their account** (veya eşdeğeri) **açık** olsun.  
  Uygulama: **Ayarlar → Veri yönetimi → Hesabı sil** → `auth.deleteUser()`.

---

## Adım 4 — Veritabanı (henüz yapılmadıysa)

**SQL Editor → New query**

1. `supabase/sql/schema.sql` içeriğini yapıştır → **Run**.
2. Hata yoksa `profiles`, `tasks` ve RLS politikaları hazır.

Mevcut canlı DB zaten kuruluysa bu adımı atla.

---

## Adım 5 — Yerel `.env`

`DailyscheduleApp/.env` (git’e **eklenmez**):

```env
EXPO_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Kontrol: `npm run smoke` içinde Supabase satırları yeşil olmalı (.env doluysa).

---

## Adım 6 — EAS Production ortamı

[expo.dev](https://expo.dev) → proje → **Environment variables** → **production**:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Build almadan önce burada tanımlı olmalı; yoksa TestFlight’ta giriş ekranı “yapılandırılmadı” gibi davranabilir.

---

## Adım 7 — Test (TestFlight / EAS build)

Expo Go’da hata alman normal (native modüller + tam auth akışı).

1. EAS **production** iOS build al.
2. TestFlight’tan yükle.
3. **Yeni hesap oluştur** → kullanıcı adı, şifre, şartlar.
4. Çıkış → **Giriş yap** aynı bilgilerle.
5. Supabase **Authentication → Users** listesinde kullanıcı **gerçek e-posta** adresiyle görünmeli.

---

## Sık sorunlar

| Belirti | Çözüm |
|---------|--------|
| “Invalid login credentials” | Kullanıcı adını küçük harfle dene; kayıt oldun mu? |
| Kayıt “already registered” | Kullanıcı adı alınmış; başka ad seç. |
| Uygulama giriş ekranı yok, direkt ana sayfa | Supabase `.env` / EAS env boş → yerel mod; veya zaten oturum açık. |
| Confirm email açık, giriş olmuyor | Dashboard’dan kullanıcıyı confirm et veya Confirm email’i kapat. |

---

## Git (repoyu kaydetmek)

Değişiklikler commit edilmeden EAS bazen **eski commit** ile build alır. Sıra:

```powershell
cd C:\Users\abdul\OneDrive\NOTEPADS\NOTEPADSS\DailyscheduleApp
git status
git add -A
git commit -m "..."
git push origin HEAD
```

Sonra `npm run eas:build:production:ios`.
