// Kayan yazıda duyuru yokken gösterilebilecek RSS kaynakları (panelde Ayarlar → Modüller → RSS).
// Yeni kaynak eklemek: bu listeye { id, name, tag, url } satırı eklemek yeter.
export const SOURCES = [
  { id: 'konya', name: 'Konya MEM Duyuruları', tag: 'KONYA MEM', url: 'https://konya.meb.gov.tr/meb_iys_dosyalar/xml/rss_duyurular.xml' },
  { id: 'personel', name: 'MEB Personel Genel Müdürlüğü Duyuruları', tag: 'MEB PERSONEL', url: 'https://personel.meb.gov.tr/meb_iys_dosyalar/xml/rss_duyurular.xml' },
  { id: 'ntv', name: 'NTV Eğitim Haberleri', tag: 'EĞİTİM', url: 'https://www.ntv.com.tr/egitim.rss' },
  { id: 'hurriyet', name: 'Hürriyet Eğitim Haberleri', tag: 'EĞİTİM', url: 'https://www.hurriyet.com.tr/rss/egitim' },
]
// İşaretli kaynak kimlikleri. Eski ayar (tkNews açık, kaynak seçimi yok) = yalnızca Konya MEM.
export const activeIds = (c) => (Array.isArray(c.rssOn) ? c.rssOn : c.tkNews ? ['konya'] : [])
export const activeUrls = (c) => {
  const ids = activeIds(c), u = SOURCES.filter((s) => ids.includes(s.id)).map((s) => s.url)
  if (ids.includes('custom') && String(c.rssCustom || '').trim()) u.push(String(c.rssCustom).trim())
  return u
}
export const tagOf = (c) => {
  const ids = activeIds(c)
  if (ids.length === 1) { const s = SOURCES.find((x) => x.id === ids[0]); if (s) return s.tag }
  return 'HABERLER'
}
