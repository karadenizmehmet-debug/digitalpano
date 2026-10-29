import { useRef } from 'react'
import { rows, MON, useAutoScroll } from '../lib/util.js'
export const meta = { label: 'Belirli Gün ve Haftalar', minH: 170 }
export default function Days({ data, now }) {
  const ref = useRef()
  useAutoScroll(ref, data.speed ?? 1)
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
      {L.length ? L.map((x, i) => (
        <div key={i} className={'ln' + (x.past ? ' pst' : '')}>
          <b>{x.t}</b><br />
          <small>{!x.past && x.df <= 0 ? 'Devam ediyor · ' : ''}{f(x.s)}{x.e > x.s ? ' – ' + f(x.e) : ''}</small>
        </div>
      )) : <div className="ln">Bu ay belirli gün veya hafta yok</div>}
    </div>
  )
}
