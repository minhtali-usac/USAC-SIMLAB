import { useMemo, useRef, useState } from 'react';
import {
  moonPhase, moonPosition, moonMeanLongitude, moonAscendingNode, moonTrack, moonApsides, moonLibrationLongitude, gmstDeg, sunHorizontal, sunPosition, nextLunarPhase, upcomingLunarPhases, lmstDeg, dateToJD, jdToDate, moonRiseSet, moonHorizontal, R_MOON,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Select, Field } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { useT, fix, fmt } from '../../i18n';
import { useParam, setParams } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette, type Palette } from '../../lib/hooks';
import { clear, drawBackgroundStars, withAlpha, label, disk, glowDisk, arrow, photoDisk } from '../../lib/canvas';
import { drawGlobeMatrix, rotX, rotZ, matMul } from '../../lib/globe';
import { useLevelAtLeast } from '../../store/settings';
import { LOCATIONS, localParts, dateKey, localToUtcMs, jdToLocalHHMM, tzLabel, todayKey, nowMinutes, pad2 } from '../../lib/astroTime';
import type { Lesson } from '../types';
import { card } from './card';

const lesson: Lesson = {
  objectives: {
    vi: ['Giải thích pha Mặt Trăng bằng góc Mặt Trời – Trái Đất – Mặt Trăng, không phải bóng Trái Đất.', 'Liên hệ pha với giờ mọc/lặn (trăng tròn mọc lúc hoàng hôn).', 'Biết vì sao không phải tháng nào cũng có nhật/nguyệt thực.'],
    en: ['Explain lunar phases by the Sun–Earth–Moon angle, not the Earth’s shadow.', 'Relate phase to rise/set times (a full moon rises at sunset).', 'Know why eclipses do not happen every month.'],
  },
  durationMin: 30,
  prerequisites: { vi: 'A1 (Mặt Trời trên bầu trời).', en: 'A1 (the Sun in the sky).' },
  background: [
    { title: { vi: 'Pha là góc nhìn', en: 'Phases are a viewing angle' }, body: {
      vi: `Mặt Trời luôn chiếu sáng **một nửa** Mặt Trăng. Ta thấy bao nhiêu phần nửa sáng đó phụ thuộc **góc ly giác** ψ giữa Mặt Trăng và Mặt Trời nhìn từ Trái Đất. Phần đĩa được chiếu sáng là
$$k = \\frac{1 + \\cos i}{2},$$
với i là góc pha (Mặt Trời – Mặt Trăng – Trái Đất, ≈ 180° − ψ). Chu kỳ pha (tháng giao hội) là **29,53 ngày**, dài hơn chu kỳ quỹ đạo 27,32 ngày vì Trái Đất cũng đi quanh Mặt Trời.`,
      en: `The Sun always lights **half** the Moon. How much of that lit half we see depends on the **elongation** ψ between Moon and Sun seen from Earth. The illuminated fraction of the disk is
$$k = \\frac{1 + \\cos i}{2},$$
with i the phase angle (Sun–Moon–Earth, ≈ 180° − ψ). The phase cycle (synodic month) is **29.53 days**, longer than the 27.32-day orbit because the Earth also moves around the Sun.` } },
    { title: { vi: 'Giờ mọc và thực', en: 'Rise times and eclipses' }, body: {
      vi: `Trăng tròn đối diện Mặt Trời nên mọc khi Mặt Trời lặn; trăng thượng huyền mọc khoảng giữa trưa, cao nhất lúc hoàng hôn. Mỗi ngày Mặt Trăng mọc muộn hơn trung bình ~50 phút.

Quỹ đạo Mặt Trăng nghiêng ~5,1° so với hoàng đạo, nên ở hầu hết các lần trăng non/tròn, Mặt Trăng đi trên hoặc dưới Mặt Trời/bóng Trái Đất. **Thực** chỉ xảy ra khi trăng non/tròn trùng gần **nút** quỹ đạo (vĩ độ hoàng đạo β ≈ 0).`,
      en: `A full moon is opposite the Sun, so it rises as the Sun sets; a first-quarter moon rises around noon and is highest at sunset. On average the Moon rises ~50 minutes later each day.

The lunar orbit is tilted ~5.1° to the ecliptic, so at most new/full moons the Moon passes above or below the Sun/Earth’s shadow. **Eclipses** only happen when new/full moon falls near a **node** (ecliptic latitude β ≈ 0).` } },
  ],
  activities: [
    { title: { vi: 'Trăng tròn mọc khi nào?', en: 'When does the full moon rise?' }, text: { vi: 'Bấm "Trăng tròn kế tiếp", rồi chạy thời gian quanh lúc hoàng hôn. Quan sát góc nhìn từ trên xuống: người quan sát ở đâu khi trăng mọc?', en: 'Press “Next full moon”, then run time around sunset. In the top view, where is the observer when the moon rises?' } },
    { title: { vi: 'Trăng ban ngày', en: 'Daytime moon' }, text: { vi: 'Tìm một ngày thượng huyền và đặt giờ 16:00. Mặt Trăng và Mặt Trời có cùng ở trên chân trời không?', en: 'Find a first-quarter day and set 16:00. Are the Moon and Sun both above the horizon?' } },
    { title: { vi: 'Nam bán cầu', en: 'Southern Hemisphere' }, text: { vi: 'Chọn Sydney: hình trăng khuyết bị lật trái–phải so với Hà Nội. Vì sao?', en: 'Choose Sydney: the crescent is mirrored left–right compared with Hanoi. Why?' }, params: { loc: 'sydney' } },
  ],
  quiz: [
    { q: { vi: 'Pha Mặt Trăng gây ra bởi:', en: 'Lunar phases are caused by:' }, options: [{ vi: 'Bóng Trái Đất che Mặt Trăng', en: 'Earth’s shadow on the Moon' }, { vi: 'Góc nhìn phần được Mặt Trời chiếu sáng', en: 'Our viewing angle of the sunlit half' }, { vi: 'Mây', en: 'Clouds' }], answer: 1, explain: { vi: 'Bóng Trái Đất chỉ gây ra nguyệt thực.', en: 'Earth’s shadow only causes lunar eclipses.' } },
    { q: { vi: 'Trăng tròn mọc vào khoảng:', en: 'A full moon rises around:' }, options: [{ vi: 'Bình minh', en: 'Sunrise' }, { vi: 'Giữa trưa', en: 'Noon' }, { vi: 'Hoàng hôn', en: 'Sunset' }, { vi: 'Nửa đêm', en: 'Midnight' }], answer: 2, explain: { vi: 'Trăng tròn đối diện Mặt Trời trên bầu trời.', en: 'The full moon is opposite the Sun in the sky.' } },
  ],
};


/**
 * Moon disk using the real full-Moon photograph (FullMoon2010, CC BY-SA 3.0); the unlit part is
 * shaded with the exact terminator ellipse for the illuminated fraction k = (1 + cos i)/2.
 */
function drawMoonPhase(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, illum: number, waxing: boolean, south: boolean, pal: Palette) {
  const litRight = waxing !== south;
  const cosI = 2 * illum - 1; // cos(phase angle)
  const n = 64;
  const litPath = new Path2D();
  for (let k = 0; k <= n; k++) { // bright limb
    const a = -Math.PI / 2 + (Math.PI * k) / n;
    const x = Math.cos(a) * R, y = Math.sin(a) * R;
    if (k === 0) litPath.moveTo(cx + (litRight ? x : -x), cy + y); else litPath.lineTo(cx + (litRight ? x : -x), cy + y);
  }
  for (let k = n; k >= 0; k--) { // terminator
    const a = -Math.PI / 2 + (Math.PI * k) / n;
    const x = -cosI * Math.cos(a) * R, y = Math.sin(a) * R;
    litPath.lineTo(cx + (litRight ? x : -x), cy + y);
  }
  litPath.closePath();
  if (photoDisk(ctx, 'a3.jpg', cx, cy, R, 1.06)) {
    // shadow = disk minus lit region (even-odd), slightly translucent to hint earthshine
    const shadow = new Path2D();
    shadow.arc(cx, cy, R + 0.5, 0, Math.PI * 2);
    shadow.addPath(litPath);
    ctx.fillStyle = 'rgba(6,8,14,0.9)';
    ctx.fill(shadow, 'evenodd');
    return;
  }
  ctx.fillStyle = pal.light ? '#3b4256' : '#1b2030';
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#eceff4';
  ctx.fill(litPath);
}

/** Track of the current lunation (±15 d) and its apsides, cached per 6 h of simulated time. */
const PHASE_LABEL = {
  0: { icon: '🌑', name: { vi: 'Trăng non', en: 'New moon' } },
  90: { icon: '🌓', name: { vi: 'Thượng huyền', en: 'First quarter' } },
  180: { icon: '🌕', name: { vi: 'Trăng tròn', en: 'Full moon' } },
  270: { icon: '🌗', name: { vi: 'Hạ huyền', en: 'Last quarter' } },
} as const;

const orbitCache = { key: NaN, track: [] as ReturnType<typeof moonTrack>, apsides: [] as ReturnType<typeof moonApsides> };
function orbitInfo(jd: number) {
  const key = Math.floor(jd * 4);
  if (orbitCache.key !== key) { orbitCache.key = key; orbitCache.track = moonTrack(jd - 15, jd + 15, 300); orbitCache.apsides = moonApsides(jd - 15, jd + 15); }
  return orbitCache;
}

export default function MoonModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [loc, setLoc] = useParam('loc', 'hanoi');
  const L = LOCATIONS.find((l) => l.id === loc) ?? LOCATIONS[0];
  const [date, setDate] = useParam('date', todayKey(L.tz));
  const [min] = useParam('min', nowMinutes(L.tz), { min: 0, max: 1439.99 });
  const [speed, setSpeed] = useParam('speed', 360);
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState(false); // real time, locked to the system clock
  const tRef = useRef(localToUtcMs(date, min, L.tz));
  const lastKey = useRef(`${date}|${min}|${loc}`);
  if (lastKey.current !== `${date}|${min}|${loc}`) { lastKey.current = `${date}|${min}|${loc}`; tRef.current = localToUtcMs(date, min, L.tz); }
  const [, setTick] = useState(0);
  const lastUi = useRef(0);

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    drawBackgroundStars(ctx, w, h, pal, 13, 0.8);
    const jd = dateToJD(tRef.current);
    const ph = moonPhase(jd);
    const sp = sunPosition(jd);
    const sh = sunHorizontal(jd, L.lat, L.lon, true);
    const mp = moonPosition(jd);
    const { track: orbitTrack, apsides } = orbitInfo(jd);
    const mh = moonHorizontal(jd, L.lat, L.lon, true);
    const wide = w > 820;
    const topW = wide ? w * 0.52 : w, topH = wide ? h : h * 0.5;
    // ── top view: geocentric ecliptic frame seen from the north ecliptic pole (fixed to the stars, ♈ to the right)
    const cx = topW * 0.55, cy = topH / 2 + 10;
    const Rorb = Math.min(topW * 0.4, topH * 0.37);
    const kmPx = Rorb / 410_000; // distances to scale: 1 px = 410 000/Rorb km
    const Re = Math.max(16, Rorb * 0.15), mr = Math.max(9, Re * 0.5); // body sizes enlarged (labelled)
    const lamSun = (sp.lon * Math.PI) / 180;
    const sunVec: [number, number, number] = [Math.cos(lamSun), Math.sin(lamSun), 0];
    // sunlight from the Sun's true direction
    const ux = Math.cos(lamSun), uy = -Math.sin(lamSun), vx = -uy, vy = ux;
    for (let k = -4; k <= 4; k++) {
      const bx = cx + ux * Rorb * 1.17 + vx * k * Rorb * 0.12, by = cy + uy * Rorb * 1.17 + vy * k * Rorb * 0.12;
      if (bx < 8 || bx > topW - 8 || by < 8 || by > topH - 8) continue;
      arrow(ctx, bx, by, bx - ux * 30, by - uy * 30, withAlpha(pal.sun, 0.35), 1.2, 6);
    }
    label(ctx, tx({ vi: '☀ hướng Mặt Trời', en: '☀ toward the Sun' }), Math.min(topW - 50, Math.max(50, cx + ux * Rorb * 1.05)), Math.min(topH - 28, Math.max(16, cy + uy * Rorb * 1.05)), pal.sun, { align: 'center', size: 11, halo: pal.bg });
    // syzygy line: Sun – Earth – anti-solar point (new moon on the Sun side, full moon opposite)
    ctx.setLineDash([2, 5]); ctx.strokeStyle = withAlpha(pal.sun, 0.45); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + ux * Rorb * 1.15, cy + uy * Rorb * 1.15); ctx.lineTo(cx - ux * Rorb * 1.15, cy - uy * Rorb * 1.15); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, tx({ vi: 'trăng non', en: 'new moon' }), cx + ux * Rorb * 0.62 + vx * 10, cy + uy * Rorb * 0.62 + vy * 10, withAlpha(pal.sun, 0.8), { size: 10, align: 'center', halo: pal.bg });
    label(ctx, tx({ vi: 'trăng tròn (đối)', en: 'full moon (opposition)' }), cx - ux * Rorb * 0.62 + vx * 10, cy - uy * Rorb * 0.62 + vy * 10, withAlpha(pal.sun, 0.8), { size: 10, align: 'center', halo: pal.bg });
    // lunar node line (eclipses need syzygy near this line)
    const om = (moonAscendingNode(jd) * Math.PI) / 180;
    ctx.setLineDash([6, 4]); ctx.strokeStyle = withAlpha(pal.equator, 0.5);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(om) * Rorb * 1.08, cy - Math.sin(om) * Rorb * 1.08); ctx.lineTo(cx - Math.cos(om) * Rorb * 1.08, cy + Math.sin(om) * Rorb * 1.08); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, '☊', cx + Math.cos(om) * Rorb * 1.12, cy - Math.sin(om) * Rorb * 1.12, pal.equator, { size: 13, align: 'center', weight: 700, halo: pal.bg });
    // ♈ direction
    label(ctx, '♈ λ = 0°', cx + Rorb * 1.05, cy - 6, pal.textFaint, { size: 10.5, halo: pal.bg });
    // real perturbed track of the current lunation, to scale
    ctx.strokeStyle = withAlpha(pal.moon, 0.55); ctx.lineWidth = 1.3; ctx.beginPath();
    orbitTrack.forEach((p, i) => {
      const l = (p.lon * Math.PI) / 180, d = p.distanceKm * Math.cos((p.lat * Math.PI) / 180) * kmPx;
      const X0 = cx + Math.cos(l) * d, Y0 = cy - Math.sin(l) * d;
      if (i) ctx.lineTo(X0, Y0); else ctx.moveTo(X0, Y0);
    });
    ctx.stroke();
    for (const a of apsides) {
      const m = moonPosition(a.jd), l = (m.lon * Math.PI) / 180, d = m.distanceKm * kmPx;
      const X0 = cx + Math.cos(l) * d, Y0 = cy - Math.sin(l) * d;
      disk(ctx, X0, Y0, 3, a.kind === 'perigee' ? pal.ok : pal.danger);
      label(ctx, `${a.kind === 'perigee' ? tx({ vi: 'cận điểm', en: 'perigee' }) : tx({ vi: 'viễn điểm', en: 'apogee' })} ${fmt(a.distanceKm, 0, lang)} km`, X0 + Math.cos(l) * 12, Y0 - Math.sin(l) * 12, a.kind === 'perigee' ? pal.ok : pal.danger, { size: 10, align: Math.cos(l) >= 0 ? 'left' : 'right', halo: pal.bg });
    }
    // Earth: tilted 23.44°, turned by sidereal time, lit by the Sun (seasonal terminator)
    const eps = (sp.obliquity * Math.PI) / 180, gmst = (gmstDeg(jd) * Math.PI) / 180;
    const Mearth = matMul(rotZ(-gmst), rotX(eps));
    glowDisk(ctx, cx, cy, Re, 'rgba(96,165,250,0.18)', 1.12);
    if (!drawGlobeMatrix(ctx, 'earth_daymap', cx, cy, Re, Mearth, sunVec, 0.08)) disk(ctx, cx, cy, Re, '#1e3a8a');
    // observer: local sidereal time is the observer's angle from ♈ in the equatorial frame (projected)
    const lst = (lmstDeg(jd, L.lon) * Math.PI) / 180, phi = (L.lat * Math.PI) / 180;
    const eqObs = [Math.cos(phi) * Math.cos(lst), Math.cos(phi) * Math.sin(lst), Math.sin(phi)];
    const ecObs = [eqObs[0], Math.cos(eps) * eqObs[1] + Math.sin(eps) * eqObs[2], -Math.sin(eps) * eqObs[1] + Math.cos(eps) * eqObs[2]];
    if (ecObs[2] > -0.05) {
      const ox = cx + ecObs[0] * Re, oy = cy - ecObs[1] * Re;
      disk(ctx, ox, oy, 3.5, pal.horizon);
      label(ctx, tx({ vi: 'bạn', en: 'you' }), ox + ecObs[0] * 14, oy - ecObs[1] * 14, pal.horizon, { size: 11, align: 'center', weight: 700, halo: pal.bg });
    }
    // Moon: true position and distance; synchronous rotation at the MEAN rate ⇒ optical libration appears naturally
    const lm = (mp.lon * Math.PI) / 180, dm = mp.distanceKm * Math.cos((mp.lat * Math.PI) / 180) * kmPx;
    const mx = cx + Math.cos(lm) * dm, my = cy - Math.sin(lm) * dm;
    ctx.strokeStyle = withAlpha(pal.teal, 0.5); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx, my); ctx.stroke();
    const Mmoon = rotZ(-((moonMeanLongitude(jd) + 180) * Math.PI) / 180);
    if (!drawGlobeMatrix(ctx, 'moon', mx, my, mr, Mmoon, sunVec, 0.05)) disk(ctx, mx, my, mr, '#9ca3af');
    // near-side marker: selenographic longitude 0 (mean sub-Earth point) - swings by the libration
    const nsa = ((moonMeanLongitude(jd) + 180) * Math.PI) / 180;
    ctx.strokeStyle = pal.teal; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(mx + Math.cos(nsa) * mr, my - Math.sin(nsa) * mr); ctx.lineTo(mx + Math.cos(nsa) * (mr + 7), my - Math.sin(nsa) * (mr + 7)); ctx.stroke();
    label(ctx, `${fix(ph.phaseLon, 0, lang)}°`, mx + mr + 6, my, pal.teal, { size: 11, mono: true, halo: pal.bg });
    // inset: Earth's eccentric orbit around the Sun (heliocentric, to scale)
    {
      const ir = Math.min(topW, topH) * 0.085, ix = 14 + ir * 1.15, iy = 26 + ir * 1.1;
      const e = 0.0167, varpi = (102.94 * Math.PI) / 180, a = ir / (1 + e);
      ctx.fillStyle = withAlpha(pal.bg, 0.75); ctx.strokeStyle = withAlpha(pal.textFaint, 0.4);
      ctx.beginPath(); ctx.rect(ix - ir * 1.15, iy - ir * 1.1 - 12, ir * 2.3, ir * 2.3 + 22); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = withAlpha('#5aa2ff', 0.6); ctx.beginPath();
      for (let k = 0; k <= 120; k++) { const nu = (k / 120) * 2 * Math.PI, r = (a * (1 - e * e)) / (1 + e * Math.cos(nu)); const X0 = ix + r * Math.cos(nu + varpi), Y0 = iy - r * Math.sin(nu + varpi); if (k) ctx.lineTo(X0, Y0); else ctx.moveTo(X0, Y0); }
      ctx.stroke();
      glowDisk(ctx, ix, iy, 4, pal.sun, 2.5); disk(ctx, ix, iy, 3.5, '#fff2b0');
      const le = lamSun + Math.PI, re = (sp.distanceAu / 1.0167) * ir;
      disk(ctx, ix + Math.cos(le) * re, iy - Math.sin(le) * re, 3.5, '#5aa2ff');
      const pp = ix + Math.cos(varpi) * a * (1 - e), pq = iy - Math.sin(varpi) * a * (1 - e);
      disk(ctx, pp, pq, 2, pal.ok);
      label(ctx, tx({ vi: `Trái Đất quanh Mặt Trời · r = ${fix(sp.distanceAu, 4, lang)} au`, en: `Earth around the Sun · r = ${fix(sp.distanceAu, 4, lang)} au` }), ix - ir * 1.1, iy - ir * 1.1 - 2, pal.textDim, { size: 10 });
      label(ctx, tx({ vi: 'cận nhật 0,983 au · viễn nhật 1,017 au', en: 'perihelion 0.983 au · aphelion 1.017 au' }), ix - ir * 1.1, iy + ir * 1.1 + 6, pal.textFaint, { size: 9.5 });
    }
    label(ctx, tx({ vi: 'Nhìn từ cực Bắc hoàng đạo · khoảng cách Trái Đất – Mặt Trăng theo tỉ lệ, kích thước phóng đại', en: 'From the north ecliptic pole · Earth–Moon distance to scale, sizes enlarged' }), 12, topH - 12, pal.textFaint, { size: 11 });

    // ── horizon panorama
    const px0 = wide ? topW + 10 : 10, py0 = wide ? 10 : topH + 10;
    const pw = (wide ? w - topW : w) - 20, phh = (wide ? h * 0.55 : h * 0.3) - 10;
    const altMin = -12, altMax = 80;
    const AZ = (az: number) => px0 + ((az + 360 - (L.lat >= 0 ? 0 : 180)) % 360) / 360 * pw;
    const ALT = (alt: number) => py0 + phh * (1 - (alt - altMin) / (altMax - altMin));
    const sa = sh.alt;
    const sky = sa > 0 ? '#4f86c6' : sa > -6 ? '#2a3d78' : sa > -12 ? '#141d3d' : '#060914';
    const grad = ctx.createLinearGradient(0, py0, 0, ALT(0));
    grad.addColorStop(0, sky); grad.addColorStop(1, sa > -6 && sa < 6 ? '#e2864d' : sky);
    ctx.fillStyle = grad; ctx.fillRect(px0, py0, pw, ALT(0) - py0);
    ctx.fillStyle = '#12261a'; ctx.fillRect(px0, ALT(0), pw, py0 + phh - ALT(0));
    ctx.strokeStyle = pal.horizon; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(px0, ALT(0)); ctx.lineTo(px0 + pw, ALT(0)); ctx.stroke();
    const dirs = [[0, tx({ vi: 'B', en: 'N' })], [90, tx({ vi: 'Đ', en: 'E' })], [180, tx({ vi: 'N', en: 'S' })], [270, tx({ vi: 'T', en: 'W' })]] as const;
    for (const [az, s] of dirs) label(ctx, s, AZ(az), ALT(0) + 12, '#f9a8d4', { align: 'center', size: 12, weight: 700 });
    if (sh.alt > altMin) { glowDisk(ctx, AZ(sh.az), ALT(sh.alt), 7, pal.sun, 3); disk(ctx, AZ(sh.az), ALT(sh.alt), 7, '#fff2b0'); }
    if (mh.alt > altMin) drawMoonPhase(ctx, AZ(mh.az), ALT(mh.alt), 9, ph.illuminated, ph.waxing, L.lat < 0, pal);
    label(ctx, tx({ vi: 'Toàn cảnh chân trời (phương vị 0–360°)', en: 'Horizon panorama (azimuth 0–360°)' }), px0 + 6, py0 + 12, '#e5e7eb', { size: 11, weight: 600, halo: 'rgba(0,0,0,0.5)' });

    // ── phase appearance
    const qy0 = py0 + phh + 10, qh = (wide ? h : h) - qy0 - 10;
    const R = Math.max(10, Math.min(pw, qh) * 0.36);
    const qcx = px0 + pw / 2, qcy = qy0 + qh / 2;
    drawMoonPhase(ctx, qcx, qcy, R, ph.illuminated, ph.waxing, L.lat < 0, pal);
    label(ctx, tx({ vi: `Hình dạng nhìn từ ${L.lat >= 0 ? 'Bắc' : 'Nam'} bán cầu`, en: `As seen from the ${L.lat >= 0 ? 'Northern' : 'Southern'} Hemisphere` }), qcx, qy0 + qh - 4, pal.textFaint, { align: 'center', size: 11 });
  }, [pal, L, tx, lang]);

  useAnimationFrame((dt, now) => {
    if (live) tRef.current = Date.now();
    else if (playing) tRef.current += dt * speed * 60_000;
    redraw();
    if (now - lastUi.current > 150) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const jd = dateToJD(tRef.current);
  const ph = moonPhase(jd);
  const mp = moonPosition(jd);
  const lp = localParts(tRef.current, L.tz);
  const dayStart = dateToJD(localToUtcMs(dateKey(lp), 0, L.tz));
  // topocentric rise/set (h_topo = −0.5667° − s☾), validated against JPL Horizons - see card.ts
  const riseSet = useMemo(() => moonRiseSet(dayStart, L.lat, L.lon), [dayStart, L]);
  // the next instance of each principal phase after the current instant, soonest first;
  // ecliptic latitude β at new/full moon feeds the eclipse hint
  const phases = useMemo(
    () => upcomingLunarPhases(jd).map((p) => ({ ...p, beta: p.phase === 0 || p.phase === 180 ? moonPosition(p.jd).lat : NaN })),
    // recompute once per simulated minute
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Math.floor(jd * 1440)],
  );
  // rounded to the nearest minute, as published tables (USNO, timeanddate) do
  const fmtJd = (x: number) => { const p = localParts(Math.round(jdToDate(x).getTime() / 60_000) * 60_000, L.tz); return `${dateKey(p)} ${pad2(Math.floor(p.minutes / 60))}:${pad2(Math.floor(p.minutes % 60))}`; };
  const phaseName = (() => {
    const a = ph.phaseLon;
    const names: [number, { vi: string; en: string }][] = [
      [11.25, { vi: 'Trăng non', en: 'New moon' }], [78.75, { vi: 'Trăng lưỡi liềm đầu tháng', en: 'Waxing crescent' }], [101.25, { vi: 'Thượng huyền', en: 'First quarter' }],
      [168.75, { vi: 'Trăng khuyết đầu tháng (gần tròn)', en: 'Waxing gibbous' }], [191.25, { vi: 'Trăng tròn', en: 'Full moon' }], [258.75, { vi: 'Trăng khuyết cuối tháng', en: 'Waning gibbous' }],
      [281.25, { vi: 'Hạ huyền', en: 'Last quarter' }], [348.75, { vi: 'Trăng lưỡi liềm cuối tháng', en: 'Waning crescent' }], [361, { vi: 'Trăng non', en: 'New moon' }],
    ];
    return tx(names.find(([lim]) => a < lim)![1]);
  })();
  const goto = (jdx: number) => { const p = localParts(jdToDate(jdx).getTime(), L.tz); setPlaying(false); setParams({ date: dateKey(p), min: Math.round(p.minutes) }); };

  return (
    <SimLayout
      id="a3"
      lesson={lesson}
      card={card}
      caption={<><span className="k">{phaseName}</span> · {fix(ph.illuminated * 100, 0, lang)}% · {tx({ vi: 'tuổi', en: 'age' })} {fix(ph.ageDays, 1, lang)} {t('days')}</>}
      onTogglePlay={() => { setLive(false); setPlaying((x) => !x); }}
      timeline={
        <Timeline playing={playing || live} onToggle={() => { setLive(false); setPlaying((x) => !x); }} onStep={(d) => { setLive(false); tRef.current += d * 86_400_000; }} speed={speed} onSpeed={(v) => { setLive(false); setSpeed(v); }}
          speeds={[[1 / 60, tx({ vi: '1× (thời gian thực)', en: '1× (real time)' })], [1, `1 ${tx({ vi: 'phút', en: 'min' })}/s`], [60, `1 ${t('hours')}/s`], [360, `6 ${t('hours')}/s`], [1440, `1 ${t('days')}/s`], [4320, `3 ${t('days')}/s`]].map(([v, l]) => ({ value: v as number, label: l as string }))}
          label={<>{dateKey(lp)} {pad2(Math.floor(lp.minutes / 60))}:{pad2(Math.floor(lp.minutes % 60))}<small>{tzLabel(L.tz)}</small></>}>
          <button className="btn small" onClick={() => setParams({ date: todayKey(L.tz), min: nowMinutes(L.tz) })}>{t('now')}</button>
          <button className={`btn small${live ? ' primary' : ''}`} onClick={() => { setLive((x) => !x); setPlaying(false); }}>{live ? '● ' : ''}{tx({ vi: 'Trực tiếp', en: 'Live' })}</button>
        </Timeline>
      }
      panel={
        <>
          <Section title={`${t('location')} & ${t('secTime')}`} dot="var(--grpA)">
            <Select value={loc} onChange={setLoc} options={LOCATIONS.map((l) => ({ value: l.id, label: tx(l.name) }))} />
            <Field label={t('date')}><input className="text-input" type="date" value={dateKey(lp)} onChange={(e) => e.target.value && setDate(e.target.value)} /></Field>
            <Slider label={t('time')} value={lp.minutes} min={0} max={1439} step={1} onChange={(v) => { setPlaying(false); setParams({ date: dateKey(lp), min: Math.round(v) }); }} display={`${pad2(Math.floor(lp.minutes / 60))}:${pad2(Math.floor(lp.minutes % 60))}`} />
            <div className="row">
              <button className="btn small" onClick={() => goto(nextLunarPhase(jd + 1 / 1440, 0))}>🌑 {tx({ vi: 'Trăng non', en: 'New' })}</button>
              <button className="btn small" onClick={() => goto(nextLunarPhase(jd + 1 / 1440, 90))}>🌓 {tx({ vi: 'Thượng huyền', en: 'First Q' })}</button>
              <button className="btn small" onClick={() => goto(nextLunarPhase(jd + 1 / 1440, 180))}>🌕 {tx({ vi: 'Trăng tròn', en: 'Full' })}</button>
              <button className="btn small" onClick={() => goto(nextLunarPhase(jd + 1 / 1440, 270))}>🌗 {tx({ vi: 'Hạ huyền', en: 'Last Q' })}</button>
            </div>
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout wide k={tx({ vi: 'Pha', en: 'Phase' })} v={phaseName} tone="accent" />
              <Readout k={tx({ vi: 'Phần được chiếu sáng', en: 'Illuminated' })} v={`${fix(ph.illuminated * 100, 1, lang)}%`} />
              <Readout k={tx({ vi: 'Tuổi trăng', en: 'Moon age' })} v={fix(ph.ageDays, 1, lang)} unit={t('days')} />
              <Readout k={tx({ vi: 'Ly giác ψ', en: 'Elongation ψ' })} v={fix(ph.elongation, 1, lang)} unit="°" />
              <Readout k={tx({ vi: 'Khoảng cách', en: 'Distance' })} v={fix(mp.distanceKm, 0, lang)} unit="km" />
              <Readout k={tx({ vi: 'Trăng mọc', en: 'Moonrise' })} v={jdToLocalHHMM(riseSet.rise, L.tz)} frame={tx({ vi: 'địa hình · khúc xạ 34′ · ±1,5 phút (95%)', en: 'topocentric · 34′ refraction · ±1.5 min (95%)' })} />
              <Readout k={tx({ vi: 'Trăng lặn', en: 'Moonset' })} v={jdToLocalHHMM(riseSet.set, L.tz)} frame={tx({ vi: 'mép trên chạm chân trời', en: 'upper limb on the horizon' })} />
              {student && <Readout k={tx({ vi: 'Đường kính biểu kiến', en: 'Apparent diameter' })} v={fix(((2 * Math.atan(R_MOON / 1000 / mp.distanceKm)) * 180 / Math.PI) * 60, 1, lang)} unit="′" />}
              {student && <Readout k={tx({ vi: 'Vĩ độ hoàng đạo β', en: 'Ecliptic latitude β' })} v={fix(mp.lat, 2, lang)} unit="°" />}
              <Readout k={tx({ vi: 'Bình động kinh độ λ − L', en: 'Libration in longitude λ − L' })} v={fix(moonLibrationLongitude(jd), 1, lang)} unit="°" frame={tx({ vi: 'quay đều + quỹ đạo lệch tâm', en: 'uniform spin + eccentric orbit' })} />
              <Readout k={tx({ vi: 'Khoảng cách Trái Đất – Mặt Trời', en: 'Earth–Sun distance' })} v={fix(sunPosition(jd).distanceAu, 5, lang)} unit="au" />
              {orbitInfo(jd).apsides.filter((a) => a.jd > jd).slice(0, 2).map((a) => <Readout key={a.jd} k={a.kind === 'perigee' ? tx({ vi: 'Cận điểm kế tiếp', en: 'Next perigee' }) : tx({ vi: 'Viễn điểm kế tiếp', en: 'Next apogee' })} v={fmtJd(a.jd)} frame={`${fmt(a.distanceKm, 0, lang)} km · ±0,1 d`} />)}
            </Readouts>
          </Section>
          <Section title={tx({ vi: 'Các pha sắp tới', en: 'Upcoming phases' })}>
            <Readouts>
              {phases.map((p, i) => {
                const eclipse = p.phase === 0
                  ? Math.abs(p.beta) < 1.4 && tx({ vi: `β = ${fix(p.beta, 2, lang)}° - có thể có nhật thực (gợi ý)`, en: `β = ${fix(p.beta, 2, lang)}° - solar eclipse possible (hint)` })
                  : p.phase === 180 && Math.abs(p.beta) < 1.0 && tx({ vi: `β = ${fix(p.beta, 2, lang)}° - có thể có nguyệt thực (gợi ý)`, en: `β = ${fix(p.beta, 2, lang)}° - lunar eclipse possible (hint)` });
                const days = p.jd - jd;
                const until = days < 1 ? tx({ vi: `sau ${fix(days * 24, 1, lang)} giờ`, en: `in ${fix(days * 24, 1, lang)} h` }) : tx({ vi: `sau ${fix(days, 1, lang)} ngày`, en: `in ${fix(days, 1, lang)} d` });
                return (
                  <Readout key={p.phase} wide tone={i === 0 ? 'accent' : undefined} k={`${PHASE_LABEL[p.phase].icon} ${tx(PHASE_LABEL[p.phase].name)}`} v={fmtJd(p.jd)} frame={eclipse ? `${until} · ${eclipse}` : until} />
                );
              })}
            </Readouts>
            <div className="field-hint">{tzLabel(L.tz)} · {tx({ vi: 'sai số đã kiểm định với JPL Horizons: pha chính ≤ 0,3 phút (2000–2030)', en: 'validated against JPL Horizons: principal phases ≤ 0.3 min (2000–2030)' })}</div>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label={tx({ vi: `Mặt Trăng: ${phaseName}, ${Math.round(ph.illuminated * 100)}% được chiếu sáng`, en: `Moon: ${phaseName}, ${Math.round(ph.illuminated * 100)}% illuminated` })} />
    </SimLayout>
  );
}
