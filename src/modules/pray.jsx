import { hm, fm } from '../lib/util.js'
export const meta = { label: 'Namaz Vakitleri', minH: 100, def: {"lat": "38.356", "lon": "31.416", "adj": "0,0,5,4,7,0"}, fields: [["lat", "txt", "Enlem"], ["lon", "txt", "Boylam"], ["adj", "txt", "Dakika ayarı", "6 değer, virgülle"]] }
const PN = ['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı']
// Güneş konumuna göre hesaplama (dakika cinsinden, ayar: adj)
function ptimes(dt, d) {
  const r = Math.PI / 180, tz = -dt.getTimezoneOffset() / 60
  const lat = parseFloat(String(d.lat ?? 38.356).replace(',', '.')), lon = parseFloat(String(d.lon ?? 31.416).replace(',', '.'))
  const adj = String(d.adj ?? '0,0,5,4,7,0').split(',').map((x) => +x || 0)
  const jd = Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / 864e5 + 2440587.5 - lon / 360, D = jd - 2451545
  const g = (357.529 + 0.98560028 * D) % 360, q = ((280.459 + 0.98564736 * D) % 360 + 360) % 360
  const Lg = (q + 1.915 * Math.sin(g * r) + 0.02 * Math.sin(2 * g * r)) % 360, e = 23.439 - 3.6e-7 * D
  const RA = ((Math.atan2(Math.cos(e * r) * Math.sin(Lg * r), Math.cos(Lg * r)) / r / 15) % 24 + 24) % 24
  const dc = Math.asin(Math.sin(e * r) * Math.sin(Lg * r)) / r
  const eq = (((q / 15 - RA + 12) % 24) + 24) % 24 - 12, nn = 12 + tz - lon / 15 - eq
  const T = (a) => Math.acos(Math.max(-1, Math.min(1, (-Math.sin(a * r) - Math.sin(dc * r) * Math.sin(lat * r)) / (Math.cos(dc * r) * Math.cos(lat * r))))) / r / 15
  const aa = -Math.atan(1 / (1 + Math.tan(Math.abs(lat - dc) * r))) / r
  return [nn - T(18), nn - T(0.833), nn, nn + T(aa), nn + T(0.833), nn + T(17)].map((h, i) => Math.round(h * 60 + (adj[i] || 0)))
}
export default function Pray({ data, now }) {
  const P = ptimes(now, data), ns = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  let i = P.findIndex((v) => v * 60 > ns), z, nm
  if (i < 0) { const t = new Date(now); t.setDate(t.getDate() + 1); z = ptimes(t, data)[0] * 60 + 86400 - ns; nm = 0 }
  else { z = P[i] * 60 - ns; nm = i }
  return (
    <div className="pry">
      <div className="pr">{P.map((v, k) => <div key={k} className={'pi ' + (k === nm ? 'nx' : '')}><small>{PN[k]}</small><b>{hm(v)}</b></div>)}</div>
      <div className="pn">{PN[nm]} vaktine <b>{fm(z)}</b> kaldı</div>
    </div>
  )
}
