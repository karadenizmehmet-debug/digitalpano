import { NEWS_TAG, NEWS_URL } from '../lib/newsDefault.js'

export function NewsEditor({ draft, set, back }) {
  return (
    <div className="p-card p-pad">
      <button onClick={back}>← Modüller</button>
      <div className="p-h" style={{ marginTop: 10 }}>📰 Konya MEM Duyuruları</div>
      <p className="p-hint">Yayında kayan duyuru yokken alttaki kayan yazıda bu kaynağın son başlıkları gösterilir. Duyuru eklediğin anda kayan yazı yine duyuruları gösterir.</p>
      <label className="p-chk"><input type="checkbox" checked={!!draft.tkNews} onChange={(e) => set({ tkNews: e.target.checked })} /> Duyuru yokken MEM duyurularını göster</label>
      <div className="p-fld"><label>Kayan yazı etiketi</label>
        <input value={draft.newsTag ?? NEWS_TAG} onChange={(e) => set({ newsTag: e.target.value })} /></div>
      <div className="p-fld"><label>RSS adresi</label>
        <input value={draft.newsUrl ?? NEWS_URL} onChange={(e) => set({ newsUrl: e.target.value.trim() })} />
        <small className="p-hint">Haberler her 30 dakikada bir otomatik güncellenir. Adres değişirse yeni liste bir sonraki güncellemede gelir. Yan panelli tasarımlarda (Yayın Ekranı, Menü Panosu, Kampüs) kayan yazı yoktur.</small></div>
    </div>
  )
}
