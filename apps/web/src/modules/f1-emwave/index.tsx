import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { C, jones, fields, intensity, photonEnergyEv, bandOf, wavelengthToRgb, EM_EXAMPLES, BAND_EDGES, type Polarisation, type Band } from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Segmented, Toggle } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, sci, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useCanvas2D, usePalette } from '../../lib/hooks';
import { label } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

const NS = 72, LAMBDA_D = 4, ZL = 3 * LAMBDA_D; // samples, displayed wavelength, displayed length
const BAND_NAME: Record<Band, L> = {
  gamma: { vi: 'Tia gamma', en: 'Gamma rays' }, xray: { vi: 'Tia X', en: 'X-rays' }, uv: { vi: 'Tử ngoại', en: 'Ultraviolet' }, visible: { vi: 'Ánh sáng nhìn thấy', en: 'Visible light' },
  ir: { vi: 'Hồng ngoại', en: 'Infrared' }, microwave: { vi: 'Vi sóng', en: 'Microwaves' }, radio: { vi: 'Sóng vô tuyến', en: 'Radio waves' },
};
const BAND_SHORT: Record<Band, L> = {
  gamma: { vi: 'γ', en: 'γ' }, xray: { vi: 'X', en: 'X' }, uv: { vi: 'UV', en: 'UV' }, visible: { vi: '', en: '' },
  ir: { vi: 'Hồng ngoại', en: 'Infrared' }, microwave: { vi: 'Vi sóng', en: 'Microwave' }, radio: { vi: 'Vô tuyến', en: 'Radio' },
};
const BAND_COL: Record<Band, string> = { gamma: '#e879f9', xray: '#a78bfa', uv: '#818cf8', visible: '#ffffff', ir: '#f87171', microwave: '#fb923c', radio: '#facc15' };
const EX_NAME: Record<string, L> = {
  fm: { vi: 'Đài FM', en: 'FM radio' }, hi21: { vi: 'Vạch 21 cm của hiđrô', en: 'Hydrogen 21 cm' }, wifi: { vi: 'Wi-Fi / lò vi sóng', en: 'Wi-Fi / microwave oven' },
  cmbpeak: { vi: 'Đỉnh phổ CMB', en: 'CMB peak' }, halpha: { vi: 'Vạch Hα', en: 'Hα line' }, green: { vi: 'Laser xanh lục', en: 'Green laser' },
  cuka: { vi: 'Tia X Cu Kα', en: 'Cu Kα X-ray' }, annih: { vi: 'Gamma 511 keV', en: '511 keV gamma' },
};

export function fmtFreq(f: number, lang: 'vi' | 'en') {
  const U: [number, string][] = [[1e18, 'EHz'], [1e15, 'PHz'], [1e12, 'THz'], [1e9, 'GHz'], [1e6, 'MHz'], [1e3, 'kHz'], [1, 'Hz']];
  if (f >= 1e21) return `${sci(f, 3, lang)} Hz`;
  const [s, u] = U.find(([v]) => f >= v) ?? [1, 'Hz'];
  return `${fmt(f / s, 4, lang)} ${u}`;
}
export function fmtLength(m: number, lang: 'vi' | 'en') {
  const U: [number, string][] = [[1e3, 'km'], [1, 'm'], [1e-2, 'cm'], [1e-3, 'mm'], [1e-6, 'µm'], [1e-9, 'nm'], [1e-12, 'pm']];
  const [s, u] = U.find(([v]) => m >= v * 0.9999) ?? [1e-12, 'pm'];
  return `${fmt(m / s, 4, lang)} ${u}`;
}

interface Live { j: { ex: number; ey: number; delta: number }; E0: number; speed: number; playing: boolean; showB: boolean; charge: boolean; color: string }

function Wave({ live, phase }: { live: React.MutableRefObject<Live>; phase: React.MutableRefObject<number> }) {
  const eSeg = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 6), 3)), []);
  const bSeg = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 6), 3)), []);
  const eTip = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 3), 3)), []);
  const bTip = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 3), 3)), []);
  const cone = useMemo(() => new THREE.ConeGeometry(0.07, 0.2, 10), []);
  const eTipLine = useMemo(() => new THREE.Line(eTip, new THREE.LineBasicMaterial({ color: '#fecaca' })), [eTip]);
  const bTipLine = useMemo(() => new THREE.Line(bTip, new THREE.LineBasicMaterial({ color: '#bfdbfe' })), [bTip]);
  const eHeads = useRef<THREE.InstancedMesh>(null), bHeads = useRef<THREE.InstancedMesh>(null), q = useRef<THREE.Mesh>(null);
  const m4 = useMemo(() => new THREE.Matrix4(), []), quat = useMemo(() => new THREE.Quaternion(), []), up = useMemo(() => new THREE.Vector3(0, 1, 0), []), dir = useMemo(() => new THREE.Vector3(), []), pos = useMemo(() => new THREE.Vector3(), []), one = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  useEffect(() => () => { eSeg.dispose(); bSeg.dispose(); eTip.dispose(); bTip.dispose(); cone.dispose(); }, [eSeg, bSeg, eTip, bTip, cone]);
  useFrame((_, dt) => {
    const l = live.current;
    if (l.playing) phase.current += Math.min(dt, 0.05) * 2 * Math.PI * l.speed;
    const ea = eSeg.attributes.position.array as Float32Array, ba = bSeg.attributes.position.array as Float32Array;
    const et = eTip.attributes.position.array as Float32Array, bt = bTip.attributes.position.array as Float32Array;
    const S = 1.6 / Math.max(1e-30, l.E0);
    for (let i = 0; i < NS; i++) {
      const zz = -ZL / 2 + (ZL * i) / (NS - 1), ph = (2 * Math.PI * zz) / LAMBDA_D - phase.current;
      const { E, B } = fields(l.j, ph);
      // scene axes: x → three x, y → three y, propagation z → three z
      const ex = E[0] * S, ey = E[1] * S, bx = B[0] * C * S, by = B[1] * C * S;
      ea.set([0, 0, zz, ex, ey, zz], 6 * i); ba.set([0, 0, zz, bx, by, zz], 6 * i);
      et.set([ex, ey, zz], 3 * i); bt.set([bx, by, zz], 3 * i);
      for (const [mesh, vx, vy] of [[eHeads.current, ex, ey], [bHeads.current, bx, by]] as const) {
        if (!mesh) continue;
        const len = Math.hypot(vx, vy);
        dir.set(vx, vy, 0).normalize(); quat.setFromUnitVectors(up, len > 1e-6 ? dir : up);
        pos.set(vx, vy, zz); m4.compose(pos, quat, len > 0.12 ? one : new THREE.Vector3(0, 0, 0)); mesh.setMatrixAt(i, m4);
      }
    }
    eSeg.attributes.position.needsUpdate = true; bSeg.attributes.position.needsUpdate = true; eTip.attributes.position.needsUpdate = true; bTip.attributes.position.needsUpdate = true;
    if (eHeads.current) eHeads.current.instanceMatrix.needsUpdate = true;
    if (bHeads.current) bHeads.current.instanceMatrix.needsUpdate = true;
    if (q.current) { const { E } = fields(l.j, -phase.current); q.current.position.set(-0.45 * E[0] * S, -0.45 * E[1] * S, -ZL / 2 - 1.2); q.current.visible = l.charge; }
    (eTipLine.material as THREE.LineBasicMaterial).color.set(l.color);
  });
  return (
    <group>
      <lineSegments geometry={eSeg}><lineBasicMaterial color="#f87171" transparent opacity={0.75} /></lineSegments>
      <primitive object={eTipLine} />
      <instancedMesh ref={eHeads} args={[cone, undefined, NS]}><meshBasicMaterial color="#f87171" /></instancedMesh>
      <group visible={live.current.showB}>
        <lineSegments geometry={bSeg}><lineBasicMaterial color="#60a5fa" transparent opacity={0.7} /></lineSegments>
        <primitive object={bTipLine} />
        <instancedMesh ref={bHeads} args={[cone, undefined, NS]}><meshBasicMaterial color="#60a5fa" /></instancedMesh>
      </group>
      <mesh ref={q}><sphereGeometry args={[0.16, 24, 16]} /><meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={0.6} /></mesh>
    </group>
  );
}

function Axes({ names }: { names: { e: string; b: string; k: string } }) {
  const axis = useMemo(() => new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -ZL / 2 - 0.5), new THREE.Vector3(0, 0, ZL / 2 + 1.2)]), new THREE.LineBasicMaterial({ color: '#fbbf24' })), []);
  return (
    <group>
      <primitive object={axis} />
      <mesh position={[0, 0, ZL / 2 + 1.3]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.12, 0.35, 16]} /><meshBasicMaterial color="#fbbf24" /></mesh>
      <Html position={[0, 0.3, ZL / 2 + 1.5]} center><span className="scene-tag" style={{ color: '#fbbf24' }}>{names.k}</span></Html>
      <Html position={[0, 2.0, -ZL / 2 + 0.3]} center><span className="scene-tag" style={{ color: '#f87171' }}>{names.e}</span></Html>
      <Html position={[2.0, 0, -ZL / 2 + 0.3]} center><span className="scene-tag" style={{ color: '#60a5fa' }}>{names.b}</span></Html>
      <gridHelper args={[ZL + 4, 16, '#1e293b', '#0f172a']} rotation={[0, 0, 0]} position={[0, -2.2, 0]} />
    </group>
  );
}

export default function EmWaveModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [ll, setLl] = useParam('ll', Math.log10(532e-9), { min: -12, max: 3 });
  const [pol, setPol] = useParam<Polarisation>('pol', 'linear');
  const [psiDeg, setPsiDeg] = useParam('psi', 90, { min: 0, max: 180 });
  const [ratio, setRatio] = useParam('r', 0.5, { min: 0, max: 1 });
  const [lE0, setLE0] = useParam('le', Math.log10(1012.6), { min: -3, max: 7 });
  const [speed, setSpeed] = useParam('v', 0.5, { min: 0.05, max: 2 });
  const [showB, setShowB] = useParam('b', true);
  const [charge, setCharge] = useParam('q', true);
  const [playing, setPlaying] = useState(true);
  const lambda = 10 ** ll, E0 = 10 ** lE0, f = C / lambda;
  const j = jones(pol, E0, (psiDeg * Math.PI) / 180, ratio);
  const band = bandOf(lambda), rgb = wavelengthToRgb(lambda);
  const waveCol = rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : BAND_COL[band];
  const live = useRef<Live>({ j, E0, speed, playing, showB, charge, color: waveCol });
  live.current = { j, E0, speed, playing, showB, charge, color: waveCol };
  const phase = useRef(0);
  const I = intensity(j.ex, j.ey), B0 = E0 / C;

  const { canvasRef: specRef } = useCanvas2D((ctx, { w, h }) => {
    ctx.clearRect(0, 0, w, h);
    const l0 = -12, l1 = 3, X = (lg: number) => 8 + ((lg - l0) / (l1 - l0)) * (w - 16), y0 = 20, bh = 22;
    let prev = l0;
    for (const [b, edge] of BAND_EDGES) {
      const lg1 = Math.min(l1, Math.log10(edge));
      if (b === 'visible') {
        const g = ctx.createLinearGradient(X(prev), 0, X(lg1), 0);
        for (let k = 0; k <= 8; k++) { const c = wavelengthToRgb(380e-9 + (k / 8) * 370e-9)!; g.addColorStop(k / 8, `rgb(${c[0]},${c[1]},${c[2]})`); }
        ctx.fillStyle = g;
      } else ctx.fillStyle = BAND_COL[b] + '55';
      ctx.fillRect(X(prev), y0, X(lg1) - X(prev), bh);
      const mid = (X(prev) + X(lg1)) / 2;
      if (X(lg1) - X(prev) > 14) label(ctx, tx(BAND_SHORT[b]), mid, y0 + bh + 13, pal.textDim, { size: 10, align: 'center' });
      prev = lg1;
    }
    for (const lg of [-12, -9, -6, -3, 0, 3]) label(ctx, fmtLength(10 ** lg, lang), X(lg), y0 - 6, pal.textFaint, { size: 10, align: lg === -12 ? 'left' : lg === 3 ? 'right' : 'center', mono: true });
    const xm = X(ll);
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(xm, y0 + bh + 1); ctx.lineTo(xm - 5, y0 + bh + 8); ctx.lineTo(xm + 5, y0 + bh + 8); ctx.fill();
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xm, y0 - 2); ctx.lineTo(xm, y0 + bh + 2); ctx.stroke();
  }, [ll, pal, lang, tx]);

  return (
    <SimLayout
      id="f1"
      lesson={lesson}
      card={card}
      caption={<><span className="k">λ = {fmtLength(lambda, lang)} · f = {fmtFreq(f, lang)}</span> · {tx(BAND_NAME[band])} · {tx({ vi: 'năng lượng photon', en: 'photon energy' })} {fmt(photonEnergyEv(lambda), 4, lang)} eV</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      onReset={() => { phase.current = 0; }}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>{tx({ vi: 'Quay chậm', en: 'Slow motion' })}<small>{tx({ vi: `chậm hơn thật ${sci(f / speed, 2, lang)} lần`, en: `${sci(f / speed, 2, lang)}× slower than real` })}</small></>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Bước sóng & nguồn', en: 'Wavelength & source' })} dot="var(--grpF)">
            <Slider label={tx({ vi: 'Bước sóng λ (thang log)', en: 'Wavelength λ (log scale)' })} value={ll} min={-12} max={3} step={0.001} onChange={setLl} display={fmtLength(lambda, lang)} />
            <div style={{ position: 'relative', width: '100%', height: 64 }}><canvas ref={specRef} style={{ width: '100%', height: '100%' }} role="img" aria-label={tx({ vi: 'Phổ điện từ', en: 'Electromagnetic spectrum' })} /></div>
            <div className="row">{EM_EXAMPLES.map((e) => <button key={e.id} title={e.source} className={`btn small${Math.abs(Math.log10(e.lambda) - ll) < 1e-3 ? ' active' : ''}`} onClick={() => setLl(Math.log10(e.lambda))}>{tx(EX_NAME[e.id])}</button>)}</div>
          </Section>
          <Section title={tx({ vi: 'Phân cực & biên độ', en: 'Polarisation & amplitude' })}>
            <Segmented value={pol} onChange={setPol} small options={[{ value: 'linear', label: tx({ vi: 'Thẳng', en: 'Linear' }) }, { value: 'circularL', label: tx({ vi: 'Tròn trái', en: 'Left circular' }) }, { value: 'circularR', label: tx({ vi: 'Tròn phải', en: 'Right circular' }) }, { value: 'elliptical', label: 'Elip' }]} />
            {pol === 'linear' && <Slider label={tx({ vi: 'Góc phân cực ψ', en: 'Polarisation angle ψ' })} value={psiDeg} min={0} max={180} step={1} onChange={setPsiDeg} display={`${fix(psiDeg, 0, lang)}°`} />}
            {pol === 'elliptical' && <Slider label={tx({ vi: 'Tỉ số trục E₀ᵧ/E₀ₓ', en: 'Axis ratio E₀ᵧ/E₀ₓ' })} value={ratio} min={0} max={1} step={0.01} onChange={setRatio} display={fix(ratio, 2, lang)} />}
            <Slider label={tx({ vi: 'Biên độ điện trường E₀', en: 'Electric amplitude E₀' })} value={lE0} min={-3} max={7} step={0.01} onChange={setLE0} display={`${fmt(E0, 4, lang)} V/m`} />
            <div className="row">
              <button className="btn small" onClick={() => setLE0(Math.log10(1012.6))}>☀ {tx({ vi: 'Nắng trưa (1361 W/m²)', en: 'Sunlight (1361 W/m²)' })}</button>
              <button className="btn small" onClick={() => setLE0(Math.log10(0.0274))}>📻 {tx({ vi: 'Sóng radio yếu (1 µW/m²)', en: 'Weak radio (1 µW/m²)' })}</button>
            </div>
          </Section>
          <Section title={tx({ vi: 'Hiển thị', en: 'View' })}>
            <Slider label={tx({ vi: 'Tốc độ quay chậm', en: 'Slow-motion rate' })} value={speed} min={0.05} max={2} step={0.01} onChange={setSpeed} display={`${fix(speed, 2, lang)} ${tx({ vi: 'chu kỳ/giây', en: 'cycles/s' })}`} />
            <Toggle label={tx({ vi: 'Hiện từ trường B (phóng đại c lần)', en: 'Show magnetic field B (scaled by c)' })} checked={showB} onChange={setShowB} swatch="#60a5fa" />
            <Toggle label={tx({ vi: 'Điện tích thử bị trường đẩy', en: 'Test charge pushed by the field' })} checked={charge} onChange={setCharge} swatch="#fde047" />
            {student && <div className="eq-box"><Tex display tex={'\\mathbf E = E_0\\cos(kz - \\omega t)\\,\\hat{\\mathbf x},\\qquad \\mathbf B = \\tfrac1c\\,\\hat{\\mathbf z}\\times\\mathbf E'} /><Tex display tex={'c = \\lambda f,\\quad E_\\gamma = hf,\\quad I = \\tfrac12 c\\varepsilon_0 E_0^2'} /></div>}
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Tần số f', en: 'Frequency f' })} v={fmtFreq(f, lang)} tone="accent" frame="$f = c/\lambda$" />
              <Readout k={tx({ vi: 'Chu kỳ', en: 'Period' })} v={`${sci(1 / f, 3, lang)} s`} />
              <Readout k={tx({ vi: 'Năng lượng photon', en: 'Photon energy' })} v={fmt(photonEnergyEv(lambda), 4, lang)} unit="eV" frame="$E = hf$" />
              <Readout k={tx({ vi: 'Vùng phổ', en: 'Band' })} v={tx(BAND_NAME[band])} frame={rgb ? <span style={{ display: 'inline-block', width: 40, height: 8, borderRadius: 4, background: waveCol }} /> : undefined} />
              <Readout k={tx({ vi: 'Biên độ từ trường B₀', en: 'Magnetic amplitude B₀' })} v={B0 >= 1e-6 ? `${fmt(B0 * 1e6, 4, lang)} µT` : `${fmt(B0 * 1e9, 4, lang)} nT`} frame="$B_0 = E_0/c$" />
              <Readout k={tx({ vi: 'Cường độ trung bình', en: 'Mean intensity' })} v={fmt(I, 4, lang)} unit="W/m²" />
            </Readouts>
          </Section>
        </>
      }
    >
      <div className="fill">
        <Canvas camera={{ position: [9, 5, 11], fov: 42 }} gl={{ preserveDrawingBuffer: true, antialias: true }} dpr={[1, 2]}>
          <color attach="background" args={['#04060f']} />
          <ambientLight intensity={0.6} /><pointLight position={[5, 6, 4]} intensity={40} />
          <Wave live={live} phase={phase} />
          <Axes names={{ e: tx({ vi: 'E (điện trường)', en: 'E (electric)' }), b: tx({ vi: 'B (từ trường)', en: 'B (magnetic)' }), k: tx({ vi: 'hướng truyền', en: 'propagation' }) }} />
          <OrbitControls makeDefault enablePan={false} minDistance={6} maxDistance={40} />
        </Canvas>
      </div>
      <div className="stage-overlay bl"><span className="scale-note">{tx({ vi: `Hình vẽ 3 bước sóng; λ thật = ${fmtLength(lambda, lang)} · kéo để xoay`, en: `Three wavelengths drawn; true λ = ${fmtLength(lambda, lang)} · drag to rotate` })}</span></div>
    </SimLayout>
  );
}
