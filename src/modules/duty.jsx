import { rows } from '../lib/util.js'
export const meta = { label: 'Nöbetçi Öğretmen Çizelgesi', minH: 215, def: {"places": "Bahçe\nGiriş\n1. Kat", "g": {}}, fields: [["places", "area", "Nöbet yerleri", "Her satır bir yer"], ["g", "dgrid", "Haftalık nöbet çizelgesi"]] }
export default function Duty({ data, now }) {
  const P = rows({ rows: data.places }), w = (now.getDay() + 6) % 7, d = w > 4 ? 0 : w, g = (data.g || {})[d] || {}
  return (
    <div className="du">
      {w > 4 && <div className="dn">Hafta sonu · Pazartesi nöbetçileri</div>}
      {P.length ? P.map((p, i) => <div key={i} className="dt"><b>{g[i] || '—'}</b><i>{p}</i></div>) : <div className="ln">Nöbet yeri ekleyin</div>}
    </div>
  )
}
