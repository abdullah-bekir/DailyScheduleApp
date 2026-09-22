# Planly — adım adım düzenleme planı

Sırayla ilerleyin; her adım bitince bir sonrakine geçin.

## Adım 1 — Repo hijyeni ✅ (kısmen)

- [x] `.gitignore`: `.expo-export-check/`, `.expo-export-temp/`
- [x] `app.json`: `"expo"` kök anahtarı doğru (1.0.5)
- [x] Güvenilirlik listesinde bilinen geçen maddeler işaretlendi

## Adım 2 — Supabase (Dashboard, siz)

`supabase/ROLLOUT_ORDER.txt` — canlı projede **henüz yapılmadıysa** SQL Editor’da bir kez:

1. **Authentication → Anonymous** açık mı kontrol edin.
2. Eski DB ise: `sql/patches/preserve_client_updated_at.sql` çalıştırın (LWW senkron).
3. Dil kolonu eksikse: `sql/upgrades/upgrade_profiles_language_code.sql`.

Test: Table Editor → görev ekle → `tasks` satırı, `user_id` dolu.

## Adım 3 — Tablet smoke (siz, ~10 dk)

`docs/guvenilirlik-test-kontrol-listesi.md` içinde kalan `[ ]` maddeler:

- Görev sil, kapat-aç
- TR + EN dil değiştir
- Uçak modu → online senkron (Supabase açıksa)

## Adım 4 — Git (değişiklikleri kaydet) ✅

- Commit: **1.0.6** (`237cba9` — sync, AppSettingsContext, Play dokümanları)
- Dal: `cursor/harden-premium-billing-gates`
- Remote: `git push -u origin cursor/harden-premium-billing-gates` (siz, gerektiğinde)

`.env` ve `secrets/` **commit edilmez**.

## Adım 5 — Mağaza (Android)

- Play listing metinleri: `docs/PLAY_STORE_LISTING.md`
- Checklist: `docs/PLAY_CHECKLIST_CEVAPLAR.md`
- Sonraki sürümde: `version`, `versionCode`, EAS production AAB

## Adım 6 — İleride (zorunlu değil)

- Sistem bildirimleri (`expo-notifications`) — ayar anahtarı şimdilik sadece tercih kaydediyor
- Otomatik testler
- iOS: `EXPO_PUBLIC_REVENUECAT_IOS_KEY` + App Store build

---

*Güncelleme: 2026-09-21*
