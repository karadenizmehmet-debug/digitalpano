import { useState } from 'react'
import { CFG_ID, createSchool, removeSchool, schoolUrl } from '../lib/firebase.js'
import { cfgIdOf, slugify, validSlug } from '../lib/okul.js'

const copyText = async (t, say) => { try { await navigator.clipboard.writeText(t); say('Adres kopyalandı ✓') } catch (e) { say('Adres: ' + t) } }

// Yalnızca yönetici: okul ekle / aç / sil. Yeni okul seçilen okulun ayarlarını kopyalar, yalnızca adı değişir.
export function SchoolsEditor({ schools, say }) {
  const [ad, setAd] = useState(''), [yol, setYol] = useState(''), [elle, setElle] = useState(false)
  const [src, setSrc] = useState(CFG_ID), [busy, setBusy] = useState(false)
  const y = elle ? yol : slugify(ad)
  const used = schools.some((s) => s.id === cfgIdOf(y))
  const okY = validSlug(y) && !used
  const add = async () => {
    setBusy(true); say('Okul hazırlanıyor… (görseller kopyalanıyor)')
    try { await createSchool(y, ad.trim(), src); say('Okul eklendi ✓ ' + schoolUrl(y)); setAd(''); setYol(''); setElle(false) }
    catch (e) { say('Eklenemedi: ' + (e.code || e.message)) }
    setBusy(false)
  }
  const del = async (s) => {
    if (!confirm('"' + s.ad + '" silinsin mi?\n\nBu okulun bütün pano ayarları silinir ve geri alınamaz. Okulda açık olan pano boş kalır.')) return
    if (prompt('Onaylamak için okulun adresini yazın: ' + s.yol) !== s.yol) { say('Silme iptal edildi.'); return }
    try { await removeSchool(s.id); say('Okul silindi.') } catch (e) { say('Silinemedi: ' + (e.code || e.message)) }
  }
  return (
    <div className="p-body">
      <p className="p-hint">Her okulun kendi adresi ve kendi ayarları vardır. Kullanıcıları hangi okulda düzenleyebileceklerini seçerek Kullanıcılar ekranından onaylarsınız.</p>
      {schools.map((s) => {
        const u = schoolUrl(s.yol)
        return (
          <div key={s.id} className="p-card p-pad p-okc">
            <b>{s.ad}{s.id === CFG_ID ? ' · şu an açık' : ''}</b>
            <small>{u.replace(/^https?:\/\//, '')}</small>
            <div className="p-btns">
              <a className="p-btn" href={u} target="_blank" rel="noopener">📺 Pano</a>
              {s.id !== CFG_ID && <a className="p-btn" href={u + '#/panel'}>⚙️ Paneline geç</a>}
              <button onClick={() => copyText(u, say)}>🔗 Adresi kopyala</button>
              {s.yol && s.id !== CFG_ID && <button className="p-danger" onClick={() => del(s)}>Sil</button>}
            </div>
          </div>)
      })}
      <div className="p-card p-pad">
        <div className="p-h">➕ Yeni okul ekle</div>
        <div className="p-fld"><label>Okul adı</label><input value={ad} onChange={(e) => setAd(e.target.value)} placeholder="ör. Karahüyük Ali Akkanat Ortaokulu" /></div>
        <div className="p-fld"><label>Adres</label>
          <input value={y} onChange={(e) => { setElle(true); setYol(e.target.value.toLowerCase()) }} placeholder="ör. karahuyuk" />
          <small>{y ? schoolUrl(y).replace(/^https?:\/\//, '') : 'Okul adından otomatik oluşur; kısaltabilirsiniz.'}{y && !validSlug(y) ? ' · yalnızca küçük harf, rakam ve tire' : ''}{used ? ' · bu adres kullanılıyor' : ''}</small>
        </div>
        <div className="p-fld"><label>Ayarlar</label>
          <select value={src} onChange={(e) => setSrc(e.target.value)}>
            {schools.map((s) => <option key={s.id} value={s.id}>Kopyala: {s.ad}</option>)}
            <option value="">Boş başla</option>
          </select>
          <small>Kopyalanan okulun tasarım, modül ve görselleri gelir; yalnızca okul adı değişir. Acil duyuru kapalı gelir.</small>
        </div>
        <div className="p-btns"><button className="p-pri" disabled={busy || !ad.trim() || !okY} onClick={add}>{busy ? 'Ekleniyor…' : 'Okulu ekle'}</button></div>
      </div>
    </div>
  )
}
