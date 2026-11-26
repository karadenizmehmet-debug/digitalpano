import { ALI, NumIn, isoLocal } from './common.jsx'
import { alertStatus } from '../lib/alert.js'
import Stage from '../Stage.jsx'

export function AlertEditor({ al, set, draft }) {
  const a = { on: false, title: 'ACİL DUYURU', text: '', tone: 'r', ic: '', ...al }
  const up = (p) => set({ ...a, ...p })
  return (
    <div className="p-body p-alwrap">
      <div className="p-alpv"><label>Önizleme (şu anki ayarlarla)</label>
        <div className="stg-pv"><Stage preview cfg={draft} alertPv={a} /></div>
      </div>
      <div className="p-alform">
      <p className="p-hint">Açtığınız anda pano tam ekran acil duyuruya geçer (her şeyin üstünde görünür). Yayınla'dan sonra panoya yansır.</p>
      <div className="p-fld"><label>Simge</label>
        <div className="p-ico">
          <button className={!a.ic ? 'p-on' : ''} onClick={() => up({ ic: '' })}>Yok</button>
          {ALI.map((x) => <button key={x} className={a.ic === x ? 'p-on' : ''} onClick={() => up({ ic: x })}>{x}</button>)}
        </div>
      </div>
      <div className="p-fld"><label>Başlık</label><input value={a.title} onChange={(e) => up({ title: e.target.value })} /></div>
      <div className="p-fld"><label>Duyuru metni</label><textarea rows={4} value={a.text} onChange={(e) => up({ text: e.target.value })} /></div>
      <div className="p-pos">
        <div className="p-fld"><label>Simge %</label><NumIn value={a.is || 100} onChange={(e) => up({ is: +e.target.value })} /></div>
        <div className="p-fld"><label>Yazı %</label><NumIn value={a.fs || 100} onChange={(e) => up({ fs: +e.target.value })} /></div>
        <div className="p-fld"><label>Renk</label>
          <select value={a.tone} onChange={(e) => up({ tone: e.target.value })}><option value="r">Kırmızı</option><option value="o">Turuncu</option><option value="b">Mavi</option></select></div>
        <div className="p-fld"><label>Ne kadar kalsın</label><select value={a.dur || 0} onChange={(e) => up({ dur: +e.target.value })}>{[[0, 'Ben kapatana kadar'], [5, '5 dakika'], [10, '10 dakika'], [15, '15 dakika'], [30, '30 dakika'], [60, '1 saat'], [120, '2 saat'], [240, '4 saat']].concat([5, 10, 15, 30, 60, 120, 240, 0].includes(+a.dur || 0) ? [] : [[+a.dur, a.dur + ' dakika']]).map(([x, y]) => <option key={x} value={x}>{y}</option>)}</select></div>
      </div>
      <div className="p-fld"><label>Ne zaman başlasın</label>
        <select value={a.from ? 'z' : 'h'} onChange={(e) => up({ from: e.target.value === 'h' ? '' : isoLocal(new Date(Date.now() + 36e5)) })}><option value="h">Hemen (Yayınla'ya basınca)</option><option value="z">Belirli tarih ve saatte</option></select>
        {a.from ? <input type="datetime-local" value={a.from} onChange={(e) => up({ from: e.target.value })} style={{ marginTop: 8 }} /> : null}
      </div>
      <small>Süre 0 ise siz kapatana kadar açık kalır. Durum: <b>{alertStatus(a)}</b></small>
      <div className="p-btns">
        <button className={a.on ? 'p-danger' : 'p-pri'} onClick={() => up({ on: !a.on, pend: a.on ? 0 : 1 })}>
          {a.on ? 'Acil duyuruyu kapat' : 'Acil duyuruyu AÇ'}
        </button>
      </div>
      </div>
    </div>
  )
}
