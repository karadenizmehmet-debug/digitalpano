# Dijital Pano

Nimetullah Nahçivani İmam Hatip Ortaokulu için dijital pano (Vite + React + Firebase).

Mehmet Karadeniz, 2026-2027

## Yapı
- `legacy/Dijital_Pano.html` – çalışan tek dosyalı sürüm (yedek, kişisel veriler temizlenmiş örnek veriyle).
- `src/modules/` – her modül tek dosya. **Yeni modül = bu klasöre yeni `.jsx` eklemek**; otomatik kaydolur (`src/lib/registry.js`).
- `src/lib/firebase.js` – Firestore canlı dinleme (`onSnapshot`). `.env` yoksa `src/defaults.js` kullanılır.
- `firestore.rules` – okuma herkese açık, yazma yalnızca sahip hesap.

## Çalıştırma
```
npm install
cp .env.example .env   # Firebase bilgilerini doldurun
npm run dev
```

## Güvenlik kuralları
- Servis hesabı JSON'u, şifre, öğrenci adı gibi veriler **depoya konmaz** (`.gitignore` engeller).
- Firebase web yapılandırması gizli değildir; API anahtarını kendi alan adınıza kısıtlayın.
- Öğrenci adları (doğum günü vb.) Firestore'da tutulur, kodda değil.

## Yayın
- Pano: `https://karadenizmehmet-debug.github.io/digitalpano/`
- Panel: aynı adres + `#/panel` (Firebase Authentication ile giriş; yazma yetkisi yalnızca `firestore.rules` içindeki hesapta)
- `main`'e her gönderimde `.github/workflows/pages.yml` siteyi yeniler.

## Taşıma durumu
Taşındı: saat, metin, tablo, görsel/yazılı slayt, zil sayacı, hava durumu (canlı veri), nöbetçi çizelgesi, belirli günler, manşet, yemek, doğum günü, sayaç, geri sayım, namaz vakitleri, günün sözü; 6 tema; kayan duyuru şeridi.

Panel (giriş, modül ekle/düzenle, tema, yedek) yazıldı. Görsel yükleme ve yazılı slayt eklendi (görseller `images/{id}` belgelerinde, küçültülmüş JPEG). Acil duyuru, özel günler (tam ekran, aralıklı gösterim, konfeti, görsel) ve doğum günü konfetisi eklendi. Gece modu ve hava efektleri (yağmur, kar, rüzgar, fırtına, sis) eklendi. Henüz taşınmadı (`legacy/` içinde çalışıyor): zamanlanmış duyuru satırları, sürükle-bırak yerleşim.
Varsayılan ayarlar `src/defaults.json` içindedir; Firestore bağlanınca `config/pano` belgesi bunun yerine geçer.
