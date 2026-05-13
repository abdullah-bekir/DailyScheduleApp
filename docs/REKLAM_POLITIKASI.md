# Reklam ve gelir politikası (DailyscheduleApp)

Bu not, projede reklam ve abonelik davranışının tek kaynaklı özetidir. Ürün kararları değiştiğinde burayı güncelleyin.

## Hedef

- Geliri kullanıcı deneyimini sürekli bozmadan dengelemek.
- Banner sabit ve tahmin edilir konumda; ara ekran (interstitial) sıklığı kontrollü.
- Ödüllü (rewarded) reklam yalnızca kullanıcı bir eyleme bastığında ve net bir karşılık beklentisiyle gösterilir.

## Yerleşim ve türler

| Tür | Konum / tetik | Birim ID kaynağı |
|-----|----------------|------------------|
| Banner | Ana sayfa (`HomeScreen`) altında, sabit slot | `extra.admobBannerUnitId*` (`app.config.js` / `.env`) |
| Interstitial | Ana sayfadaki modül kısayollarında yaklaşık her 3. geçişte | `extra.admobInterstitialUnitId*` |
| Rewarded | Ayarlar → “Ödüllü reklamı dene” (isteğe bağlı kullanım) | `extra.admobRewardedUnitId*` |

Interstitial ile rewarded **farklı native reklam sınıfları ve farklı birim ID** kullanır; callback akışları birbirine karışmaz.

## Premium (RevenueCat)

- Entitlement kimliği varsayılan: `premium` (`EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`).
- Aktif entitlement varken ana sayfada **banner gösterilmez**, modül geçişlerinde **interstitial tetiklenmez**.
- Satın alma / geri yükleme: Paywall ekranı; RevenueCat panelinde Offering ve mağaza ürünleri tanımlı olmalıdır.

## Ortamlar

- **Expo Go:** Native reklam ve RevenueCat modülleri güvenli şekilde devre dışı veya yapılandırılmamış kalır; gerçek doğrulama için **development / preview build** kullanın.
- **Test birim ID:** Google’ın resmi test ID’leri geliştirme için uygundur; yayında kendi birimlerinizi kullanın.

## Yayın kontrol listesi

1. AdMob’da uygulama ve birimler oluşturuldu; `.env` güncellendi.
2. RevenueCat’te API anahtarları ve entitlement ürün bağları doğrulandı.
3. `npx expo prebuild` ile native proje üretildi / EAS build alındı.
4. Mağaza veri güvenliği ve reklam etiketi gereksinimleri (özellikle AB / GDPR ve mağaza kuralları) gözden geçirildi.

## Bilinen sorunlar / notlar

- İmza veya önbellek kaynaklı Android derleme sorunları ortamınıza özgüdür; `clean` build ve doğru keystore kullanın.
- Reklam “yükleniyor”da kalıyorsa ağ, birim ID ve test cihazının AdMob’a bağlı olup olmadığını kontrol edin.

Son güncelleme: proje içi kodla birlikte bakım; tarih tutmuyorsanız commit mesajına güvenin.
