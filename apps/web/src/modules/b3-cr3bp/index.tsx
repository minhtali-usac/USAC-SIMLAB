import { useEffect, useMemo, useRef, useState } from 'react';
import {
  lagrangePoints, omega, omegaGrad, jacobiConstant, cr3bpDeriv, dopri5, ROUTH_MU, hillGates, linearStability, cr3bpPreset, cr3bpUnits,
  AU, EARTH_MOON_DISTANCE, GM_SUN, GM_EARTH, GM_MOON, GM_JUPITER, type GateState,
} from '@usac/sim-core';
import { drawGlobe, PLANET_TEX, type GlobeTex } from '../../lib/globe';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Toggle, Readout, Readouts, Select, Segmented } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, sci, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette, usePointer } from '../../lib/hooks';
import { clear, withAlpha, label, disk, glowDisk, arrow, parseRgb } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { downloadCsv } from '../../lib/csv';
import { lesson, card } from './content';

const SYSTEMS: Record<string, { mu: number; name: L; dKm: number; gm: number; m1: string; m2: string; tex?: [GlobeTex, GlobeTex] }> = {
  earthMoon: { mu: GM_MOON / (GM_EARTH + GM_MOON), name: { vi: 'Trái Đất – Mặt Trăng', en: 'Earth – Moon' }, dKm: EARTH_MOON_DISTANCE / 1000, gm: GM_EARTH + GM_MOON, m1: '#5aa2ff', m2: '#d1d5db', tex: ['earth_daymap', 'moon'] },
  sunEarth: { mu: (GM_EARTH + GM_MOON) / (GM_SUN + GM_EARTH + GM_MOON), name: { vi: 'Mặt Trời – (Trái Đất + Mặt Trăng)', en: 'Sun – (Earth + Moon)' }, dKm: AU / 1000, gm: GM_SUN + GM_EARTH + GM_MOON, m1: '#fbbf24', m2: '#5aa2ff', tex: ['sun', 'earth_daymap'] },
  sunJupiter: { mu: GM_JUPITER / (GM_SUN + GM_JUPITER), name: { vi: 'Mặt Trời – Sao Mộc', en: 'Sun – Jupiter' }, dKm: (5.2029 * AU) / 1000, gm: GM_SUN + GM_JUPITER, m1: '#fbbf24', m2: '#d9b38c', tex: ['sun', 'jupiter'] },
  // GM Pluto 869.6, Charon 106.1 km³/s² - Brozović et al. 2015, Icarus 246, 317; separation 19 596 km
  plutoCharon: { mu: 106.1 / (869.6 + 106.1), name: { vi: 'Pluto – Charon (μ vượt ngưỡng Routh)', en: 'Pluto – Charon (μ above the Routh limit)' }, dKm: 19596, gm: (869.6 + 106.1) * 1e9, m1: '#c4a484', m2: '#9ca3af' },
  custom: { mu: 0.2, name: { vi: 'Tuỳ chỉnh (đơn vị chuẩn hoá)', en: 'Custom (normalised units)' }, dKm: NaN, gm: NaN, m1: '#fbbf24', m2: '#a78bfa' },
};
const IC_NAMES: Record<string, L> = {
  l4: { vi: 'Lệch khỏi L4: Δr = (+0,012; +0,006), v = 0', en: 'Offset from L4: Δr = (+0.012, +0.006), v = 0' },
  l4exact: { vi: 'Đúng tại L4, v = 0 (cân bằng)', en: 'Exactly at L4, v = 0 (equilibrium)' },
  l1: { vi: 'Lệch khỏi L1: Δx = −0,002, ẏ = 0,0005', en: 'Offset from L1: Δx = −0.002, ẏ = 0.0005' },
  l1exact: { vi: 'Đúng tại L1, v = 0 (cân bằng không ổn định)', en: 'Exactly at L1, v = 0 (unstable equilibrium)' },
  chaos: { vi: 'Quỹ đạo hỗn loạn: (½ − μ, 0), ẏ = 0,9', en: 'Chaotic orbit: (½ − μ, 0), ẏ = 0.9' },
  custom: { vi: 'Tự phóng (nhấn – kéo trên hình)', en: 'Custom (press–drag on the view)' },
};
const GATE_TEXT: Record<GateState, L> = { closed: { vi: 'đóng', en: 'closed' }, touching: { vi: 'vừa chạm', en: 'touching' }, open: { vi: 'mở', en: 'open' } };
const MAX_REC = 20000;

export default function Cr3bpModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const advanced = useLevelAtLeast('advanced');
  const [sys, setSys] = useParam('sys', 'earthMoon');
  const [muCustom, setMuCustom] = useParam('mu', 0.2, { min: 0.001, max: 0.5 });
  const [ic, setIc] = useParam('ic', 'l4');
  const [showHill, setShowHill] = useParam('hill', true);
  const [hillMode, setHillMode] = useParam<'orbit' | 'explore'>('hmode', 'orbit');
  const [cExplore, setCExplore] = useParam('cx', 3.18, { min: 1, max: 5 });
  const [tolExp, setTolExp] = useParam('tol', 10, { min: 6, max: 13 });
  const [speed, setSpeed] = useParam('speed', 2);
  const [playing, setPlaying] = useState(true);
  const [guess, setGuess] = useState<number | null>(null);
  const S = SYSTEMS[sys] ?? SYSTEMS.earthMoon;
  const mu = sys === 'custom' ? muCustom : S.mu;
  const L = useMemo(() => lagrangePoints(mu), [mu]);
  const units = Number.isFinite(S.dKm) && sys !== 'custom' ? cr3bpUnits(S.dKm, S.gm) : null;
  const rtol = 10 ** -tolExp;

  const state = useRef<Float64Array>(new Float64Array([0, 0, 0, 0]));
  const C0 = useRef(0);
  const maxDrift = useRef(0);
  const steps = useRef({ acc: 0, rej: 0 });
  const trail = useRef<number[]>([]);
  const rec = useRef<number[][]>([]);
  const simT = useRef(0);
  const stop = useRef<null | 'P1' | 'P2' | 'far'>(null);
  const icInfo = useRef<{ ref: string | null; dPos: [number, number]; dVel: [number, number] }>({ ref: null, dPos: [0, 0], dVel: [0, 0] });
  const dragStart = useRef<[number, number] | null>(null);
  const dragNow = useRef<[number, number] | null>(null);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);

  const launch = (s: number[], info = icInfo.current) => {
    state.current = new Float64Array(s);
    C0.current = jacobiConstant(state.current, mu);
    maxDrift.current = 0;
    steps.current = { acc: 0, rej: 0 };
    trail.current = [s[0], s[1]];
    rec.current = [[0, ...s]];
    simT.current = 0;
    stop.current = null;
    icInfo.current = info;
  };
  useEffect(() => {
    if (ic !== 'custom') { const p = cr3bpPreset(ic, mu); launch(p.state, { ref: p.ref, dPos: p.dPos, dVel: p.dVel }); }
    setPlaying(true); setGuess(null);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [ic, mu, tolExp]);

  const Cshown = hillMode === 'explore' ? cExplore : C0.current;
  const view = useRef({ cx: 0, cy: 0, sc: 1 });
  const hillImg = useRef<{ key: string; canvas: HTMLCanvasElement | null; w: number; h: number }>({ key: '', canvas: null, w: 0, h: 0 });

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    const span = 1.55;
    const sc = Math.min(w, h) / (2 * span);
    const cx = w / 2, cy = h / 2;
    view.current = { cx, cy, sc };
    const X = (x: number) => cx + x * sc, Y = (y: number) => cy - y * sc;
    if (showHill) {
      const step = 3, gw = Math.ceil(w / step), gh = Math.ceil(h / step);
      const key = `${mu}|${Cshown.toFixed(10)}|${gw}x${gh}|${pal.light}`;
      if (hillImg.current.key !== key) {
        const img = new ImageData(gw, gh);
        const [r, g, b] = parseRgb(pal.light ? 'rgb(124,58,237)' : 'rgb(124,92,255)');
        const forb = new Uint8Array(gw * gh);
        for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) forb[j * gw + i] = 2 * omega((i * step - cx) / sc, (cy - j * step) / sc, mu) < Cshown ? 1 : 0;
        for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
          const k = j * gw + i, o = k * 4;
          const edge = (i > 0 && forb[k - 1] !== forb[k]) || (j > 0 && forb[k - gw] !== forb[k]);
          if (edge) { img.data[o] = 245; img.data[o + 1] = 200; img.data[o + 2] = 90; img.data[o + 3] = 230; }
          else if (forb[k]) { img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = pal.light ? 55 : 80; }
        }
        const off = document.createElement('canvas');
        off.width = gw; off.height = gh;
        off.getContext('2d')!.putImageData(img, 0, 0);
        hillImg.current = { key, canvas: off, w: gw, h: gh };
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(hillImg.current.canvas!, 0, 0, hillImg.current.w * step, hillImg.current.h * step);
    }
    const r1 = Math.max(9, 14 * (1 - mu) ** 0.33), r2 = Math.max(5, 14 * mu ** 0.33);
    const [t1, t2] = S.tex ?? [null, null];
    glowDisk(ctx, X(-mu), Y(0), r1, withAlpha(S.m1, t1 === 'sun' ? 0.9 : 0.3), t1 === 'sun' ? 2.6 : 1.5);
    if (!t1 || !drawGlobe(ctx, t1, X(-mu), Y(0), r1, t1 === 'sun' ? { emissive: true } : { light: [-1, 0.3, 0.6], ambient: 0.15 })) disk(ctx, X(-mu), Y(0), r1, S.m1);
    glowDisk(ctx, X(1 - mu), Y(0), r2, withAlpha(S.m2, 0.3), 1.5);
    if (!t2 || !drawGlobe(ctx, t2, X(1 - mu), Y(0), r2, { light: [-1, 0.3, 0.6], ambient: 0.15 })) disk(ctx, X(1 - mu), Y(0), r2, S.m2);
    label(ctx, 'P₁', X(-mu), Y(0) + r1 + 13, pal.textDim, { size: 11, align: 'center', halo: pal.bg });
    label(ctx, 'P₂', X(1 - mu), Y(0) + r2 + 13, pal.textDim, { size: 11, align: 'center', halo: pal.bg });
    for (const p of L) {
      ctx.strokeStyle = pal.teal; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(X(p.x) - 5, Y(p.y)); ctx.lineTo(X(p.x) + 5, Y(p.y)); ctx.moveTo(X(p.x), Y(p.y) - 5); ctx.lineTo(X(p.x), Y(p.y) + 5); ctx.stroke();
      label(ctx, p.name, X(p.x) + 7, Y(p.y) - 9, pal.teal, { size: 12, weight: 700, halo: pal.bg });
    }
    const tr = trail.current;
    if (tr.length > 3 && hillMode === 'orbit') {
      ctx.strokeStyle = withAlpha(pal.horizon, 0.85); ctx.lineWidth = 1.3; ctx.beginPath();
      for (let i = 0; i < tr.length; i += 2) (i ? ctx.lineTo(X(tr[i]), Y(tr[i + 1])) : ctx.moveTo(X(tr[i]), Y(tr[i + 1])));
      ctx.stroke();
    }
    if (hillMode === 'orbit') { const s = state.current; disk(ctx, X(s[0]), Y(s[1]), 4.5, stop.current ? pal.danger : '#fff'); }
    if (dragStart.current && dragNow.current) { const [ax, ay] = dragStart.current, [bx, by] = dragNow.current; arrow(ctx, ax, ay, bx, by, pal.sun, 2, 9); }
    label(ctx, tx({ vi: `Hệ quay đồng bộ · P₁ = (−μ, 0), P₂ = (1 − μ, 0) · đơn vị độ dài = khoảng cách hai vật chính${hillMode === 'explore' ? ` · đang khám phá C = ${Cshown.toFixed(5)}` : ''}`, en: `Synodic frame · P₁ = (−μ, 0), P₂ = (1 − μ, 0) · length unit = primary separation${hillMode === 'explore' ? ` · exploring C = ${Cshown.toFixed(5)}` : ''}` }), 12, h - 12, pal.textFaint, { size: 11 });
  }, [mu, showHill, pal, L, S, tx, Cshown, hillMode]);

  usePointer(canvasRef, {
    down: (x, y) => { if (hillMode !== 'orbit') return; dragStart.current = [x, y]; dragNow.current = [x, y]; setPlaying(false); },
    move: (x, y, isDown) => { if (isDown && dragStart.current) { dragNow.current = [x, y]; redraw(); } },
    up: (x, y) => {
      if (!dragStart.current) return;
      const { cx, cy, sc } = view.current;
      const [ax, ay] = dragStart.current;
      const px = (ax - cx) / sc, py = (cy - ay) / sc;
      const vx = ((x - ax) / sc) * 1.2, vy = (-(y - ay) / sc) * 1.2;
      dragStart.current = null; dragNow.current = null;
      setIc('custom');
      launch([px, py, vx, vy], { ref: null, dPos: [0, 0], dVel: [0, 0] });
      setPlaying(true);
    },
  });

  const f = useMemo(() => cr3bpDeriv(mu), [mu]);
  const hRef = useRef(0.01);
  useAnimationFrame((dt, now) => {
    if (playing && !stop.current && hillMode === 'orbit') {
      const res = dopri5(f, simT.current, state.current, simT.current + dt * speed, { rtol, atol: rtol * 1e-2, hInit: hRef.current, hMax: 0.05 }, (tt, y) => {
        trail.current.push(y[0], y[1]);
        const d = Math.abs((jacobiConstant(y, mu) - C0.current) / C0.current);
        if (d > maxDrift.current) maxDrift.current = d;
        if (rec.current.length < MAX_REC) rec.current.push([tt, y[0], y[1], y[2], y[3]]);
      });
      hRef.current = res.h;
      state.current = res.y;
      simT.current = res.t;
      steps.current.acc += res.accepted; steps.current.rej += res.rejected;
      if (trail.current.length > 16000) trail.current.splice(0, trail.current.length - 16000);
      const s = state.current;
      // point-mass model and step control are not trustworthy this close to a primary: stop and report
      if (Math.hypot(s[0] + mu, s[1]) < 0.01) stop.current = 'P1';
      else if (Math.hypot(s[0] - 1 + mu, s[1]) < 0.003) stop.current = 'P2';
      else if (Math.hypot(s[0], s[1]) > 6) stop.current = 'far';
    }
    redraw();
    if (now - lastUi.current > 150) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const s = state.current;
  const C = jacobiConstant(s, mu);
  const drift = Math.abs((C - C0.current) / C0.current);
  const gates = hillGates(Cshown, mu);
  const nOpen = gates.filter((g) => g.state === 'open').length;
  const L4stab = linearStability(L[3].x, L[3].y, mu);
  const dist = (k: number) => Math.hypot(s[0] - L[k].x, s[1] - L[k].y);
  const nearest = L.map((p, k) => ({ p, d: dist(k) })).sort((a, b) => a.d - b.d)[0];
  const km = (x: number) => (units ? `${fmt(x * units.lengthKm, 4, lang)} km` : '');

  const exportCsv = () => {
    const rows = rec.current.map(([tt, x, y, vx, vy]) => {
      const [ox, oy] = omegaGrad(x, y, mu);
      return [tt, x, y, vx, vy, ox + 2 * vy, oy - 2 * vx, Math.hypot(x + mu, y), Math.hypot(x - 1 + mu, y), omega(x, y, mu), jacobiConstant([x, y, vx, vy], mu)];
    });
    downloadCsv('usac-b3-cr3bp.csv', ['t', 'x', 'y', 'vx_rot', 'vy_rot', 'ax_rot', 'ay_rot', 'r1', 'r2', 'Omega', 'C'], rows, [
      'USAC SimLab B3 - planar circular restricted three-body problem, synodic frame, normalised units (d = 1, m1 + m2 = 1, n = 1)',
      `mu = ${mu} ; system = ${sys} ; P1 = (-mu, 0), P2 = (1 - mu, 0)`,
      `initial state = (${rec.current[0]?.slice(1).join(', ')}) ; preset = ${ic} ; C0 = ${C0.current}`,
      `integrator = DOPRI5 (Dormand-Prince 5(4)), rtol = ${rtol}, atol = ${rtol * 1e-2}, hMax = 0.05 ; accepted = ${steps.current.acc}, rejected = ${steps.current.rej}`,
      units ? `units: length = ${units.lengthKm} km, time = ${units.timeS} s (1/n), speed = ${units.speedKms} km/s` : 'units: normalised only',
      `max relative Jacobi drift over run = ${maxDrift.current}` + (rec.current.length >= MAX_REC ? ` ; recording truncated at ${MAX_REC} steps` : ''),
    ]);
  };

  return (
    <SimLayout
      id="b3"
      lesson={lesson}
      card={card}
      caption={hillMode === 'explore'
        ? <><span className="k">{tx({ vi: 'Khám phá miền Hill', en: 'Exploring Hill regions' })}: C = {fix(cExplore, 5, lang)}</span> · {tx({ vi: 'cổ chai mở', en: 'open necks' })}: {gates.filter((g) => g.state === 'open').map((g) => g.name).join(', ') || '-'}</>
        : <><span className="k">C = {fix(C, 6, lang)}</span> · δ_C = {sci(maxDrift.current, 2)} · μ = {mu < 1e-3 ? sci(mu, 3) : fix(mu, 5, lang)} · {tx({ vi: 'cổ chai mở', en: 'open necks' })}: {gates.filter((g) => g.state === 'open').map((g) => g.name).join(', ') || '-'}</>}
      onReset={() => { if (ic !== 'custom') { const p = cr3bpPreset(ic, mu); launch(p.state, { ref: p.ref, dPos: p.dPos, dVel: p.dVel }); } setPlaying(true); }}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} speed={speed} onSpeed={setSpeed} speeds={[0.5, 1, 2, 5, 10].map((v) => ({ value: v, label: `×${v}` }))} label={<>t = {fix(simT.current, 2, lang)}<small>{units ? `= ${fix((simT.current * units.timeS) / 86400, 2, lang)} ${t('days')} · 2π = ${fix(units.periodDays, 2, lang)} ${t('days')}` : tx({ vi: '(2π = một vòng của hệ)', en: '(2π = one revolution)' })}</small></>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Hệ hai vật chính', en: 'Primary system' })} dot="var(--grpB)">
            <Select value={sys} onChange={setSys} options={Object.entries(SYSTEMS).map(([k, v]) => ({ value: k, label: tx(v.name) }))} />
            {sys === 'custom' && <Slider label="μ = m₂/(m₁ + m₂)" value={muCustom} min={0.001} max={0.5} log step={0.0001} onChange={setMuCustom} display={fix(muCustom, 4, lang)} />}
            <Select label={tx({ vi: 'Điều kiện đầu $(x_0, y_0, \\dot x_0, \\dot y_0)$ trong hệ quay', en: 'Initial state $(x_0, y_0, \\dot x_0, \\dot y_0)$ in the rotating frame' })} value={ic} onChange={setIc} options={Object.keys(IC_NAMES).map((k) => ({ value: k, label: tx(IC_NAMES[k]) }))} />
            <div className="field-hint">{tx({ vi: 'Tên điều kiện đầu chỉ mô tả vị trí xuất phát, không khẳng định quỹ đạo ổn định.', en: 'A preset name only describes where the orbit starts; it does not claim the orbit is stable.' })}</div>
            <Toggle label={tx({ vi: 'Miền cấm và đường vận tốc bằng không', en: 'Forbidden region and zero-velocity curve' })} checked={showHill} onChange={setShowHill} swatch="rgb(124,92,255)" />
            <Segmented value={hillMode} onChange={setHillMode} options={[{ value: 'orbit', label: tx({ vi: 'C của quỹ đạo', en: 'Orbit’s C' }) }, { value: 'explore', label: tx({ vi: 'Khám phá mức C', en: 'Explore C' }) }]} small />
            {hillMode === 'explore' && <Slider label={tx({ vi: 'Mức Jacobi C', en: 'Jacobi level C' })} value={cExplore} min={Math.min(L[3].C - 0.08, 2.9)} max={L[0].C + 0.12} step={0.00001} onChange={setCExplore} display={fix(cExplore, 5, lang)} />}
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k="μ = m₂/(m₁+m₂)" v={mu < 1e-3 ? sci(mu, 4) : fix(mu, 6, lang)} />
              <Readout k={tx({ vi: 'L4/L5', en: 'L4/L5' })} v={L4stab.stable ? tx({ vi: 'ổn định tuyến tính', en: 'linearly stable' }) : tx({ vi: 'không ổn định tuyến tính', en: 'linearly unstable' })} tone={L4stab.stable ? 'good' : 'bad'} frame={`${tx({ vi: 'tiêu chuẩn Routh', en: 'Routh criterion' })}: μ ${mu < ROUTH_MU ? '<' : '>'} μ_R = ${fix(ROUTH_MU, 7, lang)} · ${tx({ vi: 'trong CR3BP lý tưởng', en: 'ideal CR3BP' })}`} />
              {hillMode === 'orbit' && <Readout wide k={tx({ vi: 'Hằng số Jacobi C (vận tốc trong hệ quay)', en: 'Jacobi constant C (rotating-frame velocity)' })} v={fix(C, 8, lang)} frame={`C₀ = ${fix(C0.current, 8, lang)}`} tone="accent" />}
              {gates.map((g) => <Readout key={g.name} k={`${tx({ vi: 'Cổ chai', en: 'Neck' })} ${g.name}`} v={tx(GATE_TEXT[g.state])} tone={g.state === 'open' ? 'accent' : 'good'} frame={`C_${g.name.slice(1)} = ${fix(g.Ci, 6, lang)}`} />)}
              <Readout k={tx({ vi: 'C_L4 = C_L5', en: 'C_L4 = C_L5' })} v={fix(L[3].C, 6, lang)} frame="3 − μ + μ²" />
            </Readouts>
            <div className="field-hint">{tx({ vi: 'Cổ chai mở chỉ cho phép đi qua xét theo Jacobi; quỹ đạo có thực sự đi qua hay không còn tuỳ trạng thái ban đầu.', en: 'An open neck only permits passage by the Jacobi condition; whether an orbit actually passes depends on its initial state.' })}</div>
            {hillMode === 'orbit' && (
              <Readouts>
                <Readout k={tx({ vi: 'Vị trí (x, y)', en: 'Position (x, y)' })} v={`(${fix(s[0], 4, lang)}, ${fix(s[1], 4, lang)})`} frame={km(Math.hypot(s[0], s[1])) && `|r| = ${km(Math.hypot(s[0], s[1]))}`} />
                <Readout k={tx({ vi: 'Vận tốc hệ quay (ẋ, ẏ)', en: 'Rotating velocity (ẋ, ẏ)' })} v={`(${fix(s[2], 4, lang)}, ${fix(s[3], 4, lang)})`} frame={units ? `|v| = ${fmt(Math.hypot(s[2], s[3]) * units.speedKms, 4, lang)} km/s` : undefined} />
                <Readout wide k={tx({ vi: 'Trạng thái ban đầu', en: 'Initial state' })} v={icInfo.current.ref ? (icInfo.current.dPos[0] === 0 && icInfo.current.dPos[1] === 0 && icInfo.current.dVel[0] === 0 && icInfo.current.dVel[1] === 0 ? tx({ vi: `đúng tại ${icInfo.current.ref}, v = 0`, en: `exactly at ${icInfo.current.ref}, v = 0` }) : tx({ vi: `lệch khỏi ${icInfo.current.ref}: |Δr| = ${fix(Math.hypot(...icInfo.current.dPos), 4, lang)}, |Δv| = ${fix(Math.hypot(...icInfo.current.dVel), 4, lang)}`, en: `offset from ${icInfo.current.ref}: |Δr| = ${fix(Math.hypot(...icInfo.current.dPos), 4, lang)}, |Δv| = ${fix(Math.hypot(...icInfo.current.dVel), 4, lang)}` })) : tx(IC_NAMES[ic] ?? IC_NAMES.custom)} frame={`${tx({ vi: 'hiện gần', en: 'now nearest' })} ${nearest.p.name}: ${fix(nearest.d, 4, lang)}${units ? ` = ${km(nearest.d)}` : ''}`} />
                {stop.current && <Readout wide k={tx({ vi: 'Dừng tích phân', en: 'Integration stopped' })} v={stop.current === 'far' ? tx({ vi: 'vật rời xa (r > 6)', en: 'body left the region (r > 6)' }) : tx({ vi: `quá gần ${stop.current} - mô hình khối điểm và bước tích phân không còn tin cậy`, en: `too close to ${stop.current} - point-mass model and step control no longer reliable` })} tone="bad" />}
              </Readouts>
            )}
            {units && <Readouts><Readout k={tx({ vi: 'L1 cách P₂', en: 'L1 from P₂' })} v={fmt((1 - mu - L[0].x) * units.lengthKm, 4, lang)} unit="km" /><Readout k={tx({ vi: 'L2 cách P₂', en: 'L2 from P₂' })} v={fmt((L[1].x - (1 - mu)) * units.lengthKm, 4, lang)} unit="km" /></Readouts>}
            {student && <Readouts>{L.map((p) => <Readout key={p.name} k={p.name} v={`(${fix(p.x, 5, lang)}, ${fix(p.y, 5, lang)})`} frame={`C = ${fix(p.C, 6, lang)}`} />)}</Readouts>}
          </Section>
          <Section title={tx({ vi: 'Độ tin cậy số học', en: 'Numerical reliability' })} open={student}>
            <Segmented value={String(tolExp)} onChange={(v) => setTolExp(Number(v))} options={[8, 10, 12].map((k) => ({ value: String(k), label: `rtol 10⁻${k === 8 ? "⁸" : k === 10 ? "¹⁰" : "¹²"}` }))} small />
            <Readouts>
              <Readout wide k={tx({ vi: 'Độ trôi Jacobi cực đại δ_C trên khoảng tích phân', en: 'Max Jacobi drift δ_C over the run' })} v={sci(maxDrift.current, 3)} tone={maxDrift.current < 100 * rtol ? 'good' : 'bad'} frame={`max |C(t) − C₀|/|C₀|, 0 ≤ t ≤ ${fix(simT.current, 2, lang)} · ${tx({ vi: 'hiện tại', en: 'current' })} ${sci(drift, 2)}`} />
              <Readout k={tx({ vi: 'Dung sai', en: 'Tolerances' })} v={`rtol ${sci(rtol, 0)}`} frame={`atol ${sci(rtol * 1e-2, 0)}, h_max = 0,05`} />
              <Readout k={tx({ vi: 'Bước chấp nhận / từ chối', en: 'Accepted / rejected steps' })} v={`${steps.current.acc} / ${steps.current.rej}`} frame={`h = ${sci(hRef.current, 3)}`} />
            </Readouts>
            <div className="field-hint">{tx({ vi: 'δ_C nhỏ là điều kiện cần, chưa đủ: đổi rtol và chạy lại để xem quỹ đạo có hội tụ không. Kiểm định độc lập (RK4, nhiều dung sai): xem Model Card.', en: 'A small δ_C is necessary, not sufficient: change rtol and rerun to see whether the orbit converges. Independent checks (RK4, several tolerances): see the Model Card.' })}</div>
            {advanced && <button className="btn small" onClick={exportCsv}>{t('exportCsv')}</button>}
          </Section>
          <Section title={tx({ vi: 'Dự đoán rồi kiểm chứng', en: 'Predict, then verify' })} open={false}>
            <div className="field-hint" style={{ marginBottom: 6 }}>{tx({ vi: `Với mức Jacobi C = ${fix(Cshown, 5, lang)}, có bao nhiêu cổ chai (L1, L2, L3) đang mở?`, en: `At Jacobi level C = ${fix(Cshown, 5, lang)}, how many necks (L1, L2, L3) are open?` })}</div>
            <Segmented value={guess === null ? '' : String(guess)} onChange={(v) => { setGuess(Number(v)); setShowHill(true); }} options={[0, 1, 2, 3].map((k) => ({ value: String(k), label: String(k) }))} small />
            {guess !== null && <div className={guess === nOpen ? 'good-box' : 'warn-box'}>{tx({ vi: `Đáp án: ${nOpen} (so sánh C với C_L1 = ${fix(L[0].C, 5, lang)}, C_L2 = ${fix(L[1].C, 5, lang)}, C_L3 = ${fix(L[2].C, 5, lang)}). Miền cấm đã được bật để kiểm chứng.`, en: `Answer: ${nOpen} (compare C with C_L1 = ${fix(L[0].C, 5, lang)}, C_L2 = ${fix(L[1].C, 5, lang)}, C_L3 = ${fix(L[2].C, 5, lang)}). The forbidden region is now shown to check.` })}</div>}
          </Section>
          {student && (
            <Section title={t('secEquations')} open={false}>
              <div className="eq-box"><Tex display tex={'\\ddot x - 2\\dot y = \\Omega_x,\\quad \\ddot y + 2\\dot x = \\Omega_y,\\quad \\Omega = \\tfrac12(x^2+y^2) + \\frac{1-\\mu}{r_1} + \\frac{\\mu}{r_2}'} /></div>
              <div className="eq-box"><Tex display tex={'C = 2\\Omega - (\\dot x^2 + \\dot y^2),\\qquad 2\\Omega \\ge C\\ \\text{(khả dĩ / allowed)}'} /></div>
            </Section>
          )}
        </>
      }
    >
      <canvas ref={canvasRef} style={{ touchAction: 'none', cursor: 'crosshair' }} role="img" aria-label="CR3BP" />
      <div className="stage-overlay tr">
        <div className="legend">
          <span><i style={{ background: 'var(--teal)' }} />{tx({ vi: 'Điểm Lagrange', en: 'Lagrange points' })}</span>
          <span><i style={{ background: 'var(--horizon)' }} />{tx({ vi: 'Quỹ đạo vật thử', en: 'Test-particle orbit' })}</span>
          <span><i style={{ background: 'rgb(245,200,90)' }} />{tx({ vi: 'Đường vận tốc bằng không 2Ω = C', en: 'Zero-velocity curve 2Ω = C' })}</span>
          <span><i style={{ background: 'rgb(124,92,255)' }} />{tx({ vi: 'Miền cấm 2Ω < C', en: 'Forbidden region 2Ω < C' })}</span>
          {hillMode === 'orbit' && <span style={{ fontSize: 11 }}>{tx({ vi: 'Nhấn – kéo để phóng (vận tốc trong hệ quay)', en: 'Press–drag to launch (rotating-frame velocity)' })}</span>}
        </div>
      </div>
    </SimLayout>
  );
}
