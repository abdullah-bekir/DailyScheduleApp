# Planly — App Store Connect 1.0.6 (incelemeye gönderim)

Apple’ın **Unable to Add for Review** listesindeki maddeler için adım adım rehber.  
**Connect’e sadece sen girebilirsin;** aşağıdaki metinleri kopyala-yapıştır.

**Sürüm:** 1.0.6 · **Build:** 20 (TestFlight; e-posta kayıt/giriş) · **Bundle ID:** `com.abdullahbekir.DailyscheduleApp`

---

## Kontrol listesi (sırayla)


| #   | Apple hatası                   | Nerede                                                       | Durum |
| --- | ------------------------------ | ------------------------------------------------------------ | ----- |
| 1   | 6.5-inch iPhone screenshot     | 1.0.6 → Screenshots → iPhone                                 | ☐     |
| 2   | 13-inch iPad screenshot        | 1.0.6 → Screenshots → iPad                                   | ☐     |
| 3   | Privacy Policy URL             | App → **App Privacy**                                        | ☐     |
| 4   | Contact Information            | App → **App Information** / sürüm **App Review Information** | ☐     |
| 5   | Turkish Description            | 1.0.6 → **Turkish** localization                             | ☐     |
| 6   | Turkish Keywords               | Aynı                                                         | ☐     |
| 7   | Turkish Support URL            | Aynı                                                         | ☐     |
| 8   | Copyright                      | 1.0.6 (genel) + Turkish alanı                                | ☐     |
| 9   | **Add for Review** mavi        | 1.0.6 üst                                                    | ☐     |
| 10  | **Submit** (Draft Submissions) | Taslak sunum                                                 | ☐     |
| 11  | **App Review Notes** (6 madde) | Aşağıdaki § App Review — Notes alanına | ☐     |
| 12  | **Ekran kaydı (.mp4)**         | Fiziksel iPhone; § App Review akışı    | ☐     |
| 13  | **EAS: RevenueCat iOS key**    | production env (expo.dev) — tanımlı      | ☑     |


Hepsi ☐ → ✓ olunca inceleme başlar.

---



## 1–2) Ekran görüntüleri



### 6.5" iPhone (zorunlu)

**Boyut:** 1284 × 2778 px (portrait).

**Projede hazır dosyalar** (`assets/app-store/`):


| Dosya                    | İçerik (EN UI, gray bg) |
| ------------------------ | ----------------------- |
| `01-home-1284x2778.png`  | Home                    |
| `02-tasks-1284x2778.png` | Tasks                   |
| `03-stats-1284x2778.png` | Statistics              |


**Connect:** Dağıtım → **1.0.6** → **Screenshots** → **iPhone** → **6.5" Display** (veya “6.5 inch”) → en az **3** görsel yükle (yukarıdaki sırayla).

Yeniden üretmek için (laptop):

```bash
python scripts/make_play_screenshots.py
```



### 13" iPad (zorunlu)

**Boyut (portrait):** **2064 × 2752** px — Apple panelinde **13-inch iPad Display**.

**Projede hazır dosyalar** (`assets/app-store/`):

| Dosya | İçerik (EN UI, gray bg) |
|-------|-------------------------|
| `ipad-01-home-2064x2752.png` | Home |
| `ipad-02-tasks-2064x2752.png` | Tasks |
| `ipad-03-stats-2064x2752.png` | Statistics |

Üretmek için:

```bash
python scripts/make_play_screenshots.py
```

**Connect:** Aynı 1.0.6 sayfası → **iPad** → **13-inch Display** → en az **1** (öneri: 3) görsel yükle.

### Abonelik inceleme ekran görüntüsü (ayrı)

Monetizasyon → Abonelikler → Aylık/Yıllık → **Review screenshot**  
Varsa: `assets/app-store/ios-subscription-review-1080x1920.png` veya script çıktısı `*-subscription-review*`.

---



## 3) Privacy Policy URL

1. Canlı URL (Play ile aynı): `https://gist.githubusercontent.com/abdullah-bekir/c7a5148c5458a345a4237aaf8eecd93a/raw/privacy.html` — kaynak: `docs/privacy.html` (Gist’i güncelle).
2. **Planly** → sol menü **App Privacy** (Uygulama Gizliliği):
  - Anketi daha önce doldurmadıysan tamamla (veri türleri: görev verisi, reklam kimliği, satın alma — Play checklist ile uyumlu).
  - **Privacy Policy URL** alanına canlı linki yapıştır → **Publish** / kaydet.

---



## 4) Contact Information

Apple iki yeri karıştırır; **ikisini de** doldur:

### A) App Review Information (sürüm 1.0.6)

Dağıtım → **1.0.6** → **App Review Information** / **İnceleme bilgileri**


| Alan                   | Öneri                                      |
| ---------------------- | ------------------------------------------ |
| First name / Last name | Adın soyadın                               |
| Phone                  | +90 … (ulaşılabilir)                       |
| Email                  | App Store’da kayıtlı geliştirici e-postası |
| Sign-in required       | **Evet** (e-posta + şifre; kayıt: kullanıcı adı + e-posta) |
| Notes                  | Aşağıdaki “İnceleme notu”                  |


**Notes (English — paste into App Review Information → Notes):**

```text
Planly v1.0.6 — com.abdullahbekir.DailyscheduleApp

(1) Screen recording: cold launch → Welcome (email + password sign-in OR Create account: username, email, password, accept Terms) → Home → add/complete task → Tasks → Stats → Settings → Stats → See plans → Paywall (monthly/annual) → Restore or Sandbox purchase. Account deletion: Settings → Data management → Delete account. No public UGC/social content.

(2) Purpose: daily task planner for adults 18+; account with email/password via Supabase; cloud sync when signed in.

(3) Sign-in required: YES (email + password at first launch). Demo: create a test account in the recording or provide reviewer credentials below if needed. Premium: Stats → See plans; Sandbox Apple ID for IAP; entitlement "premium" (RevenueCat).

(4) External services: Supabase, AdMob (free tier), RevenueCat, Apple IAP. No AI providers.

(5) Same features worldwide; 13 UI languages.

(6) Not medical/financial/government; no licensed third-party content.

Privacy: https://gist.githubusercontent.com/abdullah-bekir/c7a5148c5458a345a4237aaf8eecd93a/raw/privacy.html
Support: abdullahbekir@gmail.com
```

**Ekran kaydı (senin cihazında):** Uygulamayı kapat → kayıt başlat → ikondan aç → **giriş veya yeni hesap** → yukarıdaki akış → `.mp4`’ü Resolution Center veya Review ekinde gönder. (Fiziksel iPhone; TestFlight **build 20**.)



### B) Genel iletişim (App Information)

**Planly** → **General** → **App Information**  
Eksik **Contact** / **Support** alanları varsa doldur (Apple hesabındaki geliştirici iletişimi bazen buradan çekilir).

---



## 5–8) Turkish localization + Copyright

**Dağıtım → 1.0.6 →** dil **Turkish** (veya **App Store Localization → Turkish**).

### Description (Açıklama) — yapıştır

```text
Planly, gününü sade ve net tutmana yardımcı olan günlük plan ve görev uygulamasıdır.

• Bugünün görevlerini tek bakışta gör
• Öncelik, saat ve tarih ile görev ekle
• İlerlemeyi istatistiklerle takip et
• Açık / koyu tema ve 13 dil
• E-posta ve şifre ile hesap; bulut senkronu (Supabase)

Planly Pro (isteğe bağlı abonelik)
• Reklamları kaldırır
• Premium özelliklere erişim sağlar

İlk açılışta e-posta ile kayıt veya giriş gerekir. Hesap silme: Ayarlar → Veri yönetimi.

Gizlilik: Görevlerin sana aittir. Reklam ve abonelik için Apple App Store, AdMob ve RevenueCat kullanılabilir. Ayrıntılar gizlilik politikasında.
```



### Keywords (Anahtar kelimeler) — max ~100 karakter, virgülle

```text
görev,plan,günlük,planlayıcı,todo,alışkanlık,verimlilik,ajanda,istatistik,hatırlatıcı
```



### Support URL (Destek URL’si)

**https://** ile başlamalı (mailto geçmez). Örnekler:

```text
https://gist.githubusercontent.com/abdullah-bekir/c7a5148c5458a345a4237aaf8eecd93a/raw/privacy.html#contact
```

(Gist’i `docs/privacy.html` ile güncelle; `#contact` destek iletişimi için.)

### Copyright (Telif)

**1.0.6 sürüm sayfasındaki Copyright alanı** (ve Turkish gerekiyorsa):

```text
© 2026 Abdullah Bekir
```

*(İsim/şirket farklıysa kendi telif satırınla değiştir.)*

---



## 9–10) İncelemeye ekle ve gönder

1. **Save** → üstteki kırmızı/sarı **“You have one or more errors”** kaybolmalı.
2. **Add for Review** / **İnceleme için ekle** **mavi** olmalı → tıkla.
3. **Draft Submissions (1) >** → pakette **iOS 1.0.6 + abonelikler** → **Submit to App Review**.

---



## Onaydan sonra ne olur?


| Aşama             | Ne beklenir                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| Gönderim          | **Waiting for Review** → **In Review** (saatler–günler)                   |
| Onay              | Sürüm + abonelikler onaylanır; StoreKit ürünleri sunar                    |
| RevenueCat        | Dashboard → **Products** → yenile → iOS **Published** / fetch OK          |
| Telefon           | TestFlight / mağaza build → Sandbox ile **satın al** → planlar görünür    |
| App Store “yayın” | İnceleme ≠ otomatik herkese açık; **Release** seçeneğinle kontrol edersin |


Android’deki Pro aboneliği iOS’ta **Restore** ile gelmez; iOS’ta ayrı Sandbox/production satın alma gerekir.

---



## Yeniden gönderim

Tüm mağaza adımları: [STORE_RESUBMIT_CHECKLIST.md](./STORE_RESUBMIT_CHECKLIST.md)

Connect’e Privacy + Support URL girdikten sonra **Add for Review** → **Submit**.