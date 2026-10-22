// Translate Celestia's analytic satellite theories (Galilean moons, the eight classical Saturnian moons and the
// GUST86 tables of the Uranian moons) from C++ to TypeScript, mechanically, so that no coefficient is retyped.
//
//   node reference/extract_celestia_satellites.mjs <path to Celestia/src/celephem/customorbit.cpp>
//
// Writes packages/sim-core/src/ephemeris/satelliteTheories.ts. Only syntax is rewritten (std::sin → Math.sin,
// "double x" → "let x", out-parameter calls → destructuring); every number and every expression is copied as is.
//
// Copyright (C) 2026, the USAC SimLab team. This script is part of USAC SimLab, licensed under the GNU General
// Public License, version 2 or (at your option) any later version. The emitted code is derived from Celestia
// (Copyright (C) 2001, Chris Laurel; the Celestia Development Team), see NOTICE.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) { console.error('usage: node extract_celestia_satellites.mjs <customorbit.cpp>'); process.exit(1); }
const text = fs.readFileSync(src, 'utf8');

/** Text of the {...} block that starts at or after `from` (brace matching). */
function block(from) {
  const open = text.indexOf('{', from);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return { body: text.slice(open + 1, i), end: i };
  }
  throw new Error('unbalanced braces');
}

// helpers whose outputs are C++ reference parameters: name → emitted TS name and number of input arguments
const OUT = {
  ComputeGalileanElements: { ts: 'galileanElements', nIn: 1 },
  ComputeSaturnianElements: { ts: 'saturnianElements', nIn: 1 },
  OuterSaturnMoonParams: { ts: 'outerSaturnMoonParams', nIn: 6 },
};

function convert(body) {
  let s = body;
  // out-parameter calls  Name(in..., out...);  →  ({ out... } = ts(in...));
  s = s.replace(/\b(ComputeGalileanElements|ComputeSaturnianElements|OuterSaturnMoonParams)\s*\(([\s\S]*?)\);/g, (_m, fn, args) => {
    const a = args.split(',').map((x) => x.trim()).filter(Boolean);
    const spec = OUT[fn];
    return `({ ${a.slice(spec.nIn).join(', ')} } = ${spec.ts}(${a.slice(0, spec.nIn).join(', ')}));`;
  });
  // declarations: "double a, b;" → typed let ; "double a = …;" → let
  s = s.replace(/^(\s*)double\s+([^=;()]+);/gm, (_m, ind, names) => `${ind}let ${names.split(',').map((n) => `${n.trim()}: number`).join(', ')};`);
  s = s.replace(/\bdouble\s+(?=\w+\s*=)/g, 'let ');
  s = s.replace(/\bfor \(int /g, 'for (let ');
  // C++ library calls
  s = s.replace(/math::sincos\((\w+), (\w+), (\w+)\);/g, '$2 = Math.sin($1); $3 = Math.cos($1);');
  s = s.replace(/math::radToDeg\(/g, 'radToDeg(').replace(/math::degToRad\(/g, 'degToRad(').replace(/math::pfmod\(/g, 'pfmod(')
    .replace(/math::square\(/g, 'sq(').replace(/math::cube\(/g, 'cube(');
  s = s.replace(/std::(sin|cos|atan2|atan|sqrt|asin)\(/g, 'Math.$1(').replace(/(?<![\w.])atan\(/g, 'Math.atan(');
  s = s.replace(/(?<![\w.])(sin|cos)\(/g, 'Math.$1(').replace(/\(int\)(\w+)/g, 'Math.trunc($1)');
  s = s.replace(/std::numbers::pi/g, 'Math.PI');
  s = s.replace(/return from_polar\(/g, 'return fromPolar(').replace(/return SaturnMoonPosition\(/g, 'return saturnMoonPosition(');
  s = s.replace(/return Eigen::Vector3d\(([^;]*)\);/g, 'return [$1];');
  return s.replace(/^\n+/, '').replace(/\n\s*$/, '');
}

const indent = (s, n = 2) => s.split('\n').map((l) => (l.trim() ? ' '.repeat(n) + l.replace(/^ {0,8}/, '') : l)).join('\n');

// ── constants ────────────────────────────────────────────────────────────────────────────────
const consts = [];
for (const name of ['TWOPI', 'LPEJ', 'JupiterRadius', 'SaturnRadius', 'JupAscendingNode', 'SatAscendingNode', 'SatTilt']) {
  const m = new RegExp(`constexpr double ${name}\\s*=\\s*([^;]+);`).exec(text);
  if (!m) throw new Error(`missing constant ${name}`);
  consts.push(`const ${name} = ${m[1].replace(/math::degToRad\(/g, 'degToRad(')};`);
}

// ── helper functions with reference parameters ───────────────────────────────────────────────
function helper(cppName, tsName, kind) {
  const i = text.indexOf(`\n${cppName}(`);
  if (i < 0) throw new Error(`missing ${cppName}`);
  const params = text.slice(i + cppName.length + 2, text.indexOf(')', i)).split(',').map((p) => p.trim());
  const { body } = block(i);
  if (kind === 'out') {
    const ins = params.filter((p) => !p.includes('&')).map((p) => `${p.replace('double ', '')}: number`);
    const outs = params.filter((p) => p.includes('&')).map((p) => p.replace('double&', '').trim());
    return `function ${tsName}(${ins.join(', ')}): { ${outs.map((o) => `${o}: number`).join('; ')} } {\n  let ${outs.map((o) => `${o}: number`).join(', ')};\n${indent(convert(body))}\n  return { ${outs.join(', ')} };\n}`;
  }
  const ps = params.map((p) => `${p.replace('double ', '')}: number`);
  return `function ${tsName}(${ps.join(', ')}): Vec3 {\n${indent(convert(body))}\n}`;
}

const helpers = [
  helper('ComputeGalileanElements', 'galileanElements', 'out'),
  helper('ComputeSaturnianElements', 'saturnianElements', 'out'),
  helper('OuterSaturnMoonParams', 'outerSaturnMoonParams', 'out'),
  helper('SaturnMoonPosition', 'saturnMoonPosition', 'ret'),
].join('\n\n');

// ── moons ────────────────────────────────────────────────────────────────────────────────────
const MOONS = ['Io', 'Europa', 'Ganymede', 'Callisto', 'Mimas', 'Enceladus', 'Tethys', 'Dione', 'Rhea', 'Titan', 'Hyperion', 'Iapetus'];
const funcs = [];
const periods = [];
for (const name of MOONS) {
  const cls = text.indexOf(`class ${name}Orbit : public CachingOrbit`);
  if (cls < 0) throw new Error(`missing class ${name}Orbit`);
  const fn = text.indexOf('computePosition(double jd) const override', cls);
  const { body } = block(fn);
  const per = /getPeriod\(\) const override\s*\{\s*return\s+([0-9.eE+-]+);/.exec(text.slice(cls, cls + 20000));
  if (!per) throw new Error(`no period for ${name}`);
  const id = name.toLowerCase();
  funcs.push(`/** ${name}: position relative to the parent planet, km, in Celestia's internal axes (x, y, z) = (X, Z, −Y). jd = TDB. */\nexport function ${id}(jd: number): Vec3 {\n${indent(convert(body))}\n}`);
  periods.push(`  ${id}: ${per[1]},`);
}

// ── the Moon: Meeus ch. 47 series (longitude, latitude, distance; mean equinox of date) ──────
const lunarCls = text.indexOf('class LunarOrbit : public CachingOrbit');
const lunarFn = text.indexOf('computePosition(double jd) const override', lunarCls);
const lunarBody = block(lunarFn).body;
const LUNAR_STOP = 'distance = 6378.14 / std::sin(horzPar);';
const lunarEnd = lunarBody.indexOf(LUNAR_STOP) + LUNAR_STOP.length;
const lunar = `/**
 * Geocentric Moon from the series of J. Meeus, Astronomical Algorithms, ch. 47 (Chapront-Touzé & Chapront, ELP-2000/82
 * truncated). Ecliptic longitude and latitude [rad] refer to the mean equinox and ecliptic of the date; distance in km.
 * jd = TDB.
 */
export function lunarSeries(jd: number): { lon: number; lat: number; distanceKm: number } {
${indent(convert(lunarBody.slice(0, lunarEnd)))}
  return { lon: eclLon, lat: eclLat, distanceKm: distance };
}`;

// ── GUST86 tables (Uranian moons) ────────────────────────────────────────────────────────────
const uran = [];
for (const name of ['n', 'a', 'L0', 'L1', 'L_k', 'L_theta', 'L_phi', 'z_k', 'z_theta', 'z_phi', 'zeta_k', 'zeta_theta', 'zeta_phi']) {
  const m = new RegExp(`constexpr std::array<[^>]*(?:<[^>]*>)?[^>]*>\\s+uran_${name}\\s*\\{([\\s\\S]*?)\\};`).exec(text);
  if (!m) throw new Error(`missing uran_${name}`);
  const arr = ('{' + m[1] + '}').replace(/(?:LTerms|ZTerms|ZetaTerms)\s*\{/g, '{').replace(/\{/g, '[').replace(/\}/g, ']').replace(/,\s*\]/g, ']').replace(/\s+/g, ' ');
  uran.push(`  ${name}: ${arr},`);
}

const out = `/**
 * Analytic theories of the natural satellites of Jupiter (Galilean moons) and Saturn (Mimas … Iapetus), and the
 * GUST86 tables for the five large Uranian moons. Generated - do not edit by hand:
 *
 *   node reference/extract_celestia_satellites.mjs <Celestia>/src/celephem/customorbit.cpp
 *
 * Sources (as cited by Celestia): the Galilean theory is that of J. Meeus, Astronomical Algorithms, ch. 44
 * (after Sampson 1921 / Lieske); the Saturnian theory is Dourneau's, from Meeus ch. 46; GUST86 is Laskar &
 * Jacobson (1987), A&A 188, 212.
 *
 * Each function returns the moon's position relative to its parent planet in kilometres, in the internal axes
 * used by Celestia: (x, y, z) = (X, Z, −Y) of a frame tied to the planet. satellites.ts converts to the J2000
 * ecliptic and measures the result against JPL Horizons.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2001, Chris Laurel <claurel@shatters.net> and the Celestia Development Team (Celestia 1.7.0,
 * src/celephem/customorbit.cpp). Modified for USAC SimLab by the USAC SimLab team on 2026-10-22: translated
 * from C++ to TypeScript by reference/extract_celestia_satellites.mjs (syntax only). See NOTICE.md.
 */
import type { Vec3 } from '../math/vec';

const degToRad = (d: number) => (d * Math.PI) / 180;
const radToDeg = (r: number) => (r * 180) / Math.PI;
const sq = (x: number) => x * x;
const cube = (x: number) => x * x * x;
/** Remainder in [0, b), like Celestia's math::pfmod. */
const pfmod = (a: number, b: number) => a - Math.floor(a / b) * b;
const sinD = (theta: number) => Math.sin(degToRad(theta));
const cosD = (theta: number) => Math.cos(degToRad(theta));

/** (x, y, z) in Celestia's internal axes from longitude, latitude and distance. */
function fromPolar(lon: number, lat: number, distance: number): Vec3 {
  return [Math.cos(lon) * Math.sin(lat) * distance, Math.cos(lat) * distance, -Math.sin(lon) * Math.sin(lat) * distance];
}

${consts.join('\n')}

${helpers}

${funcs.join('\n\n')}

${lunar}

/** Sidereal orbital periods [days] as quoted by Celestia. */
export const THEORY_PERIOD_DAYS = {
${periods.join('\n')}
} as const;

/** GUST86 tables (Laskar & Jacobson 1987), one entry per moon: Miranda, Ariel, Umbriel, Titania, Oberon. */
export const GUST86 = {
${uran.join('\n')}
} as const;
`;

const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'sim-core', 'src', 'ephemeris', 'satelliteTheories.ts');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`${MOONS.length} moons + GUST86 → ${dest} (${(out.length / 1024).toFixed(0)} kB)`);
