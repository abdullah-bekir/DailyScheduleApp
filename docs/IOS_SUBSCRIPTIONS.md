# iOS abonelikleri — Planly (A → B → C sırası)

**Senin durum:** App Store’da ürün yok (A) → RevenueCat’te iOS product yok (B) → Offering’de iOS sütunu boş (C).  
**D yok:** Play’de alınan abonelik iPhone’a taşınmaz; önce iOS’ta ürün + satın alma olmalı.

Bundle ID: `com.abdullahbekir.DailyscheduleApp`  
Product ID (Play ile aynı isimler): `planly_premium_monthly`, `planly_premium_annual`  
Entitlement: `premium`  
EAS (zaten var): `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (`appl_…`), `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=premium`

Android rehberi (referans): [PLAY_SUBSCRIPTIONS.md](./PLAY_SUBSCRIPTIONS.md)

---

## A) App Store Connect — abonelikleri oluştur

1. [App Store Connect](https://appstoreconnect.apple.com) → **Agreements, Tax, and Banking**  
   → **Paid Applications** = **Active** (değilse sözleşme + banka + vergi bitir).

2. **Apps** → **Planly** → sol menü **Subscriptions** (Abonelikler).

3. **Subscription Group** oluştur (ör. ad: `Planly Premium`).

4. Grup içinde **+** ile abonelik ekle:

   | Reference name (görünen ad) | Product ID (ID’yi sonradan değiştiremezsin) |
   |-----------------------------|---------------------------------------------|
   | Planly Premium Monthly      | `planly_premium_monthly`                    |
   | Planly Premium Annual       | `planly_premium_annual`                     |

5. Her abonelik için:
   - **Subscription Duration:** Monthly / 1 Year
   - **Subscription Prices** → Türkiye (ve istediğin ülkeler)
   - **App Store Localization** → görünen ad + açıklama (kısa)
   - Durum: **Ready to Submit** veya onay sonrası **Approved**

6. **Planly** → sürüm **1.0.6** (veya yeni build) → **In-App Purchases and Subscriptions** bölümüne  
   `planly_premium_monthly` ve `planly_premium_annual` ekle (incelemeye gönderirken gerekir).

7. **Sandbox test:** Users and Access → **Sandbox** → Test Apple ID oluştur; iPhone’da App Store’da bu hesapla giriş.

**A bitti say:** Subscriptions listesinde iki ürün, Product ID’ler yukarıdaki gibi.

---

## B) RevenueCat — iOS ürünlerini içeri al

1. [app.revenuecat.com](https://app.revenuecat.com) → Planly projesi.

2. Sol **Apps** → **iOS** uygulaması var mı?  
   - Yoksa ekle: Bundle ID `com.abdullahbekir.DailyscheduleApp`.

3. **Apps & providers** → iOS app:
   - **App Store Connect API** (Issuer ID, Key ID, `.p8`) bağlı olsun.
   - **In-App Purchase Key** (`SubscriptionKey_….p8`) yüklü olsun (StoreKit 2 / satın alma kaydı için).

4. **Product catalog** → **Products** → **+ New** / **Import**:
   - App Store’dan: `planly_premium_monthly`, `planly_premium_annual`  
   - Store: **App Store**, identifier’lar Connect ile **birebir** aynı.

5. **Entitlements** → `premium` → **Attach** → her iki **iOS** ürününü ekle  
   (Android ürünleri zaten bağlıysa iOS’ları da ekle).

**B bitti say:** Products listesinde her iki ürünün **App Store** satırı dolu.

---

## C) RevenueCat — Offering (iOS sütununu doldur)

1. **Product catalog** → **Offerings** → **default** (Current offering).

2. Paketler (Android’dekine paralel):
   - `$rc_monthly` (veya Monthly) → **App Store product:** `planly_premium_monthly`
   - `$rc_annual` (veya Annual) → **App Store product:** `planly_premium_annual`

3. Kaydet. Offering önizlemede **iOS** tarafında boş kalmamalı.

**C bitti say:** Offering paketlerinde hem Google Play hem App Store ürünü seçili (veya en azından iOS dolu).

---

## Sonra: uygulama build (16)

Panel A+B+C bittikten sonra (kod tarafında `buildNumber` 16):

```powershell
npm run eas:build:production:ios
npm run eas:submit:ios
```

TestFlight’tan kur → **İstatistikler / Paywall** → aylık + yıllık fiyat görünür → Sandbox ile satın al → RevenueCat **Customers** → `premium` aktif.

Yeni onaylanan ürünlerde Apple bazen **24 saat** gecikme yapar.

---

## RevenueCat’te iOS: **Could not check** (Android Published, iOS sarı uyarı)

Bu, RevenueCat’in **App Store’dan ürünü doğrulayamadığı** anlamına gelir. iPhone’da plan çıkmaz / geri yükleme çalışmaz; **kod build’i bunu düzeltmez**.

**Sırayla düzelt:**

1. **App Store Connect** → **Agreements** → **Paid Applications** = **Active**
2. **Subscriptions** → `planly_premium_monthly` ve `planly_premium_annual` var, metadata + fiyat dolu
3. **Users and Access** → **Integrations** → **In-App Purchase** → **+** → anahtar indir (`.p8` **SubscriptionKey**)
4. **App Store Connect API** → **+** → Key oluştur → **Issuer ID**, **Key ID**, `.p8` indir (Admin veya App Manager)
5. **RevenueCat** → **Apps & providers** → **Planly iOS** (`com.abdullahbekir.DailyscheduleApp`):
   - **App Store Connect API Key** (Issuer ID, Key ID, AuthKey `.p8`) kaydet
   - **In-app purchase key configuration** → SubscriptionKey `.p8` yükle
   - Bundle ID = `com.abdullahbekir.DailyscheduleApp` (Connect ile aynı)
6. RevenueCat **Products** sayfasını yenile; birkaç dakika–saat sonra durum **Published** / yeşile dönmeli
7. Hâlâ **Could not check** ise: Product ID Connect’teki ile **harf harf** aynı mı kontrol et; yanlışsa Connect’te doğru ID ile yeni abonelik aç, RevenueCat’te eskiyi silip **yeniden import** et

Android’de `planly_premium_annual:annual` görünmesi normal (Play base plan). iOS’ta sadece `planly_premium_annual` olur — farklı format, sorun değil.

---

## Hızlı kontrol listesi

- [ ] A — Connect’te `planly_premium_monthly` + `planly_premium_annual`
- [ ] A — Paid Applications Active
- [ ] B — RevenueCat Products’ta iOS import
- [ ] B — Entitlement `premium` → iOS ürünleri bağlı
- [ ] B — In-App Purchase Key (.p8) yüklü
- [ ] C — Offering `default` → monthly/annual **App Store** seçili
- [ ] TestFlight build 16 → fiyatlar görünüyor
- [ ] Sandbox satın alma + geri yükleme (aynı Apple ID)

Son güncelleme: 2026-09-28
