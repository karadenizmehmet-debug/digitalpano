import { rows, p2, fm, bellOf } from '../lib/util.js'
export const meta = { label: 'Geri Sayım', minH: 100 }
export default function Cd({ data, now, cfg }) {
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const L0 = rows(data).map((l) => {
    const [a, ...b] = l.split(';'), [g, ay, y] = a.trim().split('.')
    const T0 = new Date(y, ay - 1, g), tt = b.join(';'), dm = Math.round((T0 - d0) / 864e5)
    if (T0.getDay() === 1 && /tatil/i.test(tt)) {
      if (dm >= 3) return { d: dm - 3, t: tt, h: 1, k: +T0 }
      if (dm >= -4) return { d: 0, t: tt, h: 2, k: +T0 }
      return { d: -1, t: tt, k: +T0 }
    }
    return { d: dm, t: tt, k: +T0 }
  }).sort((p, q) => p.k - q.k)
  let A = L0.slice()
  while (A.length > 4 && A[0].d < 0) A.shift()
  A = A.slice(0, 4)
  const B = bellOf(cfg)
  const le = B ? Math.max(0, ...String(B.data.rows || '').split('\n').map((l) => l.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)/)).filter(Boolean).map((q) => +q[3] * 60 + +q[4])) : 0
  const sn = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  A.forEach((x) => { if (x.h === 1 && x.d === 0 && le) { const z = le * 60 - sn; if (z > 0) x.rem = z; else x.h = 2 } })
  return (
    <div className="cw">
      {A.length ? A.map((x, i) => (
        <div key={i} className={'cdc ' + (x.d < 0 ? 'dn' : x.h === 2 ? 'go' : '')}>
          <b style={x.rem ? { fontSize: '1.3em' } : undefined}>
            {x.rem ? fm(x.rem) : x.d < 0 ? 'Bitti' : x.h === 2 ? 'Tatil' : x.d === 0 ? (x.h ? 'Son gün' : 'Bugün') : x.d === 1 ? 'Yarın' : x.d}
          </b>
          <small>{x.rem ? 'tatile kalan' : x.h === 2 ? 'başladı' : x.h && x.d <= 1 ? 'son ders günü' : x.d > 1 ? 'gün kaldı' : ''}</small>
          <span>{x.t}</span>
        </div>
      )) : <div className="ln">Yaklaşan tarih yok</div>}
    </div>
  )
}
