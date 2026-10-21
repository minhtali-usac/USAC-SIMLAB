import fs from 'node:fs';
import path from 'node:path';
import { validateCr3bp } from '../src/validation/cr3bpValidation';

const r = validateCr3bp();
const out = path.resolve(__dirname, '../../../docs/validation/B3-cr3bp.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), ...r }, null, 2));
console.log('mu', r.mu);
console.table(r.points.map((p) => ({ ...p, residual: r.residuals.find((x) => x.name === p.name)!.residual })));
console.log('C_L4 formula', r.cL4Formula, 'routh', r.routh, 'equilibrium', r.equilibrium);
for (const c of r.convergence) { console.log(c.id, 'ref drift', c.refMaxJacobiDrift.toExponential(1), 'RK4 vs ref', c.rk4VsRefPos.toExponential(1)); console.table(c.rows.map((x) => ({ rtol: x.rtol, posErr: x.posErr.toExponential(1), drift: x.maxJacobiDrift.toExponential(1), acc: x.accepted, rej: x.rejected }))); }
