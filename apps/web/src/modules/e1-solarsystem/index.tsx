/**
 * E1 - Real-time 3D solar system: VSOP87 planets, the moons of the selected planet, IAU orientations, Celestia-style
 * lighting. See content.ts for the model card and NOTICE.md for the origin of the code derived from Celestia.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. Rendering adapted from Celestia (Copyright (C) 2001-2026, the Celestia
 * Development Team); see NOTICE.md.
 */
import { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  PLANETS, SATELLITES, SATELLITE_ERROR_DEG, SATELLITE_VALID_YEARS, planetState, modelDifferenceArcsec, stateToElements, MU_SUN_AU_DAY,
  iauOrientation, poleEcliptic, rotationPeriodHours, isRetrogradeRotator, satellitePosition, jdUtToTt, dateToJD, jdToDate, AU, C, type PlanetId, type SatelliteId,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Readout, Readouts, Segmented, Field, Toggle, Slider } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { useT, fix, fmt } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame } from '../../lib/hooks';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';
import { Scene } from './scene';
import { NAMES, type BodyId } from './look';

const AU_KM = AU / 1000;
const PLANET_IDS = PLANETS.map((p) => p.id) as string[];
const MOON_IDS = SATELLITES.map((s) => s.id) as string[];
const isBody = (s: string): s is BodyId => s === 'sun' || PLANET_IDS.includes(s) || MOON_IDS.includes(s);
const WITH_MOONS = ['earth', 'jupiter', 'saturn', 'uranus', 'neptune'];
const SUN_RADIUS_KM = 695_700;
const VALID_PLANET_YEARS: [number, number] = [1800, 2200];
const YEAR_LIMIT = 3000;

/** "2026-10-22 14:05" for any year (negative years with a minus sign). */
function fmtDateTime(jd: number): string {
  const d = jdToDate(jd);
  const y = d.getUTCFullYear();
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${y < 0 ? '−' : ''}${p(Math.abs(y), 4)}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
const yearOf = (jd: number) => 2000 + (jd - 2_451_545) / 365.25;
const norm = (v: readonly number[]) => Math.hypot(v[0], v[1], v[2]);

export default function SolarSystemModule() {
  const { t, tx, lang } = useT();
  const student = useLevelAtLeast('student');
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useParam('date', today);
  const [hour, setHour] = useParam('hour', 0, { min: 0, max: 24 });
  const [speed, setSpeed] = useParam('speed', 10);
  const [rev, setRev] = useParam('rev', false);
  const [dist, setDist] = useParam<'linear' | 'log'>('dist', 'log');
  const [size, setSize] = useParam<'big' | 'true'>('size', 'big');
  const [selRaw, setSel] = useParam('sel', 'earth');
  const [labels, setLabels] = useParam('labels', true);
  const [model, setModel] = useParam<'vsop87' | 'kepler'>('model', 'vsop87');
  const [moonsOn, setMoonsOn] = useParam('moons', true);
  const [trails, setTrails] = useParam('orbits', true);
  const [grid, setGrid] = useParam('grid', false);
  const [playing, setPlaying] = useState(false);
  const sel: BodyId = isBody(selRaw) ? selRaw : 'earth';

  const startJd = () => dateToJD(new Date(`${date}T00:00:00Z`)) + hour / 24;
  const tRef = useRef(startJd());
  const lastStart = useRef(`${date}|${hour}`);
  if (lastStart.current !== `${date}|${hour}`) { lastStart.current = `${date}|${hour}`; tRef.current = startJd(); }
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  useAnimationFrame((dt, now) => {
    if (playing) {
      const next = tRef.current + dt * speed * (rev ? -1 : 1);
      const lim = 2_451_545 + YEAR_LIMIT * 365.25;
      tRef.current = Math.max(2_451_545 - YEAR_LIMIT * 365.25, Math.min(lim, next));
    }
    if (now - lastUi.current > 150) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const jd = tRef.current;
  const year = yearOf(jd);
  const em = model === 'vsop87' ? 'vsop87' : 'kepler';
  const names = useMemo(() => Object.fromEntries((Object.keys(NAMES) as BodyId[]).map((k) => [k, tx(NAMES[k])])) as Record<BodyId, string>, [tx]);

  // ── quantities of the selection ───────────────────────────────────────────────────────────────
  const earth = planetState('earth', jd, em);
  const selPlanet = PLANET_IDS.includes(sel) ? (sel as PlanetId) : null;
  const selMoon = MOON_IDS.includes(sel) ? SATELLITES.find((s) => s.id === sel)! : null;
  const planetOf: PlanetId | null = selPlanet ?? (selMoon ? (selMoon.parent as PlanetId) : null);
  const pst = planetOf ? planetState(planetOf, jd, em) : null;
  const rSun = pst ? norm(pst.position) : 0;
  const dE = pst ? Math.hypot(pst.position[0] - earth.position[0], pst.position[1] - earth.position[1], pst.position[2] - earth.position[2]) : norm(earth.position);
  const lightMin = (dE * AU) / C / 60;
  const lon = pst ? ((Math.atan2(pst.position[1], pst.position[0]) * 180) / Math.PI + 360) % 360 : 0;
  const elong = (() => {
    if (!pst) return 0;
    const se = [-earth.position[0], -earth.position[1], -earth.position[2]], pe = [pst.position[0] - earth.position[0], pst.position[1] - earth.position[1], pst.position[2] - earth.position[2]];
    const c = (se[0] * pe[0] + se[1] * pe[1] + se[2] * pe[2]) / (norm(se) * norm(pe));
    return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
  })();
  const el = pst ? stateToElements(pst.position, pst.velocity, MU_SUN_AU_DAY) : null;
  const speedKms = pst ? (norm(pst.velocity) * AU_KM) / 86_400 : 0;
  const planetInfo = selPlanet ? PLANETS.find((p) => p.id === selPlanet)! : null;
  const orient = selPlanet ? iauOrientation(selPlanet, jdUtToTt(jd), jd) : null;
  const tilt = (() => {
    if (!selPlanet || !pst || !orient) return 0;
    const pole = poleEcliptic(orient);
    const h = [pst.position[1] * pst.velocity[2] - pst.position[2] * pst.velocity[1], pst.position[2] * pst.velocity[0] - pst.position[0] * pst.velocity[2], pst.position[0] * pst.velocity[1] - pst.position[1] * pst.velocity[0]];
    const a = (Math.acos((pole[0] * h[0] + pole[1] * h[1] + pole[2] * h[2]) / norm(h)) * 180) / Math.PI;
    return isRetrogradeRotator(selPlanet) ? 180 - a : a;
  })();
  const moonRel = selMoon ? satellitePosition(selMoon.id, jdUtToTt(jd)) : null;
  const moonDist = moonRel ? norm(moonRel) : 0;

  const outsidePlanets = year < VALID_PLANET_YEARS[0] || year > VALID_PLANET_YEARS[1];
  const outsideMoons = year < SATELLITE_VALID_YEARS[0] || year > SATELLITE_VALID_YEARS[1];
  const systemMoons = (selPlanet && WITH_MOONS.includes(selPlanet) ? SATELLITES.filter((s) => s.parent === selPlanet) : selMoon ? SATELLITES.filter((s) => s.parent === selMoon.parent) : []);
  const speeds = [
    { value: 1 / 1440, label: tx({ vi: '1 phút/s', en: '1 min/s' }) }, { value: 1 / 24, label: tx({ vi: '1 giờ/s', en: '1 h/s' }) },
    ...[1, 10, 30, 100, 365, 3650].map((s) => ({ value: s, label: `${s} ${t('days')}/s` })),
  ];

  const accuracy = model === 'vsop87'
    ? tx({ vi: 'VSOP87 · sai số vị trí ≤ 1,2″ (Thiên Vương 2,2″, Hải Vương 4,4″) trong 1800–2200', en: 'VSOP87 · position error ≤ 1.2″ (Uranus 2.2″, Neptune 4.4″) over 1800–2200' })
    : tx({ vi: 'Phần tử Kepler gần đúng (Standish) · sai số tới 9′ (Sao Thổ) trong 1800–2050', en: 'Approximate Keplerian elements (Standish) · error up to 9′ (Saturn) over 1800–2050' });

  return (
    <SimLayout
      id="e1"
      lesson={lesson}
      card={card}
      caption={sel === 'sun'
        ? <><span className="k">{names.sun}</span> · {fix(norm(earth.position), 4, lang)} au · {tx({ vi: 'ánh sáng tới Trái Đất', en: 'light to Earth' })} {fix(((norm(earth.position) * AU) / C) / 60, 2, lang)} {t('minutes')}</>
        : selMoon
          ? <><span className="k">{names[sel]}</span> · {fmt(moonDist, 0, lang)} km {tx({ vi: `cách ${names[selMoon.parent as PlanetId]}`, en: `from ${names[selMoon.parent as PlanetId]}` })} · P = {fix(selMoon.periodDays, 3, lang)} {t('days')}</>
          : <><span className="k">{names[sel]}</span> · {fix(rSun, 3, lang)} au · {tx({ vi: 'ánh sáng từ Trái Đất', en: 'light from Earth' })} {sel === 'earth' ? '-' : `${fix(lightMin, 1, lang)} ${t('minutes')}`}</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={
        <Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} onStep={(d) => { tRef.current += d * (speed >= 1 ? 30 : speed * 24 >= 1 ? 1 : 1 / 24); }} speed={speed} speeds={speeds} onSpeed={setSpeed}
          label={<>{fmtDateTime(jd)} <small>UTC · JD {fix(jd, 3, lang)}</small></>}>
          <button className="btn small" aria-pressed={rev} onClick={() => setRev(!rev)} title={tx({ vi: 'Đảo chiều thời gian', en: 'Reverse time' })}>{rev ? '◀' : '▶'} {tx({ vi: 'Đảo chiều', en: 'Reverse' })}</button>
          <button className="btn small" onClick={() => { const n = new Date(); setDate(today); setHour(Math.round((n.getUTCHours() + n.getUTCMinutes() / 60) * 4) / 4); tRef.current = dateToJD(Date.now()); }}>{t('now')}</button>
        </Timeline>
      }
      panel={
        <>
          <Section title={t('secDisplay')} dot="var(--grpE)">
            <Field label={t('date')}><input className="text-input" type="date" min="0001-01-01" max="2999-12-31" value={fmtDateTime(jd).slice(0, 10).replace('−', '-')} onChange={(e) => e.target.value && setDate(e.target.value)} /></Field>
            <Slider label={tx({ vi: 'Giờ (UTC)', en: 'Hour (UTC)' })} value={((((jd + 0.5) % 1) + 1) % 1) * 24} min={0} max={24} step={0.25} onChange={(h) => { setPlaying(false); setHour(Math.round(h * 4) / 4); }} display={fmtDateTime(jd).slice(11)} />
            <Segmented value={model} onChange={setModel} small ariaLabel={tx({ vi: 'Mô hình vị trí', en: 'Position model' })}
              options={[{ value: 'vsop87', label: 'VSOP87' }, { value: 'kepler', label: tx({ vi: 'Kepler gần đúng', en: 'Approx. Kepler' }) }]} />
            <Segmented value={dist} onChange={setDist} small options={[{ value: 'log', label: tx({ vi: 'Khoảng cách nén log', en: 'Log-compressed distances' }) }, { value: 'linear', label: tx({ vi: 'Tuyến tính (thật)', en: 'Linear (true)' }) }]} />
            <Segmented value={size} onChange={setSize} small options={[{ value: 'big', label: tx({ vi: 'Kích thước phóng đại', en: 'Exaggerated sizes' }) }, { value: 'true', label: t('trueScale') }]} />
            <Toggle label={tx({ vi: 'Nhãn', en: 'Labels' })} checked={labels} onChange={setLabels} />
            <Toggle label={tx({ vi: 'Quỹ đạo (mờ dần phía sau)', en: 'Orbits (fading behind)' })} checked={trails} onChange={setTrails} />
            <Toggle label={tx({ vi: 'Vệ tinh của hành tinh đang chọn', en: 'Moons of the selected planet' })} checked={moonsOn} onChange={setMoonsOn} />
            <Toggle label={tx({ vi: 'Lưới mặt phẳng hoàng đạo', en: 'Ecliptic-plane grid' })} checked={grid} onChange={setGrid} />
            {(dist === 'log' || size === 'big') && <div className="scale-note">⚠ {t('notToScale')}: {dist === 'log' ? tx({ vi: 'khoảng cách nén logarit', en: 'distances log-compressed' }) : ''}{dist === 'log' && size === 'big' ? ' · ' : ''}{size === 'big' ? tx({ vi: 'kích thước phóng đại', en: 'sizes exaggerated' }) : ''}</div>}
          </Section>
          <Section title={tx({ vi: 'Vật thể', en: 'Bodies' })}>
            <div className="row">
              <button className="btn small" style={{ borderColor: sel === 'sun' ? '#fde68a' : undefined, color: sel === 'sun' ? '#fde68a' : undefined }} onClick={() => setSel('sun')}>{names.sun}</button>
              {PLANETS.map((p) => <button key={p.id} className="btn small" style={{ borderColor: sel === p.id ? p.color : undefined, color: sel === p.id ? p.color : undefined }} onClick={() => setSel(p.id)}>{names[p.id]}</button>)}
            </div>
            {systemMoons.length > 0 && (
              <>
                <div className="field-hint" style={{ marginTop: 8 }}>{tx({ vi: `Vệ tinh của ${names[(selMoon ? selMoon.parent : selPlanet) as PlanetId]}`, en: `Moons of ${names[(selMoon ? selMoon.parent : selPlanet) as PlanetId]}` })}</div>
                <div className="row">
                  {systemMoons.map((m) => <button key={m.id} className="btn small" style={{ borderColor: sel === m.id ? '#cfe0ff' : undefined, color: sel === m.id ? '#cfe0ff' : undefined }} onClick={() => setSel(m.id)}>{names[m.id]}</button>)}
                </div>
              </>
            )}
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              {sel === 'sun' && (
                <>
                  <Readout k={tx({ vi: 'Cách Trái Đất', en: 'From Earth' })} v={fix(norm(earth.position), 4, lang)} unit="au" />
                  <Readout k={tx({ vi: 'Ánh sáng tới Trái Đất', en: 'Light time to Earth' })} v={fix(((norm(earth.position) * AU) / C) / 60, 2, lang)} unit={t('minutes')} />
                  <Readout k={tx({ vi: 'Đường kính góc', en: 'Angular diameter' })} v={fix(((2 * Math.asin(SUN_RADIUS_KM / (norm(earth.position) * AU_KM))) * 180 * 60) / Math.PI, 2, lang)} unit="′" />
                  <Readout k={tx({ vi: 'Bán kính', en: 'Radius' })} v={fmt(SUN_RADIUS_KM, 0, lang)} unit="km" />
                </>
              )}
              {selPlanet && planetInfo && pst && (
                <>
                  <Readout k={tx({ vi: 'Cách Mặt Trời', en: 'From the Sun' })} v={fix(rSun, 5, lang)} unit="au" />
                  <Readout k={tx({ vi: 'Cách Trái Đất', en: 'From Earth' })} v={selPlanet === 'earth' ? '-' : fix(dE, 5, lang)} unit={selPlanet === 'earth' ? '' : 'au'} />
                  <Readout k={tx({ vi: 'Thời gian ánh sáng từ Trái Đất', en: 'Light time from Earth' })} v={selPlanet === 'earth' ? '-' : lightMin > 90 ? fix(lightMin / 60, 2, lang) : fix(lightMin, 2, lang)} unit={selPlanet === 'earth' ? '' : lightMin > 90 ? t('hours') : t('minutes')} />
                  <Readout k={tx({ vi: 'Tốc độ quỹ đạo', en: 'Orbital speed' })} v={fix(speedKms, 3, lang)} unit="km/s" />
                  <Readout k={tx({ vi: 'Kinh độ hoàng đạo (nhật tâm)', en: 'Heliocentric ecliptic longitude' })} v={fix(lon, 3, lang)} unit="°" />
                  {selPlanet !== 'earth' && <Readout k={tx({ vi: 'Ly giác (từ Trái Đất)', en: 'Elongation (from Earth)' })} v={fix(elong, 2, lang)} unit="°" tone={elong > 150 ? 'good' : undefined} frame={elong > 150 ? tx({ vi: 'gần xung đối', en: 'near opposition' }) : elong < 20 ? tx({ vi: 'gần Mặt Trời', en: 'near the Sun' }) : undefined} />}
                  <Readout k={tx({ vi: 'Chu kỳ tự quay', en: 'Sidereal rotation' })} v={fmt(rotationPeriodHours(selPlanet), 5, lang)} unit={t('hours')} frame={isRetrogradeRotator(selPlanet) ? tx({ vi: 'quay ngược chiều', en: 'retrograde' }) : undefined} />
                  <Readout k={tx({ vi: 'Độ nghiêng trục', en: 'Axial tilt' })} v={fix(tilt, 2, lang)} unit="°" frame={orient ? `${tx({ vi: 'cực', en: 'pole' })} α₀ ${fix(orient.poleRaDeg, 2, lang)}° δ₀ ${fix(orient.poleDecDeg, 2, lang)}°` : undefined} />
                  {student && el && <Readout k={tx({ vi: 'Bán trục lớn a (tức thời)', en: 'Semi-major axis a (osculating)' })} v={fix(el.a, 5, lang)} unit="au" />}
                  {student && el && <Readout k="e" v={fix(el.e, 5, lang)} />}
                  {student && el && <Readout k="i" v={fix((el.i * 180) / Math.PI, 3, lang)} unit="°" />}
                  {student && <Readout k={tx({ vi: 'Bán kính', en: 'Radius' })} v={fmt(planetInfo.radiusKm, 0, lang)} unit="km" />}
                  {student && <Readout k={tx({ vi: 'Sai khác VSOP87 – Kepler', en: 'VSOP87 – Kepler difference' })} v={fix(modelDifferenceArcsec(selPlanet, jd), 1, lang)} unit="″" frame={tx({ vi: 'góc nhật tâm giữa hai mô hình', en: 'heliocentric angle between the two models' })} />}
                </>
              )}
              {selMoon && (
                <>
                  <Readout k={tx({ vi: `Cách ${names[selMoon.parent as PlanetId]}`, en: `From ${names[selMoon.parent as PlanetId]}` })} v={fmt(moonDist, 0, lang)} unit="km" />
                  <Readout k={tx({ vi: 'Chu kỳ quỹ đạo', en: 'Orbital period' })} v={fix(selMoon.periodDays, 4, lang)} unit={t('days')} />
                  <Readout k={tx({ vi: 'Bán kính', en: 'Radius' })} v={fmt(selMoon.radiusKm, 1, lang)} unit="km" />
                  <Readout k={tx({ vi: 'Sai số lý thuyết (đo với JPL Horizons)', en: 'Theory error (measured vs JPL Horizons)' })} v={`≤ ${fix(SATELLITE_ERROR_DEG[selMoon.id as SatelliteId], 2, lang)}`} unit="°" tone={SATELLITE_ERROR_DEG[selMoon.id as SatelliteId] > 0.5 ? undefined : 'good'} frame={tx({ vi: 'góc nhìn từ hành tinh, 1900–2100', en: 'as seen from the planet, 1900–2100' })} />
                  {student && <Readout k={tx({ vi: 'Cách Mặt Trời', en: 'From the Sun' })} v={fix(rSun, 4, lang)} unit="au" />}
                </>
              )}
            </Readouts>
            {(outsidePlanets || (selMoon && outsideMoons)) && (
              <div className="warn-box" style={{ marginTop: 8 }}>
                ⚠ {outsidePlanets
                  ? tx({ vi: 'Ngoài miền kiểm chứng 1800–2200: VSOP87 vẫn dùng được tới ±3000 năm nhưng sai số tăng (hành tinh trong ≲ 20″, Sao Mộc – Sao Thổ tới vài phút cung); mô hình Kepler chỉ hợp lệ 1800–2050.', en: 'Outside the validated range 1800–2200: VSOP87 stays usable to ±3000 years but the error grows (inner planets ≲ 20″, Jupiter and Saturn up to a few arcminutes); the Kepler model is valid for 1800–2050 only.' })
                  : tx({ vi: 'Các lý thuyết vệ tinh chỉ được kiểm chứng trong 1900–2100.', en: 'The satellite theories were checked for 1900–2100 only.' })}
              </div>
            )}
          </Section>
        </>
      }
    >
      <div className="fill">
        <Canvas camera={{ position: [0, 26, 34], fov: 50, near: 0.001, far: 5000 }} gl={{ preserveDrawingBuffer: true, antialias: true }} dpr={[1, 2]}>
          <color attach="background" args={['#02030a']} />
          <Scene tRef={tRef} dist={dist} size={size} model={em} selected={sel} onSelect={(id) => setSel(id)}
            showLabels={labels} showTrails={trails} showGrid={grid} showMoons={moonsOn} names={names} />
        </Canvas>
      </div>
      <div className="stage-overlay bl"><span className="scale-note">{accuracy} · {tx({ vi: 'kéo để xoay, lăn để phóng, bấm vật thể để theo dõi', en: 'drag to rotate, scroll to zoom, click a body to follow' })}</span></div>
    </SimLayout>
  );
}

