// haber.mjs'in saf (ağ kullanmayan) yardımcıları. test/haber.test.mjs bunları sınar.
import { createSign } from 'node:crypto'

export const ent = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

// RSS metninden en fazla 12 başlık
export const titles = (xml) => [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map((m) => ent((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(m[0]) || [])[1] || '')).filter(Boolean).slice(0, 12)

// Kaynakları sırayla karıştırır, yinelenenleri atar, en fazla 24 başlık
export const mixFeeds = (got) => {
  const mix = []
  for (let i = 0; i < 12; i++) got.forEach((g) => { if (g[i]) mix.push(g[i]) })
  return [...new Set(mix)].slice(0, 24)
}

// Hizmet hesabı anahtarından Google OAuth için imzalı JWT üretir
const b64 = (x) => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url')
export const signJwt = (sa, now = Math.floor(Date.now() / 1000)) => {
  const body = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })
  return body + '.' + createSign('RSA-SHA256').update(body).sign(sa.private_key).toString('base64url')
}

// Firestore REST belgesi gövdesi: config/haber = { t, items[] }
export const haberDoc = (o) => ({ fields: { t: { stringValue: o.t }, items: { arrayValue: { values: o.items.map((x) => ({ stringValue: x })) } } } })
