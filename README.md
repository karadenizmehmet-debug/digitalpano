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
