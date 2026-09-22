# Planly — güvenilirlik test kontrol listesi

Sürüm **1.0.6** için kısa smoke test. Gerçek cihaz veya emülatörde, production’a yakın build ile (mümkünse EAS preview/production) işaretleyin.

## Kurulum

- [x] `npm install` hatasız
- [x] `.env` dolu (Supabase URL + anon key)
- [x] `npx expo-doctor` geçiyor
- [x] `npm run i18n:check` geçiyor

## Görevler (çevrimdışı)

- [x] Yeni görev ekle *(Android tablet, 2026-09-21)*
- [x] Görevi tamamla / geri al *(genel smoke — tablet)*
- [ ] Görev sil
- [ ] Uygulamayı kapat-aç: görevler duruyor
- [ ] Günlük plan hedefi değişince ilerleme çubuğu doğru

## Tema ve dil

- [x] Açık / koyu tema geçişi *(tablet smoke)*
- [ ] En az 2 dil (ör. TR + EN) metinleri bozulmadan değişiyor

## Bulut (Supabase açıksa)

- [ ] İlk açılışta anonim oturum oluşuyor
- [ ] Görev ekle → birkaç saniye içinde başka oturumda / yeniden yüklemede görünüyor (veya outbox sonra boşalıyor)
- [ ] Uçak modu: görev ekle → online olunca senkron

## Abonelik (RevenueCat key varsa)

- [x] Paywall açılıyor, paketler listeleniyor *(Play Internal 1.0.5)*
- [x] Test satın alma / restore (sandbox) *(tablet — satın alma tamamlandı)*

## Reklamlar (`EXPO_PUBLIC_ADS_UI_ENABLED=true` build)

- [ ] Premium değilken banner / interstitial kurallara uygun (sıklık, Pro’da kapalı)
- [ ] Test ID yerine production build’de gerçek AdMob birimleri

## Mağaza build

- [ ] `app.json`: `version`, Android `versionCode`, iOS `buildNumber` artırıldı
- [ ] Production AAB/IPA EAS ile oluşuyor
- [ ] OTA: `npm run eas:update:production` sonrası uygulama güncelleniyor

---

Not: Otomatik unit/e2e testi yok; bu liste manuel regresyon içindir.
