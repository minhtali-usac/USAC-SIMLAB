import { useMemo, useRef, useState } from 'react';
import {
  integrateOrbit, integrateTimelike, launchConstants, orbitConstantsFromPE, effPotentialTimelike, perihelionAdvanceWeakPM,
  perihelionAdvanceWeak, planetElements, planetPeriodDays, GM_SUN, AU, ARCSEC_PER_RAD, JD_J2000, type PlanetId,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Toggle, Readout, Readouts, Segmented } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { useT, fix, fmt } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette, usePointer } from '../../lib/hooks';
import { clear, drawBackgroundStars, withAlpha, label, disk, glowDisk } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { downloadCsv } from '../../lib/csv';
import { lesson, card } from './content';

const PLANET_NAMES: Record<string, { vi: string; en: string }> = {
  mercury: { vi: 'Sao Thuỷ', en: 'Mercury' }, venus: { vi: 'Sao Kim', en: 'Venus' }, earth: { vi: 'Trái Đất', en: 'Earth' }, mars: { vi: 'Sao Hoả', en: 'Mars' },
};

export default function GeodesicModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const advanced = useLevelAtLeast('advanced');
  const [mode, setMode] = useParam<'pe' | 'launch'>('mode', 'pe');
  const [p, setP] = useParam('p', 14, { min: 3.5, max: 400 });
  const [e, setE] = useParam('e', 0.5, { min: 0, max: 0.95 });
  const [r0, setR0] = useParam('r0', 12, { min: 3, max: 200 });
  const [v, setV] = useParam('v', 0.3, { min: 0, max: 0.99 });
  const [nOrb, setNOrb] = useParam('n', 5, { min: 1, max: 30 });
  const [clock, setClock] = useParam<'tau' | 't'>('clock', 'tau');
  const [newton, setNewton] = useParam('newton', true);
  const [speed, setSpeed] = useParam('speed', 1);
  const [playing, setPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);

  const orbit = useMemo(() => {
    const phiMax = nOrb * 2 * Math.PI + 1;
    if (mode === 'pe') {
      const res = integrateOrbit(p, e, phiMax, Math.round(600 * nOrb));
      return res ? { ...res, r0: p / (1 - e) } : null;
    }
    const c = launchConstants(r0, v);
    return { ...integrateTimelike(c.E, c.L, r0, false, phiMax, Math.round(600 * nOrb)), stable: true, r0 };
  }, [mode, p, e, r0, v, nOrb]);

  // Newtonian comparison orbit (polar samples)
  const newtonPath = useMemo(() => {
    let pN: number, eN: number, rot: number;
    if (mode === 'pe') { pN = p; eN = e; rot = Math.PI; } // GR starts at apoapsis (φ = 0)
    else {
      pN = (r0 * v) ** 2; // h² / M with h = r0 v (Newtonian, M = 1)
      eN = Math.abs(pN / r0 - 1);
      rot = pN / r0 - 1 >= 0 ? 0 : Math.PI;
    }
    const pts: [number, number][] = [];
    for (let k = 0; k <= 720; k++) {
      const nu = (k / 720) * 2 * Math.PI;
      const den = 1 + eN * Math.cos(nu);
      if (den <= 0.02) continue;
      const r = pN / den;
      if (r > 1e4) continue;
      pts.push([r * Math.cos(nu + rot), r * Math.sin(nu + rot)]);
    }
    return { pts, pN, eN };
  }, [mode, p, e, r0, v]);

  const samples = orbit?.samples ?? [];
  const rMax = Math.max(12, ...samples.map((s) => s.r).filter(Number.isFinite).slice(0, 40000));
  const clockKey = clock === 'tau' ? 'tau' : 't';
  const total = samples.length ? samples[samples.length - 1][clockKey] : 1;
  const tRef = useRef(0);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);

  const at = (T: number) => {
    if (!samples.length) return null;
    let lo = 0, hi = samples.length - 1;
    if (T >= samples[hi][clockKey]) return { ...samples[hi], i: hi };
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (samples[m][clockKey] <= T) lo = m; else hi = m; }
    const a = samples[lo], b = samples[hi];
    const f = (T - a[clockKey]) / (b[clockKey] - a[clockKey] || 1);
    return { phi: a.phi + f * (b.phi - a.phi), r: a.r + f * (b.r - a.r), tau: a.tau + f * (b.tau - a.tau), t: a.t + f * (b.t - a.t), i: lo };
  };

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    drawBackgroundStars(ctx, w, h, pal, 5);
    const sc = ((Math.min(w, h) * 0.46) / Math.min(rMax * 1.05, 400)) * zoom;
    const cx = w / 2, cy = h / 2;
    const X = (x: number) => cx + x * sc, Y = (y: number) => cy - y * sc;
    // reference circles
    const ring = (r: number, color: string, dash: number[], text: string) => {
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * sc, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      if (r * sc > 18) label(ctx, text, cx + r * sc * 0.71 + 4, cy - r * sc * 0.71 - 4, color, { size: 10.5 });
    };
    ring(6, withAlpha(pal.ok, 0.7), [2, 4], 'ISCO 6M');
    ring(3, withAlpha(pal.sun, 0.7), [6, 4], tx({ vi: 'cầu photon 3M', en: 'photon sphere 3M' }));
    glowDisk(ctx, cx, cy, 2 * sc, withAlpha(pal.gr, 0.35), 1.6);
    disk(ctx, cx, cy, Math.max(2 * sc, 3), '#000');
    ctx.strokeStyle = pal.gr; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(2 * sc, 3), 0, Math.PI * 2); ctx.stroke();

    // Newtonian orbit
    if (newton && newtonPath.pts.length) {
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = withAlpha(pal.newton, 0.85);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      newtonPath.pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // GR orbit (full path faint, travelled part bright)
    const cur = at(tRef.current);
    if (samples.length) {
      ctx.strokeStyle = withAlpha(pal.gr, 0.22);
      ctx.lineWidth = 1;
      ctx.beginPath();
      samples.forEach((s, i) => { const x = X(s.r * Math.cos(s.phi)), y = Y(s.r * Math.sin(s.phi)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
      if (cur) {
        ctx.strokeStyle = pal.gr;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i <= cur.i; i++) { const s = samples[i]; const x = X(s.r * Math.cos(s.phi)), y = Y(s.r * Math.sin(s.phi)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.lineTo(X(cur.r * Math.cos(cur.phi)), Y(cur.r * Math.sin(cur.phi)));
        ctx.stroke();
      }
      // periapsis markers
      for (const ph of orbit?.periapsisAngles ?? []) {
        const idx = samples.findIndex((s) => s.phi >= ph);
        if (idx < 0) continue;
        const s = samples[idx];
        disk(ctx, X(s.r * Math.cos(ph)), Y(s.r * Math.sin(ph)), 3, pal.sun);
      }
      if (cur) {
        const px = X(cur.r * Math.cos(cur.phi)), py = Y(cur.r * Math.sin(cur.phi));
        glowDisk(ctx, px, py, 4, pal.teal, 3);
        disk(ctx, px, py, 4, pal.teal);
      }
    }
    label(ctx, `${tx({ vi: 'lỗ đen', en: 'black hole' })} 2M`, cx, cy + Math.max(2 * sc, 3) + 12, pal.gr, { size: 10.5, align: 'center' });
  }, [samples, rMax, zoom, newton, newtonPath, pal, tx, orbit]);

  usePointer(canvasRef, { wheel: (dy) => setZoom((z) => Math.min(30, Math.max(0.3, z * (dy > 0 ? 0.9 : 1.1)))) });

  useAnimationFrame((dt, now) => {
    if (playing && samples.length) {
      const rate = speed * Math.max(20, total / 40);
      tRef.current += dt * rate;
      if (tRef.current > total) tRef.current = 0;
    }
    redraw();
    if (now - lastUi.current > 120) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const cur = at(tRef.current);
  const E = orbit?.E ?? 0, L = orbit?.L ?? 0;
  const status = !orbit ? 'none' : orbit.plunged ? 'plunge' : orbit.escaped ? 'escape' : 'bound';
  const advNum = orbit?.advancePerOrbit ?? null;
  const advWeak = mode === 'pe' ? perihelionAdvanceWeakPM(p) : null;
  const rs = samples.map((s) => s.r);
  const rPeri = rs.length ? Math.min(...rs) : NaN, rApo = rs.length ? Math.max(...rs) : NaN;

  const pot = useMemo(() => {
    const out: [number, number][] = [];
    const rTop = Math.max(30, Math.min(rMax * 1.3, 400));
    for (let k = 0; k <= 400; k++) {
      const r = 2 + (rTop - 2) * (k / 400) ** 1.6;
      out.push([r, effPotentialTimelike(r, L)]);
    }
    return { out, rTop };
  }, [L, rMax]);

  const mercury = useMemo(() => (['mercury', 'venus', 'earth', 'mars'] as PlanetId[]).map((id) => {
    const el = planetElements(id, JD_J2000);
    const per = perihelionAdvanceWeak(GM_SUN, el.a * AU, el.e);
    return { id, arcsec: per * (36525 / planetPeriodDays(id)) * ARCSEC_PER_RAD };
  }), []);

  const statusText = {
    bound: tx({ vi: 'Liên kết (tiến động)', en: 'Bound (precessing)' }),
    plunge: tx({ vi: 'Rơi vào lỗ đen', en: 'Plunges into the hole' }),
    escape: tx({ vi: 'Thoát ra vô cực', en: 'Escapes to infinity' }),
    none: tx({ vi: 'Không tồn tại (p ≤ 3 + e²)', en: 'No such orbit (p ≤ 3 + e²)' }),
  }[status];

  return (
    <SimLayout
      id="d2"
      lesson={lesson}
      card={card}
      caption={<><span className="k">Δφ = {advNum !== null ? `${fix((advNum * 180) / Math.PI, 2, lang)}°` : '-'}</span> {tx({ vi: 'mỗi vòng', en: 'per orbit' })} · r = {fix(cur?.r ?? NaN, 2, lang)} M · dt/dτ = {cur ? fix(E / (1 - 2 / cur.r), 3, lang) : '-'}</>}
      onReset={() => { tRef.current = 0; setZoom(1); }}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={
        <Timeline
          playing={playing}
          onToggle={() => setPlaying((x) => !x)}
          speed={speed}
          onSpeed={setSpeed}
          speeds={[0.25, 0.5, 1, 2, 4].map((s) => ({ value: s, label: `×${s}` }))}
          label={<>τ = {fix(cur?.tau ?? 0, 1, lang)} M · t = {fix(cur?.t ?? 0, 1, lang)} M<small>{tx({ vi: `hoạt ảnh theo ${clock === 'tau' ? 'τ (riêng)' : 't (người ở xa)'}`, en: `animated by ${clock === 'tau' ? 'τ (proper)' : 't (distant)'}` })}</small></>}
        />
      }
      panel={
        <>
          <Section title={t('secParams')} dot="var(--grpD)">
            <Segmented value={mode} onChange={(m) => { setMode(m); tRef.current = 0; }} options={[{ value: 'pe', label: tx({ vi: 'Theo p, e', en: 'By p, e' }) }, { value: 'launch', label: tx({ vi: 'Phóng từ r₀', en: 'Launch at r₀' }) }]} />
            {mode === 'pe' ? (
              <>
                <Slider label={tx({ vi: 'Bán trục latus p', en: 'Semi-latus rectum p' })} value={p} min={4} max={400} log step={0.01} onChange={(x) => { setP(x); tRef.current = 0; }} display={`${fix(p, 2, lang)} M`} hint={p < 6 + 2 * e ? tx({ vi: `p < 6 + 2e: vượt ngưỡng phân cách - hạt bật lại sớm hơn r_p`, en: 'p < 6 + 2e: beyond the separatrix - turns before r_p' }) : undefined} />
                <Slider label={tx({ vi: 'Độ lệch tâm e', en: 'Eccentricity e' })} value={e} min={0} max={0.95} step={0.005} onChange={(x) => { setE(x); tRef.current = 0; }} display={fix(e, 3, lang)} />
              </>
            ) : (
              <>
                <Slider label={tx({ vi: 'Bán kính phóng r₀', en: 'Launch radius r₀' })} value={r0} min={3} max={200} log step={0.01} onChange={(x) => { setR0(x); tRef.current = 0; }} display={`${fix(r0, 2, lang)} M`} />
                <Slider label={tx({ vi: 'Tốc độ tiếp tuyến (người quan sát tĩnh)', en: 'Tangential speed (static observer)' })} value={v} min={0} max={0.99} step={0.001} onChange={(x) => { setV(x); tRef.current = 0; }} display={`${fix(v, 3, lang)} c`} hint={r0 > 3 ? tx({ vi: `tròn: v = ${fix(Math.sqrt(1 / (r0 - 2)), 3, lang)} c`, en: `circular: v = ${fix(Math.sqrt(1 / (r0 - 2)), 3, lang)} c` }) : undefined} />
              </>
            )}
            <Slider label={tx({ vi: 'Số vòng tích phân', en: 'Orbits integrated' })} value={nOrb} min={1} max={30} step={1} onChange={setNOrb} display={String(nOrb)} />
          </Section>
          <Section title={t('secDisplay')}>
            <Toggle label={tx({ vi: 'Quỹ đạo Newton cùng tham số', en: 'Newtonian orbit, same parameters' })} checked={newton} onChange={setNewton} swatch="var(--newton)" />
            <Segmented value={clock} onChange={setClock} options={[{ value: 'tau', label: `τ - ${t('properTime')}` }, { value: 't', label: `t - ${t('coordTime')}` }]} small />
            <div className="scale-note">{tx({ vi: 'Đơn vị hình học G = c = 1; độ dài theo M (rₛ = 2M). Lăn chuột để phóng to.', en: 'Geometric units G = c = 1; lengths in M (rₛ = 2M). Scroll to zoom.' })}</div>
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout wide k={tx({ vi: 'Trạng thái', en: 'Status' })} v={statusText} tone={status === 'bound' ? 'good' : status === 'none' ? undefined : 'bad'} />
              <Readout k="E" v={fix(E, 6, lang)} />
              <Readout k="L" v={fix(L, 4, lang)} unit="M" />
              <Readout k={tx({ vi: 'r hiện tại', en: 'current r' })} v={fix(cur?.r ?? NaN, 3, lang)} unit="M" />
              <Readout k="dt/dτ" v={cur ? fix(E / (1 - 2 / cur.r), 4, lang) : '-'} frame={tx({ vi: 'chậm thời gian hấp dẫn + vận tốc', en: 'gravitational + kinematic dilation' })} />
              <Readout k={tx({ vi: 'r nhỏ nhất', en: 'r min' })} v={fix(rPeri, 3, lang)} unit="M" />
              <Readout k={tx({ vi: 'r lớn nhất', en: 'r max' })} v={fix(rApo, 3, lang)} unit="M" />
              {status === 'bound' && <Readout k={tx({ vi: 'Δφ/vòng (số)', en: 'Δφ/orbit (numerical)' })} v={advNum !== null ? fix((advNum * 180) / Math.PI, 3, lang) : '-'} unit="°" tone="accent" />}
              {status === 'bound' && advWeak !== null && <Readout k={tx({ vi: 'Δφ trường yếu 6π/p', en: 'Weak field 6π/p' })} v={fix((advWeak * 180) / Math.PI, 3, lang)} unit="°" />}
              <Readout k={`τ (${t('properTime')})`} v={fix(cur?.tau ?? 0, 1, lang)} unit="M" />
              <Readout k={`t (${t('coordTime')})`} v={fix(cur?.t ?? 0, 1, lang)} unit="M" />
            </Readouts>
          </Section>
          <Section title={tx({ vi: 'Thế hiệu dụng V²(r)', en: 'Effective potential V²(r)' })} open={student}>
            <ChartCard>
              <LineChart
                height={190}
                xLabel="r (M)" yLabel="V²"
                xDomain={[2, pot.rTop]}
                yDomain={[Math.min(0.75, E * E - 0.08), Math.max(1.08, E * E + 0.05)]}
                series={[{ data: pot.out, color: pal.gr, label: 'V²(r)' }, { data: [[2, E * E], [pot.rTop, E * E]], color: pal.teal, label: 'E²', dash: '5 4' }]}
                vlines={[{ x: 6, color: pal.ok, label: 'ISCO' }, { x: 3, color: pal.sun }]}
                markers={cur ? [{ x: cur.r, y: E * E, color: pal.teal, r: 5 }] : []}
              />
            </ChartCard>
            {advanced && samples.length > 0 && (
              <button className="btn small" onClick={() => downloadCsv('usac-d2-geodesic.csv', ['phi', 'r_M', 'tau_M', 't_M'], samples.map((s) => [s.phi, s.r, s.tau, s.t]))}>{t('exportCsv')}</button>
            )}
          </Section>
          <Section title={tx({ vi: 'Tiến động GR của các hành tinh', en: 'GR precession of the planets' })} open={student}>
            <Readouts>
              {mercury.map((m) => <Readout key={m.id} k={tx(PLANET_NAMES[m.id])} v={fix(m.arcsec, 2, lang)} unit={tx({ vi: '″/thế kỷ', en: '″/century' })} tone={m.id === 'mercury' ? 'accent' : undefined} />)}
            </Readouts>
            <div className="field-hint">{tx({ vi: 'Tính từ 6πGM/(c²a(1−e²)) với phần tử quỹ đạo JPL. Quan sát Sao Thuỷ: 43,1 ± 0,5″ (Clemence 1947).', en: 'From 6πGM/(c²a(1−e²)) with JPL elements. Observed for Mercury: 43.1 ± 0.5″ (Clemence 1947).' })}</div>
            {advanced && <div className="field-hint">{tx({ vi: '$GM_\\odot/c^2$ =', en: '$GM_\\odot/c^2$ =' })} {fmt(GM_SUN / 299792458 ** 2 / 1000, 5, lang)} km</div>}
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label={tx({ vi: 'Quỹ đạo quanh lỗ đen Schwarzschild', en: 'Orbit around a Schwarzschild black hole' })} />
      <div className="stage-overlay tr">
        <div className="legend">
          <span><i style={{ background: 'var(--gr)' }} />{tx({ vi: 'Geodesic Schwarzschild', en: 'Schwarzschild geodesic' })}</span>
          {newton && <span><i style={{ background: 'var(--newton)' }} />{tx({ vi: 'Newton (cùng tham số)', en: 'Newton (same parameters)' })}</span>}
          <span><i className="dot" style={{ background: 'var(--sun)' }} />{tx({ vi: 'Các cận điểm', en: 'Successive periapses' })}</span>
          <span><i style={{ background: 'var(--ok)' }} />ISCO 6M · <i style={{ background: 'var(--sun)', marginLeft: 6 }} />3M</span>
        </div>
      </div>
    </SimLayout>
  );
}
