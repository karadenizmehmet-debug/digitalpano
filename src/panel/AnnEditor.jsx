import { useState } from 'react'
import { DUR, endOf, isoD, trD } from './common.jsx'
import { DurBar } from './Slides.jsx'

export function AnnEditor({ draft, set }) {
  const L = Array.isArray(draft.anns) ? draft.anns : String(draft.ticker || '').split('\n').filter((l) => l.trim()).map((l) => { const i = l.lastIndexOf('|'); return i < 0 ? { t: l.trim(), d: 0 } : { t: l.slice(0, i).trim(), d: 0, r: l.slice(i + 1).trim() } })
  const [nt, setNt] = useState(''), [nd, setNd] = useState(7), [op, setOp] = useState(-1)
  const put = (a) => set({ anns: a })
  const upd = (i, p) => put(L.map((x, k) => (k === i ? { ...x, ...p } : x)))
  return (
    <div className="p-card p-pad">
      <div className="p-h">📢 Duyurular (alttaki kayan yazı)</div>
      <div className="p-fld"><label>Yeni duyuru</label>
        <textarea rows={2} value={nt} onChange={(e) => setNt(e.target.value)} placeholder="Duyuru metni" />
        <div className="p-slr" style={{ marginTop: 8 }}>
          <select value={nd} onChange={(e) => setNd(+e.target.value)}>{DUR.map(([a, b]) => <option key={a} value={a}>{'Yayın: ' + b}</option>)}</select>
          <button className="p-pri" disabled={!nt.trim()} onClick={() => { put([{ t: nt.trim(), d: nd, on: isoD(new Date()) }, ...L]); setNt('') }}>+ Ekle</button>
        </div>
      </div>
      <div className="p-h2">Yayındakiler ve eskiler ({L.length})</div>
      {!L.length && <small>Henüz duyuru yok.</small>}
      {L.map((x, i) => {
        const e = endOf(x), dead = e && e <= new Date(isoD(new Date()) + 'T00:00:00')
        const sum = (DUR.find(([a]) => a === (x.d || 0)) || [0, 'Süresiz'])[1] + (e ? (dead ? ' · süresi doldu' : ' · ' + trD(new Date(e.getTime() - 86400000)) + ' bitiş') : '')
        return (
          <div key={i} className={'p-slc' + (dead ? ' dead' : '')}>
            <div className="p-slr" onClick={() => setOp(op === i ? -1 : i)} style={{ cursor: 'pointer' }}>
              <span className="p-ttl"><b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.t || '(boş)'}</b><small style={{ color: dead ? '#b4232a' : '#5b6b7b' }}>{sum}</small></span>
              <button className="p-danger" onClick={(ev) => { ev.stopPropagation(); if (confirm('Bu duyuru silinsin mi?')) put(L.filter((_, k) => k !== i)) }}>🗑</button>
              <span>{op === i ? '▴' : '▾'}</span>
            </div>
            {op === i && <>
              <textarea rows={2} value={x.t} onChange={(ev) => upd(i, { t: ev.target.value })} />
              <DurBar x={x} upd={(p) => upd(i, p)} />
              <input placeholder="Yalnızca belirli günlerde (ör. 03.11 veya 03.11-07.11)" value={x.r || ''} onChange={(ev) => upd(i, { r: ev.target.value })} />
            </>}
          </div>)
      })}
    </div>
  )
}
