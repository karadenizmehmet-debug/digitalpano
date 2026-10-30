import { useEffect, useState } from 'react'
// Yayındaki haber.json dosyasını (GitHub Actions her 30 dk'da günceller) okur. Firestore kullanmaz.
export function useNews(on) {
  const [list, setList] = useState([])
  useEffect(() => {
    if (!on) { setList([]); return }
    let dead = false
    const load = () => fetch(import.meta.env.BASE_URL + 'haber.json?t=' + Math.floor(Date.now() / 600000), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null)).then((d) => { if (!dead && d && Array.isArray(d.items)) setList(d.items) }).catch(() => {})
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => { dead = true; clearInterval(id) }
  }, [on])
  return list
}
