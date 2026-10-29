// Firestore bağlı değilken kullanılan örnek ayarlar. Kişisel veri içermez.
export default {
  name: 'Okul Adı',
  ticker: 'Okulumuza hoş geldiniz',
  mods: [
    { id: 'm1', type: 'clock', title: 'Tarih ve Saat', active: true, x: 1180, y: 12, w: 400, h: 92, data: {} },
    { id: 'm2', type: 'text', title: 'Duyuru', active: true, x: 20, y: 124, w: 440, h: 200, data: { text: 'Duyurular panelden düzenlenir.' } },
    { id: 'm3', type: 'cnt', title: 'LGS', active: true, x: 480, y: 124, w: 640, h: 120, data: { name: 'LGS’ye kalan süre', at: '2027-06-22T14:00' } },
  ],
}
