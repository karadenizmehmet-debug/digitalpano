import { bellRows, bellOf } from './util.js'
// Gece modu: ders saatleri dışında (ve hafta sonu) ekran karartılır.
// cfg.nmMode: auto | day | night, nmPre/nmPost: ilk dersten önce/son dersten sonra kaç dk açık kalsın, nmWe: hafta sonu gece modu
export function isNight(cfg, n = new Date()) {
  const md = cfg.nmMode || 'auto'
  if (md === 'day') return false
  if (md === 'night') return true
  const B = bellOf(cfg)
  if (!B) return false
  const L = bellRows(B.data.rows)
  if (!L.length) return false
  const wd = n.getDay()
  if ((wd === 0 || wd === 6) && cfg.nmWe !== false) return true
  const m = n.getHours() * 60 + n.getMinutes()
  const a = Math.min(...L.map((x) => x.s)) - (+cfg.nmPre || 0)
  const b = Math.max(...L.map((x) => x.e)) + (+cfg.nmPost || 0)
  return m < a || m >= b
}
