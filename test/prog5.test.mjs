import test from 'node:test'
import assert from 'node:assert/strict'
import { addProg5 } from '../src/lib/prog5.js'

test('boş veriye 5/A ve 5/B eklenir, Cuma 8 ders', () => {
  const r = addProg5({})
  assert.deepEqual(r.classes, ['5/A', '5/B'])
  assert.equal(r.prog['5/A'][4].filter(Boolean).length, 8)
  assert.equal(r.prog['5/A'][0].filter(Boolean).length, 7)
  assert.equal(r.prog['5/A'][0][0], 'Türkçe')
  assert.ok(r.lessons.some((x) => x.n === 'Görgü Kuralları ve Nezaket'))
})
test('mevcut ders ve sınıf adı korunur, diğer sınıflara dokunulmaz', () => {
  const r = addProg5({ classes: ['5-A', '6/A'], lessons: [{ n: 'TÜRKÇE', k: 'Tür' }], prog: { '6/A': { 0: ['x'] } } })
  assert.deepEqual(r.classes.slice(0, 2), ['5-A', '6/A'])
  assert.equal(r.prog['5-A'][0][0], 'TÜRKÇE')
  assert.deepEqual(r.prog['6/A'], { 0: ['x'] })
})
