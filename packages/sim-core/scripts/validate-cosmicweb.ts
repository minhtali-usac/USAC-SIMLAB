import fs from 'node:fs';
import path from 'node:path';
import { validateCosmicWeb } from '../src/validation/cosmicWebValidation';

const r = validateCosmicWeb();
const out = path.resolve(__dirname, '../../../docs/validation/F6-cosmic-web.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), ...r }, null, 2));
console.log(JSON.stringify(r, null, 1));
console.log('→', out);
