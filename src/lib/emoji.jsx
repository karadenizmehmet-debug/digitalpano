import { Fragment } from 'react'
// Windows 7'de renkli emoji yazı tipi yok (kutu çıkar). Pano tarafındaki emojiler src/emoji/*.svg (Twemoji, CC-BY 4.0)
// görselleriyle çizilir. Yeni emoji eklemek: dosyayı kod noktasıyla (ör. 1f6a8.svg) src/emoji/ içine koymak yeter.
const FILES = import.meta.glob('../emoji/*.svg', { eager: true, query: '?url', import: 'default' })
const MAP = {}
for (const k in FILES) MAP[k.split('/').pop().replace('.svg', '')] = FILES[k]
const code = (s) => Array.from(s).filter((c) => c.codePointAt(0) !== 0xfe0f).map((c) => c.codePointAt(0).toString(16)).join('-')
const RE = /\p{Extended_Pictographic}️?/gu
// Metindeki bilinen emojileri <img> yapar, gerisini olduğu gibi bırakır.
export function Emo({ t }) {
  const s = String(t ?? '')
  const out = []
  let last = 0, n = 0
  for (const m of s.matchAll(RE)) {
    const u = MAP[code(m[0])]
    if (!u) continue
    if (m.index > last) out.push(<Fragment key={n++}>{s.slice(last, m.index)}</Fragment>)
    out.push(<img key={n++} className="emo" src={u} alt={m[0]} draggable={false} />)
    last = m.index + m[0].length
  }
  if (!out.length) return s
  if (last < s.length) out.push(<Fragment key={n++}>{s.slice(last)}</Fragment>)
  return out
}
