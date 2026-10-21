/**
 * Download every published parameter solution (table `ps`) for the A4 preset planets from the
 * NASA Exoplanet Archive TAP service, and keep them as a fixture so presets can cite ONE solution.
 * Run: node reference/fetch_exoplanet_archive.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../packages/sim-core/test/fixtures/exoplanet_archive_ps.json');
const COLS = 'pl_name,pl_refname,default_flag,pl_pubdate,pl_orbper,pl_orbsmax,pl_radj,pl_rade,pl_bmassj,pl_bmasse,pl_bmassprov,pl_orbeccen,pl_orblper,pl_orbincl,pl_rvamp,pl_trandur,pl_trandep,pl_ratror,pl_ratdor,pl_imppar,st_mass,st_rad,st_teff';
const PLANETS = ['HD 209458 b', 'TRAPPIST-1 e', '51 Peg b', 'HD 189733 b'];

const rows = [];
for (const name of PLANETS) {
  const q = `select ${COLS} from ps where pl_name = '${name}'`;
  const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(q)}&format=json`;
  const r = await fetch(url);
  const txt = await r.text();
  if (!txt.trim().startsWith('[')) throw new Error(`${name}: unexpected response ${txt.slice(0, 120)}`);
  const data = JSON.parse(txt).map((x) => ({ ...x, pl_refname: (x.pl_refname ?? '').replace(/<[^>]+>/g, '').trim(), ref_url: (x.pl_refname ?? '').match(/href=(\S+)/)?.[1] ?? null }));
  rows.push(...data);
  console.log(`${name}: ${data.length} solutions`);
  await new Promise((res) => setTimeout(res, 1500));
}
fs.writeFileSync(OUT, JSON.stringify({ source: 'NASA Exoplanet Archive TAP, table ps (Planetary Systems)', retrieved: new Date().toISOString(), rows }, null, 1));
console.log('→', OUT);
