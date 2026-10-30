import { WORDS } from '../lib/wordsData.js'
export const meta = {
  label: 'Günün Kelimesi', minH: 190,
  def: { pin: 0 },
  fields: [['pin', 'num', 'Sabit kelime sırası', '0 = her gün otomatik değişir; 1-100 = o kelimeyi göster']],
}
const parse = () => WORDS.split('\n').filter((x) => x.trim()).map((l) => l.split('|').map((x) => x.trim()))
const L = parse()
export const dayNo = (now) => Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5)
export default function Word({ data, now }) {
  const pin = parseInt(data.pin) || 0
  const w = L[pin > 0 ? (pin - 1) % L.length : dayNo(now) % L.length]
  return (
    <div className="gm gw">
      <div className="wr"><small>TÜRKÇE</small><b>{w[0]}</b></div>
      <div className="wr"><small>ENGLISH</small><b>{w[1]}</b></div>
      <div className="wr ga"><small>العربية</small><b dir="rtl" lang="ar">{w[2]}</b></div>
    </div>
  )
}
