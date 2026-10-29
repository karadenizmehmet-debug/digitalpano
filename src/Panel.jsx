import { useEffect, useState } from 'react'
import { registry } from './lib/registry.js'
import { THEMES } from './lib/themes.js'
import { login, logout, onUser, saveConfig } from './lib/firebase.js'
import { rows } from './lib/util.js'
import './panel.css'

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
const COND = { sun: 'Güneşli', partly: 'Parçalı bulutlu', cloud: 'Bulutlu', rain: 'Yağmurlu', wind: 'Rüzgarlı', snow: 'Karlı', storm: 'Gök gürültülü', fog: 'Sisli' }

function Field({ f, data, set }) {
  const [k, kind, label, hint] = f
  const v = data[k]
  let input
  if (kind === 'area') input = <textarea rows={6} value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  else if (kind === 'check') return <label className="p-chk"><input type="checkbox" checked={!!v} onChange={(e) => set(k, e.target.checked)} /> {label}</label>
  else if (kind === 'num') input = <input type="number" value={v ?? ''} onChange={(e) => set(k, e.target.value === '' ? '' : +e.target.value)} />
  else if (kind === 'dt') input = <input type="datetime-local" value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  else if (kind === 'sel') input = <select value={v} onChange={(e) => set(k, e.target.value)}>{Object.entries(COND).map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
  else if (kind === 'dgrid') {
    const P = rows({ rows: data.places }), g = data.g || {}
    input = (
      <div className="p-dg">
        {DAYS.map((d, i) => (
          <div key={d}><b>{d}</b>
            {P.map((p, j) => (
              <input key={j} placeholder={p} value={(g[i] || {})[j] || ''}
                onChange={(e) => set('g', { ...g, [i]: { ...(g[i] || {}), [j]: e.target.value } })} />
            ))}
          </div>
        ))}
      </div>
    )
  } else input = <input type="text" value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  return <div className="p-fld"><label>{label}</label>{input}{hint && <small>{hint}</small>}</div>
}

function ModEditor({ m, upd, del, move }) {
  const R = registry[m.type]
  const [open, setOpen] = useState(false)
  const setData = (k, v) => upd({ data: { ...m.data, [k]: v } })
  return (
    <div className={'p-card' + (m.active ? '' : ' p-off')}>
      <div className="p-row" onClick={() => setOpen(!open)}>
        <b>{m.title || R?.label}</b><span className="p-tag">{R?.label || m.type}</span>
        <label className="p-chk" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={m.active} onChange={(e) => upd({ active: e.target.checked })} /> Açık
        </label>
      </div>
      {open && (
        <div className="p-body">
          <div className="p-fld"><label>Başlık</label><input value={m.title || ''} onChange={(e) => upd({ title: e.target.value })} /></div>
          <label className="p-chk"><input type="checkbox" checked={m.showTitle !== false && (m.type !== 'slides' || m.showTitle)} onChange={(e) => upd({ showTitle: e.target.checked })} /> Başlığı göster</label>
          {(R?.fields || []).map((f) => <Field key={f[0]} f={f} data={m.data} set={setData} />)}
          <div className="p-fld"><label>Yazı boyutu (%)</label><input type="number" value={m.fs || 100} onChange={(e) => upd({ fs: +e.target.value })} /></div>
          <div className="p-fld"><label>Renk</label><input type="color" value={m.color || '#0f9b8e'} onChange={(e) => upd({ color: e.target.value })} /></div>
          <div className="p-pos">
            {['x', 'y', 'w', 'h'].map((k) => <div key={k} className="p-fld"><label>{k.toUpperCase()}</label><input type="number" value={m[k]} onChange={(e) => upd({ [k]: +e.target.value })} /></div>)}
          </div>
          <div className="p-btns">
            <button onClick={() => move(-1)}>↑ Yukarı</button><button onClick={() => move(1)}>↓ Aşağı</button>
            <button className="p-danger" onClick={() => confirm('Bu modül silinsin mi?') && del()}>Sil</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Panel({ cfg }) {
  const [user, setUser] = useState(undefined)
  const [draft, setDraft] = useState(null)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('mods')
  const [em, setEm] = useState(''), [pw, setPw] = useState('')

  useEffect(() => onUser(setUser), [])
  useEffect(() => { if (user && !draft) setDraft(JSON.parse(JSON.stringify(cfg))) }, [user, cfg, draft])

  const doLogin = async (e) => {
    e.preventDefault()
    try { await login(em, pw); setMsg('') } catch { setMsg('E-posta veya şifre hatalı.') }
  }
  const publish = async () => {
    try { await saveConfig(draft); setMsg('Yayınlandı ✓ Pano birkaç saniye içinde güncellenir.') }
    catch (e) { setMsg('Kaydedilemedi: ' + e.message) }
  }
  const set = (p) => setDraft((d) => ({ ...d, ...p }))
  const updMod = (i, p) => setDraft((d) => ({ ...d, mods: d.mods.map((m, k) => (k === i ? { ...m, ...p } : m)) }))
  const addMod = (type) => {
    const R = registry[type]
    setDraft((d) => ({ ...d, mods: [...d.mods, { id: 'm' + Date.now().toString(36), type, title: R.label, active: true, x: 480, y: 124, w: 640, h: Math.max(R.minH || 100, 120), color: '#0f9b8e', fs: 100, data: JSON.parse(JSON.stringify(R.def || {})) }] }))
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

  if (user === undefined) return <div className="pnl"><p>Yükleniyor…</p></div>
  if (!user) return (
    <div className="pnl">
      <form className="p-login" onSubmit={doLogin}>
        <h2>Pano Paneli</h2>
        <input type="email" placeholder="E-posta" value={em} onChange={(e) => setEm(e.target.value)} autoComplete="username" />
        <input type="password" placeholder="Şifre" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
        <button className="p-pri">Giriş</button>
        {msg && <p className="p-err">{msg}</p>}
        <a href="#/">← Panoya dön</a>
      </form>
    </div>
  )
  if (!draft) return <div className="pnl"><p>Yükleniyor…</p></div>

  return (
    <div className="pnl">
      <div className="p-top">
        <b>Pano Paneli</b>
        <span><a href="#/">Panoyu aç</a> · <a href="#/panel" onClick={logout}>Çıkış</a></span>
      </div>
      <div className="p-tabs">
        {[['mods', 'Modüller'], ['gen', 'Genel'], ['bak', 'Yedek']].map(([k, l]) => <button key={k} className={tab === k ? 'p-on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === 'gen' && (
        <div className="p-body">
          <div className="p-fld"><label>Okul adı</label><input value={draft.name || ''} onChange={(e) => set({ name: e.target.value })} /></div>
          <div className="p-fld"><label>Slogan</label><input value={draft.slogan || ''} onChange={(e) => set({ slogan: e.target.value })} /></div>
          <div className="p-fld"><label>Şehir (hava durumu için)</label><input value={draft.city || ''} onChange={(e) => set({ city: e.target.value })} /><small>Örn: Konya / Akşehir</small></div>
          <div className="p-fld"><label>Kayan duyurular</label><textarea rows={5} value={draft.ticker || ''} onChange={(e) => set({ ticker: e.target.value })} /><small>Her satır ayrı duyuru</small></div>
          <div className="p-fld"><label>Tema</label>
            <div className="p-themes">{THEMES.map((t, i) => (
              <button key={t[0]} className={draft.theme === i ? 'p-on' : ''} onClick={() => pickTheme(i)}>
                <i style={{ background: t[1] }} /><i style={{ background: t[2] }} /><i style={{ background: t[3] }} />{t[0]}
              </button>))}
            </div>
          </div>
        </div>
      )}
      {tab === 'mods' && (
        <div className="p-body">
          {draft.mods.map((m, i) => <ModEditor key={m.id} m={m} upd={(p) => updMod(i, p)} del={() => delMod(i)} move={(s) => moveMod(i, s)} />)}
          <div className="p-fld"><label>Yeni modül ekle</label>
            <select value="" onChange={(e) => e.target.value && addMod(e.target.value)}>
              <option value="">Seçin…</option>
              {Object.values(registry).map((R) => <option key={R.type} value={R.type}>{R.label}</option>)}
            </select>
          </div>
        </div>
      )}
      {tab === 'bak' && (
        <div className="p-body">
          <p>Ayarları dosya olarak indirip saklayabilir, gerektiğinde geri yükleyebilirsiniz.</p>
          <div className="p-btns"><button onClick={download}>Yedeği indir</button>
            <label className="p-fbtn">Yedeği yükle<input type="file" accept="application/json" hidden onChange={upload} /></label></div>
        </div>
      )}
      <div className="p-bar">
        {msg && <span className="p-m">{msg}</span>}
        <button className="p-pri" onClick={publish}>Yayınla</button>
      </div>
    </div>
  )
}
