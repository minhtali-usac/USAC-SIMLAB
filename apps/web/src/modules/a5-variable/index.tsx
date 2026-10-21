import { useMemo, useRef, useState } from 'react';
import {
  VARIABLE_STARS, syntheticSeries, syntheticMag, glsPeriodogram, glsFit, frequencyGrid, topPeaks, bootstrapFap, intensityMeanMag,
  leavittMV, cepheidDistance, fold,
} from '@usac/sim-core';
import { SimLayout } from '../../components/SimLayout';
import { Section, Slider, Readout, Readouts, Select, Segmented } from '../../components/Controls';
import { Timeline } from '../../components/Timeline';
import { LineChart, ChartCard } from '../../components/LineChart';
import { Tex, MathText } from '../../components/Tex';
import { useT, fix } from '../../i18n';
import { useParam } from '../../lib/router';
import { useAnimationFrame, useCanvas2D, usePalette } from '../../lib/hooks';
import { clear, label } from '../../lib/canvas';
import { useLevelAtLeast } from '../../store/settings';
import { lesson } from './lesson';
import { card } from './card';

export default function VariableModule() {
  const { t, tx, lang } = useT();
  const pal = usePalette();
  const student = useLevelAtLeast('student');
  const [starId, setStar] = useParam('star', 'dcep');
  const S = VARIABLE_STARS.find((s) => s.id === starId) ?? VARIABLE_STARS[0];
  const [n, setN] = useParam('n', 80, { min: 15, max: 400 });
  const [base, setBase] = useParam('T', 40, { min: 3, max: 200 });
  const [sig, setSig] = useParam('sig', 0.03, { min: 0.001, max: 0.2 });
  const [seed, setSeed] = useParam('seed', 7);
  const [nterms, setNterms] = useParam('nterms', 1, { min: 1, max: 4 });
  const [ptry, setPtry] = useParam('ptry', S.P * 1.07, { min: 0.1, max: 30 });
  const [av, setAv] = useParam('av', S.AV ?? 0, { min: 0, max: 3 });
  const [sigAv, setSigAv] = useParam('sav', 0.05, { min: 0, max: 0.5 });
  const [pSrc, setPSrc] = useParam<'gls' | 'try' | 'ref'>('psrc', 'gls');
  const [mSrc, setMSrc] = useParam<'fit' | 'cat'>('msrc', 'fit');
  const [playing, setPlaying] = useState(true);
  const [fapRes, setFapRes] = useState<{ key: string; fap: number; nBoot: number } | null>(null);
  const tNow = useRef(0);
  const [, setTick] = useState(0);
  const lastUi = useRef(0);

  // ── data & period search (sim-core, float64) ──
  const obs = useMemo(() => syntheticSeries(S, n, base, sig, seed * 7919 + n), [S, n, base, sig, seed]);
  const pg = useMemo(() => {
    const freqs = frequencyGrid(obs.t, 1 / 25, 2.5, 8);
    const power = glsPeriodogram(obs.t, obs.y, obs.dy, freqs, nterms);
    const T = Math.max(...obs.t) - Math.min(...obs.t);
    const peaks = topPeaks(freqs, power, 4, 2 / T, 3 / T);
    return { freqs, power, peaks, data: freqs.map((f, i) => [1 / f, power[i]] as [number, number]) };
  }, [obs, nterms]);
  const pGLS = pg.peaks[0]?.P ?? NaN;
  const dataKey = `${starId}|${n}|${base}|${sig}|${seed}|${nterms}`;

  const fitTry = useMemo(() => glsFit(obs.t, obs.y, obs.dy, 1 / ptry, nterms), [obs, ptry, nterms]);
  const folded = useMemo(() => {
    const ph = fold(obs.t, ptry);
    const pts = ph.map((p, i) => [p, obs.y[i]] as [number, number]);
    const model: [number, number][] = [];
    for (let j = 0; j <= 200; j++) { const p = (2 * j) / 200; model.push([p, fitTry.model(p * ptry)]); }
    return { pts: [...pts, ...pts.map(([p, y]) => [p + 1, y] as [number, number])], model };
  }, [obs, ptry, fitTry]);
  const rmsTry = Math.sqrt(obs.t.reduce((s, ti, i) => s + (obs.y[i] - fitTry.model(ti)) ** 2, 0) / obs.t.length);

  // ── distance chain ──
  const Puse = pSrc === 'gls' ? pGLS : pSrc === 'try' ? ptry : S.P;
  const meanFit = useMemo(() => {
    const f = glsFit(obs.t, obs.y, obs.dy, 1 / Puse, Math.max(3, nterms));
    return intensityMeanMag(f.model, Puse);
  }, [obs, Puse, nterms]);
  const meanUse = mSrc === 'cat' && S.meanV !== undefined ? S.meanV : meanFit;
  const leav = leavittMV(Puse);
  const dist = cepheidDistance(meanUse, leav.M, av, Math.hypot(leav.sigma, sigAv));
  const dist0 = cepheidDistance(meanUse, leav.M, 0, leav.sigma);
  const arithMean = obs.y.reduce((a, b) => a + b, 0) / obs.y.length;

  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    clear(ctx, w, h, '#020308');
    let s0 = 99;
    const rnd = () => ((s0 = (s0 * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(160,170,200,${rnd() * 0.12})`; ctx.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
    const ref = (S.vBright + S.vFaint) / 2;
    const psf = (x: number, y: number, m: number, name: string, col: string) => {
      const flux = 10 ** (-0.4 * (m - ref));
      const r = 6 + 9 * Math.sqrt(flux);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
      g.addColorStop(0, `rgba(255,255,255,${Math.min(1, 0.6 + 0.4 * flux)})`);
      g.addColorStop(0.35, `rgba(220,230,255,${0.5 * Math.min(1, flux)})`);
      g.addColorStop(1, 'rgba(200,210,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, name, x, y + 44, col, { align: 'center', size: 11, weight: 700 });
    };
    const m = syntheticMag(S, tNow.current);
    psf(w * 0.5, h * 0.45, m, tx({ vi: 'mục tiêu', en: 'target' }), '#5eead4');
    psf(w * 0.2, h * 0.3, ref + 0.4, tx({ vi: 'so sánh 1', en: 'comp 1' }), '#fbbf24');
    psf(w * 0.8, h * 0.62, ref + 0.9, tx({ vi: 'so sánh 2', en: 'comp 2' }), '#fbbf24');
    label(ctx, tx({ vi: `V tức thời = ${m.toFixed(2)} · t = ${tNow.current.toFixed(2)} d`, en: `instantaneous V = ${m.toFixed(2)} · t = ${tNow.current.toFixed(2)} d` }), 10, 16, '#cbd5ff', { size: 12, mono: true });
    label(ctx, tx({ vi: 'Ảnh CCD tổng hợp (minh hoạ) · V tức thời không dùng cho Leavitt', en: 'Synthetic CCD frame (illustration) · instantaneous V is not used for Leavitt' }), 10, h - 10, '#6c759c', { size: 10.5 });
  }, [S, tx]);

  useAnimationFrame((dt, now) => {
    if (playing) tNow.current += dt * S.P * 0.15;
    redraw();
    if (now - lastUi.current > 200) { lastUi.current = now; setTick((x) => x + 1); }
  });

  const runFap = () => {
    const r = bootstrapFap(obs.t, obs.y, obs.dy, pg.freqs, pg.peaks[0].power, 100, nterms, seed);
    setFapRes({ key: dataKey, fap: r.fap, nBoot: r.nBoot });
  };
  const fap = fapRes && fapRes.key === dataKey ? fapRes : null;
  const dRefDiff = S.refDistancePc ? dist.d / S.refDistancePc.d - 1 : NaN;
  const P = (p: number) => `${fix(p, 4, lang)} ${t('days')}`;

  return (
    <SimLayout
      id="a5"
      lesson={lesson}
      card={card}
      caption={<><span className="k">P<sub>GLS</sub> = {P(pGLS)}</span> · P<sub>{tx({ vi: 'thử', en: 'trial' })}</sub> = {P(ptry)} · P<sub>ref</sub> = {P(S.P)}{S.leavitt ? <> · d = {fix(dist.d, 0, lang)} ± {fix(dist.sigmaD, 0, lang)} pc</> : null}</>}
      onTogglePlay={() => setPlaying((x) => !x)}
      timeline={<Timeline playing={playing} onToggle={() => setPlaying((x) => !x)} label={<>t = {fix(tNow.current, 2, lang)} {t('days')}</>} />}
      panel={
        <>
          <Section title={tx({ vi: 'Ngôi sao', en: 'Star' })} dot="var(--grpA)">
            <Select value={starId} onChange={(v) => { const s = VARIABLE_STARS.find((x) => x.id === v)!; setStar(v); setPtry(s.P * 1.07); setAv(s.AV ?? 0); }} options={VARIABLE_STARS.map((s) => ({ value: s.id, label: tx(s.name) }))} />
            <Readouts>
              <Readout wide k={tx({ vi: 'P_ref - chu kỳ tham chiếu (danh mục)', en: 'P_ref - reference period (catalogue)' })} v={fix(S.P, 6, lang)} unit={t('days')} frame={S.catalog} />
              <Readout k={tx({ vi: 'Khoảng V (danh mục)', en: 'V range (catalogue)' })} v={`${fix(S.vBright, 2, lang)}–${fix(S.vFaint, 2, lang)}`} />
              <Readout k={tx({ vi: '⟨V⟩ danh mục', en: 'Catalogue ⟨V⟩' })} v={S.meanV !== undefined ? fix(S.meanV, 3, lang) : '-'} />
            </Readouts>
            <div className="field-hint">{tx({ vi: 'Tham số tham chiếu lấy từ danh mục; chuỗi thời gian và nhiễu được mô phỏng; hình dạng đường cong là mô hình minh hoạ.', en: 'Reference parameters from catalogues; the time series and noise are simulated; the curve shape is an illustrative model.' })}</div>
          </Section>
          <Section title={tx({ vi: 'Chiến dịch quan sát', en: 'Observing campaign' })}>
            <Slider label={tx({ vi: 'Số lần đo N', en: 'Measurements N' })} value={n} min={15} max={400} step={1} onChange={setN} display={String(n)} />
            <Slider label={tx({ vi: 'Thời gian theo dõi T', en: 'Baseline T' })} value={base} min={3} max={200} step={1} onChange={setBase} display={`${base} ${t('days')}`} />
            <Slider label={tx({ vi: 'Nhiễu σ (mỗi điểm)', en: 'Noise σ (per point)' })} value={sig} min={0.001} max={0.2} step={0.001} onChange={setSig} display={`${fix(sig, 3, lang)} mag`} />
            <button className="btn small" onClick={() => setSeed(seed + 1)}>🎲 {tx({ vi: 'Quan sát lại (đêm khác)', en: 'Re-observe (other nights)' })}</button>
          </Section>
          <Section title={tx({ vi: 'Tìm & kiểm chứng chu kỳ', en: 'Find & check the period' })}>
            <Segmented value={String(nterms)} onChange={(v) => setNterms(Number(v))} options={[1, 2, 3, 4].map((k) => ({ value: String(k), label: `K = ${k}` }))} small />
            <div className="field-hint">{tx({ vi: 'K = số thành phần điều hoà của mô hình GLS. Đường cong không hình sin (Algol) cần K ≥ 3.', en: 'K = number of harmonics in the GLS model. Non-sinusoidal curves (Algol) need K ≥ 3.' })}</div>
            <Slider label={tx({ vi: 'P_thử - chu kỳ thử để gấp pha', en: 'P_trial - trial period for folding' })} value={ptry} min={0.1} max={30} log step={0.00001} onChange={setPtry} display={`${fix(ptry, 5, lang)} ${t('days')}`} />
            <div className="row">
              <button className="btn small" onClick={() => setPtry(pGLS)}>🎯 <MathText text={tx({ vi: 'P_thử = P_GLS', en: 'P_trial = P_GLS' })} /></button>
              {[0.999, 0.9999, 1.0001, 1.001].map((f) => <button key={f} className="btn small" onClick={() => setPtry(ptry * f)}>×{f}</button>)}
            </div>
            <Readouts>
              <Readout k={tx({ vi: 'P_GLS - đỉnh chu đồ', en: 'P_GLS - periodogram peak' })} v={fix(pGLS, 5, lang)} unit={t('days')} tone="accent" />
              <Readout k={tx({ vi: 'Lệch so với P_ref', en: 'Offset from P_ref' })} v={`${fix((pGLS / S.P - 1) * 100, 2, lang)}%`} tone={Math.abs(pGLS / S.P - 1) < 0.01 ? 'good' : 'bad'} />
              <Readout k={tx({ vi: 'Công suất GLS tại đỉnh', en: 'GLS power at peak' })} v={fix(pg.peaks[0]?.power ?? 0, 3, lang)} frame={tx({ vi: 'không phải xác suất', en: 'not a probability' })} />
              <Readout k={tx({ vi: 'FAP (bootstrap)', en: 'FAP (bootstrap)' })} v={fap ? (fap.fap === 0 ? `< ${fix(1 / fap.nBoot, 2, lang)}` : fix(fap.fap, 2, lang)) : '-'} frame={fap ? `${fap.nBoot} ${tx({ vi: 'lần lấy mẫu lại', en: 'resamples' })}` : undefined} />
              <Readout k={tx({ vi: 'rms quanh mô hình tại P_thử', en: 'rms around model at P_trial' })} v={fix(rmsTry, 3, lang)} unit="mag" tone={rmsTry < sig * 1.3 ? 'good' : undefined} frame={`σ = ${fix(sig, 3, lang)}`} />
            </Readouts>
            <button className="btn small" onClick={runFap}>{tx({ vi: 'Tính FAP bằng bootstrap (100 lần)', en: 'Compute bootstrap FAP (100×)' })}</button>
            <div className="field-hint" style={{ marginTop: 4 }}><strong>{tx({ vi: 'Các đỉnh ứng viên', en: 'Candidate peaks' })}</strong></div>
            <table className="num" style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
              <tbody>
                {pg.peaks.map((p, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setPtry(p.P)}>
                    <td>{i + 1}.</td><td style={{ textAlign: 'right' }}>{fix(p.P, 4, lang)} d</td><td style={{ textAlign: 'right' }}>{fix(p.power, 3, lang)}</td>
                    <td style={{ color: 'var(--warn)', paddingLeft: 8 }}>{i === 0 ? tx({ vi: 'cao nhất', en: 'highest' }) : p.alias ? `alias ${p.alias}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="field-hint">{tx({ vi: 'Bấm một dòng để gấp pha theo chu kỳ đó.', en: 'Click a row to fold at that period.' })}</div>
          </Section>
          <Section title={tx({ vi: 'Khoảng cách bằng Cepheid', en: 'Cepheid distance' })}>
            {!S.leavitt ? (
              <div className="warn-box">{tx({ vi: 'Định luật Leavitt (Benedict 2007) chỉ áp dụng cho Cepheid cổ điển. Sao này thuộc lớp khác nên phần khoảng cách bị khoá.', en: 'The Leavitt law (Benedict 2007) applies only to classical Cepheids. This star belongs to another class, so the distance section is locked.' })}</div>
            ) : (
              <>
                <Select label={tx({ vi: 'Chu kỳ đưa vào Leavitt', en: 'Period used in Leavitt' })} value={pSrc} onChange={setPSrc} options={[{ value: 'gls', label: `${tx({ vi: 'Chu kỳ GLS', en: 'GLS period' })} = ${fix(pGLS, 4, lang)} d` }, { value: 'try', label: `${tx({ vi: 'Chu kỳ thử', en: 'Trial period' })} = ${fix(ptry, 4, lang)} d` }, { value: 'ref', label: `${tx({ vi: 'Chu kỳ tham chiếu', en: 'Reference period' })} = ${fix(S.P, 4, lang)} d` }]} />
                <Select label={tx({ vi: 'Cấp sao trung bình m_V', en: 'Mean magnitude m_V' })} value={mSrc} onChange={setMSrc} options={[{ value: 'fit', label: tx({ vi: `⟨V⟩ trung bình cường độ từ mô hình khớp dữ liệu = ${fix(meanFit, 3, lang)}`, en: `⟨V⟩ intensity mean from the fitted model = ${fix(meanFit, 3, lang)}` }) }, ...(S.meanV !== undefined ? [{ value: 'cat' as const, label: tx({ vi: `⟨V⟩ danh mục = ${fix(S.meanV, 3, lang)}`, en: `catalogue ⟨V⟩ = ${fix(S.meanV, 3, lang)}` }) }] : [])]} />
                <Slider label={tx({ vi: 'Hấp thụ liên sao A_V', en: 'Interstellar extinction A_V' })} value={av} min={0} max={3} step={0.01} onChange={setAv} display={`${fix(av, 2, lang)} mag`} />
                {student && <Slider label={tx({ vi: 'Độ bất định σ(A_V)', en: 'Uncertainty σ(A_V)' })} value={sigAv} min={0} max={0.5} step={0.01} onChange={setSigAv} display={`${fix(sigAv, 2, lang)} mag`} />}
                {av === 0 && <div className="warn-box"><MathText text={tx({ vi: 'Đang giả định A_V = 0 (không có hấp thụ liên sao) - khoảng cách bị ước lượng quá lớn nếu thực tế có bụi.', en: 'Assuming A_V = 0 (no interstellar extinction) - the distance is overestimated if there is dust.' })} /></div>}
                <Readouts>
                  <Readout k="M_V (Leavitt)" v={`${fix(leav.M, 3, lang)} ± ${fix(leav.sigma, 3, lang)}`} frame={tx({ vi: 'chỉ sai số hệ số', en: 'coefficient errors only' })} />
                  <Readout k={tx({ vi: 'Môđun μ₀ = m_V − A_V − M_V', en: 'Modulus μ₀ = m_V − A_V − M_V' })} v={fix(dist.mu0, 3, lang)} unit="mag" />
                  <Readout wide k={tx({ vi: 'Khoảng cách d (đã hiệu chỉnh A_V)', en: 'Distance d (extinction-corrected)' })} v={`${fix(dist.d, 0, lang)} ± ${fix(dist.sigmaD, 0, lang)}`} unit={`pc ≈ ${fix(dist.d * 3.26156, 0, lang)} ${tx({ vi: 'năm ánh sáng', en: 'ly' })}`} tone="accent" />
                  <Readout wide k={tx({ vi: 'Nếu bỏ qua hấp thụ (A_V = 0)', en: 'If extinction is ignored (A_V = 0)' })} v={fix(dist0.d, 0, lang)} unit="pc" tone="bad" />
                  {S.refDistancePc && <Readout wide k={tx({ vi: 'Khoảng cách tham chiếu độc lập', en: 'Independent reference distance' })} v={`${S.refDistancePc.d} ± ${S.refDistancePc.sigma}`} unit={`pc · Δ ${fix(dRefDiff * 100, 1, lang)}%`} frame={S.refDistancePc.source} />}
                  <Readout wide k={tx({ vi: 'So sánh: trung bình số học các cấp sao đo', en: 'For comparison: arithmetic mean of measured magnitudes' })} v={fix(arithMean, 3, lang)} frame={tx({ vi: 'không dùng cho Leavitt - Leavitt cần trung bình cường độ', en: 'not used for Leavitt - it needs the intensity mean' })} />
                </Readouts>
                {student && <div className="eq-box"><Tex display tex={`\\mu_0 = ${meanUse.toFixed(3)} - ${av.toFixed(2)} - (${leav.M.toFixed(3)}) = ${dist.mu0.toFixed(3)}`} /><Tex display tex={`d = 10^{(\\mu_0+5)/5} = ${dist.d.toFixed(0)}\\,\\text{pc}`} /></div>}
              </>
            )}
          </Section>
        </>
      }
    >
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 10, alignContent: 'start' }}>
        <div className="chart-card" style={{ height: 230, position: 'relative', padding: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} /></div>
        <ChartCard title={tx({ vi: `Đường cong ánh sáng (tổng hợp, N = ${n}, σ = ${fix(sig, 3, lang)} mag)`, en: `Light curve (synthetic, N = ${n}, σ = ${fix(sig, 3, lang)} mag)` })}>
          <LineChart height={200} invertY xLabel={`t (${t('days')})`} yLabel="V (mag)" series={[{ data: obs.t.map((x, i) => [x, obs.y[i]]), color: pal.teal, scatter: true, radius: 2.4 }]} />
        </ChartCard>
        <ChartCard title={tx({ vi: `Chu đồ GLS (K = ${nterms}) · cam: P_thử · xanh: P_GLS · xám: P_ref`, en: `GLS periodogram (K = ${nterms}) · orange: P_trial · teal: P_GLS · grey: P_ref` })}>
          <LineChart height={200} xLog xDomain={[0.4, 25]} yDomain={[0, 1]} xLabel={tx({ vi: 'chu kỳ (ngày)', en: 'period (days)' })} yLabel="P_GLS" series={[{ data: pg.data, color: pal.accent, width: 1.3 }]}
            vlines={[{ x: S.P, color: pal.textFaint, dash: '2 3', label: 'ref' }, { x: pGLS, color: pal.teal, label: 'GLS' }, { x: ptry, color: pal.sun, label: tx({ vi: 'thử', en: 'trial' }) }]} />
        </ChartCard>
        <ChartCard title={tx({ vi: `Gấp pha với P_thử = ${fix(ptry, 4, lang)} d · đường: mô hình GLS K = ${nterms}`, en: `Folded at P_trial = ${fix(ptry, 4, lang)} d · line: GLS model K = ${nterms}` })}>
          <LineChart height={200} invertY xDomain={[0, 2]} xLabel={tx({ vi: 'pha φ = frac((t − t₀)/P), t₀ = 0', en: 'phase φ = frac((t − t₀)/P), t₀ = 0' })} yLabel="V (mag)" series={[{ data: folded.pts, color: pal.horizon, scatter: true, radius: 2.4 }, { data: folded.model, color: pal.fg, width: 1.4, opacity: 0.7 }]} />
        </ChartCard>
      </div>
    </SimLayout>
  );
}
