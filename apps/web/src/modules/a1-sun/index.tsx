import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  sunPosition, sunHorizontal, sunEvents, moonHorizontal, moonPhase, equatorialToHorizontal, lmstDeg, dateToJD,
  BRIGHT_STARS, CONSTELLATION_LINES, bvToTemperature, blackbodyCss, formatHms, formatDms,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Toggle, Readout, Readouts, Select, Segmented, Field } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex } from '../../components/Tex';
import { useT, fix } from '../../i18n';
import { useParam, setParams } from '../../lib/router';
import { useAnimationFrame, usePalette } from '../../lib/hooks';
import { useLevelAtLeast } from '../../store/settings';
import { LOCATIONS, localParts, dateKey, localToUtcMs, jdLocalMidnight, jdToLocalHHMM, tzLabel, todayKey, nowMinutes, pad2 } from '../../lib/astroTime';
import { lesson, card } from './content';

const R = 10;
const DEG = Math.PI / 180;
/** Horizontal (alt, az) → scene coordinates: y up, North = −z, East = +x. */
const hv = (alt: number, az: number, r = R): [number, number, number] => [
  r * Math.cos(alt * DEG) * Math.sin(az * DEG), r * Math.sin(alt * DEG), -r * Math.cos(alt * DEG) * Math.cos(az * DEG),
];

interface SceneProps {
  lat: number; lon: number; tz: number; date: string;
  tRef: React.MutableRefObject<number>;
  showPath: boolean; showSeasons: boolean; showEquator: boolean; showAnalemma: boolean; showStars: boolean; showMoon: boolean;
  mode: 'orbit' | 'observer';
  labels: { n: string; e: string; s: string; w: string; zenith: string; ncp: string; scp: string; sun: string; moon: string; equator: string };
}

function pathFor(jd0: number, lat: number, lon: number): { above: [number, number, number][][]; below: [number, number, number][][] } {
  const above: [number, number, number][][] = [], below: [number, number, number][][] = [];
  let cur: [number, number, number][] = [];
  let curUp: boolean | null = null;
  for (let m = 0; m <= 1440; m += 4) {
    const h = sunHorizontal(jd0 + m / 1440, lat, lon, true);
    const up = h.alt >= 0;
    const p = hv(h.alt, h.az);
    if (curUp === null) curUp = up;
    if (up !== curUp) {
      cur.push(p);
      (curUp ? above : below).push(cur);
      cur = [p];
      curUp = up;
    } else cur.push(p);
  }
  if (cur.length > 1) (curUp ? above : below).push(cur);
  return { above, below };
}

function Scene(p: SceneProps) {
  const sun = useRef<THREE.Group>(null);
  const moon = useRef<THREE.Group>(null);
  const starsGeo = useRef<THREE.BufferGeometry>(null);
  const linesGeo = useRef<THREE.BufferGeometry>(null);
  const starsMat = useRef<THREE.PointsMaterial>(null);
  const linesMat = useRef<THREE.LineBasicMaterial>(null);
  const { scene } = useThree();
  const jd0 = jdLocalMidnight(p.date, p.tz);

  const today = useMemo(() => pathFor(jd0, p.lat, p.lon), [jd0, p.lat, p.lon]);
  const seasons = useMemo(() => {
    if (!p.showSeasons) return [];
    const y = Number(p.date.slice(0, 4));
    // equinox/solstice dates (approximate days; paths change slowly near these dates)
    return [
      { key: 'jun', color: '#fb923c', path: pathFor(jdLocalMidnight(`${y}-06-21`, p.tz), p.lat, p.lon) },
      { key: 'mar', color: '#4ade80', path: pathFor(jdLocalMidnight(`${y}-03-20`, p.tz), p.lat, p.lon) },
      { key: 'dec', color: '#60a5fa', path: pathFor(jdLocalMidnight(`${y}-12-21`, p.tz), p.lat, p.lon) },
    ];
  }, [p.showSeasons, p.date, p.tz, p.lat, p.lon]);
  const equator = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let H = 0; H <= 360; H += 3) {
      const h = equatorialToHorizontal({ ra: 0, dec: 0 }, p.lat, H);
      pts.push(hv(h.alt, h.az, R * 0.995));
    }
    return pts;
  }, [p.lat]);
  const analemma = useMemo(() => {
    if (!p.showAnalemma) return [];
    const minutes = localParts(p.tRef.current, p.tz).minutes;
    const y = Number(p.date.slice(0, 4));
    const pts: [number, number, number][] = [];
    for (let d = 0; d <= 366; d += 3) {
      const ms = Date.UTC(y, 0, 1) + d * 86_400_000 + (minutes - p.tz * 60) * 60_000;
      const h = sunHorizontal(dateToJD(ms), p.lat, p.lon, true);
      pts.push(hv(h.alt, h.az, R * 0.99));
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.showAnalemma, p.date, p.lat, p.lon, p.tz]);

  const dome = useMemo(() => {
    const rings: [number, number, number][][] = [];
    for (const alt of [30, 60]) rings.push(Array.from({ length: 73 }, (_, i) => hv(alt, i * 5, R * 1.001)));
    for (let az = 0; az < 360; az += 45) rings.push(Array.from({ length: 19 }, (_, i) => hv(i * 5, az, R * 1.001)));
    return rings;
  }, []);

  const starIdx = useMemo(() => new Map(BRIGHT_STARS.map((s, i) => [s.name, i])), []);
  const starColors = useMemo(() => {
    const arr = new Float32Array(BRIGHT_STARS.length * 3);
    BRIGHT_STARS.forEach((s, i) => {
      const c = new THREE.Color(blackbodyCss(bvToTemperature(s.bv)));
      arr.set([c.r, c.g, c.b], i * 3);
    });
    return arr;
  }, []);
  const linePairs = useMemo(() => CONSTELLATION_LINES.flatMap((c) => c.pairs).filter(([a, b]) => starIdx.has(a) && starIdx.has(b)), [starIdx]);

  const sky = useMemo(() => ({ night: new THREE.Color('#02040b'), twi: new THREE.Color('#1d2a55'), dusk: new THREE.Color('#3a4d8f'), day: new THREE.Color('#4f8fd6') }), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const jd = dateToJD(p.tRef.current);
    const sh = sunHorizontal(jd, p.lat, p.lon, true);
    sun.current?.position.set(...hv(sh.alt, sh.az, R * 0.985));
    if (moon.current) {
      const mh = moonHorizontal(jd, p.lat, p.lon, true);
      moon.current.position.set(...hv(mh.alt, mh.az, R * 0.97));
      moon.current.visible = p.showMoon;
    }
    // sky colour (illustrative)
    const a = sh.alt;
    if (a > 6) tmp.copy(sky.dusk).lerp(sky.day, Math.min(1, (a - 6) / 20));
    else if (a > -6) tmp.copy(sky.twi).lerp(sky.dusk, (a + 6) / 12);
    else if (a > -18) tmp.copy(sky.night).lerp(sky.twi, (a + 18) / 12);
    else tmp.copy(sky.night);
    scene.background = tmp;
    // stars
    const vis = p.showStars ? Math.max(0, Math.min(1, (-a - 2) / 10)) : 0;
    if (starsMat.current) starsMat.current.opacity = vis;
    if (linesMat.current) linesMat.current.opacity = vis * 0.35;
    if (vis > 0 && starsGeo.current) {
      const lst = lmstDeg(jd, p.lon);
      const pos = starsGeo.current.getAttribute('position') as THREE.BufferAttribute;
      BRIGHT_STARS.forEach((s, i) => {
        const h = equatorialToHorizontal(s, p.lat, lst);
        const v = hv(h.alt, h.az, R * 0.98);
        pos.setXYZ(i, v[0], v[1], v[2]);
      });
      pos.needsUpdate = true;
      if (linesGeo.current) {
        const lp = linesGeo.current.getAttribute('position') as THREE.BufferAttribute;
        linePairs.forEach(([a1, b1], k) => {
          lp.setXYZ(2 * k, pos.getX(starIdx.get(a1)!), pos.getY(starIdx.get(a1)!), pos.getZ(starIdx.get(a1)!));
          lp.setXYZ(2 * k + 1, pos.getX(starIdx.get(b1)!), pos.getY(starIdx.get(b1)!), pos.getZ(starIdx.get(b1)!));
        });
        lp.needsUpdate = true;
      }
    }
  });

  const L = p.labels;
  const lab = (text: string, pos: [number, number, number], color = '#cbd5ff', size = 12) => (
    <Html position={pos} center style={{ color, fontSize: size, fontWeight: 700, pointerEvents: 'none', textShadow: '0 0 4px #000', whiteSpace: 'nowrap', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{text}</Html>
  );
  const ncpAlt = p.lat;
  return (
    <>
      <ambientLight intensity={0.6} />
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[R, 96]} />
        <meshBasicMaterial color="#14301f" transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      <Line points={Array.from({ length: 121 }, (_, i) => hv(0, i * 3))} color="#f472b6" lineWidth={2} />
      {dome.map((r, i) => <Line key={i} points={r} color="#8ea2ff" lineWidth={0.6} transparent opacity={0.18} />)}
      {/* meridian */}
      <Line points={Array.from({ length: 37 }, (_, i) => hv(i * 5 <= 90 ? i * 5 : 180 - i * 5, i * 5 <= 90 ? 180 : 0))} color="#fb923c" lineWidth={1} transparent opacity={0.55} dashed dashSize={0.3} gapSize={0.2} />
      {p.showEquator && <Line points={equator} color="#60a5fa" lineWidth={1.4} transparent opacity={0.8} />}
      {p.showEquator && <mesh position={hv(ncpAlt, 0)}><sphereGeometry args={[0.12, 12, 12]} /><meshBasicMaterial color="#60a5fa" /></mesh>}
      {p.showPath && today.above.map((s, i) => <Line key={`a${i}`} points={s} color="#fbbf24" lineWidth={2.4} />)}
      {p.showPath && today.below.map((s, i) => <Line key={`b${i}`} points={s} color="#fbbf24" lineWidth={1.2} transparent opacity={0.35} dashed dashSize={0.25} gapSize={0.2} />)}
      {seasons.map((s) => [...s.path.above.map((seg, i) => <Line key={`${s.key}a${i}`} points={seg} color={s.color} lineWidth={1.3} transparent opacity={0.8} />), ...s.path.below.map((seg, i) => <Line key={`${s.key}b${i}`} points={seg} color={s.color} lineWidth={0.8} transparent opacity={0.25} />)])}
      {analemma.length > 1 && <Line points={analemma} color="#f9a8d4" lineWidth={1.6} />}
      {/* stars */}
      <points>
        <bufferGeometry ref={starsGeo}>
          <bufferAttribute attach="attributes-position" count={BRIGHT_STARS.length} array={new Float32Array(BRIGHT_STARS.length * 3)} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={BRIGHT_STARS.length} array={starColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial ref={starsMat} size={4} sizeAttenuation={false} vertexColors transparent opacity={0} depthWrite={false} />
      </points>
      <lineSegments>
        <bufferGeometry ref={linesGeo}>
          <bufferAttribute attach="attributes-position" count={linePairs.length * 2} array={new Float32Array(linePairs.length * 6)} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial ref={linesMat} color="#8ea2ff" transparent opacity={0} depthWrite={false} />
      </lineSegments>
      {/* sun & moon */}
      <group ref={sun}>
        <mesh><sphereGeometry args={[0.42, 24, 24]} /><meshBasicMaterial color="#fff2b0" /></mesh>
        <mesh><sphereGeometry args={[0.9, 24, 24]} /><meshBasicMaterial color="#fbbf24" transparent opacity={0.25} depthWrite={false} /></mesh>
        {lab(L.sun, [0, 0.95, 0], '#fde68a', 11)}
      </group>
      <group ref={moon}>
        <mesh><sphereGeometry args={[0.32, 24, 24]} /><meshBasicMaterial color="#e5e7eb" /></mesh>
        {lab(L.moon, [0, 0.7, 0], '#e5e7eb', 11)}
      </group>
      {lab(L.n, hv(0, 0, R * 1.07), '#f9a8d4', 15)}
      {lab(L.e, hv(0, 90, R * 1.07), '#f9a8d4', 15)}
      {lab(L.s, hv(0, 180, R * 1.07), '#f9a8d4', 15)}
      {lab(L.w, hv(0, 270, R * 1.07), '#f9a8d4', 15)}
      {lab(L.zenith, [0, R * 1.05, 0], '#cbd5ff', 11)}
      {p.showEquator && lab(ncpAlt >= 0 ? L.ncp : L.scp, hv(Math.abs(ncpAlt), ncpAlt >= 0 ? 0 : 180, R * 1.06), '#93c5fd', 11)}
      {p.showEquator && lab(L.equator, (() => { const h = equatorialToHorizontal({ ra: 0, dec: 0 }, p.lat, 0); return hv(h.alt, h.az, R * 1.03); })(), '#93c5fd', 10)}
      {/* observer */}
      <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.08, 0.12, 0.5, 12]} /><meshBasicMaterial color="#5eead4" /></mesh>
      {p.mode === 'orbit' ? (
        <OrbitControls key="orbit" target={[0, 2, 0]} minDistance={8} maxDistance={40} enablePan={false} />
      ) : (
        <OrbitControls key="obs" target={[0, 0.3, 0]} enableZoom={false} enablePan={false} rotateSpeed={-0.4} minDistance={0.01} maxDistance={0.01} />
      )}
      <CameraMode mode={p.mode} />
    </>
  );
}

function CameraMode({ mode }: { mode: 'orbit' | 'observer' }) {
  const { camera } = useThree();
  useEffect(() => {
    if (mode === 'orbit') { camera.position.set(7, 8, 18); (camera as THREE.PerspectiveCamera).fov = 45; }
    else { camera.position.set(0, 0.3, -0.01); (camera as THREE.PerspectiveCamera).fov = 80; }
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [mode, camera]);
  return null;
}

const SPEEDS = [1, 10, 60, 240, 1440, 10080];

export default function SunModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');

  const [loc, setLoc] = useParam('loc', 'hanoi');
  const preset = LOCATIONS.find((l) => l.id === loc);
  const [lat, setLat] = useParam('lat', preset?.lat ?? 21.0285, { min: -90, max: 90 });
  const [lon, setLon] = useParam('lon', preset?.lon ?? 105.8542, { min: -180, max: 180 });
  const [tz, setTz] = useParam('tz', preset?.tz ?? 7, { min: -12, max: 14 });
  const [date, setDate] = useParam('date', todayKey(preset?.tz ?? 7));
  const [min, setMin] = useParam('min', nowMinutes(preset?.tz ?? 7), { min: 0, max: 1439.99 });
  const [speed, setSpeed] = useParam('speed', 60);
  const [showPath, setShowPath] = useParam('path', true);
  const [showSeasons, setShowSeasons] = useParam('seasons', false);
  const [showEquator, setShowEquator] = useParam('eq', true);
  const [showAnalemma, setShowAnalemma] = useParam('ana', false);
  const [showStars, setShowStars] = useParam('stars', true);
  const [showMoon, setShowMoon] = useParam('moon', true);
  const [mode, setMode] = useParam<'orbit' | 'observer'>('view', 'orbit');
  const [playing, setPlaying] = useState(false);

  // when a preset is selected, apply its coordinates
  useEffect(() => {
    // presets supply the defaults, so explicit coordinates are cleared
    if (preset) setParams({ lat: null, lon: null, tz: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc]);

  const tRef = useRef(localToUtcMs(date, min, tz));
  useEffect(() => { tRef.current = localToUtcMs(date, min, tz); }, [date, min, tz]);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  const [curDate, setCurDate] = useState(date);

  useAnimationFrame((dt, now) => {
    if (playing) tRef.current += dt * speed * 60_000;
    if (now - lastUi.current > 125) {
      lastUi.current = now;
      const k = dateKey(localParts(tRef.current, tz));
      if (k !== curDate) setCurDate(k);
      setTick((x) => x + 1);
    }
  });
  useEffect(() => setCurDate(date), [date]);
  const togglePlay = () => {
    if (playing) {
      const lp = localParts(tRef.current, tz);
      setPlaying(false);
      setParams({ date: dateKey(lp), min: Math.round(lp.minutes) });
    } else setPlaying(true);
  };

  const jd = dateToJD(tRef.current);
  const sp = sunPosition(jd);
  const sh = sunHorizontal(jd, lat, lon, true);
  const jd0 = jdLocalMidnight(curDate, tz);
  const ev = useMemo(() => sunEvents(jd0, lat, lon), [jd0, lat, lon]);
  const lp = localParts(tRef.current, tz);
  const mp = moonPhase(jd);

  const altCurve = useMemo(() => {
    const pts: [number, number][] = [];
    for (let m = 0; m <= 1440; m += 10) pts.push([m / 60, sunHorizontal(jd0 + m / 1440, lat, lon, true).alt]);
    return pts;
  }, [jd0, lat, lon]);
  const year = Number(curDate.slice(0, 4));
  const dayLen = useMemo(() => {
    const pts: [number, number][] = [];
    for (let d = 0; d <= 365; d += 5) {
      const ms = Date.UTC(year, 0, 1) + d * 86_400_000 - tz * 3_600_000;
      pts.push([d, sunEvents(dateToJD(ms), lat, lon).dayLengthHours]);
    }
    return pts;
  }, [year, lat, lon, tz]);
  const doy = Math.floor((localToUtcMs(curDate, 0, 0) - Date.UTC(year, 0, 1)) / 86_400_000);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const offset = -new Date().getTimezoneOffset() / 60;
      setParams({ loc: 'custom', lat: +pos.coords.latitude.toFixed(4), lon: +pos.coords.longitude.toFixed(4), tz: offset, date: todayKey(offset), min: nowMinutes(offset) });
    });
  };
  const setNow = () => setParams({ date: todayKey(tz), min: nowMinutes(tz) });

  const labels = {
    n: tx({ vi: 'B', en: 'N' }), e: tx({ vi: 'Đ', en: 'E' }), s: tx({ vi: 'N', en: 'S' }), w: tx({ vi: 'T', en: 'W' }),
    zenith: tx({ vi: 'Thiên đỉnh', en: 'Zenith' }), ncp: tx({ vi: 'Cực Bắc trời', en: 'N. celestial pole' }), scp: tx({ vi: 'Cực Nam trời', en: 'S. celestial pole' }),
    sun: tx({ vi: 'Mặt Trời', en: 'Sun' }), moon: tx({ vi: 'Mặt Trăng', en: 'Moon' }), equator: tx({ vi: 'Xích đạo trời', en: 'Celestial equator' }),
  };

  return (
    <SimLayout
      id="a1"
      lesson={lesson}
      card={card}
      caption={<><span className="k">h☉ = {fix(sh.alt, 2, lang)}°</span> · A = {fix(sh.az, 1, lang)}° · δ = {fix(sp.dec, 2, lang)}° · h_max = 90° − |φ − δ| = {fix(90 - Math.abs(lat - sp.dec), 2, lang)}°</>}
      onTogglePlay={togglePlay}
      onReset={() => setPlaying(false)}
      timeline={
        <Timeline
          playing={playing}
          onToggle={togglePlay}
          onStep={(d) => { tRef.current += d * 3_600_000; }}
          speed={speed}
          onSpeed={setSpeed}
          speeds={SPEEDS.map((v) => ({ value: v, label: v < 60 ? `${v} ${t('minutes')}/s` : v < 1440 ? `${v / 60} ${t('hours')}/s` : `${v / 1440} ${t('days')}/s` }))}
          label={<>{dateKey(lp)} {pad2(Math.floor(lp.minutes / 60))}:{pad2(Math.floor(lp.minutes % 60))}<small>{tzLabel(tz)}</small></>}
        >
          <button className="btn small" onClick={setNow}>{t('now')}</button>
        </Timeline>
      }
      panel={
        <>
          <Section title={t('location')} dot="var(--grpA)">
            <Select value={preset ? loc : 'custom'} onChange={setLoc} options={[...LOCATIONS.map((l) => ({ value: l.id, label: tx(l.name) })), { value: 'custom', label: tx({ vi: 'Tuỳ chỉnh', en: 'Custom' }) }]} />
            <Slider label={t('latitude')} value={lat} min={-90} max={90} step={0.1} onChange={(v) => setParams({ lat: +v.toFixed(2), loc: 'custom' })} display={`${fix(lat, 2, lang)}°`} />
            {student && <Slider label={t('longitude')} value={lon} min={-180} max={180} step={0.1} onChange={(v) => setParams({ lon: +v.toFixed(2), loc: 'custom' })} display={`${fix(lon, 2, lang)}°`} />}
            {student && <Slider label={t('timezone')} value={tz} min={-12} max={14} step={0.5} onChange={(v) => setParams({ tz: v, loc: 'custom' })} display={tzLabel(tz)} />}
            <button className="btn small" onClick={useMyLocation}>📍 {t('useMyLocation')}</button>
          </Section>
          <Section title={t('secTime')}>
            <Field label={t('date')}>
              <input className="text-input" type="date" value={curDate} onChange={(e) => e.target.value && setDate(e.target.value)} />
            </Field>
            <Slider label={t('time')} value={lp.minutes} min={0} max={1439} step={1} onChange={(v) => { setPlaying(false); setParams({ date: curDate, min: Math.round(v) }); }} display={`${pad2(Math.floor(lp.minutes / 60))}:${pad2(Math.floor(lp.minutes % 60))}`} />
            <div className="row">
              {[['03-20', tx({ vi: 'Xuân phân', en: 'Mar equinox' })], ['06-21', tx({ vi: 'Hạ chí', en: 'Jun solstice' })], ['09-23', tx({ vi: 'Thu phân', en: 'Sep equinox' })], ['12-21', tx({ vi: 'Đông chí', en: 'Dec solstice' })]].map(([d, l]) => (
                <button key={d} className="btn small" onClick={() => setDate(`${year}-${d}`)}>{l}</button>
              ))}
            </div>
          </Section>
          <Section title={t('secDisplay')}>
            <Segmented value={mode} onChange={setMode} options={[{ value: 'orbit', label: tx({ vi: 'Toàn cảnh thiên cầu', en: 'Celestial sphere' }) }, { value: 'observer', label: tx({ vi: 'Mắt người quan sát', en: 'Observer’s eye' }) }]} />
            <Toggle label={tx({ vi: 'Đường đi Mặt Trời hôm nay', en: 'Today’s Sun path' })} checked={showPath} onChange={setShowPath} swatch="var(--sun)" />
            <Toggle label={tx({ vi: 'Hạ chí / phân / đông chí', en: 'Solstices / equinox' })} checked={showSeasons} onChange={setShowSeasons} swatch="#fb923c" />
            <Toggle label={tx({ vi: 'Xích đạo trời & cực trời', en: 'Celestial equator & pole' })} checked={showEquator} onChange={setShowEquator} swatch="var(--equator)" />
            <Toggle label={tx({ vi: 'Analemma (cùng giờ mỗi ngày)', en: 'Analemma (same clock time)' })} checked={showAnalemma} onChange={setShowAnalemma} swatch="#f9a8d4" />
            <Toggle label={tx({ vi: 'Sao sáng thật khi trời tối', en: 'Real bright stars at night' })} checked={showStars} onChange={setShowStars} swatch="#cbd5ff" />
            <Toggle label={tx({ vi: 'Mặt Trăng', en: 'Moon' })} checked={showMoon} onChange={setShowMoon} swatch="var(--moon)" />
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Độ cao Mặt Trời', en: 'Sun altitude' })} v={fix(sh.alt, 2, lang)} unit="°" tone={sh.alt > 0 ? 'good' : undefined} />
              <Readout k={tx({ vi: 'Phương vị', en: 'Azimuth' })} v={fix(sh.az, 1, lang)} unit="°" />
              <Readout k={tx({ vi: 'Mọc', en: 'Sunrise' })} v={jdToLocalHHMM(ev.rise, tz)} />
              <Readout k={tx({ vi: 'Lặn', en: 'Sunset' })} v={jdToLocalHHMM(ev.set, tz)} />
              <Readout k={tx({ vi: 'Giữa trưa thật', en: 'Solar noon' })} v={jdToLocalHHMM(ev.noon, tz)} />
              <Readout k={tx({ vi: 'Độ dài ngày', en: 'Day length' })} v={`${Math.floor(ev.dayLengthHours)}h${pad2(Math.round((ev.dayLengthHours % 1) * 60) % 60)}`} />
              <Readout k={tx({ vi: 'Độ cao giữa trưa', en: 'Noon altitude' })} v={fix(ev.noonAltitude, 2, lang)} unit="°" />
              <Readout k={tx({ vi: 'Xích vĩ δ', en: 'Declination δ' })} v={fix(sp.dec, 2, lang)} unit="°" />
              {student && <Readout k={tx({ vi: 'Xích kinh α', en: 'Right ascension α' })} v={formatHms(sp.ra / 15)} />}
              {student && <Readout k={tx({ vi: 'Phương trình thời gian', en: 'Equation of time' })} v={fix(sp.eotMinutes, 1, lang)} unit={t('minutes')} />}
              {student && <Readout k={tx({ vi: 'Giờ sao địa phương', en: 'Local sidereal time' })} v={formatHms(lmstDeg(jd, lon) / 15)} />}
              {student && <Readout k={tx({ vi: 'Khoảng cách Mặt Trời', en: 'Sun distance' })} v={fix(sp.distanceAu, 5, lang)} unit="au" />}
              <Readout wide k={tx({ vi: 'Mặt Trăng', en: 'Moon' })} v={`${fix(mp.illuminated * 100, 0, lang)}% · ${tx({ vi: 'tuổi', en: 'age' })} ${fix(mp.ageDays, 1, lang)} ${t('days')}`} />
            </Readouts>
            {student && <div className="eq-box"><Tex display tex={`h_{\\max} = 90° - |\\varphi - \\delta| = 90° - |${lat.toFixed(2)}° - (${sp.dec.toFixed(2)}°)| = ${(90 - Math.abs(lat - sp.dec)).toFixed(2)}°`} /></div>}
            <div className="field-hint">{tx({ vi: 'Vĩ độ', en: 'Latitude' })} {formatDms(lat)} · {tx({ vi: 'đã tính khúc xạ khí quyển', en: 'atmospheric refraction included' })}</div>
          </Section>
          <Section title={tx({ vi: 'Biểu đồ', en: 'Charts' })} open={student}>
            <ChartCard title={tx({ vi: 'Độ cao Mặt Trời trong ngày', en: 'Sun altitude through the day' })}>
              <LineChart height={150} xDomain={[0, 24]} xLabel={`${t('time')} (${tzLabel(tz)})`} yLabel="h (°)" series={[{ data: altCurve, color: pal.sun }]} hlines={[{ y: 0, color: pal.horizon, label: tx({ vi: 'chân trời', en: 'horizon' }) }]} vlines={[{ x: lp.minutes / 60, color: pal.teal }]} />
            </ChartCard>
            <ChartCard title={tx({ vi: `Độ dài ngày năm ${year}`, en: `Day length in ${year}` })}>
              <LineChart height={150} xDomain={[0, 365]} yDomain={[0, 24]} xLabel={tx({ vi: 'ngày trong năm', en: 'day of year' })} yLabel={t('hours')} series={[{ data: dayLen, color: pal.accent }]} vlines={[{ x: doy, color: pal.teal }]} hlines={[{ y: 12, color: pal.textFaint }]} />
            </ChartCard>
          </Section>
        </>
      }
    >
      <div className="fill">
        <Canvas camera={{ position: [7, 8, 18], fov: 45 }} gl={{ preserveDrawingBuffer: true, antialias: true }} dpr={[1, 2]}>
          <Scene lat={lat} lon={lon} tz={tz} date={curDate} tRef={tRef} showPath={showPath} showSeasons={showSeasons} showEquator={showEquator} showAnalemma={showAnalemma} showStars={showStars} showMoon={showMoon} mode={mode} labels={labels} />
        </Canvas>
      </div>
      <div className="stage-overlay tl">
        <div className="legend">
          <span><i style={{ background: 'var(--sun)' }} />{tx({ vi: 'Đường đi Mặt Trời (nét đứt: dưới chân trời)', en: 'Sun path (dashed: below horizon)' })}</span>
          <span><i style={{ background: 'var(--horizon)' }} />{tx({ vi: 'Chân trời', en: 'Horizon' })}</span>
          <span><i style={{ background: 'var(--meridian)' }} />{tx({ vi: 'Kinh tuyến (B–thiên đỉnh–N)', en: 'Meridian (N–zenith–S)' })}</span>
          {showEquator && <span><i style={{ background: 'var(--equator)' }} />{tx({ vi: 'Xích đạo trời', en: 'Celestial equator' })}</span>}
          {showSeasons && <span><i style={{ background: '#fb923c' }} />{tx({ vi: 'Hạ chí', en: 'June solstice' })} · <i style={{ background: '#4ade80', marginLeft: 6 }} />{tx({ vi: 'Phân', en: 'Equinox' })} · <i style={{ background: '#60a5fa', marginLeft: 6 }} />{tx({ vi: 'Đông chí', en: 'Dec solstice' })}</span>}
        </div>
      </div>
      <div className="stage-overlay tr"><span className="scale-note">{tx({ vi: 'Kích thước Mặt Trời/Mặt Trăng không theo tỉ lệ · màu trời minh hoạ', en: 'Sun/Moon sizes not to scale · illustrative sky colour' })}</span></div>
    </SimLayout>
  );
}
