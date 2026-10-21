/**
 * Reference data for validating the A3 lunar model against JPL Horizons (DE441).
 * Reproducible: re-run `node reference/fetch_horizons_moon.mjs` to regenerate the fixtures in
 * packages/sim-core/test/fixtures/.
 *
 * 1. Principal phases 2000–2030: apparent geocentric ecliptic longitudes of Moon and Sun
 *    (Horizons quantity 31, observer = geocentre, of-date, apparent) every 6 h; the instants where
 *    λ☾ − λ☉ = 0°, 90°, 180°, 270° are found by 4-point Lagrange interpolation + bisection.
 * 2. Moonrise/moonset 2024–2025 at six sites (−34° … +60°): Horizons R_T_S_ONLY='TVH'
 *    (refracted apparent horizon), 1-minute resolution.
 * 3. Illuminated fraction 2024–2025 every 6 h, geocentre (Horizons quantity 10).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../packages/sim-core/test/fixtures');
fs.mkdirSync(OUT, { recursive: true });
const API = 'https://ssd.jpl.nasa.gov/api/horizons.api';

async function horizons(params) {
  const q = new URLSearchParams({ format: 'text', OBJ_DATA: "'NO'", MAKE_EPHEM: "'YES'", EPHEM_TYPE: "'OBSERVER'", CSV_FORMAT: "'NO'", ...params });
  for (let k = 0; k < 5; k++) {
    try {
      const txt = await (await fetch(`${API}?${q}`)).text();
      const m = txt.match(/\$\$SOE([\s\S]*?)\$\$EOE/);
      if (!m) throw new Error(txt.slice(0, 400));
      return m[1].trim().split('\n');
    } catch (e) {
      console.warn('retry', k, String(e).slice(0, 120));
      await new Promise((r) => setTimeout(r, 4000 * (k + 1)));
    }
  }
  throw new Error('Horizons failed');
}

const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const parseTime = (d, t) => {
  const [Y, M, D] = d.split('-');
  const [h, mi] = t.split(':');
  return Date.UTC(+Y, MON[M], +D, +h, +mi);
};

// ── 1. phases ────────────────────────────────────────────────────────────────
async function eclLon(body, start, stop) {
  const rows = await horizons({ COMMAND: `'${body}'`, CENTER: "'500@399'", START_TIME: `'${start}'`, STOP_TIME: `'${stop}'`, STEP_SIZE: "'6h'", QUANTITIES: "'31'", TIME_TYPE: "'UT'" });
  return rows.map((r) => {
    const p = r.trim().split(/\s+/);
    return { t: parseTime(p[0], p[1]), lon: +p[2] };
  });
}

const wrap = (x) => ((x % 360) + 540) % 360 - 180;
async function phases() {
  const out = [];
  for (let y0 = 2000; y0 <= 2030; y0 += 5) {
    const start = `${y0}-01-01`, stop = `${Math.min(y0 + 5, 2031)}-01-01`;
    const [moon, sun] = await Promise.all([eclLon('301', start, stop), eclLon('10', start, stop)]);
    const d = moon.map((m, i) => ({ t: m.t, x: wrap(m.lon - sun[i].lon) }));
    for (const target of [0, 90, 180, 270]) {
      const f = d.map((p) => ({ t: p.t, y: wrap(p.x - target) }));
      for (let i = 1; i < f.length - 2; i++) {
        if (f[i].y < 0 && f[i + 1].y >= 0 && f[i + 1].y - f[i].y < 30) {
          // 4-point Lagrange interpolation on (t, y) around the crossing, then bisection
          const P = [f[i - 1], f[i], f[i + 1], f[i + 2]];
          const lag = (t) => P.reduce((s, pj, j) => s + pj.y * P.reduce((pr, pk, k) => (k === j ? pr : pr * ((t - pk.t) / (pj.t - pk.t))), 1), 0);
          let a = f[i].t, b = f[i + 1].t;
          for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (lag(m) < 0) a = m; else b = m; }
          out.push({ phase: target, utc: new Date((a + b) / 2).toISOString() });
        }
      }
    }
    console.log(`phases ${start}…${stop}: ${out.length}`);
  }
  out.sort((p, q) => p.utc.localeCompare(q.utc));
  return out;
}

// ── 2. rise / set ────────────────────────────────────────────────────────────
const SITES = [
  { id: 'hanoi', lat: 21.0285, lon: 105.8542 },
  { id: 'hcmc', lat: 10.8231, lon: 106.6297 },
  { id: 'equator', lat: 0, lon: 0 },
  { id: 'sydney', lat: -33.8688, lon: 151.2093 },
  { id: 'london', lat: 51.5074, lon: -0.1278 },
  { id: 'oslo', lat: 59.9139, lon: 10.7522 },
];
async function riseSet() {
  const out = {};
  for (const s of SITES) {
    out[s.id] = { ...s, events: [] };
    for (const [start, stop] of [['2024-01-01', '2024-07-01'], ['2024-07-01', '2025-01-01'], ['2025-01-01', '2025-07-01'], ['2025-07-01', '2026-01-01']]) {
      const rows = await horizons({ COMMAND: "'301'", CENTER: "'coord@399'", COORD_TYPE: "'GEODETIC'", SITE_COORD: `'${s.lon},${s.lat},0'`, START_TIME: `'${start}'`, STOP_TIME: `'${stop}'`, STEP_SIZE: "'1m'", R_T_S_ONLY: "'TVH'", QUANTITIES: "'4'", APPARENT: "'REFRACTED'", TIME_TYPE: "'UT'" });
      for (const r of rows) {
        const m = r.match(/^\s*(\d{4}-\w{3}-\d{2})\s+(\d{2}:\d{2})\s+\S*?([rs])\s/);
        if (m) out[s.id].events.push({ type: m[3] === 'r' ? 'rise' : 'set', utc: new Date(parseTime(m[1], m[2])).toISOString() });
      }
    }
    console.log(`${s.id}: ${out[s.id].events.length} events`);
  }
  return out;
}

async function illumination() {
  const rows = await horizons({ COMMAND: "'301'", CENTER: "'500@399'", START_TIME: "'2024-01-01'", STOP_TIME: "'2026-01-01'", STEP_SIZE: "'6h'", QUANTITIES: "'10'", TIME_TYPE: "'UT'" });
  return rows.map((r) => { const p = r.trim().split(/\s+/); return { utc: new Date(parseTime(p[0], p[1])).toISOString(), illum: +p[2] / 100 }; });
}

if (process.argv.includes('--illum-only')) {
  fs.writeFileSync(path.join(OUT, 'horizons_moon_illumination_2024_2025.json'), JSON.stringify({ source: 'JPL Horizons API (DE441), quantity 10 illuminated fraction, geocentre, 6 h', generated: new Date().toISOString(), samples: await illumination() }, null, 1));
  console.log('illumination done');
  process.exit(0);
}
fs.writeFileSync(path.join(OUT, 'horizons_moon_illumination_2024_2025.json'), JSON.stringify({ source: 'JPL Horizons API (DE441), quantity 10 illuminated fraction, geocentre, 6 h', generated: new Date().toISOString(), samples: await illumination() }, null, 1));
const ph = await phases();
fs.writeFileSync(path.join(OUT, 'horizons_moon_phases_2000_2030.json'), JSON.stringify({ source: 'JPL Horizons API (DE441), quantity 31 apparent ecliptic lon/lat of date, geocentre, 6 h grid + Lagrange interpolation', generated: new Date().toISOString(), phases: ph }, null, 1));
const rs = await riseSet();
fs.writeFileSync(path.join(OUT, 'horizons_moon_riseset_2024_2025.json'), JSON.stringify({ source: "JPL Horizons API (DE441), R_T_S_ONLY='TVH' (refracted apparent horizon), 1-min resolution, UT", generated: new Date().toISOString(), sites: rs }, null, 1));
console.log('done');
