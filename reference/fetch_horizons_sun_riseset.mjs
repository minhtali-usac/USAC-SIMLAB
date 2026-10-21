// JPL Horizons Sun rise/transit/set (refracted apparent horizon 'TVH') for several sites, 2025, 1-min resolution.
// Usage: node reference/fetch_horizons_sun_riseset.mjs packages/sim-core/test/fixtures [--sample]
import fs from 'node:fs';
import path from 'node:path';
const [, , out, flag] = process.argv;
const API = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const q = (o) => API + '?format=json&' + Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(`'${v}'`)}`).join('&');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(o) {
  for (let k = 0; k < 4; k++) {
    try { const j = await (await fetch(q(o))).json(); if (j.result) return j.result; throw new Error(JSON.stringify(j).slice(0, 300)); }
    catch (e) { console.error('retry', e.message); await sleep(4000); }
  }
  throw new Error('failed');
}
const SITES = [
  { id: 'hanoi', lat: 21.0285, lon: 105.8542 },
  { id: 'hcmc', lat: 10.8231, lon: 106.6297 },
  { id: 'helsinki', lat: 60.1699, lon: 24.9384 },
  { id: 'sydney', lat: -33.8688, lon: 151.2093 },
];
const base = { COMMAND: '10', EPHEM_TYPE: 'OBSERVER', CENTER: 'coord@399', COORD_TYPE: 'GEODETIC', STEP_SIZE: '1 min', R_T_S_ONLY: 'TVH', QUANTITIES: '4', CSV_FORMAT: 'YES', TIME_TYPE: 'UT' };
if (flag === '--sample') {
  const r = await get({ ...base, SITE_COORD: '105.8542,21.0285,0', START_TIME: '2025-06-20', STOP_TIME: '2025-06-22' });
  console.log(r.slice(r.indexOf('$$SOE') - 600, r.indexOf('$$EOE') + 10));
  process.exit(0);
}
const data = {};
for (const s of SITES) {
  const events = [];
  for (const [a, b] of [['2025-01-01', '2025-07-01'], ['2025-07-01', '2026-01-01']]) {
    const r = await get({ ...base, SITE_COORD: `${s.lon},${s.lat},0`, START_TIME: a, STOP_TIME: b });
    const body = r.slice(r.indexOf('$$SOE') + 5, r.indexOf('$$EOE')).trim().split('\n');
    for (const line of body) {
      const c = line.split(',').map((x) => x.trim());
      const kind = c[2]; // 'r' rise, 't' transit, 's' set
      if (kind === 'r' || kind === 's') events.push({ utc: c[0], kind });
    }
    await sleep(800);
  }
  data[s.id] = { lat: s.lat, lon: s.lon, events };
  console.log(s.id, events.length);
}
fs.writeFileSync(path.join(out, 'horizons_sun_riseset_2025.json'), JSON.stringify({
  source: "JPL Horizons API (DE441), Sun rise/set, R_T_S_ONLY='TVH' (refracted apparent upper limb on the true visual horizon), 1-min resolution, UT, elevation 0 m",
  generated: new Date().toISOString(), sites: data,
}, null, 1));
