import { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react'
import defaults from './defaults.json'
import { listenConfig, fetchServerConfig } from './lib/firebase.js'
import Stage from './Stage.jsx'

// Panel kodu yalnızca #/panel açılınca indirilir; pano ekranı (eski PC) onu hiç yüklemez.
// Yeni sürüm yayınlanınca eski parça dosyası silinir; indirilemezse sayfa bir kez yenilenir.
const Panel = lazy(() => import('./Panel.jsx').then((m) => { try { sessionStorage.removeItem('pnlRetry') } catch {} return m }, (e) => {
  let again = false
  try { again = !sessionStorage.getItem('pnlRetry'); sessionStorage.setItem('pnlRetry', '1') } catch {}
  if (again) { location.reload(); return new Promise(() => {}) }
  throw e
}))

export default function App() {
  const [cfg, setCfg] = useState(defaults)
  const [loaded, setLoaded] = useState(false)  // ilk veri (önbellek ya da sunucu) geldi
  const [fresh, setFresh] = useState(false)    // sunucudan doğrulanmış güncel ayar
  const [err, setErr] = useState('')
  const [hash, setHash] = useState(location.hash)
  // Pano ekranı (TV) günlerce açık kalır: yeni sürümler gelsin diye gece 03:00'te bir kez sayfayı yeniler
  useEffect(() => {
    const t0 = Date.now()
    const id = setInterval(() => {
      const n = new Date()
      if (!location.hash.startsWith('#/panel') && n.getHours() === 3 && n.getMinutes() < 2 && Date.now() - t0 > 3600e3) location.reload()
    }, 30000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => { const h = () => setHash(location.hash); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 4000)  // hiç veri gelmezse yerleşik varsayılanlarla aç
    const un = listenConfig((d, meta) => {
      if (d) setCfg(d)
      setLoaded(true)
      if (!meta.fromCache) setFresh(true)
    })
    return () => { clearTimeout(t); un() }
  }, [])
  // Panel için: sunucudan doğrulanana kadar (başarısızsa 5 sn'de bir yeniden deneyerek) bekle
  useEffect(() => {
    if (fresh) return
    let dead = false, id
    const go = () => fetchServerConfig().then((d) => { if (dead) return; if (d) setCfg(d); setLoaded(true); setFresh(true); setErr('') })
      .catch((e) => { if (!dead) { setErr(e.code || e.message || String(e)); id = setTimeout(go, 5000) } })
    go()
    return () => { dead = true; clearTimeout(id) }
  }, [fresh])
  const isPanel = hash.startsWith('#/panel')
  // Sayfa modu, ölçek hesabından ÖNCE ayarlanmalı
  useLayoutEffect(() => {
    document.body.classList.toggle('disp', !isPanel)
    document.body.classList.toggle('panelbody', isPanel)
    scrollTo(0, 0)
  }, [isPanel])
  if (!isPanel && !loaded) return null  // varsayılan ayarların bir an görünmesini önle
  return isPanel ? <Suspense fallback={<div className="pnl"><p>Panel yükleniyor…</p></div>}><Panel cfg={cfg} fresh={fresh} err={err} /></Suspense> : <Stage key="display" cfg={cfg} />
}
