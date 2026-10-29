import { rows } from '../lib/util.js'
export const meta = { label: 'Günün Sözü', minH: 96, def: {"rows": ""}, fields: [["rows", "area", "Sözler", "Her satır: Söz|Söyleyen"], ["pin", "num", "Sabit söz no", "0 = günlük otomatik"]] }
export default function Quote({ data, now }) {
  const Q = rows(data).map((l) => { const i = l.lastIndexOf('|'); return i < 0 ? [l.trim(), ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
  const pin = parseInt(data.pin) || 0
  const key = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
  let ix = -1
  if (Q.length) {
    if (pin > 0) ix = (pin - 1) % Q.length
    else if (data.rnd && data.rnd.d === key && data.rnd.i < Q.length) ix = data.rnd.i
    else ix = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5) % Q.length
  }
  return (
    <div className="qt">
      {ix < 0 ? <div className="ln">Panelden söz ekleyin</div>
        : <div className="qx"><span>“{Q[ix][0]}”</span>{Q[ix][1] ? <i>— {Q[ix][1]}</i> : null}</div>}
    </div>
  )
}
