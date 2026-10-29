import { rows } from '../lib/util.js'
export const meta = { label: 'Manşet Haber', minH: 100, def: {"rows": "", "sec": 8}, fields: [["rows", "area", "Manşetler", "Her satır ayrı bir haber"], ["sec", "num", "Geçiş süresi (sn)"]] }
export default function News({ data, T }) {
  const R = rows(data)
  return <div className="nw">{R[Math.floor(T / (data.sec || 8)) % Math.max(R.length, 1)] || 'Manşet ekleyin'}</div>
}
