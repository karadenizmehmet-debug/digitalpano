import { useState } from 'react'
import { removeUser, setUserSchools, setUserStatus } from '../lib/firebase.js'
import { userSchools } from '../lib/okul.js'

const ETK = { bekliyor: '⏳ Onay bekliyor', onayli: '✅ Onaylı', red: '⛔ Reddedildi' }
const SIRA = { bekliyor: 0, onayli: 1, red: 2 }
const tarih = (t) => (t ? new Date(t).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '')

// Tek kullanıcı kartı: okul seçimi + kararlar
function UserCard({ u, schools, cur, say }) {
  const start = u.durum === 'onayli' ? userSchools(u) : [cur]
  const [sel, setSel] = useState(start)
  const act = (p) => p.then(() => say('Kaydedildi ✓')).catch((e) => say('Olmadı: ' + (e.code || e.message)))
  const tog = (id) => setSel(sel.indexOf(id) >= 0 ? sel.filter((x) => x !== id) : sel.concat(id))
  const changed = u.durum === 'onayli' && JSON.stringify(sel.slice().sort()) !== JSON.stringify(userSchools(u).slice().sort())
  const name = (id) => (schools.find((s) => s.id === id) || { ad: id }).ad
  return (
    <div className="p-card p-pad p-usr">
      <div className="p-usrh">
        {u.foto ? <img src={u.foto} alt="" referrerPolicy="no-referrer" /> : <i>👤</i>}
        <span><b>{u.ad || 'Adsız'}</b><small>{u.eposta}</small><small>{ETK[u.durum] || u.durum} · {tarih(u.karar || u.zaman)}</small></span>
      </div>
      {u.durum !== 'red' && (
        <div className="p-fld"><label>{u.durum === 'onayli' ? 'Düzenleyebildiği okullar' : 'Hangi okulu düzenleyecek?'}</label>
          <div className="p-chips">{schools.map((s) => <button key={s.id} className={sel.indexOf(s.id) >= 0 ? 'p-on' : ''} onClick={() => tog(s.id)}>{sel.indexOf(s.id) >= 0 ? '✓ ' : ''}{s.ad}</button>)}</div>
        </div>)}
      {u.durum === 'red' && u.okullar && <small>Önceki okullar: {u.okullar.map(name).join(', ')}</small>}
      <div className="p-btns">
        {u.durum === 'bekliyor' && <button className="p-pri" disabled={!sel.length} onClick={() => act(setUserStatus(u.uid, 'onayli', { okullar: sel }))}>Onayla</button>}
        {u.durum === 'bekliyor' && <button className="p-danger" onClick={() => act(setUserStatus(u.uid, 'red'))}>Reddet</button>}
        {u.durum === 'onayli' && changed && <button className="p-pri" disabled={!sel.length} onClick={() => act(setUserSchools(u.uid, sel))}>Okulları kaydet</button>}
        {u.durum === 'onayli' && <button className="p-danger" onClick={() => { if (confirm((u.ad || u.eposta) + ' artık paneli düzenleyemesin mi?')) act(setUserStatus(u.uid, 'red')) }}>Yetkiyi kaldır</button>}
        {u.durum === 'red' && <button className="p-pri" onClick={() => act(setUserStatus(u.uid, 'onayli', { okullar: u.okullar && u.okullar.length ? u.okullar : [cur] }))}>Yeniden onayla</button>}
        {u.durum === 'red' && <button onClick={() => { if (confirm('Kayıt silinsin mi? Kişi tekrar giriş yaparsa yeni başvuru oluşur.')) act(removeUser(u.uid)) }}>Sil</button>}
      </div>
    </div>
  )
}

// Yalnızca yönetici görür. Liste Panel'de canlı dinlenir (bekleyen sayısı ayar kutucuğunda da görünsün diye).
export function UsersEditor({ list, schools, cur, say }) {
  if (!list) return <div className="p-body"><p>Yükleniyor…</p></div>
  const s = list.slice().sort((a, b) => (SIRA[a.durum] ?? 3) - (SIRA[b.durum] ?? 3) || (b.zaman || 0) - (a.zaman || 0))
  return (
    <div className="p-body">
      <p className="p-hint">Google ile giriş yapan herkes burada başvuru olarak görünür. Okulunu seçip onaylayın; kişi yalnızca seçtiğiniz okulların panosunu düzenleyip yayınlayabilir. Siz yöneticisiniz, bütün okullara erişirsiniz.</p>
      {!s.length && <div className="p-card p-pad">Henüz başvuru yok.</div>}
      {s.map((u) => <UserCard key={u.uid + (u.karar || '')} u={u} schools={schools} cur={cur} say={say} />)}
    </div>
  )
}
