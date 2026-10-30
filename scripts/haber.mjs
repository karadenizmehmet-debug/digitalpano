// MEB haber başlıklarını RSS'ten çekip public/haber.json dosyasına yazar (derlemeden önce çalışır).
// Kaynaklar: NEWS_URL ortam değişkeni (virgülle ayrılmış), yoksa panelde işaretlenenler (Firestore config/pano → rssOn, rssCustom).
// Hata olursa derlemeyi ASLA bozmaz; önce yayındaki eski haber.json'u korumaya çalışır.
import { writeFileSync, mkdirSync } from 'node:fs'
import { activeUrls } from '../src/lib/newsDefault.js'
const OUT = 'public/haber.json', LIVE = 'https://digitalpano-84947.web.app/haber.json'
const log = (...a) => console.log('[haber]', ...a)
const save = (o) => { mkdirSync('public', { recursive: true }); writeFileSync(OUT, JSON.stringify(o)) }
const get = async (u, ms = 20000) => { const r = await fetch(u, { signal: AbortSignal.timeout(ms), headers: { 'User-Agent': 'Mozilla/5.0 (DijitalPano)' } }); if (!r.ok) throw new Error('HTTP ' + r.status); return r }
const ent = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
async function urls() {
  if (process.env.NEWS_URL) return process.env.NEWS_URL.split(',')
  const q = ['tkNews', 'rssOn', 'rssCustom', 'rssList'].map((f) => 'mask.fieldPaths=' + f).join('&')
  const r = await get('https://firestore.googleapis.com/v1/projects/digitalpano-84947/databases/(default)/documents/config/pano?' + q)
  const f = (await r.json()).fields || {}, arr = (x) => (x?.arrayValue?.values || [])
  return activeUrls({
    tkNews: !!f.tkNews?.booleanValue, rssOn: f.rssOn ? arr(f.rssOn).map((v) => v.stringValue) : undefined, rssCustom: f.rssCustom?.stringValue,
    rssList: f.rssList ? arr(f.rssList).map((v) => ({ url: v.mapValue?.fields?.url?.stringValue, on: !!v.mapValue?.fields?.on?.booleanValue })) : undefined,
  })
}
async function feed(u) {
  const r = await get(u), buf = Buffer.from(await r.arrayBuffer())
  const head = buf.subarray(0, 200).toString('latin1'), cs = (/encoding=["']([\w-]+)/i.exec(head) || /charset=([\w-]+)/i.exec(r.headers.get('content-type') || '') || [])[1] || 'utf-8'
  const xml = new TextDecoder(cs.toLowerCase()).decode(buf)
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map((m) => ent((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(m[0]) || [])[1] || '')).filter(Boolean).slice(0, 12)
}
try {
  const L = (await urls()).map((x) => x.trim()).filter(Boolean)
  if (!L.length) { log('Kaynak seçilmemiş; atlandı.'); save({ t: new Date().toISOString(), items: [] }); process.exit(0) }
  const got = []
  for (const u of L) { try { const it = await feed(u); log(it.length, 'başlık:', u); got.push(it) } catch (e) { log('Kaynak çekilemedi:', u, e.message) } }
  const mix = []  // kaynakları sırayla karıştır
  for (let i = 0; i < 12; i++) got.forEach((g) => { if (g[i]) mix.push(g[i]) })
  const uniq = [...new Set(mix)].slice(0, 24)
  if (!uniq.length) throw new Error('Hiçbir kaynaktan haber alınamadı')
  save({ t: new Date().toISOString(), items: uniq }); log(uniq.length, 'haber yazıldı')
} catch (e) {
  log('Çekilemedi:', e.message)
  try { const old = await (await get(LIVE, 10000)).json(); save(old); log('Yayındaki eski liste korundu.') } catch { save({ t: new Date().toISOString(), items: [] }) }
}
