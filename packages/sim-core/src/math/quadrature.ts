/** Numerical quadrature. */

/**
 * Adaptive Simpson integration of f on [a, b] to absolute tolerance `eps`.
 * (Lyness 1969 refinement with Richardson correction.)
 */
export function adaptiveSimpson(f: (x: number) => number, a: number, b: number, eps = 1e-12, maxDepth = 50): number {
  const fa = f(a), fb = f(b), m = 0.5 * (a + b), fm = f(m);
  const whole = ((b - a) / 6) * (fa + 4 * fm + fb);
  return recurse(f, a, b, fa, fb, fm, whole, eps, maxDepth);
}

function recurse(
  f: (x: number) => number,
  a: number, b: number, fa: number, fb: number, fm: number,
  whole: number, eps: number, depth: number,
): number {
  const m = 0.5 * (a + b);
  const lm = 0.5 * (a + m), rm = 0.5 * (m + b);
  const flm = f(lm), frm = f(rm);
  const left = ((m - a) / 6) * (fa + 4 * flm + fm);
  const right = ((b - m) / 6) * (fm + 4 * frm + fb);
  const delta = left + right - whole;
  // a non-finite integrand never converges: stop at once instead of recursing 2^depth times
  if (!Number.isFinite(delta)) return NaN;
  if (depth <= 0 || Math.abs(delta) <= 15 * eps) return left + right + delta / 15;
  return (
    recurse(f, a, m, fa, fm, flm, left, eps / 2, depth - 1) +
    recurse(f, m, b, fm, fb, frm, right, eps / 2, depth - 1)
  );
}
