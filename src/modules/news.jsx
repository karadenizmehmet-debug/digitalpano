import { rows } from '../lib/util.js'
export const meta = { label: 'Manşet Haber', minH: 100 }
export default function News({ data, T }) {
  const R = rows(data)
  return <div className="nw">{R[Math.floor(T / (data.sec || 8)) % Math.max(R.length, 1)] || 'Manşet ekleyin'}</div>
}
