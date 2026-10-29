// modules/ klasöründeki her .jsx dosyası otomatik modül olarak kaydolur.
// Yeni modül eklemek = src/modules/ içine yeni dosya koymak (başka yerde değişiklik gerekmez).
const files = import.meta.glob('../modules/*.jsx', { eager: true })

export const registry = {}
for (const [path, mod] of Object.entries(files)) {
  const type = path.split('/').pop().replace('.jsx', '')
  registry[type] = { type, ...mod.meta, Component: mod.default }
}

// Başlık gösterilince modülün en az ne kadar yüksek olması gerektiği.
// Varsayılanı başlıksız tasarlanmış modüller başlık açılınca ~58px daha yer ister.
const UNTITLED = ['clock', 'cnt', 'cd', 'pray', 'quote']
export const hasTitle = (m) => (m.type === 'slides' ? !!m.showTitle : m.showTitle !== false)
export const minHOf = (m) => {
  const b = registry[m.type]?.minH || 100
  return UNTITLED.includes(m.type) && hasTitle(m) ? b + 58 : b
}
