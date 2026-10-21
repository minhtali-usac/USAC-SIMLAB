import { useMemo, useRef, useState } from 'react';
import { clockRates, clockRatesGeoid, crossoverRadius, crossoverRadiusGeoid, poundRebkaShift, R_EARTH, GM_EARTH, C, G0 } from '@usac/sim-core';
import { drawGlobe, PLANET_TEX, type GlobeTex } from '../../lib/globe';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Toggle, Select } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, sci } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, drawBackgroundStars, withAlpha, label, disk, glowDisk, photoDisk } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

const ORBITS: Record<string, { name: { vi: string; en: string }; h: number }> = {
  iss: { name: { vi: 'Trạm ISS (420 km)', en: 'ISS (420 km)' }, h: 420 },
  gps: { name: { vi: 'GPS (20 184 km)', en: 'GPS (20,184 km)' }, h: 20183.6 },
  galileo: { name: { vi: 'Galileo (23 222 km)', en: 'Galileo (23,222 km)' }, h: 23222 },
  geo: { name: { vi: 'Địa tĩnh (35 786 km)', en: 'Geostationary (35,786 km)' }, h: 35786 },
};

export default function GpsModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [orbit, setOrbit] = useParam('orbit', 'gps');
  const [hKm, setH] = useParam('h', ORBITS[orbit]?.h ?? 20183.6, { min: 100, max: 400000 });
  const [rot, setRot] = useParam('rot', false);
  const [ground, setGround] = useParam<'geoid' | 'point'>('ground', 'geoid');
  const [tower, setTower] = useParam('tower', 22.5, { min: 0.01, max: 1000 });
  const [playing, setPlaying] = useState(true);
  const r = R_EARTH + hKm * 1000;
  const rates = ground === 'geoid' ? clockRatesGeoid(r) : clockRates(r, rot);
  const rCross = ground === 'geoid' ? crossoverRadiusGeoid() : crossoverRadius();
  const days = useRef(0);
  const angle = useRef(0);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  const periodH = (2 * Math.PI * Math.sqrt(r ** 3 / GM_EARTH)) / 3600;

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    drawBackgroundStars(ctx, w, h, pal, 3);
    const cx = w * 0.36, cy = h / 2;
    const maxR = Math.min(w * 0.33, h * 0.44);
    const sc = maxR / Math.max(r, R_EARTH * 1.5);
    const Re = R_EARTH * sc;
    // Earth
    const g = ctx.createRadialGradient(cx - Re * 0.3, cy - Re * 0.3, Re * 0.1, cx, cy, Re);
    g.addColorStop(0, '#60a5fa'); g.addColorStop(1, '#1e3a8a');
    // textured Earth turning once per sidereal day of simulated ground time
    if (!drawGlobe(ctx, 'earth_daymap', cx, cy, Re, { rotation: (days.current * 2 * Math.PI * 86400) / 86164.0905, tilt: 0.409, light: [-0.55, 0.45, 0.7], ambient: 0.1 })) { ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Re, 0, Math.PI * 2); ctx.fill(); }
    glowDisk(ctx, cx, cy, Re, 'rgba(96,165,250,0.18)', 1.08); // thin atmosphere rim
    // crossover shell
    ctx.setLineDash([3, 5]); ctx.strokeStyle = withAlpha(pal.sun, 0.55);
    ctx.beginPath(); ctx.arc(cx, cy, rCross * sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, `${fix(rCross / R_EARTH, 3, lang)} R⊕`, cx + rCross * sc * 0.72 + 4, cy - rCross * sc * 0.72, pal.sun, { size: 10.5 });
    ctx.strokeStyle = withAlpha(pal.gr, 0.6);
    ctx.beginPath(); ctx.arc(cx, cy, r * sc, 0, Math.PI * 2); ctx.stroke();
    const sx = cx + Math.cos(angle.current) * r * sc, sy = cy - Math.sin(angle.current) * r * sc;
    glowDisk(ctx, sx, sy, 5, pal.gr, 2.5);
    ctx.fillStyle = '#e8ecff'; ctx.fillRect(sx - 4, sy - 3, 8, 6);
    ctx.fillStyle = '#7c9cff'; ctx.fillRect(sx - 12, sy - 2, 7, 4); ctx.fillRect(sx + 5, sy - 2, 7, 4);
    disk(ctx, cx, cy - Re, 4, pal.sun);
    // clock faces
    const dial = (x: number, y: number, title: string, offsetUs: number, color: string) => {
      const R = Math.min(70, h * 0.13);
      ctx.fillStyle = withAlpha(color, 0.08); ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R * 0.86, y + Math.sin(a) * R * 0.86); ctx.lineTo(x + Math.cos(a) * R * 0.97, y + Math.sin(a) * R * 0.97); ctx.stroke(); }
      const a = -Math.PI / 2 + ((offsetUs / 100) % 1) * Math.PI * 2; // hand: 100 μs per turn
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * R * 0.8, y + Math.sin(a) * R * 0.8); ctx.stroke();
      label(ctx, title, x, y - R - 12, color, { align: 'center', size: 12, weight: 700 });
      label(ctx, `${offsetUs >= 0 ? '+' : '−'}${fix(Math.abs(offsetUs), 2, lang)} μs`, x, y + R + 16, color, { align: 'center', size: 13, mono: true, weight: 600 });
    };
    const dx = w * 0.82;
    dial(dx, h * 0.28, tx({ vi: 'Đồng hồ mặt đất', en: 'Ground clock' }), 0, pal.equator);
    dial(dx, h * 0.72, tx({ vi: 'Đồng hồ vệ tinh', en: 'Satellite clock' }), rates.netUsPerDay * days.current, pal.gr);
    label(ctx, tx({ vi: `sau ${fix(days.current, 2, lang)} ngày · kim: 100 μs/vòng`, en: `after ${fix(days.current, 2, lang)} days · hand: 100 μs/turn` }), dx, h - 12, pal.textFaint, { align: 'center', size: 10.5 });
  }, [pal, r, rates, tx, lang]);

  useAnimationFrame((dt, now) => {
    if (playing) { days.current += dt * 0.5; angle.current += dt * (24 / periodH) * 0.5 * Math.PI * 2 * 0.05; }
    redraw();
    if (now - lastUi.current > 150) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const curve = useMemo(() => {
    const gr: [number, number][] = [], sr: [number, number][] = [], net: [number, number][] = [];
    for (let k = 0; k <= 200; k++) {
      const hh = 10 ** (2 + (k / 200) * 3.6);
      const c = ground === 'geoid' ? clockRatesGeoid(R_EARTH + hh * 1000) : clockRates(R_EARTH + hh * 1000, rot);
      gr.push([hh, c.grUsPerDay]); sr.push([hh, c.srUsPerDay]); net.push([hh, c.netUsPerDay]);
    }
    return { gr, sr, net };
  }, [rot, ground]);

  return (
    <SimLayout
      id="d1"
      lesson={lesson}
      card={card}
      caption={<><span className="k">{rates.netUsPerDay >= 0 ? '+' : ''}{fix(rates.netUsPerDay, 2, lang)} μs/{tx({ vi: 'ngày', en: 'day' })}</span> = GR {fix(rates.grUsPerDay, 2, lang)} + SR {fix(rates.srUsPerDay, 2, lang)}</>}
      onReset={() => { days.current = 0; }}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>{fix(days.current, 2, lang)} {t('days')}<small>{tx({ vi: 'thời gian mặt đất', en: 'ground time' })}</small></>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Quỹ đạo', en: 'Orbit' })} dot="var(--grpD)">
            <Select value={orbit} onChange={(v) => { setOrbit(v); setH(ORBITS[v].h); }} options={Object.entries(ORBITS).map(([k, v]) => ({ value: k, label: tx(v.name) }))} />
            <Slider label={tx({ vi: 'Độ cao', en: 'Altitude' })} value={hKm} min={100} max={400000} log step={1} onChange={setH} display={`${fmt(hKm, 5, lang)} km`} />
            <Select label={tx({ vi: 'Đồng hồ tham chiếu mặt đất', en: 'Ground reference clock' })} value={ground} onChange={setGround} options={[{ value: 'geoid', label: tx({ vi: 'Trên geoid (IAU L_G) - chuẩn Ashby', en: 'On the geoid (IAU L_G) - Ashby standard' }) }, { value: 'point', label: tx({ vi: 'Trái Đất điểm khối (đơn giản)', en: 'Point-mass Earth (simple)' }) }]} />
            {ground === 'point' && <Toggle label={tx({ vi: 'Tính tự quay của đồng hồ mặt đất (xích đạo)', en: 'Include ground clock rotation (equator)' })} checked={rot} onChange={setRot} />}
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Tốc độ quỹ đạo', en: 'Orbital speed' })} v={fix(rates.orbitalSpeed / 1000, 3, lang)} unit="km/s" />
              <Readout k={tx({ vi: 'Chu kỳ', en: 'Period' })} v={fix(periodH, 2, lang)} unit={t('hours')} />
              <Readout k={tx({ vi: 'GR (hấp dẫn)', en: 'GR (gravity)' })} v={`+${fix(rates.grUsPerDay, 2, lang)}`} unit="μs/d" tone="good" />
              <Readout k={tx({ vi: 'SR (vận tốc)', en: 'SR (velocity)' })} v={fix(rates.srUsPerDay, 2, lang)} unit="μs/d" tone="bad" />
              <Readout wide k={tx({ vi: 'Ròng: vệ tinh so với mặt đất', en: 'Net: satellite vs ground' })} v={`${rates.netUsPerDay >= 0 ? '+' : ''}${fix(rates.netUsPerDay, 2, lang)}`} unit="μs/d" tone="accent" frame={tx({ vi: 'thời gian riêng của vệ tinh so với đồng hồ mặt đất', en: 'satellite proper time vs ground clock' })} />
              <Readout wide k={tx({ vi: 'Sai số vị trí nếu không hiệu chỉnh', en: 'Position error if uncorrected' })} v={fix((Math.abs(rates.net) * 86400 * C) / 1000, 2, lang)} unit="km/d" />
              {student && <Readout wide k={tx({ vi: 'Độ lệch tần số phải chỉnh', en: 'Frequency offset to apply' })} v={sci(-rates.net, 4)} />}
            </Readouts>
            {student && <div className="eq-box"><Tex display tex={ground === 'geoid' ? `\\frac{\\Delta\\tau}{\\tau} = L_G - \\frac{GM}{rc^2} - \\frac{v^2}{2c^2},\\quad L_G = \\frac{W_0}{c^2}` :'\\frac{\\Delta\\tau}{\\tau} = \\frac{GM}{c^2}\\Big(\\frac{1}{R_E}-\\frac{1}{r}\\Big) - \\frac{v^2 - v_g^2}{2c^2}'} /></div>}
            <ChartCard title={tx({ vi: 'Hiệu chỉnh theo độ cao', en: 'Correction vs altitude' })}>
              <LineChart height={190} xLog xLabel={tx({ vi: 'độ cao (km)', en: 'altitude (km)' })} yLabel="μs/d"
                series={[{ data: curve.gr, color: pal.ok, label: 'GR' }, { data: curve.sr, color: pal.danger, label: 'SR' }, { data: curve.net, color: pal.gr, label: tx({ vi: 'ròng', en: 'net' }), width: 2.4 }]}
                vlines={[{ x: hKm, color: pal.teal }, { x: (rCross - R_EARTH) / 1000, color: pal.sun, label: tx({ vi: 'điểm hoà', en: 'break-even' }) }]} hlines={[{ y: 0, color: pal.textFaint }]} />
            </ChartCard>
          </Section>
          <Section title={tx({ vi: 'Thí nghiệm Pound–Rebka', en: 'Pound–Rebka experiment' })} open={student}>
            <Slider label={tx({ vi: 'Chiều cao tháp', en: 'Tower height' })} value={tower} min={0.01} max={1000} log step={0.01} onChange={setTower} display={`${fmt(tower, 4, lang)} m`} />
            <Readouts>
              <Readout wide k="Δf/f = gh/c²" v={sci(poundRebkaShift(G0, tower), 3)} tone="accent" />
              <Readout wide k={tx({ vi: 'Đồng hồ ở trên nhanh hơn mỗi năm', en: 'Upper clock gains per year' })} v={fmt(poundRebkaShift(G0, tower) * 365.25 * 86400 * 1e9, 3, lang)} unit="ns" />
            </Readouts>
            <div className="field-hint">{tx({ vi: 'Đồng hồ quang học (Chou 2010) đo được chênh lệch chỉ với 33 cm độ cao.', en: 'Optical clocks (Chou 2010) detected the shift over just 33 cm.' })}</div>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label="GPS clocks" />
      <div className="stage-overlay bl"><span className="scale-note">{tx({ vi: 'Khoảng cách theo tỉ lệ thật; tốc độ hoạt ảnh không theo tỉ lệ', en: 'Distances to scale; animation speed not to scale' })}</span></div>
    </SimLayout>
  );
}
