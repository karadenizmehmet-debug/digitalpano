import { useEffect, useState } from 'react'
import { WORDS } from '../lib/wordsData.js'
export const meta = {
  label: 'Günün Kelimesi', minH: 190,
  def: { pin: 0, sec: 4 },
  fields: [['sec', 'num', 'Dil değişim süresi (sn)', 'Türkçe → İngilizce → Arapça sırayla kart gibi döner'], ['pin', 'num', 'Sabit kelime sırası', '0 = her gün otomatik değişir; 1-100 = o kelimeyi göster']],
}
const L = WORDS.split('\n').filter((x) => x.trim()).map((l) => l.split('|').map((x) => x.trim()))
export const dayNo = (now) => Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5)
const FACE = [['TÜRKÇE', 'tr'], ['ENGLISH', 'en'], ['العربية', 'ar']]
export default function Word({ data, now }) {
  const pin = parseInt(data.pin) || 0
  const w = L[pin > 0 ? (pin - 1) % L.length : dayNo(now) % L.length]
  const [ix, setIx] = useState(0), [ph, setPh] = useState('')   // ph: '' | 'out' | 'in'
  const ms = Math.max(2, +data.sec || 4) * 1000
  useEffect(() => {
    let t1, t2, t3
    const id = setInterval(() => {
      setPh('out')
      t1 = setTimeout(() => { setIx((i) => (i + 1) % 3); setPh('in') }, 380)
      t2 = setTimeout(() => setPh(''), 780)
    }, ms)
    return () => { clearInterval(id); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [ms])
  const [lab, k] = FACE[ix]
  return (
    <div className="gm gw">
      <div className={'wcard ' + k + (ph ? ' ' + ph : '')}>
        <i>{lab}</i>
        <b dir={k === 'ar' ? 'rtl' : undefined} lang={k === 'ar' ? 'ar' : undefined}>{w[ix]}</b>
      </div>
      <div className="wdots">{FACE.map((f, j) => <u key={j} className={j === ix ? 'on' : ''} />)}</div>
    </div>
  )
}
