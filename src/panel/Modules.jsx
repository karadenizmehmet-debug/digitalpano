import { useState } from 'react'
import { Field } from './Field.jsx'
import { ICO, NumIn } from './common.jsx'
import { registry } from '../lib/registry.js'

export function Tiles({ mods, go }) {
  return <div className="p-tiles">{mods.map((m) => (
    <button key={m.id} className={'p-tile' + (m.active ? '' : ' p-qoff')} onClick={() => go(m.id)}>
      <span className="p-ti">{ICO[m.type] || '🧩'}</span>
      <b>{m.title || registry[m.type]?.label}</b>
      {!m.active && <small>Kapalı</small>}
    </button>))}</div>
}

export function ModList({ mods, go, toggle, pre = [] }) {
  return <div className="p-mgrid">{pre.map((r) => (
    <div key={r.t} className="p-mt" onClick={r.go}>
      <span className="p-mti">{r.i}</span>
      <b>{r.t}</b>
      <small>Aç ›</small>
    </div>))}{mods.map((m, i) => (
    <div key={m.id} className={'p-mt' + (m.active ? '' : ' p-off')} onClick={() => go(m.id)}>
      <span className="p-mti">{ICO[m.type] || '🧩'}</span>
      <b>{m.title || registry[m.type]?.label}</b>
      <label className="p-sw" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={m.active} onChange={(e) => toggle(i, e.target.checked)} /><i />
      </label>
      <small>{m.active ? 'Aktif' : 'Pasif'}</small>
    </div>))}</div>
}

export function ModEditor({ m, upd, del, move, say, root, setRoot, open, setOpen, noBack }) {
  const R = registry[m.type]
  const [ask, setAsk] = useState(false)
  const setData = (k, v) => upd({ data: { ...m.data, ...(typeof k === 'object' ? k : { [k]: v }) } })
  return (
    <div className={open ? 'p-detail' : 'p-card' + (m.active ? '' : ' p-off')} id={'mod-' + m.id}>
      {!open ? (
        <div className="p-row" onClick={() => setOpen(m.id)}>
          <span className="p-nm"><b>{m.title || R?.label}</b><small>{R?.label || m.type}</small></span>
          <label className="p-sw" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={m.active} onChange={(e) => upd({ active: e.target.checked })} /><i />
          </label>
          <span className="p-ar">›</span>
        </div>
      ) : (
        <div className="p-dh">
          {noBack ? <b>📰 Manşet haber</b> : <button className="p-back" onClick={() => setOpen(null)}>← Modüller</button>}
          <label className="p-chk p-on-off"><input type="checkbox" checked={m.active} onChange={(e) => upd({ active: e.target.checked })} /> Panoda göster</label>
        </div>
      )}
      {open && (
        <div className="p-body p-dbody">
          {!noBack && <><div className="p-fld"><label>Başlık</label><input value={m.title || ''} onChange={(e) => upd({ title: e.target.value })} /></div>
          <label className="p-chk"><input type="checkbox" checked={m.showTitle !== false && (m.type !== 'slides' || m.showTitle)} onChange={(e) => upd({ showTitle: e.target.checked })} /> Başlığı göster</label></>}
          {!noBack && m.type !== 'slides' && <><label className="p-chk"><input type="checkbox" checked={!!m.fsFull} onChange={(e) => upd({ fsFull: e.target.checked })} /> ⭐ Aralıklı tam ekran göster (Öne Çıkan ayarlarıyla)</label>
          {m.fsFull && <div className="p-fld"><label>Tam ekranda kalma süresi (sn) — boşsa Öne Çıkan'daki süre</label><NumIn min="2" value={m.fsSec || ''} onChange={(e) => upd({ fsSec: +e.target.value || 0 })} /></div>}</>}
          {(R?.fields || []).filter((f) => !(noBack && m.type === 'slides' && f[1] !== 'slides')).map((f) => <Field key={f[0]} f={f} data={m.data} set={setData} say={say} root={root} setRoot={setRoot} />)}
          {!noBack && <details className="p-adv"><summary>Gelişmiş (boyut, renk, konum)</summary>
          <label className="p-chk" style={{ marginTop: 10 }}><input type="checkbox" checked={!!m.fixH} onChange={(e) => upd({ fixH: e.target.checked })} /> Yüksekliği sabitle (otomatik yerleşim değiştirmesin)</label>
          <div className="p-fld"><label>Yazı boyutu (%)</label><NumIn value={m.fs || 100} onChange={(e) => upd({ fs: +e.target.value })} /></div>
          <div className="p-fld"><label>Renk</label><input type="color" value={m.color || '#0f9b8e'} onChange={(e) => upd({ color: e.target.value })} /></div>
          <div className="p-pos">
            {['x', 'y', 'w', 'h'].map((k) => <div key={k} className="p-fld"><label>{k.toUpperCase()}</label><NumIn value={m[k]} onChange={(e) => upd({ [k]: +e.target.value })} /></div>)}
          </div>
          </details>}
          {!noBack && <div className="p-btns p-delrow">
            {!ask ? <button className="p-danger" onClick={() => setAsk(true)}>🗑 Modülü sil</button>
              : <><button className="p-danger" onClick={() => { del(); setOpen(null) }}>Evet, sil</button><button onClick={() => setAsk(false)}>Vazgeç</button></>}
          </div>}
        </div>
      )}
    </div>
  )
}
