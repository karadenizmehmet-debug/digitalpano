// Pano Windows 7 + Chrome 109'da çalışır. Orada olmayan özellikler koda girerse bu sınama kırmızıya döner.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p] })
const files = walk('src').filter((p) => /\.(jsx?|css)$/.test(p))
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const BAN = [
  ['color-mix(', /color-mix\(/], ['toSorted/toReversed/toSpliced', /\.to(Sorted|Reversed|Spliced)\(/], ['findLast', /\.findLast(Index)?\(/],
  ['Object.groupBy', /\b(Object|Map)\.groupBy\(/], ['CSS iç içe @scope/@starting-style', /@(scope|starting-style)\b/], ['text-wrap: balance/pretty', /text-wrap\s*:\s*(balance|pretty)/],
  ['öneksiz mask-*', /(^|[;{\s])mask(-[a-z]+)?\s*:/m],
]
for (const [name, re] of BAN) test('Chrome 109 yasağı: ' + name, () => {
  const hit = files.filter((p) => re.test(strip(readFileSync(p, 'utf8'))))
  assert.deepEqual(hit, [])
})
