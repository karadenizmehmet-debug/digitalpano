import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync, createVerify } from 'node:crypto'
import { ent, titles, mixFeeds, signJwt, haberDoc } from '../scripts/haber-lib.mjs'

test('ent: CDATA, HTML etiketleri ve varlıklar temizlenir', () => {
  assert.equal(ent('<![CDATA[ A &amp; B ]]>'), 'A & B')
  assert.equal(ent('&lt;b&gt;Kalın&lt;/b&gt;  &#39;x&#39; &quot;y&quot;'), "Kalın 'x' \"y\"")
})
test('titles: yalnızca <item> başlıkları, en fazla 12', () => {
  const item = (i) => `<item><title><![CDATA[Haber ${i}]]></title><link>x</link></item>`
  const xml = '<rss><channel><title>Kanal adı</title>' + Array.from({ length: 15 }, (_, i) => item(i + 1)).join('') + '<item><title></title></item></channel></rss>'
  const t = titles(xml)
  assert.equal(t.length, 12)
  assert.equal(t[0], 'Haber 1')
  assert.ok(!t.includes('Kanal adı'))
})
test('mixFeeds: kaynaklar sırayla karışır, yinelenen atılır, en fazla 24', () => {
  assert.deepEqual(mixFeeds([['a1', 'a2'], ['b1', 'a1', 'b3']]), ['a1', 'b1', 'a2', 'b3'])
  assert.deepEqual(mixFeeds([]), [])
  const big = [0, 1, 2].map((k) => Array.from({ length: 12 }, (_, i) => k + '-' + i))
  assert.equal(mixFeeds(big).length, 24)
})
test('signJwt: RS256 imzası doğrulanır, alanlar doğru', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
  const [h, p, sig] = signJwt({ client_email: 'a@b.iam.gserviceaccount.com', private_key: privateKey }, 1000).split('.')
  assert.ok(createVerify('RSA-SHA256').update(h + '.' + p).verify(publicKey, Buffer.from(sig, 'base64url')))
  const c = JSON.parse(Buffer.from(p, 'base64url'))
  assert.equal(c.iss, 'a@b.iam.gserviceaccount.com')
  assert.equal(c.exp - c.iat, 3600)
  assert.equal(c.aud, 'https://oauth2.googleapis.com/token')
})
test('haberDoc: Firestore REST biçimi', () => {
  assert.deepEqual(haberDoc({ t: 'T', items: ['x'] }), { fields: { t: { stringValue: 'T' }, items: { arrayValue: { values: [{ stringValue: 'x' }] } } } })
})
