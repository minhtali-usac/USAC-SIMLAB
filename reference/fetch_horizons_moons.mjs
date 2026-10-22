// Fetch JPL Horizons reference vectors for E1: the Earth's centre (heliocentric) and every natural satellite we
// model, each relative to its parent planet's centre. Ecliptic J2000 (ICRF-aligned), TDB, 1000 equally spaced
// epochs over 1900-01-01 … 2100-01-01 (a step of 73.05 d, deliberately not commensurate with any orbital period).
// Usage: node reference/fetch_horizons_moons.mjs packages/sim-core/test/fixtures
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2];
const API = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const q = (o) => API + '?' + Object.entries({ format: 'json', ...o }).map(([k, v]) => `${k}=${encodeURIComponent(`'${v}'`)}`).join('&').replace(/format='json'/, 'format=json').replace(/format=%27json%27/, 'format=json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(o) {
  for (let k = 0; k < 4; k++) {
    try {
      const j = await (await fetch(q(o))).json();
      if (!j.result || !j.result.includes('$$SOE')) throw new Error(JSON.stringify(j).slice(0, 300));
      return j.result;
    } catch (e) { console.error('retry', e.message); await sleep(3000); }
  }
  throw new Error('failed');
}
const soe = (r) => r.slice(r.indexOf('$$SOE') + 5, r.indexOf('$$EOE')).trim().split('\n').map((l) => l.split(',').map((s) => s.trim()));

// id → [Horizons body, centre body]
const BODIES = {
  earth: ['399', '500@10'],
  moon: ['301', '500@399'],
  phobos: ['401', '500@499'], deimos: ['402', '500@499'],
  io: ['501', '500@599'], europa: ['502', '500@599'], ganymede: ['503', '500@599'], callisto: ['504', '500@599'],
  mimas: ['601', '500@699'], enceladus: ['602', '500@699'], tethys: ['603', '500@699'], dione: ['604', '500@699'],
  rhea: ['605', '500@699'], titan: ['606', '500@699'], hyperion: ['607', '500@699'], iapetus: ['608', '500@699'],
  ariel: ['701', '500@799'], umbriel: ['702', '500@799'], titania: ['703', '500@799'], oberon: ['704', '500@799'], miranda: ['705', '500@799'],
  triton: ['801', '500@899'],
};
const bodies = {};
for (const [id, [cmd, center]] of process.env.ONLY_PLANETS ? [] : Object.entries(BODIES)) {
  const r = await get({ COMMAND: cmd, EPHEM_TYPE: 'VECTORS', CENTER: center, REF_PLANE: 'ECLIPTIC', REF_SYSTEM: 'ICRF', START_TIME: '1900-01-01', STOP_TIME: '2100-01-01', STEP_SIZE: '1000', VEC_TABLE: '1', OUT_UNITS: 'KM-S', CSV_FORMAT: 'YES', OBJ_DATA: 'NO' });
  const rows = soe(r);
  bodies[id] = rows.map((c) => ({ jdTdb: +c[0], xyzKm: [+c[2], +c[3], +c[4]] }));
  console.log(id.padEnd(9), center.padEnd(8), rows.length, 'rows');
  await sleep(700);
}
if (!process.env.ONLY_PLANETS) fs.writeFileSync(path.join(out, 'horizons_satellites_1900_2100.json'), JSON.stringify({
  source: 'JPL Horizons API (DE441 + JPL satellite ephemerides), ecliptic J2000 / ICRF vectors in km, TDB, 1000 epochs 1900-01-01 … 2100-01-01. "earth" is the geocentre (399) relative to the Sun; every other body is relative to its parent planet centre',
  generated: new Date().toISOString(), bodies,
}));

// ── planets, heliocentric, two epoch ranges: "modern" 1800-01-03 … 2200 and "wide" −3000…+3000 (1000 epochs each) ──
// Horizons wants BC notation, not negative years: astronomical year -3000 is 'BC 3001'
const PLANETS = { mercury: '199', venus: '299', earth: '399', mars: '499', jupiter: '599', saturn: '699', uranus: '799', neptune: '899' };
// Horizons has no planet-centre ephemeris for the outer planets before 1800; for the wide range their system barycentres
// (4 … 8) are used instead - the offset from the planet centre is a few hundred km at most (≪ 0.01″ at 5 au).
const WIDE_IDS = { ...PLANETS, mars: '4', jupiter: '5', saturn: '6', uranus: '7', neptune: '8' };
const ranges = { modern: ['1800-01-03', '2199-12-29', PLANETS], wide: ['BC 3001-01-01', '3000-01-01', WIDE_IDS] };
const planetOut = { source: 'JPL Horizons API (DE441), heliocentric (500@10) ecliptic J2000 / ICRF vectors in au, TDB, 1000 equally spaced epochs per range; "earth" is the geocentre (399); the wide range uses the system barycentres 4-8 for Mars … Neptune', generated: new Date().toISOString(), ranges: {} };
for (const [name, [start, stop, ids]] of Object.entries(ranges)) {
  planetOut.ranges[name] = { start, stop, planets: {} };
  for (const [id, cmd] of Object.entries(ids)) {
    const r = await get({ COMMAND: cmd, EPHEM_TYPE: 'VECTORS', CENTER: '500@10', REF_PLANE: 'ECLIPTIC', REF_SYSTEM: 'ICRF', START_TIME: start, STOP_TIME: stop, STEP_SIZE: '1000', VEC_TABLE: '1', OUT_UNITS: 'AU-D', CSV_FORMAT: 'YES', OBJ_DATA: 'NO' });
    planetOut.ranges[name].planets[id] = soe(r).map((c) => ({ jdTdb: +c[0], xyz: [+c[2], +c[3], +c[4]] }));
    console.log(name.padEnd(7), id.padEnd(8), planetOut.ranges[name].planets[id].length, 'rows');
    await sleep(700);
  }
}
fs.writeFileSync(path.join(out, 'horizons_planets_vsop_ranges.json'), JSON.stringify(planetOut));
