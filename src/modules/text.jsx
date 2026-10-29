export const meta = { label: 'Metin / Liste', minH: 100, def: {"body": "", "center": false}, fields: [["body", "area", "Satırlar", "Her satır ayrı bir madde olur"], ["center", "check", "Ortala"]] }
export default function Text({ data }) {
  return (
    <div className={data.center ? 'c' : ''}>
      {String(data.body || '').split('\n').filter((x) => x.trim()).map((l, i) => <div key={i} className="ln">{l}</div>)}
    </div>
  )
}
