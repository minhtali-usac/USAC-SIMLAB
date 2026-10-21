import { useMemo, useRef, useState } from 'react';
import { gamma, rapidity, MUON_LIFETIME, C } from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt, sci } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, withAlpha, label, glowDisk, disk } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

export default function LightClockModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [beta, setBeta] = useParam('beta', 0.6, { min: 0, max: 0.999 });
  const [mb, setMb] = useParam('mb', 0.9995, { min: 0.9, max: 0.99999 });
  const [hKm, setH] = useParam('h', 15, { min: 1, max: 30 });
  const [playing, setPlaying] = useState(true);
  const g = gamma(beta);
  const T = useRef(0); // lab time in units of L/c
  const [, setTick] = useState(0);
  const lastUi = useRef(0);

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, pal.bg);
    const half = w / 2;
    const Lpx = Math.min(h * 0.55, 260);
    const top = h / 2 - Lpx / 2, bot = h / 2 + Lpx / 2;
    const mirrorW = 60;
    const drawClock = (x: number, phase: number, color: string) => {
      ctx.fillStyle = withAlpha(pal.fg, 0.85);
      ctx.fillRect(x - mirrorW / 2, top - 6, mirrorW, 5);
      ctx.fillRect(x - mirrorW / 2, bot + 1, mirrorW, 5);
      ctx.strokeStyle = withAlpha(pal.fg, 0.15);
      ctx.strokeRect(x - mirrorW / 2, top - 6, mirrorW, Lpx + 12);
      const yy = phase < 1 ? bot - phase * Lpx : top + (phase - 1) * Lpx;
      return { yy, color };
    };
    ctx.strokeStyle = withAlpha(pal.fg, 0.12);
    ctx.beginPath(); ctx.moveTo(half, 0); ctx.lineTo(half, h); ctx.stroke();

    // left: clock at rest in the lab
    const tl = T.current;
    const phaseL = tl % 2;
    const lx = half / 2;
    const { yy: ly } = drawClock(lx, phaseL, pal.sun);
    glowDisk(ctx, lx, ly, 4, pal.sun, 3); disk(ctx, lx, ly, 3.5, '#fff7d6');
    label(ctx, tx({ vi: 'Đồng hồ đứng yên', en: 'Clock at rest' }), lx, 26, pal.textDim, { align: 'center', size: 13, weight: 700 });
    label(ctx, `${tx({ vi: 'tích tắc', en: 'ticks' })}: ${Math.floor(tl / 2)}`, lx, h - 26, pal.sun, { align: 'center', size: 15, mono: true, weight: 600 });

    // right: clock moving at β (seen in the lab frame S); one tick = 2γ L/c of lab time
    const tickLab = 2 * g;
    const phaseR = ((tl % tickLab) / tickLab) * 2;
    const travel = (beta * tl * Lpx) % (half - mirrorW);
    const rx = half + mirrorW / 2 + travel;
    const { yy: ry } = drawClock(rx, phaseR, pal.sr);
    // diagonal photon path of the current tick
    const t0 = tl - (tl % tickLab);
    const x0 = rx - beta * (tl - t0) * Lpx;
    ctx.strokeStyle = withAlpha(pal.sr, 0.55);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x0, bot);
    const xMid = x0 + beta * g * Lpx;
    ctx.lineTo(Math.min(xMid, rx), phaseR < 1 ? ry : top);
    if (phaseR >= 1) ctx.lineTo(rx, ry);
    ctx.stroke();
    ctx.setLineDash([]);
    glowDisk(ctx, rx, ry, 4, pal.sr, 3); disk(ctx, rx, ry, 3.5, '#e0f2fe');
    label(ctx, tx({ vi: `Đồng hồ chuyển động β = ${fix(beta, 3, lang)}`, en: `Moving clock β = ${fix(beta, 3, lang)}` }), half + half / 2, 26, pal.textDim, { align: 'center', size: 13, weight: 700 });
    label(ctx, `${tx({ vi: 'tích tắc', en: 'ticks' })}: ${Math.floor(tl / tickLab)}`, half + half / 2, h - 26, pal.sr, { align: 'center', size: 15, mono: true, weight: 600 });
    label(ctx, tx({ vi: 'Cả hai được đo trong hệ phòng thí nghiệm S', en: 'Both measured in the lab frame S' }), w / 2, h - 8, pal.textFaint, { align: 'center', size: 11 });
  }, [beta, g, pal, tx, lang]);

  useAnimationFrame((dt, now) => {
    if (playing) T.current += dt * 1.4;
    redraw();
    if (now - lastUi.current > 150) { lastUi.current = now; setTick((x) => x + 1); }
  });

  // muons
  const gm = gamma(mb);
  const tLab = (hKm * 1000) / (mb * C);
  const surviveRel = Math.exp(-tLab / (gm * MUON_LIFETIME));
  const surviveNaive = Math.exp(-tLab / MUON_LIFETIME);
  const chart = useMemo(() => {
    const rel: [number, number][] = [], naive: [number, number][] = [];
    for (let k = 0; k <= 120; k++) {
      const d = (hKm * k) / 120;
      const tl = (d * 1000) / (mb * C);
      rel.push([hKm - d, Math.exp(-tl / (gm * MUON_LIFETIME))]);
      naive.push([hKm - d, Math.max(1e-12, Math.exp(-tl / MUON_LIFETIME))]);
    }
    return { rel, naive };
  }, [hKm, mb, gm]);

  return (
    <SimLayout
      id="c1"
      lesson={lesson}
      card={card}
      caption={<><span className="k">γ = {fix(g, 4, lang)}</span> · Δt = γ·Δτ = {fix(2 * g, 3, lang)} L/c</>}
      onReset={() => { T.current = 0; }}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>t<sub>S</sub> = {fix(T.current, 1, lang)} L/c<small>{t('coordTime')}</small></>} />}
      panel={
        <>
          <Section title={t('secParams')} dot="var(--grpC)">
            <Slider label={tx({ vi: 'Vận tốc β = v/c', en: 'Speed β = v/c' })} value={beta} min={0} max={0.999} step={0.001} onChange={setBeta} display={fix(beta, 3, lang)} />
            <Readouts>
              <Readout k="γ" v={fix(g, 4, lang)} tone="accent" />
              {student && <Readout k={tx({ vi: 'Rapidity η', en: 'Rapidity η' })} v={fix(rapidity(beta), 4, lang)} />}
              <Readout wide k={tx({ vi: 'Một tích tắc của đồng hồ chuyển động', en: 'One tick of the moving clock' })} v={`${fix(2 * g, 3, lang)} L/c`} frame={tx({ vi: 'đo trong hệ S (thời gian toạ độ)', en: 'measured in S (coordinate time)' })} />
              <Readout wide k={tx({ vi: 'Một tích tắc trong hệ của chính nó', en: 'One tick in its own frame' })} v="2 L/c" frame={t('properTime')} />
            </Readouts>
            {student && <div className="eq-box"><Tex display tex={`\\Delta t = \\gamma\\,\\Delta\\tau = ${g.toFixed(3)}\\times 2L/c`} /></div>}
          </Section>
          <Section title={tx({ vi: 'Muon tia vũ trụ', en: 'Cosmic-ray muons' })}>
            <Slider label={tx({ vi: 'Vận tốc muon β', en: 'Muon speed β' })} value={mb} min={0.9} max={0.99999} step={0.00001} onChange={setMb} display={`${fix(mb, 5, lang)} (γ = ${fix(gm, 1, lang)})`} />
            <Slider label={tx({ vi: 'Độ cao sinh ra', en: 'Production altitude' })} value={hKm} min={1} max={30} step={0.5} onChange={setH} display={`${fix(hKm, 1, lang)} km`} />
            <Readouts>
              <Readout wide k={tx({ vi: 'Thời gian bay (hệ Trái Đất)', en: 'Flight time (Earth frame)' })} v={fmt(tLab * 1e6, 4, lang)} unit="μs" frame={t('coordTime')} />
              <Readout wide k={tx({ vi: 'Thời gian trôi trên đồng hồ muon', en: 'Time elapsed on the muon’s clock' })} v={fmt((tLab / gm) * 1e6, 4, lang)} unit="μs" frame={t('properTime')} />
              <Readout wide k={tx({ vi: 'Bề dày khí quyển trong hệ muon', en: 'Atmosphere thickness in the muon frame' })} v={fmt(hKm / gm, 4, lang)} unit="km" frame={tx({ vi: 'co độ dài h/γ', en: 'length-contracted h/γ' })} />
              <Readout k={tx({ vi: 'Sống sót (tương đối tính)', en: 'Surviving (relativity)' })} v={`${fix(surviveRel * 100, 2, lang)}%`} tone="good" />
              <Readout k={tx({ vi: 'Sống sót (không giãn thời gian)', en: 'Surviving (no time dilation)' })} v={surviveNaive < 1e-4 ? sci(surviveNaive * 100, 2) + '%' : `${fix(surviveNaive * 100, 4, lang)}%`} tone="bad" />
            </Readouts>
            <ChartCard title={tx({ vi: 'Tỉ lệ muon còn lại theo độ cao', en: 'Fraction of muons vs altitude' })}>
              <LineChart height={170} yLog xLabel={tx({ vi: 'độ cao (km)', en: 'altitude (km)' })} yLabel="N/N₀" yDomain={[1e-6, 1]}
                series={[{ data: chart.rel, color: pal.ok, label: tx({ vi: 'có giãn thời gian', en: 'with time dilation' }) }, { data: chart.naive, color: pal.danger, label: tx({ vi: 'không giãn thời gian', en: 'no time dilation' }), dash: '5 4' }]} />
            </ChartCard>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label={tx({ vi: 'Hai đồng hồ ánh sáng', en: 'Two light clocks' })} />
      <div className="stage-overlay br"><span className="scale-note">{tx({ vi: 'Ánh sáng được làm chậm để nhìn thấy (minh hoạ)', en: 'Light slowed down to be visible (illustration)' })}</span></div>
    </SimLayout>
  );
}
