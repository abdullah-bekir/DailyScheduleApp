# Planly — Google Play mağaza girişi metinleri

Paket: `com.abdullahbekir.DailyscheduleApp`  
Uygulama adı: **Planly**

Play Console → **Büyüme → Mağaza girişi → Ana mağaza girişi** alanlarına yapıştır.

---

## Kısa açıklama (max 80 karakter)

```text
Günlük görevlerini planla, takip et ve alışkanlık oluştur — sade ve hızlı.
```

(79 karakter)

Alternatif (EN):

```text
Plan your day, track tasks, and build habits — simple and fast.
```

---

## Uzun açıklama (TR)

```text
Planly, gününü net ve sakin tutmana yardımcı olan günlük plan ve görev uygulamasıdır.

Ne yapabilirsin?
• Bugünün görevlerini tek bakışta gör
• Öncelik, saat ve tarih ile görev ekle
• İlerlemeyi takip et, istatistiklerle motivasyonunu koru
• Açık / koyu tema ve 13 dil desteği
• İstersen cihazlar arası bulut senkronu (Supabase)

Planly Pro (isteğe bağlı)
• Reklamları kaldır
• Pro özelliklere eriş

Giriş zorunlu değil — uygulamayı açıp hemen kullanmaya başlayabilirsin.

Gizlilik: Görevlerin sana aittir. Reklam ve abonelik için Google Play / AdMob / RevenueCat kullanılabilir. Ayrıntılar gizlilik politikasında.
```

---

## Uzun açıklama (EN) — isteğe bağlı yerelleştirme

```text
Planly helps you keep your day clear and calm with a simple daily planner and task list.

What you can do:
• See today’s tasks at a glance
• Add tasks with priority, time, and date
• Track progress and stay motivated with stats
• Light / dark theme and 13 languages
• Optional cloud sync across devices (Supabase)

Planly Pro (optional)
• Remove ads
• Unlock Pro features

No account required — open the app and start right away.

Privacy: Your tasks belong to you. Ads and subscriptions may use Google Play / AdMob / RevenueCat. See the privacy policy for details.
```

---

## Görseller (yükleme checklist)

| Varlık | Boyut / not | Kaynak |
|--------|-------------|--------|
| Uygulama ikonu | 512×512 PNG | `assets/icon.png` (Play ayrıca 512 ister; Expo icon’dan üret) |
| Özellik grafiği (feature graphic) | **1024×500** PNG/JPG zorunlu | Hazır: `store-assets/feature-graphic-1024x500.png` |
| Telefon ekran görüntüsü | En az **2** adet (16:9 veya 9:16) | Emülatör / cihazdan Home + Görevler |
| 7 inç / 10 inç tablet | İsteğe bağlı | — |

### Feature graphic hızlı üretim

1. Canva / Figma’da 1024×500 tuval
2. Arka plan: koyu gri `#1F2228` veya açık `#F2F2F4`
3. Ortada **Planly** + kısa slogan: “Gününü planla”
4. İsteğe bağlı: uygulama ikonu (`assets/icon.png` / `assets/adaptive-icon.png`)
5. PNG olarak dışa aktar → Play’e yükle

### Ekran görüntüsü önerisi

1. Ana sayfa (bugünün görevleri + progress)
2. Görevler listesi
3. İstatistikler (isteğe bağlı 3.)
4. Ayarlar / tema (isteğe bağlı 4.)

Emülatör: `npm run android` veya preview APK ile çek.

---

## Kategori

- Ana kategori: **Verimlilik** (Productivity)
- İletişim e-postası: geliştirici mailin (Play’de kayıtlı olan)

---

## Gizlilik politikası

Önceki oturumda oluşturduğun URL’yi **Mağaza girişi → Gizlilik politikası** alanına yapıştır (henüz yoksa ücretsiz oluşturucu veya GitHub Pages kullan).
