import fs from 'node:fs';
import path from 'node:path';
import { validateHz } from '../src/validation/hzValidation';

const r = validateHz();
const out = path.resolve(__dirname, '../../../docs/validation/A6-habitable.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), ...r }, null, 2));
console.log(r.sun.map((s) => `${s.limit}: ${s.computedAu.toFixed(4)} au (ref ${s.referenceAu})`).join('\n'));
console.log(`T_eq Earth: ${r.earthTeq030.toFixed(2)} K (A_B 0.30), ${r.earthTeq0306.toFixed(2)} K (A_B 0.306); ordered=${r.ordered}; max rel flux err ${r.maxRelFluxErr.toExponential(1)}`);
console.log('→', out);
