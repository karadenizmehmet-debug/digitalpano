import { useState } from 'react'
import { SOURCES, listOf } from '../lib/newsDefault.js'

export function RssEditor({ draft, set, back }) {
  const L = listOf(draft), [nm, setNm] = useState(''), [url, setUrl] = useState('')
  const put = (a) => set({ rssList: a })
  const upd = (i, p) => put(L.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const add = () => {
    const u = url.trim()
    if (!/^https?:\/\//i.test(u)) { alert('Adres http:// veya https:// ile başlamalı.'); return }
    put([...L, { id: 'r' + Date.now().toString(36), name: nm.trim() || u.replace(/^https?:\/\//i, '').split('/')[0], url: u, on: true }]); setNm(''); setUrl('')
  }
  const missing = SOURCES.filter((s) => !L.some((x) => x.id === s.id))
  return (
    <div className="p-card p-pad">
      <button onClick={back}>← Modüller</button>
      <div className="p-h" style={{ marginTop: 10 }}>📰 RSS haber kaynakları</div>
      <p className="p-hint">Yayında kayan duyuru yokken alttaki kayan yazıda <b>işaretlediğiniz kaynakların</b> son başlıkları gösterilir. Birden fazla işaretlerseniz başlıklar sırayla karışır. Duyuru eklediğiniz anda kayan yazı yine duyuruları gösterir. Hiçbiri işaretli değilse bu özellik kapalıdır.</p>
      {L.map((s, i) => (
        <div key={s.id} className="p-slr" style={{ alignItems: 'flex-start', marginBottom: 8 }}>
          <label className="p-chk" style={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
            <input type="checkbox" checked={!!s.on} onChange={(e) => upd(i, { on: e.target.checked })} />
            <span style={{ minWidth: 0, wordBreak: 'break-all' }}>{s.name}<br /><small className="p-hint">{String(s.url).replace(/^https?:\/\//, '')}</small></span>
          </label>
          <button className="p-danger" title="Sil" onClick={() => { if (confirm('"' + s.name + '" kaynağı silinsin mi?')) put(L.filter((_, k) => k !== i)) }}>🗑</button>
        </div>))}
      {!L.length && <small className="p-hint">Kaynak yok. Aşağıdan ekleyin.</small>}
      <div className="p-h2">➕ Kaynak ekle</div>
      <div className="p-fld"><input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="Ad (örn. Akşehir Kaymakamlığı)" /></div>
      <div className="p-fld"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="RSS adresi: https://…/rss.xml" /></div>
      <div className="p-btns"><button className="p-pri" disabled={!url.trim()} onClick={add}>+ Ekle</button>
        {missing.length > 0 && <button onClick={() => put([...L, ...missing.map((s) => ({ ...s, on: false }))])}>↩ Silinen hazır kaynakları geri getir</button>}</div>
      <small className="p-hint">Haberler her 30 dakikada bir otomatik güncellenir; yeni seçim ve eklemeler bir sonraki güncellemede etkili olur. Yan panelli tasarımlarda (Yayın Ekranı, Menü Panosu, Kampüs) kayan yazı yoktur.</small>
    </div>
  )
}
