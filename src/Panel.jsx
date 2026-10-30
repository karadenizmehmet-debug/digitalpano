import { useEffect, useState } from 'react'
import { AlertEditor, PwEditor } from './panel/Account.jsx'
import { AnnEditor } from './panel/AnnEditor.jsx'
import { AutoBackups } from './panel/Backups.jsx'
import { DESIGNS, DESIGN_META, GROUPS, THEMES } from './lib/themes.js'
import { FsaEditor } from './panel/Slides.jsx'
import { Mini, NumIn, Thumb, shrink } from './panel/common.jsx'
import { ModEditor, ModList } from './panel/Modules.jsx'
import { SIDE_DSG, reflow, slideFor } from './lib/reflow.js'
import { SpecialEditor } from './panel/SpecialEditor.jsx'
import Stage from './Stage.jsx'
import { fetchServerConfig, login, logout, onUser, removeImage, saveConfig, saveImage } from './lib/firebase.js'
import { minHOf, registry, wantH } from './lib/registry.js'
import './panel.css'

export default function Panel({ cfg, fresh, err }) {
  const [user, setUser] = useState(undefined)
  const [draft, setDraft] = useState(null)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('news')
  const [sub, setSub] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [saved, setSaved] = useState('')
  const [slow, setSlow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setSlow(true), 8000); return () => clearTimeout(t) }, [])
  const [sel, setSel] = useState(null), [showPv, setShowPv] = useState(false), [pk, setPk] = useState(null)
  const [em, setEm] = useState(''), [pw, setPw] = useState('')

  useEffect(() => onUser(setUser), [])
  useEffect(() => { if (user && fresh && !draft) { const d0 = JSON.parse(JSON.stringify(cfg)); (d0.mods || []).forEach((m) => { if (m.type === 'slides' && m.title === 'Hoş Geldiniz') m.title = 'Manşet Haber' }); setDraft(d0); setSaved(JSON.stringify(cfg)) } }, [user, cfg, draft, fresh])

  const doLogin = async (e) => {
    e.preventDefault()
    try { await login(em, pw); setMsg('') } catch { setMsg('E-posta veya şifre hatalı.') }
  }
  const publish = async () => {
    try {
      const d = { ...draft }
      if (d.al && d.al.on && d.al.pend) d.al = { ...d.al, at: Date.now(), pend: 0 }  // başlangıç anı yayın anıdır
      const sv = await fetchServerConfig().catch(() => null)   // başka cihazdan yapılmış yayını yanlışlıkla ezme
      if (sv && sv.rev && sv.rev !== draft.rev && !confirm('Bu ayarlar başka bir cihazdan (ör. telefon/bilgisayar) daha yeni yayınlanmış. Yine de buradakilerle üzerine yazılsın mı?\n\nİptal derseniz sayfayı yenileyip güncel hâli açın.')) return
      d.rev = Date.now()
      await saveConfig(d); setDraft(d); setSaved(JSON.stringify(d)); setMsg('Yayınlandı ✓ Pano birkaç saniye içinde güncellenir.') }
    catch (e) { setMsg('Kaydedilemedi: ' + e.message) }
  }
  const set = (p) => setDraft((d) => ({ ...d, ...p }))
  // Tasarım seçimi: "Yayın Ekranı" uygun modülleri açar, diğerlerini kapatır; başka tasarıma geçince eski durum geri gelir
  const SIDE_KEEP = { 12: ['weather', 'bell', 'duty', 'pray'], 13: ['duty', 'bell', 'pray', 'quote'], 14: ['duty', 'bell', 'pray', 'weather'] }
  const chooseDesign = (i) => setDraft((d) => {
    const cur = d.design || 0
    if (i === cur) return d
    const o = { ...d, design: i }
    let ms = d.mods
    if (SIDE_KEEP[cur] && d.dsgBak) { ms = ms.map((m) => (m.id in d.dsgBak ? { ...m, active: d.dsgBak[m.id] } : m)); o.dsgBak = null; o.mods = ms }
    if (SIDE_KEEP[i]) {
      const keep = SIDE_KEEP[i]
      o.dsgBak = Object.fromEntries(ms.map((m) => [m.id, m.active !== false]))
      o.mods = ms.map((m) => (m.type === 'slides' || m.type === 'clock' ? m : { ...m, active: keep.includes(m.type) }))
      o.sideOrder = keep.map((t) => o.mods.find((m) => m.type === t)).filter(Boolean).map((m) => m.id)
    }
    return o
  })
  const updMod = (i, p) => setDraft((d) => {
    const mods = d.mods.map((m, k) => (k === i ? { ...m, ...p } : { ...m }))
    if ('showTitle' in p) {  // başlık açılınca modül içeriğe yetecek kadar büyür
      const m = mods[i]; m.h = Math.max(m.h, minHOf(m))
      if (d.autoFlow !== false) reflow(mods, m, minHOf, wantH)
    }
    return { ...d, mods }
  })
  const addMod = (type) => {
    const R = registry[type]
    setDraft((d) => {
      const mods = [...d.mods, { id: 'm' + Date.now().toString(36), type, title: R.label, active: true, x: 380, y: 124, w: 840, h: Math.max(R.minH || 100, 120), color: '#0f9b8e', fs: 100, data: JSON.parse(JSON.stringify(R.def || {})) }].map((m) => ({ ...m }))
      if (d.autoFlow !== false) reflow(mods, mods[mods.length - 1], minHOf, wantH)
      return { ...d, mods }
    })
  }
  const delMod = (i) => setDraft((d) => ({ ...d, mods: d.mods.filter((_, k) => k !== i) }))
  const moveMod = (i, s) => setDraft((d) => {
    const a = [...d.mods], j = i + s
    if (j < 0 || j >= a.length) return d
    ;[a[i], a[j]] = [a[j], a[i]]
    return { ...d, mods: a }
  })
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 1)], { type: 'application/json' }))
    a.download = 'pano-yedek-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
  }
  const upload = (e) => {
    const f = e.target.files[0]; if (!f) return
    f.text().then((t) => { try { setDraft(JSON.parse(t)); setMsg('Yedek yüklendi. Yayınlamayı unutmayın.') } catch { setMsg('Dosya okunamadı.') } })
  }
  const pickTheme = (i) => { const t = THEMES[i]; set({ theme: i, bg: t[1], c1: t[2], c2: t[3], c3: t[4] }) }

  const dirty = !!draft && JSON.stringify(draft) !== saved
  const view = tab === 'set' ? sub : tab
  const SETT = ['set', 'mods', 'lay']
  const goMod = (id) => { setTab('mods'); setOpenId(id); window.scrollTo(0, 0) }

  if (user === undefined) return <div className="pnl"><p>Yükleniyor…</p></div>
  if (!user) return (
    <div className="pnl p-lg">
      <div className="p-lgc">
        <div className="p-lgi">📺</div>
        <h1>Dijital Pano</h1>
        <p className="p-lgs">Hoş geldiniz</p>
        <small className="p-lgo">{cfg?.name || ''}</small>
        <form onSubmit={doLogin}>
          <input type="email" placeholder="E-posta" value={em} onChange={(e) => setEm(e.target.value)} autoComplete="username" />
          <input type="password" placeholder="Şifre" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          <button className="p-pri">Giriş yap</button>
          {msg && <p className="p-err">{msg}</p>}
        </form>
        <a className="p-lgb" href="#/">← Panoya dön</a>
      </div>
      <div className="p-lgf">Mehmet Karadeniz tarafından geliştirilmiştir<br /><span>© 2026-2027 · Dijital Pano Sistemi</span></div>
    </div>
  )
  if (!draft) return <div className="pnl"><p>Ayarlar sunucudan alınıyor…</p>{slow && <p className="p-err">Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin. Kayıtlı ayarlarınız bozulmaması için bağlantı gelene kadar düzenleme açılmaz.{err ? ' (Hata: ' + err + ')' : ''}</p>}</div>

  return (
    <div className="pnl">
      <div className="p-top">
        <div className="p-tt"><b>Pano Paneli</b><small>{dirty ? '● Yayınlanmamış değişiklik var' : '✓ Pano güncel'}</small></div>
        <button className="p-ib" title="Yayınlamadan önce önizle" onClick={() => setShowPv(true)}>👁</button>
        <a className="p-ib" href="#/" title="Panoyu aç">📺</a>
        <a className="p-ib" href="#/panel" onClick={logout} title="Çıkış">🚪</a>
        <button className={'p-pri p-pub' + (dirty ? ' p-dirty' : '')} onClick={publish}>Yayınla</button>
      </div>
      {pk && (
        <div className="p-modal" onClick={() => setPk(null)}>
          <div className="p-mbox" onClick={(e) => e.stopPropagation()}>
            <div className="p-h">{pk === 'pal' ? '🎨 Renk paleti seçin' : '🖼️ Tasarım seçin'}</div>
            {pk === 'pal' ? (
              <div className="p-themes">{THEMES.map((t, i) => (
                <button key={t[0]} className={(draft.theme || 0) === i ? 'p-on' : ''} onClick={() => { pickTheme(i); setPk(null) }}>
                  <i style={{ background: t[1] }} /><i style={{ background: t[2] }} /><i style={{ background: t[3] }} />{t[0]}
                </button>))}
              </div>
            ) : <>
              {GROUPS.map((g) => {
                const ids = DESIGNS.map((_, i) => i).filter((i) => DESIGN_META[i] && DESIGN_META[i][0] === g)
                return ids.length ? <div key={g}><div className="p-h2">{g}</div>
                  {ids.map((i) => (
                    <button key={i} className={'p-dsg' + ((draft.design || 0) === i ? ' p-on' : '')} onClick={() => { chooseDesign(i); setPk(null) }}>
                      <Mini i={i} /><span><b>{DESIGNS[i][0]}</b><small>{DESIGNS[i][1]}</small></span>
                    </button>))}
                </div> : null
              })}
            </>}
            <button onClick={() => setPk(null)}>Kapat</button>
          </div>
        </div>)}
      {showPv && (
        <div className="p-modal p-big" onClick={() => setShowPv(false)}>
          <div className="p-mbox" onClick={(e) => e.stopPropagation()}>
            <div className="p-h">👁 Yayınlanmadan önce önizleme</div>
            <div className="stg-pv"><Stage preview cfg={draft} /></div>
            <small>{dirty ? 'Henüz yayınlanmamış değişikliklerle böyle görünür.' : 'Şu an yayındaki hâli.'} Acil duyuru ve özel gün efektleri burada gösterilmez; özel günlerin kendi Önizle düğmesi vardır.</small>
            <div className="p-btns">{dirty && <button className="p-pri" onClick={() => { setShowPv(false); publish() }}>Yayınla</button>}<button onClick={() => setShowPv(false)}>Kapat</button></div>
          </div>
        </div>
      )}
      {msg && <div className="p-toast" onClick={() => setMsg('')}>{msg}</div>}
      {tab === 'news' && (() => { const i = draft.mods.findIndex((x) => x.type === 'slides'); const m = draft.mods[i]; return (
        <div className="p-body">
          <p className="p-hint">📐 Manşet alanı sabit boyuttadır: <b>{slideFor(draft.design).w} × {slideFor(draft.design).h} piksel</b>. Görselleri bu ölçüde hazırlarsanız tam oturur.</p>
          {m ? <ModEditor key={m.id} m={m} upd={(p) => updMod(i, p)} del={() => delMod(i)} move={(sd) => moveMod(i, sd)} say={setMsg} root={draft} setRoot={set} open setOpen={() => {}} noBack />
            : <div className="p-card p-pad">Manşet haber modülü yok. Ayarlar > Modüller'den "Manşet haber" ekleyin.</div>}
        </div>) })()}
      {tab === 'fsa' && <div className="p-body"><FsaEditor draft={draft} set={set} say={setMsg} /></div>}
      {tab === 'duy' && (
        <div className="p-body">
          <AnnEditor draft={draft} set={set} />
        </div>
      )}
      {tab === 'set' && !sub && (
        <div className="p-body"><div className="p-grid">
          {[['gen', '🏫', 'Genel ayarlar'], ['thm', '🎨', 'Tema ve renkler'], ['mods', '🧩', 'Modüller'], ['lay', '🖼️', 'Düzen'], ['sd', '📅', 'Özel günler'], ['bak', '💾', 'Yedek'], ['pw', '🔑', 'Şifre']].map(([k, i, l]) => <button key={k} onClick={() => { if (k === 'mods' || k === 'lay') { setTab(k); setOpenId(null) } else setSub(k); window.scrollTo(0, 0) }}><span>{i}</span>{l}</button>)}
        </div></div>
      )}
      {SETT.includes(tab) && !(tab === 'set' && !sub) && !(tab === 'mods' && openId) && <div className="p-sub"><button onClick={() => { setTab('set'); setSub(null); setOpenId(null); window.scrollTo(0, 0) }}>← Ayarlar</button></div>}
      {view === 'gen' && (
        <div className="p-body">
          <div className="p-fld"><label>Okul adı</label><input value={draft.name || ''} onChange={(e) => set({ name: e.target.value })} /></div>
          <div className="p-fld"><label>Okul logosu</label>
            <div className="p-slr">
              {(draft.logoId || draft.logo) ? <><Thumb x={{ src: draft.logo, img: draft.logoId }} /><button onClick={() => { if (draft.logoId) removeImage(draft.logoId).catch(() => {}); set({ logoId: '', logo: '' }) }}>Kaldır</button></>
                : <label className="p-fbtn">+ Logo yükle<input type="file" accept="image/*" hidden onChange={async (e) => {
                  const f = e.target.files[0]; e.target.value = ''
                  if (!f) return
                  try {
                    setMsg('Logo hazırlanıyor…')
                    const src = await shrink(f, 300, 'image/png', 250000), id = 'logo' + Date.now().toString(36)
                    await saveImage(id, src)
                    set({ logoId: id, logo: '' })
                    setMsg('Logo yüklendi. Yayınla düğmesine basmayı unutmayın.')
                  } catch (er) { setMsg('Logo yüklenemedi: ' + er.message) }
                }} /></label>}
            </div>
            <small>Başlığın solunda görünür, otomatik küçültülür.</small>
          </div>
          <div className="p-fld"><label>Slogan</label><input value={draft.slogan || ''} onChange={(e) => set({ slogan: e.target.value })} /></div>
          <div className="p-fld"><label>Gece modu</label>
            <select value={draft.nmMode || 'auto'} onChange={(e) => set({ nmMode: e.target.value })}>
              <option value="auto">Otomatik (ders saatlerine göre)</option>
              <option value="day">Her zaman normal</option>
              <option value="night">Her zaman gece modu</option>
            </select>
            <small>Otomatik: ilk dersten önce ve son dersten sonra ekran kararır, yalnızca saat görünür. Acil duyuru ve özel gün "şimdi aç" bunun üstünde görünür.</small>
          </div>
          {(draft.nmMode || 'auto') === 'auto' && (
            <div className="p-pos">
              <div className="p-fld"><label>İlk dersten önce (dk)</label><NumIn value={draft.nmPre ?? 60} onChange={(e) => set({ nmPre: +e.target.value })} /></div>
              <div className="p-fld"><label>Son dersten sonra (dk)</label><NumIn value={draft.nmPost ?? 60} onChange={(e) => set({ nmPost: +e.target.value })} /></div>
              <label className="p-chk"><input type="checkbox" checked={draft.nmWe !== false} onChange={(e) => set({ nmWe: e.target.checked })} /> Hafta sonu gece modu</label>
            </div>
          )}
        </div>
      )}
      {view === 'thm' && (
        <div className="p-body"><div className="p-card p-pad">
          <div className="p-h">🎨 Tema ve renkler</div>
          <div className="p-fld"><label>Renk paleti</label>
            <button className="p-pick" onClick={() => setPk('pal')}>
              <span className="p-sw">{[1, 2, 3].map((n) => <i key={n} style={{ background: THEMES[draft.theme || 0][n] }} />)}</span>
              <b>{THEMES[draft.theme || 0][0]}</b><em>Değiştir ›</em>
            </button>
          </div>
          <div className="p-btns"><button onClick={() => { chooseDesign(0); set({ theme: 0 }) }}>↩ Varsayılana dön (Klasik tasarım, Sade palet)</button></div>
          <div className="p-fld"><label>Tasarım</label>
            <button className="p-pick" onClick={() => setPk('dsg')}>
              <span className="p-sw">🖼️</span><b>{DESIGNS[draft.design || 0][0]}</b><em>Değiştir ›</em>
            </button>
            <small>Tasarım yalnızca görünümü değiştirir, bilgileriniz aynen kalır. İstediğiniz zaman eskisine dönebilirsiniz.</small>
          </div>
        </div></div>
      )}
      {view === 'mods' && (
        <div className="p-body">
          {!openId && <><ModList pre={[{ i: '📢', t: 'Duyurular', s: 'Kayan yazı', go: () => { setTab('duy'); window.scrollTo(0, 0) } }, { i: '🚨', t: 'Acil duyuru', s: 'Tam ekran uyarı', go: () => { setTab('al'); window.scrollTo(0, 0) } }]} mods={draft.mods} go={setOpenId} toggle={(i, v) => updMod(i, { active: v })} /></>}
          {draft.mods.map((m, i) => openId === m.id && <ModEditor key={m.id} m={m} upd={(p) => updMod(i, p)} del={() => delMod(i)} move={(s) => moveMod(i, s)} say={setMsg} root={draft} setRoot={set} open={openId === m.id} setOpen={setOpenId} />)}
          {!openId && <div className="p-card p-pad"><div className="p-h">➕ Yeni modül ekle</div>
            <select value="" onChange={(e) => { if (e.target.value) { addMod(e.target.value); window.scrollTo(0, 0) } }}>
              <option value="">Seçin…</option>
              {Object.values(registry).map((R) => <option key={R.type} value={R.type}>{R.label}</option>)}
            </select>
          </div>}
        </div>
      )}
      {view === 'lay' && (
        <div className="p-body">
          {SIDE_DSG[draft.design] && (() => {
            const hasStrip = SIDE_DSG[draft.design].strip
            const stripM = !hasStrip || draft.stripId === 'none' ? null : draft.mods.find((m) => (draft.stripId ? m.id === draft.stripId : m.type === 'quote'))
            const side = draft.mods.filter((m) => m.type !== 'slides' && m.type !== 'clock' && m !== stripM)
            const ord = draft.sideOrder || []
            const list = [...side].sort((a, b) => { const ia = ord.indexOf(a.id), ib = ord.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) })
            const ids = list.map((m) => m.id)
            const mv = (i, d) => { const j = i + d; if (j < 0 || j >= ids.length) return; const a = [...ids]; [a[i], a[j]] = [a[j], a[i]]; set({ sideOrder: a }) }
            const tg = (id, on) => set({ mods: draft.mods.map((m) => (m.id === id ? { ...m, active: on } : m)), sideOrder: ids })
            const pickStrip = (id) => { if (id === 'none') set({ stripId: 'none' }); else set({ stripId: id, mods: draft.mods.map((m) => (m.id === id ? { ...m, active: true } : m)) }) }
            return (
              <div className="p-card p-pad">{hasStrip && <><div className="p-h">📺 Manşet altı şeridi</div>
                <small>Manşetin altındaki boşlukta görünecek modül:</small>
                <select value={stripM ? stripM.id : 'none'} onChange={(e) => pickStrip(e.target.value)}>
                  <option value="none">(Boş bırak)</option>
                  {draft.mods.filter((m) => m.type !== 'slides' && m.type !== 'clock').map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select></>}
                <div className="p-h" style={{ marginTop: hasStrip ? 14 : 0 }}>📺 Yan panel modülleri</div>
                <small>İşaretlediğiniz modüller yan panelde yukarıdan aşağıya bu sırayla görünür. Çok modül seçerseniz birbirine sıkışır.</small>
                {list.map((m, i) => (
                  <div key={m.id} className="p-slr" style={{ padding: '6px 0' }}>
                    <label className="p-chk" style={{ flex: 1 }}><input type="checkbox" checked={m.active !== false} onChange={(e) => tg(m.id, e.target.checked)} /> {m.title}</label>
                    <button onClick={() => mv(i, -1)} disabled={i === 0}>▲</button><button onClick={() => mv(i, 1)} disabled={i === list.length - 1}>▼</button>
                  </div>))}
              </div>)
          })()}
          <div className="p-pvwrap">
            <Stage preview cfg={draft}
              edit={SIDE_DSG[draft.design] ? undefined : { sel, onSelect: setSel, onChange: (mods) => set({ mods }) }} />
          </div>
          {SIDE_DSG[draft.design] ? <p className="p-hint">Bu tasarımda yerleşim otomatiktir: yukarıdaki önizleme panoda göründüğü gibidir. Modülleri üstteki kutudan açıp kapatın ve ▲▼ ile sıralayın. Elle sürükleme için başka bir tasarım seçin (Klasik gibi).</p> : <>
          <p className="p-hint">Modülü sürükleyip taşıyın, sağ alt köşedeki turuncu kareden boyutlandırın (boyutlandırdığınız modülün yüksekliği korunur). Bırakınca sütuna oturur{draft.autoFlow === false ? '' : ' ve boşluklar otomatik düzenlenir'}.</p>
          <label className="p-chk"><input type="checkbox" checked={draft.autoFlow !== false} onChange={(e) => set({ autoFlow: e.target.checked })} /> Otomatik yerleşim</label>
          <div className="p-btns">
            <button onClick={() => { const mods = draft.mods.map((m) => { const c = { ...m }; delete c.fixH; return c }); reflow(mods, null, minHOf, wantH); set({ mods }) }}>Hepsini otomatik düzenle</button>
            <button onClick={() => { const mods = draft.mods.map((m) => { const c = { ...m }; delete c.fixH; if (c.type !== 'slides' && c.type !== 'clock') c.showTitle = true; return c }); reflow(mods, null, minHOf, wantH); set({ mods }) }}>Tüm başlıkları göster</button>
          </div>
          {sel && draft.mods.find((m) => m.id === sel) && (
            <div className="p-btns">
              <b>{draft.mods.find((m) => m.id === sel).title}</b>
              <button onClick={() => { const m = draft.mods.find((x) => x.id === sel); set({ mods: draft.mods.map((x) => (x.id === sel ? { ...x, active: !m.active } : x)) }) }}>
                {draft.mods.find((m) => m.id === sel).active ? 'Gizle' : 'Göster'}
              </button>
            </div>
          )}
          </>}
        </div>
      )}
      {view === 'sd' && <SpecialEditor list={draft.sd} set={(sd) => set({ sd })} say={setMsg} cfg={draft} />}
      {view === 'al' && <AlertEditor al={draft.al} set={(al) => set({ al })} />}
      {view === 'pw' && <PwEditor say={setMsg} />}
      {view === 'bak' && (
        <div className="p-body">
          <p>Ayarları dosya olarak indirip saklayabilir, gerektiğinde geri yükleyebilirsiniz.</p>
          <div className="p-btns"><button onClick={download}>Yedeği indir</button>
            <label className="p-fbtn">Yedeği yükle<input type="file" accept="application/json" hidden onChange={upload} /></label></div>
          <AutoBackups say={setMsg} onLoad={(c) => { setDraft(c); setMsg('Yedek taslağa yüklendi. Kontrol edin, sonra Yayınla\'ya basın.') }} />
        </div>
      )}
      <nav className="p-nav">
        {[['news', '📰', 'Manşet'], ['duy', '📢', 'Duyuru'], ['fsa', '⭐', 'Öne Çıkan'], ['al', '🚨', 'Acil'], ['set', '⚙️', 'Ayarlar']].map(([k, i, l]) => <button key={k} className={(k === 'set' ? SETT.includes(tab) : tab === k) ? 'p-on' : ''} onClick={() => { setTab(k); if (k === 'set') { setOpenId(null); setSub(null) }; window.scrollTo(0, 0) }}><span>{i}</span>{l}</button>)}
      </nav>
    </div>
  )
}

