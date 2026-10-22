// Translate Celestia's IAU rotation models (pole direction and prime meridian of the planets and large moons,
// IAU WGCCRE 2009/2015 reports) from C++ to TypeScript, mechanically.
//
//   node reference/extract_celestia_rotation.mjs <path to Celestia/src/celephem/customrotation.cpp>
//
// Writes packages/sim-core/src/ephemeris/iauRotationData.ts.
//
// Copyright (C) 2026, the USAC SimLab team. This script is part of USAC SimLab, licensed under the GNU General
// Public License, version 2 or (at your option) any later version. The emitted code is derived from Celestia
// (Copyright (C) 2008-2009, the Celestia Development Team), see NOTICE.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) { console.error('usage: node extract_celestia_rotation.mjs <customrotation.cpp>'); process.exit(1); }
const text = fs.readFileSync(src, 'utf8');

function block(from) {
  const open = text.indexOf('{', from);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(open + 1, i);
  }
  throw new Error('unbalanced braces');
}

function convert(s) {
  return s
    .replace(/math::degToRad\(/g, 'degToRad(')
    .replace(/std::(sin|cos)\(/g, 'Math.$1(').replace(/(?<![\w.])(sin|cos)\(/g, 'Math.$1(')
    .replace(/^(\s*)double\s+E\[14\];\s*$/gm, '$1const E = lunarArgs(d);')
    .replace(/^\s*calcArgs\(d, E\);\s*$/gm, '')
    .replace(/^(\s*)double\s+(\w+)\s*=/gm, '$1const $2 =')
    .replace(/clamp_centuries\(T\);/g, 'T = clampCenturies(T);')
    .replace(/^(\s*)const T = /gm, '$1let T = ');
}

const indent = (s, n) => s.split('\n').filter((l) => l.trim()).map((l) => ' '.repeat(n) + l.trim()).join('\n');

// ── custom classes: pole()/meridian() bodies ─────────────────────────────────────────────────
const models = new Map(); // id → { period, flipped, pole, meridian } (TS source strings)
for (const m of text.matchAll(/class IAU(\w+)RotationModel : public IAURotationModel\s*\{/g)) {
  const name = m[1];
  if (name === 'Precessing') continue;
  const base = m.index + m[0].length; // just after the class's opening brace
  const cls = block(m.index);
  const period = /IAURotationModel\(360\.0 \/ ([0-9.]+)\)/.exec(cls)?.[1];
  const flipped = /setFlipped\(true\)/.test(cls);
  const poleSig = /void pole\(double (\w+), double& ra, double\s*&\s*dec\) const override/.exec(cls);
  const merSig = /double meridian\(double (\w+)\) const override/.exec(cls);
  if (!poleSig || !merSig) { console.error(`skip ${name}: no pole/meridian`); continue; }
  const poleBody = block(base + cls.indexOf(poleSig[0]));
  const merBody = block(base + cls.indexOf(merSig[0]));
  const rename = (body, from) => (from === 'd' ? body : body.replace(new RegExp(`\\b${from}\\b`, 'g'), 'd'));
  models.set(name.toLowerCase(), {
    rate: period ? Number(period) : NaN, flipped,
    pole: `(d: number): [number, number] => {\n  let ra: number, dec: number;\n${indent(convert(rename(poleBody, poleSig[1])), 2)}\n  return [ra, dec];\n}`,
    meridian: `(d: number): number => {\n${indent(convert(rename(merBody, merSig[1])), 2)}\n}`,
  });
}

// ── lunar arguments helper (member function of the Moon's model) ─────────────────────────────
const calc = /void calcArgs\(double d, double E\[14\]\) const\s*\{/.exec(text);
const lunarArgs = block(calc.index).replace(/E\[(\d+)\]\s*=/g, 'E[$1] =').replace(/math::degToRad\(/g, 'degToRad(');

// ── precessing models and the factory table ──────────────────────────────────────────────────
const precessing = new Map();
for (const m of text.matchAll(/case CustomRotationModelType::IAU(\w+):\s*return std::make_shared<IAUPrecessingRotationModel>\(([^)]*)\);/g)) {
  precessing.set(m[1].toLowerCase(), m[2].split(',').map((x) => Number(x.trim())));
}

const WANT = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon', 'phobos', 'deimos', 'io', 'europa', 'ganymede',
  'callisto', 'mimas', 'enceladus', 'tethys', 'dione', 'rhea', 'titan', 'iapetus', 'miranda', 'ariel', 'umbriel', 'titania', 'oberon', 'triton'];
const entries = [];
for (const id of WANT) {
  const key = id === 'moon' ? 'lunar' : id;
  const model = models.get(key);
  if (model) {
    entries.push(`  ${id}: {\n    rateDegPerDay: ${model.rate},\n    pole: ${indent(model.pole, 4).trimStart()},\n    meridian: ${indent(model.meridian, 4).trimStart()},\n  },`);
  } else if (precessing.has(id)) {
    const [ra, dra, dec, ddec, w0, rate] = precessing.get(id);
    entries.push(`  ${id}: precessing(${ra}, ${dra}, ${dec}, ${ddec}, ${w0}, ${rate}),`);
  } else throw new Error(`no rotation model for ${id}`);
}

const out = `/**
 * IAU rotation models (pole direction and prime meridian) of the planets and the large moons, from the reports of
 * the IAU Working Group on Cartographic Coordinates and Rotational Elements (2009, 2015; Archinal et al. 2011,
 * Celest. Mech. Dyn. Astr. 109, 101; 2018, 130, 22). Generated - do not edit by hand:
 *
 *   node reference/extract_celestia_rotation.mjs <Celestia>/src/celephem/customrotation.cpp
 *
 * Time argument d = days since J2000.0 (TT). pole(d) → [α₀, δ₀] of the north pole in the J2000 equatorial frame
 * [deg]; meridian(d) → W [deg], the longitude of the prime meridian measured from the ascending node of the body's
 * equator on the J2000 equator. Secular terms are clamped by the caller (see rotation.ts), as Celestia does.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2008-2009, the Celestia Development Team (Celestia 1.7.0, src/celephem/customrotation.cpp).
 * Modified for USAC SimLab by the USAC SimLab team on 2026-10-22: translated from C++ to TypeScript by
 * reference/extract_celestia_rotation.mjs (syntax only). See NOTICE.md.
 */
const degToRad = (d: number) => (d * Math.PI) / 180;
/** Secular terms are not extrapolated beyond this many centuries from J2000 (as in Celestia). */
const SECULAR_VALID_CENTURIES = 50;
const clampCenturies = (T: number) => Math.max(-SECULAR_VALID_CENTURIES, Math.min(SECULAR_VALID_CENTURIES, T));

export interface IauModel {
  /** Mean rotation rate [deg/day] as given by the model's constructor (magnitude; the sign is in meridian()). */
  rateDegPerDay: number;
  pole: (d: number) => [number, number];
  meridian: (d: number) => number;
}

/** Uniform rotation about a pole that precesses linearly (rates in degrees per Julian century / per day). */
function precessing(ra0: number, raRate: number, dec0: number, decRate: number, w0: number, rate: number): IauModel {
  return {
    rateDegPerDay: rate,
    pole: (d) => { const T = clampCenturies(d / 36525); return [ra0 + raRate * T, dec0 + decRate * T]; },
    meridian: (d) => w0 + rate * d,
  };
}

/** Arguments E1…E13 of the IAU lunar model (E[0] unused). */
function lunarArgs(d: number): number[] {
  const E: number[] = new Array(14).fill(0);
${indent(lunarArgs, 2)}
  return E;
}

export const IAU_ROTATION: Record<string, IauModel> = {
${entries.join('\n')}
};
`;

const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'sim-core', 'src', 'ephemeris', 'iauRotationData.ts');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`${WANT.length} models → ${dest} (${(out.length / 1024).toFixed(0)} kB)`);
