import { useEffect, useState } from 'react'
import { loadImage } from '../lib/firebase.js'

export const meta = {
  label: 'Manşet haber', minH: 150, bare: true,
  def: { imgs: [], sec: 6 },
  fields: [['sec', 'num', 'Geçiş süresi (sn)'], ['fill', 'check', 'Görseli bannera yay (kırpmaz, yatayda esnetir)'], ['imgs', 'slides', 'Görseller ve yazılı duyurular', 'Görseller küçültülerek yüklenir. Sırayla döner']],
}

function Pic({ x, on }) {
  const [src, setSrc] = useState(x.src || '')
  useEffect(() => {
    let dead = false
    if (!x.src && x.img) loadImage(x.img).then((v) => !dead && setSrc(v)).catch(() => {})
    return () => { dead = true }
  }, [x.img, x.src])
  return src ? <div className={'pc ' + (on ? 'on' : '')}><img src={src} className="bg" alt="" /><img src={src} alt="" /></div> : null
}

export default function Slides({ data, T }) {
  const td = new Date(); td.setHours(0, 0, 0, 0)
  const im = (data.imgs || []).filter((x) => { if (!x.d) return true; const e = new Date((x.on || '1970-01-01') + 'T00:00:00'); e.setDate(e.getDate() + x.d); return e > td })
  if (!im.length) return <div style={{ color: '#8a9bab', textAlign: 'center', paddingTop: 40 }}>Görsel veya yazılı duyuru ekleyin</div>
  const on = Math.floor(T / (data.sec || 6)) % im.length
  return (
    <div className={'sl' + (data.fill ? ' fill' : '')}>
      {im.map((x, k) => (x.src || x.img)
        ? <Pic key={x.img || k} x={x} on={k === on} />
        : <div key={k} className={'st ' + (k === on ? 'on' : '')} data-tn={x.tone || 'r'} style={{ '--f': (x.fs || 100) / 100 }}>
            <b>{x.t}</b>{x.s ? <span>{x.s}</span> : null}
          </div>)}
    </div>
  )
}
