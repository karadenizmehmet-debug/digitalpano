import { useEffect, useState } from 'react'
import { IHO_CLASSES, IHO_LESSONS, ihoProgram } from '../lib/ihoSample.js'
import { nMax, nOf } from '../modules/schedule.jsx'

export function SchedEditor({ data, set }) {
  const [sec, setSec] = useState('cls'), [c, setC] = useState(''), [ln, setLn] = useState(''), [lk, setLk] = useState('')
  const [pc, setPc] = useState(''), [ask, setAsk] = useState(false), [wk, setWk] = useState(null)
  const classes = data.classes || [], lessons = data.lessons || [], N = nMax(data)
  const prog = data.prog || {}
  const load = () => { set({ classes: IHO_CLASSES, lessons: IHO_LESSONS, prog: ihoProgram(N), n: 8 }); setAsk(false) }
  const cur = classes.includes(pc) ? pc : classes[0]
  const addCls = () => {
    const a = c.split(/[,\n]/).map((x) => x.trim()).filter((x) => x && !classes.includes(x))
    if (a.length) set('classes', [...classes, ...a]); setC('')
  }
  const delCls = (x) => { const p = { ...prog }; delete p[x]; set({ classes: classes.filter((y) => y !== x), prog: p }) }
  const addLes = () => {
    const n = ln.trim(); if (!n || lessons.some((x) => x.n === n)) return
    set('lessons', [...lessons, { n, k: lk.trim() }]); setLn(''); setLk('')
  }
  const delLes = (n) => {
    const p = {}
    for (const k of Object.keys(prog)) p[k] = Object.fromEntries(Object.entries(prog[k] || {}).map(([i, d]) => [i, (d || []).map((x) => (x === n ? '' : x))]))
    set({ lessons: lessons.filter((x) => x.n !== n), prog: p })
  }
  const day = (cl, d) => { const x = (prog[cl] || [])[d] || []; return Array.from({ length: N }, (_, i) => x[i] || '') }
  const weekOf = (cl) => { const all = {}; for (let i = 0; i < 5; i++) all[i] = day(cl, i); return all }
  const saved0 = cur ? JSON.stringify(weekOf(cur)) : ''
  useEffect(() => { setWk(cur ? weekOf(cur) : null) }, [cur, saved0])
  const dirtyW = wk && JSON.stringify(wk) !== saved0
  const setCell = (d, h, v) => setWk((w) => ({ ...w, [d]: w[d].map((x, i) => (i === h ? v : x)) }))
  const saveWk = () => { set('prog', { ...prog, [cur]: wk }) }
  const pickCls = (v) => { if (dirtyW && !confirm('Kaydedilmemiş değişiklikler silinsin mi?')) return; setPc(v) }
  return (
    <div className="p-sched">
      <div className="p-fld">
        {!ask ? <button className={classes.length || lessons.length ? '' : 'p-pri'} onClick={() => (classes.length || lessons.length ? setAsk(true) : load())}>⚡ İmam hatip ortaokulu örneğini yükle</button>
          : <div className="p-btns"><button className="p-danger" onClick={load}>Evet, mevcut sınıf/ders/programın yerine yükle</button><button onClick={() => setAsk(false)}>Vazgeç</button></div>}
        <small>5–8. sınıf A/B şubeleri, tüm dersler (kısaltmalı) ve rastgele örnek program. Sonra ekleyip çıkarabilirsiniz.</small>
      </div>
      <div className="p-sub">{[['cls', '1. Sınıflar'], ['les', '2. Dersler'], ['prg', '3. Program']].map(([k, l]) => <button key={k} className={sec === k ? 'p-on' : ''} onClick={() => setSec(k)}>{l}</button>)}</div>
      {sec === 'cls' && (
        <div className="p-fld">
          <label>Sınıf ekle</label>
          <div className="p-slr"><input value={c} placeholder="Örn: 5/A (virgülle birden çok)" onChange={(e) => setC(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCls()} /><button className="p-pri" onClick={addCls}>Ekle</button></div>
          <div className="p-chips">{classes.map((x) => <span key={x} className="p-chip">{x}<button onClick={() => delCls(x)}>×</button></span>)}</div>
          {!classes.length && <small>Önce sınıfları ekleyin: 5/A, 5/B, 6/A…</small>}
        </div>
      )}
      {sec === 'les' && (
        <div className="p-fld">
          <label>Ders ekle</label>
          <input value={ln} placeholder="Ders adı (Matematik)" onChange={(e) => setLn(e.target.value)} />
          <div className="p-slr"><input value={lk} placeholder="Kısaltma (Mat) – boş bırakılabilir" onChange={(e) => setLk(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLes()} /><button className="p-pri" onClick={addLes}>Ekle</button></div>
          <div className="p-chips">{lessons.map((x) => <span key={x.n} className="p-chip">{x.n}{x.k ? ' (' + x.k + ')' : ''}<button onClick={() => delLes(x.n)}>×</button></span>)}</div>
          <small>Kısaltma yazarsanız panoda küçük tabloda o görünür.</small>
        </div>
      )}
      {sec === 'prg' && (!classes.length || !lessons.length
        ? <p className="p-hint">Program için önce en az bir sınıf ve bir ders ekleyin.</p>
        : <div className="p-fld">
          <label>Sınıf</label>
          <select value={cur} onChange={(e) => pickCls(e.target.value)}>{classes.map((x) => <option key={x}>{x}</option>)}</select>
          {wk && <>
            <div className="p-wk" style={{ gridTemplateColumns: '38px repeat(5,1fr)' }}>
              <span />{['Pzt', 'Sal', 'Çar', 'Per', 'Cum'].map((d) => <b key={d}>{d}</b>)}
              {Array.from({ length: N }, (_, h) => [
                <b key={'h' + h} className="p-wh">{h + 1}</b>,
                ...[0, 1, 2, 3, 4].map((d) => (
                  h >= nOf(data, d) ? <span key={d + '-' + h} className="p-na">·</span> : <select key={d + '-' + h} value={wk[d][h] || ''} onChange={(e) => setCell(d, h, e.target.value)} className={wk[d][h] ? '' : 'p-em'}>
                    <option value="">—</option>
                    {lessons.map((x) => <option key={x.n} value={x.n}>{x.k || x.n}</option>)}
                  </select>))
              ])}
            </div>
            <div className="p-btns">
              <button className={dirtyW ? 'p-pri' : ''} disabled={!dirtyW} onClick={saveWk}>💾 {cur} programını kaydet</button>
              <button disabled={!dirtyW} onClick={() => setWk(weekOf(cur))}>Vazgeç</button>
            </div>
            <small>{dirtyW ? '● Kaydedilmemiş değişiklik var. Kaydet\'e basınca taslağa işlenir; panoya yansıması için üstteki Yayınla\'ya basın.' : 'Her kutuda ders seçin. Kısaltması olan derslerde kısaltma görünür.'}</small>
          </>}
        </div>)}
    </div>
  )
}
