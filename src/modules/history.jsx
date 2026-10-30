import { HISTORY } from '../lib/historyData.js'
import { MON } from '../lib/util.js'
export const meta = {
  label: 'Tarihte Bugün', minH: 150,
  def: {},
  fields: [],
}
const L = HISTORY.split('\n').filter((x) => x.trim()).map((l) => { const a = l.split('|'); return { m: +a[0].slice(0, 2), d: +a[0].slice(3), y: a[1], t: a.slice(2).join('|') } })
const key = (m, d) => m * 40 + d
// Bugün olay yoksa, bugünden sonraki en yakın olay (yıl sonunda başa döner) açıkça tarihiyle gösterilir.
export function pick(now) {
  const k = key(now.getMonth() + 1, now.getDate())
  const today = L.filter((e) => key(e.m, e.d) === k)
  if (today.length) return { list: today, exact: true }
  let best = null, bd = 1e9
  L.forEach((e) => { let df = key(e.m, e.d) - k; if (df < 0) df += 12 * 40; if (df < bd) { bd = df; best = e } })
  const list = best ? L.filter((e) => e.m === best.m && e.d === best.d) : []
  return { list, exact: false }
}
export default function History({ now }) {
  const { list, exact } = pick(now)
  if (!list.length) return <div className="gm"><div className="ln">Olay bulunamadı</div></div>
  const e = list[Math.floor(now.getTime() / 20000) % list.length]
  const len = e.t.length
  return (
    <div className="gm">
      <div className={'gx ' + (len < 70 ? 'gs' : len < 120 ? 'gmd' : 'gl')}>
        <em>{(exact ? '' : 'YAKLAŞAN · ') + e.d + ' ' + MON[e.m - 1] + ' ' + e.y}</em>
        <span>{e.t}</span>
      </div>
    </div>
  )
}
