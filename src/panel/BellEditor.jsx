import { useState } from 'react'
import { NumIn } from './common.jsx'

import { buildBell, guessGen, hhmm, joinBell, nextLesson, parseBell, setGap, tmin, LUNCH_MIN } from '../lib/bell.js'
export { hhmm, joinBell, parseBell, tmin }

export function BellEditor({ value, set }) {
  const L = parseBell(value)
  // Ayarlar mevcut saatlerden tahmin edilir; değiştirince "Sonraki dersi ekle" bu değerlerle ekler
  const [gen, setGen] = useState(() => guessGen(L)), [cnt, setCnt] = useState(() => L.length || 7), [ask, setAsk] = useState(false)
  const put = (A) => set(joinBell(A))
  const upd = (i, p) => put(L.map((r, k) => (k === i ? { ...r, ...p } : r)))
  const add = () => put([...L, nextLesson(L, gen)])
  const make = () => { put(buildBell(gen, cnt)); setAsk(false) }
  const num = (k, lo, hi) => (e) => setGen({ ...gen, [k]: Math.max(lo, Math.min(hi, +e.target.value || 0)) })
  return (
    <div className="p-bell">
      {L.map((r, i) => {
        const nx = L[i + 1], br = nx ? tmin(nx.s) - tmin(r.e) : null, du = tmin(r.e) - tmin(r.s)
        return (
          <div key={i}>
            <div className="p-bl">
              <div className="p-bh"><input className="p-bn" value={r.n} onChange={(e) => upd(i, { n: e.target.value })} />
                <button className="p-bx" onClick={() => put(L.filter((_, k) => k !== i))} aria-label="Sil">×</button></div>
              <div className="p-bt">
                <input type="time" value={r.s} onChange={(e) => e.target.value && upd(i, { s: e.target.value })} />
                <span>→</span>
                <input type="time" value={r.e} onChange={(e) => e.target.value && upd(i, { e: e.target.value })} />
                <em>{du > 0 ? du + ' dk' : '⚠'}</em>
              </div>
            </div>
            {br !== null && <div className={'p-bb' + (br < 0 ? ' p-bad' : '')}>
              {br >= LUNCH_MIN ? '🍽️ Öğle arası' : '☕ Teneffüs'}
              <NumIn className="p-gap" inputMode="numeric" value={Math.max(0, br)} onChange={(e) => put(setGap(L, i, Math.max(0, Math.min(240, +e.target.value || 0))))} /> dk
              {br < 0 ? ' ⚠ çakışıyor' : ''}
            </div>}
          </div>)
      })}
      {!L.length && <p className="p-hint">Henüz ders saati yok. Aşağıdaki ayarları girip "Sonraki dersi ekle" ile tek tek ekleyin ya da hepsini birden oluşturun.</p>}
      <div className="p-gen">
        <b>⏰ Zil ayarları</b>
        <div className="p-g2">
          <div className="p-fld"><label>İlk ders başlangıcı</label><input type="time" value={gen.s} onChange={(e) => e.target.value && setGen({ ...gen, s: e.target.value })} /></div>
          <div className="p-fld"><label>Ders süresi (dk)</label><NumIn inputMode="numeric" value={gen.d} onChange={num('d', 5, 120)} /></div>
          <div className="p-fld"><label>Teneffüs (dk)</label><NumIn inputMode="numeric" value={gen.b} onChange={num('b', 0, 60)} /></div>
          <div className="p-fld"><label>Öğle arası (dk)</label><NumIn inputMode="numeric" value={gen.l} onChange={num('l', 0, 180)} /></div>
          <div className="p-fld"><label>Öğle arası kaçıncı dersten sonra</label><NumIn inputMode="numeric" value={gen.a} onChange={num('a', 0, 12)} /></div>
        </div>
        <small>{L.length ? 'Sıradaki: ' + (() => { const x = nextLesson(L, gen); return x.n + ' ' + x.s + ' → ' + x.e })() + (gen.a > 0 && L.length === gen.a ? ' (öğle arasından sonra)' : '') : 'İlk ders ' + gen.s + ' başlar.'} Öğle arası istemiyorsanız sırasını 0 yapın.</small>
        <div className="p-btns"><button className="p-pri" onClick={add}>+ Sonraki dersi ekle</button></div>
        <div className="p-g2">
          <div className="p-fld"><label>Toplam ders sayısı</label><NumIn inputMode="numeric" value={cnt} onChange={(e) => setCnt(Math.max(1, Math.min(14, +e.target.value || 1)))} /></div>
          <div className="p-fld"><label>&nbsp;</label>{!ask ? <button onClick={() => (L.length ? setAsk(true) : make())}>⚡ Hepsini oluştur</button> : null}</div>
        </div>
        {ask && <div className="p-btns"><button className="p-danger" onClick={make}>Evet, mevcut {L.length} dersin yerine {cnt} ders oluştur</button><button onClick={() => setAsk(false)}>Vazgeç</button></div>}
        <small>Eklenen derslerin saatini, adını ve aradaki teneffüs sürelerini yukarıdan tek tek değiştirebilirsiniz. Bir teneffüsü değiştirince sonraki dersler de kayar.</small>
      </div>
    </div>
  )
}
