# iOS EAS build — Push / provisioning profile hatası

Hata örneği:

- Provisioning profile doesn't support the **Push Notifications** capability
- doesn't include the **aps-environment** entitlement

`expo-notifications` eklentisi App Store imzası için Push yeteneği ister; EAS’teki profil (ör. 2026-09-26) bu yeteneği içermiyorsa build düşer.

## Çözüm (önerilen)

1. [Apple Developer → Identifiers](https://developer.apple.com/account/resources/identifiers/list) → `com.abdullahbekir.DailyscheduleApp` → **Push Notifications** → **Enable** → Save.
2. [expo.dev](https://expo.dev) → **DailyscheduleApp** → **Credentials** → **iOS** → **Provisioning Profile** → sil / yenile (veya terminalde `npx eas-cli credentials -p ios`).
3. `app.json` içinde `ios.buildNumber` artır → `npx eas-cli build --profile production --platform ios`.

## Android

Production AAB genelde ayrı build’de başarılı kalır; Play için `npm run eas:submit:android`.
