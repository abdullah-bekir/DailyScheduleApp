# Play abonelikleri + RevenueCat (Planly)

Package: `com.abdullahbekir.DailyscheduleApp`  
Entitlement: `premium`  
AAB: **1.0.5 / versionCode 8** → Play Internal **draft**  
Submit: https://expo.dev/accounts/abdullahbekir/projects/DailyscheduleApp/submissions/ea24890d-7f12-4114-82dc-2230a85c5042  
Build: https://expo.dev/accounts/abdullahbekir/projects/DailyscheduleApp/builds/7b652669-7d5e-4bb1-80c4-6812ebf836a4  
Local AAB: `store-assets/planly-1.0.5-vc8.aab`

Service account (EAS Submit): `revenuceat@planly-504819.iam.gserviceaccount.com`  
JSON: `secrets/google-play-service-account.json` (gitignore)  
API not: Google Play Android Developer API **etkin**

## Durum (2026-08-27)

| Adım | Durum |
|------|--------|
| EAS Submit Internal draft | Tamam |
| `planly_premium_monthly` / `monthly` | **ACTIVE** |
| `planly_premium_annual` / `annual` | **ACTIVE** |
| RevenueCat products | Tamam — `planly_premium_monthly:monthly`, `planly_premium_annual:annual` |
| Entitlement `premium` | Tamam — her iki ürün bağlı |
| Offering `default` | Tamam — `$rc_monthly` + `$rc_annual` |
| Ödeme ülke kısıtı | Tamam — aylık ve yıllık **0 kısıt** |
| Cihazda test — License testing | Tamam — `planly testers` (1 Gmail) kaydedildi |
| Cihazda test — Internal yayın | Tamam — katılma linki alındı |
| Cihazda test — Play’den yükleme | Tamam — tablette 1.0.5 (unreviewed) |
| Cihazda test — satın alma | Tamam — tablette “Satın alma tamamlandı” |
| Cihazda test — Pro / reklam | Tamam — “Premium aktif”, reklamlar kapalı |

## 1) Play — aylık (şimdi bitir)

1. Planly → **Abonelikler** → **Planly Premium Monthly**
2. Vergi / ödeme konumunda **Ülke kısıtlamalarını yönet** → **tüm seçimleri kaldır** → Kaydet  
   Hedef metin: **Kısıtlanan ülke/bölge yok**
3. **Temel plan ekleyin** (veya mevcut `monthly`):
   - ID: `monthly`
   - Tür: **Otomatik yenileme**
   - Fatura dönemi: **Aylık** (Günlük değil)
   - Türkiye fiyatı: **49,99 TL**
   - Diğer ülkeler: **kur ile uygula** (her yerde 2,50 yazma)
4. Planı **Etkinleştir** (Active)

## 2) Play — yıllık

1. Abonelikler → **Abonelik oluştur**
2. Product ID: `planly_premium_annual`
3. Ad: `Planly Premium Annual`
4. Temel plan ID: `annual` · Otomatik yenileme · **1 yıl**
5. Türkiye fiyatı: **499,99 TL** (~10× aylık)
6. Ülke kısıtı yok · **Etkinleştir**

## 3) RevenueCat

1. [app.revenuecat.com](https://app.revenuecat.com) → Planly Android
2. **Products** → Import from Play:
   - `planly_premium_monthly`
   - `planly_premium_annual`
3. **Entitlements** → `premium` → her iki ürün
4. **Offerings** → `default` (Current):
   - `$rc_monthly` → monthly
   - `$rc_annual` → annual

EAS production’da zaten: `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` + `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium`

## 4) Doğrulama

1. Play → Settings → **License testing** → kendi Gmail
2. Internal testing’den uygulamayı yükle
3. Stats → Premium fiyatları görünür → satın al
4. `isPro` → reklamlar kapalı
5. RevenueCat Customer → entitlement `premium` aktif

## 5) Service account (opsiyonel, API otomasyon)

Abonelikleri API ile yönetmek için `revenuceat@...` hesabına ayrıca:
- View financial data
- Manage orders and subscriptions / Manage store presence

EAS Submit için Release izni yeterli; ürün yazma için finansal izin gerekir.

Script (izin sonrası): `python scripts/setup_play_subs.py`

Son güncelleme: 2026-08-27
