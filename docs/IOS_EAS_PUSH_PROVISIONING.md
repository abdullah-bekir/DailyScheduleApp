# iOS Push + Git + EAS (Planly 1.0.7)

Günlük hatırlatıcı için `expo-notifications` kullanılıyor. App Store imzası **Push Notifications** capability ve provisioning profile içinde **aps-environment** ister.

## 1) Apple Developer (bir kez)

1. [Identifiers](https://developer.apple.com/account/resources/identifiers/list) → `com.abdullahbekir.DailyscheduleApp`
2. **Capabilities** → **Push Notifications** → işaretle → **Save**
3. (İsteğe bağlı) **Profiles** listesinde eski App Store profilini görürsün; asıl yenileme EAS tarafında yapılır.

## 2) EAS provisioning profile yenile

**A — expo.dev (önerilen)**

1. [expo.dev](https://expo.dev) → **DailyscheduleApp** → **Project settings** → **Credentials** → **iOS**
2. **Provisioning Profile** (App Store) → **Delete** veya **Regenerate**
3. Yeni production build al; EAS profili Push ile yeniden oluşturur.

**B — Terminal (etkileşimli)**

```powershell
cd C:\Users\abdul\OneDrive\NOTEPADS\NOTEPADSS\DailyscheduleApp
npm run eas:credentials:ios
```

Menüden App Store provisioning profile’ı sil/yenile.

## 3) Git (GitHub)

Kod değişince:

```powershell
git status
git add -A
git commit -m "mesaj"
git push origin main
```

Remote: `https://github.com/abdullah-bekir/DailyScheduleApp.git`

EAS build, yüklemeden önce repodaki **commit** ile eşleşir; push etmeden de yerel dosyadan build alınabilir ama GitHub ile senkron kalsın.

## 4) iOS build + TestFlight

`app.json` → `ios.buildNumber` her yeni mağaza binary’sinde **artmalı** (ör. 27).

```powershell
npm run smoke
npx eas-cli build --profile production --platform ios --non-interactive
npm run eas:submit:ios
```

Submit’te listeden **en son başarılı** 1.0.7 build’ini seç (aynı build number’ı iki kez yükleme).

## 5) Android sürümü

Bare `android/` klasörü var: Play sürümü **`android/app/build.gradle`** içindeki `versionCode` / `versionName` ile gider; `app.json` ile aynı tut (ör. 10 / `"1.0.7"`).

```powershell
npx eas-cli build --profile production --platform android --non-interactive
npm run eas:submit:android
```

## Hata özeti

| Mesaj | Anlam |
|--------|--------|
| doesn't support Push Notifications | App ID’de Push kapalı veya profil eski → §1–2 |
| doesn't include aps-environment | Profil Push içermiyor → profili yenile + yeni build |
| Submit “Something went wrong” | Aynı build zaten yüklü → TestFlight’ta mevcut build’i kullan |
