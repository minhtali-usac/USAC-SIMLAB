import fs from 'node:fs';
import path from 'node:path';
import { validateCosmology } from '../src/validation/cosmologyValidation';

const r = validateCosmology();
const out = path.resolve(__dirname, '../../../docs/validation/D8-cosmology.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), ...r }, null, 2));
console.log(r.ages, r.planck);
console.log({ eds: r.aOfT.edsMaxRelErr, deSitter: r.aOfT.deSitterMaxRelErr });
console.table(r.aOfT.closed);
console.log({ rec: r.boundary.maxAbsErrRecollapse, bb: r.boundary.maxAbsErrNoBigBang });
console.table(r.boundary.samples);
console.log('→', out);
