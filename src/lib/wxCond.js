// Open-Meteo hava kodu + rüzgar → pano durumu (sun, partly, cloud, fog, rain, snow, storm, wind)
// Rüzgarlı: yağış/sis yokken ortalama rüzgar ≥ 25 km/sa ya da hamle ≥ 45 km/sa
export const WIND_AVG = 25
export const WIND_GUST = 45
export function condOf(c, speed = 0, gust = 0) {
  if (c < 4 && (speed >= WIND_AVG || gust >= WIND_GUST)) return 'wind'
  return c < 2 ? 'sun' : c === 2 ? 'partly' : c === 3 ? 'cloud' : c < 50 ? 'fog' : c < 70 ? 'rain' : c < 80 ? 'snow' : c < 85 ? 'rain' : c < 90 ? 'snow' : 'storm'
}
