import test from 'node:test'
import assert from 'node:assert/strict'
import { condOf } from '../src/lib/wxCond.js'

test('açık havada ortalama rüzgar 25 km/sa ve üstü rüzgarlı', () => {
  assert.equal(condOf(0, 25, 30), 'wind')
  assert.equal(condOf(3, 30, 0), 'wind')
})
test('hamle 45 km/sa ve üstüyse rüzgarlı', () => {
  assert.equal(condOf(1, 15, 45), 'wind')
})
test('hafif rüzgarda normal durum', () => {
  assert.equal(condOf(0, 10, 20), 'sun')
  assert.equal(condOf(2, 24, 44), 'partly')
  assert.equal(condOf(3), 'cloud')
})
test('yağış varken rüzgar durumu ezmez', () => {
  assert.equal(condOf(61, 40, 70), 'rain')
  assert.equal(condOf(71, 40, 70), 'snow')
  assert.equal(condOf(95, 40, 70), 'storm')
  assert.equal(condOf(45, 40, 70), 'fog')
})
