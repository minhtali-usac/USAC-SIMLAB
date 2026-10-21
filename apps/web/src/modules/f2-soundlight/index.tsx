import { useMemo, useRef, useState } from 'react';
import { C, GASES, CONDENSED, soundSpeedGas, lightSpeedIn, thunderDistance, mulberry32 } from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, sci, type L } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, label, withAlpha } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

type Medium = 'air' | 'helium' | 'argon' | 'water' | 'steel' | 'vacuum';
const MED_NAME: Record<Medium, L> = {
  air: { vi: 'Không khí', en: 'Air' }, helium: { vi: 'Heli', en: 'Helium' }, argon: { vi: 'Argon', en: 'Argon' },
  water: { vi: 'Nước', en: 'Water' }, steel: { vi: 'Thép', en: 'Steel' }, vacuum: { vi: 'Chân không', en: 'Vacuum' },
};
const MED_COL: Record<Medium, string> = { air: '#93c5fd', helium: '#fbcfe8', argon: '#c4b5fd', water: '#38bdf8', steel: '#cbd5e1', vacuum: '#334155' };

export default function SoundLightModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [med, setMed] = useParam<Medium>('m', 'air');
  const [Tc, setTc] = useParam('T', 20, { min: -40, max: 60 });
  const [dKm, setDKm] = useParam('d', 2, { min: 0.2, max: 10 });
  const [freq, setFreq] = useParam('f', 1, { min: 0.3, max: 3 });
  const [playing, setPlaying] = useState(true);
  const time = useRef(0), storm = useRef(0);
  const [, setTick] = useState(0);
  const last = useRef(0);

  const gas = GASES.find((g) => g.id === med), cond = CONDENSED.find((c) => c.id === med);
  const v = med === 'vacuum' ? 0 : gas ? soundSpeedGas(gas, Tc + 273.15) : cond!.v;
  const n = med === 'vacuum' ? 1 : gas ? gas.n : cond!.n;
  const vAir20 = soundSpeedGas(GASES[0], 293.15);
  // storm race uses air at the chosen temperature (thunder travels through the atmosphere)
  const vAirT = soundSpeedGas(GASES[0], Tc + 273.15);
  const tThunder = (dKm * 1e3) / vAirT, tFlash = (dKm * 1e3) / C;

  // fixed particle lattice for the sound lane
  const parts = useMemo(() => { const r = mulberry32(4), out: [number, number][] = []; for (let i = 0; i < 90; i++) for (let j = 0; j < 13; j++) out.push([(i + 0.5 + 0.25 * (r() - 0.5)) / 90, (j + 0.5 + 0.3 * (r() - 0.5)) / 13]); return out; }, []);

  useAnimationFrame((dt, now) => {
    if (playing) {
      time.current += dt;
      storm.current += dt;
      if (storm.current > tThunder + 2.5) storm.current = 0;
    }
    redraw();
    if (now - last.current > 100) { last.current = now; setTick((x) => x + 1); }
  });

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    const pad = 18, laneH = (h - 3 * pad - 150) / 2, Wl = w - 2 * pad;
    const tt = time.current;
    // ── lane 1: sound (longitudinal) ──
    {
      const x0 = pad, y0 = pad, k = (2 * Math.PI) / 120; // display wavelength 120 px at the reference speed
      ctx.fillStyle = withAlpha(MED_COL[med], med === 'vacuum' ? 0.03 : 0.07); ctx.fillRect(x0, y0, Wl, laneH);
      ctx.strokeStyle = withAlpha(pal.fg, 0.12); ctx.strokeRect(x0, y0, Wl, laneH);
      // speaker
      const cone = 6 * Math.sin(2 * Math.PI * freq * tt);
      ctx.fillStyle = '#475569'; ctx.fillRect(x0 + 8, y0 + laneH / 2 - 26, 16, 52);
      ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(x0 + 24 + cone, y0 + laneH / 2 - 34); ctx.lineTo(x0 + 24 + cone, y0 + laneH / 2 + 34); ctx.lineTo(x0 + 24, y0 + laneH / 2 + 12); ctx.lineTo(x0 + 24, y0 + laneH / 2 - 12); ctx.fill();
      if (med !== 'vacuum') {
        const vd = 120 * freq * (v / vAir20); // px/s: wavelength scales with speed at fixed frequency
        const kk = (2 * Math.PI * freq) / vd;
        const front = vd * tt; // wave front after start
        for (const [px, py] of parts) {
          const xq = x0 + 34 + px * (Wl - 40), yq = y0 + 6 + py * (laneH - 12), dx = xq - (x0 + 34);
          const s = dx < front ? 7 * Math.sin(kk * dx - 2 * Math.PI * freq * tt) : 0;
          const comp = dx < front ? -Math.cos(kk * dx - 2 * Math.PI * freq * tt) : 0; // compression ∝ −∂s/∂x
          ctx.fillStyle = comp > 0 ? withAlpha('#fde68a', 0.35 + 0.6 * comp) : withAlpha(MED_COL[med], 0.55 + 0.35 * comp);
          ctx.beginPath(); ctx.arc(xq - s, yq, 1.7 + 0.9 * Math.max(0, comp), 0, 2 * Math.PI); ctx.fill();
        }
        void k;
      } else {
        label(ctx, tx({ vi: 'Không có hạt nào để đẩy nhau - âm thanh không truyền được', en: 'No particles to push each other - sound cannot travel' }), x0 + Wl / 2, y0 + laneH / 2 + 4, '#fca5a5', { size: 13, align: 'center', weight: 700 });
      }
      label(ctx, tx({ vi: `Âm thanh - sóng dọc · v = ${med === 'vacuum' ? '0' : fmt(v, 4, lang)} m/s`, en: `Sound - longitudinal · v = ${med === 'vacuum' ? '0' : fmt(v, 4, lang)} m/s` }), x0 + 34, y0 + 16, pal.text, { size: 12, weight: 700, halo: pal.bg });
    }
    // ── lane 2: light (transverse) ──
    {
      const x0 = pad, y0 = 2 * pad + laneH;
      ctx.fillStyle = withAlpha(MED_COL[med], med === 'vacuum' ? 0.03 : 0.07); ctx.fillRect(x0, y0, Wl, laneH);
      ctx.strokeStyle = withAlpha(pal.fg, 0.12); ctx.strokeRect(x0, y0, Wl, laneH);
      // lamp
      const g = ctx.createRadialGradient(x0 + 20, y0 + laneH / 2, 0, x0 + 20, y0 + laneH / 2, 26); g.addColorStop(0, '#fffbe6'); g.addColorStop(1, 'rgba(253,224,71,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x0 + 20, y0 + laneH / 2, 26, 0, 2 * Math.PI); ctx.fill();
      if (n !== null) {
        const vd = 120 * freq * 1.15 / n, kk = (2 * Math.PI * freq) / vd, front = vd * tt;
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2; ctx.beginPath();
        for (let xx = 0; xx < Wl - 40; xx += 2) {
          const yv = xx < front ? 0.32 * laneH * Math.sin(kk * xx - 2 * Math.PI * freq * tt) : 0;
          if (xx) ctx.lineTo(x0 + 34 + xx, y0 + laneH / 2 - yv); else ctx.moveTo(x0 + 34 + xx, y0 + laneH / 2 - yv);
        }
        ctx.stroke();
        label(ctx, tx({ vi: `Ánh sáng - sóng ngang · c/n = ${fix(lightSpeedIn(n) / 1e3, 0, lang)} km/s`, en: `Light - transverse · c/n = ${fix(lightSpeedIn(n) / 1e3, 0, lang)} km/s` }), x0 + 34, y0 + 16, pal.text, { size: 12, weight: 700, halo: pal.bg });
        label(ctx, tx({ vi: 'làn này chạy chậm hơn làn trên khoảng một triệu lần', en: 'this lane is slowed about a million times more than the one above' }), x0 + Wl - 8, y0 + laneH - 8, pal.textFaint, { size: 10.5, align: 'right' });
      } else {
        label(ctx, tx({ vi: 'Kim loại phản xạ và hấp thụ ánh sáng nhìn thấy - ánh sáng không đi xuyên qua', en: 'Metals reflect and absorb visible light - light does not pass through' }), x0 + Wl / 2, y0 + laneH / 2 + 4, '#fca5a5', { size: 13, align: 'center', weight: 700 });
      }
    }
    // ── lane 3: lightning and thunder, real time ──
    {
      const y0 = 3 * pad + 2 * laneH, x0 = pad + 60, x1 = w - pad - 60, cy = y0 + 70, ts = storm.current;
      label(ctx, tx({ vi: `Sét cách bạn ${fix(dKm, 1, lang)} km (thời gian thực, sấm truyền trong không khí ${fix(Tc, 0, lang)} °C)`, en: `Lightning ${fix(dKm, 1, lang)} km away (real time, thunder through air at ${fix(Tc, 0, lang)} °C)` }), pad, y0 + 12, pal.text, { size: 12, weight: 700 });
      // cloud + bolt
      ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.ellipse(x0, cy - 34, 34, 14, 0, 0, 2 * Math.PI); ctx.fill();
      if (ts < 0.25) { ctx.strokeStyle = '#fef9c3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, cy - 22); ctx.lineTo(x0 - 8, cy - 4); ctx.lineTo(x0 + 4, cy - 2); ctx.lineTo(x0 - 6, cy + 20); ctx.stroke(); ctx.fillStyle = 'rgba(254,249,195,0.12)'; ctx.fillRect(pad, y0 + 20, w - 2 * pad, 120); }
      // ground line + observer
      ctx.strokeStyle = withAlpha(pal.fg, 0.25); ctx.beginPath(); ctx.moveTo(x0 - 30, cy + 24); ctx.lineTo(x1 + 30, cy + 24); ctx.stroke();
      ctx.fillStyle = pal.text; ctx.beginPath(); ctx.arc(x1, cy - 2, 6, 0, 2 * Math.PI); ctx.fill(); ctx.fillRect(x1 - 2, cy + 4, 4, 18);
      label(ctx, tx({ vi: 'bạn', en: 'you' }), x1, cy + 40, pal.text, { size: 11, align: 'center' });
      // thunder front
      const frac = Math.min(1, ts / tThunder), xf = x0 + frac * (x1 - x0);
      if (ts < tThunder) { for (let r = 0; r < 3; r++) { ctx.strokeStyle = withAlpha('#93c5fd', 0.5 - 0.15 * r); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xf - r * 10, cy, 14 + r * 4, -0.7, 0.7); ctx.stroke(); } }
      const flashSeen = ts >= tFlash, heard = ts >= tThunder;
      label(ctx, `${tx({ vi: 'thấy chớp sau', en: 'flash seen after' })} ${fmt(tFlash * 1e6, 3, lang)} µs`, x1 - 10, cy - 22, flashSeen ? '#fef08a' : pal.textFaint, { size: 11, align: 'right' });
      label(ctx, `${tx({ vi: 'nghe sấm sau', en: 'thunder heard after' })} ${fix(tThunder, 2, lang)} s${heard ? ' ✓' : ''}`, x1 - 10, cy + 60, heard ? '#93c5fd' : pal.textFaint, { size: 11, align: 'right' });
      label(ctx, `${tx({ vi: 'đếm', en: 'count' })}: ${fix(Math.min(ts, tThunder), 1, lang)} s`, x0 - 30, cy + 60, '#fde68a', { size: 14, weight: 700, mono: true });
    }
  }, [med, v, n, Tc, dKm, freq, pal, lang, tx, parts, tThunder, tFlash]);

  const est = thunderDistance(tThunder - tFlash, vAirT) / 1e3;
  return (
    <SimLayout
      id="f2"
      lesson={lesson}
      card={card}
      caption={<><span className="k">{tx(MED_NAME[med])}</span> · {tx({ vi: 'âm thanh', en: 'sound' })} {med === 'vacuum' ? '0' : fmt(v, 4, lang)} m/s · {tx({ vi: 'ánh sáng', en: 'light' })} {n === null ? tx({ vi: 'không xuyên qua', en: 'blocked' }) : `${fix(lightSpeedIn(n) / 1e3, 0, lang)} km/s`}{med !== 'vacuum' && n !== null ? ` · ${tx({ vi: 'ánh sáng nhanh hơn', en: 'light is faster by' })} ${sci(lightSpeedIn(n) / v, 3, lang)} ${tx({ vi: 'lần', en: '×' })}` : ''}</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      onReset={() => { time.current = 0; storm.current = 0; }}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>{tx({ vi: 'Hai loại sóng', en: 'Two kinds of wave' })}<small>{tx(MED_NAME[med])}</small></>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Môi trường', en: 'Medium' })} dot="var(--grpF)">
            <div className="row">{(Object.keys(MED_NAME) as Medium[]).map((m) => <button key={m} className={`btn small${med === m ? ' active' : ''}`} onClick={() => { setMed(m); time.current = 0; }}>{tx(MED_NAME[m])}</button>)}</div>
            {(gas || med === 'air') && <Slider label={tx({ vi: 'Nhiệt độ khí', en: 'Gas temperature' })} value={Tc} min={-40} max={60} step={1} onChange={setTc} display={`${fix(Tc, 0, lang)} °C`} />}
            <Slider label={tx({ vi: 'Tần số nguồn (hiển thị)', en: 'Source frequency (display)' })} value={freq} min={0.3} max={3} step={0.05} onChange={setFreq} display={`${fix(freq, 2, lang)} Hz`} hint={tx({ vi: 'Cùng tần số: môi trường truyền nhanh hơn thì bước sóng dài hơn (λ = v/f)', en: 'Same frequency: a faster medium gives a longer wavelength (λ = v/f)' })} />
            {student && <div className="eq-box"><Tex display tex={lang === 'vi' ? 'v_{\\text{khí}} = \\sqrt{\\frac{\\gamma R T}{M}},\\qquad v_{\\text{ánh sáng}} = \\frac{c}{n}' : 'v_{\\text{gas}} = \\sqrt{\\frac{\\gamma R T}{M}},\\qquad v_{\\text{light}} = \\frac{c}{n}'} /></div>}
          </Section>
          <Section title={tx({ vi: 'Sét và sấm', en: 'Lightning and thunder' })}>
            <Slider label={tx({ vi: 'Khoảng cách tới tia sét', en: 'Distance to the strike' })} value={dKm} min={0.2} max={10} step={0.1} onChange={(x) => { setDKm(x); storm.current = 0; }} display={`${fix(dKm, 1, lang)} km`} />
            <div className="good-box">{tx({ vi: `Quy tắc: đếm giây từ lúc thấy chớp tới lúc nghe sấm, chia 3 ⇒ số km. Ở đây ${fix(tThunder, 1, lang)} s ÷ 3 ≈ ${fix(tThunder / 3, 1, lang)} km (thật: ${fix(est, 2, lang)} km).`, en: `Rule: count seconds from flash to thunder, divide by 3 ⇒ km. Here ${fix(tThunder, 1, lang)} s ÷ 3 ≈ ${fix(tThunder / 3, 1, lang)} km (true: ${fix(est, 2, lang)} km).` })}</div>
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k={tx({ vi: 'Tốc độ âm', en: 'Speed of sound' })} v={med === 'vacuum' ? '0' : fmt(v, 4, lang)} unit="m/s" tone="accent" frame={med === 'vacuum' ? tx({ vi: 'không có môi trường', en: 'no medium' }) : gas ? `γ = ${fix(gas.gamma, 3, lang)}, M = ${fix(gas.molarMass * 1e3, 3, lang)} g/mol` : med === 'water' ? tx({ vi: 'nước tinh khiết, 20 °C (đo)', en: 'pure water, 20 °C (measured)' }) : tx({ vi: 'thép không gỉ 347, sóng dọc (đo)', en: '347 stainless steel, longitudinal (measured)' })} />
              <Readout k={tx({ vi: 'Tốc độ ánh sáng', en: 'Speed of light' })} v={n === null ? '-' : fix(lightSpeedIn(n) / 1e3, 0, lang)} unit={n === null ? '' : 'km/s'} frame={n === null ? tx({ vi: 'không xuyên qua', en: 'opaque' }) : `n = ${fix(n, n < 1.01 ? 6 : 3, lang)}`} />
              <Readout k={tx({ vi: 'Tỉ số ánh sáng / âm', en: 'Light / sound ratio' })} v={med === 'vacuum' || n === null ? '-' : sci(lightSpeedIn(n) / v, 3, lang)} />
              <Readout k={tx({ vi: 'Âm đi 1 km mất', en: 'Sound needs for 1 km' })} v={med === 'vacuum' ? '∞' : fix(1000 / v, 2, lang)} unit={tx({ vi: 'giây', en: 's' })} />
            </Readouts>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label={tx({ vi: 'So sánh sóng âm và sóng ánh sáng', en: 'Sound and light waves compared' })} />
    </SimLayout>
  );
}
