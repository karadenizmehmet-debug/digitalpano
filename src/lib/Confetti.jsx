const CFC = ['#ffd23f', '#ef476f', '#06d6a0', '#4cc9f0', '#ff8c42', '#b388ff']
const mk = (n, base) => Array.from({ length: n }, (_, i) => ({
  left: (i * 37 + 11) % 100, dur: (base + ((i * 13) % 40) / 10).toFixed(1), delay: (((i * 7) % 50) / 10).toFixed(1), bg: CFC[i % 6],
}))
const BIG = mk(70, 3), SMALL = mk(14, 4)
export default function Confetti({ small }) {
  const L = small ? SMALL : BIG
  return (
    <div className={'cf' + (small ? ' s' : '')}>
      {L.map((c, i) => <i key={i} style={{ left: c.left + '%', animationDuration: c.dur + 's', animationDelay: '-' + c.delay + 's', background: c.bg }} />)}
    </div>
  )
}
