import test from 'node:test'
import assert from 'node:assert/strict'
import { visibleTicker, annLive, effectiveTicker } from '../src/lib/ticker.js'

const at = (s) => new Date(s)
test('tarihsiz satır her zaman görünür, boş satır atılır', () => {
  assert.deepEqual(visibleTicker('Merhaba\n\n  \nİkinci'), ['Merhaba', 'İkinci'])
})
test('tek gün: yalnızca o gün görünür', () => {
  assert.deepEqual(visibleTicker('Toplantı | 03.11', at('2026-11-03T10:00')), ['Toplantı'])
  assert.deepEqual(visibleTicker('Toplantı | 03.11', at('2026-11-04T00:00')), [])
})
test('tarih aralığı iki ucu da kapsar', () => {
  const t = 'Sınav haftası | 03.11-07.11'
  assert.deepEqual(visibleTicker(t, at('2026-11-07T23:00')), ['Sınav haftası'])
  assert.deepEqual(visibleTicker(t, at('2026-11-02T23:59')), [])
})
test('saatli aralık', () => {
  const t = 'Gezi | 03.11 08:00 - 03.11 16:00'
  assert.deepEqual(visibleTicker(t, at('2026-11-03T12:00')), ['Gezi'])
  assert.deepEqual(visibleTicker(t, at('2026-11-03T16:30')), [])
})
test('yıl sonunu aşan aralık', () => {
  assert.deepEqual(visibleTicker('Tatil | 28.12-03.01', at('2026-12-30T10:00')), ['Tatil'])
})
test('anlaşılmayan tarih: satır olduğu gibi gösterilir', () => {
  assert.deepEqual(visibleTicker('A | B', at('2026-11-03T10:00')), ['A | B'])
})
test('annLive: süresiz ve süreli duyuru', () => {
  assert.equal(annLive({ t: 'x', d: 0 }), true)
  assert.equal(annLive({ t: 'x', d: 2, on: '2026-11-10' }, at('2026-11-11T09:00')), true)
  assert.equal(annLive({ t: 'x', d: 2, on: '2026-11-10' }, at('2026-11-12T09:00')), false)
})
test('effectiveTicker: anns varsa onu, yoksa eski ticker metnini kullanır', () => {
  const n = at('2026-11-11T09:00')
  assert.equal(effectiveTicker({ ticker: 'eski' }, n), 'eski')
  assert.equal(effectiveTicker({ ticker: 'eski', anns: [{ t: 'a\nb', d: 0 }, { t: 'c', d: 1, on: '2026-11-01' }, { t: 'k', d: 0, r: '11.11' }] }, n), 'a b\nk | 11.11')
  assert.deepEqual(visibleTicker(effectiveTicker({ anns: [] }, n), n), [])
})
