export const p2 = (v) => String(v).padStart(2, '0')
export const MON = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
export const rows = (data) => String(data?.rows || '').split('\n').filter((x) => x.trim())
export const fm = (z) => Math.floor(z / 3600) + ':' + p2(Math.floor(z / 60) % 60) + ':' + p2(z % 60)
export const hm = (v) => p2(Math.floor(v / 60) % 24) + ':' + p2(v % 60)
// Zil satırları: "08:30-09:10 1. Ders"
export const bellRows = (txt) =>
  String(txt || '').split('\n').map((l) => l.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)\s*(.*)/)).filter(Boolean)
    .map((x) => ({ s: +x[1] * 60 + +x[2], e: +x[3] * 60 + +x[4], n: x[5] }))
export const bellOf = (cfg) => cfg.mods.find((q) => q.type === 'bell')

import { useEffect } from 'react'
// Tablo / liste modüllerinde yavaş otomatik kaydırma
export function useAutoScroll(ref, speed = 1) {
  useEffect(() => {
    const t = ref.current
    if (!t || !speed) return
    let wait = 0
    const id = setInterval(() => {
      if (t.scrollHeight <= t.clientHeight + 2) return
      if (wait > 0) { wait--; return }
      t.scrollTop += speed
      if (t.scrollTop + t.clientHeight >= t.scrollHeight - 1) {
        wait = 40
        setTimeout(() => { t.scrollTop = 0; wait = 40 }, 1500)
      }
    }, 50)
    return () => clearInterval(id)
  }, [ref, speed])
}

// color-mix() yerine JS ile renk karıştırma (Chrome 109 / Windows 7 uyumu)
const hex = (c) => {
  let s = String(c || '').trim().replace('#', '')
  if (s.length === 3) s = s.split('').map((x) => x + x).join('')
  if (!/^[0-9a-f]{6}$/i.test(s)) return null
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16))
}
// mix(a, b, p) = color-mix(in srgb, a p%, b)
export const mix = (a, b, p) => {
  const x = hex(a), y = hex(b)
  if (!x || !y) return a
  return '#' + x.map((v, i) => Math.round(v * p / 100 + y[i] * (100 - p) / 100).toString(16).padStart(2, '0')).join('')
}
