# Planly (DailyscheduleApp)

Günlük görev ve plan uygulaması. Yerel saklama, Supabase senkronu, tema, 13 dil, AdMob ve RevenueCat paywall.

**Sürüm:** 1.0.6  
**Stack:** Expo SDK 54 · React Native · Supabase

## Hızlı başlangıç

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npx expo start
```

Android: `npm run android`

`.env` için değerleri [`.env.example`](.env.example) ve [supabase/README.md](supabase/README.md) üzerinden doldurun.

## Yararlı script'ler

| Script | Açıklama |
|--------|----------|
| `npm run i18n:check` | 13 locale dosyasının `en.json` ile uyumunu kontrol eder |
| `npm run eas:build:preview:android` | Android preview APK (EAS) |
| `npm run eas:build:production:android` | Android production AAB (EAS) |
| `npm run eas:build:production:ios` | iOS production IPA (EAS) |
| `npm run eas:submit:android` | Son production AAB → Play (draft/internal) |
| `npm run eas:submit:ios` | Son production IPA → App Store Connect |
| `npm run eas:update:production` | OTA update (production kanalı) |

Tüm script'ler için `package.json` dosyasına bakın.

## Dokümantasyon

- [Play Console checklist cevapları](docs/PLAY_CHECKLIST_CEVAPLAR.md)
- [Play Store listing metinleri](docs/PLAY_STORE_LISTING.md)
- [Klasör rehberi](docs/KLASOR_REHBERI.md)
- [Güvenilirlik test kontrol listesi](docs/guvenilirlik-test-kontrol-listesi.md)
- [Reklam politikası](docs/REKLAM_POLITIKASI.md)
- [Supabase kurulumu](supabase/README.md)

---

Son güncelleme: 2026-09-19
