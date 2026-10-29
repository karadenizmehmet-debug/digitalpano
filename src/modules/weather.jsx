export const meta = {
  label: 'Hava Durumu', minH: 150,
  def: {},
  // '@' ile başlayan anahtarlar modüle değil genel ayara yazılır
  fields: [['@city', 'txt', 'Şehir', 'Örn: Konya / Akşehir. Hava durumu bu şehre göre otomatik gelir'], ['@fxOn', 'check', 'Hava efektleri açık'], ['@fx', 'fx', 'Efekt', 'Otomatik: yağmur, kar, rüzgar vb. varken gösterilir. Diğerleri deneme içindir']],
}
const WC = { sun: 'Güneşli', partly: 'Parçalı bulutlu', cloud: 'Bulutlu', rain: 'Yağmurlu', wind: 'Rüzgarlı', snow: 'Karlı', storm: 'Gök gürültülü', fog: 'Sisli' }
const CL = 'M18 44h28a9 9 0 0 0 .8-18A13 13 0 0 0 21 28a8 8 0 0 0-3 16z'
const Cl = ({ f, t }) => <g transform={t || ''}><path d={CL} fill={f} stroke="#8ea3b8" strokeWidth="1.5" /></g>
const Sun = () => <><g stroke="#f6b73c" strokeWidth="4" strokeLinecap="round"><path d="M32 6v7M32 51v7M6 32h7M51 32h7M13.6 13.6l5 5M45.4 45.4l5 5M13.6 50.4l5-5M45.4 18.6l5-5" /></g><circle cx="32" cy="32" r="12" fill="#f6b73c" /></>
function Icon({ c }) {
  const I = {
    sun: <Sun />,
    partly: <><circle cx="22" cy="22" r="11" fill="#f6b73c" /><Cl f="#e6edf4" t="translate(6 4)" /></>,
    cloud: <Cl f="#d5dfe9" t="translate(0 -2)" />,
    rain: <><Cl f="#b4c2d1" t="translate(0 -8)" /><path d="M24 46l-3 8M34 46l-3 8M44 46l-3 8" stroke="#3b82d6" strokeWidth="4" strokeLinecap="round" /></>,
    snow: <><Cl f="#d5dfe9" t="translate(0 -8)" /><g fill="#6aa6e8"><circle cx="24" cy="50" r="3" /><circle cx="34" cy="55" r="3" /><circle cx="44" cy="50" r="3" /></g></>,
    storm: <><Cl f="#9fb0c2" t="translate(0 -8)" /><path d="M34 42l-8 12h7l-3 9 11-14h-7z" fill="#f6b73c" /></>,
    wind: <><Cl f="#d5dfe9" t="translate(0 -10)" /><path d="M10 46h30a6 6 0 1 0-6-6M14 56h20a5 5 0 1 1-5 5" fill="none" stroke="#6aa6e8" strokeWidth="4" strokeLinecap="round" /></>,
    fog: <><Cl f="#d5dfe9" t="translate(0 -8)" /><path d="M16 50h32M20 57h26" stroke="#9fb2c5" strokeWidth="4" strokeLinecap="round" /></>,
  }
  return <svg viewBox="0 0 64 64">{I[c] || I.cloud}</svg>
}
export default function Weather({ cfg, wx }) {
  if (!cfg.city) return <div className="wt"><div className="wx"><div className="wd"><b>Şehir girin</b><span>Panel → Modüller → Hava Durumu</span></div></div></div>
  if (!wx || wx.err) return <div className="wt"><div className="wx"><div className="wd"><b>{wx?.err ? 'Hava durumu alınamıyor' : 'Hava durumu alınıyor…'}</b><span>{cfg.city}</span></div></div></div>
  return (
    <div className="wt">
      <div className="wx">
        <div className="wi"><Icon c={wx.c} /></div>
        <div className="wtt">{wx.t}°</div>
        <div className="wd"><b>{WC[wx.c] || ''}</b><span>{cfg.city}</span><span>↑ {wx.hi}° ↓ {wx.lo}°</span></div>
      </div>
    </div>
  )
}
