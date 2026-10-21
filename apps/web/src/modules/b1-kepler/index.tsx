import { useMemo, useRef, useState } from 'react';
import {
  conicElements, twoBodyState, sweptSectors, keplerResidual, timeSincePeriapsis, trueAnomalyAtRadius, trueAnomalyLimit,
  KEPLER_PRESETS, MU_SUN_AU_DAY, GAUSSIAN_YEAR_DAYS, AU, SECONDS_PER_DAY, JULIAN_YEAR_DAYS, type ConicKind,
} from '@usac/sim-core';
import { drawGlobe, PLANET_TEX, type GlobeTex } from '../../lib/globe';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Toggle, Readout, Readouts, Select, Segmented } from '../../components/Controls';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Timeline } from '../../components/Timeline';
import { Tex } from '../../components/Tex';
import { useT, fmt, fix, sci, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette, usePointer } from '../../lib/hooks';
import { clear, drawBackgroundStars, glowDisk, arrow, label, withAlpha, disk } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { downloadCsv } from '../../lib/csv';
import { lesson, card } from './content';

const SPEEDS = [1, 5, 20, 60, 200, 1000, 5000];
const KIND_NAME: Record<ConicKind, L> = {
  circle: { vi: 'tròn', en: 'circle' }, ellipse: { vi: 'elip', en: 'ellipse' }, parabola: { vi: 'parabol', en: 'parabola' }, hyperbola: { vi: 'hyperbol', en: 'hyperbola' },
};
/** au/day → km/s and au²/day² → km²/s². */
const KMS = AU / SECONDS_PER_DAY / 1000;
const MR_MIN_LOG = -8;

export default function KeplerModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const advanced = useLevelAtLeast('advanced');

  const [preset, setPreset] = useParam('preset', 'earth');
  const P0 = KEPLER_PRESETS.find((p) => p.id === preset);
  const D0 = P0 ?? KEPLER_PRESETS.find((p) => p.id === 'earth')!; // URL defaults follow the preset (activities pass only ?preset=…)
  const [q, setQ] = useParam('q', D0.q, { min: 0.01, max: 100 });
  const [e, setE] = useParam('e', D0.e, { min: 0, max: 3.5 });
  const [mass, setMass] = useParam('m', 1, { min: 0.05, max: 20 });
  const [mr, setMr] = useParam('mr', D0.massRatio, { min: 0, max: 1 });
  const [frame, setFrame] = useParam<'rel' | 'com'>('frame', 'rel');
  const [areas, setAreas] = useParam('areas', true);
  const [vectors, setVectors] = useParam('vec', true);
  const [nSect, setNSect] = useParam('n', 12, { min: 4, max: 24 });
  const [span, setSpan] = useParam('span', 12, { min: 3, max: 60 });
  const [speed, setSpeed] = useParam('speed', 20);
  const [playing, setPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [guess, setGuess] = useState<number | null>(null);
  const [verify, setVerify] = useState<{ P1: number; P2: number } | null>(null);

  // ── model (sim-core, float64): μ = G(M + m) ──
  const mu = MU_SUN_AU_DAY * mass * (1 + mr);
  const el = useMemo(() => conicElements(q, e, mu), [q, e, mu]);
  const closed = el.period !== null;
  const N = Math.round(nSect);
  const fm = 1 / (1 + mr), fM = mr / (1 + mr);
  /** Open orbits: one pass between r = span·q inbound and outbound. */
  const tView = useMemo(() => {
    if (closed) return 0;
    const nu = trueAnomalyAtRadius(q, e, span * q) ?? (trueAnomalyLimit(e)! * 0.98);
    return timeSincePeriapsis(q, e, mu, nu);
  }, [closed, q, e, mu, span]);

  const tRef = useRef(closed ? 0 : -tView);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  const prevClosed = useRef(closed);
  if (prevClosed.current !== closed) { prevClosed.current = closed; tRef.current = closed ? 0 : -tView; }
  if (!closed && (tRef.current < -tView || tRef.current > tView)) tRef.current = Math.min(tView, Math.max(-tView, tRef.current));

  const geom = useMemo(() => {
    const pts: [number, number][] = [];
    if (el.kind === 'circle' || el.kind === 'ellipse') {
      const a = el.a, b = a * Math.sqrt(1 - e * e);
      for (let k = 0; k <= 360; k++) { const E = (k / 360) * 2 * Math.PI; pts.push([a * (Math.cos(E) - e), b * Math.sin(E)]); }
      return { pts, cx: -a * e, halfW: a, halfH: b };
    }
    const nuMax = trueAnomalyAtRadius(q, e, span * q) ?? trueAnomalyLimit(e)! * 0.98;
    for (let k = -200; k <= 200; k++) {
      const nu = (k / 200) * nuMax;
      const r = el.p / (1 + e * Math.cos(nu));
      pts.push([r * Math.cos(nu), r * Math.sin(nu)]);
    }
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), yMax = Math.max(...ys.map(Math.abs));
    return { pts, cx: (x0 + x1) / 2, halfW: (x1 - x0) / 2, halfH: yMax };
  }, [el, e, q, span]);

  // equal-TIME sectors: P/N for closed orbits, (2 t_view)/N for one pass
  const sectors = useMemo(() => (closed ? sweptSectors(q, e, mu, N, -el.period! / 2, el.period! / 2) : sweptSectors(q, e, mu, N, -tView, tView)), [q, e, mu, N, closed, el.period, tView]);

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    drawBackgroundStars(ctx, w, h, pal, 3);
    const sc = (Math.min(w / (2 * geom.halfW * 1.18), h / (2 * geom.halfH * 1.3)) || 1) * zoom;
    const ox = w / 2 - geom.cx * sc, oy = h / 2;
    const X = (x: number) => ox + x * sc, Y = (y: number) => oy - y * sc;
    const com = frame === 'com';
    const kOrbit = com ? fm : 1; // orbit of m about the barycentre is the relative orbit scaled by M/(M+m)

    if (areas) {
      const tt = tRef.current;
      const rel = closed ? (((tt + el.period! / 2) % el.period!) + el.period!) % el.period! : tt + tView;
      const cur = Math.floor(rel / sectors.dt);
      sectors.list.forEach((s, k) => {
        ctx.beginPath();
        s.pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(kOrbit * x), Y(kOrbit * y)) : ctx.moveTo(X(kOrbit * x), Y(kOrbit * y))));
        ctx.closePath();
        ctx.fillStyle = withAlpha(k % 2 ? pal.equator : pal.accent, k === cur ? 0.5 : 0.17);
        ctx.fill();
      });
    }
    const path = (scale: number, color: string, width: number) => {
      ctx.beginPath();
      geom.pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(scale * x), Y(scale * y)) : ctx.moveTo(X(scale * x), Y(scale * y))));
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    };
    path(kOrbit, withAlpha(pal.fg, 0.7), 1.6);
    if (com && mr > 0) path(-fM, withAlpha(pal.sun, 0.7), 1.2);

    // apsides & axis (relative orbit geometry)
    ctx.setLineDash([3, 5]); ctx.strokeStyle = withAlpha(pal.textFaint, 0.6); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(closed ? -kOrbit * el.Q! : geom.cx - geom.halfW), Y(0)); ctx.lineTo(X(kOrbit * q), Y(0)); ctx.stroke(); ctx.setLineDash([]);
    disk(ctx, X(kOrbit * q), Y(0), 3, pal.textDim);
    label(ctx, `${tx({ vi: 'Cận điểm', en: 'Periapsis' })} q`, X(kOrbit * q) + 8, Y(0) - 10, pal.textDim, { size: 11 });
    if (closed) {
      disk(ctx, X(-kOrbit * el.Q!), Y(0), 3, pal.textDim);
      label(ctx, `${tx({ vi: 'Viễn điểm', en: 'Apoapsis' })} Q`, X(-kOrbit * el.Q!) - 8, Y(0) - 10, pal.textDim, { size: 11, align: 'right' });
      if (e > 0.02 && !com) {
        const fx = X(-2 * el.a * e), fy = Y(0);
        ctx.strokeStyle = pal.textFaint; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(fx - 4, fy - 4); ctx.lineTo(fx + 4, fy + 4); ctx.moveTo(fx + 4, fy - 4); ctx.lineTo(fx - 4, fy + 4); ctx.stroke();
        label(ctx, tx({ vi: 'tiêu điểm trống', en: 'empty focus' }), fx, fy + 14, pal.textFaint, { size: 10.5, align: 'center' });
      }
    }

    const st = twoBodyState(q, e, mu, mr, tRef.current);
    const star = com ? st.M : { x: 0, y: 0, vx: 0, vy: 0 };
    const body = com ? st.m : { x: st.rel.x, y: st.rel.y, vx: st.rel.vx, vy: st.rel.vy };
    if (com) {
      ctx.strokeStyle = withAlpha(pal.textDim, 0.8); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(X(0) - 5, Y(0)); ctx.lineTo(X(0) + 5, Y(0)); ctx.moveTo(X(0), Y(0) - 5); ctx.lineTo(X(0), Y(0) + 5); ctx.stroke();
      label(ctx, tx({ vi: 'khối tâm', en: 'barycentre' }), X(0) + 7, Y(0) + 14, pal.textDim, { size: 10.5 });
    }
    glowDisk(ctx, X(star.x), Y(star.y), 8, pal.sun, 3.2);
    if (!drawGlobe(ctx, 'sun', X(star.x), Y(star.y), 8, { emissive: true })) disk(ctx, X(star.x), Y(star.y), 5, '#fff7d6');

    const px = X(body.x), py = Y(body.y);
    ctx.strokeStyle = withAlpha(pal.teal, 0.5); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(com ? 0 : star.x), Y(com ? 0 : star.y)); ctx.lineTo(px, py); ctx.stroke();
    if (vectors) {
      const vScale = ((geom.halfW * 0.35) / Math.sqrt(mu / q)) * sc;
      arrow(ctx, px, py, px + body.vx * vScale, py - body.vy * vScale, pal.horizon, 2.2, 9);
      // acceleration of m: −G M r̂ / r² = −(M/(M+m)) μ r̂ / r² (com) or −μ r̂ / r² (relative)
      const g = (com ? fm : 1) * (mu / (st.rel.r * st.rel.r));
      const aScale = ((geom.halfW * 0.25) / (mu / (q * q))) * sc;
      arrow(ctx, px, py, px - (st.rel.x / st.rel.r) * g * aScale, py + (st.rel.y / st.rel.r) * g * aScale, pal.ecliptic, 1.6, 7);
    }
    glowDisk(ctx, px, py, 5, pal.teal, 3);
    disk(ctx, px, py, 4.2, pal.teal);

    const nice = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
    const target = (w * 0.18) / sc;
    const bar = nice.reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best), 1);
    ctx.strokeStyle = pal.textDim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(16, h - 18); ctx.lineTo(16 + bar * sc, h - 18); ctx.stroke();
    label(ctx, `${bar} au`, 16, h - 30, pal.textDim, { size: 11, mono: true });
    if (!closed && tRef.current >= tView) label(ctx, tx({ vi: `Vật đã rời vùng quan sát (r > ${span} q) - quỹ đạo mở không quay lại`, en: `The body has left the view (r > ${span} q) - an open orbit does not return` }), w / 2, 24, pal.warn, { size: 12, align: 'center', weight: 700, halo: pal.bg });
  }, [q, e, mu, mr, frame, areas, vectors, pal, geom, sectors, zoom, tx, closed, el, tView, span, fm, fM]);

  usePointer(canvasRef, { wheel: (dy) => setZoom((z) => Math.min(20, Math.max(0.2, z * (dy > 0 ? 0.9 : 1.1)))) });

  useAnimationFrame((dt, now) => {
    if (playing) {
      tRef.current += dt * speed;
      if (!closed && tRef.current >= tView) { tRef.current = tView; setPlaying(false); }
    }
    redraw();
    if (now - lastUi.current > 120) { lastUi.current = now; setTick((x) => x + 1); }
  });

  // ── readouts: everything from the same state at the same t ──
  const st = twoBodyState(q, e, mu, mr, tRef.current);
  const s = st.rel;
  const energyNum = 0.5 * s.v * s.v - mu / s.r;
  const hNum = s.x * s.vy - s.y * s.vx;
  const resid = keplerResidual(q, e, mu, tRef.current);
  const vEsc = Math.sqrt((2 * mu) / s.r);
  // closed orbits: ν ∈ [0°, 360°); open orbits: signed ν ∈ (−ν∞, ν∞) (negative before periapsis)
  const nuDeg = closed ? ((((s.nu * 180) / Math.PI) % 360) + 360) % 360 : (s.nu * 180) / Math.PI;
  const tPhase = closed ? ((tRef.current % el.period!) + el.period!) % el.period! : tRef.current;
  const yrs = (d: number) => d > 2 * JULIAN_YEAR_DAYS;
  const showP = (d: number) => (yrs(d) ? `${fmt(d / JULIAN_YEAR_DAYS, 6, lang)} ${t('years')}` : `${fmt(d, 6, lang)} ${t('days')}`);

  const applyPreset = (id: string) => {
    setPreset(id);
    const p = KEPLER_PRESETS.find((x) => x.id === id);
    if (p) { setQ(p.q); setE(p.e); setMass(1); setMr(p.massRatio); }
    tRef.current = 0; setZoom(1); setPlaying(true); setVerify(null); setGuess(null);
  };
  const resetTime = () => { tRef.current = closed ? 0 : -tView; setPlaying(true); };

  const p2a3 = useMemo(() => KEPLER_PRESETS.filter((p) => p.refPeriodDays && p.massRatio > 0).map((p) => ({ a: p.q / (1 - p.e), P: p.refPeriodDays! / JULIAN_YEAR_DAYS })), []);
  const gj = GAUSSIAN_YEAR_DAYS / JULIAN_YEAR_DAYS;
  const Mtot = mass * (1 + mr);

  const rvSeries = useMemo(() => {
    const T0 = closed ? 0 : -tView, T = closed ? el.period! : 2 * tView;
    const rs: [number, number][] = [], vs: [number, number][] = [];
    for (let k = 0; k <= 240; k++) {
      const tt = T0 + (T * k) / 240;
      const x = twoBodyState(q, e, mu, mr, tt).rel;
      rs.push([tt, x.r]); vs.push([tt, x.v * KMS]);
    }
    return { rs, vs };
  }, [q, e, mu, mr, closed, el.period, tView]);

  const exportCsv = () => {
    const T0 = closed ? 0 : -tView, T = closed ? el.period! : 2 * tView;
    const rows: number[][] = [];
    for (let k = 0; k <= 500; k++) {
      const tt = T0 + (T * k) / 500;
      const b = twoBodyState(q, e, mu, mr, tt), r = b.rel;
      const g = -mu / (r.r ** 3);
      rows.push([tt, r.x, r.y, r.vx, r.vy, g * r.x, g * r.y, r.r, (r.nu * 180) / Math.PI, r.v * KMS, 0.5 * r.v * r.v - mu / r.r, r.x * r.vy - r.y * r.vx, b.M.x, b.M.y, b.m.x, b.m.y]);
    }
    downloadCsv('usac-b1-orbit.csv',
      ['t_minus_Tp_d', 'x_au', 'y_au', 'vx_au_d', 'vy_au_d', 'ax_au_d2', 'ay_au_d2', 'r_au', 'nu_deg', 'v_kms', 'eps_au2_d2', 'h_au2_d', 'xM_bary_au', 'yM_bary_au', 'xm_bary_au', 'ym_bary_au'],
      rows,
      [
        'USAC SimLab B1 - Kepler two-body, relative orbit of m about M (focus at origin, periapsis on +x), barycentric columns xM,yM,xm,ym',
        `mu = G(M+m) = ${mu} au^3/d^2 ; GM_sun = 1.32712440041939e20 m^3/s^2 (DE430), au = 149597870700 m, day = 86400 s`,
        `M = ${mass} M_sun ; m/M = ${mr} ; q = ${q} au ; e = ${e} ; T_p = 0 (t measured from periapsis)`,
        `kind = ${el.kind} ; signed a = ${el.a} au (a<0 hyperbola, Infinity parabola) ; p = ${el.p} au ; period = ${el.period ?? 'none (open orbit)'} d`,
        'solver = sim-core conicState: Halley (ellipse, hyperbola), Cardano closed form (Barker); |e-1| < 1e-9 treated as parabola',
      ]);
  };

  const kindLabel = tx(KIND_NAME[el.kind]);
  const timeEq = el.kind === 'parabola'
    ? 'D + \\tfrac{D^3}{3} = \\sqrt{\\tfrac{\\mu}{2q^3}}\\,(t-T_p),\\quad D = \\tan\\tfrac{\\nu}{2}'
    : el.kind === 'hyperbola'
      ? 'M_h = e\\sinh H - H = \\sqrt{\\tfrac{\\mu}{|a|^3}}\\,(t-T_p)'
      : 'M = E - e\\sin E = \\sqrt{\\tfrac{\\mu}{a^3}}\\,(t-T_p)';

  return (
    <SimLayout
      id="b1"
      lesson={lesson}
      card={card}
      caption={<><span className="k">e = {fix(e, 4, lang)} · {kindLabel}</span> · r = {fmt(s.r, 4, lang)} au · v = {fmt(s.v * KMS, 4, lang)} km/s · {closed ? <>P = {showP(el.period!)}</> : tx({ vi: 'không có chu kỳ (quỹ đạo mở)', en: 'no period (open orbit)' })}</>}
      onReset={() => { resetTime(); setZoom(1); }}
      onTogglePlay={() => { if (!closed && tRef.current >= tView) tRef.current = -tView; setPlaying((p) => !p); }}
      timeline={
        <Timeline
          playing={playing}
          onToggle={() => { if (!closed && tRef.current >= tView) tRef.current = -tView; setPlaying((p) => !p); }}
          onStep={(d) => { tRef.current += d * sectors.dt / 4; }}
          speed={speed}
          speeds={SPEEDS.map((v) => ({ value: v, label: `${v} ${t('days')}/s` }))}
          onSpeed={setSpeed}
          label={<>t − T<sub>p</sub> = {fix(tRef.current, 1, lang)} {t('days')}<small>{closed ? `(${fix(tPhase / el.period!, 3, lang)} P)` : tx({ vi: 'một lần bay qua', en: 'single pass' })}</small></>}
        >
          {!closed && <button className="btn small" onClick={resetTime}>↺ {tx({ vi: 'Bay lại từ đầu', en: 'Replay the pass' })}</button>}
        </Timeline>
      }
      panel={
        <>
          <Section title={t('secPresets')} dot="var(--grpB)">
            <Select value={preset} onChange={applyPreset} options={[...KEPLER_PRESETS.map((p) => ({ value: p.id, label: tx(p.name) })), { value: 'custom', label: tx({ vi: 'Tuỳ chỉnh', en: 'Custom' }) }]} />
            <div className="field-hint">{P0 ? `${tx({ vi: 'Nguồn', en: 'Source' })}: ${P0.source}` : tx({ vi: 'Tham số tuỳ chỉnh.', en: 'Custom parameters.' })}</div>
          </Section>
          <Section title={t('secParams')}>
            <Slider label={tx({ vi: 'Khoảng cách cận điểm q', en: 'Periapsis distance q' })} value={q} min={0.05} max={40} log step={0.0001} onChange={(v) => { setQ(v); setPreset('custom'); setVerify(null); }} display={`${fmt(q, 5, lang)} au`} />
            <Slider label={tx({ vi: 'Độ lệch tâm e', en: 'Eccentricity e' })} value={e} min={0} max={3.5} step={0.0001} onChange={(v) => { setE(Math.abs(v - 1) < 0.004 ? 1 : v); setPreset('custom'); setVerify(null); }} display={`${fix(e, 4, lang)} · ${kindLabel}`} />
            <div className="field-hint">{tx({ vi: 'Thanh trượt hút về đúng e = 1 trong khoảng ±0,004. Lõi coi |e − 1| < 10⁻⁹ là parabol.', en: 'The slider snaps to e = 1 within ±0.004. The core treats |e − 1| < 10⁻⁹ as a parabola.' })}</div>
            {student && <Slider label={tx({ vi: 'Khối lượng sao trung tâm M', en: 'Central star mass M' })} value={mass} min={0.1} max={10} log step={0.01} onChange={(v) => { setMass(v); setPreset('custom'); }} display={`${fix(mass, 2, lang)} M☉`} />}
            {student && <Slider label={tx({ vi: 'Tỉ số khối lượng m/M', en: 'Mass ratio m/M' })} value={Math.log10(Math.max(mr, 10 ** MR_MIN_LOG))} min={MR_MIN_LOG} max={0} step={0.01} onChange={(v) => { setMr(v <= MR_MIN_LOG + 0.005 ? 0 : +(10 ** v).toPrecision(4)); setPreset('custom'); }} display={mr === 0 ? tx({ vi: '≈ 0 (vật thể thử)', en: '≈ 0 (test particle)' }) : sci(mr, 3)} />}
            <div className="field-hint">{tx({ vi: 'μ = G(M + m). Chuyển động tương đối luôn là bài toán Kepler; khối lượng m chỉ đổi μ và chuyển động quanh khối tâm.', en: 'μ = G(M + m). The relative motion is always a Kepler problem; m changes μ and the motion about the barycentre.' })}</div>
          </Section>
          <Section title={t('secDisplay')}>
            <Segmented value={frame} onChange={setFrame} options={[{ value: 'rel', label: tx({ vi: 'Quỹ đạo tương đối', en: 'Relative orbit' }) }, { value: 'com', label: tx({ vi: 'Quanh khối tâm', en: 'About the barycentre' }) }]} small />
            <div className="field-hint">{frame === 'rel' ? tx({ vi: 'Sao chủ ở tiêu điểm; vẽ r = r_m − r_M.', en: 'Star at the focus; plots r = r_m − r_M.' }) : tx({ vi: 'r_M = −m/(M+m)·r, r_m = M/(M+m)·r. Với hành tinh thật, quỹ đạo của sao rất nhỏ - thử m/M = 0,3.', en: 'r_M = −m/(M+m)·r, r_m = M/(M+m)·r. For real planets the star’s orbit is tiny - try m/M = 0.3.' })}</div>
            <Toggle label={tx({ vi: 'Diện tích quét (định luật II)', en: 'Swept areas (2nd law)' })} checked={areas} onChange={setAreas} swatch="var(--accent)" />
            {areas && <Slider label={tx({ vi: 'Số múi thời gian bằng nhau N', en: 'Equal-time sectors N' })} value={nSect} min={4} max={24} step={1} onChange={setNSect} display={`${N} · Δt = ${showP(sectors.dt)}`} />}
            {!closed && <Slider label={tx({ vi: 'Vùng quan sát quỹ đạo mở r_max', en: 'Open-orbit view r_max' })} value={span} min={3} max={60} step={1} onChange={setSpan} display={`${span} q`} />}
            <Toggle label={tx({ vi: 'Vectơ vận tốc (hồng) & gia tốc (xanh)', en: 'Velocity (pink) & acceleration (green)' })} checked={vectors} onChange={setVectors} swatch="var(--horizon)" />
            <div className="scale-note">{tx({ vi: 'Kích thước sao và vật thể không theo tỉ lệ. Lăn chuột để phóng to.', en: 'Star and body sizes not to scale. Scroll to zoom.' })}</div>
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Loại quỹ đạo', en: 'Orbit type' })} v={kindLabel} tone={closed ? 'good' : 'accent'} frame={`ε ${el.energy < 0 ? '< 0' : el.energy === 0 ? '= 0' : '> 0'}`} />
              <Readout k={tx({ vi: 'Chu kỳ P', en: 'Period P' })} v={closed ? showP(el.period!) : '-'} frame={closed ? 'P = 2π√(a³/μ)' : tx({ vi: 'không có (quỹ đạo mở)', en: 'none (open orbit)' })} />
              {closed && P0?.refPeriodDays && <Readout wide k={tx({ vi: 'Chu kỳ tham chiếu', en: 'Reference period' })} v={showP(P0.refPeriodDays)} unit={`Δ ${fix((el.period! / P0.refPeriodDays - 1) * 1e6, 1, lang)} ppm`} frame={P0.refPeriodSource} />}
              <Readout k={tx({ vi: 'Cận điểm q', en: 'Periapsis q' })} v={fmt(q, 6, lang)} unit="au" />
              <Readout k={tx({ vi: 'Viễn điểm Q', en: 'Apoapsis Q' })} v={el.Q !== null ? fmt(el.Q, 6, lang) : '-'} unit={el.Q !== null ? 'au' : ''} />
              <Readout k={tx({ vi: 'Bán trục lớn a (có dấu)', en: 'Signed semi-major axis a' })} v={Number.isFinite(el.a) ? fmt(el.a, 6, lang) : '∞'} unit="au" frame={el.kind === 'hyperbola' ? `|a| = ${fmt(-el.a, 5, lang)} au` : undefined} />
              <Readout k={tx({ vi: 'Bán thông số tiêu p', en: 'Semi-latus rectum p' })} v={fmt(el.p, 6, lang)} unit="au" />
              <Readout k={tx({ vi: 'Khoảng cách r', en: 'Distance r' })} v={fmt(s.r, 5, lang)} unit="au" />
              <Readout k={tx({ vi: 'Dị thường thật ν', en: 'True anomaly ν' })} v={fix(nuDeg, 2, lang)} unit="°" />
              <Readout k={tx({ vi: 'Tốc độ tương đối v', en: 'Relative speed v' })} v={fmt(s.v * KMS, 5, lang)} unit="km/s" />
              <Readout k={tx({ vi: 'Tốc độ thoát cục bộ tại khoảng cách r', en: 'Local escape speed at distance r' })} v={fmt(vEsc * KMS, 5, lang)} unit="km/s" frame="v_esc = √(2μ/r)" />
              {student && <Readout k={tx({ vi: 'Năng lượng riêng ε', en: 'Specific energy ε' })} v={fmt(el.energy * KMS * KMS, 5, lang)} unit="km²/s²" tone={el.energy < 0 ? 'good' : 'bad'} frame="ε = μ(e − 1)/(2q)" />}
              {student && <Readout k={tx({ vi: 'Mômen động lượng riêng h', en: 'Specific angular momentum h' })} v={fmt((el.h * AU * KMS) / 1000, 5, lang)} unit="km²/s" frame="h = √(μ q (1+e))" />}
              {areas && <Readout wide k={tx({ vi: 'Diện tích mỗi múi: kỳ vọng h·Δt/2', en: 'Area per sector: expected h·Δt/2' })} v={fmt(sectors.expected, 5, lang)} unit="au²" frame={`${tx({ vi: 'hình học: lệch tối đa', en: 'geometric: max deviation' })} ${sci(sectors.maxRelDev, 1)}${sectors.maxRelDevQuad !== null ? ` · ${tx({ vi: 'tích phân ½∫r²dν', en: 'quadrature ½∫r²dν' })} ${sci(sectors.maxRelDevQuad, 1)}` : ''}`} tone="good" />}
              {advanced && <Readout k={tx({ vi: 'Phần dư phương trình thời gian', en: 'Time-equation residual' })} v={sci(resid, 1)} frame={el.kind === 'parabola' ? 'Barker' : el.kind === 'hyperbola' ? 'Kepler (hyperbol)' : 'Kepler'} />}
              {advanced && <Readout k={tx({ vi: 'Lệch năng lượng |ε(v,r) − ε|·q/μ', en: 'Energy deviation |ε(v,r) − ε|·q/μ' })} v={sci(Math.abs(energyNum - el.energy) / (mu / q), 1)} />}
              {advanced && <Readout k={tx({ vi: 'Lệch mômen động lượng |r×v|/h − 1', en: 'Angular-momentum deviation |r×v|/h − 1' })} v={sci(Math.abs(hNum / el.h - 1), 1)} />}
            </Readouts>
          </Section>
          {student && (
            <Section title={t('secEquations')} open={false}>
              <div className="eq-box"><Tex display tex={'r(\\nu) = \\frac{p}{1+e\\cos\\nu},\\qquad p = q(1+e) = \\frac{h^2}{\\mu},\\qquad \\mu = G(M+m)'} /></div>
              <div className="eq-box"><Tex display tex={timeEq} /></div>
              <div className="eq-box"><Tex display tex={'\\varepsilon = \\frac{v^2}{2} - \\frac{\\mu}{r} = \\frac{\\mu(e-1)}{2q},\\qquad v^2 = \\mu\\left(\\frac{2}{r} - \\frac{1}{a}\\right),\\qquad \\frac{dA}{dt} = \\frac{h}{2}'} /></div>
              {closed && <div className="eq-box"><Tex display tex={'P = 2\\pi\\sqrt{\\frac{a^3}{\\mu}}\\quad(0 \\le e < 1)'} /></div>}
            </Section>
          )}
          <Section title={tx({ vi: 'Định luật III', en: '3rd law' })}>
            <ChartCard title={tx({ vi: `(P/năm)² = (a/au)³ / ((M+m)/M☉) · đường: M + m = ${fix(Mtot, 4, lang)} M☉`, en: `(P/yr)² = (a/au)³ / ((M+m)/M☉) · line: M + m = ${fix(Mtot, 4, lang)} M☉` })}>
              <LineChart height={190} xLog yLog xLabel="a (au)" yLabel={tx({ vi: 'P (năm Julius)', en: 'P (Julian yr)' })} xDomain={[0.2, 50]} yDomain={[0.08, 400]}
                series={[{ data: [[0.2, (gj * 0.2 ** 1.5) / Math.sqrt(Mtot)], [50, (gj * 50 ** 1.5) / Math.sqrt(Mtot)]], color: pal.accent, label: '$P = a^{3/2}/\\sqrt{M+m}$', dash: '5 4' }]}
                markers={[
                  ...p2a3.map((p) => ({ x: p.a, y: p.P, color: pal.textDim, r: 3.5 })),
                  ...(closed && el.a > 0.2 && el.a < 50 ? [{ x: el.a, y: el.period! / JULIAN_YEAR_DAYS, color: pal.teal, r: 6, label: tx({ vi: 'quỹ đạo này', en: 'this orbit' }) }] : []),
                ]} />
            </ChartCard>
            <div className="field-hint">{tx({ vi: 'Điểm xám: hành tinh thật (chu kỳ tham chiếu JPL, M = 1 M☉). P² = a³ đúng tuyệt đối khi đo P bằng năm Gauss (365,2568983 ngày); năm Julius lệch 1,9 × 10⁻⁵. Khi đổi M, dùng dạng có (M + m).', en: 'Grey dots: real planets (JPL reference periods, M = 1 M☉). P² = a³ is exact with P in Gaussian years (365.2568983 d); the Julian year differs by 1.9 × 10⁻⁵. When M changes, use the (M + m) form.' })}</div>
          </Section>
          {closed && (
            <Section title={tx({ vi: 'Dự đoán rồi kiểm chứng', en: 'Predict, then verify' })} open={student}>
              <div className="field-hint" style={{ marginBottom: 6 }}>{tx({ vi: 'Nếu tăng bán trục lớn lên 2 lần (giữ e và M + m), chu kỳ thay đổi bao nhiêu lần?', en: 'If the semi-major axis doubles (same e and M + m), by what factor does the period change?' })}</div>
              <Segmented value={guess === null ? '' : String(guess)} onChange={(v) => setGuess(Number(v))} options={[2, 2.83, 4, 8].map((x) => ({ value: String(x), label: `×${fix(x, x === 2.83 ? 2 : 0, lang)}` }))} small />
              <button className="btn small" disabled={guess === null} onClick={() => { const P1 = el.period!; setQ(2 * q); setPreset('custom'); setVerify({ P1, P2: conicElements(2 * q, e, mu).period! }); }}>
                {tx({ vi: 'Kiểm chứng: nhân đôi q (tức nhân đôi a)', en: 'Verify: double q (hence a)' })}
              </button>
              {verify && (
                <div className={guess === 2.83 ? 'good-box' : 'warn-box'}>
                  {tx({ vi: `P tăng từ ${showP(verify.P1)} lên ${showP(verify.P2)}: ×${fix(verify.P2 / verify.P1, 4, lang)} = $2^{3/2}$. ${guess === 2.83 ? 'Dự đoán đúng!' : `Bạn chọn ×${fix(guess ?? 0, 2, lang)}.`}`, en: `P grows from ${showP(verify.P1)} to ${showP(verify.P2)}: ×${fix(verify.P2 / verify.P1, 4, lang)} = $2^{3/2}$. ${guess === 2.83 ? 'Correct prediction!' : `You chose ×${fix(guess ?? 0, 2, lang)}.`}` })}
                </div>
              )}
            </Section>
          )}
          <Section title={tx({ vi: 'r(t) và v(t)', en: 'r(t) and v(t)' })} open={student}>
            <ChartCard>
              <LineChart height={130} xLabel={`t − T_p (${t('days')})`} yLabel="r (au)" series={[{ data: rvSeries.rs, color: pal.teal }]} vlines={[{ x: tPhase, color: pal.horizon }]} />
            </ChartCard>
            <ChartCard>
              <LineChart height={130} xLabel={`t − T_p (${t('days')})`} yLabel="v (km/s)" series={[{ data: rvSeries.vs, color: pal.horizon }]} vlines={[{ x: tPhase, color: pal.teal }]} />
            </ChartCard>
            {advanced && <button className="btn small" onClick={exportCsv}>{t('exportCsv')}</button>}
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label={tx({ vi: `Quỹ đạo ${kindLabel} với q = ${q.toFixed(3)} au, e = ${e.toFixed(3)}`, en: `${kindLabel} orbit with q = ${q.toFixed(3)} au, e = ${e.toFixed(3)}` })} />
      <div className="stage-overlay tr">
        <div className="legend">
          <span><i className="dot" style={{ background: 'var(--sun)' }} />{frame === 'rel' ? tx({ vi: 'Sao chủ (tiêu điểm)', en: 'Host star (focus)' }) : tx({ vi: 'Sao chủ (quanh khối tâm)', en: 'Host star (about barycentre)' })}</span>
          <span><i style={{ background: 'var(--horizon)' }} />{tx({ vi: 'Vận tốc', en: 'Velocity' })}</span>
          <span><i style={{ background: 'var(--ecliptic)' }} />{tx({ vi: 'Gia tốc hấp dẫn', en: 'Gravitational acceleration' })}</span>
          {areas && <span><i style={{ background: 'var(--accent)' }} />{tx({ vi: 'Múi quét trong Δt bằng nhau', en: 'Sectors of equal Δt' })}</span>}
        </div>
      </div>
    </SimLayout>
  );
}


