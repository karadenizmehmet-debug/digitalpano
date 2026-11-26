import test from 'node:test'
import assert from 'node:assert/strict'
import { parseBell, joinBell, guessGen, nextLesson, buildBell } from '../src/lib/bell.js'

const G = { s: '08:30', d: 40, b: 10, l: 45, a: 4 }
test('buildBell öğle arasıyla', () => {
  const A = buildBell(G, 6)
  assert.deepEqual(A.map((r) => r.s + '-' + r.e), ['08:30-09:10', '09:20-10:00', '10:10-10:50', '11:00-11:40', '12:25-13:05', '13:15-13:55'])
  assert.equal(A[5].n, '6. Ders')
})
test('öğle arası yoksa (a=0)', () => {
  assert.deepEqual(buildBell({ ...G, a: 0 }, 5).map((r) => r.s), ['08:30', '09:20', '10:10', '11:00', '11:50'])
})
test('nextLesson boş listede başlangıç', () => {
  assert.deepEqual(nextLesson([], G), { s: '08:30', e: '09:10', n: '1. Ders' })
})
test('guessGen geri tahmin', () => {
  const g = guessGen(buildBell(G, 7))
  assert.deepEqual(g, G)
  assert.deepEqual(guessGen([]).s, '08:30')
})
test('parse/join', () => {
  const t = '08:30-09:10 1. Ders\n09:20-10:00 2. Ders'
  assert.equal(joinBell(parseBell(t)), t)
})
