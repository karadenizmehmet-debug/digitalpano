import { BellEditor } from './BellEditor.jsx'
import { COND, NumIn } from './common.jsx'
import { DG, mondayISO, weekShift } from '../modules/duty.jsx'
import { DutyPaste } from './SpecialEditor.jsx'
import { QuoteEditor } from './QuoteEditor.jsx'
import { SchedEditor } from './SchedEditor.jsx'
import { SlidesEditor } from './Slides.jsx'
import { TRANS } from '../lib/trans.js'
import { nOf } from '../modules/schedule.jsx'
import { rows } from '../lib/util.js'

export const fromSheet = (t) => t.replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n').map((l) => l.split('\t').map((x) => x.trim()).join(';').replace(/;+$/, '')).join('\n')

export function Field({ f, data, set, say, root, setRoot }) {
  const [k0, kind, label, hint] = f
  const isRoot = k0[0] === '@', k = isRoot ? k0.slice(1) : k0
  if (isRoot) { data = root; set = (kk, vv) => setRoot({ [kk]: vv }) }
  const v = data[k]
  let input
  if (kind === 'area') input = <textarea rows={6} value={v ?? ''} onChange={(e) => set(k, e.target.value)} onPaste={(e) => {
    const t = e.clipboardData.getData('text');
    if (!t || (t.indexOf('\t') < 0 && t.indexOf('\r') < 0)) return;
    e.preventDefault();
    const el = e.target, cur = el.value;
    set(k, cur.slice(0, el.selectionStart) + fromSheet(t) + cur.slice(el.selectionEnd));
  }} />
  else if (kind === 'fx') input = <select value={v || 'auto'} onChange={(e) => set(k, e.target.value)}>{[['auto', 'Otomatik (hava durumuna göre)'], ['rain', 'Yağmur'], ['snow', 'Kar'], ['wind', 'Rüzgar'], ['storm', 'Fırtına'], ['fog', 'Sis']].map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
  else if (kind === 'check') return <label className="p-chk"><input type="checkbox" checked={k === 'fxOn' ? v !== false : !!v} onChange={(e) => set(k, e.target.checked)} /> {label}</label>
  else if (kind === 'trans') input = <select value={v || ''} onChange={(e) => set(k, e.target.value)}>{TRANS.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
  else if (kind === 'num') input = <NumIn value={v ?? ''} onChange={(e) => set(k, e.target.value === '' ? '' : +e.target.value)} />
  else if (kind === 'dt') input = <input type="datetime-local" value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  else if (kind === 'sel') input = <select value={v} onChange={(e) => set(k, e.target.value)}>{Object.entries(COND).map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>
  else if (kind === 'bellrows') input = <BellEditor value={v} set={(x) => set(k, x)} />
  else if (kind === 'dcount') input = (
    <div className="p-dc">{['Pzt', 'Sal', 'Çar', 'Per', 'Cum'].map((g, d) => (
      <label key={g}><span>{g}</span><select value={nOf(data, d)} onChange={(e) => { const dn = { 0: nOf(data, 0), 1: nOf(data, 1), 2: nOf(data, 2), 3: nOf(data, 3), 4: nOf(data, 4), [d]: +e.target.value }; set({ dn, n: Math.max(...Object.values(dn)) }) }}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>))}</div>)
  else if (kind === 'quotes') input = <QuoteEditor data={data} set={set} />
  else if (kind === 'qpin') return null
  else if (kind === 'sched') input = <SchedEditor data={data} set={set} />
  else if (kind === 'slides') input = <SlidesEditor value={v} set={(x) => set(k, x)} say={say} />
  else if (kind === 'dgrid') {
    const P = rows({ rows: data.places }), g = data.g || {}
    const k = weekShift(data, new Date())
    input = (
      <div>
        <DutyPaste P={P} g={g} set={(x) => set('g', x)} />
        <div className="p-dgw"><table className="p-dgt"><tbody>
          <tr><th>Yer</th>{DG.map((d) => <th key={d}>{d}</th>)}</tr>
          {P.map((p, j) => (
            <tr key={j}><td><b>{p}</b></td>
              {DG.map((d, i) => <td key={d}><input value={(g[i] || {})[j] || ''}
                onChange={(e) => set('g', { ...g, [i]: { ...(g[i] || {}), [j]: e.target.value } })} /></td>)}
            </tr>))}
        </tbody></table></div>
        {!P.length && <small>Önce yukarıya nöbet yerlerini yazın.</small>}
        <label className="p-chk" style={{ marginTop: 10 }}>
          <input type="checkbox" checked={!!data.rot} onChange={(e) => set('rot', e.target.checked ? mondayISO(new Date()) : '')} /> Dönüşümlü nöbet
        </label>
        {data.rot && <>
          <small>Her hafta öğretmenler bir sonraki nöbet yerine geçer (tablodaki düzen aşağıdaki hafta için geçerlidir).</small>
          <div className="p-fld"><label>Tablonun geçerli olduğu hafta (Pazartesi)</label>
            <input type="date" value={data.rot || ''} onChange={(e) => set('rot', e.target.value || mondayISO(new Date()))} /></div>
          <small>Bu hafta kaydırma: <b>{k}</b>{k < 0 ? ' (başlangıç tarihi ileride)' : ''}</small>
        </>}
      </div>
    )
  } else input = <input type="text" value={v ?? ''} onChange={(e) => set(k, e.target.value)} />
  const pasteBtn = kind === 'area' && <button type="button" className="p-ghost" onClick={async () => {
    try {
      const t = await navigator.clipboard.readText()
      if (!t.trim()) return say('Panoda kopyalanmış metin yok')
      set(k, (v ? v.replace(/\n+$/, '') + '\n' : '') + fromSheet(t))
      say('Eklendi. Yayınla ile panoya gönderin')
    } catch { say('Panoya erişim izni verilmedi. Kutuya uzun basıp Yapıştır deyin') }
  }}>📋 Excel/panodan satır ekle</button>
  return <div className="p-fld"><label>{label}</label>{input}{pasteBtn}{hint && <small>{hint}</small>}</div>
}
