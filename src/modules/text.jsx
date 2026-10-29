export const meta = { label: 'Metin / Liste', minH: 100 }
export default function Text({ data }) {
  return (
    <div className={data.center ? 'c' : ''}>
      {String(data.body || '').split('\n').filter((x) => x.trim()).map((l, i) => <div key={i} className="ln">{l}</div>)}
    </div>
  )
}
