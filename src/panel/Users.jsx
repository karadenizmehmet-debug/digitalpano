import { removeUser, setUserStatus } from '../lib/firebase.js'

const ETK = { bekliyor: '⏳ Onay bekliyor', onayli: '✅ Onaylı', red: '⛔ Reddedildi' }
const SIRA = { bekliyor: 0, onayli: 1, red: 2 }
const tarih = (t) => (t ? new Date(t).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '')

// Yalnızca yönetici görür. Liste Panel'de canlı dinlenir (bekleyen sayısı ayar kutucuğunda da görünsün diye).
export function UsersEditor({ list, say }) {
  const act = (p) => p.then(() => say('Kaydedildi ✓')).catch((e) => say('Olmadı: ' + (e.code || e.message)))
  if (!list) return <div className="p-body"><p>Yükleniyor…</p></div>
  const s = list.slice().sort((a, b) => (SIRA[a.durum] ?? 3) - (SIRA[b.durum] ?? 3) || (b.zaman || 0) - (a.zaman || 0))
  return (
    <div className="p-body">
      <p className="p-hint">Google ile giriş yapan herkes burada başvuru olarak görünür. Onayladığınız kişi panelde her şeyi düzenleyip yayınlayabilir. Siz yöneticisiniz; listede görünmezsiniz.</p>
      {!s.length && <div className="p-card p-pad">Henüz başvuru yok.</div>}
      {s.map((u) => (
        <div key={u.uid} className="p-card p-pad p-usr">
          <div className="p-usrh">
            {u.foto ? <img src={u.foto} alt="" referrerPolicy="no-referrer" /> : <i>👤</i>}
            <span><b>{u.ad || 'Adsız'}</b><small>{u.eposta}</small><small>{ETK[u.durum] || u.durum} · {tarih(u.karar || u.zaman)}</small></span>
          </div>
          <div className="p-btns">
            {u.durum !== 'onayli' && <button className="p-pri" onClick={() => act(setUserStatus(u.uid, 'onayli'))}>Onayla</button>}
            {u.durum === 'bekliyor' && <button className="p-danger" onClick={() => act(setUserStatus(u.uid, 'red'))}>Reddet</button>}
            {u.durum === 'onayli' && <button className="p-danger" onClick={() => { if (confirm((u.ad || u.eposta) + ' artık paneli düzenleyemesin mi?')) act(setUserStatus(u.uid, 'red')) }}>Yetkiyi kaldır</button>}
            {u.durum === 'red' && <button onClick={() => { if (confirm('Kayıt silinsin mi? Kişi tekrar giriş yaparsa yeni başvuru oluşur.')) act(removeUser(u.uid)) }}>Sil</button>}
          </div>
        </div>))}
    </div>
  )
}
