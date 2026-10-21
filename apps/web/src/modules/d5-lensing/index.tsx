import { useMemo, useRef, useState } from 'react';
import { einsteinAngle, imagePositions, imageMagnifications, totalMagnification, microlensU, lightDeflectionWeak, M_SUN, GM_SUN, R_SUN, PARSEC, AU, ARCSEC_PER_RAD } from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Segmented, Toggle } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette, usePointer } from '../../lib/hooks';
import { useSettings, useLevelAtLeast } from '../../store/settings';
import { label } from '../../lib/canvas';
import { lesson, card } from './content';

export default function LensingModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const quality = useSettings((s) => s.quality);
  const student = useLevelAtLeast('student');
  const [mode, setMode] = useParam<'image' | 'micro'>('mode', 'image');
  const [sx, setSx] = useParam('sx', 0.35, { min: -2.5, max: 2.5 });
  const [sy, setSy] = useParam('sy', 0.12, { min: -2.5, max: 2.5 });
  const [size, setSize] = useParam('size', 0.25, { min: 0.03, max: 1 });
  const [u0, setU0] = useParam('u0', 0.3, { min: 0.01, max: 1.5 });
  const [tE, setTE] = useParam('tE', 20, { min: 1, max: 200 });
  const [ring, setRing] = useParam('ring', true);
  const [mass, setMass] = useParam('M', 0.5, { min: 0.01, max: 100 });
  const [dl, setDl] = useParam('Dl', 4, { min: 0.1, max: 7.9 });
  const [ds, setDs] = useParam('Ds', 8, { min: 0.2, max: 20 });
  const [playing, setPlaying] = useState(true);
  const tRef = useRef(-2);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);
  const view = useRef({ cx: 0, cy: 0, sc: 1 });

  const src = (): [number, number] => (mode === 'image' ? [sx, sy] : [tRef.current, u0]);
  const imgRef = useRef<ImageData | null>(null);
  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    const scale = quality === 'saver' ? 3 : 2;
    const W = Math.ceil(w / scale), H = Math.ceil(h / scale);
    if (!imgRef.current || imgRef.current.width !== W || imgRef.current.height !== H) imgRef.current = new ImageData(W, H);
    const img = imgRef.current;
    const span = 3.0;
    const sc = Math.min(w, h) / (2 * span);
    const cx = w / 2, cy = h / 2;
    view.current = { cx, cy, sc };
    const [bx, by] = src();
    const s2 = size * size;
    const isMicro = mode === 'micro';
    for (let j = 0; j < H; j++) {
      const ty = (cy - (j + 0.5) * scale) / sc;
      for (let i = 0; i < W; i++) {
        const tx0 = ((i + 0.5) * scale - cx) / sc;
        const r2 = tx0 * tx0 + ty * ty;
        const k = (j * W + i) * 4;
        // lens equation β = θ − θ/|θ|²  (θ_E = 1)
        const ux = tx0 - tx0 / r2 - bx, uy = ty - ty / r2 - by;
        let I: number, R: number, G: number, B: number;
        if (isMicro) {
          const d2 = (ux * ux + uy * uy) / (0.035 * 0.035);
          I = Math.exp(-d2);
          R = 255 * I; G = 236 * I; B = 190 * I;
        } else {
          // procedural spiral galaxy (decorative) in source-plane coordinates
          const rr = Math.sqrt(ux * ux + uy * uy) / size;
          const ang = Math.atan2(uy, ux);
          const arms = 0.5 + 0.5 * Math.cos(2 * ang - 5 * Math.log(rr + 0.05));
          I = Math.exp(-rr * rr * 1.2) * (0.35 + 0.65 * arms) + 1.6 * Math.exp(-((ux * ux + uy * uy) / s2) * 18);
          R = 120 * I + 40 * I * I; G = 150 * I + 30 * I * I; B = 255 * I;
        }
        const bg = pal.light ? 250 : 4;
        img.data[k] = Math.min(255, bg + R); img.data[k + 1] = Math.min(255, bg + G); img.data[k + 2] = Math.min(255, bg + 6 + B); img.data[k + 3] = 255;
      }
    }
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    off.getContext('2d')!.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, W * scale, H * scale);
    // lens
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    if (ring) {
      ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(94,234,212,0.75)';
      ctx.beginPath(); ctx.arc(cx, cy, sc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, 'θ_E', cx + sc * 0.72 + 4, cy - sc * 0.72 - 4, 'rgba(94,234,212,0.95)', { size: 12 });
      // true source position marker
      ctx.strokeStyle = 'rgba(244,114,182,0.9)'; ctx.lineWidth = 1.5;
      const px = cx + bx * sc, py = cy - by * sc;
      ctx.beginPath(); ctx.moveTo(px - 7, py - 7); ctx.lineTo(px + 7, py + 7); ctx.moveTo(px + 7, py - 7); ctx.lineTo(px - 7, py + 7); ctx.stroke();
      label(ctx, tx({ vi: 'vị trí thật', en: 'true position' }), px + 9, py + 12, 'rgba(244,114,182,0.95)', { size: 11 });
      if (isMicro) { ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(244,114,182,0.4)'; ctx.beginPath(); ctx.moveTo(0, cy - u0 * sc); ctx.lineTo(w, cy - u0 * sc); ctx.stroke(); ctx.setLineDash([]); }
    }
    label(ctx, mode === 'image' ? tx({ vi: 'Kéo để di chuyển nguồn · đơn vị θ_E', en: 'Drag to move the source · units of θ_E' }) : tx({ vi: 'Nguồn (sao) trượt qua thấu kính', en: 'Source star sliding past the lens' }), 12, h - 12, pal.light ? '#3a4268' : '#8890b5', { size: 11 });
  }, [mode, sx, sy, size, u0, ring, pal, quality, tx]);

  usePointer(canvasRef, {
    down: (x, y) => { if (mode === 'image') { const { cx, cy, sc } = view.current; setSx(+((x - cx) / sc).toFixed(3)); setSy(+((cy - y) / sc).toFixed(3)); } },
    move: (x, y, isDown) => { if (isDown && mode === 'image') { const { cx, cy, sc } = view.current; setSx(+((x - cx) / sc).toFixed(3)); setSy(+((cy - y) / sc).toFixed(3)); } },
  });

  useAnimationFrame((dt, now) => {
    if (mode === 'micro') {
      if (playing) { tRef.current += dt * 0.5; if (tRef.current > 2.5) tRef.current = -2.5; }
      redraw();
    }
    if (now - lastUi.current > 120) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const [bx, by] = src();
  const u = Math.hypot(bx, by);
  const [tp, tm] = imagePositions(u, 1);
  const [Ap, Am] = imageMagnifications(u);
  const A = totalMagnification(u);
  const kpc = 1000 * PARSEC;
  const thE = dl < ds ? einsteinAngle(mass * M_SUN, dl * kpc, ds * kpc) : NaN;
  const RE_au = (thE * dl * kpc) / AU;
  const tEdays = (RE_au * AU) / (200e3) / 86400; // 200 km/s relative transverse speed
  const lc = useMemo(() => {
    const pts: [number, number][] = [];
    for (let k = 0; k <= 300; k++) { const tt = -2.5 + (5 * k) / 300; pts.push([tt * tE, totalMagnification(microlensU(tt, 0, 1, u0))]); }
    return pts;
  }, [u0, tE]);

  return (
    <SimLayout
      id="d5"
      lesson={lesson}
      card={card}
      caption={<><span className="k">A = {fix(A, 3, lang)}</span> · u = {fix(u, 3, lang)} · {'$\\theta_\\pm$'} = {fix(tp, 3, lang)}, {fix(tm, 3, lang)} θ_E</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={mode === 'micro' ? <Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>t − t₀ = {fix(tRef.current * tE, 1, lang)} {t('days')}</>} /> : undefined}
      panel={
        <>
          <Section title={tx({ vi: 'Chế độ', en: 'Mode' })} dot="var(--grpD)">
            <Segmented value={mode} onChange={setMode} options={[{ value: 'image', label: tx({ vi: 'Ảnh thiên hà', en: 'Galaxy image' }) }, { value: 'micro', label: 'Microlensing' }]} />
            {mode === 'image' ? (
              <>
                <Slider label={tx({ vi: 'Nguồn x', en: 'Source x' })} value={sx} min={-2.5} max={2.5} step={0.005} onChange={setSx} display={`${fix(sx, 3, lang)} θ_E`} />
                <Slider label={tx({ vi: 'Nguồn y', en: 'Source y' })} value={sy} min={-2.5} max={2.5} step={0.005} onChange={setSy} display={`${fix(sy, 3, lang)} θ_E`} />
                <Slider label={tx({ vi: 'Kích thước nguồn', en: 'Source size' })} value={size} min={0.03} max={1} step={0.01} onChange={setSize} display={`${fix(size, 2, lang)} θ_E`} />
              </>
            ) : (
              <>
                <Slider label={tx({ vi: 'Tham số va chạm u₀', en: 'Impact parameter u₀' })} value={u0} min={0.01} max={1.5} step={0.005} onChange={setU0} display={`${fix(u0, 3, lang)} θ_E`} />
                <Slider label={tx({ vi: 'Thời gian Einstein t_E', en: 'Einstein time t_E' })} value={tE} min={1} max={200} step={1} onChange={setTE} display={`${tE} ${t('days')}`} />
              </>
            )}
            <Toggle label={tx({ vi: 'Vòng Einstein & vị trí thật', en: 'Einstein ring & true position' })} checked={ring} onChange={setRing} swatch="var(--teal)" />
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k="u = β/θ_E" v={fix(u, 3, lang)} />
              <Readout k={tx({ vi: 'Độ phóng đại tổng A', en: 'Total magnification A' })} v={fix(A, 3, lang)} tone="accent" />
              <Readout k="θ₊" v={fix(tp, 3, lang)} unit="θ_E" />
              <Readout k="θ₋" v={fix(tm, 3, lang)} unit="θ_E" />
              {student && <Readout k="A₊" v={fix(Ap, 3, lang)} />}
              {student && <Readout k="A₋" v={fix(Am, 3, lang)} />}
            </Readouts>
            {student && <div className="eq-box"><Tex display tex={'\\beta = \\theta - \\frac{\\theta_E^2}{\\theta},\\qquad A = \\frac{u^2+2}{u\\sqrt{u^2+4}}'} /></div>}
            {mode === 'micro' && (
              <ChartCard title={tx({ vi: 'Đường cong microlensing', en: 'Microlensing light curve' })}>
                <LineChart height={170} xLabel={`t − t₀ (${t('days')})`} yLabel="A" series={[{ data: lc, color: pal.sun }]} vlines={[{ x: tRef.current * tE, color: pal.teal }]} />
              </ChartCard>
            )}
          </Section>
          <Section title={tx({ vi: 'Máy tính bán kính Einstein', en: 'Einstein-radius calculator' })} open={student}>
            <Slider label={tx({ vi: 'Khối lượng thấu kính', en: 'Lens mass' })} value={mass} min={0.01} max={100} log step={0.001} onChange={setMass} display={`${fmt(mass, 3, lang)} M☉`} />
            <Slider label="D_l" value={dl} min={0.1} max={7.9} step={0.05} onChange={setDl} display={`${fix(dl, 2, lang)} kpc`} />
            <Slider label="D_s" value={ds} min={0.2} max={20} step={0.05} onChange={setDs} display={`${fix(ds, 2, lang)} kpc`} />
            <Readouts>
              <Readout k="θ_E" v={Number.isFinite(thE) ? fix(thE * ARCSEC_PER_RAD * 1000, 3, lang) : '-'} unit="mas" tone="accent" />
              <Readout k="R_E" v={Number.isFinite(RE_au) ? fix(RE_au, 2, lang) : '-'} unit="au" />
              <Readout wide k={tx({ vi: 't_E với $v_\\perp$ = 200 km/s', en: 't_E for $v_\\perp$ = 200 km/s' })} v={Number.isFinite(tEdays) ? fix(tEdays, 1, lang) : '-'} unit={t('days')} />
              <Readout wide k={tx({ vi: 'Lệch tại rìa Mặt Trời $4GM/(c^2R_\\odot)$', en: 'Deflection at the solar limb $4GM/(c^2R_\\odot)$' })} v={fix(lightDeflectionWeak(GM_SUN, R_SUN) * ARCSEC_PER_RAD, 3, lang)} unit="″" />
            </Readouts>
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} style={{ touchAction: 'none', cursor: mode === 'image' ? 'grab' : 'default' }} role="img" aria-label={tx({ vi: 'Ảnh thấu kính hấp dẫn', en: 'Gravitational lensing image' })} />
      <div className="stage-overlay tr"><span className="scale-note">{tx({ vi: 'Dò tia ngược qua phương trình thấu kính · thiên hà nguồn: thủ tục', en: 'Inverse ray shooting through the lens equation · source galaxy: procedural' })}</span></div>
    </SimLayout>
  );
}
