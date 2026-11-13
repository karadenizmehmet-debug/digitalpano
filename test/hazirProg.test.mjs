import test from 'node:test'
import assert from 'node:assert/strict'
import { addHazirProg } from '../src/lib/hazirProg.js'

test('boş veriye 8 şube eklenir, Pzt–Per 7 ders, Cuma 8 ders', () => {
  const r = addHazirProg({})
  assert.deepEqual(r.classes, ['5/A', '5/B', '6/A', '6/B', '7/A', '7/B', '8/A', '8/B'])
  for (const c of r.classes) {
    for (let d = 0; d < 4; d++) assert.equal(r.prog[c][d].filter(Boolean).length, 7, c + ' gün ' + d)
    assert.equal(r.prog[c][4].filter(Boolean).length, 8, c + ' Cuma')
  }
  assert.equal(r.prog['5/A'][0][0], 'Türkçe')
  for (const c of r.classes) for (let d = 0; d < 5; d++) for (const x of r.prog[c][d]) if (x) assert.ok(r.lessons.some((l) => l.n === x), x)
  for (const n of ['Görgü Kuralları ve Nezaket', 'Çevre Eğitimi ve İklim', 'T.C. İnkılap Tarihi ve Atatürkçülük', 'Temel Dini Bilgiler']) assert.ok(r.lessons.some((x) => x.n === n), n)
})
test('mevcut ders ve sınıf adı korunur, diğer sınıflara dokunulmaz', () => {
  const r = addHazirProg({ classes: ['5-A', '9/A'], lessons: [{ n: 'TÜRKÇE', k: 'Tür' }], prog: { '9/A': { 0: ['x'] } } })
  assert.deepEqual(r.classes.slice(0, 2), ['5-A', '9/A'])
  assert.equal(r.prog['5-A'][0][0], 'TÜRKÇE')
  assert.deepEqual(r.prog['9/A'], { 0: ['x'] })
})
