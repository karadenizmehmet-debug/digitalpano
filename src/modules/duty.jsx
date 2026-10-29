import { useRef } from 'react'
import { rows, useAutoScroll } from '../lib/util.js'
export const DG = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum']
const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
// Verilen günün haftasının Pazartesi'si (yerel saat, saat 12:00)
export const mondayOf = (d) => { const m = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m }
export const mondayISO = (d) => iso(mondayOf(d))
// Dönüşümlü nöbette kaç hafta kaydığı (hafta sonu bir sonraki haftayı gösterir)
export function weekShift(data, now) {
  if (!data.rot) return 0
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  if (t.getDay() === 0 || t.getDay() === 6) t.setDate(t.getDate() + (t.getDay() === 6 ? 2 : 1))
  const a = mondayOf(t), s = data.rot.split('-').map(Number)
  const b = new Date(s[0], s[1] - 1, s[2], 12)
  return Math.round((a - mondayOf(b)) / (7 * 864e5))
}
export const meta = {
  label: 'Nöbetçi Öğretmen Çizelgesi', minH: 215,
  def: { places: 'Bahçe\nGiriş\n1. Kat', g: {}, rot: '' },
  fields: [['places', 'area', 'Nöbet yerleri', 'Her satır bir yer'], ['g', 'dgrid', 'Haftalık nöbet çizelgesi'], ['speed', 'num', 'Kaydırma hızı', '0 = kapalı']],
}
export default function Duty({ data, now }) {
  const ref = useRef()
  useAutoScroll(ref, data.speed ?? 0)
  const P = rows({ rows: data.places }), g = data.g || {}
  const w = (now.getDay() + 6) % 7, td = w > 4 ? 0 : w
  const k = weekShift(data, now), n = P.length
  if (!n) return <div className="du"><div className="ln">Nöbet yeri ekleyin</div></div>
  const who = (j) => (g[td] || {})[(((j - k) % n) + n) % n] || ''
  return (
    <div className="du" ref={ref}>
      {w > 4 && <div className="dn">Hafta sonu · Pazartesi nöbetçileri</div>}
      {P.map((p, j) => <div key={j} className="dt"><b>{who(j) || '—'}</b><i>{p}</i></div>)}
    </div>
  )
}
