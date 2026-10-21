/** Minimal float64 3-vector algebra (tuples, allocation-light). */
export type Vec3 = [number, number, number];

export const v3 = (x = 0, y = 0, z = 0): Vec3 => [x, y, z];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a: Vec3): Vec3 => {
  const n = norm(a);
  return n === 0 ? [0, 0, 0] : [a[0] / n, a[1] / n, a[2] / n];
};

/** Rotate about the x axis by angle (rad). */
export const rotX = (a: Vec3, t: number): Vec3 => {
  const c = Math.cos(t), s = Math.sin(t);
  return [a[0], c * a[1] - s * a[2], s * a[1] + c * a[2]];
};
/** Rotate about the z axis by angle (rad). */
export const rotZ = (a: Vec3, t: number): Vec3 => {
  const c = Math.cos(t), s = Math.sin(t);
  return [c * a[0] - s * a[1], s * a[0] + c * a[1], a[2]];
};
