import { useRef, useState, useEffect } from 'react'
import { rows, MON } from '../lib/util.js'
export const meta = { label: 'Belirli Gün ve Haftalar', minH: 170, def: {"rows": ""}, fields: [["rows", "area", "Günler ve haftalar", "GG.AA-GG.AA;Ad veya GG.AA;Ad. Yalnızca bu ayın günleri gösterilir"], ["speed", "num", "Kaydırma hızı", "0 = kapalı"]] }
export default function Days({ data, now }) {
  const ref = useRef(), [dup, setDup] = useState(false), sp = data.speed ?? 1
  // Liste sığmıyorsa kesintisiz akar: sona gelince baştan devam eder
  useEffect(() => {
    const t = ref.current
    if (!t) return
    const id = setInterval(() => {
      const one = t.firstChild?.offsetHeight || 0, over = one > t.clientHeight + 2 && !!sp
      setDup((d) => (d === over ? d : over))
      if (!over || !t.children[1]) return
      t.scrollTop += sp
      if (t.scrollTop >= one) t.scrollTop -= one
    }, 50)
    return () => clearInterval(id)
  }, [sp])
  const y = now.getFullYear(), d0 = new Date(y, now.getMonth(), now.getDate())
  const mk = (s, yr) => { const [a, b, c] = s.trim().split('.'); return new Date(c || yr, b - 1, a) }
  const m0 = new Date(y, now.getMonth(), 1), m1 = new Date(y, now.getMonth() + 1, 1)
  const f = (d) => `${d.getDate()} ${MON[d.getMonth()]}`
  const L = []
  rows(data).forEach((l) => {
    const [r, ...nm] = l.split(';'), [a, b] = r.split('-')
    const s = mk(a, y), e = b ? mk(b, y) : s
    if (e >= m0 && s < m1) L.push({ s, e, df: Math.round((s - d0) / 864e5), t: nm.join(';'), past: e < d0 })
  })
  L.sort((p, q) => p.s - q.s)
  return (
    <div className="dy" ref={ref} style={{ height: '100%', overflow: 'hidden' }}>
      {[0, 1].slice(0, dup ? 2 : 1).map((k) => (
        <div key={k} aria-hidden={k ? true : undefined}>
          {L.length ? L.map((x, i) => (
            <div key={i} className={'ln' + (x.past ? ' pst' : '')}>
              <b>{x.t}</b><br />
              <small>{!x.past && x.df <= 0 ? 'Devam ediyor · ' : ''}{f(x.s)}{x.e > x.s ? ' – ' + f(x.e) : ''}</small>
            </div>
          )) : <div className="ln">Bu ay belirli gün veya hafta yok</div>}
        </div>
      ))}
    </div>
  )
}
