import fs from 'node:fs';
import path from 'node:path';
import { validateTransfer } from '../src/validation/transferValidation';
import { jdToDate } from '../src/time/julian';

const JD_START = 2461333.5; // 2026-10-20 00:00 UTC
const r = validateTransfer(JD_START);
const iso = (jd: number) => jdToDate(jd).toISOString().slice(0, 10);
const out = path.resolve(__dirname, '../../../docs/validation/B2-transfer.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), searchStart: iso(JD_START), ephemeris: 'JPL Standish Table 1 (ecliptic J2000), TDB≈UTC', ...r, phaseDatesIso: r.phaseDates.map(iso), minC3DepartureIso: iso(r.minC3NextWindow.jdDep) }, null, 2));
console.log('Hohmann E→M', r.hohmannEM);
console.log('inward', r.inward);
console.log('ideal J2000', r.idealEM);
console.log('phase dates', r.phaseDates.map(iso), 'residual max', Math.max(...r.phaseResidualsRad), 'spacings', r.spacingsDays.map((d) => d.toFixed(1)));
console.log('thresholds', r.thresholds, 'R=20: hohmann', r.hohmannAt20, 'limit', r.limitAt20, r.sweepR20);
console.log('curtis', r.curtis);
console.log('lambert vs hohmann', r.lambertVsHohmann);
console.log('min C3', r.minC3NextWindow, iso(r.minC3NextWindow.jdDep));
