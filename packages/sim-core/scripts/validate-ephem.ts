import fs from 'node:fs';
import path from 'node:path';
import { validatePlanets, validateSun, validateSunRiseSet } from '../src/validation/ephemValidation';

const fx = path.resolve(__dirname, '../test/fixtures');
const planets = validatePlanets(JSON.parse(fs.readFileSync(path.join(fx, 'horizons_planets_1980_2050.json'), 'utf8')));
const bary = validatePlanets(JSON.parse(fs.readFileSync(path.join(fx, 'horizons_planets_bary_1980_2050.json'), 'utf8')));
const sun = validateSun(JSON.parse(fs.readFileSync(path.join(fx, 'horizons_sun_apparent_1990_2040.json'), 'utf8')));
const rts = validateSunRiseSet(JSON.parse(fs.readFileSync(path.join(fx, 'horizons_sun_riseset_2025.json'), 'utf8')));
const out = path.resolve(__dirname, '../../../docs/validation');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'E1-planets.json'), JSON.stringify({ generated: new Date().toISOString(), reference: 'JPL Horizons DE441, ecliptic J2000, 1980–2050, 120 d', heliocentric: planets, barycentric: bary, note: 'Standish Table 1 elements fit heliocentric orbits for the inner planets; for Uranus/Neptune they track the barycentric orbit (difference = solar reflex motion ≈ 0.01 au).' }, null, 2));
fs.writeFileSync(path.join(out, 'A1-sun.json'), JSON.stringify({ generated: new Date().toISOString(), reference: 'JPL Horizons DE441, apparent geocentric RA/Dec, 1990–2040, 37 d', ...sun, riseSet: { reference: "Horizons R_T_S_ONLY='TVH', 2025, 4 sites, HH:MM (end of minute)", rows: rts } }, null, 2));
for (const p of planets) console.log(`${p.planet.padEnd(8)} angle max ${p.angleArcsec.max.toFixed(1)}″ rms ${p.angleArcsec.rms.toFixed(1)}″ · |Δr| max ${p.radiusAu.max.toExponential(2)} au (n=${p.angleArcsec.n})`);
for (const p of bary) console.log(`  vs barycentre ${p.planet.padEnd(8)} max ${p.angleArcsec.max.toFixed(1)}″`);
console.log(`Sun: angle max ${sun.angleArcsec.max.toFixed(2)}″ rms ${sun.angleArcsec.rms.toFixed(2)}″ · |Δr| max ${sun.distanceAu.max.toExponential(2)} au (n=${sun.angleArcsec.n})`);
for (const r of rts) console.log(`rise/set ${r.site}: mean ${r.meanMin.toFixed(2)} min, max |Δ| ${r.maxAbsMin.toFixed(2)} min, beyond 1-min quantisation ${r.maxBeyondQuantMin.toFixed(3)} min (n=${r.n})`);
