import { p2 } from './util.js'
// Özel gün: { id, date:'GG.AA', title, sub, fs, conf, on, now, img|imgId, iv (dk), ds (sn) }
export function specialToday(sd = [], n = new Date()) {
  const t = p2(n.getDate()) + '.' + p2(n.getMonth() + 1)
  return sd.find((d) => d.now) || sd.find((d) => d.on !== false && String(d.date).trim() === t && (d.title || d.img || d.imgId)) || null
}
// iv > 0 ise her iv dakikada bir ds saniye gösterilir; yoksa gün boyu
export function specialVisible(sd, n = new Date()) {
  const d = specialToday(sd, n)
  if (!d || d.now) return d
  const iv = +d.iv
  if (!(iv > 0)) return d
  return (n.getTime() / 1000) % (iv * 60) < Math.max(5, +d.ds || 30) ? d : null
}
