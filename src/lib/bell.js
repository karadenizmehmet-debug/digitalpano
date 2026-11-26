// Zil saatleri: "08:30-09:10 1. Ders" satırları. Saf mantık (sınaması test/bell.test.mjs).
export const tmin = (t) => { const m = /^(\d+):(\d+)/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : 0 }
export const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') }
export const parseBell = (txt) => String(txt || '').split('\n').map((l) => l.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)\s*(.*)/)).filter(Boolean)
  .map((x) => ({ s: hhmm(+x[1] * 60 + +x[2]), e: hhmm(+x[3] * 60 + +x[4]), n: x[5] }))
export const joinBell = (L) => L.map((r) => r.s + '-' + r.e + ' ' + r.n).join('\n')

// Mevcut listeden ayarları tahmin et: s başlangıç, d ders, b teneffüs, l öğle arası, a öğle arası kaçıncı dersten sonra (0 = yok)
export const LUNCH_MIN = 30
export const guessGen = (L) => {
  const g = { s: '08:30', d: 40, b: 10, l: 40, a: 4 }
  if (!L.length) return g
  g.s = L[0].s
  const du = tmin(L[0].e) - tmin(L[0].s)
  if (du > 0) g.d = du
  const gaps = L.slice(1).map((r, i) => tmin(r.s) - tmin(L[i].e))
  const sb = gaps.filter((x) => x > 0 && x < LUNCH_MIN)
  if (sb.length) g.b = Math.min.apply(null, sb)
  const li = gaps.findIndex((x) => x >= LUNCH_MIN)
  if (li >= 0) { g.l = gaps[li]; g.a = li + 1 }
  return g
}
// Bir sonraki dersi ekle: son dersin bitişi + teneffüs (öğle arası sırasındaysa öğle arası)
export const nextLesson = (L, g) => {
  const n = L.length
  const s = n ? tmin(L[n - 1].e) + (g.a > 0 && n === g.a ? g.l : g.b) : tmin(g.s)
  return { s: hhmm(s), e: hhmm(s + g.d), n: (n + 1) + '. Ders' }
}
export const buildBell = (g, count) => { const A = []; for (let i = 0; i < count; i++) A.push(nextLesson(A, g)); return A }
