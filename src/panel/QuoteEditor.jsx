import { useState } from 'react'
import { AYET, SOZ } from '../lib/quotesData.js'
import { listOf, parseQ, todayIx } from '../modules/quote.jsx'

export function QuoteEditor({ data, set }) {
  const [which, setWhich] = useState(data.mode === 'ayet' ? 'ayet' : 'soz')
  const K = which === 'ayet' ? { rows: 'rows2', pin: 'pin2', base: AYET } : { rows: 'rows', pin: 'pin', base: SOZ }
  const Q = listOf(data, which), pin = parseInt(data[K.pin]) || 0
  const [t, setT] = useState(''), [a, setA] = useState(''), [bulk, setBulk] = useState(''), [all, setAll] = useState(false), [ed, setEd] = useState(-1), [ask, setAsk] = useState(false)
  const put = (L, extra) => set({ [K.rows]: L.map((x) => x[0] + (x[1] ? '|' + x[1] : '')).join('\n'), ...(extra || {}) })
  const ti = todayIx(data, new Date(), Q, which), shown = all ? Q.map((x, i) => i) : Q.map((x, i) => i).slice(0, 6)
  const clean = (v) => v.replace(/\|/g, '/').trim()
  const addBulk = () => {
    const have = new Set(Q.map((x) => x[0]))
    const N = bulk.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const p = l.includes('\t') ? l.split('\t') : l.split('|')
      return [clean(p[0] || ''), clean(p.slice(1).join(' '))]
    }).filter((x) => x[0] && !have.has(x[0]))
    if (!N.length) return
    put([...N, ...Q]); setBulk('')
  }
  const loadBase = () => {
    const have = new Set(Q.map((x) => x[0]))
    put([...Q, ...parseQ(K.base).filter((x) => !have.has(x[0]))]); setAsk(false)
  }
  return (
    <div className="p-qe">
      <div className="p-fld"><label>Panoda gösterilecek</label>
        <div className="p-seg">
          <button className={data.mode !== 'ayet' ? 'p-on' : ''} onClick={() => set({ mode: 'soz' })}>💬 Günün sözü</button>
          <button className={data.mode === 'ayet' ? 'p-on' : ''} onClick={() => set({ mode: 'ayet' })}>📖 Ayet / Hadis</button>
        </div>
        <small>Seçtiğin bölümden her gün otomatik bir tanesi gösterilir.</small>
      </div>
      <div className="p-h2">Listeyi düzenle</div>
      <div className="p-seg">
        <button className={which === 'soz' ? 'p-on' : ''} onClick={() => { setWhich('soz'); setEd(-1); setAll(false) }}>Sözler</button>
        <button className={which === 'ayet' ? 'p-on' : ''} onClick={() => { setWhich('ayet'); setEd(-1); setAll(false) }}>Ayet / Hadis</button>
      </div>
      {ti >= 0 && <div className="p-qtd"><small>{pin > 0 ? '📌 Sabit (her gün bu gösterilir)' : 'Bugün bu listeden gösterilecek'}</small><b>“{Q[ti][0]}”</b>{Q[ti][1] && <i>— {Q[ti][1]}</i>}</div>}
      <div className="p-fld"><label>Yeni ekle</label>
        <textarea rows={2} value={t} onChange={(e) => setT(e.target.value)} placeholder="Metin" />
        <div className="p-slr"><input value={a} onChange={(e) => setA(e.target.value)} placeholder="Söyleyen / kaynak (isteğe bağlı)" style={{ flex: 1 }} />
          <button className="p-pri" disabled={!t.trim()} onClick={() => { put([[clean(t), clean(a)], ...Q]); setT(''); setA('') }}>+ Ekle</button></div>
      </div>
      <details className="p-adv"><summary>Toplu ekle</summary>
        <textarea rows={5} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'Her satıra bir tane yazın:\nSöz|Söyleyen\n\nExcel\'den iki sütunu (söz, söyleyen) kopyalayıp yapıştırabilirsiniz.'} />
        <div className="p-btns"><button className="p-pri" disabled={!bulk.trim()} onClick={addBulk}>Toplu ekle</button></div>
        <small>Aynı metinden zaten varsa tekrar eklenmez.</small>
      </details>
      <div className="p-fld">
        {!ask ? <button onClick={() => setAsk(true)}>📚 Hazır {which === 'ayet' ? 'ayet ve hadis' : 'söz'} listesini ekle</button>
          : <div className="p-btns"><button className="p-pri" onClick={loadBase}>Evet, eksikleri ekle</button><button onClick={() => setAsk(false)}>Vazgeç</button></div>}
        <small>Hazır liste 100 kayıttır. Listede olanlar silinmez, sadece eksikler eklenir.</small>
      </div>
      <div className="p-h2">Liste ({Q.length})</div>
      {shown.map((i) => (
        <div key={i} className={'p-slc' + (pin === i + 1 ? ' p-pinned' : '')}>
          <div className="p-slr" onClick={() => setEd(ed === i ? -1 : i)} style={{ cursor: 'pointer' }}>
            <span className="p-tx"><b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{Q[i][0]}</b><small>{Q[i][1] || 'Söyleyen yok'}{ti === i ? ' · bugün' : ''}</small></span>
            <button title="Sabitle" className={pin === i + 1 ? 'p-pri' : ''} onClick={(e) => { e.stopPropagation(); set({ [K.pin]: pin === i + 1 ? 0 : i + 1 }) }}>📌</button>
            <button className="p-danger" onClick={(e) => { e.stopPropagation(); if (!confirm('Silinsin mi?')) return; put(Q.filter((_, k) => k !== i), pin === i + 1 ? { [K.pin]: 0 } : pin > i + 1 ? { [K.pin]: pin - 1 } : undefined) }}>🗑</button>
          </div>
          {ed === i && <>
            <textarea rows={3} value={Q[i][0]} onChange={(e) => put(Q.map((x, k) => (k === i ? [e.target.value.replace(/\|/g, '/'), x[1]] : x)))} />
            <input value={Q[i][1]} placeholder="Söyleyen / kaynak" onChange={(e) => put(Q.map((x, k) => (k === i ? [x[0], e.target.value.replace(/\|/g, '/')] : x)))} />
          </>}
        </div>))}
      {Q.length > 6 && <button onClick={() => setAll(!all)}>{all ? 'Daha az göster' : 'Tümünü göster (' + Q.length + ')'}</button>}
    </div>
  )
}
