import test from 'node:test'
import assert from 'node:assert/strict'
import { alertOn } from '../src/lib/alert.js'

const T = Date.parse('2026-11-13T10:00:00')
test('kapalı ya da boş acil duyuru görünmez', () => {
  assert.equal(alertOn(null, T), false)
  assert.equal(alertOn({ on: false }, T), false)
})
test('süresiz açık duyuru görünür', () => {
  assert.equal(alertOn({ on: true }, T), true)
})
test('süreli duyuru süre dolunca kapanır', () => {
  assert.equal(alertOn({ on: true, at: T - 4 * 6e4, dur: 5 }, T), true)
  assert.equal(alertOn({ on: true, at: T - 6 * 6e4, dur: 5 }, T), false)
})
test('ileri tarihli duyuru başlangıcını bekler', () => {
  assert.equal(alertOn({ on: true, from: '2026-11-13T11:00:00' }, T), false)
  assert.equal(alertOn({ on: true, from: '2026-11-13T09:00:00' }, T), true)
})
