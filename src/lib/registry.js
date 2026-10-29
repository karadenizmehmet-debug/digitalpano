// modules/ klasöründeki her .jsx dosyası otomatik modül olarak kaydolur.
// Yeni modül eklemek = src/modules/ içine yeni dosya koymak (başka yerde değişiklik gerekmez).
const files = import.meta.glob('../modules/*.jsx', { eager: true })

export const registry = {}
for (const [path, mod] of Object.entries(files)) {
  const type = path.split('/').pop().replace('.jsx', '')
  registry[type] = { type, ...mod.meta, Component: mod.default }
}
