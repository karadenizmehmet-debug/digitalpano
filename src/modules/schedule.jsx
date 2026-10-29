import { useRef } from 'react'
import { useAutoScroll, bellRows, bellOf } from '../lib/util.js'
import { IHO_CLASSES, IHO_LESSONS, ihoProgram } from '../lib/ihoSample.js'
export const DAYN = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
// Hafta sonu Pazartesi'yi gösterir
export const dayIdx = (d) => { const g = d.getDay(); return g === 0 || g === 6 ? 0 : g - 1 }
export const meta = {
  label: 'Ders Programı', minH: 140,
  def: { classes: IHO_CLASSES, lessons: IHO_LESSONS, n: 8, prog: ihoProgram(), speed: 1 },
  fields: [['n', 'num', 'Günlük ders sayısı'], ['sched', 'sched', 'Sınıflar, dersler ve program'], ['speed', 'num', 'Kaydırma hızı', '0 yazarsanız kaydırma kapanır']],
}
export default function Schedule({ data, now, cfg }) {
  const ref = useRef()
  useAutoScroll(ref, data.speed ?? 1)
  const cl = data.classes || [], N = Math.max(1, Math.min(12, data.n || 8)), di = dayIdx(now)
  if (!cl.length) return <div className="tb"><p style={{ opacity: .6 }}>Ders programı için panelden sınıf ekleyin.</p></div>
  const sh = (name) => { if (!name) return ''; const L = (data.lessons || []).find((x) => x.n === name); return (L && L.k) || name }
  const B = bellOf(cfg), n2 = now.getHours() * 60 + now.getMinutes()
  const rows = B ? bellRows(B.data.rows).filter((x) => /ders/i.test(x.n) && /\d/.test(x.n)) : []
  const num = (r) => (r ? +r.n.match(/\d+/)[0] - 1 : -1)
  const cur = rows.find((x) => n2 >= x.s && n2 < x.e)
  const nxt = !cur && di === dayIdx(now) ? rows.filter((x) => x.s > n2 && x.s - n2 <= 20).sort((a, b) => a.s - b.s)[0] : null
  const names = Array.from({ length: N }, (_, h) => (h + 1) + '. Ders')
  const hi = num(cur), ni = num(nxt)
  const c = (k) => (hi >= 0 && k === hi ? 'hl' : ni >= 0 && k === ni ? 'nx' : undefined)
  return (
    <div className="tb" ref={ref}>
      <table><tbody>
        <tr><th>{DAYN[di]}</th>{names.map((x, k) => <th key={k} className={c(k)}>{x.replace('. Ders', '.')}</th>)}</tr>
        {cl.map((s) => <tr key={s}><td><b>{s}</b></td>{names.map((_, k) => <td key={k} className={c(k)}>{sh(data.prog?.[s]?.[di]?.[k])}</td>)}</tr>)}
      </tbody></table>
    </div>
  )
}
