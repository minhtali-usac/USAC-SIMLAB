import { useMemo, useRef, useState } from 'react';
import {
  rvSemiAmplitude, transitFlux, gaussianRng, blackbodyCss, transitContacts, transitFluxAt, radialVelocityAt, skyPosition, impactParameter,
  aOverRstar, snrRV, snrTransit, EXO_PRESETS, R_EARTH_EQ_KM, MJUP_IN_MEARTH, M_SUN, R_SUN, SECONDS_PER_DAY, AU, type OrbitGeometry,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Select } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt } from '../../i18n';
import { useParam, setParams } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, drawBackgroundStars, withAlpha, label, disk, arrow } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson } from './lesson';
import { card } from './card';

const M_EARTH = 5.9722e24;
const DEG = Math.PI / 180;

export default function ExoplanetModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const advanced = useLevelAtLeast('advanced');
  const [presetId] = useParam('preset', 'hd209458');
  const P0 = EXO_PRESETS.find((p) => p.id === presetId) ?? EXO_PRESETS[0];
  const [ms, setMs] = useParam('ms', P0.mStar, { min: 0.08, max: 3 });
  const [rs, setRs] = useParam('rs', P0.rStar, { min: 0.1, max: 3 });
  const [mp, setMp] = useParam('mp', P0.mPlanet, { min: 0.1, max: 6000 });
  const [rp, setRp] = useParam('rp', P0.rPlanet, { min: 0.3, max: 25 });
  const [Pd, setPd] = useParam('P', P0.P, { min: 0.3, max: 6000 });
  const [e, setE] = useParam('e', P0.e, { min: 0, max: 0.9 });
  const [wDeg, setW] = useParam('w', P0.omegaDeg, { min: 0, max: 360 });
  const [inc, setInc] = useParam('i', P0.incDeg, { min: 0, max: 90 });
  const [srv, setSrv] = useParam('srv', 5, { min: 0, max: 50 });
  const [nRV, setNRV] = useParam('nrv', 40, { min: 5, max: 200 });
  const [sph, setSph] = useParam('sph', 300, { min: 0, max: 5000 });
  const [cad, setCad] = useParam('cad', 2, { min: 0.5, max: 60 });
  const [u1, setU1] = useParam('u1', 0.4, { min: 0, max: 1 });
  const [u2, setU2] = useParam('u2', 0.25, { min: -0.5, max: 0.8 });
  const [playing, setPlaying] = useState(true);
  /** Time since mid-transit in units of P - advances linearly, i.e. it is the mean anomaly / 2π (+ const). */
  const phaseRef = useRef(-0.06);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);

  const modified = ['ms', 'rs', 'mp', 'rp', 'P', 'e', 'w', 'i'].some((key) => new URLSearchParams(window.location.hash.split('?')[1] ?? '').has(key));
  const applyPreset = (id: string) => {
    setParams({ preset: id, ms: null, rs: null, mp: null, rp: null, P: null, e: null, w: null, i: null });
    phaseRef.current = -0.06;
  };

  // ── physics (sim-core, float64) ──
  const Ms = ms * M_SUN, Mp = mp * M_EARTH, Rs = rs * R_SUN, RpM = rp * R_EARTH_EQ_KM * 1000;
  const Psec = Pd * SECONDS_PER_DAY;
  const aR = aOverRstar(Psec, Ms, Mp, Rs);
  const aAu = (aR * Rs) / AU;
  const k = RpM / Rs;
  const g: OrbitGeometry = useMemo(() => ({ P: Pd * 24, e, omega: wDeg * DEG, aR, inc: inc * DEG }), [Pd, e, wDeg, aR, inc]); // P in hours
  const K = rvSemiAmplitude(Psec, Ms, Mp, inc * DEG, e);
  const b = impactParameter(g);
  const contacts = useMemo(() => transitContacts(g, k), [g, k]);
  const transits = contacts.transits;
  const T14 = contacts.transits ? contacts.T14 : 0;
  const T23 = contacts.transits ? contacts.T23 : 0;
  const depthGeom = k * k;
  const depthCurve = transits ? 1 - transitFlux(contacts.dMin, k, u1, u2) : 0;
  const nIn = transits ? (T14 * 60) / cad : 0;
  const snrR = snrRV(K, srv, nRV);
  const snrT = transits ? snrTransit(depthCurve, sph * 1e-6, nIn) : 0;
  const density = Mp / ((4 / 3) * Math.PI * RpM ** 3) / 1000;

  const data = useMemo(() => {
    const rng = gaussianRng(1234);
    const curve: [number, number][] = [];
    for (let j = 0; j <= 240; j++) { const ph = -0.5 + j / 240; curve.push([ph, radialVelocityAt(ph * g.P, g, K)]); }
    const pts: [number, number][] = [];
    for (let j = 0; j < nRV; j++) { const ph = rng.uniform() - 0.5; pts.push([ph, radialVelocityAt(ph * g.P, g, K) + srv * rng.normal()]); }
    const halfWinH = transits ? Math.min(g.P / 2, Math.max((1.6 * T14) / 2 + 0.5, T14)) : Math.min(g.P / 2, 6);
    const c0 = contacts.tMin;
    const lc: [number, number][] = [], lcPts: [number, number][] = [];
    for (let j = 0; j <= 300; j++) { const th = c0 - halfWinH + (2 * halfWinH * j) / 300; lc.push([th, (1 - transitFluxAt(th, g, k, u1, u2, 160)) * 1e6]); }
    const nPts = Math.min(400, Math.floor((2 * halfWinH * 60) / cad));
    for (let j = 0; j < nPts; j++) { const th = c0 - halfWinH + ((j + 0.5) * 2 * halfWinH) / nPts; lcPts.push([th, (1 - transitFluxAt(th, g, k, u1, u2, 160)) * 1e6 + sph * rng.normal()]); }
    return { curve, pts, lc, lcPts, halfWinH, c0 };
  }, [g, K, srv, nRV, sph, k, u1, u2, transits, T14, cad, contacts]);

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    drawBackgroundStars(ctx, w, h, pal, 17, 0.6);
    const half = w / 2;
    const tH = phaseRef.current * g.P;
    const s = skyPosition(tH, g);
    const u = g.omega + s.f; // angle in the orbital plane; u = 90° points to the observer
    // ── top view (Earth at the bottom)
    const cx = half / 2, cy = h / 2 - 6;
    const sc = (Math.min(half, h) * 0.36) / (1 + e);
    const starR = Math.max(8, Math.min(26, rs * 14));
    const wob = 0.12; // exaggerated reflex motion (illustration)
    const rr = s.r / aR;
    const px = cx + Math.cos(u) * rr * sc, py = cy + Math.sin(u) * rr * sc;
    const sx = cx - Math.cos(u) * rr * sc * wob, sy = cy - Math.sin(u) * rr * sc * wob;
    ctx.strokeStyle = withAlpha(pal.fg, 0.22); ctx.setLineDash([3, 5]);
    ctx.beginPath();
    for (let j = 0; j <= 240; j++) {
      const f = (j / 240) * 2 * Math.PI, r = (1 - e * e) / (1 + e * Math.cos(f)), a = g.omega + f;
      const x = cx + Math.cos(a) * r * sc, y = cy + Math.sin(a) * r * sc;
      if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);
    if (e > 0.005) {
      const rpx = cx + Math.cos(g.omega) * (1 - e) * sc, rpy = cy + Math.sin(g.omega) * (1 - e) * sc;
      disk(ctx, rpx, rpy, 3, pal.sun);
      label(ctx, tx({ vi: 'cận điểm', en: 'periastron' }), rpx + 6, rpy - 8, pal.sun, { size: 10.5 });
    }
    const vr = radialVelocityAt(tH, g, K);
    disk(ctx, sx, sy, starR, blackbodyCss(P0.teff * (1 + (vr / 3e8) * 1500)));
    disk(ctx, px, py, Math.max(3, Math.min(10, rp * 0.6)), '#7dd3fc');
    disk(ctx, cx, cy, 2, pal.danger);
    arrow(ctx, cx, h - 30, cx, h - 70, pal.teal, 2, 8);
    label(ctx, tx({ vi: 'về phía Trái Đất', en: 'towards Earth' }), cx + 8, h - 46, pal.teal, { size: 11 });
    label(ctx, tx({ vi: 'Nhìn từ trên · "lắc" và kích thước phóng đại · chấm đỏ: khối tâm', en: 'Top view · wobble & sizes exaggerated · red dot: barycentre' }), 12, 18, pal.textFaint, { size: 11 });
    label(ctx, `v_r = ${fix(vr, 2, lang)} m/s`, 12, 38, vr > 0 ? pal.danger : pal.sr, { size: 13, mono: true, weight: 600 });
    // ── sky view: true scale Rp/R★ and (X, Y)
    const qx = half + half / 2, qy = h / 2;
    const RS = Math.min(half, h) * 0.32;
    const grad = ctx.createRadialGradient(qx, qy, 0, qx, qy, RS);
    const base = blackbodyCss(P0.teff).match(/\d+/g)!.map(Number);
    for (let j = 0; j <= 10; j++) {
      const r = j / 10, mu = Math.sqrt(1 - r * r);
      const I = 1 - u1 * (1 - mu) - u2 * (1 - mu) ** 2;
      grad.addColorStop(r, `rgb(${base.map((c) => Math.round(c * Math.max(0, I))).join(',')})`);
    }
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(qx, qy, RS, 0, Math.PI * 2); ctx.fill();
    if (s.Z > 0 && s.d < 1 + k + 0.6) disk(ctx, qx + s.X * RS, qy - s.Y * RS, Math.max(1.5, k * RS), '#05070d');
    label(ctx, tx({ vi: 'Nhìn từ Trái Đất (đúng tỉ lệ R_p/R★ và vị trí X, Y)', en: 'Seen from Earth (true R_p/R★ and X, Y)' }), half + 12, 18, pal.textFaint, { size: 11 });
    label(ctx, transits ? tx({ vi: `có quá cảnh · b = ${fix(b, 3, lang)}`, en: `transiting · b = ${fix(b, 3, lang)}` }) : tx({ vi: `không quá cảnh · b = ${fix(b, 2, lang)}`, en: `no transit · b = ${fix(b, 2, lang)}` }), half + 12, 38, transits ? pal.ok : pal.danger, { size: 12, weight: 600 });
  }, [pal, g, K, e, aR, k, u1, u2, rs, rp, P0, tx, lang, b, transits]);

  useAnimationFrame((dt, now) => {
    if (playing) { phaseRef.current += dt * 0.05; if (phaseRef.current > 0.5) phaseRef.current -= 1; }
    redraw();
    if (now - lastUi.current > 140) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const ph = phaseRef.current;
  const tH = ph * g.P;
  const pub = P0.published;
  const pct = (m: number, r?: number) => (r ? `${m / r - 1 >= 0 ? '+' : ''}${fix((m / r - 1) * 100, 2, lang)}%` : '');

  return (
    <SimLayout
      id="a4"
      lesson={lesson}
      card={card}
      caption={<><span className="k">K = {fmt(K, 4, lang)} m/s</span> · T₁₄ = {transits ? `${fix(T14, 3, lang)} ${t('hours')}` : '-'} · δ<sub>{tx({ vi: 'đường cong', en: 'curve' })}</sub> = {transits ? `${fix(depthCurve * 1e6, 0, lang)} ppm` : '-'} · b = {fix(b, 3, lang)}</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>(t − t<sub>tr</sub>)/P = {fix(ph, 3, lang)}<small>{tx({ vi: 'tuyến tính theo thời gian (= M/2π + hằng số)', en: 'linear in time (= M/2π + const)' })} · t − t<sub>tr</sub> = {fix(tH, 2, lang)} {t('hours')}</small></>} />}
      panel={
        <>
          <Section title={t('secPresets')} dot="var(--grpA)">
            <Select value={presetId} onChange={applyPreset} options={EXO_PRESETS.map((p) => ({ value: p.id, label: tx(p.name) }))} />
            <div className="field-hint">
              {tx({ vi: 'Nghiệm tham số: ', en: 'Parameter solution: ' })}
              {P0.solutionUrl ? <a href={P0.solutionUrl} target="_blank" rel="noopener">{P0.solution}</a> : P0.solution}
              {P0.archiveDefault ? tx({ vi: ' (mặc định của NASA Exoplanet Archive)', en: ' (NASA Exoplanet Archive default)' }) : ''}
            </div>
            {P0.assumed && <div className="field-hint">⚠ {tx(P0.assumed)}</div>}
            {modified && <div className="warn-box">{tx({ vi: 'Bạn đã thay đổi tham số: hệ đang mô phỏng không còn là nghiệm công bố.', en: 'Parameters modified: the simulated system no longer matches the published solution.' })} <button className="btn small" onClick={() => applyPreset(presetId)}>{t('reset')}</button></div>}
          </Section>
          <Section title={tx({ vi: 'Sao & hành tinh', en: 'Star & planet' })}>
            <Slider label={tx({ vi: 'Khối lượng sao', en: 'Star mass' })} value={ms} min={0.08} max={3} log step={0.001} onChange={setMs} display={`${fix(ms, 3, lang)} M☉`} />
            <Slider label={tx({ vi: 'Bán kính sao', en: 'Star radius' })} value={rs} min={0.1} max={3} log step={0.001} onChange={setRs} display={`${fix(rs, 3, lang)} R☉`} />
            <Slider label={tx({ vi: 'Khối lượng hành tinh', en: 'Planet mass' })} value={mp} min={0.1} max={6000} log step={0.001} onChange={setMp} display={`${fmt(mp, 4, lang)} M⊕ = ${fmt(mp / MJUP_IN_MEARTH, 3, lang)} M♃`} />
            <Slider label={tx({ vi: 'Bán kính hành tinh', en: 'Planet radius' })} value={rp} min={0.3} max={25} log step={0.001} onChange={setRp} display={`${fix(rp, 2, lang)} R⊕ = ${fix((rp * R_EARTH_EQ_KM) / 71492, 3, lang)} R♃`} hint={tx({ vi: 'R⊕ = 6 378,1 km, R♃ = 71 492 km (xích đạo, như NASA Exoplanet Archive)', en: 'R⊕ = 6,378.1 km, R♃ = 71,492 km (equatorial, as in the NASA Exoplanet Archive)' })} />
            <Slider label={tx({ vi: 'Chu kỳ P', en: 'Period P' })} value={Pd} min={0.3} max={6000} log step={0.000001} onChange={setPd} display={`${fmt(Pd, 7, lang)} ${t('days')}`} />
            <Slider label={tx({ vi: 'Độ nghiêng i (90° = ngang tầm nhìn)', en: 'Inclination i (90° = edge-on)' })} value={inc} min={0} max={90} step={0.001} onChange={setInc} display={`${fix(inc, 3, lang)}°`} />
          </Section>
          <Section title={tx({ vi: 'Quỹ đạo lệch tâm', en: 'Eccentric orbit' })}>
            <Slider label={tx({ vi: 'Độ lệch tâm e - tác động cả RV và hình học quá cảnh', en: 'Eccentricity e - affects both RV and transit geometry' })} value={e} min={0} max={0.9} step={0.001} onChange={setE} display={fix(e, 3, lang)} />
            <Slider label={tx({ vi: 'Góc cận điểm ω (của hành tinh)', en: 'Argument of periastron ω (planet)' })} value={wDeg} min={0} max={360} step={0.5} onChange={setW} display={`${fix(wDeg, 1, lang)}°`} hint={tx({ vi: 'Quá cảnh xảy ra tại ν = 90° − ω. Thời gian tiến theo dị thường trung bình M; E và ν được giải từ phương trình Kepler.', en: 'Transit occurs at ν = 90° − ω. Time advances the mean anomaly M; E and ν come from Kepler’s equation.' })} />
          </Section>
          <Section title={tx({ vi: 'Thiết bị đo', en: 'Instruments' })}>
            <Slider label={tx({ vi: 'Nhiễu vận tốc σ_RV', en: 'RV noise σ_RV' })} value={srv} min={0} max={50} step={0.1} onChange={setSrv} display={`${fix(srv, 1, lang)} m/s`} />
            <Slider label={tx({ vi: 'Số phép đo RV N', en: 'Number of RV epochs N' })} value={nRV} min={5} max={200} step={1} onChange={setNRV} display={String(nRV)} />
            <Slider label={tx({ vi: 'Nhiễu trắc quang σ_phot', en: 'Photometric noise σ_phot' })} value={sph} min={0} max={5000} step={5} onChange={setSph} display={`${fix(sph, 0, lang)} ppm`} />
            <Slider label={tx({ vi: 'Chu kỳ lấy mẫu trắc quang Δt', en: 'Photometric cadence Δt' })} value={cad} min={0.5} max={60} log step={0.1} onChange={setCad} display={`${fix(cad, 1, lang)} ${t('minutes')}`} />
            {student && <Slider label={tx({ vi: 'Hệ số tối rìa u₁', en: 'Limb darkening u₁' })} value={u1} min={0} max={1} step={0.01} onChange={setU1} display={fix(u1, 2, lang)} />}
            {student && <Slider label="u₂" value={u2} min={-0.5} max={0.8} step={0.01} onChange={setU2} display={fix(u2, 2, lang)} />}
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Bán trục lớn a', en: 'Semi-major axis a' })} v={fmt(aAu, 5, lang)} unit="au" />
              <Readout k="a / R★" v={fix(aR, 3, lang)} frame={tx({ vi: 'Kepler III từ M★ + M_p, P', en: 'Kepler III from M★ + M_p, P' })} />
              <Readout k={tx({ vi: 'Biên độ RV K', en: 'RV semi-amplitude K' })} v={fmt(K, 4, lang)} unit="m/s" tone="accent" />
              <Readout k={tx({ vi: 'Tham số va chạm b', en: 'Impact parameter b' })} v={fix(b, 3, lang)} />
              <Readout k="T₁₄" v={transits ? fix(T14, 3, lang) : '-'} unit={transits ? t('hours') : ''} frame={tx({ vi: 'tính số trên quỹ đạo Kepler', en: 'numerical, Keplerian orbit' })} />
              <Readout k="T₂₃" v={transits && T23 > 0 ? fix(T23, 3, lang) : '-'} unit={transits && T23 > 0 ? t('hours') : ''} frame={transits && T23 === 0 ? tx({ vi: 'quá cảnh sượt', en: 'grazing' }) : undefined} />
              <Readout wide k={tx({ vi: 'Độ sâu hình học xấp xỉ (đĩa đều) k²', en: 'Approximate geometric depth (uniform disk) k²' })} v={fix(depthGeom * 1e6, 0, lang)} unit="ppm" frame={`k = R_p/R★ = ${fix(k, 5, lang)}`} />
              <Readout wide k={tx({ vi: 'Độ sâu từ đường cong ánh sáng (có tối rìa)', en: 'Depth from the light curve (limb-darkened)' })} v={transits ? fix(depthCurve * 1e6, 0, lang) : '-'} unit={transits ? 'ppm' : ''} tone="accent" frame={tx({ vi: `tại tâm quá cảnh, u₁ = ${fix(u1, 2, lang)}, u₂ = ${fix(u2, 2, lang)}, b hiện tại`, en: `at mid-transit, u₁ = ${fix(u1, 2, lang)}, u₂ = ${fix(u2, 2, lang)}, current b` })} />
              <Readout wide k="SNR RV ≈ (K/σ_RV)·√(N/2)" v={Number.isFinite(snrR) ? fix(snrR, 1, lang) : '∞'} tone={snrR > 7 ? 'good' : 'bad'} frame={tx({ vi: `N = ${nRV} phép đo phân bố đều theo pha, σ = ${fix(srv, 1, lang)} m/s, nhiễu trắng`, en: `N = ${nRV} epochs uniform in phase, σ = ${fix(srv, 1, lang)} m/s, white noise` })} />
              <Readout wide k="SNR quá cảnh ≈ (δ/σ_phot)·√N_in" v={transits ? (Number.isFinite(snrT) ? fix(snrT, 1, lang) : '∞') : '-'} tone={snrT > 7 ? 'good' : 'bad'} frame={transits ? tx({ vi: `1 lần quá cảnh: N_in = T₁₄/Δt = ${fix(nIn, 0, lang)} điểm (Δt = ${fix(cad, 1, lang)} phút), σ = ${fix(sph, 0, lang)} ppm`, en: `one transit: N_in = T₁₄/Δt = ${fix(nIn, 0, lang)} points (Δt = ${fix(cad, 1, lang)} min), σ = ${fix(sph, 0, lang)} ppm` }) : undefined} />
              <Readout wide k={tx({ vi: 'Mật độ hành tinh ρ = 3Mp/(4πRp³)', en: 'Planet density ρ = 3Mp/(4πRp³)' })} v={fix(density, 3, lang)} unit="g/cm³" />
            </Readouts>
            {student && <div className="eq-box"><Tex display tex={`\\delta_{\\rm uniform} \\approx k^2 = ${(depthGeom * 1e6).toFixed(0)}\\,\\text{ppm}\\quad\\ne\\quad \\delta_{\\rm curve} = ${(depthCurve * 1e6).toFixed(0)}\\,\\text{ppm}`} /></div>}
          </Section>
          <Section title={tx({ vi: 'Đối chiếu nghiệm công bố', en: 'Published solution check' })}>
            <div className="field-hint">{P0.solution}{modified ? tx({ vi: ' - tham số đã bị thay đổi, so sánh chỉ để tham khảo', en: ' - parameters modified, comparison for reference only' }) : ''}</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="num" style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
                <thead><tr style={{ color: 'var(--text-faint)', textAlign: 'right' }}><th style={{ textAlign: 'left' }}></th><th>{tx({ vi: 'công bố', en: 'published' })}</th><th>{tx({ vi: 'mô phỏng', en: 'model' })}</th><th>Δ</th></tr></thead>
                <tbody style={{ textAlign: 'right' }}>
                  {pub.K !== undefined && <tr><td style={{ textAlign: 'left' }}>K (m/s)</td><td>{fix(pub.K, 2, lang)}</td><td>{fix(K, 2, lang)}</td><td>{pct(K, pub.K)}</td></tr>}
                  {pub.aR !== undefined && <tr><td style={{ textAlign: 'left' }}>a/R★</td><td>{fix(pub.aR, 3, lang)}</td><td>{fix(aR, 3, lang)}</td><td>{pct(aR, pub.aR)}</td></tr>}
                  {pub.k !== undefined && <tr><td style={{ textAlign: 'left' }}>Rp/R★</td><td>{fix(pub.k, 5, lang)}</td><td>{fix(k, 5, lang)}</td><td>{pct(k, pub.k)}</td></tr>}
                  {pub.b !== undefined && <tr><td style={{ textAlign: 'left' }}>b</td><td>{fix(pub.b, 3, lang)}</td><td>{fix(b, 3, lang)}</td><td>{pct(b, pub.b)}</td></tr>}
                  {pub.T14h !== undefined && <tr><td style={{ textAlign: 'left' }}>T₁₄ (h)</td><td>{fix(pub.T14h, 3, lang)}</td><td>{transits ? fix(T14, 3, lang) : '-'}</td><td>{transits ? pct(T14, pub.T14h) : ''}</td></tr>}
                  {pub.depthPct !== undefined && <tr><td style={{ textAlign: 'left' }}>{tx({ vi: 'độ sâu (%)*', en: 'depth (%)*' })}</td><td>{fix(pub.depthPct, 3, lang)}</td><td>{fix(depthCurve * 100, 3, lang)}</td><td></td></tr>}
                </tbody>
              </table>
            </div>
            {pub.depthPct !== undefined && <div className="field-hint">{tx({ vi: '* Định nghĩa "độ sâu" khác nhau giữa các bài báo (dải phổ, có/không tối rìa) - chỉ để tham khảo, không dùng để kiểm định.', en: '* “Depth” definitions differ between papers (band, limb darkening) - reference only, not used for validation.' })}</div>}
            {advanced && <div className="field-hint">{tx({ vi: 'Báo cáo kiểm định đầy đủ: npm run validate:exo', en: 'Full validation report: npm run validate:exo' })}</div>}
          </Section>
        </>
      }
    >
      <div className="split v" style={{ gridTemplateRows: '1fr 1fr' }}>
        <div className="pane"><canvas ref={canvasRef} role="img" aria-label="exoplanet system" /></div>
        <div className="pane" style={{ overflowY: 'auto', padding: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10, alignContent: 'start' }}>
          <ChartCard title={tx({ vi: `Vận tốc xuyên tâm của sao (N = ${nRV} điểm tổng hợp)`, en: `Stellar radial velocity (N = ${nRV} synthetic points)` })}>
            <LineChart height={170} xDomain={[-0.5, 0.5]} xLabel={tx({ vi: '(t − t_tr)/P - tuyến tính theo thời gian', en: '(t − t_tr)/P - linear in time' })} yLabel="v_r (m/s)"
              series={[{ data: data.pts, color: pal.textDim, scatter: true, radius: 2.4, label: tx({ vi: 'đo (tổng hợp, có nhiễu)', en: 'measured (synthetic, noisy)' }) }, { data: data.curve, color: pal.horizon, label: tx({ vi: 'mô hình Kepler', en: 'Keplerian model' }) }]}
              vlines={[{ x: ph, color: pal.teal }, { x: 0, color: pal.textFaint, dash: '2 4' }]} />
          </ChartCard>
          <ChartCard title={tx({ vi: `Đường cong ánh sáng quanh quá cảnh (Δt = ${fix(cad, 1, lang)} phút)`, en: `Light curve around transit (Δt = ${fix(cad, 1, lang)} min)` })}>
            <LineChart height={170} invertY xLabel={tx({ vi: 'giờ từ giữa quá cảnh', en: 'hours from mid-transit' })} yLabel={tx({ vi: 'độ giảm (ppm)', en: 'dip (ppm)' })}
              series={[{ data: data.lcPts, color: pal.textDim, scatter: true, radius: 1.8 }, { data: data.lc, color: pal.sun }]}
              hlines={transits ? [{ y: depthGeom * 1e6, color: pal.textFaint, label: 'k²' }] : []}
              vlines={Math.abs(tH - data.c0) < data.halfWinH ? [{ x: tH, color: pal.teal }] : []} />
          </ChartCard>
        </div>
      </div>
    </SimLayout>
  );
}
