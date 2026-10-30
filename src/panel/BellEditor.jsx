import { useState } from 'react'
import { NumIn } from './common.jsx'

export const tmin = (t) => { const m = /^(\d+):(\d+)/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : 0 }

export const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') }

export const parseBell = (txt) => String(txt || '').split('\n').map((l) => l.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)\s*(.*)/)).filter(Boolean)
  .map((x) => ({ s: hhmm(+x[1] * 60 + +x[2]), e: hhmm(+x[3] * 60 + +x[4]), n: x[5] }))

export const joinBell = (L) => L.map((r) => r.s + '-' + r.e + ' ' + r.n).join('\n')

export function BellEditor({ value, set }) {
  const L = parseBell(value)
  const [gen, setGen] = useState({ s: '08:40', d: 40, b: 15, m: 4, l: 60, a: 4 }), [gopen, setGopen] = useState(false), [ask, setAsk] = useState(false)
  const put = (A) => set(joinBell(A))
  const upd = (i, p) => put(L.map((r, k) => (k === i ? { ...r, ...p } : r)))
  const add = () => {
    const last = L[L.length - 1], st = last ? tmin(last.e) + 15 : 8 * 60 + 40
    put([...L, { s: hhmm(st), e: hhmm(st + 40), n: (L.length + 1) + '. Ders' }])
  }
  const make = () => {
    const A = []; let t = tmin(gen.s); const tot = gen.m + gen.a
    for (let i = 0; i < tot; i++) {
      A.push({ s: hhmm(t), e: hhmm(t + gen.d), n: (i + 1) + '. Ders' })
      t += gen.d + (i === gen.m - 1 && gen.a > 0 ? gen.l : gen.b)
    }
    put(A); setAsk(false); setGopen(false)
  }
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
            {br !== null && <div className={'p-bb' + (br < 0 ? ' p-bad' : '')}>{br >= 0 ? (br >= 30 ? '🍽️ ' + br + ' dk ara' : '☕ ' + br + ' dk teneffüs') : '⚠ Bir sonraki ders ile çakışıyor'}</div>}
          </div>)
      })}
      {!L.length && <p className="p-hint">Henüz ders saati yok. Aşağıdan ekleyin ya da hızlı oluşturun.</p>}
      <div className="p-btns">
        <button className="p-pri" onClick={add}>+ Ders saati ekle</button>
        <button onClick={() => setGopen(!gopen)}>⚡ Hızlı oluştur</button>
      </div>
      {gopen && (
        <div className="p-gen">
          <small>Sabah ve öğleden sonra derslerini, teneffüs ve öğle arasıyla birlikte tek seferde oluşturur. Sonra tek tek düzenleyebilirsiniz.</small>
          <div className="p-g2">
            <div className="p-fld"><label>İlk ders başlangıcı</label><input type="time" value={gen.s} onChange={(e) => e.target.value && setGen({ ...gen, s: e.target.value })} /></div>
            <div className="p-fld"><label>Ders süresi (dk)</label><NumIn inputMode="numeric" value={gen.d} onChange={(e) => setGen({ ...gen, d: Math.max(5, +e.target.value || 0) })} /></div>
            <div className="p-fld"><label>Sabah ders sayısı</label><NumIn inputMode="numeric" value={gen.m} onChange={(e) => setGen({ ...gen, m: Math.max(1, Math.min(8, +e.target.value || 1)) })} /></div>
            <div className="p-fld"><label>Teneffüs (dk)</label><NumIn inputMode="numeric" value={gen.b} onChange={(e) => setGen({ ...gen, b: Math.max(0, +e.target.value || 0) })} /></div>
            <div className="p-fld"><label>Öğle arası (dk)</label><NumIn inputMode="numeric" value={gen.l} onChange={(e) => setGen({ ...gen, l: Math.max(0, +e.target.value || 0) })} /></div>
            <div className="p-fld"><label>Öğleden sonra ders sayısı</label><NumIn inputMode="numeric" value={gen.a} onChange={(e) => setGen({ ...gen, a: Math.max(0, Math.min(8, +e.target.value || 0)) })} /></div>
          </div>
          <small>Toplam {gen.m + gen.a} ders. Öğle arası, sabahın son dersinden sonra uygulanır.</small>
          {!ask ? <button className="p-pri" onClick={() => (L.length ? setAsk(true) : make())}>Oluştur</button>
            : <div className="p-btns"><button className="p-danger" onClick={make}>Evet, mevcut saatlerin yerine oluştur</button><button onClick={() => setAsk(false)}>Vazgeç</button></div>}
        </div>)}
    </div>
  )
}
