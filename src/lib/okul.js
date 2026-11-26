// Çoklu okul: adres yolu -> okul, okul -> ayar belgesi. Pano (Windows 7 / Chrome 109) de bunu yükler; yeni JS özelliği kullanma.
const TR = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' }
export const RESERVED = ['assets', 'panel', 'api', 'emoji']

// "Karahüyük Ali Akkanat Ortaokulu" -> "karahuyuk-ali-akkanat-ortaokulu"
export const slugify = (s) => String(s || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()
  .replace(/[çğıöşüâîû]/g, (c) => TR[c]).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '')
export const validSlug = (s) => typeof s === 'string' && s.length <= 40 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && RESERVED.indexOf(s) < 0

// Ana okul (adres kökü) eski belgeyi kullanır: config/pano. Diğerleri config/pano-<yol>.
export const cfgIdOf = (yol) => (yol ? 'pano-' + yol : 'pano')
export const okulFromPath = (path, base) => {
  let p = path || '/'
  if (base && p.indexOf(base) === 0) p = p.slice(base.length)
  else p = p.replace(/^\/+/, '')
  let s = ''
  try { s = decodeURIComponent(p.split('/')[0] || '').toLowerCase() } catch (e) { s = '' }
  return validSlug(s) ? s : ''
}

// Ayar içindeki görsel kimlikleri (images/{id}): logoId, imgId ve veri adresi olmayan img
const IMG_KEYS = ['logoId', 'imgId', 'img']
const isRef = (k, v) => IMG_KEYS.indexOf(k) >= 0 && typeof v === 'string' && v !== '' && !/^(data:|https?:|blob:)/.test(v)
export const imageRefs = (o, out) => {
  out = out || []
  if (Array.isArray(o)) o.forEach((x) => imageRefs(x, out))
  else if (o && typeof o === 'object') Object.keys(o).forEach((k) => { const v = o[k]; if (isRef(k, v)) { if (out.indexOf(v) < 0) out.push(v) } else imageRefs(v, out) })
  return out
}
export const replaceRefs = (o, map) => JSON.parse(JSON.stringify(o), (k, v) => (isRef(k, v) && Object.prototype.hasOwnProperty.call(map, v) ? map[v] : v))

// Onaylı kullanıcının yetkili olduğu okullar (alan yoksa yalnızca ana okul)
export const userSchools = (me) => (me && Array.isArray(me.okullar) ? me.okullar : ['pano'])
