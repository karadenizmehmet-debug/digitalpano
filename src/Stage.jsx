import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { registry } from './lib/registry.js'
import { alertOn } from './lib/alert.js'
import { specialVisible } from './lib/special.js'
import { isNight } from './lib/night.js'
import { MON, p2 } from './lib/util.js'
import Confetti from './lib/Confetti.jsx'
import { loadImage } from './lib/firebase.js'
import { useLive } from './lib/weather.js'
import { visibleTicker } from './lib/ticker.js'
import { colSnap, reflow } from './lib/reflow.js'
import Fx, { FX_KINDS } from './lib/Fx.jsx'

export function useImg(d) {
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

const snap = (v) => Math.round(v / 10) * 10

// Pano sahnesi: 1600x900'lük sabit alan, kabına sığacak şekilde ölçeklenir.
// preview: panel içi önizleme (örtüler ve efektler kapalı). edit: { sel, onSelect, onChange(mods) } sürükle-bırak için.
export default function Stage({ cfg, preview = false, edit = null }) {
  const [now, setNow] = useState(new Date())
  const [T, setT] = useState(0)
  const [fit, setFit] = useState({ sc: 1, x: 0, y: 0 })
  const sw = useRef()
  const drag = useRef(null)

  useEffect(() => {
    const id = setInterval(() => { setNow(new Date()); setT((t) => t + 1) }, 1000)
    return () => clearInterval(id)
  }, [])
  // Pano ekranı: her gece 03:00'te sayfayı yenile (yeni sürüm gelirse yüklensin, bellek temizlensin)
  useEffect(() => {
    if (preview) return
    const n = new Date(), t = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 3, 0, 0)
    if (t <= n) t.setDate(t.getDate() + 1)
    const id = setTimeout(() => location.reload(), t - n)
    return () => clearTimeout(id)
  }, [preview])
  useLayoutEffect(() => {
    const f = () => {
      if (!sw.current) return
      const w = sw.current.clientWidth, h = sw.current.clientHeight, sc = Math.min(w / 1600, h / 900) || 1
      setFit({ sc, x: (w - 1600 * sc) / 2, y: (h - 900 * sc) / 2 })
    }
    f()
    addEventListener('resize', f)
    const ro = typeof ResizeObserver !== 'undefined' && sw.current ? new ResizeObserver(f) : null
    if (ro) ro.observe(sw.current)
    const t = setTimeout(f, 150)
    return () => { removeEventListener('resize', f); ro && ro.disconnect(); clearTimeout(t) }
  }, [])

  const wmod = cfg.mods.find((m) => m.type === 'weather' && m.active)
  const wx = useLive(cfg.city, !!wmod && !!cfg.city)
  // Canlı veri açıksa yalnızca ona bakılır (yüklenirken elle girilen duruma düşmez); kapalıysa elle girilen durum kullanılır
  const cond = wx && !wx.err ? wx.c : undefined
  const fxMode = cfg.fxOn === false || cfg.fx === 'off' ? 'off' : (cfg.fx || 'auto')
  const fxKind = fxMode === 'off' || (preview && fxMode === 'auto') ? '' : (fxMode === 'auto' ? cond : fxMode)
  const sp = preview ? null : specialVisible(cfg.sd, now)
  const spImg = useImg(sp)
  const logo = useImg({ img: cfg.logo, imgId: cfg.logoId })
  const night = !preview && !(cfg.sd || []).some((d) => d.now) && isNight(cfg, now)

  const sl = [cfg.slogan, cfg.city, cfg.url].filter(Boolean).join('  •  ')
  const tk = visibleTicker(cfg.ticker, now)
  const q = tk.map((x, i) => <span key={i}>{x}</span>)
  const minOf = (m) => registry[m.type]?.minH

  // ---- sürükle / boyutlandır ----
  const down = (e, m, mode) => {
    if (!edit) return
    e.preventDefault(); e.stopPropagation()
    edit.onSelect(m.id)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { id: m.id, mode, sx: e.clientX, sy: e.clientY, o: { x: m.x, y: m.y, w: m.w, h: m.h } }
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    const dx = (e.clientX - d.sx) / fit.sc, dy = (e.clientY - d.sy) / fit.sc
    const mods = cfg.mods.map((m) => {
      if (m.id !== d.id) return m
      if (d.mode === 'move') return { ...m, x: snap(d.o.x + dx), y: snap(d.o.y + dy) }
      return { ...m, w: Math.max(120, snap(d.o.w + dx)), h: Math.max(minOf(m) || 60, snap(d.o.h + dy)) }
    })
    edit.onChange(mods)
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const mods = cfg.mods.map((m) => ({ ...m }))
    const m = mods.find((x) => x.id === d.id)
    if (m && d.mode === 'move') colSnap(m)
    if (cfg.autoFlow !== false) reflow(mods, m, minOf)
    edit.onChange(mods)
  }

  return (
    <div ref={sw} id={preview ? undefined : 'sw'} className={'stg' + (preview ? ' stg-pv' : '') + (edit ? ' edit' : '')}
      onPointerMove={edit ? move : undefined} onPointerUp={edit ? up : undefined} onPointerCancel={edit ? up : undefined}>
      <div
        className="stage"
        data-th={cfg.theme || 0}
        style={{
          background: cfg.bg, transform: `translate(${fit.x}px,${fit.y}px) scale(${fit.sc})`,
          '--cr': cfg.c1 || '#b3262e', '--nv': cfg.c2 || '#1b2a5c', '--gd': cfg.c3 || '#dcb43c', '--sc': fit.sc,
        }}
      >
        <div className="hdr">
          {logo ? <img src={logo} /> : null}
          <div className="hb"><div className="n">{cfg.name}</div>{sl ? <div className="s">{sl}</div> : null}</div>
        </div>
        {cfg.mods.filter((m) => m.active || edit).map((m) => {
          const R = registry[m.type]
          const title = m.type === 'slides' ? m.showTitle : m.showTitle !== false
          return (
            <div key={m.id} className={`mod t-${m.type}${edit && edit.sel === m.id ? ' sel' : ''}${m.active ? '' : ' off'}`} data-id={m.id}
              style={{ left: m.x, top: m.y, width: m.w, height: m.h, '--fs': (m.fs || 100) / 100, '--c': m.color }}
              onPointerDown={edit ? (e) => down(e, m, 'move') : undefined}>
              {title && <div className="h">{m.title}</div>}
              <div className="b" style={m.type === 'slides' ? { padding: 0 } : undefined}>
                {R ? <R.Component data={m.data} now={now} T={T} cfg={cfg} wx={wx} /> : <div className="ln">Bilinmeyen modül: {m.type}</div>}
              </div>
              {edit && <div className="rs" onPointerDown={(e) => down(e, m, 'size')} />}
            </div>
          )
        })}
        {FX_KINDS.includes(fxKind) && <Fx kind={fxKind} />}
        {sp && (
          <div className={'ovl' + (spImg ? ' im' : '')} style={{ '--f': (sp.fs || 100) / 100 }}>
            {spImg ? <img src={spImg} /> : <><b>{sp.title}</b><span>{sp.sub}</span></>}
            {sp.conf && <Confetti />}
          </div>
        )}
        {night && (
          <div className="nmo">
            <div className="nmc">
              <div className="nt">{p2(now.getHours())}:{p2(now.getMinutes())}</div>
              <div className="nd">{now.getDate()} {MON[now.getMonth()]} {now.getFullYear()}</div>
              <div className="nn">{cfg.name}</div>
            </div>
          </div>
        )}
        {!preview && alertOn(cfg.al, now.getTime()) && (
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
