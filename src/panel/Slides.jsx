import { useState } from 'react'
import { DUR, NumIn, TONES, Thumb, endOf, isoD, shrink, trD } from './common.jsx'
import { TRANS } from '../lib/trans.js'
import { removeImage, saveImage } from '../lib/firebase.js'

export function DurBar({ x, upd }) {
  const e = endOf(x), dead = e && e <= new Date(isoD(new Date()) + 'T00:00:00')
  return (
    <div className="p-slr">
      <select value={x.d ?? 0} onChange={(ev) => upd({ d: +ev.target.value, on: x.on || isoD(new Date()) })}>{DUR.map(([a, b]) => <option key={a} value={a}>{'Yayın: ' + b}</option>)}</select>
      <button onClick={() => upd({ on: isoD(new Date()) })}>Süreyi yenile</button>
      <small style={{ color: dead ? '#b4232a' : '#5b6b7b' }}>{!e ? 'Süresiz yayında' : dead ? 'Süresi doldu (yayında değil)' : 'Bitiş: ' + trD(new Date(e.getTime() - 86400000))}</small>
    </div>
  )
}

export function SlideCard({ x, i, upd, mv, del, withSec }) {
  const [open, setOpen] = useState(false)
  const img = x.img || x.src, e = endOf(x), dead = e && e <= new Date(isoD(new Date()) + 'T00:00:00')
  const sum = (DUR.find(([a]) => a === (x.d || 0)) || [0, 'Süresiz'])[1] + (e ? (dead ? ' · süresi doldu' : ' · ' + trD(new Date(e.getTime() - 86400000)) + ' bitiş') : '')
  return (
    <div className={'p-slc' + (dead ? ' dead' : '')}>
      <div className="p-slr" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        {img ? <Thumb x={x} /> : <span className="p-th" style={{ display: 'grid', placeItems: 'center' }}>📝</span>}
        <span className="p-ttl"><b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img ? (x.name || 'Görsel') : (x.t || 'Yazılı duyuru')}</b><small style={{ color: dead ? '#b4232a' : '#5b6b7b' }}>{sum}</small></span>
        <button className="p-danger" title="Sil" onClick={(ev) => { ev.stopPropagation(); del(i) }}>🗑</button>
        <span>{open ? '▴' : '▾'}</span>
      </div>
      {open && <>
        {img && <input placeholder="Görsel adı" value={x.name || ''} onChange={(ev) => upd(i, { name: ev.target.value })} />}
        {!img && <>
          <input placeholder="Başlık" value={x.t || ''} onChange={(ev) => upd(i, { t: ev.target.value })} />
          <textarea rows={2} placeholder="Alt yazı (isteğe bağlı)" value={x.s || ''} onChange={(ev) => upd(i, { s: ev.target.value })} />
          <div className="p-slr">
            <select value={x.tone || 'r'} onChange={(ev) => upd(i, { tone: ev.target.value })}>{Object.entries(TONES).map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
            <NumIn title="Yazı boyutu %" value={x.fs || 100} onChange={(ev) => upd(i, { fs: +ev.target.value })} />
          </div>
        </>}
        {withSec && <div className="p-fld"><label>Ekranda kalma süresi (sn) — boşsa genel süre</label><NumIn min="2" value={x.sec || ''} onChange={(ev) => upd(i, { sec: +ev.target.value || 0 })} /></div>}
        <DurBar x={x} upd={(p) => upd(i, p)} />
        <div className="p-btns"><button onClick={() => mv(i, -1)}>↑</button><button onClick={() => mv(i, 1)}>↓</button><button className="p-danger" onClick={() => del(i)}>Sil</button></div>
      </>}
    </div>
  )
}

export function SlidesEditor({ value, set, say, withSec }) {
  const L = value || []
  const [dlg, setDlg] = useState(null)
  const upd = (i, p) => set(L.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const mv = (i, s) => { const a = [...L], j = i + s; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set(a) }
  const del = (i) => {
    if (!confirm('Bu slayt silinsin mi?')) return
    const x = L[i]
    if (x.img) removeImage(x.img).catch(() => {})
    set(L.filter((_, k) => k !== i))
  }
  const save = async () => {
    const f = dlg
    try {
      if (f.kind === 'img') {
        if (!f.file) { say('Önce bir görsel seçin.'); return }
        setDlg({ ...f, busy: true })
        const src = await shrink(f.file), id = 'i' + Date.now().toString(36)
        await saveImage(id, src)
        set([{ img: id, name: f.name.trim() || f.file.name, d: f.d, on: isoD(new Date()) }, ...L])
        say('Görsel eklendi. Yayınla düğmesine basmayı unutmayın.')
      } else {
        if (!f.t.trim()) { say('Başlık yazın.'); return }
        set([{ t: f.t.trim(), s: f.s, tone: f.tone, fs: f.fs, d: f.d, on: isoD(new Date()) }, ...L])
        say('Yazı eklendi. Yayınla düğmesine basmayı unutmayın.')
      }
      setDlg(null)
    } catch (er) { setDlg({ ...f, busy: false }); say('Eklenemedi: ' + er.message) }
  }
  const dd = (p) => setDlg({ ...dlg, ...p })
  return (
    <div className="p-sl">
      <div className="p-two">
        <button onClick={() => setDlg({ kind: 'img', name: '', file: null, d: 7 })}>🖼️ Görsel ekle</button>
        <button onClick={() => setDlg({ kind: 'txt', t: '', s: '', tone: 'b', fs: 100, d: 7 })}>📝 Yazı ekle</button>
      </div>
      {dlg && (
        <div className="p-modal" onClick={() => !dlg.busy && setDlg(null)}>
          <div className="p-mbox" onClick={(e) => e.stopPropagation()}>
            <div className="p-h">{dlg.kind === 'img' ? '🖼️ Görsel ekle' : '📝 Yazı ekle'}</div>
            {dlg.kind === 'img' ? <>
              <div className="p-fld"><label>Başlık</label><input value={dlg.name} onChange={(e) => dd({ name: e.target.value })} placeholder="Örn: Veli toplantısı afişi" /></div>
              <div className="p-fld"><label>Görsel</label>
                <label className="p-fbtn">{dlg.file ? '✓ ' + dlg.file.name : 'Görsel seç'}<input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; if (f) dd({ file: f, name: dlg.name || f.name.replace(/\.[^.]+$/, '') }) }} /></label></div>
            </> : <>
              <div className="p-fld"><label>Başlık</label><input value={dlg.t} onChange={(e) => dd({ t: e.target.value })} /></div>
              <div className="p-fld"><label>Alt yazı (isteğe bağlı)</label><textarea rows={3} value={dlg.s} onChange={(e) => dd({ s: e.target.value })} /></div>
              <div className="p-slr">
                <select value={dlg.tone} onChange={(e) => dd({ tone: e.target.value })}>{Object.entries(TONES).map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
                <NumIn title="Yazı boyutu %" value={dlg.fs} onChange={(e) => dd({ fs: +e.target.value })} />
              </div>
            </>}
            <div className="p-fld"><label>Ne kadar yayında kalsın</label>
              <select value={dlg.d} onChange={(e) => dd({ d: +e.target.value })}>{DUR.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select></div>
            <div className="p-btns">
              <button className="p-pri" disabled={dlg.busy} onClick={save}>{dlg.busy ? 'Yükleniyor…' : 'Kaydet'}</button>
              <button disabled={dlg.busy} onClick={() => setDlg(null)}>Vazgeç</button>
            </div>
          </div>
        </div>
      )}
      {L.length > 0 && <div className="p-h2">Eklenenler ({L.length})</div>}
      {L.map((x, i) => <SlideCard key={i} x={x} i={i} upd={upd} mv={mv} del={del} withSec={withSec} />)}
    </div>
  )
}

export function FsaEditor({ draft, set, say }) {
  const f = draft.fsa || { on: true, every: 15, sec: 10, items: [] }
  const put = (p) => set({ fsa: { ...f, ...p } })
  const sm = draft.mods.find((m) => m.type === 'slides')
  const tick = (i, v) => set({ mods: draft.mods.map((m) => (m === sm ? { ...m, data: { ...m.data, imgs: m.data.imgs.map((x, k) => (k === i ? { ...x, full: v } : x)) } } : m)) })
  return (
    <div className="p-card p-pad">
      <div className="p-h">⭐ Öne çıkan duyurular</div>
      <p className="p-hint">Eklediğiniz görsel veya yazılar belirli aralıkla panoyu tam ekran kaplar, sırayla gösterilir, sonra pano normale döner. Aşağıdaki listeden manşetteki öğeleri de işaretleyip bu ekranda gösterebilirsiniz.</p>
      <label className="p-chk"><input type="checkbox" checked={f.on !== false} onChange={(e) => put({ on: e.target.checked })} /> Öne çıkan duyurular açık</label>
      <div className="p-pos">
        <div className="p-fld"><label>Her … dakikada bir gir</label><NumIn min="1" value={f.every ?? 15} onChange={(e) => put({ every: +e.target.value })} /></div>
        <div className="p-fld"><label>Her öğe … sn kalsın</label><NumIn min="2" value={f.sec || 10} onChange={(e) => put({ sec: +e.target.value })} /></div>
      </div>
      <div className="p-fld"><label>Geçiş efekti</label><select value={f.trans || ''} onChange={(e) => put({ trans: e.target.value })}>{TRANS.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select></div>
      <div className="p-btns"><button className={f.now ? 'p-danger' : ''} onClick={() => put({ now: !f.now })}>{f.now ? 'Sürekli tam ekranı kapat' : 'Şimdi sürekli tam ekran yap'}</button></div>
      <SlidesEditor value={f.items || []} set={(items) => put({ items })} say={say} withSec />
      {sm && <>
        <div className="p-h2">Manşetteki öğeler</div>
        <p className="p-hint">İşaretlediğiniz öğeler yukarıdaki süre ve aralıkla tam ekran gösterilir. Manşette de görünmeye devam ederler.</p>
        {(sm.data?.imgs || []).length === 0 && <p className="p-hint">Manşette öğe yok.</p>}
        {(sm.data?.imgs || []).map((x, i) => <label key={i} className="p-chk"><input type="checkbox" checked={!!x.full} onChange={(e) => tick(i, e.target.checked)} /> {x.img || x.src ? '🖼️ ' + (x.name || 'Görsel') : '📝 ' + (x.t || 'Yazılı duyuru')}</label>)}
      </>}
    </div>
  )
}
