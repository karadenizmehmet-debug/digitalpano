// MEB haber başlıklarını RSS'ten çekip public/haber.json dosyasına yazar (derlemeden önce çalışır).
// RSS adresi: NEWS_URL ortam değişkeni, yoksa panelde kaydedilen ayar (Firestore config/pano → newsUrl).
// Hata olursa derlemeyi ASLA bozmaz; önce yayındaki eski haber.json'u korumaya çalışır.
import { writeFileSync, mkdirSync } from 'node:fs'
const OUT = 'public/haber.json', LIVE = 'https://digitalpano-84947.web.app/haber.json'
const log = (...a) => console.log('[haber]', ...a)
const save = (o) => { mkdirSync('public', { recursive: true }); writeFileSync(OUT, JSON.stringify(o)) }
const get = async (u, ms = 20000) => { const r = await fetch(u, { signal: AbortSignal.timeout(ms), headers: { 'User-Agent': 'Mozilla/5.0 (DijitalPano)' } }); if (!r.ok) throw new Error('HTTP ' + r.status); return r }
const ent = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
async function url() {
  if (process.env.NEWS_URL) return process.env.NEWS_URL
  const r = await get('https://firestore.googleapis.com/v1/projects/digitalpano-84947/databases/(default)/documents/config/pano?mask.fieldPaths=newsUrl&mask.fieldPaths=tkNews')
  const d = await r.json(), f = d.fields || {}
  return f.tkNews?.booleanValue ? f.newsUrl?.stringValue || '' : ''
}
try {
  const u = (await url()).trim()
  if (!u) { log('Haber kapalı ya da adres yok; atlandı.'); save({ t: new Date().toISOString(), items: [] }); process.exit(0) }
  const r = await get(u), buf = Buffer.from(await r.arrayBuffer())
  const head = buf.subarray(0, 200).toString('latin1'), cs = (/encoding=["']([\w-]+)/i.exec(head) || /charset=([\w-]+)/i.exec(r.headers.get('content-type') || '') || [])[1] || 'utf-8'
  const xml = new TextDecoder(cs.toLowerCase()).decode(buf)
  const items = [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map((m) => ent((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(m[0]) || [])[1] || '')).filter(Boolean)
  const uniq = [...new Set(items)].slice(0, 15)
  if (!uniq.length) throw new Error('RSS içinde haber bulunamadı')
  save({ t: new Date().toISOString(), items: uniq }); log(uniq.length, 'haber yazıldı')
} catch (e) {
  log('Çekilemedi:', e.message)
  try { const old = await (await get(LIVE, 10000)).json(); save(old); log('Yayındaki eski liste korundu.') } catch { save({ t: new Date().toISOString(), items: [] }) }
}
