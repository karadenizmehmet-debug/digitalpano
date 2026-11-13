import { useEffect, useState } from 'react'
import { listenNews } from './firebase.js'
// Haber başlıkları: önce Firestore'daki canlı liste (config/haber; GitHub Actions 30 dk'da bir günceller, site yeniden yayınlanmaz).
// O liste yoksa/boşsa siteyle birlikte yayınlanan haber.json yedeği kullanılır.
export function useNews(on) {
  const [live, setLive] = useState([])
  const [file, setFile] = useState([])
  useEffect(() => {
    if (!on) { setLive([]); setFile([]); return }
    let dead = false
    const un = listenNews((items) => { if (!dead) setLive(items) })
    const load = () => fetch(import.meta.env.BASE_URL + 'haber.json?t=' + Math.floor(Date.now() / 600000), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null)).then((d) => { if (!dead && d && Array.isArray(d.items)) setFile(d.items) }).catch(() => {})
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { dead = true; un(); clearInterval(id) }
  }, [on])
  return live.length ? live : file
}
