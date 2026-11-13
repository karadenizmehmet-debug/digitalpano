// 5–8. sınıf A/B şubelerinin hazır haftalık programı (Pzt–Cum, 1–8. ders). Panelden tek tuşla mevcut programa eklenir.
import { IHO_LESSONS } from './ihoSample.js'
const norm = (s) => String(s || '').toLocaleLowerCase('tr').replace(/[^a-zçğıöşü0-9]/g, '')
// kod: [ders adının başı, yoksa eklenecek ad, kısaltma]
const L = {
  tr: ['türkçe'], mt: ['matematik'], fn: ['fenbilim'], sb: ['sosyalbilgi'], ing: ['ingiliz'], din: ['dinkültür'],
  kur: ['kuran'], ar: ['arapça'], pey: ['peygamber'], gs: ['görsel'], mz: ['müzik'], bd: ['beden'], bt: ['bilişim'],
  reh: ['rehberlik'], tdb: ['temeldini'], tt: ['teknoloji'], ink: ['tcinkılap|inkılap'],
  grg: ['görgü', 'Görgü Kuralları ve Nezaket', 'Görgü'], cev: ['çevre', 'Çevre Eğitimi ve İklim', 'Çevre'],
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
  '6/A': [
    ['tdb', 'kur', 'kur', 'ing', 'tr', 'tr', 'bt'], ['fn', 'din', 'kur', 'mt', 'grg', 'ar', 'sb'],
    ['sb', 'sb', 'pey', 'mz', 'tr', 'tr', 'reh'], ['kur', 'mt', 'fn', 'fn', 'bd', 'din', 'din'],
    ['mt', 'ar', 'grg', 'mz', 'tr', 'tr', 'ing', 'ing'],
  ],
  '6/B': [
    ['ing', 'ing', 'bd', 'grg', 'gs', 'fn', 'fn'], ['mt', 'ar', 'sb', 'kur', 'kur', 'tr', 'tr'],
    ['tr', 'tr', 'mt', 'mt', 'pey', 'pey', 'tdb'], ['sb', 'sb', 'mz', 'bt', 'mt', 'mt', 'reh'],
    ['din', 'din', 'tr', 'tr', 'ar', 'ing', 'fn', 'fn'],
  ],
  '7/A': [
    ['kur', 'kur', 'sb', 'fn', 'fn', 'din', 'din'], ['tr', 'tdb', 'mt', 'mt', 'ar', 'gs', 'tt'],
    ['fn', 'fn', 'mt', 'mt', 'pey', 'pey', 'tr'], ['ing', 'ing', 'grg', 'tr', 'tr', 'reh', 'bd'],
    ['sb', 'sb', 'tdb', 'ing', 'ing', 'ar', 'mt', 'mz'],
  ],
  '7/B': [
    ['sb', 'sb', 'kur', 'bd', 'pey', 'pey', 'tdb'], ['din', 'din', 'tr', 'ar', 'mt', 'mt', 'kur'],
    ['tr', 'tr', 'grg', 'mz', 'mt', 'mt', 'reh'], ['fn', 'fn', 'mt', 'tt', 'gs', 'ing', 'ing'],
    ['ing', 'ing', 'tr', 'tr', 'fn', 'fn', 'sb', 'ar'],
  ],
  '8/A': [
    ['tt', 'tt', 'kur', 'pey', 'pey', 'ar', 'gs'], ['ink', 'ink', 'bd', 'tdb', 'reh', 'ing', 'ing'],
    ['mt', 'mt', 'tr', 'tr', 'grg', 'ing', 'ing'], ['tr', 'tr', 'kur', 'ink', 'fn', 'fn', 'cev'],
    ['ar', 'mz', 'fn', 'fn', 'mt', 'mt', 'din', 'din'],
  ],
  '8/B': [
    ['mt', 'mz', 'tt', 'tt', 'grg', 'grg', 'ar'], ['ar', 'ar', 'ing', 'bd', 'cev', 'tr', 'tr'],
    ['ing', 'ing', 'fn', 'fn', 'tr', 'ink', 'ink'], ['pey', 'pey', 'mt', 'mt', 'kur', 'kur', 'reh'],
    ['fn', 'fn', 'din', 'din', 'tr', 'tr', 'mt', 'mt'],
  ],
}
const same = (a, b) => norm(a) === norm(b)
export function addHazirProg(data, N = 8) {
  const classes = [...(data.classes || [])], lessons = [...(data.lessons || [])], prog = { ...(data.prog || {}) }
  const lesson = (code) => {
    const [pre, name, k] = L[code], ps = pre.split('|')
    const f = lessons.find((x) => ps.some((q) => norm(x.n).startsWith(q)))
    if (f) return f.n
    const s = IHO_LESSONS.find((x) => ps.some((q) => norm(x.n).startsWith(q))) || { n: name, k }
    lessons.push({ n: s.n, k: s.k }); return s.n
  }
  for (const [cn, days] of Object.entries(W)) {
    let c = classes.find((x) => same(x, cn))
    if (!c) { c = cn; classes.push(c) }
    prog[c] = Object.fromEntries(days.map((d, i) => [i, Array.from({ length: N }, (_, h) => (d[h] ? lesson(d[h]) : ''))]))
  }
  return { classes, lessons, prog }
}
