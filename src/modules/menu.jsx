import { rows, p2 } from '../lib/util.js'
export const meta = { label: 'Yemek Listesi', minH: 120 }
export default function Menu({ data, now }) {
  const t = `${p2(now.getDate())}.${p2(now.getMonth() + 1)}.${now.getFullYear()}`
  const x = rows(data).map((l) => l.split(';')).find((a) => a[0].trim() === t)
  return <div className="mn">{x ? <><small>Bugün</small>{x.slice(1).join(';')}</> : 'Bugün için yemek listesi girilmemiş'}</div>
}
