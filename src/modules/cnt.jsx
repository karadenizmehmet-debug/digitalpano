import { p2 } from '../lib/util.js'
export const meta = { label: 'Sayaç (gün/saat/dk/sn)', minH: 116, def: {"name": "Sayaç adı", "at": "2027-01-22T14:00"}, fields: [["name", "txt", "Sayaç adı", ""], ["at", "dt", "Hedef tarih ve saat", "Bu tarihe kadar geri sayar"]] }
export default function Cnt({ data, now }) {
  const t = new Date(data.at), ok = !isNaN(t), df = ok ? t - now : 0, r = Math.max(0, df)
  const v = [Math.floor(r / 864e5), Math.floor(r / 36e5) % 24, Math.floor(r / 6e4) % 60, Math.floor(r / 1e3) % 60]
  return (
    <div className="ct">
      <div className="cn">{(data.name || 'Sayaç') + (ok && df <= 0 ? ' · süre doldu' : '')}</div>
      <div className="cu">
        {['Gün', 'Saat', 'Dakika', 'Saniye'].map((u, i) => (
          <div key={u} className="ci"><div className="cv"><span key={p2(v[i])} className="fl">{p2(v[i])}</span></div><small>{u}</small></div>
        ))}
      </div>
    </div>
  )
}
