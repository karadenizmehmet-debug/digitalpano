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

const HE = ['❤️', '💖', '💕', '❤️', '💗']
export function Hearts() {
  return (
    <div className="flo">
      {Array.from({ length: 18 }, (_, i) => (
        <i key={i} style={{ left: ((i * 31 + 3) % 96) + '%', fontSize: 40 + (i % 4) * 14, animationDuration: (8 + (i % 5) * 1.5).toFixed(1) + 's', animationDelay: '-' + ((i * 1.1) % 8).toFixed(1) + 's' }}>{HE[i % HE.length]}</i>
      ))}
    </div>
  )
}
const PE = ['🌸', '🌷', '🌺', '🌼', '🌸']
export function Petals() {
  return (
    <div className="flo dn">
      {Array.from({ length: 26 }, (_, i) => (
        <i key={i} style={{ left: ((i * 37 + 9) % 98) + '%', fontSize: 28 + (i % 4) * 9, animationDuration: (7 + (i % 6) * 1.4).toFixed(1) + 's', animationDelay: '-' + ((i * 0.9) % 8).toFixed(1) + 's' }}>{PE[i % PE.length]}</i>
      ))}
    </div>
  )
}
function Flag({ id, style }) {
  return (
    <svg className="flg" viewBox="0 0 300 200" style={style}>
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="1" seed="2" result="n">
            <animate attributeName="baseFrequency" dur="4s" values="0.012 0.035;0.018 0.045;0.012 0.035" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={'url(#' + id + ')'}>
        <rect width="300" height="200" fill="#e30a17" />
        <circle cx="105" cy="100" r="50" fill="#fff" />
        <circle cx="120" cy="100" r="40" fill="#e30a17" />
        <polygon fill="#fff" points="185,100 164,106 164,129 150,110 129,117 142,100 129,83 150,90 164,71 164,94" transform="translate(4 0)" />
      </g>
    </svg>
  )
}
export function Flags() {
  return (
    <div className="flo flgs">
      <Flag id="fa" style={{ left: '2%', top: '4%' }} />
      <Flag id="fb" style={{ right: '2%', top: '4%' }} />
      <Flag id="fc" style={{ left: '2%', bottom: '4%' }} />
      <Flag id="fd" style={{ right: '2%', bottom: '4%' }} />
    </div>
  )
}
export function Frame() { return <div className="lfr" /> }
