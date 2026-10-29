import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import defaults from './defaults.json'
import { registry } from './lib/registry.js'
import { listenConfig } from './lib/firebase.js'
import Panel from './Panel.jsx'
import { alertOn } from './lib/alert.js'
import { specialVisible } from './lib/special.js'
import Confetti from './lib/Confetti.jsx'
import { loadImage } from './lib/firebase.js'

// Pano 1600x900'lük sabit bir sahnedir; ekrana sığacak şekilde ölçeklenir.
function useImg(d) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let dead = false
    if (d?.img) setSrc(d.img)
    else if (d?.imgId) loadImage(d.imgId).then((v) => !dead && setSrc(v)).catch(() => {})
    else setSrc('')
    return () => { dead = true }
  }, [d?.img, d?.imgId])
  return src
}

export default function App() {
  const [cfg, setCfg] = useState(defaults)
  const [now, setNow] = useState(new Date())
  const [T, setT] = useState(0)
  const [fit, setFit] = useState({ sc: 1, x: 0, y: 0 })
  const sw = useRef()
  const [hash, setHash] = useState(location.hash)
  useEffect(() => { const h = () => setHash(location.hash); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])

  useEffect(() => listenConfig(setCfg), [])
  useEffect(() => {
    const id = setInterval(() => { setNow(new Date()); setT((t) => t + 1) }, 1000)
    return () => clearInterval(id)
  }, [])
  const isPanel = hash.startsWith('#/panel')
  // Sayfa modu, ölçek hesabından ÖNCE ayarlanmalı
  useLayoutEffect(() => {
    document.body.classList.toggle('disp', !isPanel)
    document.body.classList.toggle('panelbody', isPanel)
  }, [isPanel])
  useLayoutEffect(() => {
    const f = () => {
      if (!sw.current) return
      const w = sw.current.clientWidth, h = sw.current.clientHeight, sc = Math.min(w / 1600, h / 900)
      setFit({ sc, x: (w - 1600 * sc) / 2, y: (h - 900 * sc) / 2 })
    }
    f()
    scrollTo(0, 0)
    addEventListener('resize', f)
    // Kap elemanının boyutu değişince (geçiş, adres çubuğu vb.) yeniden ölç
    const ro = typeof ResizeObserver !== 'undefined' && sw.current ? new ResizeObserver(f) : null
    if (ro) ro.observe(sw.current)
    const t = setTimeout(f, 150)
    return () => { removeEventListener('resize', f); ro && ro.disconnect(); clearTimeout(t) }
  }, [isPanel])

  const sp = isPanel ? null : specialVisible(cfg.sd, now)
  const spImg = useImg(sp)
  if (isPanel) return <Panel cfg={cfg} />

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
        {sp && (
          <div className={'ovl' + (spImg ? ' im' : '')} style={{ '--f': (sp.fs || 100) / 100 }}>
            {spImg ? <img src={spImg} /> : <><b>{sp.title}</b><span>{sp.sub}</span></>}
            {sp.conf && <Confetti />}
          </div>
        )}
        {alertOn(cfg.al, now.getTime()) && (
          <div className="alr" data-t={cfg.al.tone || 'r'} style={{ '--f': (cfg.al.fs || 100) / 100, '--i': (cfg.al.is || 100) / 100 }}>
            {cfg.al.ic ? <i>{cfg.al.ic}</i> : null}
            <b>{cfg.al.title}</b>
            <span>{cfg.al.text}</span>
          </div>
        )}
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
