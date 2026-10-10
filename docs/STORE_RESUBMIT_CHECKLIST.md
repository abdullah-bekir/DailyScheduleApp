# Planly — Mağazaya yeniden gönderim kontrol listesi (1.0.7)

Paket: `com.abdullahbekir.DailyscheduleApp`  
Sürüm: **1.0.7** · Android `versionCode` **10** · iOS build **27** (EAS `app.json`)

Bu dosya, **çözülmemiş politika maddelerini** kapatmak ve reddedilen sürümü yeniden göndermek içindir.  
Kod tarafında eklenenler: paywall abonelik metni, Ayarlar → gizlilik + **Bulut hesabını sil**, güncellenmiş gizlilik metni.

**Gizlilik URL (Play + Apple aynı):**  
https://gist.githubusercontent.com/abdullah-bekir/c7a5148c5458a345a4237aaf8eecd93a/raw/privacy.html

Gist kaynağı: `docs/privacy.html` — değiştirdikten sonra GitHub Gist’i güncelle.

---

## A) Google Play Console

### A1 — Politika durumu (çözülmemiş sorunlar)

Play Console → **Planly** → **Politika durumu**. Kırmızı/sarı her satır için:

| Konu | Yapılacak |
|------|-----------|
| **Mağaza girişi** | Kısa/açıklama, ekran görüntüleri (telefon), ikon 512, feature graphic 1024×500 → `assets/play-phone-*.png`, `assets/feature-graphic-1024x500.png`, `assets/play-icon-512.png` |
| **Resmi kurum / Finans / Sağlık** | Hepsi **Hayır** ([PLAY_CHECKLIST_CEVAPLAR.md](./PLAY_CHECKLIST_CEVAPLAR.md)) |
| **Reklam** | **Evet**, AdMob |
| **Hedef kitle** | **18+**, çocuk uygulaması değil |
| **Veri güvenliği** | Aşağıdaki A2 ile uyumlu doldur |
| **Gizlilik politikası URL** | Yukarıdaki HTTPS gist raw link |

### A2 — Veri güvenliği (uygulama ile aynı olmalı)

| Veri | Toplanıyor | Paylaşılıyor | Amaç |
|------|------------|--------------|------|
| Kullanıcı kimliği (anon UUID) | Evet | Hayır (Supabase) | Uygulama işlevi |
| Uygulama etkinliği (görevler) | Evet | Hayır | Uygulama işlevi |
| Reklam kimliği | Evet | Evet (AdMob) | Reklam |
| Satın alma geçmişi | Evet | Play | Abonelik |

**Hesap / veri silme (Play zorunluluğu):**

- **Uygulama içi:** Ayarlar → **Veri yönetimi** → *Tüm veriyi sıfırla* veya **Bulut hesabını sil**
- **Web / e-posta:** Gizlilik politikası + `abdullahbekir@gmail.com`
- Data safety formunda **Account deletion URL** veya “in-app only” + politika linki

### A3 — Abonelikler

- `planly_premium_monthly` / `monthly` — **Active**
- `planly_premium_annual` / `annual` — **Active**
- RevenueCat offering `default` bağlı
- Yüklenen AAB: **1.0.7 (10)** — eski taslakları güncelle

### A4 — EAS production sırları

Yerel `.env` yeterli değil; [expo.dev](https://expo.dev) → Project → **Secrets** (production):

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`
- AdMob `EXPO_PUBLIC_*` (production birimleri)
- `EXPO_PUBLIC_ADS_UI_ENABLED=true`

Sonra:

```bash
npm run eas:build:production:android
npm run eas:submit:android
```

Internal/draft’tan **Production** veya kapalı teste yükselt → **İncelemeye gönder**.

### A5 — Supabase (hesap silme)

Dashboard → **Authentication** → **Providers** → Anonymous: açık  
Dashboard → **Authentication** → **Settings** → kullanıcıların hesabını silmesine izin ver (client `auth.deleteUser()` için).

---

## B) Apple App Store Connect

Adım adım metinler (Turkish açıklama, Review Notes): [APP_STORE_IOS.md](./APP_STORE_IOS.md)

| # | Madde | Durum |
|---|--------|--------|
| 1 | 6.5" iPhone ekran görüntüleri | `assets/app-store/01-*.png` … |
| 2 | 13" iPad ekran görüntüleri | `assets/app-store/ipad-*.png` |
| 3 | Privacy Policy URL | Gist HTTPS (yukarı) |
| 4 | İletişim / Review bilgisi | E-posta, telefon, “Sign-in: No” |
| 5–8 | Turkish açıklama, keywords, Support URL, Copyright | Connect’te güncel sürüm alanları |
| 9–10 | Add for Review → Submit | |
| 11 | EAS iOS build / Push profili | [IOS_EAS_PUSH_PROVISIONING.md](./IOS_EAS_PUSH_PROVISIONING.md) |

**iOS kod / EAS:**

- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` production secret’ta olmalı
- Sandbox ile paywall test notunu **App Review Notes**’a ekle
- Abonelik: [IOS_SUBSCRIPTIONS.md](./IOS_SUBSCRIPTIONS.md)

Support URL önerisi (Play ile aynı politika sayfası):

`https://gist.githubusercontent.com/abdullah-bekir/c7a5148c5458a345a4237aaf8eecd93a/raw/privacy.html#contact`

(Gist’te `#contact` yoksa tam sayfa URL’si yeterli.)

---

## C) Reddedilme e-postası

Google / Apple’ın gönderdiği **tam red metnini** sakla. Politika kodu (ör. Data safety, Subscriptions, 3.1.1) varsa bir sonraki düzeltme ona göre hedeflenir.

---

## D) Gönderim öncesi PC testleri

```bash
npm run i18n:check
npm run smoke
```

Cihazda (5 dk):

1. Ayarlar → Gizlilik politikası açılıyor mu?
2. Paywall → yenileme metni + gizlilik linki
3. Ayarlar → Bulut hesabını sil (test hesabı)
4. Android: Play internal build ile satın alma + restore

Son güncelleme: 2026-10-09
