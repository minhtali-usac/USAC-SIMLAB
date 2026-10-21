import { useEffect, useMemo, useRef, useState } from 'react';
import {
  hohmann, biElliptic, biEllipticLimitDv, biEllipticThresholds, biEllipticRegion, conicState, planetHeliocentric, planetElements, planetOrbitPath,
  hohmannPhaseDates, realPhaseAngle, lambertLeg, lambertArc, PLANETS, dateToJD, jdToDate, JD_J2000, MU_SUN_AU_DAY_B2, AU, SECONDS_PER_DAY, norm,
  type PlanetId, type BiEllipticRegion,
} from '@usac/sim-core';
import { drawGlobe, PLANET_TEX, type GlobeTex } from '../../lib/globe';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Select, Segmented, Field } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, type L, sci } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette, usePointer } from '../../lib/hooks';
import { clear, drawBackgroundStars, withAlpha, label, disk, glowDisk, photoDisk } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { downloadCsv } from '../../lib/csv';
import { lesson, card } from './content';

/** Real photographs used as planet disks (see CREDITS.md). */
const PHOTO: Partial<Record<PlanetId, string>> = { earth: 'e1.jpg', mars: 'b2.jpg', mercury: 'd2.jpg' };
const NAMES: Record<PlanetId, L> = {
  mercury: { vi: 'Sao Thuỷ', en: 'Mercury' }, venus: { vi: 'Sao Kim', en: 'Venus' }, earth: { vi: 'Trái Đất', en: 'Earth' }, mars: { vi: 'Sao Hoả', en: 'Mars' },
  jupiter: { vi: 'Sao Mộc', en: 'Jupiter' }, saturn: { vi: 'Sao Thổ', en: 'Saturn' }, uranus: { vi: 'Sao Thiên Vương', en: 'Uranus' }, neptune: { vi: 'Sao Hải Vương', en: 'Neptune' },
};
const REGION_TEXT: Record<BiEllipticRegion, L> = {
  hohmannAlways: { vi: 'Hohmann tốn ít Δv hơn mọi bi-elliptic', en: 'Hohmann beats every bi-elliptic' },
  dependsOnRb: { vi: 'Tuỳ r_b: bi-elliptic chỉ thắng khi r_b đủ lớn', en: 'Depends on r_b: bi-elliptic wins only for large enough r_b' },
  biAlways: { vi: 'Mọi bi-elliptic với r_b > r₂ tốn ít Δv hơn Hohmann', en: 'Every bi-elliptic with r_b > r₂ needs less Δv than Hohmann' },
};
const MU = MU_SUN_AU_DAY_B2; // au³/day², GM☉ (DE430)
const KMS = AU / SECONDS_PER_DAY / 1000;
const kms = (v: number) => v * KMS;
const TH = biEllipticThresholds();
const iso = (jd: number) => jdToDate(jd).toISOString().slice(0, 10);
const wrapDeg = (d: number) => ((d + 540) % 360) - 180;
type View = 'ideal' | 'eph' | 'lambert';

export default function TransferModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const advanced = useLevelAtLeast('advanced');
  const [view, setView] = useParam<View>('view', 'ideal');
  const [from, setFrom] = useParam<PlanetId>('from', 'earth');
  const [to, setTo] = useParam<PlanetId>('to', 'mars');
  const [mode, setMode] = useParam<'h' | 'bi'>('mode', 'h');
  const [rbRatio, setRbRatio] = useParam('rb', 2, { min: 1, max: 50 });
  const todayStr = new Date().toISOString().slice(0, 10);
  const [launch, setLaunch] = useParam('launch', todayStr);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoverR, setHoverR] = useState<number | null>(null);
  const [guess, setGuess] = useState<number | null>(null);

  // ── ideal layer: circular coplanar orbits with the JPL J2000 semi-major axes (one constant set) ──
  const r1 = planetElements(from, JD_J2000).a;
  const r2 = planetElements(to, JD_J2000).a;
  const outward = r2 > r1;
  const H = useMemo(() => hohmann(r1, r2, MU), [r1, r2]);
  const rb = Math.max(r1, r2) * rbRatio;
  const B = useMemo(() => biElliptic(r1, r2, rb, MU), [r1, r2, rb]);
  const tofIdeal = mode === 'h' ? H.tof : B.tof;
  const arrivalAngle = mode === 'h' ? Math.PI : 2 * Math.PI;
  const phiReq = (((arrivalAngle - H.n2 * tofIdeal) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  const [tofL, setTofL] = useParam('tof', Math.round(H.tof), { min: 20, max: 20000 });

  const jdLaunch = dateToJD(new Date(`${launch}T00:00:00Z`));
  const outOfRange = jdLaunch < 2378496.5 || jdLaunch > 2469807.5; // 1800-01-01 … 2050-01-01
  const nextDates = useMemo(() => hohmannPhaseDates(from, to, phiReq, jdLaunch, 3, 1), [from, to, phiReq, jdLaunch]);
  const prevDates = useMemo(() => hohmannPhaseDates(from, to, phiReq, jdLaunch, 1, -1), [from, to, phiReq, jdLaunch]);

  const leg = useMemo(() => (view === 'lambert' ? lambertLeg(from, to, jdLaunch, tofL, MU) : null), [view, from, to, jdLaunch, tofL]);
  const arc = useMemo(() => (leg ? lambertArc(leg.rDep, leg.v1, leg.tof, MU, 200) : []), [leg]);

  const tofShown = view === 'lambert' ? tofL : tofIdeal;
  const tRef = useRef(0);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  const theta0 = view === 'ideal' ? 0 : Math.atan2(planetHeliocentric(from, jdLaunch)[1], planetHeliocentric(from, jdLaunch)[0]);

  /** Ideal transfer path (perifocal → rotated to the departure longitude θ₀). */
  const craftAt = (tau: number): [number, number] => {
    const rot = (x: number, y: number, a: number): [number, number] => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    if (mode === 'h') {
      const q = Math.min(r1, r2), e = H.eTransfer;
      if (outward) { const s = conicState(q, e, MU, Math.min(tau, H.tof)); return rot(s.x, s.y, theta0); }
      const s = conicState(q, e, MU, Math.min(tau, H.tof) + H.tof); // start at apoapsis r₁
      return rot(s.x, s.y, theta0 + Math.PI);
    }
    const e1 = (rb - r1) / (rb + r1), T1 = Math.PI * Math.sqrt(B.a1 ** 3 / MU);
    if (tau <= T1) { const s = conicState(r1, e1, MU, tau); return rot(s.x, s.y, theta0); }
    const e2 = (rb - r2) / (rb + r2), T2 = Math.PI * Math.sqrt(B.a2 ** 3 / MU);
    const s = conicState(r2, e2, MU, Math.min(tau - T1, T2) - T2);
    return rot(s.x, s.y, theta0);
  };
  /** Planet position: ideal circle (view = ideal) or real ephemeris. */
  const planetAt = (id: PlanetId, tau: number): [number, number] => {
    if (view === 'ideal') {
      const r = id === from ? r1 : r2, n = id === from ? H.n1 : H.n2, a0 = id === from ? 0 : phiReq;
      return [r * Math.cos(a0 + n * tau), r * Math.sin(a0 + n * tau)];
    }
    const p = planetHeliocentric(id, jdLaunch + tau);
    return [p[0], p[1]];
  };
  const lambertAt = (tau: number): [number, number] => {
    if (!arc.length) return [0, 0];
    const k = Math.min(arc.length - 1, Math.max(0, Math.round((tau / tofL) * (arc.length - 1))));
    return [arc[k][0], arc[k][1]];
  };
  const craft = view === 'lambert' ? lambertAt : craftAt;

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    drawBackgroundStars(ctx, w, h, pal, 9);
    const rMax = view !== 'lambert' && mode === 'bi' ? rb : Math.max(r1, r2) * 1.08;
    const sc = ((Math.min(w, h) * 0.46) / rMax) * zoom;
    const cx = w / 2, cy = h / 2;
    const X = (x: number) => cx + x * sc, Y = (y: number) => cy - y * sc;
    const tau = tRef.current;
    for (const id of [from, to]) {
      ctx.strokeStyle = withAlpha(PLANETS.find((p) => p.id === id)!.color, 0.45); ctx.lineWidth = 1.2; ctx.beginPath();
      if (view === 'ideal') { const r = id === from ? r1 : r2; ctx.arc(cx, cy, r * sc, 0, Math.PI * 2); }
      else planetOrbitPath(id, jdLaunch + tau, 180).forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
      ctx.stroke();
    }
    ctx.setLineDash([5, 5]); ctx.strokeStyle = withAlpha(pal.teal, 0.75); ctx.lineWidth = 1.4; ctx.beginPath();
    for (let k = 0; k <= 200; k++) { const [x, y] = craft((tofShown * k) / 200); k ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
    ctx.stroke(); ctx.setLineDash([]);
    glowDisk(ctx, cx, cy, 8, pal.sun, 3.5);
    disk(ctx, cx, cy, 6, '#fff7d6');
    // target position at arrival (ghost) and rendezvous point
    const [gx, gy] = planetAt(to, tofShown);
    ctx.strokeStyle = withAlpha(PLANETS.find((p) => p.id === to)!.color, 0.8); ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.arc(X(gx), Y(gy), 9, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, `${tx(NAMES[to])} @ T+${fix(tofShown, 0, lang)} d`, X(gx) + 12, Y(gy) + 14, withAlpha(pal.fg, 0.6), { size: 10.5, halo: pal.bg });
    const [ax, ay] = craft(tofShown);
    ctx.strokeStyle = pal.teal; ctx.beginPath(); ctx.arc(X(ax), Y(ay), 6, 0, Math.PI * 2); ctx.stroke();
    for (const id of [from, to]) {
      const [px, py] = planetAt(id, tau);
      const col = PLANETS.find((x) => x.id === id)!.color;
      glowDisk(ctx, X(px), Y(py), 7, col, 2.2);
      // textured globe lit from the Sun (screen centre)
      if (!drawGlobe(ctx, PLANET_TEX[id] as GlobeTex, X(px), Y(py), 9, { light: [-px, -py, 0.25 * Math.hypot(px, py)], ambient: 0.12, tilt: 0.3 })) disk(ctx, X(px), Y(py), 6, col);
      label(ctx, tx(NAMES[id]), X(px) + 9, Y(py) - 9, col, { size: 12, weight: 700, halo: pal.bg });
    }
    const [sx, sy] = craft(Math.min(tau, tofShown));
    disk(ctx, X(sx), Y(sy), 4, '#fff');
    label(ctx, '🚀', X(sx) + 6, Y(sy) - 8, pal.fg, { size: 13 });
    const tag = view === 'ideal' ? tx({ vi: 'MÔ HÌNH LÝ TƯỞNG - quỹ đạo tròn đồng phẳng', en: 'IDEAL MODEL - coplanar circular orbits' }) : view === 'eph' ? tx({ vi: 'HÀNH TINH THỰC (JPL) - quỹ đạo chuyển Hohmann lý tưởng đặt tại ngày phóng', en: 'REAL PLANETS (JPL) - ideal Hohmann path placed at the launch date' }) : tx({ vi: 'LAMBERT - khớp vị trí thật lúc đi và lúc đến', en: 'LAMBERT - matches real positions at departure and arrival' });
    label(ctx, tag, 14, 20, pal.textDim, { size: 11, weight: 700 });
  }, [view, from, to, mode, rbRatio, jdLaunch, zoom, pal, tx, lang, H, B, arc, tofShown, phiReq]);

  usePointer(canvasRef, { wheel: (dy) => setZoom((z) => Math.min(30, Math.max(0.3, z * (dy > 0 ? 0.9 : 1.1)))) });

  useAnimationFrame((dt, now) => {
    if (playing) {
      tRef.current += dt * Math.max(20, tofShown / 12);
      if (tRef.current > tofShown * 1.1) { tRef.current = tofShown * 1.1; setPlaying(false); }
    }
    redraw();
    if (now - lastUi.current > 120) { lastUi.current = now; setTick((x) => x + 1); }
  });
  useEffect(() => { tRef.current = 0; }, [view, from, to, mode, launch]);

  const phaseAtLaunchDeg = (realPhaseAngle(from, to, jdLaunch) * 180) / Math.PI;
  const phiReqDeg = (phiReq * 180) / Math.PI;
  const [axx, ayy] = craftAt(tofIdeal);
  const tgt = planetHeliocentric(to, jdLaunch + tofIdeal);
  const missDeg = wrapDeg(((Math.atan2(tgt[1], tgt[0]) - Math.atan2(ayy, axx)) * 180) / Math.PI);

  // ── Hohmann vs bi-elliptic trade-off (normalised: r₁ = 1, μ = 1, T₁ = 2π) ──
  const ratioChart = useMemo(() => {
    const hh: [number, number][] = [], bb: [number, number][] = [], binf: [number, number][] = [], th: [number, number][] = [], tb: [number, number][] = [];
    for (let k = 0; k <= 200; k++) {
      const R = 10 ** ((k / 200) * 2);
      const hm = hohmann(1, R, 1), bi = biElliptic(1, R, R * rbRatio, 1);
      hh.push([R, hm.dvTotal]); bb.push([R, bi.dvTotal]); binf.push([R, biEllipticLimitDv(1, R, 1)]);
      th.push([R, hm.tof / (2 * Math.PI)]); tb.push([R, bi.tof / (2 * Math.PI)]);
    }
    return { hh, bb, binf, th, tb };
  }, [rbRatio]);
  const Rnow = outward ? r2 / r1 : r1 / r2;
  const Rh = hoverR ?? Rnow;
  const hoverInfo = (() => {
    const hm = hohmann(1, Rh, 1), bi = biElliptic(1, Rh, Rh * rbRatio, 1);
    return { R: Rh, dvH: hm.dvTotal, dvB: bi.dvTotal, dvL: biEllipticLimitDv(1, Rh, 1), tH: hm.tof / (2 * Math.PI), tB: bi.tof / (2 * Math.PI), region: biEllipticRegion(Rh, TH) };
  })();

  // ── porkchop (C3) around the chosen launch date ──
  const pork = useMemo(() => {
    if (view !== 'lambert') return null;
    const nd = 64, nt = 48, d0 = jdLaunch - 160, d1 = jdLaunch + 160, t0 = Math.max(30, 0.45 * H.tof), t1 = 1.7 * H.tof;
    const c3 = new Float64Array(nd * nt);
    let best = { c3: Infinity, jd: 0, tof: 0 };
    for (let i = 0; i < nd; i++) for (let j = 0; j < nt; j++) {
      const jd = d0 + ((d1 - d0) * i) / (nd - 1), tof = t0 + ((t1 - t0) * j) / (nt - 1);
      const lg = lambertLeg(from, to, jd, tof, MU);
      const v = lg ? kms(Math.sqrt(lg.c3)) ** 2 : NaN;
      c3[j * nd + i] = v;
      if (v < best.c3) best = { c3: v, jd, tof };
    }
    return { nd, nt, d0, d1, t0, t1, c3, best };
  }, [view, from, to, jdLaunch, H.tof]);
  const porkRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = porkRef.current;
    if (!c || !pork) return;
    const w = c.clientWidth, hgt = c.clientHeight, dpr = window.devicePixelRatio || 1;
    c.width = w * dpr; c.height = hgt * dpr;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const lo = Math.log(Math.max(pork.best.c3, 0.5)), hi = lo + Math.log(12);
    const cw = w / pork.nd, ch = hgt / pork.nt;
    for (let j = 0; j < pork.nt; j++) for (let i = 0; i < pork.nd; i++) {
      const v = pork.c3[j * pork.nd + i];
      const s = Number.isFinite(v) ? Math.min(1, Math.max(0, (Math.log(v) - lo) / (hi - lo))) : 1;
      const hue = 200 - 200 * s;
      ctx.fillStyle = s >= 1 ? 'rgba(80,80,90,0.5)' : `hsl(${hue},75%,${35 + 20 * (1 - s)}%)`;
      ctx.fillRect(i * cw, hgt - (j + 1) * ch, cw + 0.5, ch + 0.5);
    }
    const px = ((jdLaunch - pork.d0) / (pork.d1 - pork.d0)) * w, py = hgt - ((tofL - pork.t0) / (pork.t1 - pork.t0)) * hgt;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.stroke();
    const bx = ((pork.best.jd - pork.d0) / (pork.d1 - pork.d0)) * w, by = hgt - ((pork.best.tof - pork.t0) / (pork.t1 - pork.t0)) * hgt;
    ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.fillText('★', bx - 4, by + 4);
  }); // redraw every render: the canvas mounts only when its panel tab is opened
  const onPorkClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pork) return;
    const r = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width, fy = 1 - (e.clientY - r.top) / r.height;
    setLaunch(iso(pork.d0 + fx * (pork.d1 - pork.d0)));
    setTofL(Math.round(pork.t0 + fy * (pork.t1 - pork.t0)));
  };

  const fmtDur = (d: number) => (d > 900 ? `${fix(d / 365.25, 2, lang)} ${t('years')}` : `${fix(d, 1, lang)} ${t('days')}`);
  const planetOpts = PLANETS.map((p) => ({ value: p.id, label: tx(NAMES[p.id]) }));
  const predOpts = [0.5, 1, 2].map((k) => tofIdeal * k);

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['view', view, ''], ['departure_planet', from, ''], ['target_planet', to, ''], ['transfer', mode === 'h' ? 'Hohmann' : 'bi-elliptic', ''],
      ['r1_J2000_a', r1, 'au'], ['r2_J2000_a', r2, 'au'], ['rb', mode === 'bi' ? rb : '', 'au'],
      ['dv1_signed', kms(mode === 'h' ? H.dv1 : B.dv1), 'km/s'], ['dv2_signed', kms(mode === 'h' ? H.dv2 : B.dv2), 'km/s'], ['dv3_signed', mode === 'bi' ? kms(B.dv3) : '', 'km/s'],
      ['dv_total_heliocentric', kms(mode === 'h' ? H.dvTotal : B.dvTotal), 'km/s'], ['tof_ideal', tofIdeal, 'd'], ['phase_required', phiReqDeg, 'deg'], ['synodic_period', H.synodicPeriod, 'd'],
      ['launch_date_utc', launch, ''], ['phase_at_launch_ephemeris', phaseAtLaunchDeg, 'deg'], ['phase_deviation', wrapDeg(phaseAtLaunchDeg - phiReqDeg), 'deg'],
      ['next_hohmann_phase_date_ephemeris', nextDates[0] ? iso(nextDates[0]) : '', ''],
      ...(leg ? [
        ['lambert_tof', leg.tof, 'd'], ['arrival_date_utc', iso(leg.jdArr), ''],
        ...(['x', 'y', 'z'] as const).flatMap((c, k) => [[`r_dep_${c}`, leg.rDep[k], 'au'], [`r_arr_${c}`, leg.rArr[k], 'au'], [`v_sc_dep_${c}`, kms(leg.v1[k]), 'km/s'], [`v_sc_arr_${c}`, kms(leg.v2[k]), 'km/s'], [`vinf_dep_${c}`, kms(leg.vInfDep[k]), 'km/s'], [`vinf_arr_${c}`, kms(leg.vInfArr[k]), 'km/s']] as (string | number)[][]),
        ['C3', kms(Math.sqrt(leg.c3)) ** 2, 'km2/s2'], ['lambert_residual', leg.residual, ''],
      ] : []),
    ];
    downloadCsv('usac-b2-transfer.csv', ['quantity', 'value', 'unit'], rows, [
      'USAC SimLab B2 - heliocentric impulsive transfers (two-body, Sun only)',
      'GM_sun = 1.32712440041939e20 m^3/s^2 (DE430); au = 149597870700 m; day = 86400 s',
      'ephemeris = JPL Standish Table 1 approximate elements, ecliptic J2000, heliocentric; time scale TDB ~ UTC (69 s neglected)',
      'ideal layer uses circular coplanar orbits with r = J2000 semi-major axis; Lambert = universal variables (Curtis Alg. 5.2), zero-rev prograde',
      `exported = ${new Date().toISOString()} ; parameters are also in the page URL`,
    ]);
  };

  return (
    <SimLayout
      id="b2"
      lesson={lesson}
      card={card}
      caption={view === 'lambert' && leg
        ? <><span className="k">C₃ = {fix(kms(Math.sqrt(leg.c3)) ** 2, 2, lang)} km²/s²</span> · {tx({ vi: '$v_{\\infty,\\text{đến}}$', en: '$v_{\\infty,\\text{arr}}$' })} = {fix(kms(norm(leg.vInfArr)), 2, lang)} km/s · {iso(jdLaunch)} → {iso(leg.jdArr)}</>
        : <><span className="k">Δv {tx({ vi: 'nhật tâm', en: 'heliocentric' })} = {fix(kms(mode === 'h' ? H.dvTotal : B.dvTotal), 3, lang)} km/s</span> · {fmtDur(tofIdeal)} · φ = {fix(phiReqDeg, 1, lang)}°{view === 'eph' && nextDates[0] ? <> · {tx({ vi: 'ngày pha Hohmann kế tiếp', en: 'next Hohmann phase date' })} {iso(nextDates[0])}</> : null}</>}
      onReset={() => { tRef.current = 0; setPlaying(false); setZoom(1); }}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={
        <Timeline
          playing={playing}
          onToggle={() => { if (tRef.current >= tofShown * 1.09) tRef.current = 0; setPlaying((x) => !x); }}
          onStep={(d) => { tRef.current = Math.max(0, tRef.current + d * 10); }}
          label={<>T+{fix(tRef.current, 0, lang)} {t('days')}<small>{view === 'ideal' ? tx({ vi: 'mô hình lý tưởng', en: 'ideal model' }) : iso(jdLaunch + tRef.current)}</small></>}
        />
      }
      panel={
        <>
          <Section title={tx({ vi: 'Lớp mô hình', en: 'Model layer' })} dot="var(--grpB)">
            <Segmented value={view} onChange={setView} options={[{ value: 'ideal', label: tx({ vi: 'Hohmann lý tưởng', en: 'Ideal Hohmann' }) }, { value: 'eph', label: tx({ vi: 'Hành tinh thực', en: 'Real planets' }) }, { value: 'lambert', label: 'Lambert' }]} small />
            <div className="field-hint">{view === 'ideal' ? tx({ vi: 'Hai quỹ đạo tròn đồng phẳng (r = bán trục lớn J2000). Hành tinh đích đặt sẵn đúng góc pha nên tàu luôn gặp đích.', en: 'Two coplanar circles (r = J2000 semi-major axis). The target starts at the exact phase, so the craft always meets it.' }) : view === 'eph' ? tx({ vi: 'Vị trí thật (JPL Standish). Quỹ đạo chuyển vẫn là Hohmann lý tưởng - đây là phép sàng lọc hình học, chưa phải cửa sổ phóng nhiệm vụ.', en: 'Real positions (JPL Standish). The transfer is still the ideal Hohmann - a geometric screening, not a mission launch window.' }) : tx({ vi: 'Giải bài toán Lambert giữa vị trí thật của hai hành tinh lúc đi và lúc đến; cho v∞ và C₃ (chặng nhật tâm, chưa gồm phóng/hãm).', en: 'Solves Lambert’s problem between the planets’ real positions at departure and arrival; gives v∞ and C₃ (heliocentric leg, no launch/capture).' })}</div>
          </Section>
          <Section title={tx({ vi: 'Hành trình', en: 'Mission' })}>
            <Select label={tx({ vi: 'Xuất phát', en: 'Departure' })} value={from} onChange={(v) => { setFrom(v); if (v === to) setTo(v === 'earth' ? 'mars' : 'earth'); }} options={planetOpts} />
            <Select label={tx({ vi: 'Đích', en: 'Target' })} value={to} onChange={(v) => { setTo(v); setTofL(Math.round(hohmann(r1, planetElements(v, JD_J2000).a, MU).tof)); }} options={planetOpts.filter((o) => o.value !== from)} />
            {view !== 'lambert' && <Segmented value={mode} onChange={setMode} options={[{ value: 'h', label: 'Hohmann' }, { value: 'bi', label: 'Bi-elliptic' }]} />}
            {view !== 'lambert' && mode === 'bi' && <Slider label={tx({ vi: 'Bán kính trung gian r_b / max(r₁, r₂)', en: 'Intermediate radius r_b / max(r₁, r₂)' })} value={rbRatio} min={1} max={50} log step={0.01} onChange={setRbRatio} display={`×${fix(rbRatio, 2, lang)} = ${fmt(rb, 4, lang)} au`} />}
            {view !== 'ideal' && (
              <>
                <Field label={tx({ vi: 'Ngày khởi hành (UTC)', en: 'Departure date (UTC)' })}>
                  <input className="text-input" type="date" value={launch} onChange={(e) => { if (e.target.value) setLaunch(e.target.value); }} />
                </Field>
                {outOfRange && <div className="warn-box">{tx({ vi: 'Ngoài khoảng 1800–2050 của phần tử JPL Standish - vị trí hành tinh kém tin cậy.', en: 'Outside the 1800–2050 range of the JPL Standish elements - planet positions unreliable.' })}</div>}
                <div className="row">
                  {nextDates[0] && <button className="btn small" onClick={() => { setLaunch(iso(nextDates[0])); if (view === 'lambert') setTofL(Math.round(tofIdeal)); setPlaying(true); }}>🎯 {tx({ vi: 'Ngày pha Hohmann kế tiếp', en: 'Next Hohmann phase date' })}</button>}
                  {prevDates[0] && <button className="btn small" onClick={() => setLaunch(iso(prevDates[0]))}>◀ {tx({ vi: 'Trước đó', en: 'Previous' })}</button>}
                  <button className="btn small" onClick={() => setLaunch(todayStr)}>{t('now')}</button>
                </div>
              </>
            )}
            {view === 'lambert' && <Slider label={tx({ vi: 'Thời gian bay Δt', en: 'Time of flight Δt' })} value={tofL} min={20} max={Math.max(60, Math.round(2 * H.tof))} step={1} onChange={(v) => setTofL(Math.round(v))} display={`${tofL} ${t('days')} → ${iso(jdLaunch + tofL)}`} />}
          </Section>
          <Section title={t('secReadouts')}>
            {view !== 'lambert' && (
              <Readouts>
                <Readout k="Δv₁" v={fix(kms(mode === 'h' ? H.dv1 : B.dv1), 3, lang)} unit="km/s" frame={(mode === 'h' ? H.dv1 : B.dv1) >= 0 ? tx({ vi: 'thuận chiều (tăng tốc)', en: 'prograde (speed up)' }) : tx({ vi: 'ngược chiều (giảm tốc)', en: 'retrograde (slow down)' })} />
                <Readout k="Δv₂" v={fix(kms(mode === 'h' ? H.dv2 : B.dv2), 3, lang)} unit="km/s" frame={(mode === 'h' ? H.dv2 : B.dv2) >= 0 ? tx({ vi: 'thuận chiều', en: 'prograde' }) : tx({ vi: 'ngược chiều', en: 'retrograde' })} />
                {mode === 'bi' && <Readout k="Δv₃" v={fix(kms(B.dv3), 3, lang)} unit="km/s" frame={B.dv3 >= 0 ? tx({ vi: 'thuận chiều', en: 'prograde' }) : tx({ vi: 'ngược chiều', en: 'retrograde' })} />}
                <Readout wide k={tx({ vi: 'Tổng Δv nhật tâm (mô hình lý tưởng)', en: 'Heliocentric total Δv (ideal model)' })} v={fix(kms(mode === 'h' ? H.dvTotal : B.dvTotal), 3, lang)} unit="km/s" tone="accent" frame={tx({ vi: 'Σ|Δv| quanh Mặt Trời - KHÔNG phải ngân sách từ mặt đất tới bề mặt đích', en: 'Σ|Δv| about the Sun - NOT a surface-to-surface budget' })} />
                <Readout k={tx({ vi: 'Thời gian bay', en: 'Flight time' })} v={fmtDur(tofIdeal)} frame={mode === 'h' ? 't_H = π√(a_T³/μ)' : 't_bi = π√(a₁³/μ) + π√(a₂³/μ)'} />
                <Readout k={tx({ vi: 'Góc pha lý tưởng', en: 'Ideal phase angle' })} v={fix(phiReqDeg, 2, lang)} unit="°" frame={tx({ vi: 'đích ở phía trước (+)', en: 'target ahead (+)' })} />
                <Readout k={tx({ vi: 'Chu kỳ giao hội', en: 'Synodic period' })} v={fix(H.synodicPeriod, 1, lang)} unit={t('days')} frame="2π/|n₁ − n₂|" />
                <Readout k={tx({ vi: 'Bán kính r₁ → r₂', en: 'Radii r₁ → r₂' })} v={`${fmt(r1, 5, lang)} → ${fmt(r2, 5, lang)}`} unit="au" frame={tx({ vi: 'bán trục lớn JPL J2000', en: 'JPL J2000 semi-major axes' })} />
                {view === 'eph' && <Readout k={tx({ vi: 'Góc pha tại ngày phóng (theo ephemeris)', en: 'Phase at launch (ephemeris)' })} v={fix(phaseAtLaunchDeg, 2, lang)} unit="°" frame={`Δ = ${fix(wrapDeg(phaseAtLaunchDeg - phiReqDeg), 2, lang)}°`} tone={Math.abs(wrapDeg(phaseAtLaunchDeg - phiReqDeg)) < 2 ? 'good' : 'bad'} />}
                {view === 'eph' && <Readout k={tx({ vi: 'Lệch điểm hẹn khi đến', en: 'Rendezvous miss at arrival' })} v={fix(missDeg, 1, lang)} unit="°" tone={Math.abs(missDeg) < 3 ? 'good' : 'bad'} frame={tx({ vi: 'khác 0 cả ở ngày pha Hohmann: quỹ đạo thật lệch tâm (Sao Hoả e ≈ 0,093) - xem lớp Lambert', en: 'non-zero even on the Hohmann phase date: real orbits are eccentric (Mars e ≈ 0.093) - see the Lambert layer' })} />}
                {view === 'eph' && <Readout wide k={tx({ vi: 'Ngày pha Hohmann lý tưởng kế tiếp (theo ephemeris)', en: 'Next ideal-Hohmann phase dates (ephemeris)' })} v={nextDates.map(iso).join(' · ') || '-'} tone="good" frame={nextDates.length > 1 ? `${tx({ vi: 'cách nhau', en: 'spacing' })} ${nextDates.slice(1).map((d, i) => fix(d - nextDates[i], 0, lang)).join(', ')} ${t('days')} - ${tx({ vi: 'không cố định vì quỹ đạo lệch tâm', en: 'not fixed, eccentric orbits' })}` : undefined} />}
              </Readouts>
            )}
            {view === 'lambert' && (leg ? (
              <Readouts>
                <Readout wide k={tx({ vi: 'Năng lượng khởi hành đặc trưng $C_3 = |v_{\\infty,\\text{đi}}|^2$', en: 'Characteristic departure energy $C_3 = |v_{\\infty,\\text{dep}}|^2$' })} v={fix(kms(Math.sqrt(leg.c3)) ** 2, 3, lang)} unit="km²/s²" tone="accent" />
                <Readout k="|v∞| đi / dep" v={fix(kms(norm(leg.vInfDep)), 3, lang)} unit="km/s" frame="v_sc(t₀) − v_E(t₀)" />
                <Readout k="|v∞| đến / arr" v={fix(kms(norm(leg.vInfArr)), 3, lang)} unit="km/s" frame="v_sc(t₁) − v_M(t₁)" />
                <Readout k={tx({ vi: 'Tốc độ tàu lúc đi / đến', en: 'Craft speed dep / arr' })} v={`${fix(kms(norm(leg.v1)), 3, lang)} / ${fix(kms(norm(leg.v2)), 3, lang)}`} unit="km/s" frame={tx({ vi: 'nhật tâm', en: 'heliocentric' })} />
                <Readout k={tx({ vi: 'Góc chuyển Δθ', en: 'Transfer angle Δθ' })} v={fix((leg.dtheta * 180) / Math.PI, 2, lang)} unit="°" frame={Math.abs(leg.dtheta - Math.PI) < 0.01 ? tx({ vi: 'rất gần 180°: mặt phẳng quỹ đạo kém xác định, C₃ tăng vọt', en: 'very close to 180°: plane ill-defined, C₃ spikes' }) : undefined} />
                <Readout k={tx({ vi: 'Phần dư Lambert', en: 'Lambert residual' })} v={sci(leg.residual, 2)} />
                <Readout wide k={tx({ vi: 'Ngày đến', en: 'Arrival date' })} v={iso(leg.jdArr)} frame={`${tx({ vi: 'khoảng cách tới Mặt Trời', en: 'Sun distance' })} ${fix(norm(leg.rDep), 4, lang)} → ${fix(norm(leg.rArr), 4, lang)} au`} />
              </Readouts>
            ) : <div className="warn-box">{tx({ vi: 'Không có nghiệm Lambert 0 vòng cho cặp thời điểm này (góc chuyển ≈ 0° hoặc 180°).', en: 'No zero-revolution Lambert solution for this pair of epochs (transfer angle ≈ 0° or 180°).' })}</div>)}
            {student && view !== 'lambert' && <div className="eq-box"><Tex display tex={mode === 'h' ? '\\Delta v_1 = \\sqrt{\\tfrac{\\mu}{r_1}}\\Big(\\sqrt{\\tfrac{2r_2}{r_1+r_2}}-1\\Big),\\; \\Delta v_2 = \\sqrt{\\tfrac{\\mu}{r_2}}\\Big(1-\\sqrt{\\tfrac{2r_1}{r_1+r_2}}\\Big),\\; \\phi_H = \\pi - n_2 t_H' : 'a_1 = \\tfrac{r_1+r_b}{2},\\; a_2 = \\tfrac{r_2+r_b}{2},\\; \\Delta v_i \\text{ từ vis-viva } v^2 = \\mu\\big(\\tfrac{2}{r} - \\tfrac{1}{a}\\big)'} /></div>}
            {student && view === 'lambert' && <div className="eq-box"><Tex display tex={'\\mathbf v_{\\infty,E} = \\mathbf v_{\\rm sc}(t_0) - \\mathbf v_E(t_0),\\quad \\mathbf v_{\\infty,M} = \\mathbf v_{\\rm sc}(t_1) - \\mathbf v_M(t_1),\\quad C_3 = |\\mathbf v_{\\infty,E}|^2'} /></div>}
            {advanced && <button className="btn small" onClick={exportCsv}>{t('exportCsv')}</button>}
          </Section>
          {view === 'lambert' && pork && (
            <Section title={tx({ vi: 'Bản đồ C₃ (porkchop)', en: 'C₃ map (porkchop)' })} open={student}>
              <ChartCard title={tx({ vi: `Trục ngang: ngày đi ${iso(pork.d0)} → ${iso(pork.d1)} · trục đứng: thời gian bay ${fix(pork.t0, 0, lang)}–${fix(pork.t1, 0, lang)} ngày`, en: `x: departure ${iso(pork.d0)} → ${iso(pork.d1)} · y: flight time ${fix(pork.t0, 0, lang)}–${fix(pork.t1, 0, lang)} d` })}>
                <canvas ref={porkRef} onClick={onPorkClick} style={{ width: '100%', height: 200, display: 'block', cursor: 'crosshair', borderRadius: 6 }} />
              </ChartCard>
              <div className="field-hint">{tx({ vi: `Xanh: C₃ thấp, đỏ: cao (thang log, tới 12× mức thấp nhất), xám: rất cao/không nghiệm. ★ C₃ nhỏ nhất trong lưới = ${fix(pork.best.c3, 2, lang)} km²/s² (đi ${iso(pork.best.jd)}, bay ${fix(pork.best.tof, 0, lang)} ngày). Vùng xanh là cửa sổ năng lượng thấp; C₃ tăng nhanh ra hai phía và vọt lên ở các tổ hợp có Δθ ≈ 180°. Bấm để chọn.`, en: `Blue: low C₃, red: high (log scale up to 12× the minimum), grey: very high/no solution. ★ grid minimum C₃ = ${fix(pork.best.c3, 2, lang)} km²/s² (depart ${iso(pork.best.jd)}, ${fix(pork.best.tof, 0, lang)} d). The blue basin is the low-energy window; C₃ rises steeply on both sides and spikes where Δθ ≈ 180°. Click to select.` })}</div>
            </Section>
          )}
          <Section title={tx({ vi: 'Hohmann ↔ bi-elliptic: bài toán đánh đổi', en: 'Hohmann ↔ bi-elliptic: the trade-off' })} open={student}>
            <ChartCard title={tx({ vi: `Tổng Δv / v_c1 theo R = r₂/r₁ · r_b = ${fix(rbRatio, 2, lang)} r₂`, en: `Total Δv / v_c1 vs R = r₂/r₁ · r_b = ${fix(rbRatio, 2, lang)} r₂` })}>
              <LineChart height={180} xLog xDomain={[1, 100]} xLabel="R = r₂/r₁" yLabel="Δv / v_c1" legend onPointer={setHoverR}
                series={[{ data: ratioChart.hh, color: pal.teal, label: 'Hohmann (2 xung/burns)' }, { data: ratioChart.bb, color: pal.accent2, label: `bi-elliptic (3 xung/burns)` }, { data: ratioChart.binf, color: pal.newton, label: tx({ vi: 'giới hạn r_b → ∞ (t → ∞)', en: 'limit r_b → ∞ (t → ∞)' }), dash: '5 4' }]}
                vlines={[{ x: TH.R1, color: pal.textFaint, label: fix(TH.R1, 2, lang) }, { x: TH.R2, color: pal.textFaint, label: fix(TH.R2, 2, lang) }, ...(Rnow >= 1 && Rnow <= 100 ? [{ x: Rnow, color: pal.sun }] : [])]} />
            </ChartCard>
            <ChartCard title={tx({ vi: 'Thời gian bay / chu kỳ quỹ đạo đầu T₁', en: 'Flight time / initial orbit period T₁' })}>
              <LineChart height={150} xLog yLog xDomain={[1, 100]} xLabel="R = r₂/r₁" yLabel="t / T₁" onPointer={setHoverR}
                series={[{ data: ratioChart.th, color: pal.teal, label: 'Hohmann' }, { data: ratioChart.tb, color: pal.accent2, label: 'bi-elliptic' }]}
                vlines={Rnow >= 1 && Rnow <= 100 ? [{ x: Rnow, color: pal.sun }] : []} />
            </ChartCard>
            <div className={hoverInfo.region === 'hohmannAlways' ? 'good-box' : 'warn-box'} style={{ marginBottom: 8 }}><b>R = {fix(hoverInfo.R, 2, lang)}{hoverR === null ? tx({ vi: ' (cặp hành tinh đang chọn)', en: ' (selected pair)' }) : ''}</b> - {tx(REGION_TEXT[hoverInfo.region])}</div>
            <Readouts>
              <Readout k="Δv/v_c1 Hohmann" v={fix(hoverInfo.dvH, 4, lang)} frame={`t = ${fix(hoverInfo.tH, 2, lang)} T₁`} />
              <Readout k="Δv/v_c1 bi-elliptic" v={fix(hoverInfo.dvB, 4, lang)} frame={`t = ${fix(hoverInfo.tB, 2, lang)} T₁`} tone={hoverInfo.dvB < hoverInfo.dvH ? 'good' : 'bad'} />
              <Readout k={tx({ vi: 'Giới hạn r_b → ∞', en: 'Limit r_b → ∞' })} v={fix(hoverInfo.dvL, 4, lang)} frame="t = ∞" />
            </Readouts>
            <div className="field-hint">{tx({ vi: `${fix(TH.R1, 2, lang)}: Hohmann bằng giới hạn r_b → ∞. ${fix(TH.R1, 2, lang)}–${fix(TH.R2, 2, lang)}: tuỳ r_b. Trên ${fix(TH.R2, 2, lang)}: mọi r_b > r₂ đều có lợi về Δv - nhưng thời gian bay luôn dài hơn. Rê chuột trên đồ thị để đọc số.`, en: `${fix(TH.R1, 2, lang)}: Hohmann equals the r_b → ∞ limit. ${fix(TH.R1, 2, lang)}–${fix(TH.R2, 2, lang)}: depends on r_b. Above ${fix(TH.R2, 2, lang)}: every r_b > r₂ saves Δv - but always takes longer. Hover the charts to read values.` })}</div>
          </Section>
          <Section title={tx({ vi: 'Dự đoán rồi kiểm chứng', en: 'Predict, then verify' })} open={false}>
            <div className="field-hint" style={{ marginBottom: 6 }}>{tx({ vi: `Thời gian bay ${mode === 'h' ? 'Hohmann' : 'bi-elliptic'} ${tx(NAMES[from])} → ${tx(NAMES[to])} khoảng bao lâu?`, en: `Roughly how long is the ${mode === 'h' ? 'Hohmann' : 'bi-elliptic'} flight ${tx(NAMES[from])} → ${tx(NAMES[to])}?` })}</div>
            <Segmented value={guess === null ? '' : String(guess)} onChange={(v) => setGuess(Number(v))} options={[predOpts[1], predOpts[0], predOpts[2]].sort((a, b) => a - b).map((d) => ({ value: String(d), label: fmtDur(d) }))} small />
            {guess !== null && <div className={Math.abs(guess / tofIdeal - 1) < 1e-9 ? 'good-box' : 'warn-box'}>{tx({ vi: `Kết quả: ${fmtDur(tofIdeal)} (nửa chu kỳ elip chuyển). Dự đoán của bạn lệch ${fix((guess / tofIdeal - 1) * 100, 0, lang)}%.`, en: `Result: ${fmtDur(tofIdeal)} (half the transfer-ellipse period). Your guess was off by ${fix((guess / tofIdeal - 1) * 100, 0, lang)}%.` })}</div>}
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label="Orbital transfer" />
      <div className="stage-overlay tr">
        <div className="legend">
          <span><i style={{ background: 'var(--teal)' }} />{view === 'lambert' ? tx({ vi: 'Quỹ đạo Lambert', en: 'Lambert arc' }) : tx({ vi: 'Quỹ đạo chuyển lý tưởng', en: 'Ideal transfer orbit' })}</span>
          <span><i className="dot" style={{ background: '#fff' }} />{tx({ vi: 'Tàu · vòng tròn: điểm đến', en: 'Craft · circle: arrival point' })}</span>
          <span><i className="dot" style={{ background: 'transparent', border: '1px dashed currentColor' }} />{tx({ vi: 'Vòng nét đứt: vị trí đích lúc tàu đến', en: 'Dashed ring: target at arrival time' })}</span>
        </div>
      </div>
      <div className="stage-overlay bl"><span className="scale-note">{view === 'ideal' ? tx({ vi: 'Mô hình tròn đồng phẳng · kích thước không theo tỉ lệ', en: 'Coplanar circular model · sizes not to scale' }) : tx({ vi: 'Vị trí hành tinh JPL (Standish), chiếu lên mặt phẳng hoàng đạo · kích thước không theo tỉ lệ', en: 'JPL (Standish) planet positions projected on the ecliptic · sizes not to scale' })}</span></div>
    </SimLayout>
  );
}
