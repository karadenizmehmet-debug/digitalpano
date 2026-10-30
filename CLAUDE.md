# Dijital Pano – çalışma kuralları
- Önce `ARCHITECTURE.md` oku. Yeni modül/tasarım/efekt ekleme adımları orada.
- Hedef tarayıcı Chrome 109 (Windows 7): `color-mix`, öneksiz `mask-*`, `toSorted`/`findLast` gibi yeni özellikler yasak.
- Tasarım CSS'i yalnızca `.stg .stage[data-dsg="N"]` altında yazılır; renkler `--cr/--nv/--gd` değişkenlerinden gelir.
- `DESIGNS` ve `DESIGN_META` aynı sırada tutulur.
- Push öncesi: `git pull --rebase origin main`, `npm run build`.
- Kullanıcıyla Türkçe konuş.
