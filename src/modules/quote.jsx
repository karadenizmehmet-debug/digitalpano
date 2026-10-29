import { rows } from '../lib/util.js'
export const meta = { label: 'Günün Sözü', minH: 96, def: {"rows": ""}, fields: [["rows", "quotes", "Sözler", "Her gün otomatik bir söz seçilir. İstersen birini sabitleyebilirsin."], ["pin", "qpin", ""]] }
export const parseQ = (data) => rows(data).map((l) => { const i = l.lastIndexOf('|'); return i < 0 ? [l.trim(), ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
export function todayIx(data, now, Q) {
  const pin = parseInt(data.pin) || 0
  const key = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
  if (!Q.length) return -1
  if (pin > 0) return (pin - 1) % Q.length
  if (data.rnd && data.rnd.d === key && data.rnd.i < Q.length) return data.rnd.i
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5) % Q.length
}
export default function Quote({ data, now }) {
  const Q = parseQ(data), ix = todayIx(data, now, Q)
  return (
    <div className="qt">
      {ix < 0 ? <div className="ln">Panelden söz ekleyin</div>
        : <div className={'qx ' + (Q[ix][0].length < 70 ? 'qs' : Q[ix][0].length < 140 ? 'qm' : 'ql')}><span>{Q[ix][0]}</span>{Q[ix][1] ? <i>{Q[ix][1]}</i> : null}</div>}
    </div>
  )
}
