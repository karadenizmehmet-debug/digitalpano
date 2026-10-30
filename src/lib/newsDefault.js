// Kayan yazıda duyuru yokken gösterilebilecek RSS kaynakları (panelde Ayarlar → Modüller → RSS).
// Yeni kaynak eklemek: bu listeye { id, name, tag, url } satırı eklemek yeter.
export const SOURCES = [
  { id: 'konya', name: 'Konya MEM Duyuruları', tag: 'KONYA MEM', url: 'https://konya.meb.gov.tr/meb_iys_dosyalar/xml/rss_duyurular.xml' },
  { id: 'personel', name: 'MEB Personel Genel Müdürlüğü Duyuruları', tag: 'MEB PERSONEL', url: 'https://personel.meb.gov.tr/meb_iys_dosyalar/xml/rss_duyurular.xml' },
  { id: 'basin', name: 'MEB Basın Müşavirliği Duyuruları', tag: 'MEB BASIN', url: 'https://basinmus.meb.gov.tr/meb_iys_dosyalar/xml/rss_duyurular.xml' },
  { id: 'tubitak', name: 'TÜBİTAK Haberleri', tag: 'TÜBİTAK', url: 'https://tubitak.gov.tr/tr/rss.xml' },
  { id: 'ntv', name: 'NTV Eğitim Haberleri', tag: 'EĞİTİM', url: 'https://www.ntv.com.tr/egitim.rss' },
  { id: 'hurriyet', name: 'Hürriyet Eğitim Haberleri', tag: 'EĞİTİM', url: 'https://www.hurriyet.com.tr/rss/egitim' },
]
// Kaynak listesi: panelde düzenlenmişse cfg.rssList, değilse hazır liste.
// Eski ayarlar (tkNews / rssOn / rssCustom) otomatik karşılanır.
export const listOf = (c) => {
  if (Array.isArray(c.rssList)) return c.rssList
  const on = Array.isArray(c.rssOn) ? c.rssOn : c.tkNews ? ['konya'] : []
  const L = SOURCES.map((s) => ({ ...s, on: on.includes(s.id) }))
  if (String(c.rssCustom || '').trim()) L.push({ id: 'custom', name: 'Kendi RSS adresim', url: String(c.rssCustom).trim(), on: on.includes('custom') })
  return L
}
export const activeUrls = (c) => listOf(c).filter((s) => s.on && String(s.url || '').trim()).map((s) => String(s.url).trim())
export const tagOf = (c) => {
  const A = listOf(c).filter((s) => s.on && String(s.url || '').trim())
  return A.length === 1 ? A[0].tag || 'HABER' : 'HABERLER'
}
