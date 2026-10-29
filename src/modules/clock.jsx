import { MON } from '../lib/util.js'
export const meta = { label: 'Saat / Tarih', minH: 80, def: {}, fields: [] }
export default function Clock({ now }) {
  return (
    <div className="clk">
      <div className="d">{`${now.getDate()} ${MON[now.getMonth()]} ${now.getFullYear()}`}</div>
      <div className="t">{now.toLocaleTimeString('tr-TR')}</div>
    </div>
  )
}
