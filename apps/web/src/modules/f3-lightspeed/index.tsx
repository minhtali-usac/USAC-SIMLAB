import { useMemo, useRef, useState } from 'react';
import {
  C, AU, LIGHT_YEAR, PARSEC, R_SUN, R_EARTH_MEAN, PLANETS, dateToJD, earthMoonLight, earthPlanetLight, sunPlanetAu, FAR_TARGETS, farTargetLight,
  type PlanetId,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Readout, Readouts, Select, Toggle } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, sci, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, label, withAlpha, disk, drawBackgroundStars } from '../../lib/canvas';
import { drawGlobe, PLANET_TEX, type GlobeTex } from '../../lib/globe';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

type Scene = 'moon' | 'inner' | 'outer' | 'stars' | 'galaxy';
const YEAR = LIGHT_YEAR / C; // s
const SPEEDS: { v: number; name: L }[] = [
  { v: 1, name: { vi: '1× (thời gian thực)', en: '1× (real time)' } },
  { v: 10, name: { vi: '10×', en: '10×' } },
  { v: 60, name: { vi: '1 phút / giây', en: '1 min / s' } },
  { v: 600, name: { vi: '10 phút / giây', en: '10 min / s' } },
  { v: 3600, name: { vi: '1 giờ / giây', en: '1 h / s' } },
  { v: 86400, name: { vi: '1 ngày / giây', en: '1 day / s' } },
  { v: YEAR, name: { vi: '1 năm / giây', en: '1 yr / s' } },
  { v: 1e3 * YEAR, name: { vi: '1 000 năm / giây', en: '1,000 yr / s' } },
  { v: 1e5 * YEAR, name: { vi: '100 000 năm / giây', en: '100,000 yr / s' } },
];
const DEFAULT_SPEED: Record<Scene, number> = { moon: 0, inner: 2, outer: 4, stars: 6, galaxy: 8 };
const NAMES: Record<string, L> = {
  earth: { vi: 'Trái Đất', en: 'Earth' }, moon: { vi: 'Mặt Trăng', en: 'Moon' }, sun: { vi: 'Mặt Trời', en: 'Sun' },
  mercury: { vi: 'Sao Thuỷ', en: 'Mercury' }, venus: { vi: 'Sao Kim', en: 'Venus' }, mars: { vi: 'Sao Hoả', en: 'Mars' }, jupiter: { vi: 'Sao Mộc', en: 'Jupiter' },
  saturn: { vi: 'Sao Thổ', en: 'Saturn' }, uranus: { vi: 'Sao Thiên Vương', en: 'Uranus' }, neptune: { vi: 'Sao Hải Vương', en: 'Neptune' },
  proxima: { vi: 'Proxima Centauri', en: 'Proxima Centauri' }, sirius: { vi: 'Sirius', en: 'Sirius' }, galacticCentre: { vi: 'Tâm Ngân Hà', en: 'Galactic Centre' },
  lmc: { vi: 'Đám Mây Magellan Lớn', en: 'Large Magellanic Cloud' }, andromeda: { vi: 'Thiên hà Andromeda', en: 'Andromeda Galaxy' },
};

/** Human-readable duration (no scientific notation below 10⁹ years). */
export function fmtDuration(s: number, lang: 'vi' | 'en'): string {
  const u = (vi: string, en: string) => (lang === 'vi' ? vi : en);
  if (s < 60) return `${fix(s, s < 10 ? 2 : 1, lang)} ${u('giây', 's')}`;
  if (s < 3600) { const m = Math.floor(s / 60); return `${m} ${u('phút', 'min')} ${Math.round(s - 60 * m)} ${u('giây', 's')}`; }
  if (s < 2 * 86400) { const h = Math.floor(s / 3600); return `${h} ${u('giờ', 'h')} ${Math.round((s - 3600 * h) / 60)} ${u('phút', 'min')}`; }
  if (s < YEAR) return `${fix(s / 86400, 1, lang)} ${u('ngày', 'days')}`;
  const y = s / YEAR;
  if (y < 1e9) return `${fmt(y, y < 100 ? 2 : 0, lang)} ${u('năm', 'yr')}`;
  return `${sci(y, 3, lang)} ${u('năm', 'yr')}`;
}

interface Obj { id: string; d: number; r: number; tex?: GlobeTex; color: string }

export default function LightSpeedModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [scene, setScene] = useParam<Scene>('s', 'moon');
  const [spIdx, setSpIdx] = useParam('sp', -1);
  const [roundTrip, setRoundTrip] = useParam('rt', false);
  const [playing, setPlaying] = useState(true);
  const tRef = useRef(0);
  const [, setTick] = useState(0);
  const last = useRef(0);
  const speedI = spIdx >= 0 ? spIdx : DEFAULT_SPEED[scene];
  const speed = SPEEDS[Math.min(SPEEDS.length - 1, speedI)].v;
  const jd = useMemo(() => dateToJD(Date.now()), []);

  // objects of the scene, distance from the source [m], radius [m]
  const objs: Obj[] = useMemo(() => {
    if (scene === 'moon') {
      const em = earthMoonLight(jd);
      return [{ id: 'earth', d: 0, r: R_EARTH_MEAN, tex: 'earth_daymap', color: '#5aa2ff' }, { id: 'moon', d: em.km * 1e3, r: 1737.4e3, tex: 'moon', color: '#cbd5e1' }];
    }
    if (scene === 'inner' || scene === 'outer') {
      const ids: PlanetId[] = scene === 'inner' ? ['mercury', 'venus', 'earth', 'mars'] : ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
      return [{ id: 'sun', d: 0, r: R_SUN, tex: 'sun' as GlobeTex, color: '#fde047' }, ...ids.map((id) => {
        const p = PLANETS.find((q) => q.id === id)!;
        return { id, d: sunPlanetAu(id, jd) * AU, r: p.radiusKm * 1e3, tex: PLANET_TEX[id], color: p.color };
      }).sort((a, b) => a.d - b.d)];
    }
    const pick = scene === 'stars' ? ['proxima', 'sirius'] : ['galacticCentre', 'lmc', 'andromeda'];
    return [{ id: 'sun', d: 0, r: R_SUN, tex: 'sun' as GlobeTex, color: '#fde047' }, ...pick.map((id) => ({ id, d: FAR_TARGETS.find((f) => f.id === id)!.pc * PARSEC, r: 0, color: id === 'sirius' ? '#bfdbfe' : id === 'proxima' ? '#fca5a5' : '#c4b5fd' }))];
  }, [scene, jd]);
  const target = objs[objs.length - 1];
  const tTarget = target.d / C;
  const tEnd = roundTrip && scene === 'moon' ? 2 * tTarget : tTarget;
  const logAxis = scene === 'galaxy';

  useAnimationFrame((dt, now) => {
    if (playing) {
      tRef.current += dt * speed;
      if (tRef.current >= tEnd) { tRef.current = tEnd; setPlaying(false); }
    }
    redraw();
    if (now - last.current > 100) { last.current = now; setTick((x) => x + 1); }
  });

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, '#03050c');
    drawBackgroundStars(ctx, w, h, pal, 11, 0.7);
    const x0 = 70, x1 = w - 70, cy = h * 0.5;
    const dMax = target.d;
    const lmin = Math.log10(1e2 * LIGHT_YEAR), lmax = Math.log10(dMax * 1.15);
    const X = (d: number) => (logAxis ? (d <= 0 ? x0 : x0 + Math.max(0, (Math.log10(d) - lmin) / (lmax - lmin)) * (x1 - x0)) : x0 + (d / dMax) * (x1 - x0));
    const pxPerM = (x1 - x0) / dMax;
    // axis
    ctx.strokeStyle = withAlpha(pal.fg, 0.12); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke();
    // bodies
    const placed: Record<string, [number, number][]> = {};
    objs.forEach((o, k) => {
      const x = X(o.d);
      const rTrue = logAxis ? 0 : o.r * pxPerM;
      const r = Math.max(rTrue, o.id === 'sun' ? 7 : 3.2);
      if (o.tex && r > 2.5) {
        if (o.id === 'sun') { const g = ctx.createRadialGradient(x, cy, r * 0.6, x, cy, r * 4); g.addColorStop(0, 'rgba(255,200,80,0.55)'); g.addColorStop(1, 'rgba(255,160,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, cy, r * 4, 0, 2 * Math.PI); ctx.fill(); }
        if (!drawGlobe(ctx, o.tex, x, cy, r, o.id === 'sun' ? { emissive: true } : { light: [-1, 0.15, 0.5], ambient: 0.1 })) disk(ctx, x, cy, r, o.color);
      } else {
        const g = ctx.createRadialGradient(x, cy, 0, x, cy, 10); g.addColorStop(0, o.color); g.addColorStop(1, withAlpha(o.color, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, cy, 10, 0, 2 * Math.PI); ctx.fill();
        disk(ctx, x, cy, 2.6, '#fff');
      }
      // label placement: alternate above/below, push to further tiers when boxes would overlap
      ctx.font = '700 12px Inter, system-ui, sans-serif';
      const name = tx(NAMES[o.id]), time = o.d > 0 ? fmtDuration(o.d / C, lang) : '';
      const half = Math.max(ctx.measureText(name).width, time.length * 6.6) / 2 + 6;
      let tier = 0, up = k % 2 === 0;
      for (let tries = 0; tries < 8; tries++) {
        const key = `${up ? 'u' : 'd'}${tier}`, boxes = placed[key] ?? (placed[key] = []);
        if (!boxes.some(([a, b]) => x + half > a && x - half < b)) { boxes.push([x - half, x + half]); break; }
        if (tries % 2 === 0) up = !up; else tier++;
      }
      const off = Math.max(r, 10) + 14 + tier * 34;
      const ty = up ? cy - off : cy + off + 8;
      if (tier > 0) { ctx.strokeStyle = withAlpha(pal.fg, 0.25); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, cy + (up ? -Math.max(r, 6) : Math.max(r, 6))); ctx.lineTo(x, ty + (up ? 4 : -12)); ctx.stroke(); }
      label(ctx, name, x, ty, pal.text, { size: 12, align: 'center', weight: 700, halo: '#03050c' });
      if (time) label(ctx, time, x, ty + (up ? -14 : 14), '#fde68a', { size: 11, align: 'center', mono: true, halo: '#03050c' });
    });
    // photon
    const tt = tRef.current, back = roundTrip && scene === 'moon' && tt > tTarget;
    const dPh = back ? Math.max(0, 2 * target.d - C * tt) : Math.min(target.d, C * tt);
    const xp = X(dPh);
    const trail = Math.min(140, Math.max(20, Math.abs(xp - X(0))));
    const tg = ctx.createLinearGradient(back ? xp + trail : xp - trail, cy, xp, cy);
    tg.addColorStop(0, 'rgba(255,240,180,0)'); tg.addColorStop(1, 'rgba(255,240,180,0.9)');
    ctx.strokeStyle = tg; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(back ? xp + trail : Math.max(X(0), xp - trail), cy); ctx.lineTo(xp, cy); ctx.stroke();
    const g = ctx.createRadialGradient(xp, cy, 0, xp, cy, 14); g.addColorStop(0, '#fffbe6'); g.addColorStop(0.3, 'rgba(255,230,140,0.8)'); g.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xp, cy, 14, 0, 2 * Math.PI); ctx.fill();
    // clock HUD
    label(ctx, tx({ vi: 'ánh sáng đã đi', en: 'light has travelled' }), 18, 26, pal.textDim, { size: 11 });
    label(ctx, fmtDuration(tt, lang), 18, 50, '#fde68a', { size: 22, weight: 700, mono: true });
    const distTxt = dPh < 1e9 ? `${fmt(dPh / 1e3, 0, lang)} km` : dPh < 0.1 * LIGHT_YEAR ? `${fix(dPh / AU, 3, lang)} au` : `${fmt(dPh / LIGHT_YEAR, dPh < 100 * LIGHT_YEAR ? 2 : 0, lang)} ${tx({ vi: 'năm ánh sáng', en: 'light-years' })}`;
    label(ctx, distTxt, 18, 70, pal.text, { size: 12, mono: true });
    // scale bar / axis note
    if (logAxis) {
      for (const ly of [1e3, 1e4, 1e5, 1e6]) { const x = X(ly * LIGHT_YEAR); ctx.strokeStyle = withAlpha(pal.fg, 0.2); ctx.beginPath(); ctx.moveTo(x, cy - 6); ctx.lineTo(x, cy + 6); ctx.stroke(); label(ctx, `${fmt(ly, 0, lang)} ${tx({ vi: 'năm as', en: 'ly' })}`, x, cy + 60, pal.textFaint, { size: 10, align: 'center' }); }
      label(ctx, tx({ vi: 'Trục logarit: mỗi vạch xa gấp 10 lần vạch trước', en: 'Logarithmic axis: each tick is 10× farther' }), w / 2, h - 16, pal.textFaint, { size: 11, align: 'center' });
    } else {
      label(ctx, tx({ vi: scene === 'moon' ? 'Kích thước và khoảng cách đúng tỉ lệ · khoảng cách hôm nay' : 'Khoảng cách theo tỉ lệ, đúng vị trí hôm nay · kích thước hành tinh phóng đại', en: scene === 'moon' ? 'Sizes and distance to scale · today’s distance' : 'Distances to scale, today’s positions · planet sizes enlarged' }), w / 2, h - 16, pal.textFaint, { size: 11, align: 'center' });
    }
  }, [objs, scene, roundTrip, pal, lang, tx, logAxis, target, tTarget]);

  const planetsToday = useMemo(() => (['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] as PlanetId[]).map((id) => ({ id, ...earthPlanetLight(id, jd) })), [jd]);
  const em = useMemo(() => earthMoonLight(jd), [jd]);
  const restart = () => { tRef.current = 0; setPlaying(true); };

  return (
    <SimLayout
      id="f3"
      lesson={lesson}
      card={card}
      caption={<><span className="k">{tx(NAMES[objs[0].id])} → {tx(NAMES[target.id])}</span> · {tx({ vi: 'thời gian ánh sáng', en: 'light time' })} {fmtDuration(tTarget, lang)}{roundTrip && scene === 'moon' ? ` · ${tx({ vi: 'khứ hồi', en: 'round trip' })} ${fmtDuration(2 * tTarget, lang)}` : ''}</>}
      onTogglePlay={() => { if (tRef.current >= tEnd) restart(); else setPlaying((x) => !x); }}
      onReset={restart}
      timeline={<Timeline playing={playing} onToggle={() => { if (tRef.current >= tEnd) restart(); else setPlaying((x) => !x); }} label={<>{fmtDuration(tRef.current, lang)}<small>{tx(SPEEDS[speedI].name)}</small></>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Hành trình', en: 'Journey' })} dot="var(--grpF)">
            <div className="row">{([
              ['moon', { vi: '🌙 Mặt Trăng', en: '🌙 Moon' }], ['inner', { vi: 'Hành tinh đá', en: 'Rocky planets' }], ['outer', { vi: 'Hệ Mặt Trời', en: 'Solar System' }],
              ['stars', { vi: '✦ Sao gần', en: '✦ Nearby stars' }], ['galaxy', { vi: 'Thiên hà', en: 'Galaxies' }]] as [Scene, L][]).map(([v, n]) => (
              <button key={v} className={`btn small${scene === v ? ' active' : ''}`} onClick={() => { setScene(v); setSpIdx(-1); tRef.current = 0; setPlaying(true); }}>{tx(n)}</button>
            ))}</div>
            <Select label={tx({ vi: 'Tốc độ phát', en: 'Playback speed' })} value={String(speedI)} onChange={(v) => setSpIdx(Number(v))} options={SPEEDS.map((s, i) => ({ value: String(i), label: tx(s.name) }))} />
            {scene === 'moon' && <Toggle label={tx({ vi: 'Khứ hồi (đo khoảng cách bằng laser)', en: 'Round trip (lunar laser ranging)' })} checked={roundTrip} onChange={(v) => { setRoundTrip(v); restart(); }} />}
            <button className="btn small" onClick={restart}>↺ {tx({ vi: 'Phát lại tia sáng', en: 'Fire the light again' })}</button>
            {student && <div className="eq-box"><Tex display tex={'t = \\frac{d}{c},\\qquad c = 299\\,792\\,458\\ \\text{m/s}'} /></div>}
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Khoảng cách tới đích', en: 'Distance to target' })} v={target.d < 1e10 ? fmt(target.d / 1e3, 0, lang) : target.d < 0.1 * LIGHT_YEAR ? fix(target.d / AU, 4, lang) : fmt(target.d / LIGHT_YEAR, target.d < 100 * LIGHT_YEAR ? 3 : 0, lang)} unit={target.d < 1e10 ? 'km' : target.d < 0.1 * LIGHT_YEAR ? 'au' : tx({ vi: 'năm ánh sáng', en: 'ly' })} tone="accent" wide />
              <Readout k={tx({ vi: 'Thời gian ánh sáng (một chiều)', en: 'One-way light time' })} v={fmtDuration(tTarget, lang)} />
              <Readout k={tx({ vi: 'Ánh sáng vòng quanh Trái Đất', en: 'Light around Earth' })} v={fix(C / 40_075_017, 2, lang)} unit={tx({ vi: 'vòng/giây', en: 'laps/s' })} frame={tx({ vi: 'chu vi xích đạo 40 075 km', en: 'equatorial circumference 40,075 km' })} />
              <Readout k={tx({ vi: 'Mặt Trăng hôm nay', en: 'Moon today' })} v={fix(em.seconds, 3, lang)} unit={tx({ vi: 'giây', en: 's' })} frame={`${fmt(em.km, 0, lang)} km`} />
            </Readouts>
          </Section>
          <Section title={tx({ vi: 'Tín hiệu tới các hành tinh hôm nay', en: 'Signals to the planets today' })}>
            <table className="data-table">
              <thead><tr><th>{tx({ vi: 'Hành tinh', en: 'Planet' })}</th><th>{tx({ vi: 'Cách Trái Đất', en: 'From Earth' })}</th><th>{tx({ vi: 'Một chiều', en: 'One way' })}</th></tr></thead>
              <tbody>{planetsToday.map((p) => <tr key={p.id}><td>{tx(NAMES[p.id])}</td><td>{fix(p.au, 3, lang)} au</td><td>{fmtDuration(p.seconds, lang)}</td></tr>)}</tbody>
            </table>
            <div className="field-hint">{tx({ vi: 'Vì vậy không thể lái xe tự hành trên Sao Hoả bằng tay theo thời gian thực: lệnh mất nhiều phút mới tới nơi.', en: 'This is why Mars rovers cannot be driven by hand in real time: commands take minutes to arrive.' })}</div>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label={tx({ vi: 'Tia sáng đi giữa các thiên thể', en: 'A light ray travelling between bodies' })} />
    </SimLayout>
  );
}
