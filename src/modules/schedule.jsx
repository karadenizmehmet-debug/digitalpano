import { useRef } from 'react'
import { useAutoScroll, bellRows, bellOf } from '../lib/util.js'
export const DAYN = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
// Hafta sonu Pazartesi'yi gösterir
export const dayIdx = (d) => { const g = d.getDay(); return g === 0 || g === 6 ? 0 : g - 1 }
export const meta = {
  label: 'Ders Programı', minH: 200,
  def: { classes: [], lessons: [], n: 8, prog: {}, speed: 1 },
  fields: [['n', 'num', 'Günlük ders sayısı'], ['sched', 'sched', 'Sınıflar, dersler ve program'], ['speed', 'num', 'Kaydırma hızı', '0 yazarsanız kaydırma kapanır']],
}
export default function Schedule({ data, now, cfg }) {
  const ref = useRef()
  useAutoScroll(ref, data.speed ?? 1)
  const cl = data.classes || [], N = Math.max(1, Math.min(12, data.n || 8)), di = dayIdx(now)
  if (!cl.length) return <div className="tb"><p style={{ opacity: .6 }}>Ders programı için panelden sınıf ekleyin.</p></div>
  const sh = (name) => { if (!name) return ''; const L = (data.lessons || []).find((x) => x.n === name); return (L && L.k) || name }
  const B = bellOf(cfg), n2 = now.getHours() * 60 + now.getMinutes()
  const cur = B && bellRows(B.data.rows).find((x) => n2 >= x.s && n2 < x.e)
  const names = Array.from({ length: N }, (_, h) => (h + 1) + '. Ders')
  const hi = cur ? names.findIndex((x) => x.toLowerCase() === cur.n.trim().toLowerCase()) : -1
  const c = (k) => (hi >= 0 && k === hi ? 'hl' : undefined)
  return (
    <div className="tb" ref={ref}>
      <table><tbody>
        <tr><th>{DAYN[di]}</th>{names.map((x, k) => <th key={k} className={c(k)}>{x.replace('. Ders', '.')}</th>)}</tr>
        {cl.map((s) => <tr key={s}><td><b>{s}</b></td>{names.map((_, k) => <td key={k} className={c(k)}>{sh(data.prog?.[s]?.[di]?.[k])}</td>)}</tr>)}
      </tbody></table>
    </div>
  )
}
