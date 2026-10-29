import { useEffect, useState } from 'react'

export const meta = { label: 'Tarih ve Saat', minH: 80 }

export default function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="mod-center">
      <div className="big">{now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
      <div className="sub">{now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}</div>
    </div>
  )
}
