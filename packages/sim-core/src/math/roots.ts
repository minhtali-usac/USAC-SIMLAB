/** Root finding. */

/** Bisection on [a, b] where f(a)·f(b) ≤ 0. Converges to machine precision. */
export function bisect(f: (x: number) => number, a: number, b: number, tol = 0, maxIter = 200): number {
  let fa = f(a);
  const fb = f(b);
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa * fb > 0) throw new RangeError('bisect: root not bracketed');
  for (let i = 0; i < maxIter; i++) {
    const m = 0.5 * (a + b);
    if (m === a || m === b || Math.abs(b - a) <= tol) return m;
    const fm = f(m);
    if (fm === 0) return m;
    if (fa * fm < 0) b = m;
    else { a = m; fa = fm; }
  }
  return 0.5 * (a + b);
}

/**
 * Scan [a, b] in `n` steps and refine every sign change with bisection.
 * Returns roots in ascending order.
 */
export function findRoots(f: (x: number) => number, a: number, b: number, n: number, tol = 0): number[] {
  const roots: number[] = [];
  const h = (b - a) / n;
  let x0 = a;
  let f0 = f(x0);
  for (let i = 1; i <= n; i++) {
    const x1 = a + i * h;
    const f1 = f(x1);
    if (f0 === 0) roots.push(x0);
    else if (f0 * f1 < 0) roots.push(bisect(f, x0, x1, tol));
    x0 = x1;
    f0 = f1;
  }
  return roots;
}
