import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  PLANETS, planetHeliocentric, planetElements, planetOrbitPath, BRIGHT_STARS, equatorialToEcliptic, OBLIQUITY_J2000_DEG,
  dateToJD, jdToDate, AU, GM_SUN, C, bvToTemperature, blackbodyCss, type PlanetId, type Vec3,
} from '@usac/sim-core';
import { Body3D } from '../../components/Body3D';
import { SkySphere } from '../../components/SkySphere';
import { PLANET_TEX } from '../../lib/globe';
import { SimLayout } from '../../components/SimLayout';
import { Section, Readout, Readouts, Segmented, Field, Toggle } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { useT, fix, fmt } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame } from '../../lib/hooks';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

const NAMES: Record<PlanetId, { vi: string; en: string }> = {
  mercury: { vi: 'Sao Thuỷ', en: 'Mercury' }, venus: { vi: 'Sao Kim', en: 'Venus' }, earth: { vi: 'Trái Đất', en: 'Earth' }, mars: { vi: 'Sao Hoả', en: 'Mars' },
  jupiter: { vi: 'Sao Mộc', en: 'Jupiter' }, saturn: { vi: 'Sao Thổ', en: 'Saturn' }, uranus: { vi: 'Sao Thiên Vương', en: 'Uranus' }, neptune: { vi: 'Sao Hải Vương', en: 'Neptune' },
};

const ecl2three = (v: Vec3, s = 1): [number, number, number] => [v[0] * s, v[2] * s, -v[1] * s];

function mapDist(v: Vec3, mode: 'linear' | 'log'): [number, number, number] {
  if (mode === 'linear') return ecl2three(v, 10);
  const r = Math.hypot(v[0], v[1], v[2]) || 1e-9;
  const rr = 16 * Math.log10(1 + r / 0.25);
  return ecl2three(v, rr / r);
}

interface SceneProps { tRef: React.MutableRefObject<number>; dist: 'linear' | 'log'; size: 'big' | 'true'; selected: PlanetId | null; onSelect: (id: PlanetId) => void; showLabels: boolean; names: Record<PlanetId, string>; sunName: string }

function Scene({ tRef, dist, size, selected, onSelect, showLabels, names, sunName }: SceneProps) {
  const refs = useRef<Record<string, THREE.Group | null>>({});
  const controls = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { camera } = useThree();
  const orbits = useMemo(() => PLANETS.map((p) => ({ id: p.id, color: p.color, pts: planetOrbitPath(p.id, tRef.current, 360).map((v) => mapDist(v, dist)) })), [dist]); // eslint-disable-line react-hooks/exhaustive-deps
  const stars = useMemo(() => {
    const pos = new Float32Array(BRIGHT_STARS.length * 3), col = new Float32Array(BRIGHT_STARS.length * 3);
    BRIGHT_STARS.forEach((s, i) => {
      const e = equatorialToEcliptic(s, OBLIQUITY_J2000_DEG);
      const l = (e.lon * Math.PI) / 180, b = (e.lat * Math.PI) / 180;
      pos.set(ecl2three([Math.cos(b) * Math.cos(l), Math.cos(b) * Math.sin(l), Math.sin(b)], 900), i * 3);
      const c = new THREE.Color(blackbodyCss(bvToTemperature(s.bv)));
      col.set([c.r, c.g, c.b], i * 3);
    });
    return { pos, col };
  }, []);
  const kmToScene = dist === 'linear' ? 10 / (AU / 1000) : 16 / 0.25 / Math.LN10 / (AU / 1000); // near-Sun slope for log mode
  const radius = (km: number, isSun = false) => (size === 'true' ? Math.max(km * kmToScene, 0.0005) : isSun ? 1.1 : 0.18 + 0.12 * Math.log10(km / 2000));
  const target = useMemo(() => new THREE.Vector3(), []);
  // fly-to: when the selection changes, ease the camera distance to a few planet radii (user zoom is free afterwards)
  const fly = useRef<{ id: string | null; frames: number }>({ id: null, frames: 0 });
  if (fly.current.id !== selected) fly.current = { id: selected, frames: 90 };

  useFrame(() => {
    const jd = tRef.current;
    for (const p of PLANETS) {
      const g = refs.current[p.id];
      if (g) g.position.set(...mapDist(planetHeliocentric(p.id, jd), dist));
    }
    if (controls.current) {
      if (selected && refs.current[selected]) target.copy(refs.current[selected]!.position);
      else target.set(0, 0, 0);
      controls.current.target.lerp(target, 0.08);
      if (fly.current.frames > 0) {
        fly.current.frames--;
        const p = PLANETS.find((x) => x.id === selected);
        const want = p ? Math.max(radius(p.radiusKm) * 7, 0.25) : 34;
        const off = camera.position.clone().sub(controls.current.target);
        const d = off.length();
        off.setLength(d + (want - d) * 0.07);
        camera.position.copy(controls.current.target).add(off);
      }
      controls.current.update();
    }
  });

  return (
    <>
      <Suspense fallback={null}><SkySphere radius={1500} /></Suspense>
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 0, 0]} intensity={2.2} decay={0} />
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={BRIGHT_STARS.length} array={stars.pos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={BRIGHT_STARS.length} array={stars.col} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={3} sizeAttenuation={false} vertexColors />
      </points>
      <Body3D tex="sun.jpg" radius={radius(695_700, true)} emissive fallback="#fff1b8" getSpin={() => (2 * Math.PI * tRef.current) / 25.38} />
      <mesh>
        <sphereGeometry args={[radius(695_700, true) * 1.8, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {showLabels && <Html position={[0, radius(695_700, true) + 0.6, 0]} center style={{ color: '#fde68a', fontSize: 12, fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap' }}>{sunName}</Html>}
      {orbits.map((o) => <Line key={o.id} points={o.pts} color={o.color} lineWidth={selected === o.id ? 1.8 : 0.9} transparent opacity={selected === o.id ? 0.9 : 0.38} />)}
      {PLANETS.map((p) => (
        <group key={p.id} ref={(g) => { refs.current[p.id] = g; }}>
          <group onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
            <Body3D tex={`${PLANET_TEX[p.id]}.jpg`} radius={radius(p.radiusKm)} tiltDeg={p.obliquityDeg} fallback={p.color}
              getSpin={() => (2 * Math.PI * tRef.current * 24) / p.rotationHours} clouds={p.id === 'earth'}
              ring={p.id === 'saturn' ? { inner: radius(p.radiusKm) * 1.24, outer: radius(p.radiusKm) * 2.27 } : null}
              onClick={(e) => { e.stopPropagation(); onSelect(p.id); }} />
          </group>
          {size === 'true' && <mesh onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}><sphereGeometry args={[0.12, 8, 8]} /><meshBasicMaterial color={p.color} transparent opacity={0.0} /></mesh>}
          {showLabels && <Html position={[0, radius(p.radiusKm) + 0.35, 0]} center style={{ color: p.color, fontSize: 11.5, fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 4px #000' }}>{names[p.id]}</Html>}
        </group>
      ))}
      <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={0.3} maxDistance={900} />
      <CamInit camera={camera} />
    </>
  );
}

function CamInit({ camera }: { camera: THREE.Camera }) {
  const done = useRef(false);
  if (!done.current) { camera.position.set(0, 26, 34); done.current = true; }
  return null;
}

export default function SolarSystemModule() {
  const { t, tx, lang } = useT();
  const student = useLevelAtLeast('student');
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useParam('date', today);
  const [speed, setSpeed] = useParam('speed', 10);
  const [dist, setDist] = useParam<'linear' | 'log'>('dist', 'log');
  const [size, setSize] = useParam<'big' | 'true'>('size', 'big');
  const [sel, setSel] = useParam('sel', 'earth');
  const [labels, setLabels] = useParam('labels', true);
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(dateToJD(new Date(`${date}T00:00:00Z`)));
  const lastDate = useRef(date);
  if (lastDate.current !== date) { lastDate.current = date; tRef.current = dateToJD(new Date(`${date}T00:00:00Z`)); }
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  useAnimationFrame((dt, now) => {
    if (playing) tRef.current += dt * speed;
    if (now - lastUi.current > 150) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const jd = tRef.current;
  const selId = (PLANETS.find((p) => p.id === sel)?.id ?? 'earth') as PlanetId;
  const pos = planetHeliocentric(selId, jd);
  const earth = planetHeliocentric('earth', jd);
  const rSun = Math.hypot(...pos);
  const dE = Math.hypot(pos[0] - earth[0], pos[1] - earth[1], pos[2] - earth[2]);
  const el = planetElements(selId, jd);
  const v = Math.sqrt(GM_SUN * (2 / (rSun * AU) - 1 / (el.a * AU))) / 1000;
  const lightMin = (dE * AU) / C / 60;
  const lon = ((Math.atan2(pos[1], pos[0]) * 180) / Math.PI + 360) % 360;
  const elong = (() => {
    const se = [-earth[0], -earth[1], -earth[2]], pe = [pos[0] - earth[0], pos[1] - earth[1], pos[2] - earth[2]];
    const c = (se[0] * pe[0] + se[1] * pe[1] + se[2] * pe[2]) / (Math.hypot(...se) * Math.hypot(...pe));
    return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
  })();
  const names = Object.fromEntries(PLANETS.map((p) => [p.id, tx(NAMES[p.id])])) as Record<PlanetId, string>;

  return (
    <SimLayout
      id="e1"
      lesson={lesson}
      card={card}
      caption={<><span className="k">{names[selId]}</span> · {fix(rSun, 3, lang)} au · {tx({ vi: 'ánh sáng từ Trái Đất', en: 'light from Earth' })} {selId === 'earth' ? '-' : `${fix(lightMin, 1, lang)} ${t('minutes')}`}</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={
        <Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} onStep={(d) => { tRef.current += d * 30; }} speed={speed} onSpeed={setSpeed}
          speeds={[1, 10, 30, 100, 365, 3650].map((s) => ({ value: s, label: `${s} ${t('days')}/s` }))}
          label={<>{jdToDate(jd).toISOString().slice(0, 10)}<small>JD {fix(jd, 2, lang)}</small></>}>
          <button className="btn small" onClick={() => { setDate(today); tRef.current = dateToJD(Date.now()); }}>{t('now')}</button>
        </Timeline>
      }
      panel={
        <>
          <Section title={t('secDisplay')} dot="var(--grpE)">
            <Field label={t('date')}><input className="text-input" type="date" min="1800-01-01" max="2050-12-31" value={jdToDate(jd).toISOString().slice(0, 10)} onChange={(e) => e.target.value && setDate(e.target.value)} /></Field>
            <Segmented value={dist} onChange={setDist} options={[{ value: 'log', label: tx({ vi: 'Khoảng cách nén log', en: 'Log-compressed distances' }) }, { value: 'linear', label: tx({ vi: 'Tuyến tính (thật)', en: 'Linear (true)' }) }]} small />
            <Segmented value={size} onChange={setSize} options={[{ value: 'big', label: tx({ vi: 'Kích thước phóng đại', en: 'Exaggerated sizes' }) }, { value: 'true', label: t('trueScale') }]} small />
            <Toggle label={tx({ vi: 'Nhãn', en: 'Labels' })} checked={labels} onChange={setLabels} />
            {(dist === 'log' || size === 'big') && <div className="scale-note">⚠ {t('notToScale')}: {dist === 'log' ? tx({ vi: 'khoảng cách nén logarit', en: 'distances log-compressed' }) : ''}{dist === 'log' && size === 'big' ? ' · ' : ''}{size === 'big' ? tx({ vi: 'kích thước phóng đại', en: 'sizes exaggerated' }) : ''}</div>}
          </Section>
          <Section title={tx({ vi: 'Hành tinh', en: 'Planet' })}>
            <div className="row">
              {PLANETS.map((p) => <button key={p.id} className="btn small" style={{ borderColor: sel === p.id ? p.color : undefined, color: sel === p.id ? p.color : undefined }} onClick={() => setSel(p.id)}>{names[p.id]}</button>)}
            </div>
            <Readouts>
              <Readout k={tx({ vi: 'Cách Mặt Trời', en: 'From the Sun' })} v={fix(rSun, 4, lang)} unit="au" />
              <Readout k={tx({ vi: 'Cách Trái Đất', en: 'From Earth' })} v={selId === 'earth' ? '-' : fix(dE, 4, lang)} unit={selId === 'earth' ? '' : 'au'} />
              <Readout k={tx({ vi: 'Thời gian ánh sáng từ Trái Đất', en: 'Light time from Earth' })} v={selId === 'earth' ? '-' : lightMin > 90 ? fix(lightMin / 60, 2, lang) : fix(lightMin, 1, lang)} unit={selId === 'earth' ? '' : lightMin > 90 ? t('hours') : t('minutes')} />
              <Readout k={tx({ vi: 'Tốc độ quỹ đạo', en: 'Orbital speed' })} v={fix(v, 2, lang)} unit="km/s" />
              <Readout k={tx({ vi: 'Kinh độ hoàng đạo (nhật tâm)', en: 'Heliocentric ecliptic longitude' })} v={fix(lon, 2, lang)} unit="°" />
              {selId !== 'earth' && <Readout k={tx({ vi: 'Ly giác (từ Trái Đất)', en: 'Elongation (from Earth)' })} v={fix(elong, 1, lang)} unit="°" tone={elong > 150 ? 'good' : undefined} frame={elong > 150 ? tx({ vi: 'gần xung đối', en: 'near opposition' }) : elong < 20 ? tx({ vi: 'gần Mặt Trời', en: 'near the Sun' }) : undefined} />}
              {student && <Readout k="a" v={fix(el.a, 5, lang)} unit="au" />}
              {student && <Readout k="e" v={fix(el.e, 5, lang)} />}
              {student && <Readout k="i" v={fix(el.I, 3, lang)} unit="°" />}
              {student && <Readout k={tx({ vi: 'Bán kính', en: 'Radius' })} v={fmt(PLANETS.find((p) => p.id === selId)!.radiusKm, 5, lang)} unit="km" />}
            </Readouts>
          </Section>
        </>
      }
    >
      <div className="fill">
        <Canvas camera={{ position: [0, 26, 34], fov: 50, near: 0.001, far: 5000 }} gl={{ preserveDrawingBuffer: true, antialias: true }} dpr={[1, 2]}>
          <color attach="background" args={['#02030a']} />
          <Scene tRef={tRef} dist={dist} size={size} selected={selId} onSelect={(id) => setSel(id)} showLabels={labels} names={names} sunName={tx({ vi: 'Mặt Trời', en: 'Sun' })} />
        </Canvas>
      </div>
      <div className="stage-overlay bl"><span className="scale-note">{tx({ vi: 'Vị trí thật theo JPL · kéo để xoay, lăn để phóng · bấm hành tinh để theo dõi', en: 'Real JPL positions · drag to rotate, scroll to zoom · click a planet to follow' })}</span></div>
    </SimLayout>
  );
}
