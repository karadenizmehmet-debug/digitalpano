import { useEffect, useState } from 'react'

// Open-Meteo: anahtarsız, ücretsiz. Yalnızca internet erişimi olan yerde (Pages/Hosting) çalışır.
export function useLive(city, on) {
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
