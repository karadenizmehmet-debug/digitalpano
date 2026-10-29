import { useRef } from 'react'
import { useAutoScroll, bellRows, bellOf } from '../lib/util.js'
export const meta = { label: 'Tablo', minH: 200, def: {"rows": "Başlık 1;Başlık 2\nA;B", "header": true, "speed": 1}, fields: [["rows", "area", "Satırlar", "Hücreleri ; ile ayırın. Örn: Bahçe;Ad Soyad"], ["header", "check", "İlk satır başlık"], ["speed", "num", "Kaydırma hızı", "0 yazarsanız kaydırma kapanır"]] }
export default function Table({ data, now, cfg }) {
  const ref = useRef()
  useAutoScroll(ref, data.speed ?? 1)
  const r = String(data.rows || '').split('\n').filter((x) => x.trim()).map((l) => l.split(';'))
  if (!r.length) return null
  const hd = data.header !== false
  // Şu anki ders sütununu vurgula
  const B = bellOf(cfg), n2 = now.getHours() * 60 + now.getMinutes()
  const cur = B && bellRows(B.data.rows).find((x) => n2 >= x.s && n2 < x.e)
  const hi = cur ? r[0].findIndex((x) => x.trim().toLowerCase() === cur.n.trim().toLowerCase()) : -1
  const cls = (k) => (hi >= 0 && k === hi ? 'hl' : undefined)
  return (
    <div className="tb" ref={ref}>
      <table><tbody>
        {hd && <tr>{r[0].map((c, k) => <th key={k} className={cls(k)}>{c}</th>)}</tr>}
        {r.slice(hd ? 1 : 0).map((x, i) => <tr key={i}>{x.map((c, k) => <td key={k} className={cls(k)}>{c}</td>)}</tr>)}
      </tbody></table>
    </div>
  )
}
