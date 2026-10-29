import { useEffect, useLayoutEffect, useState } from 'react'
import defaults from './defaults.json'
import { listenConfig } from './lib/firebase.js'
import Panel from './Panel.jsx'
import Stage from './Stage.jsx'

export default function App() {
  const [cfg, setCfg] = useState(defaults)
  const [loaded, setLoaded] = useState(false)  // ilk veri (önbellek ya da sunucu) geldi
  const [fresh, setFresh] = useState(false)    // sunucudan doğrulanmış güncel ayar
  const [hash, setHash] = useState(location.hash)
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
  const isPanel = hash.startsWith('#/panel')
  // Sayfa modu, ölçek hesabından ÖNCE ayarlanmalı
  useLayoutEffect(() => {
    document.body.classList.toggle('disp', !isPanel)
    document.body.classList.toggle('panelbody', isPanel)
    scrollTo(0, 0)
  }, [isPanel])
  if (!isPanel && !loaded) return null  // varsayılan ayarların bir an görünmesini önle
  return isPanel ? <Panel cfg={cfg} fresh={fresh} /> : <Stage key="display" cfg={cfg} />
}
