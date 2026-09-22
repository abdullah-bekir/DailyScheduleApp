# Planly — Play Console checklist cevapları

Paket: `com.abdullahbekir.DailyscheduleApp`  
Sürüm: **1.0.5** (versionCode **8**)

Bu dosya, Play Console “Uygulama içeriği / Politika” formlarını tek seferde doldurmak içindir.  
Önceki oturumda tamamlananlar: uygulama oluşturma, gizlilik politikası, oturum açma beyanı.

---

## 1) Reklam

| Soru | Cevap |
|------|--------|
| Uygulamanız reklam içeriyor mu? | **Evet** |
| Reklam SDK | Google AdMob (`react-native-google-mobile-ads`) |
| Reklam türleri | Banner, interstitial, app open, rewarded |
| Premium | Planly Pro (RevenueCat) aktifken reklamlar gizlenir |

Kaydet → checklist’te Reklam yeşil olmalı.

---

## 2) İçerik derecelendirme (IARC)

Yeni anket başlat / mevcut anketi doldur.

Genel cevaplar (Planly günlük görev uygulaması):

| Kategori | Cevap |
|----------|--------|
| Şiddet | Yok / Hayır |
| Cinsel içerik | Yok / Hayır |
| Küfür / dil | Yok / Hayır |
| Uyuşturucu / alkol / tütün | Yok / Hayır |
| Kumar | Yok / Hayır |
| Korku / korkutma | Yok / Hayır |
| Kullanıcı etkileşimi (sohbet, UGC) | Yok (görevler kullanıcıya özel; genel sohbet yok) |
| Konum paylaşımı | Yok |
| Satın alma | Evet — uygulama içi abonelik (isteğe bağlı) |
| Reklam | Evet — AdMob |

Sonuçta tipik derecelendirme: **PEGI 3 / Everyone** civarı (anket sonucuna göre). Anketi gönder ve onayla.

---

## 3) Hedef kitle ve içerik

| Soru | Cevap |
|------|--------|
| Hedef yaş grubu | **18 yaş ve üzeri** (önerilen) — reklam + IAP var; çocuk hedefi seçme |
| Çocuklara yönelik mi? | **Hayır** |
| Attractiveness to children | Hayır / Not designed for children |

Not: 13–17 seçersen reklam politikası (Families / COPPA) daha sıkı olur. Planly için **18+** en güvenlisi.

---

## 4) Veri güvenliği (Data safety)

### Genel

| Soru | Cevap |
|------|--------|
| Veri toplanıyor mu? | **Evet** |
| Veri paylaşılıyor mu? | **Evet** (reklam SDK / AdMob; abonelik için mağaza / RevenueCat) |
| Şifreleme (transit) | **Evet** (HTTPS) |
| Kullanıcı silme talebi | Anonim oturum; uygulama silinince yerel veri gider. Politika URL’sinde belirt. |
| Gizlilik politikası URL | Play’deki mevcut politikanı bağla |

### Toplanan veri türleri (işaretle)

| Veri türü | Toplanıyor | Paylaşılıyor | Amaç |
|-----------|------------|--------------|------|
| Kullanıcı kimliği (anon UUID / hesap ID) | Evet | Hayır (sadece kendi backend) veya App functionality | Uygulama işlevi, hesap yönetimi |
| Uygulama etkinliği (görev / etkileşim) | Evet (görevler Supabase’de) | Hayır (kullanıcıya özel) | Uygulama işlevi |
| Cihaz veya diğer kimlikler (reklam ID) | Evet (AdMob) | Evet (reklam) | Reklam |
| Satın alma geçmişi | Evet (Play / RevenueCat) | Play ile | Uygulama işlevi / abonelik |

### Toplanmıyor (işaretleme)

- Konum, kişiler, fotoğraf/video, mikrofon, sağlık, finansal hesap numarası, mesajlar — **Hayır**

### Zorunluluk

- Verilerin çoğu **uygulama işlevi için gerekli** (görev senkronu).
- Reklam kimliği reklam için; Pro kullanıcıda reklam kapalı olabilir.

---

## 5) Resmi kurum / Finans / Sağlık

| Form | Cevap |
|------|--------|
| Resmi kurum (government) uygulaması mı? | **Hayır** |
| Finans özellikleri (banka, yatırım, kredi…) | **Hayır** (yalnızca uygulama içi abonelik) |
| Sağlık özellikleri | **Hayır** |

---

## 6) Kategori ve iletişim

| Alan | Değer |
|------|--------|
| Uygulama kategorisi | **Verimlilik** (Productivity) |
| Etiketler (varsa) | görev, planlayıcı, günlük, schedule |
| E-posta | Geliştirici iletişim mailin |
| Telefon | İsteğe bağlı |
| Web sitesi | Gizlilik politikası sitesi veya boş |

---

## Kontrol

Checklist’te şu maddeler yeşil olmalı:

- [x] Gizlilik politikası (önceki oturum)
- [x] Oturum açma bilgileri (önceki oturum)
- [x] Reklam
- [x] İçerik derecelendirme
- [x] Hedef kitle
- [x] Veri güvenliği
- [ ] Resmi kurum / Finans / Sağlık
- [ ] Mağaza girişi (açıklama + görseller)

Mağaza girişi metinleri: [PLAY_STORE_LISTING.md](./PLAY_STORE_LISTING.md)
