import { TASKS } from '../lib/tasksData.js'
export const meta = {
  label: 'Günün Görevi', minH: 130,
  def: { pin: 0 },
  fields: [['pin', 'num', 'Sabit görev sırası', '0 = her gün otomatik değişir; 1-100 = o görevi göster']],
}
const L = TASKS.split('\n').filter((x) => x.trim())
const dayNo = (now) => Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5)
export default function Task({ data, now }) {
  const pin = parseInt(data.pin) || 0
  const t = L[pin > 0 ? (pin - 1) % L.length : dayNo(now) % L.length]
  const len = t.length
  return (
    <div className="gm">
      <div className={'gx ' + (len < 60 ? 'gs' : len < 110 ? 'gmd' : 'gl')}><em>⭐ BUGÜNÜN GÖREVİ</em><span>{t}</span></div>
    </div>
  )
}
