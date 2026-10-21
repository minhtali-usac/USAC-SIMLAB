import { useMemo, useState } from 'react';
import {
  HZ_SYSTEMS, HZ_LIMITS, HZ_LIMIT_INFO, HZ_TEFF_RANGE, habitableZone, effectiveFlux, hzTeffStatus, hzClassify,
  equilibriumTemperature, insolation, mainSequence, blackbodyCss, type HzLimit, type HzClass, type HzPlanetMass,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Select, Segmented } from '../../components/Controls';
import { LineChart, ChartCard } from '../../components/LineChart';
import { useT, fix, fmt, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, drawBackgroundStars, withAlpha, label, disk, glowDisk } from '../../lib/canvas';
import { lesson } from './lesson';
import { card } from './card';

const LIMIT_META: Record<HzLimit, { name: L; short: L; color: string; assumption: L }> = {
  recentVenus: {
    name: { vi: 'Sao Kim gần đây (biên trong lạc quan)', en: 'Recent Venus (optimistic inner edge)' }, short: { vi: 'Kim gần đây', en: 'Recent Venus' }, color: '#fb923c',
    assumption: { vi: 'Thực nghiệm: Sao Kim không còn nước bề mặt từ ~1 tỉ năm trước.', en: 'Empirical: Venus has lacked surface water for ~1 Gyr.' },
  },
  runawayGreenhouse: {
    name: { vi: 'Nhà kính mất kiểm soát (biên trong bảo thủ)', en: 'Runaway greenhouse (conservative inner edge)' }, short: { vi: 'Mất kiểm soát', en: 'Runaway' }, color: '#4ade80',
    assumption: { vi: 'Hơi nước tích tụ đến khi đại dương bốc hơi hoàn toàn (H₂O chi phối).', en: 'Water vapour builds up until the oceans fully evaporate (H₂O-controlled).' },
  },
  maximumGreenhouse: {
    name: { vi: 'Nhà kính cực đại (biên ngoài bảo thủ)', en: 'Maximum greenhouse (conservative outer edge)' }, short: { vi: 'Nhà kính cực đại', en: 'Max greenhouse' }, color: '#22d3ee',
    assumption: { vi: 'Hiệu ứng nhà kính CO₂ cạnh tranh với tán xạ Rayleigh; vượt điểm này sự ấm lên không bù được thông lượng giảm.', en: 'CO₂ greenhouse warming competes with Rayleigh scattering; beyond this point warming cannot offset the reduced flux.' },
  },
  earlyMars: {
    name: { vi: 'Sao Hoả sơ khai (biên ngoài lạc quan)', en: 'Early Mars (optimistic outer edge)' }, short: { vi: 'Hoả sơ khai', en: 'Early Mars' }, color: '#60a5fa',
    assumption: { vi: 'Thực nghiệm: có nước lỏng trên Sao Hoả ~3,8 tỉ năm trước.', en: 'Empirical: liquid water on Mars ~3.8 Gyr ago.' },
  },
};

const CLASS_TEXT: Record<HzClass, L> = {
  conservative: { vi: 'Nằm trong vùng sinh sống bảo thủ theo mô hình', en: 'Inside the conservative habitable zone according to the model' },
  optimisticInner: { vi: 'Trong vùng lạc quan (phía trong), ngoài vùng bảo thủ', en: 'In the optimistic zone (inner side), outside the conservative zone' },
  optimisticOuter: { vi: 'Trong vùng lạc quan (phía ngoài), ngoài vùng bảo thủ', en: 'In the optimistic zone (outer side), outside the conservative zone' },
  tooMuchFlux: { vi: 'Ngoài dải thông lượng của vùng sinh sống đang xét (thông lượng cao hơn biên trong)', en: 'Outside the flux range of the habitable zone considered (flux above the inner edge)' },
  tooLittleFlux: { vi: 'Ngoài dải thông lượng của vùng sinh sống đang xét (thông lượng thấp hơn biên ngoài)', en: 'Outside the flux range of the habitable zone considered (flux below the outer edge)' },
};
const CLASS_SHORT: Record<HzClass, L> = {
  conservative: { vi: 'bảo thủ', en: 'conservative' }, optimisticInner: { vi: 'lạc quan (trong)', en: 'optimistic (inner)' },
  optimisticOuter: { vi: 'lạc quan (ngoài)', en: 'optimistic (outer)' }, tooMuchFlux: { vi: 'ngoài · S cao', en: 'out · high S' }, tooLittleFlux: { vi: 'ngoài · S thấp', en: 'out · low S' },
};
const toneOf = (c: HzClass) => (c === 'conservative' ? 'good' : c === 'tooMuchFlux' || c === 'tooLittleFlux' ? 'bad' : 'accent') as 'good' | 'bad' | 'accent';

export default function HabitableModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const [sys, setSys] = useParam('sys', 'sun');
  const [mstar, setMstar] = useParam('mstar', 1, { min: 0.1, max: 2 });
  const [dTest, setD] = useParam('d', 1, { min: 0.003, max: 20 });
  const [albedo, setAlbedo] = useParam('alb', 0.3, { min: 0, max: 0.95 });
  const [mpRaw, setMp] = useParam('mp', 1);
  const mp: HzPlanetMass = mpRaw === 0.1 || mpRaw === 5 ? mpRaw : 1;
  const [hover, setHover] = useState<{ x: number; y: number; k: HzLimit; flip: boolean } | null>(null);

  const isCustom = sys === 'custom';
  const S = HZ_SYSTEMS.find((s) => s.id === sys) ?? HZ_SYSTEMS[0];
  const ms = useMemo(() => mainSequence(mstar), [mstar]);
  const Lum = isCustom ? ms.L : S.L;
  const T = isCustom ? ms.teff : S.teff;
  const planets = isCustom ? [] : S.planets;
  const status = hzTeffStatus(T);
  const hz = useMemo(() => habitableZone(Lum, T, mp), [Lum, T, mp]);
  const seff = useMemo(() => Object.fromEntries(HZ_LIMITS.map((k) => [k, effectiveFlux(k, T, mp)])) as Record<HzLimit, number>, [T, mp]);
  const extent = Math.max(hz.earlyMars * 1.35, ...planets.map((p) => p.a * 1.12), dTest * 1.08);
  const d = dTest;

  const layout = (w: number) => ({ cx: w * 0.08, sc: (w * 0.88) / extent });

  const { canvasRef } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    drawBackgroundStars(ctx, w, h, pal, 31, 0.7);
    const { cx, sc } = layout(w);
    const cy = h * 0.46;
    const ring = (r0: number, r1: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy, r1 * sc, 0, Math.PI * 2); ctx.arc(cx, cy, r0 * sc, 0, Math.PI * 2, true); ctx.fill();
    };
    ring(hz.recentVenus, hz.runawayGreenhouse, withAlpha('#4ade80', 0.12));
    ring(hz.runawayGreenhouse, hz.maximumGreenhouse, withAlpha('#4ade80', 0.3));
    ring(hz.maximumGreenhouse, hz.earlyMars, withAlpha('#4ade80', 0.12));
    const col = blackbodyCss(T);
    glowDisk(ctx, cx, cy, 10, col, 4);
    disk(ctx, cx, cy, 9, col);
    // boundary markers along the axis, labelled directly
    const axisY = h - 30;
    HZ_LIMITS.forEach((k, i) => {
      const x = cx + hz[k] * sc;
      const m = LIMIT_META[k];
      ctx.strokeStyle = withAlpha(m.color, hover?.k === k ? 1 : 0.7); ctx.lineWidth = hover?.k === k ? 2 : 1;
      ctx.setLineDash(HZ_LIMIT_INFO[k].kind === 'optimistic' ? [4, 4] : []);
      ctx.beginPath(); ctx.moveTo(x, 24 + i * 15); ctx.lineTo(x, axisY); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      const right = i % 2 === 1;
      label(ctx, `${tx(m.short)} · ${fix(hz[k], 3, lang)} au`, x + (right ? 4 : -4), 20 + i * 15, m.color, { size: 10.5, align: right ? 'left' : 'right', weight: 700, halo: pal.bg });
    });
    for (const p of planets) {
      ctx.strokeStyle = withAlpha(pal.fg, 0.16);
      ctx.beginPath(); ctx.arc(cx, cy, p.a * sc, -0.5, 0.5); ctx.stroke();
      disk(ctx, cx + p.a * sc, cy, 4.5, '#93c5fd');
      label(ctx, p.n, cx + p.a * sc, cy - 12, '#cbd5ff', { size: 11, align: 'center', weight: 700, halo: pal.bg });
    }
    // test planet
    disk(ctx, cx + d * sc, cy + 40, 6, pal.teal);
    ctx.strokeStyle = withAlpha(pal.teal, 0.5); ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(cx + d * sc, cy + 30); ctx.lineTo(cx + d * sc, cy + 8); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, tx({ vi: 'hành tinh thử', en: 'test planet' }), cx + d * sc, cy + 58, pal.teal, { size: 11, align: 'center', halo: pal.bg });
    // axis
    ctx.strokeStyle = pal.axis; ctx.beginPath(); ctx.moveTo(cx, axisY); ctx.lineTo(w - 10, axisY); ctx.stroke();
    const step = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5].find((s) => extent / s < 10) ?? 5;
    for (let x = 0; x <= extent + 1e-9; x += step) { ctx.beginPath(); ctx.moveTo(cx + x * sc, axisY - 3); ctx.lineTo(cx + x * sc, axisY + 3); ctx.stroke(); label(ctx, `${+x.toFixed(3)}`, cx + x * sc, axisY + 16, pal.text, { size: 10.5, align: 'center', mono: true }); }
    label(ctx, tx({ vi: 'r (au) · khoảng cách theo tỉ lệ, kích thước sao/hành tinh không theo tỉ lệ', en: 'r (au) · distances to scale, star/planet sizes not to scale' }), w - 12, axisY - 8, pal.textFaint, { size: 10.5, align: 'right' });
    if (!status.inRange) label(ctx, tx({ vi: '⚠ CHỈ MINH HOẠ - T_eff ngoài dải hợp lệ', en: '⚠ ILLUSTRATION ONLY - T_eff outside valid range' }), w - 12, 20, '#fbbf24', { size: 12, align: 'right', weight: 700, halo: pal.bg });
  }, [pal, hz, extent, d, planets, T, tx, lang, hover, status.inRange]);

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const { cx, sc } = layout(rect.width);
    let best: HzLimit | null = null, bd = 9;
    for (const k of HZ_LIMITS) { const dx = Math.abs(cx + hz[k] * sc - x); if (dx < bd) { bd = dx; best = k; } }
    setHover(best ? { x, y: e.clientY - rect.top, k: best, flip: x > rect.width - 330 } : null);
  };

  const Teq = equilibriumTemperature(Lum, d, albedo);
  const Sd = insolation(Lum, d);
  const cls = hzClassify(Sd, T, mp);

  const chart = useMemo(() => HZ_LIMITS.map((k) => {
    const pts: [number, number][] = [];
    for (let Te = HZ_TEFF_RANGE[0]; Te <= HZ_TEFF_RANGE[1]; Te += 50) pts.push([effectiveFlux(k, Te, mp), Te]);
    return { k, pts };
  }), [mp]);
  const massLabel = mp === 1 ? '1 M⊕' : `1 M⊕ (${tx({ vi: 'biên mất kiểm soát', en: 'runaway edge' })}: ${fix(mp, mp < 1 ? 1 : 0, lang)} M⊕)`;

  return (
    <SimLayout
      id="a6"
      lesson={lesson}
      card={card}
      caption={<><span className="k">{tx(CLASS_TEXT[cls])}</span> · S<sub>p</sub> = {fmt(Sd, 3, lang)} S⊕ · T<sub>eq</sub> = {fix(Teq, 1, lang)} K{!status.inRange && <> · <b style={{ color: 'var(--warn)' }}>{tx({ vi: 'chỉ minh hoạ', en: 'illustration only' })}</b></>}</>}
      panel={
        <>
          <Section title={tx({ vi: 'Hệ sao', en: 'Star system' })} dot="var(--grpA)">
            <Select value={sys} onChange={(v) => { setSys(v); const s = HZ_SYSTEMS.find((x) => x.id === v); setD(v === 'custom' ? Math.sqrt(ms.L) : s?.planets[Math.min(1, s.planets.length - 1)]?.a ?? 1); }}
              options={[...HZ_SYSTEMS.map((s) => ({ value: s.id, label: tx(s.name) })), { value: 'custom', label: tx({ vi: 'Sao dãy chính tuỳ chỉnh (theo khối lượng)', en: 'Custom main-sequence star (by mass)' }) }]} />
            {isCustom && <Slider label={tx({ vi: 'Khối lượng sao', en: 'Star mass' })} value={mstar} min={0.1} max={2} step={0.01} onChange={setMstar} display={`${fix(mstar, 2, lang)} M☉`} />}
            <Readouts>
              <Readout k={tx({ vi: 'Độ trưng L', en: 'Luminosity L' })} v={fmt(Lum, 4, lang)} unit="L☉" />
              <Readout k={tx({ vi: 'Nhiệt độ hiệu dụng T_eff', en: 'Effective temperature T_eff' })} v={fix(T, 0, lang)} unit="K" tone={status.inRange ? undefined : 'bad'} />
              {isCustom && <Readout wide k={tx({ vi: 'Tuổi thọ dãy chính (ước lượng mức C)', en: 'Main-sequence lifetime (level-C estimate)' })} v={fmt(ms.lifetimeGyr, 3, lang)} unit={tx({ vi: 'tỉ năm', en: 'Gyr' })} />}
            </Readouts>
            <div className="field-hint">{isCustom ? tx({ vi: 'L, T_eff ước lượng từ quan hệ khối lượng – độ trưng gần đúng (±20–50%).', en: 'L, T_eff estimated from an approximate mass–luminosity relation (±20–50%).' }) : `${tx({ vi: 'Nguồn', en: 'Source' })}: ${S.source}`}</div>
            {!status.inRange && (
              <div className="warn-box">{tx({
                vi: `Kết quả chỉ mang tính minh hoạ: T_eff = ${fix(T, 0, lang)} K nằm ngoài dải hợp lệ ${HZ_TEFF_RANGE[0]}–${HZ_TEFF_RANGE[1]} K của Kopparapu et al. (2014). Đa thức S_eff được tính tại T_eff = ${status.teffUsed} K (biên gần nhất) thay vì ngoại suy.`,
                en: `Illustration only: T_eff = ${fix(T, 0, lang)} K is outside Kopparapu et al. (2014)’s valid ${HZ_TEFF_RANGE[0]}–${HZ_TEFF_RANGE[1]} K range. S_eff is evaluated at T_eff = ${status.teffUsed} K (nearest edge) instead of extrapolating.`,
              })}</div>
            )}
          </Section>
          <Section title={tx({ vi: 'Hành tinh thử', en: 'Test planet' })}>
            <Slider label={tx({ vi: 'Khoảng cách tới sao r', en: 'Distance from the star r' })} value={dTest} min={Math.max(0.003, hz.recentVenus * 0.2)} max={Math.max(hz.earlyMars * 3, dTest)} log step={0.0001} onChange={setD} display={`${fmt(d, 4, lang)} au`} />
            <Slider label={tx({ vi: 'Suất phản chiếu Bond A_B', en: 'Bond albedo A_B' })} value={albedo} min={0} max={0.95} step={0.01} onChange={setAlbedo} display={fix(albedo, 2, lang)} />
            <div className="field-hint">{tx({ vi: 'Tham khảo (NASA Fact Sheets): Trái Đất 0,306 · Sao Hoả 0,25 · Sao Kim 0,77. A_B chỉ ảnh hưởng T_eq, không ảnh hưởng biên HZ.', en: 'Reference (NASA Fact Sheets): Earth 0.306 · Mars 0.25 · Venus 0.77. A_B affects T_eq only, not the HZ edges.' })}</div>
            <Segmented value={String(mp)} onChange={(v) => setMp(Number(v))} options={[{ value: '0.1', label: '0,1 M⊕' }, { value: '1', label: '1 M⊕' }, { value: '5', label: '5 M⊕' }]} small />
            <div className="field-hint">{tx({ vi: 'Khối lượng hành tinh: Kopparapu 2014 chỉ công bố sự phụ thuộc khối lượng cho biên nhà kính mất kiểm soát.', en: 'Planet mass: Kopparapu 2014 publishes mass dependence for the runaway-greenhouse edge only.' })}</div>
            <Readouts>
              <Readout wide k={tx({ vi: 'Vị trí theo thông lượng', en: 'Position by flux' })} v={tx(CLASS_TEXT[cls])} tone={toneOf(cls)} frame={!status.inRange ? tx({ vi: 'chỉ minh hoạ', en: 'illustration only' }) : undefined} />
              <Readout k={tx({ vi: 'Thông lượng tới S_p', en: 'Incident flux S_p' })} v={fmt(Sd, 4, lang)} unit="S⊕" frame={`${fmt(Sd * 1361, 4, lang)} W m⁻²`} />
              <Readout k={tx({ vi: 'Nhiệt độ cân bằng bức xạ T_eq', en: 'Radiative equilibrium temperature T_eq' })} v={fix(Teq, 1, lang)} unit={`K = ${fix(Teq - 273.15, 1, lang)} °C`} frame={tx({ vi: 'không phải nhiệt độ bề mặt', en: 'not the surface temperature' })} />
            </Readouts>
          </Section>
          <Section title={t('secReadouts')}>
            <table className="num" style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
              <thead><tr style={{ color: 'var(--text-faint)' }}><td>{tx({ vi: 'Biên', en: 'Boundary' })}</td><td style={{ textAlign: 'right' }}>S_eff (S⊕)</td><td style={{ textAlign: 'right' }}>r_HZ (au)</td></tr></thead>
              <tbody>
                {HZ_LIMITS.map((k) => (
                  <tr key={k}><td style={{ color: LIMIT_META[k].color }}>{tx(LIMIT_META[k].short)}</td><td style={{ textAlign: 'right' }}>{fix(seff[k], 4, lang)}</td><td style={{ textAlign: 'right' }}>{fmt(hz[k], 4, lang)}</td></tr>
                ))}
              </tbody>
            </table>
            {planets.length > 0 && (
              <table className="num" style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse', marginTop: 10 }}>
                <thead><tr style={{ color: 'var(--text-faint)' }}><td>{tx({ vi: 'Hành tinh', en: 'Planet' })}</td><td style={{ textAlign: 'right' }}>a (au)</td><td style={{ textAlign: 'right' }}>S_p</td><td style={{ textAlign: 'right' }}>T_eq (K)</td><td style={{ paddingLeft: 6 }}>{tx({ vi: 'vùng', en: 'zone' })}</td></tr></thead>
                <tbody>
                  {planets.map((p) => { const sp = insolation(Lum, p.a); const c = hzClassify(sp, T, mp); return (
                    <tr key={p.n} style={{ cursor: 'pointer' }} onClick={() => setD(p.a)}>
                      <td>{p.n}</td><td style={{ textAlign: 'right' }}>{fix(p.a, 4, lang)}</td><td style={{ textAlign: 'right' }}>{fmt(sp, 3, lang)}</td><td style={{ textAlign: 'right' }}>{fix(equilibriumTemperature(Lum, p.a, albedo), 0, lang)}</td>
                      <td style={{ paddingLeft: 6, whiteSpace: 'nowrap', color: c === 'conservative' ? 'var(--ok)' : c === 'tooMuchFlux' || c === 'tooLittleFlux' ? 'var(--text-faint)' : 'var(--warn)' }}>{tx(CLASS_SHORT[c])}</td>
                    </tr>); })}
                </tbody>
              </table>
            )}
            <div className="field-hint">{tx({ vi: `T_eq của bảng dùng A_B = ${fix(albedo, 2, lang)} cho mọi hành tinh. Bấm một dòng để đặt hành tinh thử tại đó.`, en: `Table T_eq uses A_B = ${fix(albedo, 2, lang)} for all planets. Click a row to move the test planet there.` })}</div>
          </Section>
          <Section title={tx({ vi: 'Biểu đồ Kopparapu', en: 'Kopparapu diagram' })}>
            <ChartCard title={tx({ vi: `S_eff theo T_eff · ${massLabel} · hệ số Kopparapu et al. 2014`, en: `S_eff vs T_eff · ${massLabel} · Kopparapu et al. 2014 coefficients` })}>
              <LineChart height={240} xDomain={[2.2, 0]} yDomain={[2500, 7300]} xLabel={tx({ vi: 'Thông lượng hiệu dụng S_eff (S⊕)', en: 'Effective flux S_eff (S⊕)' })} yLabel="T_eff (K)" legend
                series={chart.map((c) => ({ data: c.pts, color: LIMIT_META[c.k].color, label: tx(LIMIT_META[c.k].short), dash: HZ_LIMIT_INFO[c.k].kind === 'optimistic' ? '5 4' : undefined }))}
                hlines={[{ y: T, color: status.inRange ? pal.textFaint : '#fbbf24', dash: '2 3', label: `${isCustom ? tx({ vi: 'sao tuỳ chỉnh', en: 'custom star' }) : tx(S.name)} · ${fix(T, 0, lang)} K` }, { y: HZ_TEFF_RANGE[0], color: withAlpha(pal.textFaint, 0.5), dash: '1 4' }, { y: HZ_TEFF_RANGE[1], color: withAlpha(pal.textFaint, 0.5), dash: '1 4' }]}
                markers={[...planets.map((p) => ({ x: insolation(Lum, p.a), y: T, color: '#93c5fd', r: 3.5 })), { x: Sd, y: T, color: pal.teal, r: 6, label: tx({ vi: 'thử', en: 'test' }) }]} />
            </ChartCard>
            <div className="field-hint">{tx({ vi: 'Nét liền: biên bảo thủ; nét đứt: biên lạc quan. Đường chấm: dải hợp lệ 2600–7200 K. Hành tinh ngoài trục (S > 2,2) không hiển thị.', en: 'Solid: conservative edges; dashed: optimistic edges. Dotted: valid range 2600–7200 K. Planets beyond the axis (S > 2.2) are not shown.' })}</div>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label="habitable zone" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      {hover && (
        <div className="chart-card" style={{ position: 'absolute', ...(hover.flip ? { right: `calc(100% - ${hover.x - 14}px)` } : { left: hover.x + 14 }), top: Math.max(hover.y - 10, 8), maxWidth: 300, padding: '10px 12px', fontSize: 12.5, pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ fontWeight: 700, color: LIMIT_META[hover.k].color, marginBottom: 4 }}>{tx(LIMIT_META[hover.k].name)}</div>
          <div className="num">S_eff = {fix(seff[hover.k], 4, lang)} S⊕ · r_HZ = {fmt(hz[hover.k], 4, lang)} au</div>
          <div style={{ marginTop: 4 }}>{tx(LIMIT_META[hover.k].assumption)}</div>
          <div style={{ marginTop: 4, color: 'var(--text-faint)' }}>Kopparapu et al. 2014, ApJL 787, L29 · {hover.k === 'runawayGreenhouse' ? `${fix(mp, mp < 1 ? 1 : 0, lang)} M⊕` : '1 M⊕'}{!status.inRange ? ` · ${tx({ vi: 'chỉ minh hoạ', en: 'illustration only' })}` : ''}</div>
        </div>
      )}
      <div className="stage-overlay bl" style={{ bottom: 64 }}>
        <div className="legend">
          <span><i style={{ background: 'rgba(74,222,128,0.8)' }} />{tx({ vi: 'Vùng bảo thủ', en: 'Conservative HZ' })}</span>
          <span><i style={{ background: 'rgba(74,222,128,0.35)' }} />{tx({ vi: 'Vùng lạc quan', en: 'Optimistic HZ' })}</span>
          <span style={{ fontSize: 11 }}>{tx({ vi: 'Rê chuột lên vạch biên để xem chi tiết', en: 'Hover a boundary line for details' })}</span>
        </div>
      </div>
    </SimLayout>
  );
}
