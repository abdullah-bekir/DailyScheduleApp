# Planly — App Store Connect 1.0.6 (incelemeye gönderim)

Apple’ın **Unable to Add for Review** listesindeki maddeler için adım adım rehber.  
**Connect’e sadece sen girebilirsin;** aşağıdaki metinleri kopyala-yapıştır.

**Sürüm:** 1.0.6 · **Build:** 16 · **Bundle ID:** `com.abdullahbekir.DailyscheduleApp`

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

1. `docs/PRIVACY_POLICY_PLANLY.md` içinde e-posta placeholder’larını düzenle.
2. Metni **HTTPS** ile yayınla (GitHub Pages, Google Sites, Notion public, kendi siten).
3. **Planly** → sol menü **App Privacy** (Uygulama Gizliliği):
  - Anketi daha önce doldurmadıysan tamamla (veri türleri: görev verisi, reklam kimliği, satın alma — Play checklist ile uyumlu).
  - **Privacy Policy URL** alanına canlı linki yapıştır → **Publish** / kaydet.

**Placeholder (URL’in hazır olana kadar kullanma — Apple https ister):**

```text
https://SENIN-Domainin.com/planly-privac
```

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
| Sign-in required       | **Hayır** (Planly anonim kullanım)         |
| Notes                  | Aşağıdaki “İnceleme notu”                  |


**İnceleme notu (kopyala):**

```text
Planly is a daily task planner. No login is required.

To test Premium: open the Stats tab → Premium / paywall → subscription plans (monthly/annual). Use Sandbox Apple ID for IAP. Restore Purchases is on the paywall and Stats.

Ads appear in the free tier; Pro subscription removes ads via RevenueCat entitlement "premium".
```



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
• İsteğe bağlı cihazlar arası bulut senkronu

Planly Pro (isteğe bağlı abonelik)
• Reklamları kaldırır
• Premium özelliklere erişim sağlar

Giriş zorunlu değildir; uygulamayı açıp hemen kullanmaya başlayabilirsin.

Gizlilik: Görevlerin sana aittir. Reklam ve abonelik için Apple App Store, AdMob ve RevenueCat kullanılabilir. Ayrıntılar gizlilik politikasında.
```



### Keywords (Anahtar kelimeler) — max ~100 karakter, virgülle

```text
görev,plan,günlük,planlayıcı,todo,alışkanlık,verimlilik,ajanda,istatistik,hatırlatıcı
```



### Support URL (Destek URL’si)

**https://** ile başlamalı (mailto geçmez). Örnekler:

```text
https://SENIN-Siten.com/planly-support
```

veya gizlilik sayfası + `#contact`, veya GitHub Issues public link. Play Console’da kullandığın **aynı** destek sayfası varsa onu kullan.

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



## Senin doldurman gereken 3 placeholder

1. **Privacy Policy URL** (canlı https) — `PRIVACY_POLICY_PLANLY.md` yayınlandıktan sonra
2. **Support URL** (canlı https)
3. **Copyright** ismi (yukarıdaki © satırı onayın)

Bunları Connect’e girdikten sonra **Add for Review** durumunu yaz; Submit öncesi son kontrolü birlikte yaparız.