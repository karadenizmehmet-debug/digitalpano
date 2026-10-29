import { useEffect, useState } from 'react'
import { registry } from './lib/registry.js'
import { THEMES } from './lib/themes.js'
import { login, logout, onUser, saveConfig, saveImage, removeImage, loadImage } from './lib/firebase.js'
import { rows } from './lib/util.js'
import { alertStatus } from './lib/alert.js'
import './panel.css'

const ALI = ['🚨','⚠️','🔥','🌍','🌧️','❄️','⚡','🌪️','📢','🏥','🚑','🚒','🚫','⛔','😷','🚸','🔒','📣','ℹ️','✅','🕌','🎓','🚌','⏰']
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
const COND = { sun: 'Güneşli', partly: 'Parçalı bulutlu', cloud: 'Bulutlu', rain: 'Yağmurlu', wind: 'Rüzgarlı', snow: 'Karlı', storm: 'Gök gürültülü', fog: 'Sisli' }


const TONES = { r: 'Kırmızı', b: 'Mavi', g: 'Yeşil', o: 'Turuncu', p: 'Mor', k: 'Siyah' }

// Görseli küçültüp JPEG'e çevirir (Firestore belgesi 1 MB'ı geçmesin)
async function shrink(file) {
  const bmp = await createImageBitmap(file)
  let max = 1280, q = 0.8, out = ''
  for (let i = 0; i < 5; i++) {
    const r = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r)
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    out = c.toDataURL('image/jpeg', q)
    if (out.length < 700000) return out
    max *= 0.8; q -= 0.08
  }
  throw new Error('Görsel çok büyük')
}

function Thumb({ x }) {
  const [src, setSrc] = useState(x.src || '')
  useEffect(() => { if (!x.src && x.img) loadImage(x.img).then(setSrc).catch(() => {}) }, [x.img, x.src])
  return src ? <img src={src} className="p-th" /> : <span className="p-th" />
}

function SlidesEditor({ value, set, say }) {
  const L = value || []
  const upd = (i, p) => set(L.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const mv = (i, s) => { const a = [...L], j = i + s; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set(a) }
  const del = (i) => {
    if (!confirm('Bu slayt silinsin mi?')) return
    const x = L[i]
    if (x.img) removeImage(x.img).catch(() => {})
    set(L.filter((_, k) => k !== i))
  }
  const addImg = async (e) => {
    const f = e.target.files[0]; e.target.value = ''
    if (!f) return
    try {
      say('Görsel hazırlanıyor…')
      const src = await shrink(f), id = 'i' + Date.now().toString(36)
      await saveImage(id, src)
      set([...L, { img: id, name: f.name }])
      say('Görsel yüklendi. Yayınla düğmesine basmayı unutmayın.')
    } catch (er) { say('Görsel yüklenemedi: ' + er.message) }
  }
  return (
    <div className="p-sl">
      {L.map((x, i) => (
        <div key={i} className="p-slc">
          {(x.img || x.src)
            ? <div className="p-slr"><Thumb x={x} /><span>{x.name || 'Görsel'}</span></div>
            : <>
                <input placeholder="Başlık" value={x.t || ''} onChange={(e) => upd(i, { t: e.target.value })} />
                <textarea rows={2} placeholder="Alt yazı (isteğe bağlı)" value={x.s || ''} onChange={(e) => upd(i, { s: e.target.value })} />
                <div className="p-slr">
                  <select value={x.tone || 'r'} onChange={(e) => upd(i, { tone: e.target.value })}>{Object.entries(TONES).map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
                  <input type="number" title="Yazı boyutu %" value={x.fs || 100} onChange={(e) => upd(i, { fs: +e.target.value })} />
                </div>
              </>}
          <div className="p-btns"><button onClick={() => mv(i, -1)}>↑</button><button onClick={() => mv(i, 1)}>↓</button><button className="p-danger" onClick={() => del(i)}>Sil</button></div>
        </div>
      ))}
      <div className="p-btns">
        <button onClick={() => set([...L, { t: 'Duyuru başlığı', s: '', tone: 'b', fs: 100 }])}>+ Yazılı slayt</button>
        <label className="p-fbtn">+ Görsel<input type="file" accept="image/*" hidden onChange={addImg} /></label>
      </div>
    </div>
  )
}

function Field({ f, data, set, say }) {
  const [k, kind, label, hint] = f
  const v = data[k]
  let input
  if (kind === 'area') input = <textarea rows={6} value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  else if (kind === 'check') return <label className="p-chk"><input type="checkbox" checked={!!v} onChange={(e) => set(k, e.target.checked)} /> {label}</label>
  else if (kind === 'num') input = <input type="number" value={v ?? ''} onChange={(e) => set(k, e.target.value === '' ? '' : +e.target.value)} />
  else if (kind === 'dt') input = <input type="datetime-local" value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  else if (kind === 'sel') input = <select value={v} onChange={(e) => set(k, e.target.value)}>{Object.entries(COND).map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
  else if (kind === 'slides') input = <SlidesEditor value={v} set={(x) => set(k, x)} say={say} />
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

function ModEditor({ m, upd, del, move, say }) {
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
          {(R?.fields || []).map((f) => <Field key={f[0]} f={f} data={m.data} set={setData} say={say} />)}
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


function SpecialEditor({ list, set, say }) {
  const L = list || []
  const upd = (i, p) => set(L.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const live = L.findIndex((d) => d.now)
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
      {L.map((d, i) => (
        <div key={d.id || i} className="p-slc">
          <div className="p-fld"><label>Tarih (GG.AA)</label><input value={d.date || ''} onChange={(e) => upd(i, { date: e.target.value })} placeholder="29.10" /></div>
          <div className="p-fld"><label>Başlık</label><textarea rows={2} value={d.title || ''} onChange={(e) => upd(i, { title: e.target.value })} /><small>Enter ile alt satıra geçebilirsiniz</small></div>
          <div className="p-fld"><label>Alt metin</label><textarea rows={2} value={d.sub || ''} onChange={(e) => upd(i, { sub: e.target.value })} /></div>
          <div className="p-pos">
            <div className="p-fld"><label>Yazı %</label><input type="number" value={d.fs || 100} onChange={(e) => upd(i, { fs: +e.target.value })} /></div>
            <div className="p-fld"><label>Her … dk</label><input type="number" value={d.iv || 0} onChange={(e) => upd(i, { iv: +e.target.value })} /></div>
            <div className="p-fld"><label>… sn göster</label><input type="number" value={d.ds || 30} onChange={(e) => upd(i, { ds: +e.target.value })} /></div>
          </div>
          <small>Dakika 0 ise gün boyu sürekli tam ekran. Örn. 10 dakikada bir 30 sn yazarsanız pano arada normale döner.</small>
          <div className="p-slr">
            {(d.img || d.imgId) ? <><Thumb x={{ src: d.img, img: d.imgId }} /><button onClick={() => dropImg(i)}>Görseli kaldır</button></>
              : <label className="p-fbtn">+ Görsel<input type="file" accept="image/*" hidden onChange={(e) => pickImg(i, e)} /></label>}
          </div>
          <label className="p-chk"><input type="checkbox" checked={d.on !== false} onChange={(e) => upd(i, { on: e.target.checked })} /> Aktif (o gün otomatik)</label>
          <label className="p-chk"><input type="checkbox" checked={!!d.conf} onChange={(e) => upd(i, { conf: e.target.checked })} /> Konfeti</label>
          <div className="p-btns">
            <button className={d.now ? 'p-danger' : ''} onClick={() => set(L.map((x, k) => ({ ...x, now: k === i ? !x.now : false })))}>{d.now ? 'Tam ekranı kapat' : 'Şimdi tam ekran aç'}</button>
            <button className="p-danger" onClick={() => { if (!confirm('Bu özel gün silinsin mi?')) return; if (d.imgId) removeImage(d.imgId).catch(() => {}); set(L.filter((_, k) => k !== i)) }}>Sil</button>
          </div>
        </div>
      ))}
      {live >= 0 && <p className="p-hint">Şu an "Şimdi tam ekran" açık: Yayınla'dan sonra pano tam ekrana geçer.</p>}
      <div className="p-btns"><button onClick={() => set([...L, { id: 's' + Date.now().toString(36), date: '', title: '', sub: '', fs: 100, on: true, now: false, conf: false, iv: 0, ds: 30 }])}>+ Özel gün ekle</button></div>
    </div>
  )
}

function AlertEditor({ al, set }) {
  const a = { on: false, title: 'ACİL DUYURU', text: '', tone: 'r', ic: '', ...al }
  const up = (p) => set({ ...a, ...p })
  return (
    <div className="p-body">
      <p className="p-hint">Açtığınız anda pano tam ekran acil duyuruya geçer (her şeyin üstünde görünür). Yayınla'dan sonra panoya yansır.</p>
      <div className="p-fld"><label>Simge</label>
        <div className="p-ico">
          <button className={!a.ic ? 'p-on' : ''} onClick={() => up({ ic: '' })}>Yok</button>
          {ALI.map((x) => <button key={x} className={a.ic === x ? 'p-on' : ''} onClick={() => up({ ic: x })}>{x}</button>)}
        </div>
      </div>
      <div className="p-fld"><label>Başlık</label><input value={a.title} onChange={(e) => up({ title: e.target.value })} /></div>
      <div className="p-fld"><label>Duyuru metni</label><textarea rows={4} value={a.text} onChange={(e) => up({ text: e.target.value })} /></div>
      <div className="p-pos">
        <div className="p-fld"><label>Simge %</label><input type="number" value={a.is || 100} onChange={(e) => up({ is: +e.target.value })} /></div>
        <div className="p-fld"><label>Yazı %</label><input type="number" value={a.fs || 100} onChange={(e) => up({ fs: +e.target.value })} /></div>
        <div className="p-fld"><label>Renk</label>
          <select value={a.tone} onChange={(e) => up({ tone: e.target.value })}><option value="r">Kırmızı</option><option value="o">Turuncu</option><option value="b">Mavi</option></select></div>
        <div className="p-fld"><label>Süre (dk)</label><input type="number" value={a.dur || 0} onChange={(e) => up({ dur: +e.target.value })} /></div>
      </div>
      <div className="p-fld"><label>Başlangıç (boşsa yayınlanınca başlar)</label>
        <input type="datetime-local" value={a.from || ''} onChange={(e) => up({ from: e.target.value })} /></div>
      <small>Süre 0 ise siz kapatana kadar açık kalır. Durum: <b>{alertStatus(a)}</b></small>
      <div className="p-btns">
        <button className={a.on ? 'p-danger' : 'p-pri'} onClick={() => up({ on: !a.on, pend: a.on ? 0 : 1 })}>
          {a.on ? 'Acil duyuruyu kapat' : 'Acil duyuruyu AÇ'}
        </button>
      </div>
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
    try {
      const d = { ...draft }
      if (d.al && d.al.on && d.al.pend) d.al = { ...d.al, at: Date.now(), pend: 0 }  // başlangıç anı yayın anıdır
      await saveConfig(d); setDraft(d); setMsg('Yayınlandı ✓ Pano birkaç saniye içinde güncellenir.') }
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
        {[['mods', 'Modüller'], ['al', 'Acil'], ['sd', 'Özel günler'], ['gen', 'Genel'], ['bak', 'Yedek']].map(([k, l]) => <button key={k} className={tab === k ? 'p-on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === 'gen' && (
        <div className="p-body">
          <div className="p-fld"><label>Okul adı</label><input value={draft.name || ''} onChange={(e) => set({ name: e.target.value })} /></div>
          <div className="p-fld"><label>Slogan</label><input value={draft.slogan || ''} onChange={(e) => set({ slogan: e.target.value })} /></div>
          <div className="p-fld"><label>Şehir (hava durumu için)</label><input value={draft.city || ''} onChange={(e) => set({ city: e.target.value })} /><small>Örn: Konya / Akşehir</small></div>
          <div className="p-fld"><label>Kayan duyurular</label><textarea rows={5} value={draft.ticker || ''} onChange={(e) => set({ ticker: e.target.value })} /><small>Her satır ayrı duyuru. Belirli günlerde göstermek için satır sonuna | ve tarih ekleyin: Veli toplantısı yarın | 03.11 · Sınav haftası | 03.11-07.11 · Gezi | 03.11 08:00 - 03.11 16:00</small></div>
          <div className="p-fld"><label>Hava efekti</label>
            <select value={draft.fx || 'auto'} onChange={(e) => set({ fx: e.target.value })}>
              {[['auto', 'Otomatik (hava durumuna göre)'], ['off', 'Kapalı'], ['rain', 'Yağmur'], ['snow', 'Kar'], ['wind', 'Rüzgar'], ['storm', 'Fırtına'], ['fog', 'Sis']].map(([a, b]) => <option key={a} value={a}>{b}</option>)}
            </select>
            <small>Otomatik: yağmur, kar, rüzgar, fırtına veya sis varken panoda efekt gösterilir. Diğerlerini deneme için seçebilirsiniz.</small>
          </div>
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
              <div className="p-fld"><label>İlk dersten önce (dk)</label><input type="number" value={draft.nmPre ?? 60} onChange={(e) => set({ nmPre: +e.target.value })} /></div>
              <div className="p-fld"><label>Son dersten sonra (dk)</label><input type="number" value={draft.nmPost ?? 60} onChange={(e) => set({ nmPost: +e.target.value })} /></div>
              <label className="p-chk"><input type="checkbox" checked={draft.nmWe !== false} onChange={(e) => set({ nmWe: e.target.checked })} /> Hafta sonu gece modu</label>
            </div>
          )}
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
          {draft.mods.map((m, i) => <ModEditor key={m.id} m={m} upd={(p) => updMod(i, p)} del={() => delMod(i)} move={(s) => moveMod(i, s)} say={setMsg} />)}
          <div className="p-fld"><label>Yeni modül ekle</label>
            <select value="" onChange={(e) => e.target.value && addMod(e.target.value)}>
              <option value="">Seçin…</option>
              {Object.values(registry).map((R) => <option key={R.type} value={R.type}>{R.label}</option>)}
            </select>
          </div>
        </div>
      )}
      {tab === 'sd' && <SpecialEditor list={draft.sd} set={(sd) => set({ sd })} say={setMsg} />}
      {tab === 'al' && <AlertEditor al={draft.al} set={(al) => set({ al })} />}
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
