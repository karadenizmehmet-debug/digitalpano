import { useEffect, useState } from 'react'
import { DESIGN_META } from '../lib/themes.js'
import { loadImage } from '../lib/firebase.js'


export const ALI = ['🚨','⚠️','🔥','🌍','🌧️','❄️','⚡','🌪️','📢','🏥','🚑','🚒','🚫','⛔','😷','🚸','🔒','📣','ℹ️','✅','🕌','🎓','🚌','⏰']

export const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']

export const COND = { sun: 'Güneşli', partly: 'Parçalı bulutlu', cloud: 'Bulutlu', rain: 'Yağmurlu', wind: 'Rüzgarlı', snow: 'Karlı', storm: 'Gök gürültülü', fog: 'Sisli' }


export const ICO = { word: '🔤', task: '🎯', history: '📜', schedule: '🗓️', clock: '🕒', text: '📝', table: '📋', slides: '🖼️', bell: '🔔', weather: '🌤️', duty: '🧑‍🏫', days: '📅', news: '📰', menu: '🍽️', bday: '🎂', cnt: '⏳', cd: '🗓️', pray: '🕌', quote: '💬' }

export const TONES = { r: 'Kırmızı', b: 'Mavi', g: 'Yeşil', o: 'Turuncu', p: 'Mor', k: 'Siyah' }

// Görseli küçültüp JPEG'e çevirir (Firestore belgesi 1 MB'ı geçmesin)
export async function shrink(file, maxDim = 1280, type = 'image/jpeg', limit = 700000) {
  const bmp = await createImageBitmap(file)
  let max = maxDim, q = 0.8, out = ''
  for (let i = 0; i < 5; i++) {
    const r = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r)
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    out = c.toDataURL(type, q)
    if (out.length < limit) return out
    max *= 0.8; q -= 0.08
  }
  throw new Error('Görsel çok büyük')
}

// Sayı kutusu: silip yeniden yazmaya izin verir (boşken değeri zorla geri doldurmaz)
export function NumIn({ value, onChange, ...rest }) {
  const [t, setT] = useState(String(value ?? ''))
  useEffect(() => { setT((o) => (o !== '' && +o === +value ? o : String(value ?? ''))) }, [value])
  return <input type="number" {...rest} value={t}
    onChange={(e) => { setT(e.target.value); if (e.target.value !== '' && !isNaN(+e.target.value)) onChange(e) }}
    onBlur={() => setT(String(value ?? ''))} />
}

// Tasarım küçük resmi (gerçek renklerle basit yerleşim taslağı)
export function Mini({ i }) {
  const [, bg, hd, cd, ac, ly] = DESIGN_META[i] || DESIGN_META[0]
  const cards = (x, w, n, y0 = 13, y1 = 52) => Array.from({ length: n }, (_, k) => { const h = (y1 - y0 - (n - 1) * 2) / n; return <rect key={x + '_' + k} x={x} y={y0 + k * (h + 2)} width={w} height={h} rx="2" fill={cd} stroke={ac} strokeOpacity=".35" strokeWidth=".5" /> })
  let body
  if (ly === 'l') body = <>{<rect x="3" y="13" width="48" height="26" fill="#000" />}{cards(54, 39, 3)}{cards(3, 48, 1, 41, 52)}</>
  else if (ly === 'r') body = <>{cards(3, 39, 3)}{<rect x="45" y="13" width="48" height="26" fill="#000" />}{cards(45, 48, 1, 41, 52)}</>
  else if (ly === 'R') body = <>{<rect x="0" y="12" width="70" height="42" fill="#000" />}<rect x="70" y="12" width="26" height="42" fill={cd} />{cards(72, 22, 4, 14, 52)}</>
  else if (ly === 'L') body = <>{cards(3, 24, 4, 14, 52)}{<rect x="30" y="14" width="63" height="36" rx="2" fill="#000" />}</>
  else body = <>{cards(3, 24, 3)}{<rect x="30" y="13" width="36" height="24" fill="#000" />}{cards(30, 36, 1, 39, 52)}{cards(69, 24, 3)}</>
  return <svg viewBox="0 0 96 54" width="96" height="54" style={{ flex: 'none', borderRadius: 6, border: '1px solid #cdd8e2' }}><rect width="96" height="54" fill={bg} /><rect width="96" height="9" fill={hd} />{body}</svg>
}

export function Thumb({ x }) {
  const [src, setSrc] = useState(x.src || '')
  useEffect(() => { if (!x.src && x.img) loadImage(x.img).then(setSrc).catch(() => {}) }, [x.img, x.src])
  return src ? <img src={src} className="p-th" /> : <span className="p-th" />
}

export const isoLocal = (d) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16) }

export const DUR = [[1, '1 gün'], [3, '3 gün'], [7, '1 hafta'], [30, '1 ay'], [365, '1 yıl'], [0, 'Süresiz']]

export const isoD = (d) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10) }

export const endOf = (x) => { if (!x.d) return null; const d = new Date((x.on || isoD(new Date())) + 'T00:00:00'); d.setDate(d.getDate() + x.d); return d }

export const trD = (d) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
