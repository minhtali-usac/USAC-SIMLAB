import fs from 'node:fs';
import path from 'node:path';
import { validateKepler } from '../src/validation/keplerValidation';

const r = validateKepler();
const out = path.resolve(__dirname, '../../../docs/validation/B1-kepler.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), units: 'q = 1, μ = 1 for the e grid; au, days, μ☉ for presets', ...r }, null, 2));
console.table(r.grid.map((g) => ({ e: g.e, kind: g.kind, residual: g.maxResidual.toExponential(1), dE: g.maxEnergyDev.toExponential(1), dh: g.maxHDev.toExponential(1), tRoundTrip: g.maxRoundTripRel.toExponential(1), sectors: g.sectorMaxRelDev.toExponential(1), quad: g.sectorMaxRelDevQuad?.toExponential(1) ?? '-' })));
console.table(r.presets.map((p) => ({ id: p.id, P: p.periodDays.toFixed(5), P_m0: p.periodTestParticleDays.toFixed(5), ref: p.refPeriodDays.toFixed(5), rel: p.relDiff.toExponential(2) })));
console.log('Gaussian year', r.gaussianYearDays.toFixed(7), 'd; barycentre error', r.barycentreMaxError.toExponential(1));
