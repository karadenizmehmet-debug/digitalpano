import test from 'node:test'
import assert from 'node:assert/strict'
import { SOURCES, listOf, activeUrls, tagOf } from '../src/lib/newsDefault.js'

test('hiç ayar yokken RSS kapalıdır', () => {
  assert.deepEqual(activeUrls({}), [])
  assert.equal(listOf({}).length, SOURCES.length)
})
test('eski ayarlar: tkNews ve rssOn/rssCustom', () => {
  assert.deepEqual(activeUrls({ tkNews: true }), [SOURCES.find((s) => s.id === 'konya').url])
  assert.deepEqual(activeUrls({ rssOn: ['ntv', 'custom'], rssCustom: ' https://x.y/rss ' }), [SOURCES.find((s) => s.id === 'ntv').url, 'https://x.y/rss'])
})
test('rssList varsa yalnızca o geçerlidir; kapalı ve adressiz kaynak sayılmaz', () => {
  const c = { tkNews: true, rssList: [{ id: 'a', url: 'https://a/rss', on: true, tag: 'A' }, { id: 'b', url: 'https://b/rss', on: false }, { id: 'c', url: ' ', on: true }] }
  assert.deepEqual(activeUrls(c), ['https://a/rss'])
  assert.equal(tagOf(c), 'A')
})
test('etiket: tek kaynak kendi etiketi, etiketsizse HABER, çok kaynak HABERLER', () => {
  assert.equal(tagOf({ rssList: [{ url: 'https://a', on: true }] }), 'HABER')
  assert.equal(tagOf({ rssList: [{ url: 'https://a', on: true }, { url: 'https://b', on: true }] }), 'HABERLER')
})
