/** Run: npm run validate:exo → docs/validation/A4-exoplanets.json */
import fs from 'node:fs';
import path from 'node:path';
import { validateTransitFlux, validateEccentricGeometry, validatePresets } from '../src';

const t0 = Date.now();
const flux = validateTransitFlux();
const geom = validateEccentricGeometry();
const presets = validatePresets();
const out = path.resolve(__dirname, '../../../docs/validation/A4-exoplanets.json');
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), transitFlux: flux, eccentricGeometry: geom, presets }, null, 2));
const e = (x?: number) => (x === undefined ? '   -   ' : x.toExponential(2));
const pc = (x?: number) => (x === undefined ? '    -' : `${(x * 100).toFixed(2).padStart(6)}%`);
console.log('Transit flux (n = 400 rings)');
console.log(`  uniform vs exact overlap      max|ΔF| ${e(flux.uniformVsExactOverlap.maxAbsDF)}  (${flux.uniformVsExactOverlap.cases} cases)`);
console.log(`  limb-darkened vs 2-D quadrature max|ΔF| ${e(flux.limbDarkenedVs2DQuadrature.maxAbsDF)}  max rel. to depth ${e(flux.limbDarkenedVs2DQuadrature.maxRelToDepth)}  (${flux.limbDarkenedVs2DQuadrature.cases} cases)`);
console.log('Eccentric geometry');
console.log(`  e = 0 numerical T14 vs exact formula  max rel ${e(geom.circularNumericalVsExactMaxRel)}`);
console.log(`  e > 0 numerical T14 vs Winn 2010 approx max rel ${e(geom.eccentricNumericalVsWinnMaxRel)}`);
console.log(`  RV vs dZ/dt correlation ${geom.rvVsDZdtCorrelation.toFixed(12)}`);
console.log('Presets: model vs published (same solution)   ΔK     Δ(a/R★)   Δb     ΔT14    Δk');
for (const p of presets) console.log(`  ${p.id.padEnd(11)} ${p.solution.slice(0, 34).padEnd(34)} ${pc(p.relDiff.K)} ${pc(p.relDiff.aR)} ${pc(p.relDiff.b)} ${pc(p.relDiff.T14h)} ${pc(p.relDiff.k)}`);
console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s) → ${out}`);
