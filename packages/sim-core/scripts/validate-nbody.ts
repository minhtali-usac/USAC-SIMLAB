import fs from 'node:fs';
import path from 'node:path';
import { validateNBody } from '../src/validation/nbodyValidation';

const r = validateNBody();
const out = path.resolve(__dirname, '../../../docs/validation/B4-nbody.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), ...r }, null, 2));
console.log(JSON.stringify(r, null, 1));
console.log('→', out);
