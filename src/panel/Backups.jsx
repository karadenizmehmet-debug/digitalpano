import { useState } from 'react'

// Firestore REST biçimini (stringValue, mapValue…) düz nesneye çevirir
export const fsVal = (v) => {
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

export const REPO = 'karadenizmehmet-debug/digitalpano'

export function AutoBackups({ onLoad, say }) {
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
