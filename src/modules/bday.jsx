import { rows, p2 } from '../lib/util.js'
export const meta = { label: 'Doğum Günü', minH: 110, def: {"rows": ""}, fields: [["rows", "area", "Doğum günleri", "Her satır: Ad Soyad;GG.AA"]] }
export default function Bday({ data, now }) {
  const t = `${p2(now.getDate())}.${p2(now.getMonth() + 1)}`
  const r = rows(data).map((l) => l.split(';')).filter((a) => (a[1] || '').trim().slice(0, 5) === t)
  const nm = r.map((a) => a[0])
  return (
    <div className="bd">
      {!r.length ? <div style={{ textAlign: 'center', fontWeight: 600, color: '#5d7083', paddingTop: 6 }}>Bugün doğum günü olan yok.</div>
        : r.length > 1
          ? <div className="bdm"><div style={{ '--d': Math.max(14, nm.join('').length * 0.7) + 's' }}>{[...nm, ...nm, ...nm, ...nm].map((x, i) => <span key={i}>{x}</span>)}</div></div>
          : r.map((a, i) => <div key={i} className="ln">{a[0]}</div>)}
    </div>
  )
}
