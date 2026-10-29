const COL = ['#ffd23f', '#ef476f', '#06d6a0', '#4cc9f0', '#ff8c42', '#b388ff', '#ffffff']
const BURSTS = [[18, 30], [50, 22], [82, 32], [32, 62], [68, 58], [10, 70], [90, 66], [50, 48]]
export default function Fireworks() {
  return (
    <div className="fw">
      {BURSTS.map(([x, y], b) => (
        <div key={b} className="fwb" style={{ left: x + '%', top: y + '%', '--dl': ((b * 0.55) % 3.2).toFixed(2) + 's', '--cl': COL[b % COL.length] }}>
          {Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--a': (i * 360 / 28) + 'deg', '--d': (170 + (i % 3) * 60) + 'px' }} />)}
          <u />
        </div>))}
    </div>
  )
}
