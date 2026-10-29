import { useEffect, useState } from 'react'

export const meta = { label: 'Geri Sayım', minH: 116 }

export default function Countdown({ data }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, new Date(data?.at).getTime() - now)
  const d = Math.floor(left / 864e5)
  const h = Math.floor(left / 36e5) % 24
  const m = Math.floor(left / 6e4) % 60
  return (
    <div className="mod-center">
      <div className="sub">{data?.name}</div>
      <div className="big">{d} gün {h} sa {m} dk</div>
    </div>
  )
}
