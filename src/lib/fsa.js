import { liveImgs } from '../modules/slides.jsx'

// Tam ekran duyuru: her "every" dakikada bir, öğeler sırayla tam ekran gösterilir (f.now açıksa sürekli).
export function fsaState(f, n = new Date()) {
  if (!f || f.on === false) return null
  const items = liveImgs(f.items)
  if (!items.length) return null
  const def = Math.max(2, +f.sec || 10), dur = items.map((x) => Math.max(2, +x.sec || def))
  const D = dur.reduce((a, b) => a + b, 0)
  const t = n.getTime() / 1000
  const P = f.now ? D : Math.max(+f.every > 0 ? f.every * 60 : 0, D + 10)
  if (!f.now && !(+f.every > 0)) return null
  let ph = t % P
  if (ph >= D) return null
  let idx = 0
  while (idx < dur.length - 1 && ph >= dur[idx]) { ph -= dur[idx]; idx++ }
  return { items, idx }
}
