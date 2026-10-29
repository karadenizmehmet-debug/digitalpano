// Kayan duyuru satırları. Satır sonuna "| tarih" eklenirse yalnızca o tarihlerde görünür:
//   Veli toplantısı yarın | 03.11
//   Sınav haftası | 03.11-07.11
//   Gezi | 03.11 08:00 - 03.11 16:00
const parse = (s) => {
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?(?:\s+(\d{1,2}):(\d{2}))?$/)
  return m ? { d: +m[1], mo: +m[2], y: +(m[3] || 0), h: m[4] != null ? +m[4] : null, mi: +(m[5] || 0) } : null
}
function check(line, n) {
  const i = line.lastIndexOf('|')
  if (i < 0) return [line.trim(), true]
  const text = line.slice(0, i).trim(), pr = line.slice(i + 1).trim().split(/\s*[-–]\s*/)
  const a = parse(pr[0]), b = pr[1] ? parse(pr[1]) : null
  if (!a || (pr[1] && !b)) return [line.trim(), true]   // tarih anlaşılmazsa satırı olduğu gibi göster
  const y = n.getFullYear()
  const s = new Date(a.y || y, a.mo - 1, a.d, a.h ?? 0, a.mi)
  const e = b ? new Date(b.y || y, b.mo - 1, b.d, b.h ?? 23, b.h == null ? 59 : b.mi, 59) : new Date(a.y || y, a.mo - 1, a.d, 23, 59, 59)
  if (b && !b.y && e < s) e.setFullYear(e.getFullYear() + 1)
  return [text, n >= s && n <= e]
}
export const visibleTicker = (txt, n = new Date()) =>
  String(txt || '').split('\n').filter((x) => x.trim()).map((x) => check(x, n)).filter((r) => r[1] && r[0]).map((r) => r[0])

// Yapılandırılmış duyurular: cfg.anns = [{t, d (gün, 0=süresiz), on (başlangıç ISO tarih), r (isteğe bağlı gün kuralı)}]
export const annLive = (x, n = new Date()) => {
  if (!x.d) return true
  const e = new Date((x.on || '1970-01-01') + 'T00:00:00'); e.setDate(e.getDate() + x.d)
  const t = new Date(n); t.setHours(0, 0, 0, 0)
  return e > t
}
export const effectiveTicker = (cfg, n = new Date()) =>
  Array.isArray(cfg.anns) ? cfg.anns.filter((x) => x.t && annLive(x, n)).map((x) => x.t.replace(/\n/g, ' ') + (x.r ? ' | ' + x.r : '')).join('\n') : cfg.ticker
