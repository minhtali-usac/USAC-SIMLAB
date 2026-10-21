/** Local-time helpers for modules that use real dates with a fixed UTC offset. */
import { dateToJD } from '@usac/sim-core';

export interface Location { id: string; name: { vi: string; en: string }; lat: number; lon: number; tz: number }

export const LOCATIONS: Location[] = [
  { id: 'hanoi', name: { vi: 'Hà Nội', en: 'Hanoi' }, lat: 21.0285, lon: 105.8542, tz: 7 },
  { id: 'hcmc', name: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City' }, lat: 10.8231, lon: 106.6297, tz: 7 },
  { id: 'hue', name: { vi: 'Huế', en: 'Hue' }, lat: 16.4637, lon: 107.5909, tz: 7 },
  { id: 'equator', name: { vi: 'Xích đạo (0°, 0°)', en: 'Equator (0°, 0°)' }, lat: 0, lon: 0, tz: 0 },
  { id: 'tropic', name: { vi: 'Chí tuyến Bắc (23,44°N)', en: 'Tropic of Cancer (23.44°N)' }, lat: 23.44, lon: 105, tz: 7 },
  { id: 'london', name: { vi: 'London', en: 'London' }, lat: 51.5074, lon: -0.1278, tz: 0 },
  { id: 'tromso', name: { vi: 'Tromsø (Na Uy)', en: 'Tromsø (Norway)' }, lat: 69.6496, lon: 18.956, tz: 1 },
  { id: 'northpole', name: { vi: 'Cực Bắc', en: 'North Pole' }, lat: 90, lon: 0, tz: 0 },
  { id: 'sydney', name: { vi: 'Sydney', en: 'Sydney' }, lat: -33.8688, lon: 151.2093, tz: 10 },
  { id: 'santiago', name: { vi: 'Santiago (Chile)', en: 'Santiago (Chile)' }, lat: -33.4489, lon: -70.6693, tz: -4 },
];

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** UTC ms → local calendar parts for a fixed offset (hours). */
export function localParts(utcMs: number, tz: number) {
  const d = new Date(utcMs + tz * 3_600_000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 };
}

export const dateKey = (p: { y: number; m: number; d: number }) => `${p.y}-${pad2(p.m)}-${pad2(p.d)}`;

/** Local date "YYYY-MM-DD" + minutes → UTC ms. */
export function localToUtcMs(date: string, minutes: number, tz: number): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d) + (minutes - tz * 60) * 60_000;
}

/** JD (UT) of local midnight for a date key. */
export const jdLocalMidnight = (date: string, tz: number) => dateToJD(localToUtcMs(date, 0, tz));

/** JD → local "HH:MM" for a fixed offset. */
export function jdToLocalHHMM(jd: number | null, tz: number): string {
  if (jd === null) return '-';
  const ms = (jd - 2_440_587.5) * 86_400_000 + tz * 3_600_000;
  const d = new Date(Math.round(ms / 60_000) * 60_000);
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

export const tzLabel = (tz: number) => `UTC${tz >= 0 ? '+' : '−'}${Math.abs(tz)}`;

export const todayKey = (tz: number) => dateKey(localParts(Date.now(), tz));
export const nowMinutes = (tz: number) => Math.floor(localParts(Date.now(), tz).minutes);
