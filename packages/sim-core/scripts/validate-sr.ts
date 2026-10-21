import fs from 'node:fs';
import path from 'node:path';
import { validateSr } from '../src/validation/srValidation';

const r = validateSr();
const out = path.resolve(__dirname, '../../../docs/validation/C-special-relativity.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), ...r }, null, 2));
console.log(JSON.stringify(r, null, 1));
console.log('→', out);
