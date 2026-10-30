# Mimari ve değişiklik rehberi

Mehmet Karadeniz, 2026-2027

Bu belge, yeni bir şey eklerken mevcut olanı bozmamak için hangi dosyaya dokunulacağını anlatır.

## Dosya haritası
| Yer | Ne işe yarar |
|---|---|
| `src/App.jsx` | Yönlendirme (`#/panel` = panel, diğeri = pano), Firestore dinleme, gece 03:00 yenileme |
| `src/Stage.jsx` | 1600×900 sahneyi çizer; modülleri yerleştirir; tam ekran (`.fsa`) ve kayan yazı |
| `src/Panel.jsx` | Panelin ana kabuğu: sekmeler, taslak (`draft`) durumu, Yayınla |
| `src/panel/*.jsx` | Panelin parçaları (aşağıya bakın). Her biri tek sorumluluk |
| `src/modules/*.jsx` | Pano modülleri. Her dosya bir modül, otomatik kaydolur |
| `src/lib/reflow.js` | Otomatik yerleşim (sütunlar, yan panel tasarımları) |
| `src/lib/themes.js` | `THEMES` (renk paletleri), `DESIGNS` (tasarımlar), `DESIGN_META` (küçük önizleme verisi) |
| `src/lib/trans.js` | Manşet / tam ekran geçiş efektleri listesi |
| `src/lib/fsa.js` | Aralıklı tam ekran ("Öne Çıkan") zamanlaması |
| `src/lib/firebase.js` | Firestore + Auth + görseller |
| `src/legacy.css` | Pano görünümü: temel stiller, paletler, tasarımlar, efektler |
| `src/panel.css` | Yalnızca panel arayüzü stilleri |

### `src/panel/` içeriği
- `common.jsx` – ortak sabitler (`ICO`, `TONES`, `DUR`…) ve küçük bileşenler (`NumIn`, `Mini`, `Thumb`), tarih yardımcıları
- `Slides.jsx` – manşet/öne çıkan öğe listesi (`SlidesEditor`, `SlideCard`, `FsaEditor`)
- `AnnEditor.jsx` – kayan duyurular
- `Field.jsx` – modül ayar alanlarını türüne göre çizen `Field`
- `BellEditor.jsx`, `SchedEditor.jsx`, `QuoteEditor.jsx`, `SpecialEditor.jsx` – ilgili modüle özel editörler
- `Modules.jsx` – modül kutucukları ve tek modül ayar sayfası
- `Backups.jsx`, `Account.jsx` – yedekler, şifre, acil duyuru

## Veri
Firestore `config/pano` belgesi tek kaynaktır; görseller `images/{id}`. Yazma yalnızca sahip hesaba açıktır (`firestore.rules`). Panelde değişiklikler `draft` içinde birikir, **Yayınla** ile yazılır.

## Sık yapılan işler
**Yeni modül:** `src/modules/` altına `ad.jsx` ekle. `export const meta = { label, minH, fields… }` ve `export default function ({data, now, T, cfg, wx})`. Başka dosyaya dokunma. Panelde simgesi için `ICO` (`panel/common.jsx`).

**Hazır içerikli modüller** (Günün Sözü, Kelimesi, Görevi, Tarihte Bugün): içerik `src/lib/*Data.js` dosyalarındadır (Firestore'a yazılmaz, belge küçük kalır); modül yalnızca günün sırasına göre seçer. Yeni hazır modül panelde bir kez KAPALI olarak otomatik listelenir: `Panel.jsx` içindeki `['word','task','history']` listesine tür ekle (`offered` alanı tekrar eklenmesini önler).

**Yeni modül ayar türü:** `panel/Field.jsx` içindeki `Field` zincirine bir `kind` ekle.

**Yeni renk paleti:** `THEMES` sonuna ekle. Tasarımlar rengi `--cr` (vurgu), `--nv` (koyu), `--gd` (ikinci vurgu) değişkenlerinden alır; yeni CSS'te sabit vurgu rengi yazma, bu değişkenleri kullan.

**Yeni tasarım (3 sütunlu standart düzen):**
1. `DESIGNS` sonuna `[ad, açıklama]`, `DESIGN_META` sonuna aynı sırada önizleme satırı ekle. **İkisinin sırası aynı olmalı**, indeks = tasarım numarası.
2. `src/legacy.css` sonuna `.stg .stage[data-dsg="N"] …` kuralları ekle (yalnızca bu seçiciyle başla, diğer tasarımlar etkilenmesin). En kolayı komşu bir tasarımın bloğunu kopyalayıp renkleri değiştirmek.
3. Yerleşimi değişen (yan panelli) tasarım ise ayrıca `reflow.js` içindeki `SIDE_DSG`, `DESIGN_COLS`, `DESIGN_SLIDE` tablolarına ekle ve `Panel.jsx` içindeki `SIDE_KEEP`'e hangi modüllerin açılacağını yaz.

**Yeni geçiş efekti:** `trans.js` listesine anahtar ekle, `legacy.css` içine `data-tr="anahtar"` kuralları ve `t-` önekli keyframes yaz.

## Eski bilgisayar (Windows 7 / Chrome 109) kuralları
Okuldaki bilgisayar Chrome 109 çalıştırır. Şunları **kullanma**:
- `color-mix()`, `oklch()`, `light-dark()`, CSS iç içe yazım (`&`), `@container`, `@starting-style`
- Önek olmadan `mask-image` / `mask-size` (hepsinde `-webkit-` kullan)
- JS: `toSorted`, `toReversed`, `findLast`, `Object.hasOwn`, `Object.groupBy`, `Array.at`, `structuredClone`'a güvenme
Renk karıştırmak için `src/lib/util.js` içindeki `mix()` var.

Kontrol: `npm run build` sonrası
```
for f in dist/assets/*.js; do npx esbuild $f --target=chrome109 --outfile=/dev/null; done
```
Hata vermemeli.

## Bozmadan değiştirme kontrol listesi
1. `git pull --rebase origin main`
2. `npm run build` hatasız bitmeli
3. Panelde ilgili ekranı aç; yeni tasarım/efekt ise pano ekranında da bak
4. Eski tasarımların bozulmadığını bir iki tanesinde kontrol et (özellikle `legacy.css`'e eklediysen)
5. Push: `main`'e gidince GitHub Pages ve Firebase Hosting otomatik yenilenir (1–3 dk)

## MEB haberleri (kayan yazı)
Duyuru yokken kayan yazıda (varsayılan: Konya MEM duyuruları, `src/lib/newsDefault.js`) RSS başlıkları gösterilir. RSS tarayıcıdan doğrudan okunamaz (CORS), bu yüzden `scripts/haber.mjs` GitHub Actions'ta (`deploy.yml`, her 30 dk) RSS'i çekip `public/haber.json` yazar; pano bu dosyayı aynı alan adından okur. Firestore kotası kullanılmaz. Ayarlar panelde: Ayarlar → Modüller → RSS (kaynak listesi `src/lib/newsDefault.js` → `SOURCES`) (`rssList`: ad, adres, açık/kapalı; kaynak eklenip silinebilir).

## Bilinen sınırlar
- Yan panelli tasarımlarda (12–14) sürükle-bırak düzen yok; sıra "Yan panel modülleri" kartından ayarlanır.
- Sığmayan yan panel modülleri kırpılmaz, içeriğiyle birlikte küçültülür (`reflow.js` → `zs`).
- Yayın/yükleme gibi Firebase'e bağlı işlemler yerel denemede çalışmaz; canlıda denenmelidir.
