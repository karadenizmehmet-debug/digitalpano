# Dijital Pano

Şehit Coşkun Karabulut İmam Hatip Ortaokulu için dijital pano (Vite + React + Firebase).

Mehmet Karadeniz, 2026-2027

## Yapı
- `src/panel/` – panel arayüzünün parçaları (`Panel.jsx` yalnızca ana kabuk).
- `src/modules/` – her modül tek dosya. **Yeni modül = bu klasöre yeni `.jsx` eklemek**; otomatik kaydolur (`src/lib/registry.js`).
- `src/lib/firebase.js` – Firestore canlı dinleme (`onSnapshot`).
- `firestore.rules` – okuma herkese açık, yazma yalnızca sahip hesap.

Ayrıntılı rehber (yeni modül/tasarım/efekt ekleme, eski Chrome kuralları): **[ARCHITECTURE.md](ARCHITECTURE.md)**

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
Ayarlar yalnızca Firestore'daki `config/pano` belgesindedir (yerleşik varsayılan yok; pano veri gelene kadar "Pano yükleniyor…" gösterir). Görseller `images/{id}` belgelerinde, küçültülmüş olarak saklanır.

## Lisans

© Mehmet Karadeniz, 2026-2027. Tüm hakları saklıdır. Ayrıntı için [LICENSE](LICENSE) dosyasına bak.
