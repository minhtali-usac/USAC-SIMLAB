/**
 * Marching-squares iso-lines of a scalar grid (row-major, index j·n1 + i) - display only.
 * `map(i, j)` converts fractional grid coordinates to canvas pixels. Non-finite cells are skipped.
 */
export function drawContour(ctx: CanvasRenderingContext2D, f: ArrayLike<number>, n1: number, n2: number, level: number, map: (i: number, j: number) => [number, number]) {
  ctx.beginPath();
  const lerp = (a: number, b: number) => (level - a) / (b - a);
  for (let j = 0; j < n2 - 1; j++) for (let i = 0; i < n1 - 1; i++) {
    const a = f[j * n1 + i], b = f[j * n1 + i + 1], c = f[(j + 1) * n1 + i + 1], d = f[(j + 1) * n1 + i];
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)) continue;
    const idx = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0);
    if (idx === 0 || idx === 15) continue;
    // edge points: bottom (a–b), right (b–c), top (d–c), left (a–d)
    const E = [
      () => map(i + lerp(a, b), j), () => map(i + 1, j + lerp(b, c)),
      () => map(i + lerp(d, c), j + 1), () => map(i, j + lerp(a, d)),
    ];
    const segs: Record<number, [number, number][]> = {
      1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 2], [0, 1]], 6: [[0, 2]], 7: [[3, 2]],
      8: [[2, 3]], 9: [[0, 2]], 10: [[0, 3], [1, 2]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[0, 3]],
    };
    for (const [p, q] of segs[idx]) { const P = E[p](), Q = E[q](); ctx.moveTo(P[0], P[1]); ctx.lineTo(Q[0], Q[1]); }
  }
  ctx.stroke();
}
