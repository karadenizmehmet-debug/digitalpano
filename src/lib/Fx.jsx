// Hava efektleri: yağmur, kar, rüzgar, fırtına, sis (CSS animasyonları legacy.css içinde)
const r = (i, m, k = 37) => ((i * k + 11) % m) / m
export const FX_KINDS = ['rain', 'snow', 'wind', 'storm', 'fog']

function items(k) {
  const o = []
  if (k === 'rain' || k === 'storm') {
    const N = k === 'rain' ? 90 : 140
    for (let i = 0; i < N; i++) o.push(<i key={i} style={{ left: (r(i, 97, 41) * 125 - 10).toFixed(1) + '%', height: 28 + (i % 5) * 10, animationDuration: (0.55 + r(i, 13, 7) * 0.55).toFixed(2) + 's', animationDelay: '-' + (r(i, 29, 5) * 1.5).toFixed(2) + 's', opacity: (0.5 + (i % 4) * 0.14).toFixed(2) }} />)
    if (k === 'storm') o.push(<div key="fl" className="fl" />)
  } else if (k === 'snow') {
    for (let i = 0; i < 70; i++) { const z = 4 + (i % 6) * 1.6; o.push(<i key={i} style={{ left: (r(i, 89, 37) * 100).toFixed(1) + '%', width: z, height: z, animationDuration: (7 + r(i, 17, 5) * 8).toFixed(1) + 's', animationDelay: '-' + (r(i, 31, 3) * 14).toFixed(1) + 's', opacity: (0.65 + (i % 3) * 0.15).toFixed(2) }} />) }
  } else if (k === 'wind') {
    for (let i = 0; i < 20; i++) o.push(<i key={'w' + i} className="w" style={{ top: (r(i, 71, 29) * 95).toFixed(1) + '%', width: 160 + (i % 5) * 70, animationDuration: (1.6 + r(i, 11, 3) * 2).toFixed(1) + 's', animationDelay: '-' + (r(i, 23, 5) * 3).toFixed(1) + 's' }} />)
    for (let i = 0; i < 10; i++) o.push(<i key={'l' + i} className="lf" style={{ top: (10 + r(i, 53, 19) * 80).toFixed(1) + '%', background: ['#8aa05a', '#b98a4a', '#6f9a58'][i % 3], animationDuration: (5 + r(i, 7, 3) * 4).toFixed(1) + 's', animationDelay: '-' + (r(i, 19, 5) * 8).toFixed(1) + 's' }} />)
  } else if (k === 'fog') {
    for (let i = 0; i < 4; i++) o.push(<i key={i} style={{ top: i * 24 - 8 + '%', left: i * -8 + '%', animationDelay: '-' + i * 7 + 's', animationDuration: 22 + i * 5 + 's' }} />)
  }
  return o
}
export default function Fx({ kind }) {
  return <div className={'fx ' + kind}>{items(kind)}</div>
}
