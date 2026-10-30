// Manşet / tam ekran geçiş efektleri: [anahtar, ad]. Hepsi CSS ile çizilir (data-tr özniteliği).
export const TRANS = [
  ['', 'Yumuşak geçiş (varsayılan)'], ['mix', '🎲 Karışık (sırayla hepsi)'],
  ['sweep', 'Işık hüzmesi'], ['pixel', 'Piksel açılması'], ['mosaic', 'Mozaik açılması'], ['shatter', 'Parçalanarak açılma'],
  ['accordion', 'Akordeon'], ['page', 'Sayfa çevirme'], ['glitch', 'Dijital bozulma'], ['morph', 'Şekil dönüşümü'],
  ['xzoom', 'Çapraz yakınlaşma'], ['hblind', 'Yatay jaluzi'], ['vblind', 'Dikey jaluzi'], ['checker', 'Dama deseni'],
  ['stack', 'Üst üste kart'], ['push', 'İtme'], ['center', 'Merkezden açılma'], ['fblack', 'Siyahtan geçiş'],
  ['fwhite', 'Beyazdan geçiş'], ['burn', 'Film ışığı'],
]
const KEYS = TRANS.map((t) => t[0]).filter((k) => k && k !== 'mix')
export const trOf = (t, k) => (t === 'mix' ? KEYS[k % KEYS.length] : t || undefined)
