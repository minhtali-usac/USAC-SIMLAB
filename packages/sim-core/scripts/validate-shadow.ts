import fs from 'node:fs';
import path from 'node:path';
import { validateShadowEdge } from '../src/validation/shadowValidation';

const rows = validateShadowEdge();
const out = path.resolve(__dirname, '../../../docs/validation/D3-shadow.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), method: 'CPU float32 port of the D3 GLSL RK4 loop vs Synge (1966) analytic shadow', rows }, null, 2));
for (const r of rows) console.log(`r0 = ${r.r0} M: α_sh = ${r.exactDeg.toFixed(4)}°, high ${(r.highRelErr * 100).toFixed(4)}%, saver ${(r.saverRelErr * 100).toFixed(4)}%`);
console.log('→', out);
