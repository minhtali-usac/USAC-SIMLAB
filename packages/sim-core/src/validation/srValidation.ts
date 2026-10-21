/**
 * C1, C2, C4 reproducible checks (special relativity).
 *  1. γ near β → 1: the factored form 1/√((1−β)(1+β)) vs the exact 1/√(ε(2−ε)), ε = 1 − β; naive 1/√(1−β²) for contrast.
 *  2. Invariance of s² = (cΔt)² − Δx² under 1+1D boosts (random events and rapidities).
 *  3. Collinear velocity addition equals tanh(η₁ + η₂).
 *  4. Twin paradox: traveller's proper time from the Lorentz-transformed turnaround event vs τ = t/γ.
 *  5. Aberration and Doppler factor vs an independent full boost of the photon 4-momentum (general 3D boost).
 *  6. Muon numbers: cτ₀ and the survival fraction computed in the Earth frame (time dilation) and in the muon
 *     frame (length contraction).
 */
import { gamma, boost1D, addVelocities, boost, aberrateCos, dopplerFactor, type FourVector } from '../relativity-sr/lorentz';
import { C, MUON_LIFETIME } from '../units/constants';

let cache: ReturnType<typeof compute> | null = null;
export const validateSr = () => (cache ??= compute());

function lcg(seed: number) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

function compute() {
  // 1. γ precision
  const gammaRows = [1e-3, 1e-6, 1e-9, 1e-12].map((eps) => {
    const beta = 1 - eps, exact = 1 / Math.sqrt(eps * (2 - eps));
    return { eps, factoredRelErr: Math.abs(gamma(beta) / exact - 1), naiveRelErr: Math.abs(1 / Math.sqrt(1 - beta * beta) / exact - 1) };
  });
  // 2. interval invariance
  const r = lcg(7);
  let maxIntervalErr = 0;
  for (let k = 0; k < 2000; k++) {
    const ct = 20 * (r() - 0.5), x = 20 * (r() - 0.5), eta = 6 * (r() - 0.5);
    const [a, b] = boost1D(ct, x, eta);
    const s0 = ct * ct - x * x, s1 = a * a - b * b;
    maxIntervalErr = Math.max(maxIntervalErr, Math.abs(s1 - s0) / Math.max(1, Math.abs(ct * ct) + Math.abs(x * x)));
  }
  // 3. velocity addition
  let maxAddErr = 0;
  for (let k = 0; k < 2000; k++) {
    const u = 1.98 * (r() - 0.5), v = 1.98 * (r() - 0.5);
    maxAddErr = Math.max(maxAddErr, Math.abs(addVelocities(u, v) - Math.tanh(Math.atanh(u) + Math.atanh(v))));
  }
  // 4. twins: turnaround event (ct = d/β, x = d) seen in the outbound frame has ct' = (d/β)/γ
  const twinRows = [[0.8, 4.24], [0.6, 4.24], [0.99, 8]].map(([b, d]) => {
    const tHome = (2 * d) / b, tauFormula = tHome / gamma(b);
    const [ctOut] = boost1D(d / b, d, Math.atanh(b));
    return { beta: b, distanceLy: d, tHome, tauTraveller: tauFormula, tauFromBoost: 2 * ctOut, relErr: Math.abs((2 * ctOut) / tauFormula - 1) };
  });
  // 5. aberration and Doppler from a full 4-vector boost
  let maxCosErr = 0, maxDopErr = 0;
  for (let k = 0; k < 4000; k++) {
    const beta = 0.999999 * r(), cth = 2 * r() - 1, sth = Math.sqrt(1 - cth * cth), ph = 2 * Math.PI * r();
    // light arriving FROM direction n travels along −n; photon 4-momentum k = (1, −n) in the stars' frame S
    const n = [cth, sth * Math.cos(ph), sth * Math.sin(ph)];
    const k0: FourVector = [1, -n[0], -n[1], -n[2]];
    const k1 = boost(k0, [beta, 0, 0]);
    const cosPrime = -k1[1] / k1[0]; // apparent direction (where light comes from) in the observer frame
    maxCosErr = Math.max(maxCosErr, Math.abs(cosPrime - aberrateCos(cth, beta)));
    const Dboost = k1[0] / k0[0], Dformula = gamma(beta) * (1 + beta * cth);
    // second form, observer-frame angle: D = 1/(γ(1 − β cos θ′)) (dopplerFactor with θ_obs = θ′)
    maxDopErr = Math.max(maxDopErr, Math.abs(Dboost / Dformula - 1), Math.abs(dopplerFactor(beta, cosPrime) / Dboost - 1));
  }
  // 6. muons (default scene: β = 0.9995, h = 15 km)
  const mb = 0.9995, h = 15e3, gm = gamma(mb);
  const tLab = h / (mb * C);
  const earthFrame = Math.exp(-tLab / (gm * MUON_LIFETIME));
  const muonFrame = Math.exp(-(h / gm) / (mb * C) / MUON_LIFETIME);
  // C4: forward Doppler D = √((1+β)/(1−β)); β at which the forward CMB (T₀ = 2.72548 K, Fixsen 2009) reaches 3000 K
  const T0 = 2.72548, Dneed = 3000 / T0, betaCmb3000 = (Dneed * Dneed - 1) / (Dneed * Dneed + 1);
  const forward = { betaCmb3000, oneMinusBeta: 2 / (Dneed * Dneed + 1), D: Dneed, checkD: gamma(betaCmb3000) * (1 + betaCmb3000), halfSkyConeDeg09: (Math.acos(0.9) * 180) / Math.PI };
  return {
    forward,
    gamma: gammaRows, maxIntervalErr, maxAddErr, twins: twinRows, aberration: { maxCosErr, maxDopplerRelErr: maxDopErr },
    muon: { cTau0: C * MUON_LIFETIME, beta: mb, gamma: gm, h, tLab, survivalEarthFrame: earthFrame, survivalMuonFrame: muonFrame, survivalClassical: Math.exp(-tLab / MUON_LIFETIME) },
  };
}
