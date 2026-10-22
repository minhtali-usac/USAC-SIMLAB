// Extract the truncated VSOP87 series from Celestia's source into a TypeScript data module.
//
//   node reference/extract_celestia_vsop87.mjs <path to Celestia/src/celephem/vsop87.cpp>
//
// Writes packages/sim-core/src/ephemeris/vsop87Data.ts. The numbers are copied verbatim (same digits as
// Celestia, which truncated the full VSOP87B / VSOP87E data of Bretagnon & Francou, A&A 202, 309, 1988).
//
// Copyright (C) 2026, the USAC SimLab team. This script is part of USAC SimLab, licensed under the GNU
// General Public License, version 2 or (at your option) any later version. The data it emits is derived
// from Celestia (Copyright (C) 2002, Chris Laurel; Celestia Development Team), see NOTICE.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) { console.error('usage: node extract_celestia_vsop87.mjs <vsop87.cpp>'); process.exit(1); }
const text = fs.readFileSync(src, 'utf8');

// named term arrays: constexpr std::array<VSOPTerm, N> name { VSOPTerm { A, B, C }, ... };   (also "name = {")
const arrays = new Map();
const arrayRe = /constexpr std::array<VSOPTerm,\s*(\d+)>\s+(\w+)\s*=?\s*\{([\s\S]*?)\};/g;
for (const m of text.matchAll(arrayRe)) {
  const [, n, name, body] = m;
  const terms = [...body.matchAll(/VSOPTerm\s*\{\s*([^,}]+),\s*([^,}]+),\s*([^,}]+)\}/g)].map((t) => [t[1].trim(), t[2].trim(), t[3].trim()]);
  if (terms.length !== Number(n)) throw new Error(`${name}: declared ${n} terms, parsed ${terms.length}`);
  arrays.set(name, terms);
}

// groups: constexpr std::array body_X { VSOPSeries(body_X0), VSOPSeries(body_X1), ... };
const groups = new Map();
for (const m of text.matchAll(/constexpr std::array\s+(\w+)\s*\{([^}]*)\};/g)) {
  const names = [...m[2].matchAll(/VSOPSeries\((\w+)\)/g)].map((x) => x[1]);
  if (names.length) groups.set(m[1], names);
}

const PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const num = (s) => (/^-?\d+$/.test(s) ? s : String(Number(s))); // keep every digit; normalise "1e-05" style
const series = (names) => names.map((n) => {
  const t = arrays.get(n);
  if (!t) throw new Error(`missing series ${n}`);
  return `[${t.map((x) => x.map(num).join(',')).join(',')}]`;
});

let totalTerms = 0;
const lines = [];
const bodies = [...PLANETS.map((p) => [p, ['L', 'B', 'R']]), ['sun', ['X', 'Y', 'Z']]];
for (const [body, comps] of bodies) {
  lines.push(`  ${body}: {`);
  for (const c of comps) {
    const names = groups.get(`${body}_${c}`);
    if (!names) throw new Error(`missing group ${body}_${c}`);
    for (const n of names) totalTerms += arrays.get(n)?.length ?? 0;
    lines.push(`    ${c}: [${series(names).join(',')}],`);
  }
  lines.push('  },');
}

const out = `/**
 * Truncated VSOP87 series for the eight planets (VSOP87B: heliocentric spherical L, B, R) and for the Sun
 * (VSOP87E: barycentric rectangular X, Y, Z), J2000 ecliptic and equinox. Generated - do not edit by hand:
 *
 *   node reference/extract_celestia_vsop87.mjs <Celestia>/src/celephem/vsop87.cpp
 *
 * Each series is a flat array of (A, B, C) triples: term = A·cos(B + C·t), t in Julian millennia from J2000.
 * Radius series are in au, angles in radians, rates in radians per millennium; the Sun's X, Y, Z are in au.
 *
 * Source: P. Bretagnon & G. Francou, "Planetary theories in rectangular and spherical variables - VSOP87
 * solutions", Astron. Astrophys. 202, 309 (1988); truncated by the Celestia Development Team.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2002, Chris Laurel <claurel@shatters.net> and the Celestia Development Team (truncated data,
 * Celestia 1.7.0, src/celephem/vsop87.cpp). Modified for USAC SimLab by the USAC SimLab team on 2026-10-22:
 * converted from C++ arrays to TypeScript number arrays. See NOTICE.md.
 */
export type VsopBody = 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

/** One coordinate = its power series in t: [t⁰ terms, t¹ terms, …], each a flat (A, B, C) array. */
export type VsopSeries = readonly (readonly number[])[];

export interface VsopSpherical { L: VsopSeries; B: VsopSeries; R: VsopSeries }
export interface VsopRectangular { X: VsopSeries; Y: VsopSeries; Z: VsopSeries }

export const VSOP87_PLANETS: Record<VsopBody, VsopSpherical> = {
${lines.slice(0, lines.findIndex((l) => l.startsWith('  sun:'))).join('\n')}
};

/** The Sun relative to the solar-system barycentre (VSOP87E), au. */
export const VSOP87_SUN: VsopRectangular = {
${lines.slice(lines.findIndex((l) => l.startsWith('  sun:')) + 1, -1).map((l) => l.replace(/^ {2}/, '')).join('\n')}
};
`;

const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'sim-core', 'src', 'ephemeris', 'vsop87Data.ts');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`${totalTerms} terms → ${dest} (${(out.length / 1024).toFixed(0)} kB)`);
