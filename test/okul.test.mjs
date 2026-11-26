import test from 'node:test'
import assert from 'node:assert/strict'
import { slugify, validSlug, cfgIdOf, okulFromPath, imageRefs, replaceRefs, userSchools } from '../src/lib/okul.js'

test('slugify Türkçe', () => {
  assert.equal(slugify('Karahüyük Ali Akkanat Ortaokulu'), 'karahuyuk-ali-akkanat-ortaokulu')
  assert.equal(slugify('İSTİKLAL Ortaokulu'), 'istiklal-ortaokulu')
  assert.equal(slugify('  Şehit Çoşkun -- IŞIK  '), 'sehit-coskun-isik')
  assert.equal(slugify(''), '')
})
test('validSlug', () => {
  assert.ok(validSlug('okul2'))
  assert.ok(!validSlug('assets'))
  assert.ok(!validSlug('Okul'))
  assert.ok(!validSlug('a--b'))
  assert.ok(!validSlug(''))
})
test('okulFromPath', () => {
  assert.equal(okulFromPath('/', '/'), '')
  assert.equal(okulFromPath('/okul2', '/'), 'okul2')
  assert.equal(okulFromPath('/okul2/', '/'), 'okul2')
  assert.equal(okulFromPath('/digitalpano/okul2', '/digitalpano/'), 'okul2')
  assert.equal(okulFromPath('/digitalpano/', '/digitalpano/'), '')
  assert.equal(okulFromPath('/assets/x.js', '/'), '')
  assert.equal(okulFromPath('/index.html', '/'), '')
  assert.equal(cfgIdOf(''), 'pano')
  assert.equal(cfgIdOf('okul2'), 'pano-okul2')
})
test('görsel kimlikleri bul ve değiştir', () => {
  const c = { logoId: 'logo1', mods: [{ data: { items: [{ img: 'i1' }, { img: 'data:image/png;base64,xx' }] } }], sd: [{ imgId: 'i2', img: '' }, { imgId: 'i1' }] }
  assert.deepEqual(imageRefs(c), ['logo1', 'i1', 'i2'])
  const r = replaceRefs(c, { logo1: 'L', i1: 'A' })
  assert.equal(r.logoId, 'L')
  assert.equal(r.mods[0].data.items[0].img, 'A')
  assert.equal(r.mods[0].data.items[1].img, 'data:image/png;base64,xx')
  assert.equal(r.sd[0].imgId, 'i2')
  assert.equal(r.sd[1].imgId, 'A')
  assert.equal(c.logoId, 'logo1')
})
test('userSchools', () => {
  assert.deepEqual(userSchools({ durum: 'onayli' }), ['pano'])
  assert.deepEqual(userSchools({ okullar: ['pano-okul2'] }), ['pano-okul2'])
})
