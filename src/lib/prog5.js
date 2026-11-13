// 5. sınıf A/B şubesinin hazır haftalık programı (Pzt–Cum, 1–8. ders). Panelden tek tuşla mevcut programa eklenir.
import { IHO_LESSONS } from './ihoSample.js'
const norm = (s) => String(s || '').toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9]/g, '')
// kod: [ders adının başı, yoksa eklenecek ad, kısaltma]
const L = {
  tr: ['türkçe'], mt: ['matematik'], fn: ['fenbilim'], sb: ['sosyalbilgi'], ing: ['ingiliz'], din: ['dinkültür'],
  kur: ['kuran'], ar: ['arapça'], pey: ['peygamber'], gs: ['görsel'], mz: ['müzik'], bd: ['beden'], bt: ['bilişim'],
  reh: ['rehberlik'], grg: ['görgü', 'Görgü Kuralları ve Nezaket', 'Görgü'],
}
const W = {
  '5/A': [
    ['tr', 'tr', 'reh', 'ar', 'grg', 'sb', 'sb'], ['ing', 'mt', 'fn', 'fn', 'bt', 'din', 'din'],
    ['pey', 'pey', 'fn', 'fn', 'kur', 'kur', 'mz'], ['mt', 'mt', 'bd', 'bd', 'tr', 'tr', 'gs'],
    ['tr', 'tr', 'ing', 'ing', 'mt', 'mt', 'ar', 'sb'],
  ],
  '5/B': [
    ['fn', 'fn', 'tr', 'tr', 'ar', 'ing', 'ing'], ['bd', 'bd', 'ar', 'ing', 'sb', 'sb', 'mt'],
    ['mt', 'mt', 'tr', 'tr', 'grg', 'mz', 'bt'], ['pey', 'pey', 'gs', 'kur', 'kur', 'reh', 'sb'],
    ['fn', 'fn', 'mt', 'mt', 'din', 'din', 'tr', 'tr'],
  ],
}
const same = (a, b) => norm(a) === norm(b)
export function addProg5(data, N = 8) {
  const classes = [...(data.classes || [])], lessons = [...(data.lessons || [])], prog = { ...(data.prog || {}) }
  const lesson = (code) => {
    const [pre, name, k] = L[code]
    const f = lessons.find((x) => norm(x.n).startsWith(pre))
    if (f) return f.n
    const s = IHO_LESSONS.find((x) => norm(x.n).startsWith(pre)) || { n: name, k }
    lessons.push({ n: s.n, k: s.k }); return s.n
  }
  for (const [cn, days] of Object.entries(W)) {
    let c = classes.find((x) => same(x, cn))
    if (!c) { c = cn; classes.push(c) }
    prog[c] = Object.fromEntries(days.map((d, i) => [i, Array.from({ length: N }, (_, h) => (d[h] ? lesson(d[h]) : ''))]))
  }
  return { classes, lessons, prog }
}
