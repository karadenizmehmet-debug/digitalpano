import { bellRows } from '../lib/util.js'
export const meta = { label: 'Zil sayacı', minH: 120, def: {"rows": "08:30-09:10 1. Ders\n09:20-10:00 2. Ders"}, fields: [["rows", "bellrows", "Ders saatleri", "Zil sayacı ve ders programındaki \"şu an\" vurgusu bu saatleri kullanır"]] }
export default function Bell({ data, now }) {
  const L = bellRows(data.rows), t = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
  const bx = (m, a, b) => (
    <>
      <div className="bn">{m}<small>dk</small></div>
      <div className="bt"><b>{a}</b><span>{b}</span></div>
    </>
  )
  const dow = now.getDay(), wk = dow === 0 || dow === 6
  const c = wk ? null : L.find((x) => t >= x.s && t < x.e)
  let inner
  if (c) inner = bx(Math.ceil(c.e - t), c.n, 'zile kalan süre')
  else {
    const nx = L.filter((x) => x.s > t).sort((a, b) => a.s - b.s)[0]
    const first = L.length ? Math.min(...L.map((x) => x.s)) : 0, last = L.length ? Math.max(...L.map((x) => x.e)) : 0
    if (wk) inner = <div className="bt"><b>Hafta sonu</b><span>Pazartesi görüşmek üzere</span></div>
    else if (!L.length || t < 480 || (!nx && t < last)) inner = <div className="bt"><b>Ders saatleri dışında</b></div>
    else if (!nx) inner = <div className="bt"><b>Dersler bitti</b><span>{dow === 5 ? 'Pazartesi' : 'Yarın'} görüşmek üzere</span></div>
    else if (t < first) inner = bx(Math.ceil(nx.s - t), 'Ders başlamadı', nx.n + ' için kalan süre')
    else inner = bx(Math.ceil(nx.s - t), 'Teneffüs', 'sonraki: ' + nx.n)
  }
  return <div className="bel">{inner}</div>
}
