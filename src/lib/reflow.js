// Otomatik yerleşim: modülleri 3 sütuna dizer, taşanı en boş sütuna alır, boşluğu esnek modüllerle doldurur.
export const COLS = [[20, 360], [392, 816], [1220, 360]]
const FLEX = ['slides', 'table', 'days', 'duty', 'news', 'menu', 'text', 'schedule']
// Artan boşluğun öncelikle verildiği (içeriği uzayabilen / kaydırmalı) modüller
const GROW = ['slides', 'schedule', 'table', 'days', 'news', 'menu', 'text']

export function colSnap(m) {
  const c = m.x + m.w / 2, i = c < 386 ? 0 : c < 1214 ? 1 : 2
  m.x = COLS[i][0]; m.w = COLS[i][1]
}

// mods: dizi (yerinde değiştirilir). pref: öncelikli modül. minOf(m): en küçük yükseklik
export function reflow(mods, pref, minOf, wantOf) {
  const TOP = 124, BOT = 832, G = 12, AV = BOT - TOP
  const mn = (m) => minOf(m) || 100
  const eff = (m) => (m.fixH ? Math.max(m.h, mn(m)) : mn(m))
  const need = (A) => A.reduce((q, m) => q + eff(m), 0) + G * Math.max(0, A.length - 1)
  // Sütuna tam oturmayan (ör. boyutlandırılmış) modülleri en yakın sütuna oturt; yoksa sütun dışında kalıp diğerleriyle üst üste biner
  mods.forEach((m) => { if (m.active && m.y >= 100) colSnap(m) })
  const cols = COLS.map(([x, w]) => mods.filter((m) => m.active && m.x === x && m.w === w && m.y >= 100).sort((a, b) => (a.y + a.h / 2) - (b.y + b.h / 2)))
  for (let g = 0; g < 30; g++) {
    const o = cols.findIndex((A) => need(A) > AV)
    if (o < 0) break
    const A = cols[o], ev = pref && A.includes(pref) ? pref : A[A.length - 1]
    let d = -1, best = -1
    cols.forEach((B, i) => { if (i === o) return; const rm = AV - need(B.concat([ev])); if (rm >= 0 && rm > best) { best = rm; d = i } })
    if (d < 0) break
    A.splice(A.indexOf(ev), 1); cols[d].push(ev); ev.x = COLS[d][0]; ev.w = COLS[d][1]
  }
  cols.forEach((A) => {
    if (!A.length) return
    const D = A.map((m) => Math.max(m.fixH ? m.h : (wantOf?.(m) ?? m.h), mn(m))), fl = A.map((m) => FLEX.includes(m.type))
    const sum = () => D.reduce((q, v) => q + v, 0) + G * (A.length - 1)
    let ex = sum() - AV
    if (ex > 0) {
      for (const only of [true, false]) {
        if (ex <= 0) break
        const sl = A.map((m, i) => (m.fixH ? 0 : (fl[i] === only || (!only && !fl[i]) ? D[i] - mn(m) : 0))), tot = sl.reduce((q, v) => q + v, 0)
        if (tot > 0) { const t = Math.min(ex, tot); sl.forEach((v, i) => { D[i] -= Math.floor(t * v / tot) }); ex = sum() - AV }
      }
      if (ex > 0) { // elle sabitlenenler de sığmıyorsa onları da en küçüğe doğru kıs
        const sl = A.map((m, i) => D[i] - mn(m)), tot = sl.reduce((q, v) => q + v, 0)
        if (tot > 0) { const t = Math.min(ex, tot); sl.forEach((v, i) => { D[i] -= Math.floor(t * v / tot) }) }
      }
    } else if (ex < 0) {
      const idx = A.map((m, i) => i).filter((i) => GROW.includes(A[i].type) && !A[i].fixH)
      let add = -ex
      if (idx.length) {
        const tot = idx.reduce((q, i) => q + D[i], 0)
        idx.forEach((i) => { D[i] += Math.floor(add * D[i] / tot) })
        D[idx[idx.length - 1]] += Math.max(0, AV - sum())
      } else {
        // uzayabilen modül yoksa: boşluğu tüm modüllere dengeli dağıt, hiçbirini en çok %35'ten fazla büyütme
        const all = A.map((m, i) => i).filter((i) => !A[i].fixH), tot = all.reduce((q, i) => q + D[i], 0)
        if (tot > 0) {
          add = Math.min(add, Math.floor(tot * 0.35))
          all.forEach((i) => { D[i] += Math.floor(add * D[i] / tot) })
        }
      }
    }
    let y = TOP
    A.forEach((m, i) => { m.y = y; m.h = D[i]; y += D[i] + G })
  })
}
