import { useMemo, useRef } from 'react';
import {
  PLANCK18, ageAtZ, lookbackTimeGyr, comovingDistanceMpc, transverseComovingMpc, luminosityDistanceMpc, angularDiameterDistanceMpc,
  COSMIC_LANDMARKS, T_CMB0, PLANCK18_LSS, lptFields, slabParticles, mulberry32,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Segmented } from '../../components/Controls';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, label, withAlpha, disk } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

const GLY_PER_MPC = 3.26156e-3; // 1 Mpc = 3.26156 million light-years
const Z_MIN = 1e-3, Z_MAX = 1100;
const NAMES: Record<string, L> = {
  coma: { vi: 'Đám thiên hà Coma', en: 'Coma Cluster' }, '3c273': { vi: 'Chuẩn tinh 3C 273', en: 'Quasar 3C 273' },
  reion: { vi: 'Giữa thời kỳ tái ion hoá', en: 'Mid-reionization' }, j1342: { vi: 'Chuẩn tinh J1342+0928', en: 'Quasar J1342+0928' },
  gnz11: { vi: 'Thiên hà GN-z11', en: 'Galaxy GN-z11' }, jades14: { vi: 'JADES-GS-z14-0', en: 'JADES-GS-z14-0' }, cmb: { vi: 'Nền vi sóng vũ trụ (CMB)', en: 'Cosmic microwave background' },
};
const fmtYears = (gyr: number, lang: 'vi' | 'en') => {
  const u = (vi: string, en: string) => (lang === 'vi' ? vi : en);
  if (gyr >= 1) return `${fix(gyr, 3, lang)} ${u('tỉ năm', 'billion yr')}`;
  if (gyr >= 1e-3) return `${fmt(gyr * 1e3, 1, lang)} ${u('triệu năm', 'million yr')}`;
  return `${fmt(gyr * 1e9, 0, lang)} ${u('năm', 'yr')}`;
};

export default function LookbackModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [lz, setLz] = useParam('lz', Math.log10(0.158), { min: Math.log10(Z_MIN), max: Math.log10(Z_MAX) });
  const [scale, setScale] = useParam<'log' | 'lin'>('sc', 'log');
  const z = 10 ** lz;
  const C = PLANCK18;

  // D_C(z) table for the wedge (log z grid) and the particle horizon
  const table = useMemo(() => {
    const zs: number[] = [], dc: number[] = [];
    for (let i = 0; i <= 260; i++) { const zz = 10 ** (-4 + (i / 260) * (Math.log10(2000) + 4)); zs.push(zz); dc.push(comovingDistanceMpc(C, zz)); }
    return { zs, dc, horizon: comovingDistanceMpc(C, 1e7) };
  }, [C]);
  const zOfD = (d: number) => {
    const { zs, dc } = table;
    if (d <= dc[0]) return zs[0] * (d / dc[0]);
    for (let i = 1; i < dc.length; i++) if (dc[i] >= d) { const f = (d - dc[i - 1]) / (dc[i] - dc[i - 1]); return 10 ** (Math.log10(zs[i - 1]) + f * (Math.log10(zs[i]) - Math.log10(zs[i - 1]))); }
    return zs[zs.length - 1];
  };

  // compressed radial scale: u = log10(1 + z/0.01) up to z = 20 (88% of the radius), then log(1+z) to the CMB
  const U = (zz: number) => Math.log10(1 + zz / 0.01), U20 = U(20), L21 = Math.log10(21), LC = Math.log10(1 + 1100);
  const fracOfZ = (zz: number) => (zz <= 20 ? (0.88 * U(zz)) / U20 : Math.min(1, 0.88 + (0.12 * (Math.log10(1 + zz) - L21)) / (LC - L21)));
  const zOfFrac = (f: number) => (f <= 0.88 ? 0.01 * (10 ** ((f / 0.88) * U20) - 1) : 10 ** (L21 + ((f - 0.88) / 0.12) * (LC - L21)) - 1);

  // galaxies: real cosmic-web slab (F5 field, 200 Mpc/h tile) repeated through the fan, thinned ∝ 1/r²
  const gals = useMemo(() => {
    const F = lptFields(PLANCK18_LSS, 64, 200, 7, 1), P = slabParticles(F, 6, 1), hh = PLANCK18_LSS.h;
    const out: { d: number; th: number; z: number }[] = [], r = mulberry32(5), HALF = (24 * Math.PI) / 180, R0 = 55, RMAX = 3200;
    const tile = 200 / hh; // Mpc
    for (let ty = -Math.ceil(RMAX * Math.sin(HALF) / tile); ty <= Math.ceil(RMAX * Math.sin(HALF) / tile); ty++)
      for (let tx2 = 0; tx2 <= Math.ceil(RMAX / tile); tx2++)
        for (let i = 0; i < P.n; i += 1) {
          const x = tx2 * tile + P.x[i] / hh, y = ty * tile + P.y[i] / hh - tile / 2, d = Math.hypot(x, y), th = Math.atan2(y, x);
          if (d < 1 || d > RMAX || Math.abs(th) > HALF) continue;
          if (r() > Math.min(1, (R0 / d) ** 2) * 0.9) continue;
          out.push({ d, th, z: 0 });
        }
    // beyond ~3 Gpc the web is far below the drawing resolution: random galaxies thinning out to z ≈ 15
    const dEnd = comovingDistanceMpc(PLANCK18, 15);
    for (let k = 0; k < 2600; k++) { const d = RMAX * (dEnd / RMAX) ** r(); const th = (2 * r() - 1) * HALF; if (r() < Math.exp(-(d - RMAX) / 4000)) out.push({ d, th, z: 0 }); }
    return out;
  }, []);
  const galZ = useMemo(() => gals.map((g) => zOfD(g.d)), [gals, table]); // eslint-disable-line react-hooks/exhaustive-deps

  const lb = lookbackTimeGyr(C, z), age = ageAtZ(C, z), age0 = ageAtZ(C, 0);
  const dc = comovingDistanceMpc(C, z), dm = transverseComovingMpc(C, z), dl = luminosityDistanceMpc(C, z), da = angularDiameterDistanceMpc(C, z);
  const lightTravelGly = lb; // c × t: 1 Gyr of travel = 1 Gly
  const ang30 = ((0.030 / da) * 180 * 3600) / Math.PI; // arcsec subtended by 30 kpc

  const geo = useRef({ ox: 0, oy: 0, R: 1 });
  const { canvasRef } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, '#020309');
    const bandH = 92, ox = 46, oy = (h - bandH) / 2 + 4, R = Math.min(w - ox - 40, ((h - bandH) / 2 - 18) / Math.sin((26 * Math.PI) / 180));
    geo.current = { ox, oy, R };
    const dH = table.horizon;
    const rad = (d: number) => (scale === 'log' ? R * fracOfZ(zOfD(d)) : (R * d) / dH);
    const radZ = (zz: number) => (scale === 'log' ? R * fracOfZ(zz) : (R * comovingDistanceMpc(C, zz)) / dH);
    const HALF = (24 * Math.PI) / 180;
    // fan background
    ctx.save(); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, R, -HALF, HALF); ctx.closePath();
    const bg = ctx.createRadialGradient(ox, oy, 0, ox, oy, R); bg.addColorStop(0, '#0a0f24'); bg.addColorStop(0.75, '#08081a'); bg.addColorStop(1, '#030308');
    ctx.fillStyle = bg; ctx.fill(); ctx.clip();
    // dark ages band (z 15 → 1090)
    const r15 = radZ(15), rC = radZ(1089.92);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.arc(ox, oy, rC, -HALF, HALF); ctx.arc(ox, oy, r15, HALF, -HALF, true); ctx.fill();
    // CMB shell: mottled ring
    const rr = mulberry32(3);
    for (let k = 0; k < 900; k++) {
      const th = (2 * rr() - 1) * HALF, dr = rr() * Math.max(4, R - rC);
      const v = rr(); ctx.fillStyle = v > 0.5 ? `rgba(255,${120 + 80 * v | 0},70,${0.25 + 0.4 * v})` : `rgba(90,${130 + 60 * v | 0},255,${0.2 + 0.4 * (1 - v)})`;
      ctx.beginPath(); ctx.arc(ox + Math.cos(th) * (rC + dr), oy + Math.sin(th) * (rC + dr), 2.4 + 2 * rr(), 0, 2 * Math.PI); ctx.fill();
    }
    // galaxies
    gals.forEach((g, i) => {
      const zz = galZ[i], rg = scale === 'log' ? R * fracOfZ(zz) : (R * g.d) / dH, x = ox + Math.cos(g.th) * rg, y = oy + Math.sin(g.th) * rg;
      const warm = Math.min(1, Math.log10(1 + zz) / Math.log10(16));
      const col = `rgb(${200 + 55 * warm | 0},${215 - 90 * warm | 0},${255 - 175 * warm | 0})`;
      ctx.globalAlpha = 0.85 - 0.45 * warm; ctx.fillStyle = col;
      const s = Math.max(0.9, 1.8 - 0.9 * warm);
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    });
    ctx.globalAlpha = 1;
    // look-back shells
    for (const zz of [0.01, 0.1, 1, 3, 10, 100]) {
      const rr2 = radZ(zz);
      ctx.strokeStyle = withAlpha(pal.fg, 0.14); ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.arc(ox, oy, rr2, -HALF, HALF); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
    for (const zz of [0.01, 0.1, 1, 3, 10, 100]) { const rr2 = radZ(zz); label(ctx, `z = ${fmt(zz, 2, lang)}`, ox + Math.cos(-HALF) * rr2, oy + Math.sin(-HALF) * rr2 - 6, pal.textFaint, { size: 10, align: 'center', halo: '#020309' }); }
    // landmarks: objects as points (staggered angles), epochs as arcs labelled under the fan
    let ko = 0;
    COSMIC_LANDMARKS.forEach((m) => {
      const rm = radZ(m.z);
      if (m.kind === 'epoch') {
        ctx.strokeStyle = withAlpha('#fca5a5', 0.6); ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(ox, oy, rm, -HALF, HALF); ctx.stroke(); ctx.setLineDash([]);
        const xe = ox + Math.cos(HALF) * rm, ye = oy + Math.sin(HALF) * rm;
        label(ctx, tx(NAMES[m.id]), xe + (m.id === 'cmb' ? 6 : -4), ye + 16, '#fca5a5', { size: 10.5, align: m.id === 'cmb' ? 'left' : 'right', halo: '#020309' });
        return;
      }
      const th = -HALF + 0.1 + (ko++ % 3) * 0.12, x = ox + Math.cos(th) * rm, y = oy + Math.sin(th) * rm;
      disk(ctx, x, y, 2.8, '#fde68a');
      label(ctx, tx(NAMES[m.id]), x, y - 8, '#fde68a', { size: 10.5, align: 'center', halo: '#020309' });
    });
    // selected z arc
    const rs = radZ(z);
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ox, oy, rs, -HALF - 0.02, HALF + 0.02); ctx.stroke();
    const lx = ox + Math.cos(-HALF - 0.05) * rs, ly = oy + Math.sin(-HALF - 0.05) * rs;
    label(ctx, `z = ${fmt(z, 3, lang)} · ${tx({ vi: 'nhìn lại', en: 'look-back' })} ${fmtYears(lb, lang)}`, lx, ly - 6, '#fbbf24', { size: 12, weight: 700, align: 'center', halo: '#020309' });
    // observer
    const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 14); g.addColorStop(0, '#93c5fd'); g.addColorStop(1, 'rgba(147,197,253,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, 14, 0, 2 * Math.PI); ctx.fill(); disk(ctx, ox, oy, 3.2, '#e0f2fe');
    label(ctx, tx({ vi: 'Chúng ta', en: 'Us' }), ox, oy + 24, '#e0f2fe', { size: 11, align: 'center', weight: 700 });
    label(ctx, tx({ vi: scale === 'log' ? 'Bán kính: thang nén theo dịch chuyển đỏ (để thấy cả gần lẫn xa)' : 'Bán kính: khoảng cách đồng chuyển động hiện nay, tuyến tính (đúng tỉ lệ)', en: scale === 'log' ? 'Radius: compressed redshift scale (near and far both visible)' : 'Radius: comoving distance today, linear (to scale)' }), ox, 18, pal.textFaint, { size: 11 });

    // cosmic-history band (age axis)
    const by = h - bandH + 18, bx0 = 60, bx1 = w - 30, X = (gy: number) => bx0 + (gy / age0) * (bx1 - bx0);
    const grad = ctx.createLinearGradient(bx0, 0, bx1, 0); grad.addColorStop(0, '#f97316'); grad.addColorStop(0.03, '#3b0764'); grad.addColorStop(0.08, '#1e1b4b'); grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad; ctx.fillRect(bx0, by, bx1 - bx0, 12);
    label(ctx, tx({ vi: 'Lịch sử vũ trụ (tuổi)', en: 'Cosmic history (age)' }), bx0, by - 6, pal.textDim, { size: 11, weight: 700 });
    for (const gy of [0, 2, 4, 6, 8, 10, 12]) label(ctx, fix(gy, 0, lang), X(gy), by + 28, pal.textFaint, { size: 10, align: 'center', mono: true });
    label(ctx, tx({ vi: 'tỉ năm', en: 'Gyr' }), bx1, by + 28, pal.textFaint, { size: 10, align: 'right' });
    const xe = X(age), xn = X(age0);
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xe, by - 4); ctx.lineTo(xe, by + 16); ctx.stroke();
    ctx.strokeStyle = withAlpha('#fbbf24', 0.8); ctx.beginPath(); ctx.moveTo(xe, by + 6); ctx.lineTo(xn, by + 6); ctx.stroke();
    label(ctx, tx({ vi: 'ánh sáng xuất phát', en: 'light set out' }), xe, by + 44, '#fbbf24', { size: 10.5, align: xe < bx0 + 80 ? 'left' : 'center' });
    label(ctx, tx({ vi: 'hôm nay', en: 'today' }), xn, by - 6, '#93c5fd', { size: 10.5, align: 'right' });
  }, [z, scale, table, gals, galZ, pal, lang, tx, dc, lb, age, age0]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = (e.target as HTMLCanvasElement).getBoundingClientRect(), { ox, oy, R } = geo.current;
    const d = Math.hypot(e.clientX - r.left - ox, e.clientY - r.top - oy);
    if (d > R * 1.02 || d < 2) return;
    const zc = scale === 'log' ? zOfFrac(Math.min(1, d / R)) : zOfD((d / R) * table.horizon);
    setLz(Math.max(Math.log10(Z_MIN), Math.min(Math.log10(Z_MAX), Math.log10(Math.max(Z_MIN, zc)))));
  };

  return (
    <SimLayout
      id="f4"
      lesson={lesson}
      card={card}
      caption={<><span className="k">z = {fmt(z, 3, lang)}</span> · {tx({ vi: 'nhìn lại', en: 'look-back' })} {fmtYears(lb, lang)} · {tx({ vi: 'vũ trụ khi đó', en: 'Universe then' })} {fmtYears(age, lang)} · a = {fix(1 / (1 + z), 4, lang)}</>}
      onReset={() => setLz(Math.log10(0.158))}
      panel={
        <>
          <Section title={tx({ vi: 'Nhìn xa tới đâu?', en: 'How far do we look?' })} dot="var(--grpF)">
            <Slider label={tx({ vi: 'Dịch chuyển đỏ z (thang log)', en: 'Redshift z (log scale)' })} value={lz} min={Math.log10(Z_MIN)} max={Math.log10(Z_MAX)} step={0.001} onChange={setLz} display={`z = ${fmt(z, 3, lang)}`} />
            <div className="row">{COSMIC_LANDMARKS.map((m) => (
              <button key={m.id} className={`btn small${Math.abs(Math.log10(m.z) - lz) < 1e-3 ? ' active' : ''}`} onClick={() => setLz(Math.log10(m.z))} title={m.source}>{tx(NAMES[m.id])}</button>
            ))}</div>
            <Segmented value={scale} onChange={setScale} small options={[{ value: 'log', label: tx({ vi: 'Thang nén', en: 'Compressed' }) }, { value: 'lin', label: tx({ vi: 'Tuyến tính (đúng tỉ lệ)', en: 'Linear (to scale)' }) }]} />
            <div className="field-hint">{tx({ vi: 'Bấm vào hình quạt để chọn khoảng cách. Thiên hà xa hơn được vẽ ấm màu hơn vì ánh sáng của chúng bị kéo dài về phía đỏ.', en: 'Click the fan to pick a distance. Farther galaxies are drawn warmer because their light is stretched toward the red.' })}</div>
            {student && <div className="eq-box"><Tex display tex={'1 + z = \\frac{1}{a},\\qquad t_{\\rm lb} = \\int_0^z \\frac{dz\'}{(1+z\')H(z\')}'} /><Tex display tex={'D_C = c\\int_0^z \\frac{dz\'}{H(z\')}'} /></div>}
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Thời gian nhìn lại', en: 'Look-back time' })} v={fmtYears(lb, lang)} tone="accent" wide frame={tx({ vi: 'ánh sáng đã đi bấy lâu để tới mắt ta', en: 'how long the light has been travelling' })} />
              <Readout k={tx({ vi: 'Tuổi vũ trụ khi ánh sáng xuất phát', en: 'Age of the Universe at emission' })} v={fmtYears(age, lang)} wide />
              <Readout k={tx({ vi: 'Quãng đường ánh sáng đã đi', en: 'Light-travel distance' })} v={fmt(lightTravelGly, 3, lang)} unit={tx({ vi: 'tỉ năm as', en: 'Gly' })} />
              <Readout k={tx({ vi: 'Khoảng cách hiện nay', en: 'Distance today' })} v={fmt(dc * GLY_PER_MPC, 3, lang)} unit={tx({ vi: 'tỉ năm as', en: 'Gly' })} frame={tx({ vi: 'đồng chuyển động', en: 'comoving' })} />
              <Readout k={tx({ vi: 'Khoảng cách lúc phát', en: 'Distance at emission' })} v={fmt((dm / (1 + z)) * GLY_PER_MPC, 3, lang)} unit={tx({ vi: 'tỉ năm as', en: 'Gly' })} frame={tx({ vi: 'riêng, lúc ánh sáng rời nguồn', en: 'proper, when the light left' })} />
              <Readout k={tx({ vi: 'Khoảng cách độ sáng', en: 'Luminosity distance' })} v={fmt(dl * GLY_PER_MPC, 3, lang)} unit={tx({ vi: 'tỉ năm as', en: 'Gly' })} />
              <Readout k={tx({ vi: 'Thiên hà 30 kpc trông rộng', en: 'A 30 kpc galaxy spans' })} v={fix(ang30, 2, lang)} unit={tx({ vi: 'giây cung', en: 'arcsec' })} frame={tx({ vi: 'nhỏ nhất quanh z ≈ 1,6', en: 'smallest near z ≈ 1.6' })} />
              <Readout k={tx({ vi: 'Nhiệt độ CMB khi đó', en: 'CMB temperature then' })} v={fmt(T_CMB0 * (1 + z), 3, lang)} unit="K" frame="$T = T_0(1+z)$" />
            </Readouts>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} onClick={onClick} style={{ cursor: 'crosshair' }} role="img" aria-label={tx({ vi: 'Hình quạt khảo sát thiên hà tới nền vi sóng vũ trụ', en: 'Galaxy survey fan out to the cosmic microwave background' })} />
    </SimLayout>
  );
}
