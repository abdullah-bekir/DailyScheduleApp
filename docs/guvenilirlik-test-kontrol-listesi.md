# Planly güvenilirlik test kontrol listesi

Her sürümden önce Android cihazda aşağıdaki senaryoları doğrulayın:

1. Uygulamayı açın, görev ekleyin, düzenleyin, tamamlayın ve silin. Uygulamayı kapatıp yeniden açınca verilerin korunduğunu kontrol edin.
2. İnterneti kapatın; görev ve ayar değişikliği yapın. İnterneti açıp `Ayarlar > Şimdi senkronize et` ile değişikliklerin buluta ulaştığını doğrulayın.
3. Supabase bağlantısını geçici olarak kesip bir görev değiştirin. Ekranda senkronizasyon hatası ve `Tekrar dene` seçeneğinin göründüğünü kontrol edin.
   Ardından bağlantıyı açıp `Tekrar dene`ye basın; ekleme, düzenleme veya silme değişikliğinin buluta ulaştığını doğrulayın.
4. Ayarlardan tema, bildirim, günlük plan hedefi ve dili değiştirin. Uygulamayı kapatıp açınca değerlerin korunduğunu doğrulayın.
5. Aynı cihazda farklı bir Supabase oturumu kullanılıyorsa ikinci oturumda ilk kullanıcının görev, puan veya ayarlarının görünmediğini doğrulayın.
6. Arapçaya geçip uygulamayı yeniden yükleyin; sağdan sola düzenin ve ekran metinlerinin doğru göründüğünü kontrol edin.
7. Son olarak `npm run i18n:check`, `npx expo-doctor` ve Android bundle/build doğrulamasını çalıştırın.

Not: Uygulama görev bulut verisini ilk kez yüklerken görev değiştirme düğmeleri geçici olarak devre dışıdır. Yükleme bittiğinde normal şekilde kullanılabilir.
