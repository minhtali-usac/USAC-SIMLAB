import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { PLANCK18_LSS, PLANCK18_AS, sigma8AtFixedAs, growthSolution, omegaMa, growthRate2, linearPk, kaiserMonopole, hodExpected, RHO_CRIT_H2, type HodParams } from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Segmented, Toggle } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex, MathText } from '../../components/Tex';
import { useT, fix, sci, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D } from '../../lib/hooks';
import { clear, label } from '../../lib/canvas';
import { LUTS, drawLogField, cmapCss } from '../../lib/colormap';
import { useLevelAtLeast } from '../../store/settings';
import { BOX, type BuildRes, type DeriveReq, type DeriveRes } from './shared';
import { lesson, card } from './content';

const A0 = 0.05, A1 = 1;
const SIG8_FIELDS = PLANCK18_LSS.sigma8; // fields are generated at σ₈ = 0.811 for their own (Ωm, ns) shape; the amplitude rescales them
const AS_P = PLANCK18_AS * 1e9; // A_s in units of 10⁻⁹ (Planck 2018: 2.099)
/** Presets: `as` is used when the amplitude is set by A_s, `s8` when it is set by σ₈. */
const PRESETS: { id: string; om: number; s8: number; as: number; ns: number; name: L }[] = [
  { id: 'planck', om: 0.315, s8: 0.811, as: AS_P, ns: 0.965, name: { vi: 'Planck 2018', en: 'Planck 2018' } },
  { id: 'heavy', om: 0.55, s8: 0.811, as: AS_P, ns: 0.965, name: { vi: 'Nhiều vật chất', en: 'Matter-heavy' } },
  { id: 'light', om: 0.15, s8: 0.811, as: AS_P, ns: 0.965, name: { vi: 'Ít vật chất', en: 'Matter-light' } },
  { id: 'smooth', om: 0.315, s8: 0.45, as: AS_P * (0.45 / 0.811) ** 2, ns: 0.965, name: { vi: 'Phẳng lặng', en: 'Smooth' } },
  { id: 'blue', om: 0.315, s8: 0.811, as: AS_P, ns: 1.25, name: { vi: 'Nghiêng xanh', en: 'Blue tilt' } },
];
const WEB_COL = ['#475569', '#34d399', '#60a5fa', '#fb923c'];
const LOS_AX = { real: -1, x: 0, y: 1, z: 2 } as const;

// ── GPU splats: mirrors sim-core lptParticles() (positions, Jacobian density, web type) ────────────────────────
const VERT = /* glsl */ `
uniform float uAmp, uOrd2, uF, uF2, uBox, uSize, uMode, uMix, uPix, uAlpha, uHasDens;
uniform vec3 uLos;
uniform sampler2D uLut;
attribute vec3 psi1; attribute vec3 psi2; attribute vec3 eig;
attribute vec3 psi1o; attribute vec3 psi2o; attribute vec3 eigo; attribute float dens;
varying vec3 vCol; varying float vA;
vec3 place(vec3 q, vec3 p1, vec3 p2, vec3 e, out float rho, out float web) {
  float me = uAmp; // plain LPT: no stop at shell crossing (mirrors sim-core lptParticles)
  float c2 = uOrd2 * (3.0 / 7.0) * me * me;
  vec3 v = uF * me * p1 + uF2 * c2 * p2;
  rho = 1.0 / max(1e-3, abs((1.0 + me * e.x) * (1.0 + me * e.y) * (1.0 + me * e.z)));
  web = step(0.4, -uAmp * e.x) + step(0.4, -uAmp * e.y) + step(0.4, -uAmp * e.z);
  return q + me * p1 + c2 * p2 + uLos * dot(v, uLos);
}
void main() {
  float rn, wn, ro, wo;
  vec3 xn = place(position, psi1, psi2, eig, rn, wn);
  vec3 xo = place(position, psi1o, psi2o, eigo, ro, wo);
  vec3 x = mod(mix(xo, xn, uMix), uBox) - 0.5 * uBox;
  // colour by Eulerian CIC density from the worker when available (Jacobian density diverges at caustics)
  float rho = uHasDens > 0.5 ? dens : min(mix(ro, rn, uMix), 6.0), web = uMix > 0.5 ? wn : wo;
  float t = clamp((log(rho) / 2.302585 + 0.6) / 2.1, 0.0, 1.0);
  if (uMode < 0.5) { vCol = texture2D(uLut, vec2(t, 0.5)).rgb; vA = uAlpha * (0.04 + 0.85 * t * t); }
  else {
    vCol = web < 0.5 ? vec3(0.28, 0.33, 0.41) : web < 1.5 ? vec3(0.20, 0.83, 0.60) : web < 2.5 ? vec3(0.38, 0.65, 0.98) : vec3(0.98, 0.57, 0.24);
    vA = uAlpha * (web < 0.5 ? 0.03 : web < 1.5 ? 0.12 : web < 2.5 ? 0.24 : 0.34);
  }
  vec4 mv = modelViewMatrix * vec4(x, 1.0);
  gl_PointSize = clamp(uSize * uPix * (0.7 + 1.1 * t) / -mv.z, 1.0, 40.0);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = /* glsl */ `
varying vec3 vCol; varying float vA;
void main() {
  vec2 c = gl_PointCoord - 0.5; float r2 = dot(c, c);
  if (r2 > 0.25) discard;
  float g = exp(-r2 * 16.0);
  gl_FragColor = vec4(vCol, vA * g);
}`;

interface Fields { N: number; disp1: Float32Array; disp2: Float32Array; eig: Float32Array; id: number }
interface Live { amp: number; order2: boolean; f: number; f2: number; los: -1 | 0 | 1 | 2; mode: number }

function WebPoints({ F, prev, live, dens }: { F: Fields; prev: Fields | null; live: React.MutableRefObject<Live>; dens: Float32Array | null }) {
  const { size, viewport, camera } = useThree();
  const mixStart = useRef(performance.now());
  const geo = useMemo(() => {
    const N = F.N, M = N * N * N, cell = BOX / N, q = new Float32Array(3 * M);
    for (let iz = 0, i = 0; iz < N; iz++) for (let iy = 0; iy < N; iy++) for (let ix = 0; ix < N; ix++, i++) { q[3 * i] = ix * cell; q[3 * i + 1] = iy * cell; q[3 * i + 2] = iz * cell; }
    const g = new THREE.BufferGeometry();
    const P = prev && prev.N === F.N ? prev : F;
    g.setAttribute('position', new THREE.BufferAttribute(q, 3));
    g.setAttribute('psi1', new THREE.BufferAttribute(F.disp1, 3)); g.setAttribute('psi2', new THREE.BufferAttribute(F.disp2, 3)); g.setAttribute('eig', new THREE.BufferAttribute(F.eig, 3));
    g.setAttribute('psi1o', new THREE.BufferAttribute(P.disp1, 3)); g.setAttribute('psi2o', new THREE.BufferAttribute(P.disp2, 3)); g.setAttribute('eigo', new THREE.BufferAttribute(P.eig, 3));
    g.setAttribute('dens', new THREE.BufferAttribute(new Float32Array(N * N * N).fill(1), 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), BOX);
    mixStart.current = performance.now();
    return g;
  }, [F, prev]);
  useEffect(() => () => geo.dispose(), [geo]);
  const hasDens = !!dens && dens.length === F.N ** 3;
  useEffect(() => {
    if (!hasDens) return;
    const at = geo.getAttribute('dens') as THREE.BufferAttribute;
    (at.array as Float32Array).set(dens!); at.needsUpdate = true;
  }, [geo, dens, hasDens]);
  const mat = useMemo(() => {
    const L = LUTS.cosmic, rgba = new Uint8Array(256 * 4);
    for (let i = 0; i < 256; i++) { rgba[4 * i] = L[3 * i]; rgba[4 * i + 1] = L[3 * i + 1]; rgba[4 * i + 2] = L[3 * i + 2]; rgba[4 * i + 3] = 255; }
    const lut = new THREE.DataTexture(rgba, 256, 1, THREE.RGBAFormat); lut.needsUpdate = true; lut.magFilter = THREE.LinearFilter; lut.minFilter = THREE.LinearFilter;
    return new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uAmp: { value: 1 }, uOrd2: { value: 1 }, uF: { value: 0 }, uF2: { value: 0 }, uBox: { value: BOX }, uSize: { value: 2 }, uMode: { value: 0 }, uMix: { value: 1 }, uPix: { value: 500 }, uAlpha: { value: 1 }, uHasDens: { value: 0 }, uLos: { value: new THREE.Vector3() }, uLut: { value: lut } },
    });
  }, []);
  useFrame(() => {
    const u = mat.uniforms, l = live.current, N = F.N;
    u.uHasDens.value = hasDens ? 1 : 0;
    u.uAmp.value = l.amp; u.uOrd2.value = l.order2 ? 1 : 0; u.uF.value = l.f; u.uF2.value = l.f2; u.uMode.value = l.mode;
    u.uLos.value.set(l.los === 0 ? 1 : 0, l.los === 1 ? 1 : 0, l.los === 2 ? 1 : 0);
    u.uMix.value = Math.min(1, (performance.now() - mixStart.current) / 900);
    u.uSize.value = (BOX / N) * 0.34;
    u.uAlpha.value = 64 / N;
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
    u.uPix.value = (size.height * viewport.dpr) / (2 * Math.tan(fov / 2));
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

function Markers({ pos, n, color, size, opacity }: { pos: Float32Array; n: number; color: string; size: number; opacity: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), p = new Float32Array(3 * n);
    for (let i = 0; i < 3 * n; i++) p[i] = pos[i] - BOX / 2;
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, [pos, n]);
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d')!, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial size={size} map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

function BoxFrame() {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(BOX, BOX, BOX)), []);
  return <lineSegments geometry={geo}><lineBasicMaterial color="#64748b" transparent opacity={0.35} /></lineSegments>;
}

export default function CosmicWebModule() {
  const { t, tx, lang } = useT();
  const student = useLevelAtLeast('student');
  const [om, setOm] = useParam('om', 0.315, { min: 0.1, max: 0.6 });
  const [norm, setNorm] = useParam<'As' | 's8'>('norm', 'As');
  const [s8In, setS8] = useParam('s8', 0.811, { min: 0.3, max: 1.5 });
  const [asIn, setAs] = useParam('As', AS_P, { min: 0.3, max: 6 });
  const [ns, setNs] = useParam('ns', 0.965, { min: 0.7, max: 1.3 });
  const [aP, setA] = useParam('a', 1, { min: A0, max: A1 });
  const [lpt, setLpt] = useParam<'1' | '2'>('lpt', '2');
  const [rsd, setRsd] = useParam<'real' | 'x' | 'y' | 'z'>('rsd', 'real');
  const [res, setRes] = useParam<'32' | '64' | '128'>('res', '64');
  const [seed, setSeed] = useParam('seed', 2026);
  const [col, setCol] = useParam<'density' | 'web'>('col', 'density');
  const [showH, setShowH] = useParam('halos', false);
  const [showG, setShowG] = useParam('gals', false);
  const [showBox, setShowBox] = useParam('box', true);
  const [spin, setSpin] = useParam('spin', true);
  const [lmin, setLmin] = useParam('lmin', 13.5, { min: 13, max: 14.8 });
  const [lm1, setLm1] = useParam('lm1', 14.5, { min: 13.8, max: 16 });
  const [alpha, setAlpha] = useParam('al', 1.0, { min: 0.4, max: 2 });
  const [playing, setPlaying] = useState(false);
  const aRef = useRef(aP);
  if (!playing) aRef.current = aP;
  const [, setTick] = useState(0);
  const lastTick = useRef(0);

  const N = Number(res);
  const sol = useMemo(() => growthSolution(om, 1.0, 3000), [om]);
  const a = aRef.current;
  const D = sol.D(a) / sol.D1, f = sol.f(a), f2 = growthRate2(om, a);
  // amplitude: fixed primordial A_s (Ωm and ns change σ₈) or fixed σ₈ (Ωm and ns change only the spectral shape)
  const s8AtAs = useMemo(() => sigma8AtFixedAs({ ...PLANCK18_LSS, Om: om, ns }, asIn * 1e-9), [om, ns, asIn]);
  const s8 = norm === 'As' ? s8AtAs : s8In;
  const asEquiv = useMemo(() => (norm === 'As' ? asIn : AS_P * (s8In / sigma8AtFixedAs({ ...PLANCK18_LSS, Om: om, ns }, PLANCK18_AS)) ** 2), [norm, asIn, s8In, om, ns]);
  const amp = (s8 / SIG8_FIELDS) * D;
  const los = LOS_AX[rsd];
  const hod: HodParams = useMemo(() => ({ logMmin: lmin, sigmaLogM: 0.26, logM0: 13.0, logM1: lm1, alpha }), [lmin, lm1, alpha]);
  const live = useRef<Live>({ amp, order2: lpt === '2', f, f2, los, mode: 0 });
  live.current = { amp, order2: lpt === '2', f: los >= 0 ? f : 0, f2: los >= 0 ? f2 : 0, los, mode: col === 'web' ? 1 : 0 };

  // ── worker: fields (build) + derived products (derive) ──
  const worker = useRef<Worker | null>(null);
  const [fields, setFields] = useState<{ cur: Fields; prev: Fields | null } | null>(null);
  const [building, setBuilding] = useState(true);
  const [derived, setDerived] = useState<DeriveRes | null>(null);
  const reqId = useRef(0), busy = useRef(false), pending = useRef<DeriveReq | null>(null), fieldsId = useRef(-1);
  useEffect(() => {
    const w = new Worker(new URL('./fields.worker.ts', import.meta.url), { type: 'module' });
    worker.current = w;
    w.onmessage = (e: MessageEvent<BuildRes | DeriveRes>) => {
      const m = e.data;
      if (m.type === 'build') {
        if (m.id !== fieldsId.current) return;
        setFields((old) => ({ cur: { N: m.N, disp1: m.disp1, disp2: m.disp2, eig: m.eig, id: m.id }, prev: old?.cur ?? null }));
        setBuilding(false);
        busy.current = false;
        flush();
      } else {
        if (m.fieldId === fieldsId.current) setDerived(m);
        busy.current = false;
        flush();
      }
    };
    return () => w.terminate();
  }, []);
  const flush = () => {
    const w = worker.current;
    if (!w || busy.current || !pending.current) return;
    busy.current = true; w.postMessage(pending.current); pending.current = null;
  };
  useEffect(() => {
    const id = ++reqId.current;
    fieldsId.current = id; setBuilding(true);
    const send = () => { worker.current?.postMessage({ type: 'build', id, Om: om, ns, N, seed }); busy.current = true; };
    // debounce slider drags; the build request jumps the queue
    const h = setTimeout(() => { pending.current = null; send(); }, 220);
    return () => clearTimeout(h);
  }, [om, ns, N, seed]);
  // derived products: quantise a so playback asks ~10 updates per unit of D
  const ampQ = Math.round(amp * 60) / 60;
  useEffect(() => {
    if (!fields) return;
    pending.current = { type: 'derive', id: ++reqId.current, amp: ampQ, order2: lpt === '2', los, f: los >= 0 ? f : 0, f2: los >= 0 ? f2 : 0, Om: om, halos: showH, gals: showG, hod, galSeed: seed + 7, sliceAxis: los === 2 ? 1 : 2, pk: !playing };
    flush();
  }, [fields, ampQ, lpt, los, showH, showG, hod, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  useAnimationFrame((dt, now) => {
    if (playing) {
      aRef.current += dt * 0.11;
      if (aRef.current >= A1) { aRef.current = A1; setPlaying(false); setA(A1); }
    }
    if (now - lastTick.current > 100) { lastTick.current = now; setTick((x) => x + 1); }
  });

  // ── 2D slice canvas ──
  const sliceRef = useRef<DeriveRes | null>(null);
  sliceRef.current = derived;
  const { canvasRef: sliceCanvas } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, '#03040a');
    const d = sliceRef.current;
    const S = Math.min(w, h) - 8, ox = (w - S) / 2, oy = (h - S) / 2;
    if (!d) { label(ctx, tx({ vi: 'Đang tính…', en: 'Computing…' }), w / 2, h / 2, '#94a3b8', { align: 'center', size: 12 }); return; }
    drawLogField(ctx, d.slice, d.sliceG, ox, oy, S, -0.7, 1.5, 'cosmic');
    const ax = los === 2 ? 1 : 2, hA = 0, vA = ax === 2 ? 1 : 2;
    const inSlab = (p: Float32Array, i: number) => Math.abs(p[3 * i + ax] - BOX / 2) < BOX / 16;
    if (showH) for (let k = 0; k < d.nHalo; k++) if (inSlab(d.haloPos, k)) {
      ctx.strokeStyle = 'rgba(253,224,71,0.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ox + (d.haloPos[3 * k + hA] / BOX) * S, oy + S - (d.haloPos[3 * k + vA] / BOX) * S, Math.max(2, (d.haloR[k] * 1.55 / BOX) * S), 0, 2 * Math.PI); ctx.stroke();
    }
    if (showG) { ctx.fillStyle = '#f9a8d4'; for (let k = 0; k < d.nGal; k++) if (inSlab(d.galPos, k)) ctx.fillRect(ox + (d.galPos[3 * k + hA] / BOX) * S - 1, oy + S - (d.galPos[3 * k + vA] / BOX) * S - 1, 2.2, 2.2); }
    const axn = ['x', 'y', 'z'];
    label(ctx, `${axn[hA]} →`, ox + S - 26, oy + S - 8, '#e5e7eb', { size: 11, halo: '#000' });
    label(ctx, `↑ ${axn[vA]}${los === vA ? ' (LOS)' : ''}`, ox + 6, oy + 16, '#e5e7eb', { size: 11, halo: '#000' });
    const bar = (50 / BOX) * S;
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox + 8, oy + S - 22); ctx.lineTo(ox + 8 + bar, oy + S - 22); ctx.stroke();
    label(ctx, '50 Mpc/h', ox + 8, oy + S - 28, '#e5e7eb', { size: 10.5, halo: '#000' });
  }, [derived, showH, showG, los, tx]);

  // ── P(k) chart ──
  const Plin = useMemo(() => linearPk({ ...PLANCK18_LSS, Om: om, ns }), [om, ns]);
  const pkSeries = useMemo(() => {
    const out: { data: [number, number][]; color: string; label: string; width?: number; dash?: string; scatter?: boolean; radius?: number }[] = [];
    const ks = Array.from({ length: 80 }, (_, i) => 10 ** (-2 + (i / 79) * 1.3));
    const amp2 = amp * amp;
    out.push({ data: ks.map((k) => [k, amp2 * Plin(k)]), color: '#e2e8f0', label: tx({ vi: 'Tuyến tính (EH98)', en: 'Linear (EH98)' }), width: 1.6 });
    if (los >= 0) out.push({ data: ks.map((k) => [k, amp2 * kaiserMonopole(f) * Plin(k)]), color: '#94a3b8', label: 'Kaiser', dash: '5 4', width: 1.3 });
    const pk = derived?.pk;
    if (pk) {
      out.push({ data: pk.k.map((k, i) => [k, pk.Pm[i]]), color: '#60a5fa', label: tx({ vi: 'Vật chất (đo)', en: 'Matter (measured)' }), scatter: true, radius: 3.2 });
      if (pk.Ph && showH) out.push({ data: pk.k.map((k, i) => [k, pk.Ph![i]]), color: '#fde047', label: tx({ vi: 'Quầng', en: 'Halos' }), scatter: true, radius: 2.6 });
      if (pk.Pg && showG) out.push({ data: pk.k.map((k, i) => [k, pk.Pg![i]]), color: '#f9a8d4', label: tx({ vi: 'Thiên hà', en: 'Galaxies' }), scatter: true, radius: 2.6 });
    }
    return out;
  }, [derived, amp, Plin, los, f, showH, showG, tx]);
  const V = BOX ** 3;
  const bias = useMemo(() => {
    const pk = derived?.pk;
    if (!pk || !pk.Ph || !derived) return NaN;
    const sel = pk.k.map((k, i) => i).filter((i) => pk.k[i] < 0.08);
    const shot = V / derived.nHalo;
    const r = sel.map((i) => Math.max(0, pk.Ph![i] - shot) / pk.Pm[i]).filter((x) => x > 0);
    return r.length ? Math.sqrt(r.reduce((s, x) => s + x, 0) / r.length) : NaN;
  }, [derived, V]);

  const mPart = RHO_CRIT_H2 * om * V / (N * N * N);
  const nExp = derived ? hodExpected(derived.haloM, derived.nHalo, hod) : NaN;
  const togglePlay = () => { if (aRef.current >= A1 - 1e-6) aRef.current = A0; setPlaying((x) => !x); };

  return (
    <SimLayout
      id="f6"
      lesson={lesson}
      card={card}
      caption={<><span className="k">a = {fix(a, 3, lang)} · z = {fix(1 / a - 1, 2, lang)}</span> · Ω_m = {fix(om, 3, lang)} · σ₈ = {fix(s8, 3, lang)} · n_s = {fix(ns, 3, lang)} · {lpt === '2' ? '2LPT' : '1LPT'}{los >= 0 ? ` · ${tx({ vi: 'không gian dịch chuyển đỏ', en: 'redshift space' })} (${rsd})` : ''}</>}
      onTogglePlay={togglePlay}
      onReset={() => { setPlaying(false); setA(A1); }}
      timeline={<Timeline playing={playing} onToggle={togglePlay} label={<>a = {fix(a, 3, lang)}<small>z = {fix(1 / a - 1, 2, lang)} · D/D₀ = {fix(D, 3, lang)}</small></>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Thành phần vũ trụ', en: 'Universe ingredients' })} dot="var(--grpF)">
            <div className="row">{PRESETS.map((p) => (
              <button key={p.id} className={`btn small${Math.abs(om - p.om) < 1e-3 && Math.abs(ns - p.ns) < 1e-3 && (norm === 'As' ? Math.abs(asIn - p.as) < 1e-3 : Math.abs(s8In - p.s8) < 1e-3) ? ' active' : ''}`} onClick={() => { setOm(p.om); setNs(p.ns); if (norm === 'As') setAs(p.as); else setS8(p.s8); }}>{tx(p.name)}</button>
            ))}</div>
            <Segmented value={norm} onChange={setNorm} small options={[{ value: 'As', label: tx({ vi: 'Giữ A_s (theo CMB)', en: 'Fix A_s (CMB)' }) }, { value: 's8', label: tx({ vi: 'Giữ σ₈', en: 'Fix σ₈' }) }]} />
            <div className="field-hint"><MathText text={norm === 'As'
              ? tx({ vi: 'Biên độ nguyên thủy A_s được giữ cố định như phông nền vi sóng đo được: thêm vật chất thì hấp dẫn khuếch đại nhiễu loạn mạnh hơn, σ₈ tăng và mạng lưới vón cục hơn.', en: 'The primordial amplitude A_s is held fixed, as measured by the CMB: more matter means gravity amplifies the perturbations more, σ₈ rises and the web gets clumpier.' })
              : tx({ vi: 'σ₈ được giữ cố định: Ω_m chỉ đổi hình dạng phổ (tỉ lệ cấu trúc lớn so với cấu trúc nhỏ), nên thay đổi tinh tế hơn. Khảo sát thiên hà thường đo tổ hợp $S_8 = \\sigma_8(\\Omega_m/0{,}3)^{0{,}5}$.', en: 'σ₈ is held fixed: Ω_m only changes the spectral shape (large versus small structures), so the change is subtler. Galaxy surveys mostly measure the combination $S_8 = \\sigma_8(\\Omega_m/0.3)^{0.5}$.' })} /></div>
            <Slider label={tx({ vi: 'Mật độ vật chất Ω_m', en: 'Matter density Ω_m' })} value={om} min={0.1} max={0.6} step={0.005} onChange={setOm} display={fix(om, 3, lang)} hint={norm === 'As' ? tx({ vi: `σ₈ hôm nay = ${fix(s8, 3, lang)} - trường được dựng lại`, en: `σ₈ today = ${fix(s8, 3, lang)} - the field is rebuilt` }) : tx({ vi: 'Đổi hình dạng phổ và tốc độ tăng trưởng - trường được dựng lại', en: 'Changes the spectral shape and growth - the field is rebuilt' })} />
            {norm === 'As'
              ? <Slider label={tx({ vi: 'Biên độ nguyên thủy A_s (×10⁻⁹)', en: 'Primordial amplitude A_s (×10⁻⁹)' })} value={asIn} min={0.3} max={6} step={0.001} log onChange={setAs} display={fix(asIn, 3, lang)} hint={tx({ vi: 'Tại k = 0,05 Mpc⁻¹; Planck 2018: 2,099. σ₈ ∝ √A_s', en: 'At k = 0.05 Mpc⁻¹; Planck 2018: 2.099. σ₈ ∝ √A_s' })} />
              : <Slider label={tx({ vi: 'Độ “vón cục” σ₈', en: 'Clumpiness σ₈' })} value={s8In} min={0.3} max={1.5} step={0.005} onChange={setS8} display={fix(s8In, 3, lang)} hint={tx({ vi: 'Biên độ dao động trong cầu 8 Mpc/h hôm nay - áp dụng tức thì', en: 'Fluctuation amplitude in 8 Mpc/h spheres today - applied live' })} />}
            <Slider label={tx({ vi: 'Độ nghiêng phổ n_s', en: 'Spectral tilt n_s' })} value={ns} min={0.7} max={1.3} step={0.005} onChange={setNs} display={fix(ns, 3, lang)} hint={tx({ vi: '< 1 ưu tiên cấu trúc lớn, > 1 ưu tiên cấu trúc nhỏ', en: '< 1 favours large structures, > 1 small ones' })} />
            <Slider label={tx({ vi: 'Hệ số tỉ lệ a', en: 'Scale factor a' })} value={a} min={A0} max={A1} step={0.001} onChange={(v) => { setPlaying(false); setA(v); }} display={`a = ${fix(a, 3, lang)} · z = ${fix(1 / a - 1, 2, lang)}`} />
          </Section>
          <Section title={tx({ vi: 'Hiển thị', en: 'View' })}>
            <Segmented value={col} onChange={setCol} options={[{ value: 'density', label: tx({ vi: 'Màu theo mật độ', en: 'Density colours' }) }, { value: 'web', label: tx({ vi: 'Kiểu cấu trúc', en: 'Web type' }) }]} small />
            {col === 'web' && <div className="row" style={{ gap: 12, fontSize: 12 }}>{[tx({ vi: 'khoảng trống', en: 'void' }), tx({ vi: 'tấm', en: 'sheet' }), tx({ vi: 'sợi', en: 'filament' }), tx({ vi: 'nút', en: 'node' })].map((s, i) => <span key={i}><span className="swatch" style={{ background: WEB_COL[i], display: 'inline-block', width: 9, height: 9, borderRadius: 9, marginRight: 5 }} />{s}</span>)}</div>}
            <Toggle label={tx({ vi: 'Quầng vật chất tối (đỉnh mật độ)', en: 'Dark-matter halos (density peaks)' })} checked={showH} onChange={setShowH} swatch="#fde047" />
            <Toggle label={tx({ vi: 'Thiên hà (HOD)', en: 'Galaxies (HOD)' })} checked={showG} onChange={setShowG} swatch="#f9a8d4" />
            <Toggle label={tx({ vi: 'Khung hộp tuần hoàn', en: 'Periodic box outline' })} checked={showBox} onChange={setShowBox} />
            <Toggle label={tx({ vi: 'Tự xoay', en: 'Auto-rotate' })} checked={spin} onChange={setSpin} />
          </Section>
          <Section title={tx({ vi: 'Cấu hình mô phỏng', en: 'Simulation set-up' })}>
            <Segmented value={lpt} onChange={setLpt} options={[{ value: '1', label: tx({ vi: '1LPT (Zel’dovich)', en: '1LPT (Zel’dovich)' }) }, { value: '2', label: '2LPT' }]} small />
            <Segmented value={rsd} onChange={setRsd} options={[{ value: 'real', label: tx({ vi: 'Không gian thực', en: 'Real space' }) }, { value: 'x', label: 'LOS x' }, { value: 'y', label: 'LOS y' }, { value: 'z', label: 'LOS z' }]} small />
            <Segmented value={res} onChange={setRes} options={[{ value: '32', label: '32³' }, { value: '64', label: '64³' }, { value: '128', label: tx({ vi: '128³ (chậm)', en: '128³ (slow)' }) }]} small />
            <button className="btn small" onClick={() => setSeed(seed + 1)}>🎲 {tx({ vi: 'Vũ trụ khác (pha ngẫu nhiên mới)', en: 'New realisation (new phases)' })}</button>
            <div className="field-hint">{tx({ vi: `Pha ngẫu nhiên cố định (seed ${seed}): đổi tham số là so sánh vật lý, không phải so sánh may rủi.`, en: `Fixed random phases (seed ${seed}): changing a dial compares physics, not luck.` })}</div>
          </Section>
          <Section title={tx({ vi: 'Quầng & thiên hà', en: 'Halos & galaxies' })}>
            <Slider label="log M_min" value={lmin} min={13} max={14.8} step={0.01} onChange={setLmin} display={fix(lmin, 2, lang)} hint={tx({ vi: 'Khối lượng quầng để có một thiên hà trung tâm (M☉/h)', en: 'Halo mass to host a central galaxy (M☉/h)' })} />
            <Slider label="log M_1" value={lm1} min={13.8} max={16} step={0.01} onChange={setLm1} display={fix(lm1, 2, lang)} hint={tx({ vi: 'Thang khối lượng có một thiên hà vệ tinh', en: 'Mass scale for one satellite' })} />
            <Slider label="α" value={alpha} min={0.4} max={2} step={0.01} onChange={setAlpha} display={fix(alpha, 2, lang)} hint={tx({ vi: 'Độ dốc số vệ tinh theo khối lượng', en: 'Satellite-count slope' })} />
            {student && <div className="eq-box"><Tex display tex={'\\langle N_{\\rm cen}\\rangle = \\tfrac12\\left[1 + \\operatorname{erf}\\!\\left(\\frac{\\log M - \\log M_{\\min}}{\\sigma_{\\log M}}\\right)\\right]'} /><Tex display tex={'\\langle N_{\\rm sat}\\rangle = \\langle N_{\\rm cen}\\rangle\\left(\\frac{M - M_0}{M_1}\\right)^{\\alpha}'} /></div>}
            <Readouts>
              <Readout k={tx({ vi: 'Số quầng', en: 'Halos' })} v={derived && (showH || showG) ? fix(derived.nHalo, 0, lang) : '-'} frame={derived && derived.nHalo ? `${sci(derived.haloM[derived.nHalo - 1], 2)} – ${sci(derived.haloM[0], 2)} M☉/h` : undefined} />
              <Readout k={tx({ vi: 'Số thiên hà', en: 'Galaxies' })} v={derived && showG ? fix(derived.nGal, 0, lang) : '-'} frame={derived && showG ? tx({ vi: `${derived.nCen} trung tâm · ${derived.nSat} vệ tinh · kỳ vọng ${fix(nExp, 0, lang)}`, en: `${derived.nCen} central · ${derived.nSat} satellite · expected ${fix(nExp, 0, lang)}` }) : undefined} />
              <Readout k={tx({ vi: 'Độ lệch quầng b_h', en: 'Halo bias b_h' })} v={Number.isFinite(bias) && showH ? fix(bias, 2, lang) : '-'} frame={tx({ vi: 'k < 0,08 h/Mpc, đã trừ nhiễu Poisson', en: 'k < 0.08 h/Mpc, shot noise removed' })} />
            </Readouts>
          </Section>
          <Section title={tx({ vi: 'Phổ công suất P(k)', en: 'Power spectrum P(k)' })}>
            <ChartCard title={tx({ vi: 'P(k) [(Mpc/h)³]: đo từ hộp (chấm) và lý thuyết tuyến tính (đường)', en: 'P(k) [(Mpc/h)³]: measured in the box (dots) vs linear theory (line)' })}>
              <LineChart height={230} xLog yLog xDomain={[0.02, 0.85]} yDomain={[30, 1e5]} xLabel="k [h/Mpc]" yLabel="P(k)" legend series={pkSeries}
                hlines={derived && showH && derived.nHalo ? [{ y: V / derived.nHalo, color: '#fde04788', dash: '2 4', label: tx({ vi: 'nhiễu Poisson quầng', en: 'halo shot noise' }) }] : []} />
            </ChartCard>
            <div className="field-hint">{playing ? tx({ vi: 'P(k) đo lại khi dừng phát.', en: 'P(k) is re-measured when playback stops.' }) : tx({ vi: 'Ở k lớn, phổ đo cao hơn tuyến tính: đó là phi tuyến (2LPT) cộng làm mượt CIC và chồng phổ.', en: 'At high k the measured spectrum departs from linear: nonlinearity (2LPT) plus CIC smoothing and aliasing.' })}</div>
          </Section>
          <Section title={tx({ vi: 'Lát cắt 2D', en: '2D slice' })}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <canvas ref={sliceCanvas} style={{ width: '100%', height: '100%' }} role="img" aria-label={tx({ vi: 'Mật độ cột của lát dày 31 Mpc/h', en: 'Column density of a 31 Mpc/h slab' })} />
            </div>
            <div className="field-hint">{tx({ vi: 'Mật độ cột của lát dày 31,25 Mpc/h qua giữa hộp. Khi bật LOS z, lát được xoay để trục nhìn nằm dọc: cấu trúc bị nén theo trục này (hiệu ứng Kaiser).', en: 'Column density of a 31.25 Mpc/h slab through the box centre. With LOS z the slab is turned so the line of sight is vertical: structure is squashed along it (Kaiser effect).' })}</div>
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k="D(a)/D(1)" v={fix(D, 4, lang)} tone="accent" />
              <Readout k={tx({ vi: 'Tốc độ tăng trưởng f', en: 'Growth rate f' })} v={fix(f, 3, lang)} frame={`$\\Omega_m(a) = ${fix(omegaMa(om, a), 3, lang).replace(',', '{,}')}$`} />
              <Readout k={tx({ vi: 'σ₈ hôm nay', en: 'σ₈ today' })} v={fix(s8, 3, lang)} tone="accent" frame={`S₈ = ${fix(s8 * Math.sqrt(om / 0.3), 3, lang)}`} />
              <Readout k="σ₈(a)" v={fix(s8 * D, 3, lang)} />
              <Readout k="A_s" v={fix(asEquiv, 3, lang)} unit="× 10⁻⁹" frame={norm === 'As' ? tx({ vi: 'đặt trực tiếp', en: 'set directly' }) : tx({ vi: 'suy ra từ σ₈', en: 'implied by σ₈' })} />
              <Readout k={tx({ vi: 'Số hạt', en: 'Particles' })} v={fix(N * N * N, 0, lang)} frame={`${BOX} Mpc/h · ${tx({ vi: 'hộp tuần hoàn', en: 'periodic box' })}`} />
              <Readout k={tx({ vi: 'Khối lượng mỗi hạt', en: 'Mass per particle' })} v={sci(mPart, 2)} unit="M☉/h" />
              {los >= 0 && <Readout k={tx({ vi: 'Hệ số Kaiser', en: 'Kaiser factor' })} v={fix(kaiserMonopole(f), 3, lang)} frame="$1 + \tfrac23 f + \tfrac15 f^2$" />}
            </Readouts>
          </Section>
        </>
      }
    >
      <div className="fill">
        <Canvas camera={{ position: [250, 170, 330], fov: 45, near: 1, far: 4000 }} gl={{ preserveDrawingBuffer: true, antialias: true }} dpr={[1, 2]}>
          <color attach="background" args={['#020309']} />
          {fields && <WebPoints F={fields.cur} prev={fields.prev} live={live} dens={derived && derived.fieldId === fields.cur.id ? derived.dens : null} />}
          {derived && showH && derived.nHalo > 0 && <Markers pos={derived.haloPos} n={derived.nHalo} color="#fde047" size={9} opacity={0.75} />}
          {derived && showG && derived.nGal > 0 && <Markers pos={derived.galPos} n={derived.nGal} color="#f9a8d4" size={4.5} opacity={0.9} />}
          {showBox && <BoxFrame />}
          <OrbitControls makeDefault enablePan={false} minDistance={60} maxDistance={1200} autoRotate={spin} autoRotateSpeed={0.35} />
        </Canvas>
      </div>
      {col === 'density' && (
        <div className="stage-overlay tr">
          <div className="scale-note" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>ρ/ρ̄</span><span>0,25</span>
            <span style={{ width: 110, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1].map((x) => cmapCss('cosmic', x)).join(',')})` }} />
            <span>30</span>
          </div>
        </div>
      )}
      <div className="stage-overlay bl"><span className="scale-note">{building ? tx({ vi: 'Đang dựng trường ban đầu…', en: 'Building the initial field…' }) : tx({ vi: `${fix(N * N * N, 0, lang)} hạt · hộp ${BOX} Mpc/h · kéo để xoay, lăn để phóng`, en: `${fix(N * N * N, 0, lang)} particles · ${BOX} Mpc/h box · drag to rotate, scroll to zoom` })}</span></div>
    </SimLayout>
  );
}
