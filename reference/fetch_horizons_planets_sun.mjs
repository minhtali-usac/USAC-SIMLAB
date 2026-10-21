// Fetch JPL Horizons reference data for E1 (planets: heliocentric + barycentric) and A1 (apparent Sun).
// Usage: node reference/fetch_horizons_planets_sun.mjs packages/sim-core/test/fixtures
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
      if (!j.result) throw new Error(JSON.stringify(j).slice(0, 200));
      return j.result;
    } catch (e) { console.error('retry', e.message); await sleep(3000); }
  }
  throw new Error('failed');
}
const soe = (r) => r.slice(r.indexOf('$$SOE') + 5, r.indexOf('$$EOE')).trim().split('\n').map((l) => l.split(',').map((s) => s.trim()));

const BODIES = { mercury: '199', venus: '299', earth: '3', mars: '499', jupiter: '599', saturn: '699', uranus: '799', neptune: '899' };
for (const [center, file, label] of [['500@10', 'horizons_planets_1980_2050.json', 'heliocentric (Sun centre, 500@10)'], ['500@0', 'horizons_planets_bary_1980_2050.json', 'barycentric (Solar-System barycentre, 500@0)']]) {
  const planets = {};
  for (const [id, cmd] of Object.entries(BODIES)) {
    const r = await get({ COMMAND: cmd, EPHEM_TYPE: 'VECTORS', CENTER: center, REF_PLANE: 'ECLIPTIC', REF_SYSTEM: 'ICRF', START_TIME: '1980-01-01', STOP_TIME: '2050-01-01', STEP_SIZE: '120 d', TIME_TYPE: 'TDB', VEC_TABLE: '1', OUT_UNITS: 'AU-D', CSV_FORMAT: 'YES' });
    planets[id] = soe(r).map((c) => ({ jdTdb: +c[0], xyz: [+c[2], +c[3], +c[4]] }));
    console.log(center, id, planets[id].length);
    await sleep(800);
  }
  fs.writeFileSync(path.join(out, file), JSON.stringify({
    source: `JPL Horizons API (DE441), ${label} ecliptic J2000 / ICRF vectors, TDB, 120 d step; "earth" = Earth–Moon barycentre (3)`,
    generated: new Date().toISOString(), planets,
  }, null, 1));
}

const r = await get({ COMMAND: '10', EPHEM_TYPE: 'OBSERVER', CENTER: '500@399', START_TIME: '1990-01-01', STOP_TIME: '2040-01-01', STEP_SIZE: '37 d', TIME_TYPE: 'UT', QUANTITIES: '2,20', ANG_FORMAT: 'DEG', CSV_FORMAT: 'YES', EXTRA_PREC: 'YES' });
const rows = soe(r).map((c) => ({ utc: c[0], ra: +c[3], dec: +c[4], deltaAu: +c[5] }));
console.log('sun', rows.length, rows[0]);
fs.writeFileSync(path.join(out, 'horizons_sun_apparent_1990_2040.json'), JSON.stringify({
  source: 'JPL Horizons API (DE441), Sun apparent geocentric RA/Dec (airless, quantity 2) and range (20), UT, 37 d step',
  generated: new Date().toISOString(), rows,
}, null, 1));
