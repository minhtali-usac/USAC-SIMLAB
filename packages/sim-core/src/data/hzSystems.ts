/**
 * A6 star-system presets. Single source: NASA Exoplanet Archive, Planetary Systems Composite Parameters
 * (`pscomppars`), TAP query 2026-10-20; L = 10^st_lum. Per-row references listed in `source`.
 * The Sun: IAU 2015 Resolution B3 nominal L☉, T_eff☉ = 5772 K; planets: mean semi-major axes (NASA fact sheets).
 * Values change as the Archive updates - re-run the query before release.
 */
export interface HzSystemPreset {
  id: string;
  name: { vi: string; en: string };
  /** Luminosity [L☉] and effective temperature [K]. */
  L: number;
  teff: number;
  planets: { n: string; a: number }[];
  source: string;
}

export const HZ_SYSTEMS: HzSystemPreset[] = [
  {
    id: 'sun', name: { vi: 'Mặt Trời', en: 'The Sun' }, L: 1, teff: 5772,
    planets: [{ n: 'Venus', a: 0.723 }, { n: 'Earth', a: 1.0 }, { n: 'Mars', a: 1.524 }],
    source: 'IAU 2015 B3 (L☉, T_eff☉ = 5772 K); NASA Planetary Fact Sheet (a)',
  },
  {
    id: 'proxima', name: { vi: 'Proxima Centauri', en: 'Proxima Centauri' }, L: 10 ** -2.82102, teff: 2900,
    planets: [{ n: 'd', a: 0.02881 }, { n: 'b', a: 0.04848 }],
    source: 'NASA Exoplanet Archive pscomppars - Suárez Mascareño et al. 2025',
  },
  {
    id: 'trappist1', name: { vi: 'TRAPPIST-1', en: 'TRAPPIST-1' }, L: 10 ** -3.25727, teff: 2566,
    planets: [{ n: 'b', a: 0.01154 }, { n: 'c', a: 0.0158 }, { n: 'd', a: 0.02227 }, { n: 'e', a: 0.02925 }, { n: 'f', a: 0.03849 }, { n: 'g', a: 0.04683 }, { n: 'h', a: 0.06189 }],
    source: 'NASA Exoplanet Archive pscomppars - Agol et al. 2021',
  },
  {
    id: 'kepler452', name: { vi: 'Kepler-452', en: 'Kepler-452' }, L: 10 ** 0.08448, teff: 5757,
    planets: [{ n: 'b', a: 1.046 }],
    source: 'NASA Exoplanet Archive pscomppars - Jenkins et al. 2015 (T_eff, a); KOI DR25 supplemental (L)',
  },
  {
    id: 'kepler186', name: { vi: 'Kepler-186', en: 'Kepler-186' }, L: 10 ** -1.26, teff: 3755,
    planets: [{ n: 'f', a: 0.432 }],
    source: 'NASA Exoplanet Archive pscomppars - Torres et al. 2015 (row of planet f; inner planets use another solution and are omitted)',
  },
  {
    id: 'tauceti', name: { vi: 'Tau Ceti', en: 'Tau Ceti' }, L: 10 ** -0.30539, teff: 5310,
    planets: [{ n: 'g', a: 0.133 }, { n: 'h', a: 0.243 }, { n: 'f', a: 1.334 }],
    source: 'NASA Exoplanet Archive pscomppars - Sousa et al. 2008 (star), Feng et al. 2017 (a)',
  },
];
