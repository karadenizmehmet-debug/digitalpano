import { SOURCES, activeIds } from '../lib/newsDefault.js'

export function RssEditor({ draft, set, back }) {
  const on = activeIds(draft)
  const tog = (id, v) => set({ rssOn: v ? [...on.filter((x) => x !== id), id] : on.filter((x) => x !== id) })
  return (
    <div className="p-card p-pad">
      <button onClick={back}>← Modüller</button>
      <div className="p-h" style={{ marginTop: 10 }}>📰 RSS haber kaynakları</div>
      <p className="p-hint">Yayında kayan duyuru yokken alttaki kayan yazıda <b>işaretlediğiniz kaynakların</b> son başlıkları gösterilir. Birden fazla işaretlerseniz başlıklar sırayla karışır. Duyuru eklediğiniz anda kayan yazı yine duyuruları gösterir. Hiçbiri işaretli değilse bu özellik kapalıdır.</p>
      {SOURCES.map((s) => (
        <label key={s.id} className="p-chk" style={{ alignItems: 'flex-start' }}>
          <input type="checkbox" checked={on.includes(s.id)} onChange={(e) => tog(s.id, e.target.checked)} />
          <span style={{ minWidth: 0, wordBreak: "break-all" }}>{s.name}<br /><small className="p-hint">{s.url.replace('https://', '')}</small></span>
        </label>))}
      <label className="p-chk"><input type="checkbox" checked={on.includes('custom')} onChange={(e) => tog('custom', e.target.checked)} /> Kendi RSS adresim</label>
      {on.includes('custom') && <div className="p-fld"><input value={draft.rssCustom || ''} onChange={(e) => set({ rssCustom: e.target.value.trim() })} placeholder="https://…/rss.xml" /></div>}
      <small className="p-hint">Haberler her 30 dakikada bir otomatik güncellenir; yeni seçim bir sonraki güncellemede etkili olur. Yan panelli tasarımlarda (Yayın Ekranı, Menü Panosu, Kampüs) kayan yazı yoktur.</small>
    </div>
  )
}
