import { bellRows } from '../lib/util.js'
export const meta = { label: 'Zil sayacı', minH: 120 }
export default function Bell({ data, now }) {
  const L = bellRows(data.rows), t = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
  const bx = (m, a, b) => (
    <>
      <div className="bn">{m}<small>dk</small></div>
      <div className="bt"><b>{a}</b><span>{b}</span></div>
    </>
  )
  const c = L.find((x) => t >= x.s && t < x.e)
  let inner
  if (c) inner = bx(Math.ceil(c.e - t), c.n, 'zile kalan süre')
  else {
    const nx = L.filter((x) => x.s > t).sort((a, b) => a.s - b.s)[0]
    inner = nx ? bx(Math.ceil(nx.s - t), 'Teneffüs', 'sonraki: ' + nx.n) : <div className="bt"><b>Ders saatleri dışında</b></div>
  }
  return <div className="bel">{inner}</div>
}
