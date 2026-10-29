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
  let b = registry[m.type]?.minH || 100
  if (m.type === 'duty') b = Math.min(b, wantH(m))  // az nöbet yeri varsa daha küçük olabilir
  return UNTITLED.includes(m.type) && hasTitle(m) ? b + 58 : b
}

// İçeriğin doğal yüksekliği (yaklaşık). Otomatik yerleşim önce bunu verir, artan boşluğu içeriği sıkışık modüllere dağıtır.
const lines = (t) => String(t || '').split('\n').filter((x) => x.trim()).length
export const wantH = (m) => {
  const d = m.data || {}, T = hasTitle(m) ? 58 : 0
  if (m.type === 'duty') return T + Math.max(1, lines(d.places)) * 50 + 28
  if (m.type === 'schedule') return T + ((d.classes || []).length + 1) * 34 + 28
  if (m.type === 'table') return T + Math.max(1, lines(d.rows)) * 34 + 28
  return undefined
}
