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
Eski tek dosyalı panonun tüm özellikleri taşındı: 15 modül, 6 tema, kayan zamanlanmış duyurular, acil duyuru, özel günler (tam ekran, aralıklı gösterim, konfeti, görsel), gece modu, hava efektleri, logo ve görsel yükleme, panel içi önizleme ve sürükle-bırak yerleşim (otomatik yerleşimle).
Varsayılan ayarlar `src/defaults.json` içindedir; Firestore'daki `config/pano` belgesi bunun yerine geçer. Görseller `images/{id}` belgelerinde, küçültülmüş olarak saklanır.
`legacy/` içindeki tek dosyalı sürüm yedek olarak kalır.
