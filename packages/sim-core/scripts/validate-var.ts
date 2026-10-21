/** Run: npm run validate:var → docs/validation/A5-variable.json */
import fs from 'node:fs';
import path from 'node:path';
import { validateGlsImplementation, periodRecovery, deltaCepDistanceCheck } from '../src';

const t0 = Date.now();
const impl = validateGlsImplementation();
const rec1 = periodRecovery({ nterms: [1] });
const rec3 = periodRecovery({ nterms: [3], Ns: [40, 80], Ts: [40], sigmas: [0.03] });
const dist = deltaCepDistanceCheck();
const out = path.resolve(__dirname, '../../../docs/validation/A5-variable.json');
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), glsImplementation: impl, recoveryNterms1: rec1, recoveryNterms3: rec3, deltaCepDistance: dist }, null, 2));
console.log(`GLS vs closed form: max |ΔP| ${impl.maxAbsPowerDiffVsClosedForm.toExponential(2)}; noise-free peak P = ${impl.noiseFreePeakPeriod.toFixed(5)} d (true 3.7), power ${impl.noiseFreePeakPower.toFixed(6)}`);
const summary = (rows: typeof rec1, label: string) => {
  console.log(`\nRecovery (${label}): star  N   T   σ   → recovered/runs  alias  median|ΔP/P|`);
  for (const r of rows) console.log(`  ${r.star.padEnd(7)} ${String(r.N).padStart(3)} ${String(r.T).padStart(4)} ${r.sigma.toFixed(2)}  ${String(r.recovered).padStart(3)}/${r.runs}  ${String(r.aliasOrHarmonic).padStart(3)}  ${r.medianRelErr.toExponential(1)}`);
};
summary(rec1, 'nterms = 1');
summary(rec3, 'nterms = 3');
const byStar = (rows: typeof rec1) => Object.fromEntries([...new Set(rows.map((r) => r.star))].map((s) => { const rr = rows.filter((r) => r.star === s); return [s, `${rr.reduce((a, r) => a + r.recovered, 0)}/${rr.reduce((a, r) => a + r.runs, 0)}`]; }));
console.log('\nTotals nterms=1:', byStar(rec1));
console.log(`\nδ Cep: ⟨V⟩ = ${dist.meanV.toFixed(3)} (fit ${dist.meanVfromFit.toFixed(3)}), M_V = ${dist.MV.toFixed(3)} ± ${dist.sigmaMV.toFixed(3)}, A_V = ${dist.AV}, μ0 = ${dist.mu0.toFixed(3)}, d = ${dist.d.toFixed(1)} ± ${dist.sigmaD.toFixed(1)} pc vs ${dist.ref.d} ± ${dist.ref.sigma} pc (${(dist.relDiff * 100).toFixed(1)} %, ${dist.nSigma.toFixed(2)} σ)`);
console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s) → ${out}`);
