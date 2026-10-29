import { rows } from '../lib/util.js'
import { SOZ, AYET } from '../lib/quotesData.js'
export const meta = {
  label: 'Günün Sözü', minH: 96,
  def: { rows: SOZ, rows2: AYET, mode: 'soz', pin: 0, pin2: 0 },
  fields: [['quotes', 'quotes', 'Sözler']],
}
export const parseQ = (txt) => rows({ rows: txt }).map((l) => { const i = l.lastIndexOf('|'); return i < 0 ? [l.trim(), ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
export const listOf = (data, mode) => (mode === 'ayet' ? parseQ(data.rows2 ?? AYET) : parseQ(data.rows))
export function todayIx(data, now, Q, mode = 'soz') {
  const pin = parseInt(mode === 'ayet' ? data.pin2 : data.pin) || 0
  if (!Q.length) return -1
  if (pin > 0) return (pin - 1) % Q.length
  const key = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
  if (mode !== 'ayet' && data.rnd && data.rnd.d === key && data.rnd.i < Q.length) return data.rnd.i
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5) % Q.length
}
export default function Quote({ data, now }) {
  const mode = data.mode === 'ayet' ? 'ayet' : 'soz'
  const Q = listOf(data, mode), ix = todayIx(data, now, Q, mode)
  const q = ix >= 0 ? Q[ix] : null
  const tag = mode === 'ayet' && q ? (q[1].startsWith('Hz.') ? 'GÜNÜN HADİSİ' : 'GÜNÜN AYETİ') : ''
  const len = q ? q[0].length : 0
  return (
    <div className="qt">
      {!q ? <div className="ln">Panelden söz ekleyin</div>
        : <div className={'qx ' + (len < 70 ? 'qs' : len < 140 ? 'qm' : len < 220 ? 'ql' : 'qxl')}>
            {tag && <em>{tag}</em>}
            <span>{q[0]}</span>{q[1] ? <i>{q[1]}</i> : null}
          </div>}
    </div>
  )
}
