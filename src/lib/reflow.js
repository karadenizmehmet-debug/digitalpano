// Otomatik yerleşim: modülleri 3 sütuna dizer, taşanı en boş sütuna alır, boşluğu esnek modüllerle doldurur.
export const COLS = [[20, 348], [380, 840], [1232, 348]]
// Manşet (slides) boyutu sabittir: görseller bu ölçüde hazırlanır
// Bazı tasarımlar sütun düzenini değiştirir (manşet yeri ve sütun genişlikleri)
export const DESIGN_COLS = {
  9: [[20, 840], [872, 356], [1240, 340]],
  10: [[20, 340], [372, 356], [740, 840]],
  11: [[20, 300], [332, 840], [1184, 396]],
  12: [[0, 1256], [1256, 344]],
  13: [[20, 420], [444, 1136]],
}
// Yan panelli tasarımlar: modüller seçilen tek sütuna (side) dizilir; alan [üst, alt]
export const SIDE_DSG = { 12: { col: 1, top: 100, bot: 900, strip: 1 }, 13: { col: 0, top: 116, bot: 880, strip: 1 } }
// Bazı tasarımlarda manşet boyutu farklıdır 
export const DESIGN_SLIDE = { 12: { w: 1256, h: 688 }, 13: { w: 1136, h: 622 } }
export const slideFor = (d) => DESIGN_SLIDE[d] || SLIDE
export const colsFor = (d) => DESIGN_COLS[d] || COLS
export const SLIDE = { w: 840, h: 460 }
const FLEX = ['slides', 'table', 'days', 'duty', 'news', 'menu', 'text', 'schedule']
// Artan boşluğun öncelikle verildiği (içeriği uzayabilen / kaydırmalı) modüller
const GROW = ['slides', 'schedule', 'table', 'days', 'news', 'menu', 'text']

export function colSnap(m, CL = COLS) {
  const c = m.x + m.w / 2
  let i = 0, best = 1e9
  CL.forEach(([x, w], k) => { const d = Math.abs(c - (x + w / 2)); if (d < best) { best = d; i = k } })
  m.x = CL[i][0]; m.w = CL[i][1]
}

// mods: dizi (yerinde değiştirilir). pref: öncelikli modül. minOf(m): en küçük yükseklik
export function reflow(mods, pref, minOf, wantOf, CL = COLS, SZ = SLIDE, order = null, AR = null) {
  const TOP = AR ? AR.top : 124, BOT = AR ? AR.bot : 832, G = 12, AV = BOT - TOP
  const mn = (m) => (m.type === 'slides' ? SZ.h : minOf(m) || 100)
  const eff = (m) => (m.fixH ? Math.max(m.h, mn(m)) : mn(m))
  const need = (A) => A.reduce((q, m) => q + eff(m), 0) + G * Math.max(0, A.length - 1)
  // Sütuna tam oturmayan (ör. boyutlandırılmış) modülleri en yakın sütuna oturt; yoksa sütun dışında kalıp diğerleriyle üst üste biner
  mods.forEach((m) => { if (m.type === 'slides') { const sc = CL.find((c) => c[1] === SZ.w) || CL[1]; m.x = sc[0]; m.w = SZ.w; m.h = SZ.h; m.fixH = true }; if (m.active && m.y >= 100 && !(AR && AR.strip && (AR.stripId === 'none' ? false : AR.stripId ? m.id === AR.stripId : m.type === 'quote'))) { if (order && m.type !== 'slides') { const L = CL[AR && AR.col != null ? AR.col : CL.length - 1]; m.x = L[0]; m.w = L[1] } else colSnap(m, CL) } })
  // Manşetin altındaki boşluk "Günün Sözü" şeridi olur (manşet 840:460 oranını korur)
  const sid = AR && AR.stripId
  const strip = AR && AR.strip && sid !== 'none' ? mods.filter((m) => m.active && (sid ? m.id === sid : m.type === 'quote')) : []
  mods.forEach((m) => { delete m.strp })
  strip.forEach((m) => { const sc = CL.find((c) => c[1] === SZ.w) || CL[1]; m.x = sc[0]; m.w = SZ.w; m.y = TOP + SZ.h + G; m.h = BOT - m.y; m.fixH = true; m.strp = true })
  const key = (m) => (m.type === 'slides' ? -1e9 : order && order.indexOf(m.id) >= 0 ? order.indexOf(m.id) : (order ? 1e4 : 0) + m.y + m.h / 2)
  const cols = CL.map(([x, w]) => mods.filter((m) => m.active && !strip.includes(m) && m.x === x && m.w === w && m.y >= 100).sort((a, b) => key(a) - key(b)))
  for (let g = 0; g < 30; g++) {
    const o = order ? -1 : cols.findIndex((A) => need(A) > AV)
    if (o < 0) break
    const A = cols[o], mv = A.filter((m) => m.type !== 'slides'), ev = pref && mv.includes(pref) ? pref : mv[mv.length - 1]
    if (!ev) break
    let d = -1, best = -1
    cols.forEach((B, i) => { if (i === o) return; const rm = AV - need(B.concat([ev])); if (rm >= 0 && rm > best) { best = rm; d = i } })
    if (d < 0) break
    A.splice(A.indexOf(ev), 1); cols[d].push(ev); ev.x = CL[d][0]; ev.w = CL[d][1]
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
    if (order && sum() > AV) { const k = (AV - G * (A.length - 1)) / (sum() - G * (A.length - 1)); D.forEach((v, i) => { D[i] = Math.floor(v * k) }) } // yan panelde hepsi sığsın diye orantılı sıkıştır
    let y = TOP
    A.forEach((m, i) => { m.y = y; m.h = D[i]; y += D[i] + G })
  })
}
