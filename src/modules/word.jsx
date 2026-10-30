import { WORDS } from '../lib/wordsData.js'
export const meta = {
  label: 'Günün Kelimesi', minH: 200,
  def: { pin: 0 },
  fields: [['pin', 'num', 'Sabit kelime sırası', '0 = her gün otomatik değişir; 1-100 = o kelimeyi göster']],
}
const L = WORDS.split('\n').filter((x) => x.trim()).map((l) => l.split('|').map((x) => x.trim()))
export const dayNo = (now) => Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5)
export default function Word({ data, now }) {
  const pin = parseInt(data.pin) || 0
  const w = L[pin > 0 ? (pin - 1) % L.length : dayNo(now) % L.length]
  return (
    <div className="gm gw">
      <div className="wh"><small>BUGÜNÜN KELİMESİ</small><b>{w[0]}</b></div>
      <div className="wt2">
        <div className="wc en"><i>EN</i><b>{w[1]}</b></div>
        <div className="wc ar"><i>AR</i><b dir="rtl" lang="ar">{w[2]}</b></div>
      </div>
    </div>
  )
}
