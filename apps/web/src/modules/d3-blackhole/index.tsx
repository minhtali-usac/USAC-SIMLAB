import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SHADOW_B_M, infallProperTime, infallCoordinateTime, tidalAcceleration, GM_SUN, C, G0, kerrIsco, kerrHorizon, kerrPhotonOrbit,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Toggle, Readout, Readouts, Segmented, Select } from '../../components/Controls';
import { LineChart, ChartCard } from '../../components/LineChart';
import { useT, fmt, fix, sci } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, usePalette, usePointer } from '../../lib/hooks';
import { useSettings, useLevelAtLeast } from '../../store/settings';
import { label } from '../../lib/canvas';
import { VERT, FRAG } from './shader';
import { lesson, card } from './content';

const MASSES = {
  stellar: { m: 10, name: { vi: 'Hố đen sao 10 M☉', en: 'Stellar BH 10 M☉' } },
  sgra: { m: 4.297e6, name: { vi: 'Sgr A* (4,3×10⁶ M☉)', en: 'Sgr A* (4.3×10⁶ M☉)' } },
  m87: { m: 6.5e9, name: { vi: 'M87* (6,5×10⁹ M☉)', en: 'M87* (6.5×10⁹ M☉)' } },
} as const;
type MassKey = keyof typeof MASSES;

interface GL {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  loc: Record<string, WebGLUniformLocation | null>;
}

function initGL(canvas: HTMLCanvasElement): GL | string {
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  if (!gl) return 'WebGL2 not available';
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader error');
    return s;
  };
  const prog = gl.createProgram()!;
  try {
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  } catch (e) {
    return String(e);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return gl.getProgramInfoLog(prog) ?? 'link error';
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const names = ['uRes', 'uCamPos', 'uCamRot', 'uTanHalfFov', 'uRin', 'uRout', 'uTime', 'uStep', 'uMaxSteps', 'uDisk', 'uBg', 'uDoppler', 'uExposure'];
  const loc: GL['loc'] = {};
  for (const n of names) loc[n] = gl.getUniformLocation(prog, n);
  return { gl, prog, loc };
}

export default function BlackHoleModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const quality = useSettings((s) => s.quality);
  const student = useLevelAtLeast('student');
  const advanced = useLevelAtLeast('advanced');

  const [rObs, setR] = useParam('r', 30, { min: 8, max: 120 });
  const [incl, setIncl] = useParam('incl', 80, { min: 1, max: 90 });
  const [az, setAz] = useParam('az', 0);
  const [fov, setFov] = useParam('fov', 46, { min: 15, max: 100 });
  const [disk, setDisk] = useParam('disk', true);
  const [rin, setRin] = useParam('rin', 6, { min: 6, max: 20 });
  const [rout, setRout] = useParam('rout', 22, { min: 10, max: 60 });
  const [bg, setBg] = useParam<'stars' | 'grid'>('bg', 'stars');
  const [dop, setDop] = useParam('dop', true);
  const [anim, setAnim] = useParam('anim', false);
  const [overlay, setOverlay] = useParam('ov', true);
  const [exposure, setExposure] = useParam('exp', 1.1, { min: 0.2, max: 5 });
  const [massKey, setMassKey] = useParam<MassKey>('mass', 'sgra');
  const [spin, setSpin] = useState(0.5);

  const glCanvas = useRef<HTMLCanvasElement>(null);
  const ovCanvas = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<GL | null>(null);
  const [glError, setGlError] = useState<string | null>(null);
  const scaleRef = useRef(0.35);
  const idleTimer = useRef<number>(0);
  const dirty = useRef(true);
  const timeRef = useRef(0);
  const [renderInfo, setRenderInfo] = useState({ w: 0, h: 0, ms: 0 });

  // camera basis
  const cam = useMemo(() => {
    const i = (incl * Math.PI) / 180, a = (az * Math.PI) / 180;
    const pos: [number, number, number] = [rObs * Math.sin(i) * Math.cos(a), rObs * Math.cos(i), rObs * Math.sin(i) * Math.sin(a)];
    const back = pos.map((v) => v / rObs) as [number, number, number];
    const upHint: [number, number, number] = [0, 1, 0];
    let right: [number, number, number] = [upHint[1] * back[2] - upHint[2] * back[1], upHint[2] * back[0] - upHint[0] * back[2], upHint[0] * back[1] - upHint[1] * back[0]];
    const rn = Math.hypot(...right) || 1;
    right = right.map((v) => v / rn) as [number, number, number];
    const up: [number, number, number] = [back[1] * right[2] - back[2] * right[1], back[2] * right[0] - back[0] * right[2], back[0] * right[1] - back[1] * right[0]];
    // column-major mat3: columns right, up, back
    const rot = new Float32Array([...right, ...up, ...back]);
    return { pos, rot };
  }, [incl, az, rObs]);

  const kick = () => {
    dirty.current = true;
    scaleRef.current = quality === 'saver' ? 0.3 : 0.4;
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      scaleRef.current = quality === 'saver' ? 0.6 : 1;
      dirty.current = true;
    }, 280);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(kick, [cam, fov, disk, rin, rout, bg, dop, exposure, quality, anim, overlay, lang]);

  useEffect(() => {
    const c = glCanvas.current;
    if (!c) return;
    const res = initGL(c);
    if (typeof res === 'string') setGlError(res);
    else glRef.current = res;
    const ro = new ResizeObserver(() => kick());
    ro.observe(c);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const render = () => {
    const G = glRef.current, c = glCanvas.current;
    if (!G || !c) return;
    const { gl, loc } = G;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = anim ? Math.min(scaleRef.current, 0.55) : scaleRef.current;
    const W = Math.max(2, Math.round(c.clientWidth * dpr * s)), H = Math.max(2, Math.round(c.clientHeight * dpr * s));
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    const t0 = performance.now();
    gl.viewport(0, 0, W, H);
    gl.useProgram(G.prog);
    gl.uniform2f(loc.uRes, W, H);
    gl.uniform3f(loc.uCamPos, cam.pos[0], cam.pos[1], cam.pos[2]);
    gl.uniformMatrix3fv(loc.uCamRot, false, cam.rot);
    gl.uniform1f(loc.uTanHalfFov, Math.tan((fov * Math.PI) / 360));
    gl.uniform1f(loc.uRin, rin);
    gl.uniform1f(loc.uRout, Math.max(rout, rin + 1));
    gl.uniform1f(loc.uTime, timeRef.current);
    const hi = scaleRef.current >= 0.99 && quality === 'high';
    gl.uniform1f(loc.uStep, hi ? 0.012 : 0.02);
    gl.uniform1i(loc.uMaxSteps, hi ? 1100 : 650);
    gl.uniform1i(loc.uDisk, disk ? 1 : 0);
    gl.uniform1i(loc.uBg, bg === 'grid' ? 1 : 0);
    gl.uniform1i(loc.uDoppler, dop ? 1 : 0);
    gl.uniform1f(loc.uExposure, exposure);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.finish();
    setRenderInfo({ w: W, h: H, ms: performance.now() - t0 });
    drawOverlay();
  };

  const drawOverlay = () => {
    const c = ovCanvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!overlay) return;
    // apparent shadow radius for a static observer (exact): sin α = b_c √(1−2/r) / r
    const sinA = (SHADOW_B_M * Math.sqrt(1 - 2 / rObs)) / rObs;
    const alpha = Math.asin(Math.min(1, sinA));
    const pxR = (Math.tan(alpha) / (2 * Math.tan((fov * Math.PI) / 360))) * h;
    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = 'rgba(94,234,212,0.85)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, pxR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, tx({ vi: `rìa bóng: b = 3√3 M (${fix((alpha * 180) / Math.PI, 2, lang)}°)`, en: `shadow edge: b = 3√3 M (${fix((alpha * 180) / Math.PI, 2, lang)}°)` }), w / 2 + pxR * 0.72 + 8, h / 2 - pxR * 0.72 - 8, 'rgba(94,234,212,0.95)', { size: 12, halo: 'rgba(0,0,0,0.7)' });
  };

  useAnimationFrame((dt) => {
    if (anim) { timeRef.current += dt * 6; dirty.current = true; }
    if (dirty.current) { dirty.current = false; render(); }
  });

  // pointer orbit controls
  const drag = useRef<{ x: number; y: number; az: number; incl: number } | null>(null);
  usePointer(ovCanvas, {
    down: (x, y) => { drag.current = { x, y, az, incl }; },
    move: (x, y, dragging) => {
      if (!dragging || !drag.current) return;
      const d = drag.current;
      setAz(Math.round(((d.az - (x - d.x) * 0.35) % 360 + 360) % 360));
      setIncl(Math.round(Math.min(90, Math.max(1, d.incl - (y - d.y) * 0.3))));
    },
    up: () => { drag.current = null; },
    wheel: (dy) => setR(Math.min(120, Math.max(8, Math.round(rObs * (dy > 0 ? 1.06 : 0.94))))),
  });

  // infall analytics (float64 core)
  const M = MASSES[massKey].m;
  const gm = GM_SUN * M;
  const rsKm = (2 * gm) / (C * C) / 1000;
  const tUnit = gm / C ** 3; // seconds per M
  const tidalG = tidalAcceleration(gm, (2 * gm) / (C * C), 2) / G0;
  const infall = useMemo(() => {
    const r0 = 20;
    const tau: [number, number][] = [], tc: [number, number][] = [];
    for (let k = 0; k <= 300; k++) {
      const r = r0 - (r0 - 0.02) * (k / 300);
      tau.push([r, infallProperTime(r0, r)]);
      if (r > 2.0005) tc.push([r, infallCoordinateTime(r0, r)]);
    }
    return { tau, tc, tauH: infallProperTime(r0, 2), tauS: infallProperTime(r0, 0) };
  }, []);
  const spinData = useMemo(() => {
    const pro: [number, number][] = [], ret: [number, number][] = [], hor: [number, number][] = [], ph: [number, number][] = [];
    for (let k = 0; k <= 100; k++) {
      const a = k / 100 * 0.9999;
      pro.push([a, kerrIsco(a, true)]); ret.push([a, kerrIsco(a, false)]); hor.push([a, kerrHorizon(a)]); ph.push([a, kerrPhotonOrbit(a, true)]);
    }
    return { pro, ret, hor, ph };
  }, []);

  return (
    <SimLayout
      id="d3"
      lesson={lesson}
      card={card}
      caption={<><span className="k">b_c = 3√3 M ≈ {fix(SHADOW_B_M, 3, lang)} M</span> · r = {rObs} M · i = {incl}°</>}
      onReset={() => kick()}
      onTogglePlay={() => setAnim(!anim)}
      panel={
        <>
          <Section title={tx({ vi: 'Máy ảnh (người quan sát tĩnh)', en: 'Camera (static observer)' })} dot="var(--grpD)">
            <Slider label={tx({ vi: 'Khoảng cách r', en: 'Distance r' })} value={rObs} min={8} max={120} step={1} onChange={setR} display={`${rObs} M = ${fix(rObs / 2, 1, lang)} rₛ`} />
            <Slider label={tx({ vi: 'Góc nghiêng (0° = nhìn thẳng mặt đĩa)', en: 'Inclination (0° = face-on)' })} value={incl} min={1} max={90} step={1} onChange={setIncl} display={`${incl}°`} />
            <Slider label={tx({ vi: 'Phương vị', en: 'Azimuth' })} value={az} min={0} max={359} step={1} onChange={setAz} display={`${az}°`} />
            <Slider label={tx({ vi: 'Trường nhìn', en: 'Field of view' })} value={fov} min={15} max={100} step={1} onChange={setFov} display={`${fov}°`} />
            <div className="field-hint">{tx({ vi: 'Kéo trên ảnh để xoay, lăn chuột để tiến/lùi.', en: 'Drag the image to orbit, scroll to move in/out.' })}</div>
          </Section>
          <Section title={tx({ vi: 'Đĩa bồi tụ & bầu trời', en: 'Accretion disk & sky' })}>
            <Toggle label={tx({ vi: 'Đĩa bồi tụ mỏng', en: 'Thin accretion disk' })} checked={disk} onChange={setDisk} swatch="#fdba74" />
            {disk && student && <Slider label={tx({ vi: 'Mép trong r_in (≥ ISCO)', en: 'Inner edge r_in (≥ ISCO)' })} value={rin} min={6} max={20} step={0.5} onChange={setRin} display={`${rin} M`} />}
            {disk && student && <Slider label={tx({ vi: 'Mép ngoài', en: 'Outer edge' })} value={rout} min={10} max={60} step={1} onChange={setRout} display={`${rout} M`} />}
            <Toggle label={tx({ vi: 'Doppler & dịch đỏ hấp dẫn', en: 'Doppler & gravitational redshift' })} checked={dop} onChange={setDop} />
            <Toggle label={tx({ vi: 'Đĩa quay (hoạt ảnh)', en: 'Animate disk rotation' })} checked={anim} onChange={setAnim} />
            <Segmented value={bg} onChange={setBg} options={[{ value: 'stars', label: tx({ vi: 'Nền sao', en: 'Stars' }) }, { value: 'grid', label: tx({ vi: 'Lưới bầu trời', en: 'Sky grid' }) }]} />
            <Slider label={tx({ vi: 'Phơi sáng', en: 'Exposure' })} value={exposure} min={0.2} max={5} step={0.05} onChange={setExposure} display={fix(exposure, 2, lang)} />
            <Toggle label={tx({ vi: 'Lớp chú thích (rìa bóng)', en: 'Annotation layer (shadow edge)' })} checked={overlay} onChange={setOverlay} swatch="var(--teal)" />
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Chân trời', en: 'Horizon' })} v="2" unit="M" />
              <Readout k={tx({ vi: 'Cầu photon (không bền)', en: 'Photon sphere (unstable)' })} v="3" unit="M" />
              <Readout k="ISCO" v="6" unit="M" />
              <Readout k={tx({ vi: 'Bán kính bóng b_c', en: 'Shadow radius b_c' })} v={fix(SHADOW_B_M, 3, lang)} unit="M" />
              <Readout wide k={tx({ vi: 'Dịch đỏ của ánh sáng phát từ ISCO tới máy ảnh (tĩnh)', en: 'Redshift factor, static emitter at ISCO → camera' })} v={`1+z = ${fix(Math.sqrt(1 - 2 / rObs) / Math.sqrt(1 - 2 / 6), 3, lang)}`} frame={tx({ vi: 'nguồn tĩnh, không tính Doppler', en: 'static source, no Doppler' })} />
              {advanced && <Readout wide k={tx({ vi: 'Kết xuất', en: 'Render' })} v={`${renderInfo.w}×${renderInfo.h} · ${fix(renderInfo.ms, 0, lang)} ms`} />}
            </Readouts>
            {glError && <div className="warn-box">WebGL2: {glError}</div>}
          </Section>
          <Section title={tx({ vi: 'Rơi vào: hai đồng hồ', en: 'Infall: two clocks' })} open={student}>
            <Select value={massKey} onChange={setMassKey} options={(Object.keys(MASSES) as MassKey[]).map((k) => ({ value: k, label: tx(MASSES[k].name) }))} />
            <Readouts>
              <Readout k="rₛ = 2GM/c²" v={fmt(rsKm, 3, lang)} unit="km" />
              <Readout k={tx({ vi: '1 M (thời gian)', en: '1 M (time)' })} v={fmt(tUnit, 3, lang)} unit="s" />
              <Readout wide k={tx({ vi: 'τ từ 20M tới chân trời', en: 'τ from 20M to the horizon' })} v={fmt(infall.tauH * tUnit, 4, lang)} unit="s" frame={t('properTime')} />
              <Readout wide k={tx({ vi: 'τ từ chân trời tới r = 0', en: 'τ from horizon to r = 0' })} v={fmt((4 / 3) * tUnit, 4, lang)} unit="s" frame={t('properTime')} />
              <Readout wide k={tx({ vi: 't của người ở xa để thấy vật tới chân trời', en: 'Distant time to see it reach the horizon' })} v="∞" frame={t('coordTime')} tone="bad" />
              <Readout wide k={tx({ vi: 'Thuỷ triều qua cơ thể 2 m tại chân trời', en: 'Tidal stretch over 2 m at the horizon' })} v={tidalG > 1e4 ? sci(tidalG, 2) : fmt(tidalG, 3, lang)} unit="g" tone={tidalG > 10 ? 'bad' : 'good'} />
            </Readouts>
            <ChartCard title={tx({ vi: 'Rơi tự do từ r = 20M (E = 1)', en: 'Free fall from r = 20M (E = 1)' })}>
              <LineChart
                height={190}
                xLabel="r (M)" yLabel={tx({ vi: 'thời gian (M)', en: 'time (M)' })}
                xDomain={[0, 20]} yDomain={[0, 120]}
                series={[
                  { data: infall.tau, color: pal.teal, label: `τ - ${t('properTime')}` },
                  { data: infall.tc, color: pal.horizon, label: `t - ${t('coordTime')}` },
                ]}
                vlines={[{ x: 2, color: pal.danger, label: tx({ vi: 'chân trời', en: 'horizon' }) }]}
              />
            </ChartCard>
          </Section>
          {advanced && (
            <Section title={tx({ vi: 'Xem trước Kerr (D4): bán kính theo spin', en: 'Kerr preview (D4): radii vs spin' })} open={false}>
              <Slider label="a/M" value={spin} min={0} max={0.999} step={0.001} onChange={setSpin} display={fix(spin, 3, lang)} />
              <Readouts>
                <Readout k={tx({ vi: 'ISCO thuận', en: 'Prograde ISCO' })} v={fix(kerrIsco(spin, true), 3, lang)} unit="M" />
                <Readout k={tx({ vi: 'ISCO nghịch', en: 'Retrograde ISCO' })} v={fix(kerrIsco(spin, false), 3, lang)} unit="M" />
                <Readout k="r₊" v={fix(kerrHorizon(spin), 3, lang)} unit="M" />
                <Readout k={tx({ vi: 'Quỹ đạo photon thuận', en: 'Prograde photon orbit' })} v={fix(kerrPhotonOrbit(spin, true), 3, lang)} unit="M" />
              </Readouts>
              <ChartCard>
                <LineChart height={170} xLabel="a/M" yLabel="r (M)" xDomain={[0, 1]} yDomain={[0, 9.5]}
                  series={[{ data: spinData.ret, color: pal.newton, label: 'ISCO retro' }, { data: spinData.pro, color: pal.teal, label: 'ISCO pro' }, { data: spinData.ph, color: pal.sun, label: 'photon' }, { data: spinData.hor, color: pal.danger, label: 'r₊' }]}
                  vlines={[{ x: spin, color: pal.accent }]} />
              </ChartCard>
            </Section>
          )}
        </>
      }
    >
      <canvas ref={glCanvas} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#000' }} />
      <canvas ref={ovCanvas} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }} role="img" aria-label={tx({ vi: 'Ảnh ray-traced của hố đen Schwarzschild', en: 'Ray-traced image of a Schwarzschild black hole' })} />
      <div className="stage-overlay bl">
        <span className="scale-note">{tx({ vi: `Hệ quy chiếu: máy ảnh tĩnh tại r = ${rObs} M · GPU float32`, en: `Frame: static camera at r = ${rObs} M · GPU float32` })}</span>
      </div>
    </SimLayout>
  );
}
