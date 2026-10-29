export const meta = { label: 'Görsel slayt', minH: 150, bare: true }
export default function Slides({ data, T }) {
  const im = data.imgs || []
  if (!im.length) return <div style={{ color: '#8a9bab', textAlign: 'center', paddingTop: 40 }}>Görsel veya yazılı duyuru ekleyin</div>
  const on = Math.floor(T / (data.sec || 6)) % im.length
  return (
    <div className="sl">
      {im.map((x, k) => x.src
        ? <img key={k} src={x.src} className={k === on ? 'on' : ''} />
        : <div key={k} className={'st ' + (k === on ? 'on' : '')} data-tn={x.tone || 'r'} style={{ '--f': (x.fs || 100) / 100 }}>
            <b>{x.t}</b>{x.s ? <span>{x.s}</span> : null}
          </div>)}
    </div>
  )
}
