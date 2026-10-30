import { useState } from 'react'
import { NumIn, Thumb, shrink } from './common.jsx'
import Stage from '../Stage.jsx'
import { removeImage, saveImage } from '../lib/firebase.js'


export function SpecialEditor({ list, set, say, cfg }) {
  const L = list || []
  const upd = (i, p) => set(L.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const live = L.findIndex((d) => d.now)
  const [op, setOp] = useState(null), [pv, setPv] = useState(null)
  const pickImg = async (i, e) => {
    const f = e.target.files[0]; e.target.value = ''
    if (!f) return
    try {
      say('Görsel hazırlanıyor…')
      const src = await shrink(f), id = 'i' + Date.now().toString(36)
      await saveImage(id, src)
      if (L[i].imgId) removeImage(L[i].imgId).catch(() => {})
      upd(i, { imgId: id, img: '' })
      say('Görsel yüklendi. Yayınla düğmesine basmayı unutmayın.')
    } catch (er) { say('Görsel yüklenemedi: ' + er.message) }
  }
  const dropImg = (i) => { if (L[i].imgId) removeImage(L[i].imgId).catch(() => {}); upd(i, { imgId: '', img: '' }) }
  return (
    <div className="p-body">
      <p className="p-hint">Gün gelince pano o gün tam ekran gösterir. Görsel eklenirse yalnızca görsel, eklenmezse yazı gösterilir.</p>
      <div className="p-two"><button style={{ gridColumn: '1 / 3' }} onClick={() => { const id = 's' + Date.now().toString(36); set([{ id, date: '', title: '', sub: '', fs: 100, on: true, now: false, conf: false, iv: 0, ds: 30 }, ...L]); setOp(id); window.scrollTo(0, 0) }}>+ Özel gün ekle</button></div>
      {L.map((d, i) => {
        const o = op === (d.id || i), ttl = (d.title || '').replace(/\n/g, ' ') || '(başlıksız)'
        return (
        <div key={d.id || i} className={'p-slc' + (d.on === false ? ' dead' : '')}>
          <div className="p-slr" onClick={() => setOp(o ? null : (d.id || i))} style={{ cursor: 'pointer' }}>
            <span className="p-th p-dt">{d.date || '—'}</span>
            <span className="p-tx"><b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ttl}</b><small style={{ color: d.now ? '#b4232a' : '#5b6b7b' }}>{d.now ? 'Şu an tam ekranda' : d.on === false ? 'Kapalı' : (d.img || d.imgId ? 'Görsel' : 'Yazı') + (d.conf ? ' · konfeti' : '')}</small></span>
            <label className="p-sw" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={d.on !== false} onChange={(e) => upd(i, { on: e.target.checked })} /><i /></label>
            <button className="p-danger" onClick={(ev) => { ev.stopPropagation(); if (!confirm('Bu özel gün silinsin mi?')) return; if (d.imgId) removeImage(d.imgId).catch(() => {}); set(L.filter((_, k) => k !== i)) }}>🗑</button>
            <span>{o ? '▴' : '▾'}</span>
          </div>
          {o && <>
          <div className="p-fld"><label>Tarih (GG.AA)</label><input value={d.date || ''} onChange={(e) => upd(i, { date: e.target.value })} placeholder="29.10" /></div>
          <div className="p-fld"><label>Başlık</label><textarea rows={2} value={d.title || ''} onChange={(e) => upd(i, { title: e.target.value })} /><small>Enter ile alt satıra geçebilirsiniz</small></div>
          <div className="p-fld"><label>Alt metin</label><textarea rows={2} value={d.sub || ''} onChange={(e) => upd(i, { sub: e.target.value })} /></div>
          <div className="p-fld"><label>Başlık boyutu: %{d.fs || 100}</label><input type="range" min="40" max="300" step="5" value={d.fs || 100} onChange={(e) => upd(i, { fs: +e.target.value })} /></div>
          <div className="p-fld"><label>Alt metin boyutu: %{d.fs2 || d.fs || 100}</label><input type="range" min="40" max="300" step="5" value={d.fs2 || d.fs || 100} onChange={(e) => upd(i, { fs2: +e.target.value })} /></div>
          <div className="p-pos">
            <div className="p-fld"><label>Her … dk</label><NumIn value={d.iv || 0} onChange={(e) => upd(i, { iv: +e.target.value })} /></div>
            <div className="p-fld"><label>… sn göster</label><NumIn value={d.ds || 30} onChange={(e) => upd(i, { ds: +e.target.value })} /></div>
          </div>
          <small>Dakika 0 ise gün boyu sürekli tam ekran. Örn. 10 dakikada bir 30 sn yazarsanız pano arada normale döner.</small>
          <div className="p-slr">
            {(d.img || d.imgId) ? <><Thumb x={{ src: d.img, img: d.imgId }} /><button onClick={() => dropImg(i)}>Görseli kaldır</button></>
              : <label className="p-fbtn">+ Görsel<input type="file" accept="image/*" hidden onChange={(e) => pickImg(i, e)} /></label>}
          </div>
          <div className="p-fld"><label>Efektler</label>
            <div className="p-chips">{[['conf', '🎊 Konfeti'], ['fw', '🎆 Havai fişek'], ['bl', '🎈 Balon'], ['st', '✨ Yıldız'], ['sn', '❄️ Kar'], ['fl', '🇹🇷 Bayrak'], ['ht', '❤️ Kalp'], ['pt', '🌸 Yaprak'], ['fr', '💡 Işıklı çerçeve']].map(([k, l]) => <button key={k} className={d[k] ? 'p-on' : ''} onClick={() => upd(i, { [k]: !d[k] })}>{l}</button>)}</div></div>
          {!(d.img || d.imgId) && <>
            <div className="p-fld"><label>Arka plan rengi</label>
              <div className="p-sws">
                <button className={!d.bg ? 'p-on' : ''} onClick={() => upd(i, { bg: '' })}>Varsayılan</button>
                {['#c8102e', '#0b3d91', '#0f7a4f', '#d9680b', '#6b46c1', '#111827'].map((c) => <button key={c} className={d.bg === c ? 'p-on' : ''} style={{ background: c }} onClick={() => upd(i, { bg: c })} />)}
                <input type="color" value={d.bg || '#0b3d91'} onChange={(e) => upd(i, { bg: e.target.value })} />
              </div></div>
            <div className="p-fld"><label>Arka plan hareketi</label>
              <select value={d.bgfx || ''} onChange={(e) => upd(i, { bgfx: e.target.value, bg: d.bg || (e.target.value === 'fade' ? '#c8102e' : d.bg) })}>
                <option value="">Sabit</option><option value="fade">Renkten renge geçiş</option><option value="rain">Gökkuşağı</option><option value="pulse">Nabız (parlayıp sönme)</option><option value="shine">Parıltı (kayan ışık)</option>
              </select></div>
            {d.bgfx === 'fade' && <div className="p-fld"><label>İkinci renk</label><input type="color" value={d.bg2 || '#0b3d91'} onChange={(e) => upd(i, { bg2: e.target.value })} /></div>}
          </>}
          <div className="p-btns">
            <button className="p-pri" onClick={() => setPv(i)}>👁 Önizle</button>
            <button className={d.now ? 'p-danger' : ''} onClick={() => set(L.map((x, k) => ({ ...x, now: k === i ? !x.now : false })))}>{d.now ? 'Tam ekranı kapat' : 'Şimdi tam ekran aç'}</button>
          </div>
          </>}
        </div>)
      })}
      {pv !== null && L[pv] && (
        <div className="p-modal" onClick={() => setPv(null)}>
          <div className="p-mbox" onClick={(e) => e.stopPropagation()}>
            <div className="p-h">👁 Önizleme</div>
            <div className="stg-pv"><Stage preview cfg={cfg} forceSp={L[pv]} /></div>
            <small>Pano bu özel günde böyle görünür. Değişiklik yapıp tekrar açarak yeniden bakabilirsiniz.</small>
            <div className="p-btns"><button onClick={() => setPv(null)}>Kapat</button></div>
          </div>
        </div>
      )}
      {live >= 0 && <p className="p-hint">Şu an "Şimdi tam ekran" açık: Yayınla'dan sonra pano tam ekrana geçer.</p>}
    </div>
  )
}

export function DutyPaste({ P, g, set }) {
  const [t, setT] = useState('')
  const go = () => {
    const L = t.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 5)
    const N = { ...g }
    L.forEach((l, i) => {
      let c = l.split(/\t|;|\|/).map((x) => x.trim())
      if (c.length > P.length && /^(pt|pa|sa|ça|çar|pe|per|cu)/i.test(c[0])) c = c.slice(1)
      N[i] = Object.fromEntries(P.map((_, j) => [j, c[j] || '']))
    })
    set(N); setT('')
  }
  return (
    <details className="p-adv"><summary>Toplu yapıştır</summary>
      <textarea rows={5} value={t} onChange={(e) => setT(e.target.value)} placeholder={'Her satır bir gün (Pzt, Sal, Çar, Per, Cum).\nİsimleri yerlerin sırasına göre ; ile ayırın:\nÖmer OKUR; Ayten CEYLAN'} />
      <div className="p-btns"><button className="p-pri" disabled={!t.trim() || !P.length} onClick={go}>Tabloya aktar</button></div>
      <small>Excel'den kopyalayıp da yapıştırabilirsiniz.</small>
    </details>
  )
}
