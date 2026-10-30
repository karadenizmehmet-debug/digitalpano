import { useState } from 'react'
import { ALI, NumIn, isoLocal } from './common.jsx'
import { alertStatus } from '../lib/alert.js'
import { changePassword } from '../lib/firebase.js'

export function PwEditor({ say }) {
  const [o, setO] = useState(''), [n, setN] = useState(''), [n2, setN2] = useState(''), [busy, setBusy] = useState(false)
  const go = async () => {
    if (n.length < 8) { say('Yeni şifre en az 8 karakter olmalı.'); return }
    if (n !== n2) { say('Yeni şifreler aynı değil.'); return }
    setBusy(true)
    try { await changePassword(o, n); setO(''); setN(''); setN2(''); say('Şifre değiştirildi ✓') }
    catch (e) { say(/wrong|invalid|credential/i.test(e.code + e.message) ? 'Mevcut şifre hatalı.' : /recent|requires/i.test(e.code) ? 'Güvenlik için çıkış yapıp tekrar giriş yapın, sonra deneyin.' : 'Değiştirilemedi: ' + (e.code || e.message)) }
    setBusy(false)
  }
  return (
    <div className="p-body"><div className="p-card p-pad">
      <div className="p-h">🔑 Şifre değiştir</div>
      <div className="p-fld"><label>Mevcut şifre</label><input type="password" value={o} onChange={(e) => setO(e.target.value)} autoComplete="current-password" /></div>
      <div className="p-fld"><label>Yeni şifre (en az 8 karakter)</label><input type="password" value={n} onChange={(e) => setN(e.target.value)} autoComplete="new-password" /></div>
      <div className="p-fld"><label>Yeni şifre (tekrar)</label><input type="password" value={n2} onChange={(e) => setN2(e.target.value)} autoComplete="new-password" /></div>
      <div className="p-btns"><button className="p-pri" disabled={busy || !o || !n} onClick={go}>{busy ? 'Değiştiriliyor…' : 'Şifreyi değiştir'}</button></div>
      <small>Şifre hemen değişir. Bu panelin Yayınla düğmesiyle ilgisi yoktur.</small>
    </div></div>
  )
}

export function AlertEditor({ al, set }) {
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
        <div className="p-fld"><label>Simge %</label><NumIn value={a.is || 100} onChange={(e) => up({ is: +e.target.value })} /></div>
        <div className="p-fld"><label>Yazı %</label><NumIn value={a.fs || 100} onChange={(e) => up({ fs: +e.target.value })} /></div>
        <div className="p-fld"><label>Renk</label>
          <select value={a.tone} onChange={(e) => up({ tone: e.target.value })}><option value="r">Kırmızı</option><option value="o">Turuncu</option><option value="b">Mavi</option></select></div>
        <div className="p-fld"><label>Ne kadar kalsın</label><select value={a.dur || 0} onChange={(e) => up({ dur: +e.target.value })}>{[[0, 'Ben kapatana kadar'], [5, '5 dakika'], [10, '10 dakika'], [15, '15 dakika'], [30, '30 dakika'], [60, '1 saat'], [120, '2 saat'], [240, '4 saat']].concat([5, 10, 15, 30, 60, 120, 240, 0].includes(+a.dur || 0) ? [] : [[+a.dur, a.dur + ' dakika']]).map(([x, y]) => <option key={x} value={x}>{y}</option>)}</select></div>
      </div>
      <div className="p-fld"><label>Ne zaman başlasın</label>
        <select value={a.from ? 'z' : 'h'} onChange={(e) => up({ from: e.target.value === 'h' ? '' : isoLocal(new Date(Date.now() + 36e5)) })}><option value="h">Hemen (Yayınla'ya basınca)</option><option value="z">Belirli tarih ve saatte</option></select>
        {a.from ? <input type="datetime-local" value={a.from} onChange={(e) => up({ from: e.target.value })} style={{ marginTop: 8 }} /> : null}
      </div>
      <small>Süre 0 ise siz kapatana kadar açık kalır. Durum: <b>{alertStatus(a)}</b></small>
      <div className="p-btns">
        <button className={a.on ? 'p-danger' : 'p-pri'} onClick={() => up({ on: !a.on, pend: a.on ? 0 : 1 })}>
          {a.on ? 'Acil duyuruyu kapat' : 'Acil duyuruyu AÇ'}
        </button>
      </div>
    </div>
  )
}
