import fs from 'node:fs';
import path from 'node:path';
import { validateSn } from '../src/validation/snValidation';

const r = validateSn();
const out = path.resolve(__dirname, '../../../docs/validation/F8-sn-inference.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), ...r }, null, 2));
console.log(JSON.stringify(r, null, 2));
console.log('→', out);
