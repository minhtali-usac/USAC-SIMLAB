import { useMemo, useRef, useState } from 'react';
import { PLANCK18_LSS, lptFields, slabParticles, depositCIC2D, smoothPeriodic2D, growthSolution, omegaMa, ageAtZ, type Cosmology } from '@usac/sim-core';
import { drawLogField, cmapCss } from '../../lib/colormap';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Segmented } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex, MathText } from '../../components/Tex';
import { useT, fix, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, label, withAlpha } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

const A0 = 0.02, A1 = 4;
const MODELS: { id: string; Om: number; name: L; color: string }[] = [
  { id: 'eds', Om: 1, name: { vi: 'Einstein–de Sitter (chỉ vật chất)', en: 'Einstein–de Sitter (matter only)' }, color: '#fbbf24' },
  { id: 'lcdm', Om: 0.315, name: { vi: 'ΛCDM phẳng, Ωm = 0,315 (Planck)', en: 'Flat ΛCDM, Ωm = 0.315 (Planck)' }, color: '#5eead4' },
  { id: 'low', Om: 0.1, name: { vi: 'ΛCDM phẳng, Ωm = 0,1', en: 'Flat ΛCDM, Ωm = 0.1' }, color: '#c084fc' },
];
const BOX = 200, N = 64, NZ = 4, G = 128;
const LOG_LO = -0.8, LOG_HI = 1.45;
const WEB_COL = ['#475569', '#34d399', '#60a5fa', '#fb923c'];

export default function GrowthModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [model, setModel] = useParam('m', 'lcdm');
  const [Omc, setOmc] = useParam('om', 0.315, { min: 0.05, max: 1 });
  const [lnA, setLnA] = useParam('lna', 0, { min: Math.log(A0), max: Math.log(A1) });
  const [seed, setSeed] = useParam('seed', 2026);
  const [color, setColor] = useParam<'density' | 'web'>('col', 'density');
  const [playing, setPlaying] = useState(false);
  const lnRef = useRef(lnA);
  if (!playing) lnRef.current = lnA;
  const [, setTick] = useState(0);
  const last = useRef(0);

  const Om = model === 'custom' ? Omc : MODELS.find((m) => m.id === model)?.Om ?? 0.315;
  // one shared initial field (Planck spectrum, σ8 = 0.811 for ΛCDM today) → the models differ only in growth
  const fields = useMemo(() => lptFields(PLANCK18_LSS, N, BOX, seed, 1), [seed]);
  const sols = useMemo(() => Object.fromEntries([...MODELS.map((m) => [m.id, growthSolution(m.Om, A1)]), ['custom', growthSolution(Omc, A1)]]), [Omc]);
  const Dref = sols.lcdm.D1;
  const sol = sols[model] ?? sols.lcdm;
  const a = Math.exp(lnRef.current);
  const D = sol.D(a), f = sol.f(a), omA = omegaMa(Om, a);
  const amp = D / Dref; // relative to Planck ΛCDM today (σ8 = 0.811 there)

  const P = useMemo(() => slabParticles(fields, NZ, amp), [fields, amp]);
  // mass density of the slab: CIC onto a 128² grid, smoothed σ = 1 cell (1.6 Mpc/h), mean = 1
  const rhoGrid = useMemo(() => smoothPeriodic2D(depositCIC2D(P.x, P.y, P.n, BOX, G), G, 1), [P]);

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, '#03040a');
    const S = Math.min(w - 90, h) - 24, ox = (w - S) / 2 - 30, oy = (h - S) / 2;
    if (color === 'density') {
      drawLogField(ctx, rhoGrid, G, ox, oy, S, LOG_LO, LOG_HI, 'cosmic');
      // colour bar
      const bx = ox + S + 18, bh = S * 0.6, by = oy + (S - bh) / 2;
      for (let k = 0; k < bh; k++) { ctx.fillStyle = cmapCss('cosmic', 1 - k / bh); ctx.fillRect(bx, by + k, 12, 1.5); }
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.strokeRect(bx, by, 12, bh);
      for (const v of [0.2, 1, 5, 20]) {
        const yy = by + (1 - (Math.log10(v) - LOG_LO) / (LOG_HI - LOG_LO)) * bh;
        label(ctx, fix(v, v < 1 ? 1 : 0, lang), bx + 17, yy + 4, '#cbd5e1', { size: 10.5, mono: true });
      }
      label(ctx, 'ρ/ρ̄', bx - 2, by - 10, '#e5e7eb', { size: 11.5, weight: 700 });
    } else {
      ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, S, S); ctx.clip();
      ctx.fillStyle = '#03040a'; ctx.fillRect(ox, oy, S, S);
      ctx.globalCompositeOperation = 'lighter';
      const sz = Math.max(1.2, (S / N) * 0.38);
      for (let i = 0; i < P.n; i++) {
        ctx.globalAlpha = P.web[i] === 0 ? 0.28 : 0.55;
        ctx.fillStyle = WEB_COL[P.web[i]];
        ctx.fillRect(ox + (P.x[i] / BOX) * S, oy + (P.y[i] / BOX) * S, sz, sz);
      }
      ctx.restore();
    }
    ctx.strokeStyle = withAlpha(pal.fg, 0.15); ctx.strokeRect(ox, oy, S, S);
    // scale bar 50 Mpc/h
    const bar = (50 / BOX) * S;
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox + 12, oy + S - 14); ctx.lineTo(ox + 12 + bar, oy + S - 14); ctx.stroke();
    label(ctx, '50 Mpc/h', ox + 12, oy + S - 22, '#e5e7eb', { size: 11, halo: '#000' });
    label(ctx, tx({ vi: `Lát dày ${fix((NZ * BOX) / N, 1, lang)} Mpc/h · toạ độ đồng chuyển động`, en: `Slab ${fix((NZ * BOX) / N, 1, lang)} Mpc/h thick · comoving coordinates` }), ox + 12, oy + 18, '#cbd5e1', { size: 11, halo: '#000' });
  }, [P, rhoGrid, color, pal, tx, lang]);

  useAnimationFrame((dt, now) => {
    if (playing) {
      lnRef.current += dt * 0.35;
      if (lnRef.current > Math.log(A1)) { lnRef.current = Math.log(A1); setPlaying(false); setLnA(lnRef.current); }
    }
    redraw();
    if (now - last.current > 120) { last.current = now; setTick((x) => x + 1); }
  });

  const curves = useMemo(() => {
    const out: Record<string, [number, number][]> = {};
    for (const id of [...MODELS.map((m) => m.id), 'custom']) {
      const s = sols[id];
      out[id] = Array.from({ length: 160 }, (_, k) => { const aa = Math.exp(Math.log(A0) + (k / 159) * (Math.log(A1) - Math.log(A0))); return [aa, s.D(aa) / Dref] as [number, number]; });
    }
    return out;
  }, [sols, Dref]);
  const cosmo: Cosmology = { H0: 67.4, Om, OL: 1 - Om, Or: 0 };
  const ageGyr = a <= 1 ? ageAtZ(cosmo, 1 / a - 1) : NaN;
  const src = 1.5 * omA, drag = (2 - 1.5 * omA) * f;

  return (
    <SimLayout
      id="f5"
      lesson={lesson}
      card={card}
      caption={<><span className="k">a = {fix(a, 3, lang)} · z = {fix(1 / a - 1, 2, lang)}</span> · D/D₀ = {fix(amp, 3, lang)} · f = {fix(f, 3, lang)} · Ω_m(a) = {fix(omA, 3, lang)}</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      onReset={() => { setPlaying(false); setLnA(Math.log(A0)); }}
      timeline={
        <Timeline playing={playing} onToggle={() => { if (lnRef.current >= Math.log(A1) - 1e-6) { lnRef.current = Math.log(A0); } setPlaying((x) => !x); }}
          label={<>a = {fix(a, 3, lang)}<small>{a <= 1 ? `${tx({ vi: 'tuổi vũ trụ', en: 'age' })} ${fix(ageGyr, 2, lang)} ${tx({ vi: 'tỉ năm', en: 'Gyr' })}` : tx({ vi: 'tương lai', en: 'future' })}</small></>} />
      }
      panel={
        <>
          <Section title={tx({ vi: 'Vũ trụ', en: 'Universe' })} dot="var(--grpF)">
            <Segmented value={model} onChange={setModel} options={[...MODELS.map((m) => ({ value: m.id, label: m.id === 'eds' ? 'EdS' : `Ω_m = ${fix(m.Om, m.Om === 0.1 ? 1 : 3, lang)}` })), { value: 'custom', label: tx({ vi: 'Tuỳ chỉnh', en: 'Custom' }) }]} small />
            {model === 'custom' && <Slider label="Ω_m (Ω_Λ = 1 − Ω_m)" value={Omc} min={0.05} max={1} step={0.005} onChange={setOmc} display={fix(Omc, 3, lang)} />}
            <Slider label={tx({ vi: 'Hệ số tỉ lệ a (thang log)', en: 'Scale factor a (log scale)' })} value={lnA} min={Math.log(A0)} max={Math.log(A1)} step={0.001} onChange={(v) => { setPlaying(false); setLnA(v); }} display={`a = ${fix(a, 3, lang)} · z = ${fix(1 / a - 1, 2, lang)}`} />
            <Segmented value={color} onChange={setColor} options={[{ value: 'density', label: tx({ vi: 'Màu theo mật độ', en: 'Colour by density' }) }, { value: 'web', label: tx({ vi: 'Kiểu cấu trúc', en: 'Web type' }) }]} small />
            {color === 'web' && <div className="field-hint">{tx({ vi: 'Xám: khoảng trống · xanh lá: tấm · xanh dương: sợi · cam: nút (số trục đang co sụp, D·λ < −0,4).', en: 'Grey: void · green: sheet · blue: filament · orange: node (axes collapsing, D·λ < −0.4).' })}</div>}
            <button className="btn small" onClick={() => setSeed(seed + 1)}>🎲 {tx({ vi: 'Điều kiện ban đầu khác', en: 'New initial conditions' })}</button>
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Hệ số tăng trưởng D/D₀', en: 'Growth factor D/D₀' })} v={fix(amp, 4, lang)} frame={tx({ vi: 'D₀ = ΛCDM Planck hôm nay', en: 'D₀ = Planck ΛCDM today' })} tone="accent" />
              <Readout k={tx({ vi: 'Tốc độ tăng trưởng f', en: 'Growth rate f' })} v={fix(f, 4, lang)} frame={`$\\Omega_m(a)^{${lang === 'vi' ? '0{,}55' : '0.55'}}$ = ${fix(omA ** 0.55, 4, lang)}`} />
              <Readout k={tx({ vi: 'Nguồn hấp dẫn', en: 'Gravity source' })} v={fix(src, 3, lang)} frame="$\tfrac32\,\Omega_m(a)$" />
              <Readout k={tx({ vi: 'Lực cản Hubble', en: 'Hubble drag' })} v={fix(drag, 3, lang)} tone={drag > src ? 'bad' : 'good'} frame={<><MathText text={'$\\left(2 + \\tfrac{d\\ln H}{d\\ln a}\\right) f$'} /> ·{drag > src ? tx({ vi: 'giãn nở thắng', en: 'expansion winning' }) : tx({ vi: 'hấp dẫn thắng', en: 'gravity winning' })}</>} />
              <Readout k="Ω_m(a)" v={fix(omA, 4, lang)} />
              <Readout k={tx({ vi: 'σ₈(a) tương ứng', en: 'Matching σ₈(a)' })} v={fix(0.811 * amp, 3, lang)} />
            </Readouts>
            {student && <div className="eq-box"><Tex display tex={"D'' + \\left(2 + \\frac{d\\ln H}{d\\ln a}\\right)D' = \\tfrac32\\,\\Omega_m(a)\\,D"} /><Tex display tex={"\\mathbf x = \\mathbf q + D(a)\\,\\boldsymbol\\Psi(\\mathbf q)"} /></div>}
          </Section>
          <Section title={tx({ vi: 'Đường tăng trưởng D(a)', en: 'Growth curves D(a)' })}>
            <ChartCard title={tx({ vi: 'Cùng điều kiện ban đầu: D → a khi vật chất chi phối', en: 'Shared initial conditions: D → a in matter domination' })}>
              <LineChart height={210} xLog yLog xDomain={[A0, A1]} yDomain={[0.015, 6]} xLabel="a" yLabel="D/D₀" legend
                series={[...MODELS.map((m) => ({ data: curves[m.id], color: m.color, label: m.id === 'eds' ? 'EdS' : `Ω_m = ${m.Om}`, width: model === m.id ? 2.4 : 1.3 })), ...(model === 'custom' ? [{ data: curves.custom, color: '#f472b6', label: `Ω_m = ${fix(Omc, 2, lang)}`, width: 2.4 }] : [])]}
                vlines={[{ x: 1, color: pal.textFaint, dash: '3 4', label: tx({ vi: 'hôm nay', en: 'today' }) }, { x: a, color: pal.sun }]} />
            </ChartCard>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label={tx({ vi: 'Lát cắt mạng lưới vũ trụ theo hệ số tỉ lệ', en: 'Cosmic-web slice versus scale factor' })} />
    </SimLayout>
  );
}
