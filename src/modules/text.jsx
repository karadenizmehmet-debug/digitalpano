export const meta = { label: 'Yazı / Duyuru', minH: 100 }

export default function Text({ data }) {
  return <div className="mod-pad pre">{data?.text}</div>
}
