import fs from 'node:fs';
import path from 'node:path';
import { validateGr } from '../src/validation/grValidation';

const r = validateGr();
const out = path.resolve(__dirname, '../../../docs/validation/D2-geodesics.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), ...r }, null, 2));
console.table(r.advance);
console.log(r.mercury, r.circular, r.isco);
console.log('→', out);
