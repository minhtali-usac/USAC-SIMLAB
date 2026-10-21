import { useMemo } from 'react';
import { BRIGHT_STARS, bvToTemperature, blackbodyCss, gamma, aberrateCos, gaussianRng, type Vec3, normalize, cross, dot } from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Select, Toggle } from '../../components/Controls';
import { Tex } from '../../components/Tex';
import { useT, fix, fmt } from '../../i18n';
import { useParam } from '../../lib/router';
import { useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, label } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson, card } from './content';

const TARGETS: Record<string, { name: { vi: string; en: string }; ra: number; dec: number }> = {
  betelgeuse: { name: { vi: 'Betelgeuse (Lạp Hộ)', en: 'Betelgeuse (Orion)' }, ra: 88.79, dec: 7.41 },
  polaris: { name: { vi: 'Sao Bắc Cực', en: 'Polaris' }, ra: 37.95, dec: 89.26 },
  vega: { name: { vi: 'Vega', en: 'Vega' }, ra: 279.23, dec: 38.78 },
  alphaCen: { name: { vi: 'α Centauri (gần nhất)', en: 'α Centauri (nearest)' }, ra: 219.9, dec: -60.83 },
  galCenter: { name: { vi: 'Tâm Ngân Hà (Sgr A*)', en: 'Galactic centre (Sgr A*)' }, ra: 266.42, dec: -29.01 },
};

function radec(ra: number, dec: number): Vec3 {
  const a = (ra * Math.PI) / 180, d = (dec * Math.PI) / 180;
  return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
}

export default function StarbowModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [target, setTarget] = useParam('target', 'betelgeuse');
  const [beta, setBeta] = useParam('beta', 0.8, { min: 0, max: 0.99999999 });
  const [compare, setCompare] = useParam('cmp', true);
  const [labels, setLabels] = useParam('lbl', true);
  const T = TARGETS[target] ?? TARGETS.betelgeuse;

  const stars = useMemo(() => {
    const rng = gaussianRng(2024);
    const faint = Array.from({ length: 1800 }, () => {
      const z = 2 * rng.uniform() - 1, ph = 2 * Math.PI * rng.uniform();
      const r = Math.sqrt(1 - z * z);
      return { v: [r * Math.cos(ph), r * Math.sin(ph), z] as Vec3, mag: 3.5 + 3 * rng.uniform() ** 0.5, T: 3000 + 9000 * rng.uniform() ** 2, name: '' };
    });
    const bright = BRIGHT_STARS.map((s) => ({ v: radec(s.ra, s.dec), mag: s.mag, T: bvToTemperature(s.bv), name: s.name }));
    return [...faint, ...bright];
  }, []);

  const g = gamma(beta);
  const { canvasRef } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, '#000106');
    const dir = normalize(radec(T.ra, T.dec));
    const e1 = normalize(cross(dir, Math.abs(dir[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
    const e2 = cross(dir, e1);
    const panels = compare ? [{ b: 0, x0: 0, pw: w / 2 }, { b: beta, x0: w / 2, pw: w / 2 }] : [{ b: beta, x0: 0, pw: w }];
    for (const P of panels) {
      const R = Math.min(P.pw, h) * 0.46;
      const cx = P.x0 + P.pw / 2, cy = h / 2;
      ctx.strokeStyle = 'rgba(140,160,255,0.18)';
      for (const ang of [45, 90, 135, 180]) { ctx.beginPath(); ctx.arc(cx, cy, (ang / 180) * R, 0, Math.PI * 2); ctx.stroke(); }
      const gm = gamma(P.b);
      const placed: [number, number][] = [];
      for (const s of stars) {
        const c = dot(s.v, dir);
        const cp = aberrateCos(c, P.b);
        const th = Math.acos(Math.max(-1, Math.min(1, cp)));
        const az = Math.atan2(dot(s.v, e2), dot(s.v, e1));
        const D = gm * (1 + P.b * c);
        const m = s.mag - 5 * Math.log10(D);
        const Tn = s.T * D;
        if (m > 7.5) continue;
        const vis = Tn < 2200 ? Math.max(0, (Tn - 900) / 1300) : 1;
        if (vis <= 0) continue;
        const rr = (th / Math.PI) * R;
        const x = cx + rr * Math.cos(az), y = cy - rr * Math.sin(az);
        const size = Math.max(0.5, 2.6 - 0.36 * m);
        ctx.globalAlpha = Math.min(1, vis * Math.max(0.2, 1 - (m - 2) / 6.5));
        ctx.fillStyle = blackbodyCss(Math.min(Tn, 60000));
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
        if (labels && s.name && m < (P.b > 0.5 ? 0.3 : 1.2) && P.b === beta && placed.every(([px, py]) => Math.abs(px - x) > 60 || Math.abs(py - y) > 14)) { placed.push([x, y]); label(ctx, s.name, x + 5, y - 6, 'rgba(200,210,255,0.75)', { size: 10 }); }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(94,234,212,0.6)';
      ctx.beginPath(); ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8); ctx.stroke();
      if (P.b > 0) {
        const half = (Math.acos(P.b) / Math.PI) * R;
        ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(251,191,36,0.6)';
        ctx.beginPath(); ctx.arc(cx, cy, half, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
      label(ctx, P.b === 0 ? tx({ vi: 'Đứng yên (β = 0)', en: 'At rest (β = 0)' }) : `${P.b > 0.9999 ? `1 − β = ${fmt(1 - P.b, 3, lang)}` : `β = ${fix(P.b, 5, lang)}`} · γ = ${fmt(gm, 4, lang)}`, P.x0 + 12, 18, '#cbd5ff', { size: 12, weight: 700 });
      label(ctx, tx({ vi: 'tâm: hướng bay · mép: phía sau', en: 'centre: ahead · rim: behind' }), P.x0 + 12, h - 12, '#6c759c', { size: 10.5 });
    }
    if (compare) { ctx.strokeStyle = 'rgba(140,160,255,0.2)'; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke(); }
  }, [stars, beta, compare, labels, T, tx, lang]);

  return (
    <SimLayout
      id="c4"
      lesson={lesson}
      card={card}
      caption={<><span className="k">γ = {fmt(g, 4, lang)}</span> · {tx({ vi: 'nửa bầu trời dồn vào nón', en: 'half the sky within' })} {fix((Math.acos(beta) * 180) / Math.PI, 1, lang)}° · D = {fmt(g * (1 + beta), 3, lang)}</>}
      panel={
        <>
          <Section title={tx({ vi: 'Chuyến bay', en: 'Flight' })} dot="var(--grpC)">
            <Select label={tx({ vi: 'Hướng bay tới', en: 'Heading towards' })} value={target} onChange={setTarget} options={Object.entries(TARGETS).map(([k, v]) => ({ value: k, label: tx(v.name) }))} />
            <Slider label={tx({ vi: 'Rapidity η (β = tanh η)', en: 'Rapidity η (β = tanh η)' })} value={Math.atanh(beta)} min={0} max={9} step={0.001} onChange={(v) => setBeta(+Math.tanh(v).toPrecision(12))} display={beta > 0.9999 ? `1 − β = ${fmt(1 - beta, 3, lang)}` : `β = ${fix(beta, 5, lang)}`} />
            <Toggle label={tx({ vi: 'So sánh với β = 0', en: 'Compare with β = 0' })} checked={compare} onChange={setCompare} />
            <Toggle label={tx({ vi: 'Tên sao sáng', en: 'Bright star names' })} checked={labels} onChange={setLabels} />
          </Section>
          <Section title={t('secReadouts')}>
            <Readouts>
              <Readout k="γ" v={fmt(g, 5, lang)} />
              <Readout k={tx({ vi: 'Nón nửa bầu trời', en: 'Half-sky cone' })} v={fix((Math.acos(beta) * 180) / Math.PI, 2, lang)} unit="°" tone="accent" />
              <Readout k={tx({ vi: 'D phía trước', en: 'D ahead' })} v={fmt(g * (1 + beta), 4, lang)} />
              <Readout k={tx({ vi: 'D phía sau', en: 'D behind' })} v={fmt(g * (1 - beta), 4, lang)} />
              <Readout wide k={tx({ vi: 'Nhiệt độ CMB phía trước', en: 'Forward CMB temperature' })} v={fmt(2.7255 * g * (1 + beta), 4, lang)} unit="K" frame={tx({ vi: 'T′ = D·2,7255 K (Fixsen 2009), đo trong hệ tàu', en: 'T′ = D·2.7255 K (Fixsen 2009), ship frame' })} />
            </Readouts>
            {student && <div className="eq-box"><Tex display tex={'\\cos\\theta\' = \\frac{\\cos\\theta + \\beta}{1 + \\beta\\cos\\theta},\\qquad D = \\gamma(1 + \\beta\\cos\\theta)'} /></div>}
          </Section>
        </>
      }
    >
      <canvas ref={canvasRef} role="img" aria-label={tx({ vi: 'Bầu trời sao khi bay gần tốc độ ánh sáng', en: 'Star field at near-light speed' })} />
      <div className="stage-overlay br"><span className="scale-note">{tx({ vi: 'Nét đứt vàng: ảnh của bán cầu phía trước · sao mờ ngẫu nhiên (trang trí)', en: 'Yellow dashes: image of the forward hemisphere · faint stars random (decorative)' })}</span></div>
    </SimLayout>
  );
}
