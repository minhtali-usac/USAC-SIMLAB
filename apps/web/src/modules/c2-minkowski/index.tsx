import { useMemo, useRef, useState } from 'react';
import { boost1D, gamma } from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Toggle, Readout, Readouts, Segmented } from '../../components/Controls';
import { Tex } from '../../components/Tex';
import { useT, fix } from '../../i18n';
import { useParam } from '../../lib/router';
import { useCanvas2D, usePalette, usePointer } from '../../lib/hooks';
import { clear, withAlpha, label, disk } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

interface Ev { id: string; ct: number; x: number; color: string }

export default function MinkowskiModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [scene, setScene] = useParam<'events' | 'twins'>('scene', 'events');
  const [bp, setBp] = useParam('bp', 0.5, { min: -0.99, max: 0.99 });
  const [view, setView] = useParam('view', 0, { min: -0.95, max: 0.95 });
  const [showCone, setShowCone] = useParam('cone', true);
  const [showHyp, setShowHyp] = useParam('hyp', true);
  const [showGrid, setShowGrid] = useParam('grid', true);
  const [tb, setTb] = useParam('tb', 0.8, { min: 0.1, max: 0.99 });
  const [td, setTd] = useParam('td', 4.24, { min: 1, max: 8 });
  const [events, setEvents] = useState<Ev[]>([
    { id: 'A', ct: 0, x: 0, color: '#f472b6' },
    { id: 'B', ct: 2, x: -1.5, color: '#fbbf24' },
    { id: 'C', ct: 2, x: 2.5, color: '#5eead4' },
    { id: 'D', ct: 4, x: 1, color: '#a78bfa' },
  ]);
  const [sel, setSel] = useState('D');
  const dragging = useRef<string | null>(null);

  const etaV = Math.atanh(view), etaP = Math.atanh(bp);
  const toView = (ct: number, x: number) => boost1D(ct, x, etaV);
  const fromView = (ctv: number, xv: number) => boost1D(ctv, xv, -etaV);

  const twins = useMemo(() => {
    const tHome = (2 * td) / tb;
    const tTrav = tHome / gamma(tb);
    return { tHome, tTrav, turn: { ct: td / tb, x: td } };
  }, [tb, td]);

  const geo = useRef({ cx: 0, cy: 0, sc: 1 });
  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    const span = scene === 'twins' ? Math.max(twins.tHome, td * 2) * 0.62 + 1 : 6.2;
    const sc = Math.min(w / (2 * span * (scene === 'twins' ? 0.9 : 1)), h / (2 * span));
    const cx = scene === 'twins' ? w / 2 - td * sc * 0.5 : w / 2;
    const cy = scene === 'twins' ? h - 30 : h / 2;
    geo.current = { cx, cy, sc };
    const P = (ct: number, x: number) => { const [a, b] = toView(ct, x); return [cx + b * sc, cy - a * sc] as const; };
    const line = (a: readonly [number, number], b: readonly [number, number], color: string, width = 1, dash: number[] = []) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]);
    };
    const L = 40;
    // S grid
    if (showGrid) {
      for (let k = -12; k <= 12; k++) {
        line(P(k, -L), P(k, L), withAlpha(pal.equator, 0.07));
        line(P(-L, k), P(L, k), withAlpha(pal.equator, 0.07));
      }
    }
    // S axes
    line(P(-L, 0), P(L, 0), withAlpha(pal.equator, 0.8), 1.5);
    line(P(0, -L), P(0, L), withAlpha(pal.equator, 0.8), 1.5);
    const tl = (s: string, p: readonly [number, number], c: string) => label(ctx, s, p[0] + 6, p[1] - 8, c, { size: 12, weight: 700, halo: pal.bg });
    tl('ct', P(span * 0.92, 0), pal.equator);
    tl('x', P(0, span * 0.92), pal.equator);
    // light lines through origin
    line(P(-L, -L), P(L, L), withAlpha(pal.sun, 0.55), 1.2, [6, 5]);
    line(P(-L, L), P(L, -L), withAlpha(pal.sun, 0.55), 1.2, [6, 5]);
    // S' axes (rapidity etaP relative to S)
    if (scene === 'events') {
      const ch = Math.cosh(etaP), sh = Math.sinh(etaP);
      line(P(-L * ch, -L * sh), P(L * ch, L * sh), pal.teal, 1.6);
      line(P(-L * sh, -L * ch), P(L * sh, L * ch), pal.teal, 1.6);
      tl("ct′", P(span * 0.8 * ch, span * 0.8 * sh), pal.teal);
      tl("x′", P(span * 0.8 * sh, span * 0.8 * ch), pal.teal);
      if (showGrid) for (let k = -10; k <= 10; k++) {
        if (k === 0) continue;
        line(P(k * sh - L * ch, k * ch - L * sh), P(k * sh + L * ch, k * ch + L * sh), withAlpha(pal.teal, 0.08));
      }
      const e = events.find((x) => x.id === sel)!;
      // simultaneity line in S' through the selected event, and light cone
      const ctp = ch * e.ct - sh * e.x;
      line(P(ctp * ch - L * sh, ctp * sh - L * ch), P(ctp * ch + L * sh, ctp * sh + L * ch), withAlpha(pal.teal, 0.7), 1.2, [4, 4]);
      if (showCone) {
        ctx.fillStyle = withAlpha(pal.sun, 0.06);
        const a1 = P(e.ct, e.x), a2 = P(e.ct + L, e.x + L), a3 = P(e.ct + L, e.x - L), b2 = P(e.ct - L, e.x + L), b3 = P(e.ct - L, e.x - L);
        ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.lineTo(a3[0], a3[1]); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(b3[0], b3[1]); ctx.closePath(); ctx.fill();
        line(P(e.ct - L, e.x - L), P(e.ct + L, e.x + L), withAlpha(pal.sun, 0.8), 1);
        line(P(e.ct - L, e.x + L), P(e.ct + L, e.x - L), withAlpha(pal.sun, 0.8), 1);
      }
      if (showHyp) {
        const s2 = e.ct * e.ct - e.x * e.x;
        ctx.strokeStyle = withAlpha(pal.horizon, 0.75); ctx.lineWidth = 1.3; ctx.setLineDash([2, 3]);
        ctx.beginPath();
        let first = true;
        for (let k = -200; k <= 200; k++) {
          const u = (k / 200) * 3;
          let ct: number, x: number;
          if (s2 > 1e-9) { ct = Math.sign(e.ct) * Math.sqrt(s2) * Math.cosh(u); x = Math.sqrt(s2) * Math.sinh(u); }
          else if (s2 < -1e-9) { x = Math.sign(e.x) * Math.sqrt(-s2) * Math.cosh(u); ct = Math.sqrt(-s2) * Math.sinh(u); }
          else continue;
          const q = P(ct, x);
          if (first) { ctx.moveTo(q[0], q[1]); first = false; } else ctx.lineTo(q[0], q[1]);
        }
        ctx.stroke(); ctx.setLineDash([]);
      }
      for (const ev of events) {
        const q = P(ev.ct, ev.x);
        disk(ctx, q[0], q[1], ev.id === sel ? 8 : 6, ev.color);
        if (ev.id === sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, 6.283); ctx.stroke(); }
        label(ctx, ev.id, q[0] + 11, q[1] - 10, ev.color, { size: 14, weight: 800, halo: pal.bg });
      }
    } else {
      // twins: home worldline x = 0, traveller kinked
      const { turn, tHome } = twins;
      line(P(0, 0), P(tHome, 0), pal.equator, 3);
      line(P(0, 0), P(turn.ct, turn.x), pal.horizon, 3);
      line(P(turn.ct, turn.x), P(tHome, 0), pal.horizon, 3);
      // proper-time ticks every year
      const g = gamma(tb);
      for (let y = 1; y < tHome; y++) { const q = P(y, 0); disk(ctx, q[0], q[1], 3, pal.equator); if (y % 2 === 0) label(ctx, String(y), q[0] - 8, q[1], pal.equator, { size: 10, align: 'right', mono: true }); }
      for (let y = 1; y < tHome / g; y++) {
        const ctLab = y * g;
        const q = ctLab <= turn.ct ? P(ctLab, tb * ctLab) : P(ctLab, turn.x - tb * (ctLab - turn.ct));
        disk(ctx, q[0], q[1], 3, pal.horizon);
        if (y % 2 === 0) label(ctx, String(y), q[0] + 7, q[1], pal.horizon, { size: 10, mono: true });
      }
      // traveller simultaneity lines just before / after turnaround
      const sl = (bsign: number, color: string) => {
        const slope = bsign * tb; // in S: ct − ct_turn = slope (x − x_turn)
        line(P(turn.ct + slope * (0 - turn.x), 0), P(turn.ct + slope * (td * 1.6 - turn.x), td * 1.6), color, 1.2, [5, 4]);
      };
      sl(1, withAlpha(pal.teal, 0.85));
      sl(-1, withAlpha(pal.newton, 0.85));
      const home1 = turn.ct - tb * turn.x, home2 = turn.ct + tb * turn.x;
      const qa = P(home1, 0), qb = P(home2, 0);
      ctx.strokeStyle = withAlpha(pal.danger, 0.9); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(qa[0], qa[1]); ctx.lineTo(qb[0], qb[1]); ctx.stroke();
      label(ctx, tx({ vi: `"bước nhảy" đồng thời: ${fix(home2 - home1, 2, lang)} năm`, en: `simultaneity "jump": ${fix(home2 - home1, 2, lang)} yr` }), qa[0] - 10, (qa[1] + qb[1]) / 2, pal.danger, { size: 11, align: 'right', halo: pal.bg });
      const star = P(turn.ct, turn.x);
      label(ctx, tx({ vi: '★ quay đầu', en: '★ turnaround' }), star[0] + 10, star[1], pal.sun, { size: 12, weight: 700, halo: pal.bg });
    }
    label(ctx, tx({ vi: `Hệ hiển thị: β = ${fix(view, 2, lang)} so với S · đơn vị: năm ánh sáng`, en: `View frame: β = ${fix(view, 2, lang)} relative to S · units: light-years` }), 12, h - 12, pal.textFaint, { size: 11 });
  }, [events, sel, view, bp, showCone, showHyp, showGrid, scene, twins, pal, tx, lang]);

  usePointer(canvasRef, {
    down: (x, y) => {
      if (scene !== 'events') return;
      const { cx, cy, sc } = geo.current;
      let best: string | null = null, bd = 18;
      for (const ev of events) {
        const [a, b] = toView(ev.ct, ev.x);
        const d = Math.hypot(cx + b * sc - x, cy - a * sc - y);
        if (d < bd) { bd = d; best = ev.id; }
      }
      if (best) { dragging.current = best; setSel(best); }
    },
    move: (x, y, isDown) => {
      if (!isDown || !dragging.current) return;
      const { cx, cy, sc } = geo.current;
      const [ct, xs] = fromView((cy - y) / sc, (x - cx) / sc);
      const snap = (v: number) => Math.round(v * 4) / 4;
      setEvents((evs) => evs.map((e) => (e.id === dragging.current ? { ...e, ct: snap(ct), x: snap(xs) } : e)));
      redraw();
    },
    up: () => { dragging.current = null; },
  });

  const ch = Math.cosh(etaP), sh = Math.sinh(etaP);
  const selEv = events.find((e) => e.id === sel)!;
  const classify = (a: Ev, b: Ev) => {
    const s2 = (b.ct - a.ct) ** 2 - (b.x - a.x) ** 2;
    return s2 > 1e-9 ? tx({ vi: 'kiểu thời gian', en: 'timelike' }) : s2 < -1e-9 ? tx({ vi: 'kiểu không gian', en: 'spacelike' }) : tx({ vi: 'kiểu ánh sáng', en: 'lightlike' });
  };

  return (
    <SimLayout
      id="c2"
      lesson={lesson}
      card={card}
      caption={scene === 'twins' ? <><span className="k">{tx({ vi: 'Chênh tuổi', en: 'Age gap' })} = {fix(twins.tHome - twins.tTrav, 2, lang)} {t('years')}</span> · τ_{tx({ vi: 'nhà', en: 'home' })} = {fix(twins.tHome, 2, lang)} · τ_{tx({ vi: 'du hành', en: 'traveller' })} = {fix(twins.tTrav, 2, lang)}</> : <><span className="k">s² = (ct)² − x²</span> {tx({ vi: 'như nhau trong mọi hệ', en: 'is the same in every frame' })} · β′ = {fix(bp, 2, lang)}</>}
      panel={
        <>
          <Section title={tx({ vi: 'Cảnh', en: 'Scene' })} dot="var(--grpC)">
            <Segmented value={scene} onChange={setScene} options={[{ value: 'events', label: tx({ vi: 'Sự kiện & hệ S′', en: 'Events & frame S′' }) }, { value: 'twins', label: tx({ vi: 'Sinh đôi', en: 'Twins' }) }]} />
            <Slider label={tx({ vi: 'Hệ hiển thị (β so với S)', en: 'View frame (β relative to S)' })} value={view} min={-0.95} max={0.95} step={0.01} onChange={setView} display={`β = ${fix(view, 2, lang)} · η = ${fix(etaV, 3, lang)}`} />
          </Section>
          {scene === 'events' ? (
            <>
              <Section title={tx({ vi: 'Hệ S′ (trục màu ngọc)', en: 'Frame S′ (teal axes)' })}>
                <Slider label="β′" value={bp} min={-0.99} max={0.99} step={0.01} onChange={setBp} display={`${fix(bp, 2, lang)} · γ = ${fix(gamma(bp), 3, lang)}`} />
                <Toggle label={tx({ vi: 'Nón ánh sáng của sự kiện chọn', en: 'Light cone of selected event' })} checked={showCone} onChange={setShowCone} swatch="var(--sun)" />
                <Toggle label={tx({ vi: 'Hyperbol bất biến s²', en: 'Invariant hyperbola s²' })} checked={showHyp} onChange={setShowHyp} swatch="var(--horizon)" />
                <Toggle label={tx({ vi: 'Lưới toạ độ', en: 'Coordinate grids' })} checked={showGrid} onChange={setShowGrid} />
                <div className="field-hint">{tx({ vi: 'Kéo các sự kiện A–D trên biểu đồ. Nét đứt màu ngọc: đường đồng thời của S′ qua sự kiện đang chọn.', en: 'Drag events A–D. Dashed teal: the S′ line of simultaneity through the selected event.' })}</div>
              </Section>
              <Section title={t('secReadouts')}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }} className="num">
                    <thead><tr style={{ color: 'var(--text-faint)' }}><th style={{ textAlign: 'left' }}></th><th>ct</th><th>x</th><th>ct′</th><th>x′</th>{student && <th>s²</th>}</tr></thead>
                    <tbody>
                      {events.map((e) => (
                        <tr key={e.id} onClick={() => setSel(e.id)} style={{ cursor: 'pointer', background: e.id === sel ? 'var(--panel-2)' : undefined }}>
                          <td style={{ color: e.color, fontWeight: 800 }}>{e.id}</td>
                          <td>{fix(e.ct, 2, lang)}</td><td>{fix(e.x, 2, lang)}</td>
                          <td>{fix(ch * e.ct - sh * e.x, 2, lang)}</td><td>{fix(-sh * e.ct + ch * e.x, 2, lang)}</td>
                          {student && <td>{fix(e.ct * e.ct - e.x * e.x, 2, lang)}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Readouts>
                  {events.filter((e) => e.id !== sel).map((e) => <Readout key={e.id} k={`${sel} ↔ ${e.id}`} v={classify(selEv, e)} />)}
                </Readouts>
                {student && <div className="eq-box"><Tex display tex={'s^2 = (ct)^2 - x^2 = (ct\')^2 - x\'^2'} /></div>}
              </Section>
            </>
          ) : (
            <Section title={tx({ vi: 'Nghịch lý sinh đôi', en: 'Twin paradox' })}>
              <Slider label={tx({ vi: 'Vận tốc người du hành β', en: 'Traveller speed β' })} value={tb} min={0.1} max={0.99} step={0.01} onChange={setTb} display={`${fix(tb, 2, lang)} · γ = ${fix(gamma(tb), 3, lang)}`} />
              <Slider label={tx({ vi: 'Khoảng cách tới sao', en: 'Distance to the star' })} value={td} min={1} max={8} step={0.01} onChange={setTd} display={`${fix(td, 2, lang)} ${tx({ vi: 'năm ánh sáng', en: 'ly' })}`} />
              <Readouts>
                <Readout wide k={tx({ vi: 'Người ở nhà già thêm', en: 'Stay-at-home ages' })} v={fix(twins.tHome, 3, lang)} unit={t('years')} frame={tx({ vi: 'thời gian riêng = thời gian toạ độ S', en: 'proper time = S coordinate time' })} />
                <Readout wide k={tx({ vi: 'Người du hành già thêm', en: 'Traveller ages' })} v={fix(twins.tTrav, 3, lang)} unit={t('years')} frame={t('properTime')} tone="accent" />
                <Readout wide k={tx({ vi: 'Chênh lệch tuổi khi gặp lại', en: 'Age difference at reunion' })} v={fix(twins.tHome - twins.tTrav, 3, lang)} unit={t('years')} />
              </Readouts>
              <div className="hint-box">{tx({ vi: 'Hai nét đứt là đường đồng thời của người du hành ngay trước (ngọc) và ngay sau (cam) khi quay đầu. Đoạn đỏ trên đường thế giới người ở nhà là khoảng thời gian mà người du hành "bỏ qua" khi đổi hệ quán tính - đây là sự bất đối xứng.', en: 'The dashed lines are the traveller’s simultaneity just before (teal) and after (orange) the turnaround. The red stretch of the home worldline is “skipped” when the traveller changes inertial frame - the asymmetry.' })}</div>
            </Section>
          )}
        </>
      }
    >
      <canvas ref={canvasRef} style={{ touchAction: 'none', cursor: scene === 'events' ? 'pointer' : 'default' }} role="img" aria-label={tx({ vi: 'Biểu đồ Minkowski', en: 'Minkowski diagram' })} />
      <div className="stage-overlay tr">
        <div className="legend">
          <span><i style={{ background: 'var(--equator)' }} />{tx({ vi: 'Trục hệ S', en: 'Frame S axes' })}</span>
          {scene === 'events' && <span><i style={{ background: 'var(--teal)' }} />{tx({ vi: 'Trục hệ S′', en: 'Frame S′ axes' })}</span>}
          <span><i style={{ background: 'var(--sun)' }} />{tx({ vi: 'Ánh sáng (45°)', en: 'Light (45°)' })}</span>
          {scene === 'twins' && <span><i style={{ background: 'var(--horizon)' }} />{tx({ vi: 'Người du hành (chấm = 1 năm riêng)', en: 'Traveller (dots = 1 proper year)' })}</span>}
        </div>
      </div>
    </SimLayout>
  );
}
