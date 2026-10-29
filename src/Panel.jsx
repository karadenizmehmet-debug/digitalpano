import { useEffect, useState } from 'react'
import { registry, minHOf, wantH } from './lib/registry.js'
import { THEMES } from './lib/themes.js'
import { login, logout, onUser, saveConfig, saveImage, removeImage, loadImage } from './lib/firebase.js'
import { rows } from './lib/util.js'
import { alertStatus } from './lib/alert.js'
import Stage from './Stage.jsx'
import { DG, mondayISO, weekShift } from './modules/duty.jsx'
import { IHO_CLASSES, IHO_LESSONS, ihoProgram } from './lib/ihoSample.js'
import { reflow } from './lib/reflow.js'
import './panel.css'

const ALI = ['🚨','⚠️','🔥','🌍','🌧️','❄️','⚡','🌪️','📢','🏥','🚑','🚒','🚫','⛔','😷','🚸','🔒','📣','ℹ️','✅','🕌','🎓','🚌','⏰']
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
const COND = { sun: 'Güneşli', partly: 'Parçalı bulutlu', cloud: 'Bulutlu', rain: 'Yağmurlu', wind: 'Rüzgarlı', snow: 'Karlı', storm: 'Gök gürültülü', fog: 'Sisli' }


const ICO = { schedule: '🗓️', clock: '🕒', text: '📝', table: '📋', slides: '🖼️', bell: '🔔', weather: '🌤️', duty: '🧑‍🏫', days: '📅', news: '📰', menu: '🍽️', bday: '🎂', cnt: '⏳', cd: '🗓️', pray: '🕌', quote: '💬' }
const TONES = { r: 'Kırmızı', b: 'Mavi', g: 'Yeşil', o: 'Turuncu', p: 'Mor', k: 'Siyah' }

// Görseli küçültüp JPEG'e çevirir (Firestore belgesi 1 MB'ı geçmesin)
async function shrink(file, maxDim = 1280, type = 'image/jpeg', limit = 700000) {
  const bmp = await createImageBitmap(file)
  let max = maxDim, q = 0.8, out = ''
  for (let i = 0; i < 5; i++) {
    const r = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r)
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
    out = c.toDataURL(type, q)
    if (out.length < limit) return out
    max *= 0.8; q -= 0.08
  }
  throw new Error('Görsel çok büyük')
}

function Thumb({ x }) {
  const [src, setSrc] = useState(x.src || '')
  useEffect(() => { if (!x.src && x.img) loadImage(x.img).then(setSrc).catch(() => {}) }, [x.img, x.src])
  return src ? <img src={src} className="p-th" /> : <span className="p-th" />
}

const DUR = [[1, '1 gün'], [3, '3 gün'], [7, '1 hafta'], [30, '1 ay'], [365, '1 yıl'], [0, 'Süresiz']]
const isoD = (d) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10) }
const endOf = (x) => { if (!x.d) return null; const d = new Date((x.on || isoD(new Date())) + 'T00:00:00'); d.setDate(d.getDate() + x.d); return d }
const trD = (d) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
function DurBar({ x, upd }) {
  const e = endOf(x), dead = e && e <= new Date(isoD(new Date()) + 'T00:00:00')
  return (
    <div className="p-slr">
      <select value={x.d ?? 0} onChange={(ev) => upd({ d: +ev.target.value, on: x.on || isoD(new Date()) })}>{DUR.map(([a, b]) => <option key={a} value={a}>{'Yayın: ' + b}</option>)}</select>
      <button onClick={() => upd({ on: isoD(new Date()) })}>Süreyi yenile</button>
      <small style={{ color: dead ? '#b4232a' : '#5b6b7b' }}>{!e ? 'Süresiz yayında' : dead ? 'Süresi doldu (yayında değil)' : 'Bitiş: ' + trD(new Date(e.getTime() - 86400000))}</small>
    </div>
  )
}

function SlideCard({ x, i, upd, mv, del }) {
  const [open, setOpen] = useState(false)
  const img = x.img || x.src, e = endOf(x), dead = e && e <= new Date(isoD(new Date()) + 'T00:00:00')
  const sum = (DUR.find(([a]) => a === (x.d || 0)) || [0, 'Süresiz'])[1] + (e ? (dead ? ' · süresi doldu' : ' · ' + trD(new Date(e.getTime() - 86400000)) + ' bitiş') : '')
  return (
    <div className={'p-slc' + (dead ? ' dead' : '')}>
      <div className="p-slr" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        {img ? <Thumb x={x} /> : <span className="p-th" style={{ display: 'grid', placeItems: 'center' }}>📝</span>}
        <span style={{ flex: 1, minWidth: 0 }}><b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img ? (x.name || 'Görsel') : (x.t || 'Yazılı duyuru')}</b><small style={{ color: dead ? '#b4232a' : '#5b6b7b' }}>{sum}</small></span>
        <span>{open ? '▴' : '▾'}</span>
      </div>
      {open && <>
        {img && <input placeholder="Görsel adı" value={x.name || ''} onChange={(ev) => upd(i, { name: ev.target.value })} />}
        {!img && <>
          <input placeholder="Başlık" value={x.t || ''} onChange={(ev) => upd(i, { t: ev.target.value })} />
          <textarea rows={2} placeholder="Alt yazı (isteğe bağlı)" value={x.s || ''} onChange={(ev) => upd(i, { s: ev.target.value })} />
          <div className="p-slr">
            <select value={x.tone || 'r'} onChange={(ev) => upd(i, { tone: ev.target.value })}>{Object.entries(TONES).map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
            <input type="number" title="Yazı boyutu %" value={x.fs || 100} onChange={(ev) => upd(i, { fs: +ev.target.value })} />
          </div>
        </>}
        <DurBar x={x} upd={(p) => upd(i, p)} />
        <div className="p-btns"><button onClick={() => mv(i, -1)}>↑</button><button onClick={() => mv(i, 1)}>↓</button><button className="p-danger" onClick={() => del(i)}>Sil</button></div>
      </>}
    </div>
  )
}

function SlidesEditor({ value, set, say }) {
  const L = value || []
  const [nm, setNm] = useState('')
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
      setNm('')
      const src = await shrink(f), id = 'i' + Date.now().toString(36)
      await saveImage(id, src)
      set([...L, { img: id, name: nm.trim() || f.name, d: 7, on: isoD(new Date()) }])
      say('Görsel yüklendi. Yayınla düğmesine basmayı unutmayın.')
    } catch (er) { say('Görsel yüklenemedi: ' + er.message) }
  }
  return (
    <div className="p-sl">
      {L.map((x, i) => <SlideCard key={i} x={x} i={i} upd={upd} mv={mv} del={del} />)}
      <div className="p-btns">
        <button onClick={() => set([...L, { t: 'Duyuru başlığı', s: '', tone: 'b', fs: 100, d: 7, on: isoD(new Date()) }])}>+ Yazılı slayt</button>
        <input placeholder="Yeni görselin adı (isteğe bağlı)" value={nm} onChange={(e) => setNm(e.target.value)} style={{ flex: '1 1 100%' }} />
        <label className="p-fbtn">+ Görsel<input type="file" accept="image/*" hidden onChange={addImg} /></label>
      </div>
    </div>
  )
}

const fromSheet = (t) => t.replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n').map((l) => l.split('\t').map((x) => x.trim()).join(';').replace(/;+$/, '')).join('\n')

function Field({ f, data, set, say, root, setRoot }) {
  const [k0, kind, label, hint] = f
  const isRoot = k0[0] === '@', k = isRoot ? k0.slice(1) : k0
  if (isRoot) { data = root; set = (kk, vv) => setRoot({ [kk]: vv }) }
  const v = data[k]
  let input
  if (kind === 'area') input = <textarea rows={6} value={v ?? ''} onChange={(e) => set(k, e.target.value)} onPaste={(e) => {
    const t = e.clipboardData.getData('text');
    if (!t || (t.indexOf('\t') < 0 && t.indexOf('\r') < 0)) return;
    e.preventDefault();
    const el = e.target, cur = el.value;
    set(k, cur.slice(0, el.selectionStart) + fromSheet(t) + cur.slice(el.selectionEnd));
  }} />
  else if (kind === 'fx') input = <select value={v || 'auto'} onChange={(e) => set(k, e.target.value)}>{[['auto', 'Otomatik (hava durumuna göre)'], ['rain', 'Yağmur'], ['snow', 'Kar'], ['wind', 'Rüzgar'], ['storm', 'Fırtına'], ['fog', 'Sis']].map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
  else if (kind === 'check') return <label className="p-chk"><input type="checkbox" checked={k === 'fxOn' ? v !== false : !!v} onChange={(e) => set(k, e.target.checked)} /> {label}</label>
  else if (kind === 'num') input = <input type="number" value={v ?? ''} onChange={(e) => set(k, e.target.value === '' ? '' : +e.target.value)} />
  else if (kind === 'dt') input = <input type="datetime-local" value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  else if (kind === 'sel') input = <select value={v} onChange={(e) => set(k, e.target.value)}>{Object.entries(COND).map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
  else if (kind === 'bellrows') input = <BellEditor value={v} set={(x) => set(k, x)} />
  else if (kind === 'sched') input = <SchedEditor data={data} set={set} />
  else if (kind === 'slides') input = <SlidesEditor value={v} set={(x) => set(k, x)} say={say} />
  else if (kind === 'dgrid') {
    const P = rows({ rows: data.places }), g = data.g || {}
    const k = weekShift(data, new Date())
    input = (
      <div>
        <div className="p-dgw"><table className="p-dgt"><tbody>
          <tr><th>Yer</th>{DG.map((d) => <th key={d}>{d}</th>)}</tr>
          {P.map((p, j) => (
            <tr key={j}><td><b>{p}</b></td>
              {DG.map((d, i) => <td key={d}><input value={(g[i] || {})[j] || ''}
                onChange={(e) => set('g', { ...g, [i]: { ...(g[i] || {}), [j]: e.target.value } })} /></td>)}
            </tr>))}
        </tbody></table></div>
        {!P.length && <small>Önce yukarıya nöbet yerlerini yazın.</small>}
        <label className="p-chk" style={{ marginTop: 10 }}>
          <input type="checkbox" checked={!!data.rot} onChange={(e) => set('rot', e.target.checked ? mondayISO(new Date()) : '')} /> Dönüşümlü nöbet
        </label>
        {data.rot && <>
          <small>Her hafta öğretmenler bir sonraki nöbet yerine geçer (tablodaki düzen aşağıdaki hafta için geçerlidir).</small>
          <div className="p-fld"><label>Tablonun geçerli olduğu hafta (Pazartesi)</label>
            <input type="date" value={data.rot || ''} onChange={(e) => set('rot', e.target.value || mondayISO(new Date()))} /></div>
          <small>Bu hafta kaydırma: <b>{k}</b>{k < 0 ? ' (başlangıç tarihi ileride)' : ''}</small>
        </>}
      </div>
    )
  } else input = <input type="text" value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  const pasteBtn = kind === 'area' && <button type="button" className="p-ghost" onClick={async () => {
    try {
      const t = await navigator.clipboard.readText()
      if (!t.trim()) return say('Panoda kopyalanmış metin yok')
      set(k, (v ? v.replace(/\n+$/, '') + '\n' : '') + fromSheet(t))
      say('Eklendi. Yayınla ile panoya gönderin')
    } catch { say('Panoya erişim izni verilmedi. Kutuya uzun basıp Yapıştır deyin') }
  }}>📋 Excel/panodan satır ekle</button>
  return <div className="p-fld"><label>{label}</label>{input}{pasteBtn}{hint && <small>{hint}</small>}</div>
}

const tmin = (t) => { const m = /^(\d+):(\d+)/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : 0 }
const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') }
const parseBell = (txt) => String(txt || '').split('\n').map((l) => l.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)\s*(.*)/)).filter(Boolean)
  .map((x) => ({ s: hhmm(+x[1] * 60 + +x[2]), e: hhmm(+x[3] * 60 + +x[4]), n: x[5] }))
const joinBell = (L) => L.map((r) => r.s + '-' + r.e + ' ' + r.n).join('\n')

function BellEditor({ value, set }) {
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
            <div className="p-fld"><label>Ders süresi (dk)</label><input type="number" inputMode="numeric" value={gen.d} onChange={(e) => setGen({ ...gen, d: Math.max(5, +e.target.value || 0) })} /></div>
            <div className="p-fld"><label>Sabah ders sayısı</label><input type="number" inputMode="numeric" value={gen.m} onChange={(e) => setGen({ ...gen, m: Math.max(1, Math.min(8, +e.target.value || 1)) })} /></div>
            <div className="p-fld"><label>Teneffüs (dk)</label><input type="number" inputMode="numeric" value={gen.b} onChange={(e) => setGen({ ...gen, b: Math.max(0, +e.target.value || 0) })} /></div>
            <div className="p-fld"><label>Öğle arası (dk)</label><input type="number" inputMode="numeric" value={gen.l} onChange={(e) => setGen({ ...gen, l: Math.max(0, +e.target.value || 0) })} /></div>
            <div className="p-fld"><label>Öğleden sonra ders sayısı</label><input type="number" inputMode="numeric" value={gen.a} onChange={(e) => setGen({ ...gen, a: Math.max(0, Math.min(8, +e.target.value || 0)) })} /></div>
          </div>
          <small>Toplam {gen.m + gen.a} ders. Öğle arası, sabahın son dersinden sonra uygulanır.</small>
          {!ask ? <button className="p-pri" onClick={() => (L.length ? setAsk(true) : make())}>Oluştur</button>
            : <div className="p-btns"><button className="p-danger" onClick={make}>Evet, mevcut saatlerin yerine oluştur</button><button onClick={() => setAsk(false)}>Vazgeç</button></div>}
        </div>)}
    </div>
  )
}

function SchedEditor({ data, set }) {
  const [sec, setSec] = useState('cls'), [c, setC] = useState(''), [ln, setLn] = useState(''), [lk, setLk] = useState('')
  const [pc, setPc] = useState(''), [pd, setPd] = useState(0), [ask, setAsk] = useState(false)
  const classes = data.classes || [], lessons = data.lessons || [], N = Math.max(1, Math.min(12, data.n || 8))
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
  const setCell = (cl, d, h, v) => {
    const all = {}; for (let i = 0; i < 5; i++) all[i] = day(cl, i)
    all[d][h] = v
    set('prog', { ...prog, [cl]: all })
  }
  const copyDay = (cl, d) => { const all = {}; for (let i = 0; i < 5; i++) all[i] = day(cl, d); set('prog', { ...prog, [cl]: all }) }
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
          <select value={cur} onChange={(e) => setPc(e.target.value)}>{classes.map((x) => <option key={x}>{x}</option>)}</select>
          <div className="p-sub">{['Pzt', 'Sal', 'Çar', 'Per', 'Cum'].map((d, i) => <button key={d} className={pd === i ? 'p-on' : ''} onClick={() => setPd(i)}>{d}</button>)}</div>
          {day(cur, pd).map((v, h) => (
            <div key={h} className="p-hr"><span>{h + 1}. Ders</span>
              <select value={v} onChange={(e) => setCell(cur, pd, h, e.target.value)}>
                <option value="">— boş —</option>
                {lessons.map((x) => <option key={x.n} value={x.n}>{x.n}</option>)}
              </select>
            </div>))}
          <button onClick={() => copyDay(cur, pd)}>Bu günü tüm günlere kopyala</button>
        </div>)}
    </div>
  )
}

function Tiles({ mods, go }) {
  return <div className="p-tiles">{mods.map((m) => (
    <button key={m.id} className={'p-tile' + (m.active ? '' : ' p-qoff')} onClick={() => go(m.id)}>
      <span className="p-ti">{ICO[m.type] || '🧩'}</span>
      <b>{m.title || registry[m.type]?.label}</b>
      {!m.active && <small>Kapalı</small>}
    </button>))}</div>
}

// Firestore REST biçimini (stringValue, mapValue…) düz nesneye çevirir
const fsVal = (v) => {
  if ('stringValue' in v) return v.stringValue
  if ('integerValue' in v) return +v.integerValue
  if ('doubleValue' in v) return +v.doubleValue
  if ('booleanValue' in v) return v.booleanValue
  if ('nullValue' in v) return null
  if ('timestampValue' in v) return v.timestampValue
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fsVal)
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fsVal(x)]))
  return null
}
const REPO = 'karadenizmehmet-debug/digitalpano'

function AutoBackups({ onLoad, say }) {
  const [list, setList] = useState(null), [busy, setBusy] = useState(false)
  const fetchList = async () => {
    setBusy(true)
    try {
      const r = await fetch('https://api.github.com/repos/' + REPO + '/commits?path=yedek/ayarlar.json&per_page=20')
      if (!r.ok) throw new Error('HTTP ' + r.status)
      setList((await r.json()).map((c) => ({ sha: c.sha, date: new Date(c.commit.committer.date) })))
    } catch (e) { say('Yedek listesi alınamadı: ' + e.message) }
    setBusy(false)
  }
  const load = async (c) => {
    setBusy(true)
    try {
      const r = await fetch('https://raw.githubusercontent.com/' + REPO + '/' + c.sha + '/yedek/ayarlar.json')
      if (!r.ok) throw new Error('HTTP ' + r.status)
      const d = await r.json()
      onLoad(fsVal({ mapValue: { fields: d.fields } }))
    } catch (e) { say('Yedek yüklenemedi: ' + e.message) }
    setBusy(false)
  }
  return (
    <div className="p-fld">
      <label>Otomatik yedekler (her hafta + elle alınanlar)</label>
      <button onClick={fetchList} disabled={busy}>{list ? 'Listeyi yenile' : 'Yedek listesini getir'}</button>
      {list && list.map((c) => (
        <div key={c.sha} className="p-slr"><span style={{ flex: 1 }}>{c.date.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          <button onClick={() => load(c)} disabled={busy}>Bu yedeği yükle</button></div>))}
      <small>Yüklenen yedek önce taslağa gelir. Kontrol edip Yayınla'ya basmadıkça panoya geçmez.</small>
    </div>
  )
}

function ModList({ mods, go, toggle }) {
  return <div className="p-mlist">{mods.map((m, i) => (
    <div key={m.id} className={'p-mrow' + (m.active ? '' : ' p-off')} onClick={() => go(m.id)}>
      <span className="p-mi">{ICO[m.type] || '🧩'}</span>
      <span className="p-nm"><b>{m.title || registry[m.type]?.label}</b><small>{registry[m.type]?.label || m.type}{m.active ? '' : ' · kapalı'}</small></span>
      <label className="p-sw" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={m.active} onChange={(e) => toggle(i, e.target.checked)} /><i />
      </label>
      <span className="p-ar">›</span>
    </div>))}</div>
}

function ModEditor({ m, upd, del, move, say, root, setRoot, open, setOpen }) {
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
          <button className="p-back" onClick={() => setOpen(null)}>← Modüller</button>
          <label className="p-chk p-on-off"><input type="checkbox" checked={m.active} onChange={(e) => upd({ active: e.target.checked })} /> Panoda göster</label>
        </div>
      )}
      {open && (
        <div className="p-body p-dbody">
          <div className="p-fld"><label>Başlık</label><input value={m.title || ''} onChange={(e) => upd({ title: e.target.value })} /></div>
          <label className="p-chk"><input type="checkbox" checked={m.showTitle !== false && (m.type !== 'slides' || m.showTitle)} onChange={(e) => upd({ showTitle: e.target.checked })} /> Başlığı göster</label>
          {(R?.fields || []).map((f) => <Field key={f[0]} f={f} data={m.data} set={setData} say={say} root={root} setRoot={setRoot} />)}
          <details className="p-adv"><summary>Gelişmiş (boyut, renk, konum)</summary>
          <label className="p-chk" style={{ marginTop: 10 }}><input type="checkbox" checked={!!m.fixH} onChange={(e) => upd({ fixH: e.target.checked })} /> Yüksekliği sabitle (otomatik yerleşim değiştirmesin)</label>
          <div className="p-fld"><label>Yazı boyutu (%)</label><input type="number" value={m.fs || 100} onChange={(e) => upd({ fs: +e.target.value })} /></div>
          <div className="p-fld"><label>Renk</label><input type="color" value={m.color || '#0f9b8e'} onChange={(e) => upd({ color: e.target.value })} /></div>
          <div className="p-pos">
            {['x', 'y', 'w', 'h'].map((k) => <div key={k} className="p-fld"><label>{k.toUpperCase()}</label><input type="number" value={m[k]} onChange={(e) => upd({ [k]: +e.target.value })} /></div>)}
          </div>
          </details>
          <div className="p-btns p-delrow">
            {!ask ? <button className="p-danger" onClick={() => setAsk(true)}>🗑 Modülü sil</button>
              : <><button className="p-danger" onClick={() => { del(); setOpen(null) }}>Evet, sil</button><button onClick={() => setAsk(false)}>Vazgeç</button></>}
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

export default function Panel({ cfg, fresh, err }) {
  const [user, setUser] = useState(undefined)
  const [draft, setDraft] = useState(null)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('home')
  const [sub, setSub] = useState('gen')
  const [openId, setOpenId] = useState(null)
  const [saved, setSaved] = useState('')
  const [slow, setSlow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setSlow(true), 8000); return () => clearTimeout(t) }, [])
  const [sel, setSel] = useState(null)
  const [em, setEm] = useState(''), [pw, setPw] = useState('')

  useEffect(() => onUser(setUser), [])
  useEffect(() => { if (user && fresh && !draft) { setDraft(JSON.parse(JSON.stringify(cfg))); setSaved(JSON.stringify(cfg)) } }, [user, cfg, draft, fresh])

  const doLogin = async (e) => {
    e.preventDefault()
    try { await login(em, pw); setMsg('') } catch { setMsg('E-posta veya şifre hatalı.') }
  }
  const publish = async () => {
    try {
      const d = { ...draft }
      if (d.al && d.al.on && d.al.pend) d.al = { ...d.al, at: Date.now(), pend: 0 }  // başlangıç anı yayın anıdır
      await saveConfig(d); setDraft(d); setSaved(JSON.stringify(d)); setMsg('Yayınlandı ✓ Pano birkaç saniye içinde güncellenir.') }
    catch (e) { setMsg('Kaydedilemedi: ' + e.message) }
  }
  const set = (p) => setDraft((d) => ({ ...d, ...p }))
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
      const mods = [...d.mods, { id: 'm' + Date.now().toString(36), type, title: R.label, active: true, x: 480, y: 124, w: 640, h: Math.max(R.minH || 100, 120), color: '#0f9b8e', fs: 100, data: JSON.parse(JSON.stringify(R.def || {})) }].map((m) => ({ ...m }))
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
  const goMod = (id) => { setTab('mods'); setOpenId(id); window.scrollTo(0, 0) }

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
  if (!draft) return <div className="pnl"><p>Ayarlar sunucudan alınıyor…</p>{slow && <p className="p-err">Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin. Kayıtlı ayarlarınız bozulmaması için bağlantı gelene kadar düzenleme açılmaz.{err ? ' (Hata: ' + err + ')' : ''}</p>}</div>

  return (
    <div className="pnl">
      <div className="p-top">
        <div className="p-tt"><b>Pano Paneli</b><small>{dirty ? '● Yayınlanmamış değişiklik var' : '✓ Pano güncel'}</small></div>
        <button className={'p-pri p-pub' + (dirty ? ' p-dirty' : '')} onClick={publish}>Yayınla</button>
      </div>
      {msg && <div className="p-toast" onClick={() => setMsg('')}>{msg}</div>}
      {tab === 'home' && (
        <div className="p-body">
          <div className="p-links">
            <a className="p-lk" href="#/">📺 Panoyu aç</a>
            <a className="p-lk" href="#/panel" onClick={logout}>🚪 Çıkış</a>
          </div>
          <div className="p-card p-pad">
            <div className="p-h">📢 Kayan duyurular</div>
            <textarea rows={5} value={draft.ticker || ''} onChange={(e) => set({ ticker: e.target.value })} placeholder="Her satır ayrı bir duyuru" />
            <small>Belirli günlerde göstermek için satır sonuna | ve tarih ekleyin: Veli toplantısı | 03.11</small>
          </div>
          <div className="p-h2">Modülü düzenle</div>
          <Tiles mods={draft.mods} go={goMod} />
        </div>
      )}
      {tab === 'set' && <div className="p-sub">{[['gen', 'Genel'], ['sd', 'Özel günler'], ['bak', 'Yedek']].map(([k, l]) => <button key={k} className={sub === k ? 'p-on' : ''} onClick={() => setSub(k)}>{l}</button>)}</div>}
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
          <div className="p-fld"><label>Kayan duyurular</label><textarea rows={5} value={draft.ticker || ''} onChange={(e) => set({ ticker: e.target.value })} /><small>Her satır ayrı duyuru. Belirli günlerde göstermek için satır sonuna | ve tarih ekleyin: Veli toplantısı yarın | 03.11 · Sınav haftası | 03.11-07.11 · Gezi | 03.11 08:00 - 03.11 16:00</small></div>
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
      {view === 'mods' && (
        <div className="p-body">
          {!openId && <ModList mods={draft.mods} go={setOpenId} toggle={(i, v) => updMod(i, { active: v })} />}
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
          <div className="p-pvwrap">
            <Stage preview cfg={draft}
              edit={{ sel, onSelect: setSel, onChange: (mods) => set({ mods }) }} />
          </div>
          <p className="p-hint">Modülü sürükleyip taşıyın, sağ alt köşedeki turuncu kareden boyutlandırın (boyutlandırdığınız modülün yüksekliği korunur). Bırakınca sütuna oturur{draft.autoFlow === false ? '' : ' ve boşluklar otomatik düzenlenir'}.</p>
          <label className="p-chk"><input type="checkbox" checked={draft.autoFlow !== false} onChange={(e) => set({ autoFlow: e.target.checked })} /> Otomatik yerleşim</label>
          <div className="p-btns">
            <button onClick={() => { const mods = draft.mods.map((m) => { const c = { ...m }; delete c.fixH; return c }); reflow(mods, null, minHOf, wantH); set({ mods }) }}>Hepsini otomatik düzenle</button>
          </div>
          {sel && draft.mods.find((m) => m.id === sel) && (
            <div className="p-btns">
              <b>{draft.mods.find((m) => m.id === sel).title}</b>
              <button onClick={() => { const m = draft.mods.find((x) => x.id === sel); set({ mods: draft.mods.map((x) => (x.id === sel ? { ...x, active: !m.active } : x)) }) }}>
                {draft.mods.find((m) => m.id === sel).active ? 'Gizle' : 'Göster'}
              </button>
            </div>
          )}
        </div>
      )}
      {view === 'sd' && <SpecialEditor list={draft.sd} set={(sd) => set({ sd })} say={setMsg} />}
      {view === 'al' && <AlertEditor al={draft.al} set={(al) => set({ al })} />}
      {view === 'bak' && (
        <div className="p-body">
          <p>Ayarları dosya olarak indirip saklayabilir, gerektiğinde geri yükleyebilirsiniz.</p>
          <div className="p-btns"><button onClick={download}>Yedeği indir</button>
            <label className="p-fbtn">Yedeği yükle<input type="file" accept="application/json" hidden onChange={upload} /></label></div>
          <AutoBackups say={setMsg} onLoad={(c) => { setDraft(c); setMsg('Yedek taslağa yüklendi. Kontrol edin, sonra Yayınla\'ya basın.') }} />
        </div>
      )}
      <nav className="p-nav">
        {[['home', '🏠', 'Ana sayfa'], ['mods', '🧩', 'Modüller'], ['lay', '🖼️', 'Düzen'], ['news', '📰', 'Manşet'], ['al', '🚨', 'Acil'], ['set', '⚙️', 'Ayarlar']].map(([k, i, l]) => <button key={k} className={(k === 'news' ? tab === 'mods' && openId === (draft.mods.find((m) => m.type === 'slides') || {}).id : tab === k && !(k === 'mods' && openId === (draft.mods.find((m) => m.type === 'slides') || {}).id)) ? 'p-on' : ''} onClick={() => { if (k === 'news') { const m = draft.mods.find((x) => x.type === 'slides'); if (m) goMod(m.id); else { setTab('mods'); setOpenId(null) } return } setTab(k); if (k === 'mods') setOpenId(null); window.scrollTo(0, 0) }}><span>{i}</span>{l}</button>)}
      </nav>
    </div>
  )
}
