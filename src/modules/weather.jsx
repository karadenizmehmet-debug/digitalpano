import { useEffect, useState } from 'react'
export const meta = { label: 'Hava Durumu', minH: 150, def: {"cond": "partly", "t": 12, "hi": 16, "lo": 10, "live": true}, fields: [["live", "check", "Canlı veri çek"], ["cond", "sel", "Durum (elle)", "Canlı veri alınamazsa kullanılır"], ["t", "num", "Sıcaklık °C (elle)"], ["hi", "num", "En yüksek °C"], ["lo", "num", "En düşük °C"]] }
const WC = { sun: 'Güneşli', partly: 'Parçalı bulutlu', cloud: 'Bulutlu', rain: 'Yağmurlu', wind: 'Rüzgarlı', snow: 'Karlı', storm: 'Gök gürültülü', fog: 'Sisli' }
const CL = 'M18 44h28a9 9 0 0 0 .8-18A13 13 0 0 0 21 28a8 8 0 0 0-3 16z'
const Cl = ({ f, t }) => <g transform={t || ''}><path d={CL} fill={f} stroke="#8ea3b8" strokeWidth="1.5" /></g>
const Sun = () => <><g stroke="#f6b73c" strokeWidth="4" strokeLinecap="round"><path d="M32 6v7M32 51v7M6 32h7M51 32h7M13.6 13.6l5 5M45.4 45.4l5 5M13.6 50.4l5-5M45.4 18.6l5-5" /></g><circle cx="32" cy="32" r="12" fill="#f6b73c" /></>
function Icon({ c }) {
  const I = {
    sun: <Sun />,
    partly: <><circle cx="22" cy="22" r="11" fill="#f6b73c" /><Cl f="#e6edf4" t="translate(6 4)" /></>,
    cloud: <Cl f="#d5dfe9" t="translate(0 -2)" />,
    rain: <><Cl f="#b4c2d1" t="translate(0 -8)" /><path d="M24 46l-3 8M34 46l-3 8M44 46l-3 8" stroke="#3b82d6" strokeWidth="4" strokeLinecap="round" /></>,
    snow: <><Cl f="#d5dfe9" t="translate(0 -8)" /><g fill="#6aa6e8"><circle cx="24" cy="50" r="3" /><circle cx="34" cy="55" r="3" /><circle cx="44" cy="50" r="3" /></g></>,
    storm: <><Cl f="#9fb0c2" t="translate(0 -8)" /><path d="M34 42l-8 12h7l-3 9 11-14h-7z" fill="#f6b73c" /></>,
    wind: <><Cl f="#d5dfe9" t="translate(0 -10)" /><path d="M10 46h30a6 6 0 1 0-6-6M14 56h20a5 5 0 1 1-5 5" fill="none" stroke="#6aa6e8" strokeWidth="4" strokeLinecap="round" /></>,
    fog: <><Cl f="#d5dfe9" t="translate(0 -8)" /><path d="M16 50h32M20 57h26" stroke="#9fb2c5" strokeWidth="4" strokeLinecap="round" /></>,
  }
  return <svg viewBox="0 0 64 64">{I[c] || I.cloud}</svg>
}
// Open-Meteo: anahtarsız, ücretsiz. Yalnızca Firebase Hosting'de (internet erişimi olan yerde) çalışır.
function useLive(city, on) {
  const [X, setX] = useState(null)
  useEffect(() => {
    if (!on || !city) return
    let dead = false
    const load = async () => {
      try {
        const P = city.split(/[/,-]/).map((s) => s.trim()).filter(Boolean), q = P[P.length - 1], il = P.length > 1 ? P[0].toLocaleLowerCase('tr') : ''
        const g = await (await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) + '&count=10&language=tr&country_code=TR')).json()
        const r = g.results || [], p = r.find((x) => il && String(x.admin1 || '').toLocaleLowerCase('tr').includes(il)) || r[0]
        if (!p) throw 0
        const w = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`)).json()
        const c = w.current.weather_code
        const cond = c < 4 && w.current.wind_speed_10m >= 35 ? 'wind' : c < 2 ? 'sun' : c === 2 ? 'partly' : c === 3 ? 'cloud' : c < 50 ? 'fog' : c < 70 ? 'rain' : c < 80 ? 'snow' : c < 85 ? 'rain' : c < 90 ? 'snow' : 'storm'
        if (!dead) setX({ c: cond, t: Math.round(w.current.temperature_2m), hi: Math.round(w.daily.temperature_2m_max[0]), lo: Math.round(w.daily.temperature_2m_min[0]) })
      } catch { if (!dead) setX(null) }
    }
    load()
    const id = setInterval(load, 30 * 6e4)
    return () => { dead = true; clearInterval(id) }
  }, [city, on])
  return X
}
export default function Weather({ data, cfg }) {
  const live = useLive(cfg.city, data.live !== false)
  const v = live || { c: data.cond, t: data.t, hi: data.hi, lo: data.lo }
  return (
    <div className="wt">
      <div className="wx">
        <div className="wi"><Icon c={v.c} /></div>
        <div className="wtt">{v.t}°</div>
        <div className="wd"><b>{WC[v.c] || ''}</b>{cfg.city ? <span>{cfg.city}</span> : null}<span>↑ {v.hi}° ↓ {v.lo}°</span></div>
      </div>
    </div>
  )
}
