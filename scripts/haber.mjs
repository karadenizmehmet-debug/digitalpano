// Haber başlıklarını RSS'ten çeker.
// - Her zaman public/haber.json dosyasına yazar (derlemeyle birlikte yayınlanan yedek liste).
// - FIREBASE_SERVICE_ACCOUNT varsa Firestore'a da yazar (config/haber). Pano bunu canlı dinler;
//   böylece haberler için sitenin yeniden yayınlanması gerekmez (.github/workflows/haber.yml, 30 dk'da bir).
// Kaynaklar: NEWS_URL ortam değişkeni (virgülle ayrılmış), yoksa panelde işaretlenenler (Firestore config/pano → rssList).
// Hata olursa derlemeyi ASLA bozmaz. Kaynak seçili değilse ya da hiçbiri çekilemezse eski liste korunur
// (RSS kapatılıp yeniden açıldığında başlıklar beklemeden geri gelsin diye).
import { writeFileSync, mkdirSync } from 'node:fs'
import { activeUrls } from '../src/lib/newsDefault.js'
import { titles, mixFeeds, signJwt, haberDoc } from './haber-lib.mjs'
const OUT = 'public/haber.json', LIVE = 'https://digitalpano-84947.web.app/haber.json'
const DOCS = 'https://firestore.googleapis.com/v1/projects/digitalpano-84947/databases/(default)/documents'
const log = (...a) => console.log('[haber]', ...a)
const save = (o) => { mkdirSync('public', { recursive: true }); writeFileSync(OUT, JSON.stringify(o)) }
const get = async (u, ms = 20000) => { const r = await fetch(u, { signal: AbortSignal.timeout(ms), headers: { 'User-Agent': 'Mozilla/5.0 (DijitalPano)' } }); if (!r.ok) throw new Error('HTTP ' + r.status); return r }
async function urls() {
  if (process.env.NEWS_URL) return process.env.NEWS_URL.split(',')
  const q = ['tkNews', 'rssOn', 'rssCustom', 'rssList'].map((f) => 'mask.fieldPaths=' + f).join('&')
  const r = await get(DOCS + '/config/pano?' + q)
  const f = (await r.json()).fields || {}, arr = (x) => (x?.arrayValue?.values || [])
  return activeUrls({
    tkNews: !!f.tkNews?.booleanValue, rssOn: f.rssOn ? arr(f.rssOn).map((v) => v.stringValue) : undefined, rssCustom: f.rssCustom?.stringValue,
    rssList: f.rssList ? arr(f.rssList).map((v) => ({ url: v.mapValue?.fields?.url?.stringValue, on: !!v.mapValue?.fields?.on?.booleanValue })) : undefined,
  })
}
async function feed(u) {
  const r = await get(u), buf = Buffer.from(await r.arrayBuffer())
  const head = buf.subarray(0, 200).toString('latin1'), cs = (/encoding=["']([\w-]+)/i.exec(head) || /charset=([\w-]+)/i.exec(r.headers.get('content-type') || '') || [])[1] || 'utf-8'
  return titles(new TextDecoder(cs.toLowerCase()).decode(buf))
}
// Firestore'a yazma (hizmet hesabı kuralları aşar). Başarısız olursa iş kırmızıya döner ki fark edilsin.
async function toFirestore(o) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + signJwt(sa) })
  const tok = (await tr.json()).access_token
  if (!tok) throw new Error('Google erişim anahtarı alınamadı (HTTP ' + tr.status + ')')
  const r = await fetch(DOCS + '/config/haber', { method: 'PATCH', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify(haberDoc(o)) })
  if (!r.ok) throw new Error('Firestore yazılamadı: HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200))
  log('Firestore güncellendi (config/haber).')
}
const keepOld = async () => { try { const old = await (await get(LIVE, 10000)).json(); save(old); log('Yayındaki eski liste korundu.') } catch { save({ t: new Date().toISOString(), items: [] }) } }

let fresh = null
try {
  const L = (await urls()).map((x) => x.trim()).filter(Boolean)
  if (!L.length) { log('Kaynak seçilmemiş; eski liste korunuyor.'); await keepOld() }
  else {
    const got = []
    for (const u of L) { try { const it = await feed(u); log(it.length, 'başlık:', u); got.push(it) } catch (e) { log('Kaynak çekilemedi:', u, e.message) } }
    const uniq = mixFeeds(got)
    if (!uniq.length) throw new Error('Hiçbir kaynaktan haber alınamadı')
    fresh = { t: new Date().toISOString(), items: uniq }
    save(fresh); log(uniq.length, 'haber yazıldı')
  }
} catch (e) { log('Çekilemedi:', e.message); await keepOld() }
if (fresh && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try { await toFirestore(fresh) } catch (e) { log(e.message); process.exitCode = 1 }
}
