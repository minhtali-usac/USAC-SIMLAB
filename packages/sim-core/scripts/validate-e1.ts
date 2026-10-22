import fs from 'node:fs';
import path from 'node:path';
import { validateVsop87, validateSatellites, validateEarthMoon, fitTheorySpin } from '../src/validation/ephemerisValidation';
import { THEORY_FRAME } from '../src/ephemeris/satellites';

const fx = path.resolve(__dirname, '../test/fixtures');
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(fx, f), 'utf8'));
const ranges = read('horizons_planets_vsop_ranges.json');
const sats = read('horizons_satellites_1900_2100.json');
const emb = read('horizons_planets_1980_2050.json');

const planets = validateVsop87(ranges, { modern: [1800, 1900, 2000, 2100, 2200], wide: [-3000, -2000, -1000, 0, 1000, 2000, 3000] });
const moons = validateSatellites(sats);
const earth = validateEarthMoon(sats, emb);
const spins = Object.fromEntries((['jupiter', 'saturn', 'uranus'] as const).map((p) => [p, { fitted: fitTheorySpin(sats, p), used: THEORY_FRAME[p].spinDeg }]));

const out = path.resolve(__dirname, '../../../docs/validation');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'E1-vsop87.json'), JSON.stringify({
  generated: new Date().toISOString(),
  reference: 'JPL Horizons DE441, heliocentric ecliptic J2000, 1000 epochs per range; wide range uses system barycentres for Mars…Neptune',
  model: 'VSOP87 (truncated, from Celestia 1.7.0)',
  ranges: planets,
  earthMoon: earth,
}, null, 2));
fs.writeFileSync(path.join(out, 'E1-moons.json'), JSON.stringify({
  generated: new Date().toISOString(),
  reference: 'JPL Horizons, positions relative to the parent planet, ecliptic J2000, 1000 epochs 1900-2100',
  models: 'Meeus ch. 47 (Moon), ch. 44 (Galilean), Dourneau/Meeus ch. 46 (Saturn), GUST86 (Uranus), Emelyanov & Samorodov 2015 (Triton), via Celestia 1.7.0',
  moons,
  frameConstants: spins,
}, null, 2));

for (const [name, r] of Object.entries(planets)) {
  console.log(`VSOP87 ${name} (${r.start} … ${r.stop})`);
  for (const p of r.planets) console.log(`  ${p.planet.padEnd(8)} max ${p.angleArcsec.max.toFixed(2).padStart(7)}″  rms ${p.angleArcsec.rms.toFixed(2).padStart(6)}″  |Δr| max ${p.radiusAu.max.toExponential(1)} au`);
}
console.log(`Earth centre vs Horizons 399: max ${earth.geocentreMaxArcsec.toFixed(2)}″ · barycentre (VSOP87 + Moon) vs Horizons 3: max ${earth.barycentreMaxArcsec.toFixed(2)}″ · VSOP87 earth taken as barycentre: ${earth.geocentreAsBarycentreMaxArcsec.toFixed(2)}″`);
for (const m of moons) console.log(`${m.id.padEnd(10)} ${m.parent.padEnd(8)} max ${m.maxKm.toFixed(0).padStart(7)} km  ${m.maxDeg.toFixed(3).padStart(6)}°  rms ${m.rmsDeg.toFixed(3)}°`);
console.log('reference longitudes φ₀ [deg] (fitted vs used):', JSON.stringify(spins));
