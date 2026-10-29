// İmam hatip ortaokulu örnek verisi: sınıflar, dersler (kısaltmalı) ve rastgele haftalık program.
export const IHO_CLASSES = ['5/A', '5/B', '6/A', '6/B', '7/A', '7/B', '8/A', '8/B']
export const IHO_LESSONS = [
  ['Türkçe', 'Türk'], ['Matematik', 'Mat'], ['Fen Bilimleri', 'Fen'], ['Sosyal Bilgiler', 'Sos'],
  ['T.C. İnkılap Tarihi ve Atatürkçülük', 'İnk'], ['İngilizce', 'İng'], ['Din Kültürü ve Ahlak Bilgisi', 'DKAB'],
  ["Kur'an-ı Kerim", 'Kur'], ['Arapça', 'Arp'], ['Peygamberimizin Hayatı', 'Peyg'], ['Temel Dini Bilgiler', 'TDB'],
  ['Görsel Sanatlar', 'Gör'], ['Müzik', 'Müz'], ['Beden Eğitimi ve Spor', 'Bed'], ['Bilişim Teknolojileri ve Yazılım', 'Biliş'],
  ['Teknoloji ve Tasarım', 'T&T'], ['Rehberlik ve Kariyer Planlama', 'Reh'], ['Seçmeli Ders', 'Seç'],
].map(([n, k]) => ({ n, k }))
// sınıf düzeyine göre haftalık ders saatleri (5, 6, 7, 8)
const H = {
  'Türkçe': [6, 6, 5, 5], 'Matematik': [5, 5, 5, 5], 'Fen Bilimleri': [4, 4, 4, 4], 'Sosyal Bilgiler': [3, 3, 3, 0],
  'T.C. İnkılap Tarihi ve Atatürkçülük': [0, 0, 0, 2], 'İngilizce': [3, 3, 4, 4], 'Din Kültürü ve Ahlak Bilgisi': [2, 2, 2, 2],
  "Kur'an-ı Kerim": [2, 2, 2, 2], 'Arapça': [2, 2, 2, 2], 'Peygamberimizin Hayatı': [2, 2, 2, 2], 'Temel Dini Bilgiler': [0, 1, 1, 0],
  'Görsel Sanatlar': [1, 1, 1, 1], 'Müzik': [1, 1, 1, 1], 'Beden Eğitimi ve Spor': [2, 1, 2, 2],
  'Bilişim Teknolojileri ve Yazılım': [2, 2, 0, 0], 'Teknoloji ve Tasarım': [0, 0, 2, 2],
  'Rehberlik ve Kariyer Planlama': [0, 0, 0, 1], 'Seçmeli Ders': [1, 1, 1, 2],
}
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
export function ihoProgram(N = 8, seed = 2026) {
  const r = rng(seed), prog = {}
  IHO_CLASSES.forEach((c) => {
    const g = +c[0] - 5, occ = []
    for (const [n, h] of Object.entries(H)) for (let i = 0; i < h[g]; i++) occ.push(n)
    for (let i = occ.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [occ[i], occ[j]] = [occ[j], occ[i]] }
    const days = Array.from({ length: 5 }, () => [])
    occ.forEach((n) => {
      const ok = (d) => days[d].length < N
      let cand = [0, 1, 2, 3, 4].filter((d) => ok(d) && days[d].filter((x) => x === n).length < 2)
      if (!cand.length) cand = [0, 1, 2, 3, 4].filter(ok)
      const m = Math.min(...cand.map((d) => days[d].length)); cand = cand.filter((d) => days[d].length === m)
      days[cand[Math.floor(r() * cand.length)]].push(n)
    })
    prog[c] = days.map((d) => { for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [d[i], d[j]] = [d[j], d[i]] } return Array.from({ length: N }, (_, i) => d[i] || '') })
  })
  return prog
}
