import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import defaults from './defaults.js'
import { registry } from './lib/registry.js'
import { listenConfig } from './lib/firebase.js'

const W = 1600, H = 900

export default function App() {
  const [cfg, setCfg] = useState(defaults)
  const [scale, setScale] = useState(1)
  const ref = useRef()

  useEffect(() => listenConfig(setCfg), [])

  useLayoutEffect(() => {
    const fit = () => setScale(Math.min(innerWidth / W, innerHeight / H))
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])

  return (
    <div className="screen">
      <div className="stage" ref={ref} style={{ width: W, height: H, transform: `translate(-50%,-50%) scale(${scale})` }}>
        <header className="hd">{cfg.name}</header>
        {cfg.mods.filter((m) => m.active).map((m) => {
          const R = registry[m.type]
          return (
            <section key={m.id} className="mod" style={{ left: m.x, top: m.y, width: m.w, height: m.h }}>
              {m.title && <h3>{m.title}</h3>}
              {R ? <R.Component data={m.data} /> : <div className="mod-pad">Bilinmeyen modül: {m.type}</div>}
            </section>
          )
        })}
        <footer className="ft">{cfg.ticker}</footer>
      </div>
    </div>
  )
}
