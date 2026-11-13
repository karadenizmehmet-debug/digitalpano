# Dijital Pano – çalışma kuralları
- Önce `ARCHITECTURE.md` oku. Yeni modül/tasarım/efekt ekleme adımları orada.
- Hedef tarayıcı Chrome 109 (Windows 7): `color-mix`, öneksiz `mask-*`, `toSorted`/`findLast` gibi yeni özellikler yasak.
- Tasarım CSS'i yalnızca `.stg .stage[data-dsg="N"]` altında yazılır; renkler `--cr/--nv/--gd` değişkenlerinden gelir.
- `DESIGNS` ve `DESIGN_META` aynı sırada tutulur.
- Push öncesi: `git pull --rebase origin main`, `npm test`, `npm run build`. Test kırmızıysa yayın durur.
- Saf mantık (tarih, liste, ayrıştırma) değiştirince `test/` altına sınama ekle.
- Kullanıcıyla Türkçe konuş.

## Sürüm numarası
Biçim `vX.Y` / `vX.Y.Z`, uygulamada görünür. Her değişiklikte artır ve aynı commit'e koy:
- **Küçük düzeltme** (hata, yazım, stil): `+0.0.1` → v1.2 → v1.2.1 → v1.2.2
- **Yeni içerik / özellik**: `+0.1`, düzeltme hanesi sıfırlanır → v1.2.2 → v1.3
- Sürüm tek yerde tutulur: `src/Panel.jsx` giriş başlığı ve üst çubuk (ikisi aynı) + `package.json` `version` (1.0.1 = v1.0.1).
