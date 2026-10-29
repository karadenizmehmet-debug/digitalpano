// Acil duyuru: S.al = { on, title, text, tone, ic, is, fs, dur, from, at, pend }
const start = (a, n) => (a.from ? new Date(a.from).getTime() : (a.at || n))
export function alertOn(a, now = Date.now()) {
  if (!a || !a.on) return false
  const b = start(a, now)
  if (isNaN(b)) return true
  if (now < b) return false
  return !(+a.dur > 0) || now < b + a.dur * 6e4
}
export function alertStatus(a, now = Date.now()) {
  if (!a || !a.on) return 'Kapalı'
  const b = start(a, now)
  if (!isNaN(b) && now < b) return 'Beklemede: başlangıç saatini bekliyor'
  if (+a.dur > 0 && now >= b + a.dur * 6e4) return 'Süresi doldu, pano normale döndü'
  return +a.dur > 0 ? 'Açık (yayınlanınca ' + a.dur + ' dk sonra kapanır)' : 'Açık (süresiz)'
}
