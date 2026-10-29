import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import defaults from './defaults.json'
import { registry } from './lib/registry.js'
import { listenConfig } from './lib/firebase.js'

// Pano 1600x900'lük sabit bir sahnedir; ekrana sığacak şekilde ölçeklenir.
export default function App() {
  const [cfg, setCfg] = useState(defaults)
  const [now, setNow] = useState(new Date())
  const [T, setT] = useState(0)
  const [fit, setFit] = useState({ sc: 1, x: 0, y: 0 })
  const sw = useRef()

  useEffect(() => listenConfig(setCfg), [])
  useEffect(() => {
    const id = setInterval(() => { setNow(new Date()); setT((t) => t + 1) }, 1000)
    return () => clearInterval(id)
  }, [])
  useLayoutEffect(() => {
    const f = () => {
      const w = sw.current.clientWidth, h = sw.current.clientHeight, sc = Math.min(w / 1600, h / 900)
      setFit({ sc, x: (w - 1600 * sc) / 2, y: (h - 900 * sc) / 2 })
    }
    f()
    addEventListener('resize', f)
    return () => removeEventListener('resize', f)
  }, [])

  const sl = [cfg.slogan, cfg.city, cfg.url].filter(Boolean).join('  •  ')
  const tk = String(cfg.ticker || '').split('\n').filter((x) => x.trim())
  const q = tk.map((x, i) => <span key={i}>{x}</span>)

  return (
    <div id="sw" ref={sw}>
      <div
        className="stage"
        data-th={cfg.theme || 0}
        style={{
          background: cfg.bg, transform: `translate(${fit.x}px,${fit.y}px) scale(${fit.sc})`,
          '--cr': cfg.c1 || '#b3262e', '--nv': cfg.c2 || '#1b2a5c', '--gd': cfg.c3 || '#dcb43c', '--sc': fit.sc,
        }}
      >
        <div className="hdr">
          {cfg.logo ? <img src={cfg.logo} /> : null}
          <div className="hb"><div className="n">{cfg.name}</div>{sl ? <div className="s">{sl}</div> : null}</div>
        </div>
        {cfg.mods.filter((m) => m.active).map((m) => {
          const R = registry[m.type]
          const title = m.type === 'slides' ? m.showTitle : m.showTitle !== false
          return (
            <div key={m.id} className={`mod t-${m.type}`} data-id={m.id}
              style={{ left: m.x, top: m.y, width: m.w, height: m.h, '--fs': (m.fs || 100) / 100, '--c': m.color }}>
              {title && <div className="h">{m.title}</div>}
              <div className="b" style={m.type === 'slides' ? { padding: 0 } : undefined}>
                {R ? <R.Component data={m.data} now={now} T={T} cfg={cfg} /> : <div className="ln">Bilinmeyen modül: {m.type}</div>}
              </div>
            </div>
          )
        })}
        {tk.length > 0 && (
          <div className="ftr">
            <div className="tg">DUYURU</div>
            <div className="mq"><div style={{ '--d': Math.max(40, tk.join('').length * 0.6) + 's' }}>{[...Array(6)].flatMap(() => q)}</div></div>
          </div>
        )}
      </div>
    </div>
  )
}
