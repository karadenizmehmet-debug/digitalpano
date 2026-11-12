import { bellRows } from '../lib/util.js'
export const meta = { label: 'Zil sayacı', minH: 150, def: {"rows": "08:30-09:10 1. Ders\n09:20-10:00 2. Ders"}, fields: [["rows", "bellrows", "Ders saatleri", "Zil sayacı ve ders programındaki \"şu an\" vurgusu bu saatleri kullanır"]] }
export default function Bell({ data, now }) {
  const L = bellRows(data.rows), t = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
  const hm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0')
  // Solda büyük dakika; sağda durum etiketi + başlık, saat aralığı ve geçen süreyi gösteren çubuk
  const bx = (m, tag, title, a, b, cap) => {
    const pc = b > a ? Math.max(0, Math.min(100, ((t - a) / (b - a)) * 100)) : 0
    // Daire: geçen süre kadar dolar, ortada kalan dakika
    const R = 42, C = 2 * Math.PI * R
    return (
      <>
        <div className="br">
          <svg viewBox="0 0 100 100"><circle className="bk" cx="50" cy="50" r={R} /><circle className="bf" cx="50" cy="50" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - pc / 100)} /></svg>
          <div className="bn">{m}<small>dk</small></div>
        </div>
        <div className="bt">
          <em>{tag}</em>
          <b>{title}</b>
          <span>{cap} {hm(b)}</span>
        </div>
      </>
    )
  }
  const dow = now.getDay(), wk = dow === 0 || dow === 6
  const c = wk ? null : L.find((x) => t >= x.s && t < x.e)
  let inner
  if (c) inner = bx(Math.ceil(c.e - t), 'Derste', c.n, c.s, c.e, 'Zil')
  else {
    const nx = L.filter((x) => x.s > t).sort((a, b) => a.s - b.s)[0]
    const pv = L.filter((x) => x.e <= t).sort((a, b) => b.e - a.e)[0]
    const first = L.length ? Math.min(...L.map((x) => x.s)) : 0, last = L.length ? Math.max(...L.map((x) => x.e)) : 0
    const msg = (tag, title) => <div className="bt bx"><em>{tag}</em>{title && <b>{title}</b>}</div>
    if (wk) inner = msg('Hafta sonu', 'Pazartesi görüşmek üzere')
    else if (!L.length || t < 480 || (!nx && t < last)) inner = msg('Ders saatleri dışında')
    else if (!nx) inner = msg('Dersler bitti', (dow === 5 ? 'Pazartesi' : 'Yarın') + ' görüşmek üzere')
    else if (t < first) inner = bx(Math.ceil(nx.s - t), 'Başlamadı', nx.n, Math.max(480, nx.s - 30), nx.s, 'Başlangıç')
    else inner = bx(Math.ceil(nx.s - t), 'Teneffüs', nx.n, pv ? pv.e : nx.s - 10, nx.s, 'Başlangıç')
  }
  return <div className="bel">{inner}</div>
}
