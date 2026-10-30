import { useRef, useState, useEffect } from 'react'
import { bellRows, bellOf } from '../lib/util.js'
import { IHO_CLASSES, IHO_LESSONS, ihoProgram } from '../lib/ihoSample.js'
export const DAYN = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
// Hafta sonu Pazartesi'yi gösterir
export const dayIdx = (d) => { const g = d.getDay(); return g === 0 || g === 6 ? 0 : g - 1 }
// Günlük ders sayısı: varsayılan Pzt–Per 7, Cuma 8
export const DN0 = [7, 7, 7, 7, 8]
export const nOf = (data, d) => Math.max(1, Math.min(12, +(data.dn?.[d] ?? DN0[d] ?? data.n ?? 8)))
export const nMax = (data) => Math.max(...[0, 1, 2, 3, 4].map((d) => nOf(data, d)))
export const meta = {
  label: 'Ders Programı', minH: 140,
  def: { classes: IHO_CLASSES, lessons: IHO_LESSONS, n: 8, prog: ihoProgram(), speed: 1 },
  fields: [['dn', 'dcount', 'Günlük ders sayısı'], ['sched', 'sched', 'Sınıflar, dersler ve program'], ['speed', 'num', 'Kaydırma hızı', '0 yazarsanız kaydırma kapanır']],
}
export default function Schedule({ data, now, cfg }) {
  const ref = useRef(), [dup, setDup] = useState(false), sp = data.speed ?? 1
  // Sınıf listesi sığmıyorsa kesintisiz akar: son sınıftan sonra ilk sınıftan devam eder
  useEffect(() => {
    const t = ref.current
    if (!t) return
    const id = setInterval(() => {
      const b1 = t.querySelectorAll('tbody')[0], b2 = t.querySelectorAll('tbody')[1], hd = b1 && b1.rows[0]
      const one = b2 ? b2.offsetTop - (hd ? hd.offsetHeight : 0) : (b1 ? b1.offsetHeight : 0)
      const over = b1 && b1.offsetHeight > t.clientHeight + 2 && !!sp
      setDup((d) => (d === !!over ? d : !!over))
      if (!over || !b2) return
      t.scrollTop += sp
      if (t.scrollTop >= one) t.scrollTop -= one
    }, 50)
    return () => clearInterval(id)
  }, [sp])
  const cl = data.classes || [], di = dayIdx(now), N = nOf(data, di)
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
      <table>
        <tbody>
          <tr><th title={DAYN[di]}>{DAYN[di].slice(0, 3)}</th>{names.map((x, k) => <th key={k} className={c(k)}>{x.replace('. Ders', '.')}</th>)}</tr>
          {cl.map((s) => <tr key={s}><td><b>{s}</b></td>{names.map((_, k) => <td key={k} className={c(k)}>{sh(data.prog?.[s]?.[di]?.[k])}</td>)}</tr>)}
        </tbody>
        {dup && <tbody aria-hidden>
          {cl.map((s) => <tr key={s}><td><b>{s}</b></td>{names.map((_, k) => <td key={k} className={c(k)}>{sh(data.prog?.[s]?.[di]?.[k])}</td>)}</tr>)}
        </tbody>}
      </table>
    </div>
  )
}
