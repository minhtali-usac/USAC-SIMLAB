import { describe, it, expect } from 'vitest';
import {
  dateToJD, gmstDeg, sunPosition, sunEvents, sunHorizontal, moonPhase, nextLunarPhase, upcomingLunarPhases,
  planetHeliocentric, JD_J2000, eclipticToEquatorial, equatorialToEcliptic, jdToDate,
} from '../src';

describe('Time', () => {
  it('J2000 epoch', () => {
    expect(dateToJD(Date.UTC(2000, 0, 1, 12))).toBe(JD_J2000);
    expect(jdToDate(JD_J2000).toISOString()).toBe('2000-01-01T12:00:00.000Z');
  });
  it('GMST — Meeus Example 12.a: 1987-04-10 0h UT → 13h10m46.3668s', () => {
    const g = gmstDeg(2_446_895.5);
    expect(g / 15).toBeCloseTo(13 + 10 / 60 + 46.3668 / 3600, 6);
  });
});

describe('Sun (A1)', () => {
  it('Meeus Example 25.a: 1992-10-13 0h TD → RA 198.38083°, Dec −7.78507°', () => {
    // input is UT; subtract ΔT so the TD instant matches the example
    const s = sunPosition(2_448_908.5 - 69.2 / 86400);
    expect(s.ra).toBeCloseTo(198.380_83, 2);
    expect(s.dec).toBeCloseTo(-7.785_07, 2);
    expect(s.distanceAu).toBeCloseTo(0.997_66, 4);
  });
  it('June solstice declination ≈ +23.44°', () => {
    const s = sunPosition(dateToJD(Date.UTC(2024, 5, 20, 20, 51)));
    expect(s.dec).toBeCloseTo(23.44, 1);
  });
  it('equation of time extrema: ≈ +16.4 min early Nov, ≈ −14.2 min mid-Feb', () => {
    expect(sunPosition(dateToJD(Date.UTC(2024, 10, 3))).eotMinutes).toBeCloseTo(16.4, 0);
    expect(sunPosition(dateToJD(Date.UTC(2024, 1, 11))).eotMinutes).toBeCloseTo(-14.2, 0);
  });
  it('Hanoi day length at June solstice ≈ 13 h 27 min (timeanddate.com: 05:13–18:40) and polar day at 80°N', () => {
    // local midnight Hanoi (UTC+7) on 2024-06-21 = 2024-06-20 17:00 UT
    const ev = sunEvents(dateToJD(Date.UTC(2024, 5, 20, 17)), 21.0285, 105.8542);
    expect(ev.dayLengthHours).toBeGreaterThan(13.35);
    expect(ev.dayLengthHours).toBeLessThan(13.5);
    const polar = sunEvents(dateToJD(Date.UTC(2024, 5, 21)), 80, 0);
    expect(polar.dayLengthHours).toBe(24);
  });
  it('noon altitude at equator on March equinox ≈ 90°', () => {
    const ev = sunEvents(dateToJD(Date.UTC(2024, 2, 20)), 0, 0);
    expect(ev.noonAltitude).toBeGreaterThan(89.5);
    expect(sunHorizontal(ev.noon, 0, 0, false).alt).toBeGreaterThan(89.5);
  });
});

describe('Moon (A3)', () => {
  it('new moon 2024-01-11 11:57 UTC and full moon 2024-01-25 17:54 UTC (USNO) within 2 h', () => {
    const nm = nextLunarPhase(dateToJD(Date.UTC(2024, 0, 5)), 0);
    expect(Math.abs(nm - dateToJD(Date.UTC(2024, 0, 11, 11, 57))) * 24).toBeLessThan(2);
    const fm = nextLunarPhase(dateToJD(Date.UTC(2024, 0, 15)), 180);
    expect(Math.abs(fm - dateToJD(Date.UTC(2024, 0, 25, 17, 54))) * 24).toBeLessThan(2);
  });
  it('upcoming phases are chronological, each kind once, and drop a phase as soon as it has passed', () => {
    const t0 = dateToJD(Date.UTC(2026, 10, 17, 12)); // 17 Nov 2026 12:00 UTC
    const list = upcomingLunarPhases(t0);
    expect(list.map((p) => p.phase).sort()).toEqual([0, 180, 270, 90]);
    for (let i = 0; i < 4; i++) {
      expect(list[i].jd).toBeGreaterThanOrEqual(t0);
      if (i) expect(list[i].jd).toBeGreaterThan(list[i - 1].jd);
    }
    expect(list[3].jd - list[0].jd).toBeLessThan(29.6);
    // one minute after a phase, that phase moves a full lunation ahead and goes to the end of the list
    const first = list[0];
    const later = upcomingLunarPhases(first.jd + 1 / 1440);
    expect(later[3].phase).toBe(first.phase);
    expect(later[3].jd - first.jd).toBeGreaterThan(29.2);
    expect(later[3].jd - first.jd).toBeLessThan(29.9);
  });
  it('illuminated fraction ≈ 1 at full moon and ≈ 0 at new moon', () => {
    expect(moonPhase(dateToJD(Date.UTC(2024, 0, 25, 17, 54))).illuminated).toBeGreaterThan(0.99);
    expect(moonPhase(dateToJD(Date.UTC(2024, 0, 11, 11, 57))).illuminated).toBeLessThan(0.01);
  });
});

describe('Planets — JPL approximate elements', () => {
  it('Earth (EMB) heliocentric position at J2000 ≈ (−0.1771, 0.9672, 0) au', () => {
    const p = planetHeliocentric('earth', JD_J2000);
    expect(p[0]).toBeCloseTo(-0.1771, 2);
    expect(p[1]).toBeCloseTo(0.9672, 2);
    expect(Math.abs(p[2])).toBeLessThan(1e-4);
  });
  it('Mars distance from Sun within perihelion/aphelion bounds', () => {
    for (let y = 1990; y < 2050; y += 3) {
      const p = planetHeliocentric('mars', dateToJD(Date.UTC(y, 0, 1)));
      const r = Math.hypot(...p);
      expect(r).toBeGreaterThan(1.38);
      expect(r).toBeLessThan(1.67);
    }
  });
  it('ecliptic ↔ equatorial round trip', () => {
    const q = eclipticToEquatorial({ lon: 123.4, lat: -5.6 }, 23.44);
    const back = equatorialToEcliptic(q, 23.44);
    expect(back.lon).toBeCloseTo(123.4, 10);
    expect(back.lat).toBeCloseTo(-5.6, 10);
  });
});
