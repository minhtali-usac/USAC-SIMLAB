import { useEffect, useRef, useState } from 'react';
import { stepNBody, totalEnergy, angularMomentumZ, toCenterOfMass, cloneSystem, type NBodySystem, type Integrator } from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Select, Toggle } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { useT, fix, sci } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette, usePointer } from '../../lib/hooks';
import { clear, drawBackgroundStars, withAlpha, disk, glowDisk, arrow, label } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

const COLORS = ['#fbbf24', '#5eead4', '#f472b6', '#7c9cff', '#fb923c', '#a78bfa', '#4ade80', '#f87171', '#e5e7eb', '#38bdf8'];

function preset(id: string): NBodySystem {
  const b = (m: number, x: number, y: number, vx: number, vy: number) => ({ m, x, y, z: 0, vx, vy, vz: 0 });
  switch (id) {
    case 'figure8': // Chenciner & Montgomery (2000); initial conditions from Simó
      return { G: 1, softening: 0, bodies: [b(1, 0.97000436, -0.24308753, 0.466203685, 0.43236573), b(1, -0.97000436, 0.24308753, 0.466203685, 0.43236573), b(1, 0, 0, -0.93240737, -0.86473146)] };
    case 'pythagorean': // Burrau's problem: masses 3,4,5 at rest on a 3-4-5 triangle
      return { G: 1, softening: 0, bodies: [b(3, 1, 3, 0, 0), b(4, -2, -1, 0, 0), b(5, 1, -1, 0, 0)] };
    case 'binaryPlanet': {
      // equal-mass circular binary (separation 1, each star v = m_other √(G/(M d)) = 0.5)
      // + a circumbinary planet at r = 4 (stable beyond ~2.4 binary separations, Holman & Wiegert 1999)
      const s: NBodySystem = { G: 1, softening: 0, bodies: [b(0.5, -0.5, 0, 0, -0.5), b(0.5, 0.5, 0, 0, 0.5), b(1e-6, 4, 0, 0, 0.5)] };
      toCenterOfMass(s);
      return s;
    }
    case 'sunJupiterSaturn': { // units: au, yr, M☉ → G = 4π²
      const G = 4 * Math.PI ** 2;
      const s: NBodySystem = { G, softening: 0, bodies: [b(1, 0, 0, 0, 0), b(1 / 1047.348, 5.2029, 0, 0, Math.sqrt(G / 5.2029)), b(1 / 3497.9, -9.5367, 0, 0, -Math.sqrt(G / 9.5367))] };
      toCenterOfMass(s);
      return s;
    }
    case 'cluster': {
      let seed = 42;
      const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const bodies = Array.from({ length: 24 }, () => {
        const a = r() * 2 * Math.PI, rad = 0.3 + 2 * Math.sqrt(r());
        const vt = 0.55 * Math.sqrt(rad) ;
        return b(0.04 + 0.08 * r(), rad * Math.cos(a), rad * Math.sin(a), -vt * Math.sin(a) * 0.6, vt * Math.cos(a) * 0.6);
      });
      const s: NBodySystem = { G: 1, softening: 0.08, bodies };
      toCenterOfMass(s);
      return s;
    }
    default: // two-body ellipse
      return (() => { const s: NBodySystem = { G: 1, softening: 0, bodies: [b(1, 0, 0, 0, 0), b(0.001, 1, 0, 0, 1.2)] }; toCenterOfMass(s); return s; })();
  }
}

const DEFAULT_STEP: Record<string, number> = { figure8: 0.002, pythagorean: 0.005, binaryPlanet: 0.005, sunJupiterSaturn: 0.002, cluster: 0.004, twobody: 0.002 };

export default function NBodyModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const advanced = useLevelAtLeast('advanced');
  const [scene, setScene] = useParam('scene', 'figure8');
  const [integ, setInteg] = useParam<Integrator>('int', 'yoshida4');
  const [h, setH] = useParam('h', DEFAULT_STEP.figure8, { min: 1e-5, max: 0.05 });
  const [speed, setSpeed] = useParam('speed', 1);
  const [trails, setTrails] = useParam('trails', true);
  const [playing, setPlaying] = useState(true);
  const sys = useRef<NBodySystem>(preset(scene));
  const E0 = useRef(totalEnergy(sys.current));
  const L0 = useRef(angularMomentumZ(sys.current));
  const simT = useRef(0);
  const trailPts = useRef<number[][]>([]);
  const drift = useRef<[number, number][]>([]);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  const zoom = useRef(1);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const view = useRef({ cx: 0, cy: 0, sc: 1 });

  const reset = (id = scene) => {
    sys.current = preset(id);
    E0.current = totalEnergy(sys.current);
    L0.current = angularMomentumZ(sys.current);
    simT.current = 0;
    trailPts.current = sys.current.bodies.map(() => []);
    drift.current = [];
  };
  useEffect(() => { reset(scene); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [scene]);

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h: hh }) => {
    clear(ctx, w, hh, pal.bg);
    drawBackgroundStars(ctx, w, hh, pal, 21);
    const extent = scene === 'sunJupiterSaturn' ? 11 : scene === 'binaryPlanet' ? 5 : scene === 'cluster' ? 3.2 : scene === 'pythagorean' ? 4.5 : 1.6;
    const sc = (Math.min(w, hh) / (2 * extent)) * zoom.current;
    const cx = w / 2, cy = hh / 2;
    view.current = { cx, cy, sc };
    const B = sys.current.bodies;
    if (trails) trailPts.current.forEach((tr, i) => {
      if (tr.length < 4) return;
      ctx.strokeStyle = withAlpha(COLORS[i % COLORS.length], 0.55);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let k = 0; k < tr.length; k += 2) (k ? ctx.lineTo(cx + tr[k] * sc, cy - tr[k + 1] * sc) : ctx.moveTo(cx + tr[k] * sc, cy - tr[k + 1] * sc));
      ctx.stroke();
    });
    const mMax = Math.max(...B.map((b) => b.m));
    B.forEach((b, i) => {
      const r = 2.5 + 7 * Math.cbrt(b.m / mMax);
      const x = cx + b.x * sc, y = cy - b.y * sc;
      glowDisk(ctx, x, y, r, COLORS[i % COLORS.length], 2.2);
      disk(ctx, x, y, r, COLORS[i % COLORS.length]);
    });
    if (drag.current) arrow(ctx, drag.current.x, drag.current.y, drag.current.cx, drag.current.cy, pal.sun, 2, 9);
    label(ctx, tx({ vi: 'Nhấn–kéo để thêm vật (hướng kéo = vận tốc) · lăn chuột để phóng to', en: 'Press–drag to add a body (drag = velocity) · scroll to zoom' }), 12, hh - 12, pal.textFaint, { size: 11 });
  }, [pal, trails, scene, tx]);

  usePointer(canvasRef, {
    down: (x, y) => { drag.current = { x, y, cx: x, cy: y }; },
    move: (x, y, isDown) => { if (isDown && drag.current) { drag.current.cx = x; drag.current.cy = y; } },
    up: (x, y) => {
      const d = drag.current; drag.current = null;
      if (!d) return;
      const { cx, cy, sc } = view.current;
      const px = (d.x - cx) / sc, py = (cy - d.y) / sc;
      const scale = scene === 'sunJupiterSaturn' ? 3 : 0.8;
      const m = scene === 'sunJupiterSaturn' ? 3e-4 : 0.3;
      sys.current.bodies.push({ m, x: px, y: py, z: 0, vx: ((x - d.x) / sc) * scale, vy: (-(y - d.y) / sc) * scale, vz: 0 });
      trailPts.current.push([]);
      E0.current = totalEnergy(sys.current);
      L0.current = angularMomentumZ(sys.current);
      drift.current = [];
    },
    wheel: (dy) => { zoom.current = Math.min(20, Math.max(0.2, zoom.current * (dy > 0 ? 0.9 : 1.1))); },
  });

  useAnimationFrame((dt, now) => {
    if (playing) {
      const target = dt * speed * (scene === 'sunJupiterSaturn' ? 6 : 1);
      const n = Math.min(4000, Math.max(1, Math.round(target / h)));
      for (let k = 0; k < n; k++) stepNBody(sys.current, h, integ);
      simT.current += n * h;
      sys.current.bodies.forEach((b, i) => {
        const tr = trailPts.current[i] ?? (trailPts.current[i] = []);
        tr.push(b.x, b.y);
        if (tr.length > 3000) tr.splice(0, tr.length - 3000);
      });
      const e = Math.abs((totalEnergy(sys.current) - E0.current) / E0.current);
      drift.current.push([simT.current, Math.max(e, 1e-16)]);
      if (drift.current.length > 600) drift.current = drift.current.filter((_, i) => i % 2 === 0);
    }
    redraw();
    if (now - lastUi.current > 200) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const E = totalEnergy(sys.current);
  const dE = Math.abs((E - E0.current) / E0.current);
  const dL = Math.abs(angularMomentumZ(sys.current) - L0.current);
  const snap = cloneSystem(sys.current);

  return (
    <SimLayout
      id="b4"
      lesson={lesson}
      card={card}
      caption={<><span className="k">|ΔE/E₀| = {sci(dE, 3)}</span> · N = {snap.bodies.length} · {({ leapfrog: 'Leapfrog', yoshida4: 'Yoshida 4', rk4: 'RK4', dopri5: 'DOPRI5' } as Record<string, string>)[integ]}</>}
      onReset={() => reset()}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} speed={speed} onSpeed={setSpeed} speeds={[0.25, 0.5, 1, 2, 4].map((v) => ({ value: v, label: `×${v}` }))} label={<>t = {fix(simT.current, 3, lang)}<small>{scene === 'sunJupiterSaturn' ? t('years') : 'G = 1'}</small></>} />}
      panel={
        <>
          <Section title={t('secPresets')} dot="var(--grpB)">
            <Select value={scene} onChange={(v) => { setScene(v); setH(DEFAULT_STEP[v] ?? 0.002); if (v === 'pythagorean') setInteg('dopri5'); else if (integ === 'dopri5') setInteg('yoshida4'); }} options={[
              { value: 'figure8', label: tx({ vi: 'Hình số 8 (3 vật)', en: 'Figure eight (3 bodies)' }) },
              { value: 'pythagorean', label: tx({ vi: 'Bài toán Pythagoras 3-4-5', en: 'Pythagorean 3-4-5 problem' }) },
              { value: 'binaryPlanet', label: tx({ vi: 'Sao đôi + hành tinh', en: 'Binary + circumbinary planet' }) },
              { value: 'sunJupiterSaturn', label: tx({ vi: 'Mặt Trời – Sao Mộc – Sao Thổ', en: 'Sun – Jupiter – Saturn' }) },
              { value: 'cluster', label: tx({ vi: 'Cụm sao 24 vật (làm mềm)', en: '24-body cluster (softened)' }) },
              { value: 'twobody', label: tx({ vi: 'Hai vật (kiểm tra)', en: 'Two bodies (check)' }) },
            ]} />
            <Select label={t('integrator')} value={integ} onChange={setInteg} options={[{ value: 'leapfrog', label: 'Leapfrog (2, symplectic)' }, { value: 'yoshida4', label: 'Yoshida (4, symplectic)' }, { value: 'rk4', label: 'Runge–Kutta 4 (non-symplectic)' }, { value: 'dopri5', label: tx({ vi: 'DOPRI5 (5(4), bước thích nghi)', en: 'DOPRI5 (5(4), adaptive step)' }) }]} />
            {scene === 'pythagorean' && integ !== 'dopri5' && <div className="warn-box">{tx({ vi: 'Bài toán Pythagoras có các lần tiếp cận rất gần: với bước cố định, sai số năng lượng vượt 1 000 lần |E₀| và quỹ đạo không còn đúng. Hãy dùng DOPRI5.', en: 'The Pythagorean problem has very close encounters: with a fixed step the energy error exceeds 1,000 |E₀| and the orbit is wrong. Use DOPRI5.' })}</div>}
            <Slider label={integ === 'dopri5' ? tx({ vi: 'Khoảng xuất kết quả h (bước thật tự co giãn)', en: 'Output interval h (actual step adapts)' }) : tx({ vi: 'Bước thời gian h', en: 'Time step h' })} value={h} min={1e-5} max={0.05} log step={1e-6} onChange={setH} display={sci(h, 2)} />
            <Toggle label={tx({ vi: 'Vệt quỹ đạo', en: 'Trails' })} checked={trails} onChange={setTrails} />
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Số vật', en: 'Bodies' })} v={snap.bodies.length} />
              <Readout k={tx({ vi: 'Năng lượng E', en: 'Energy E' })} v={fix(E, 6, lang)} />
              <Readout wide k={`${t('energyDrift')} |ΔE/E₀|`} v={sci(dE, 3)} tone={dE < 1e-6 ? 'good' : dE < 1e-3 ? 'accent' : 'bad'} />
              <Readout wide k={tx({ vi: 'Sai lệch mômen động lượng |ΔL|', en: 'Angular momentum error |ΔL|' })} v={sci(dL, 3)} />
              {advanced && <Readout wide k={tx({ vi: 'Số lần tính lực mỗi bước', en: 'Force evaluations per step' })} v={integ === 'dopri5' ? tx({ vi: '6 × N² mỗi bước chấp nhận', en: '6 × N² per accepted step' }) : `${integ === 'rk4' ? 4 : integ === 'yoshida4' ? 3 : 1} × N²`} />}
            </Readouts>
            <ChartCard title={tx({ vi: 'Độ trôi năng lượng theo thời gian', en: 'Energy drift over time' })}>
              <LineChart height={160} yLog xLabel="t" yLabel="|ΔE/E₀|" series={[{ data: drift.current.length ? drift.current : [[0, 1e-16]], color: integ === 'rk4' ? pal.danger : pal.ok }]} />
            </ChartCard>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} style={{ touchAction: 'none', cursor: 'crosshair' }} role="img" aria-label="N-body" />
    </SimLayout>
  );
}
