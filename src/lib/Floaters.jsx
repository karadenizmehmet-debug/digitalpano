// Balon ve yıldız efektleri (özel günler için)
const BAL = ['🎈', '🎈', '🎈', '🎉', '🎈', '🎁']
export function Balloons() {
  return (
    <div className="flo">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ left: ((i * 29 + 7) % 96) + '%', fontSize: 54 + (i % 4) * 14, animationDuration: (9 + (i % 5) * 1.7).toFixed(1) + 's', animationDelay: '-' + ((i * 1.3) % 9).toFixed(1) + 's' }}>{BAL[i % BAL.length]}</i>
      ))}
    </div>
  )
}
export function Stars() {
  return (
    <div className="flo st">
      {Array.from({ length: 36 }, (_, i) => (
        <i key={i} style={{ left: ((i * 41 + 5) % 97) + '%', top: ((i * 23 + 9) % 92) + '%', fontSize: 18 + (i % 4) * 10, animationDuration: (1.6 + (i % 5) * 0.5).toFixed(1) + 's', animationDelay: '-' + ((i * 0.7) % 4).toFixed(1) + 's' }}>{i % 3 ? '✦' : '✨'}</i>
      ))}
    </div>
  )
}
