/** Unit and angle conversion helpers. */

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;
export const TWO_PI = 2 * Math.PI;
/** Arcseconds per radian. */
export const ARCSEC_PER_RAD = (180 / Math.PI) * 3600;

export const degToRad = (d: number) => d * DEG;
export const radToDeg = (r: number) => r * RAD;

/** Wrap angle to [0, 2π). */
export function wrap2Pi(x: number): number {
  const y = x % TWO_PI;
  return y < 0 ? y + TWO_PI : y;
}
/** Wrap angle to [-π, π). */
export function wrapPi(x: number): number {
  return wrap2Pi(x + Math.PI) - Math.PI;
}
/** Wrap degrees to [0, 360). */
export function wrap360(x: number): number {
  const y = x % 360;
  return y < 0 ? y + 360 : y;
}
/** Wrap degrees to [-180, 180). */
export function wrap180(x: number): number {
  return wrap360(x + 180) - 180;
}

export const sinD = (d: number) => Math.sin(d * DEG);
export const cosD = (d: number) => Math.cos(d * DEG);
export const tanD = (d: number) => Math.tan(d * DEG);

/** Hours → degrees (RA). */
export const hoursToDeg = (h: number) => h * 15;
/** Parse sexagesimal h/d m s into a decimal value; sign taken from the first field (or `neg`). */
export function sexagesimal(a: number, b = 0, c = 0, neg = false): number {
  const s = neg || a < 0 || Object.is(a, -0) ? -1 : 1;
  return s * (Math.abs(a) + b / 60 + c / 3600);
}

/** Format decimal degrees as ±DD°MM′SS″. */
export function formatDms(deg: number, secDigits = 0): string {
  const sign = deg < 0 ? '−' : '+';
  let x = Math.abs(deg);
  let d = Math.floor(x);
  x = (x - d) * 60;
  let m = Math.floor(x);
  let s = (x - m) * 60;
  if (Number(s.toFixed(secDigits)) >= 60) { s = 0; m += 1; }
  if (m >= 60) { m = 0; d += 1; }
  return `${sign}${d}°${String(m).padStart(2, '0')}′${s.toFixed(secDigits).padStart(2 + (secDigits ? secDigits + 1 : 0), '0')}″`;
}

/** Format decimal hours as HHhMMmSSs. */
export function formatHms(hours: number): string {
  const total = Math.round((((hours % 24) + 24) % 24) * 3600) % 86_400;
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`;
}
