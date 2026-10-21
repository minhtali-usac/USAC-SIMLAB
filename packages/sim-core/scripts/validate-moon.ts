/**
 * Run: npm run validate:moon
 * Compares the A3 lunar model with JPL Horizons fixtures and writes docs/validation/A3-moon.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { validatePhases, validateRiseSet, validateIllumination } from '../src';

const fx = path.resolve(__dirname, '../test/fixtures');
const phases = JSON.parse(fs.readFileSync(path.join(fx, 'horizons_moon_phases_2000_2030.json'), 'utf8'));
const il = JSON.parse(fs.readFileSync(path.join(fx, 'horizons_moon_illumination_2024_2025.json'), 'utf8'));
const rs = JSON.parse(fs.readFileSync(path.join(fx, 'horizons_moon_riseset_2024_2025.json'), 'utf8'));

const t0 = Date.now();
const p = validatePhases(phases.phases, 'meeus49');
const pOld = validatePhases(phases.phases, 'almanacRoot');
const r = validateRiseSet(Object.values(rs.sites));
const k = validateIllumination(il.samples);
const report = {
  model: 'A3 - phases: Meeus ch.49; position/illumination/rise-set: Astronomical Almanac low-precision lunar series + Meeus ch.25 Sun; ΔT from table (Espenak & Meeus / IERS)',
  reference: { phases: phases.source, riseSet: rs.source },
  generated: new Date().toISOString(),
  phases: p,
  phasesPreviousMethod: { method: 'root-finding on the Almanac low-precision series (before 2026-10)', all: pOld.all },
  riseSet: r,
  illumination: { reference: il.source, ...k },
};
const out = path.resolve(__dirname, '../../../docs/validation/A3-moon.json');
fs.writeFileSync(out, JSON.stringify(report, null, 2));
const f = (x: number) => x.toFixed(1).padStart(6);
console.log(`Phases ${p.first?.slice(0, 10)} … ${p.last?.slice(0, 10)} (n=${p.all.n})`);
for (const [k, s] of Object.entries(p)) if (typeof s === 'object' && s && 'n' in s) console.log(`  ${k.padEnd(13)} mean ${f(s.meanMin)}  median|e| ${f(s.medianAbsMin)}  p95 ${f(s.p95AbsMin)}  max ${f(s.maxAbsMin)} min`);
console.log(`  (previous method: median|e| ${f(pOld.all.medianAbsMin)}  max ${f(pOld.all.maxAbsMin)} min)`);
console.log(`Rise/set 2024–2025 (n=${r.all.n}, missing=${r.all.missing})`);
console.log(`  all           mean ${f(r.all.meanMin)}  median|e| ${f(r.all.medianAbsMin)}  p95 ${f(r.all.p95AbsMin)}  max ${f(r.all.maxAbsMin)} min`);
for (const [k, s] of Object.entries(r.perSite)) console.log(`  ${k.padEnd(8)} ${String(s.lat).padStart(8)}°  mean ${f(s.meanMin)}  median|e| ${f(s.medianAbsMin)}  p95 ${f(s.p95AbsMin)}  max ${f(s.maxAbsMin)}  missing ${s.missing}`);
console.log(`Illuminated fraction 2024–2025 (n=${k.n}): mean ${k.meanPct.toFixed(3)}  median|e| ${k.medianAbsPct.toFixed(3)}  p95 ${k.p95AbsPct.toFixed(3)}  max ${k.maxAbsPct.toFixed(3)} percentage points`);
console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s) → ${out}`);
