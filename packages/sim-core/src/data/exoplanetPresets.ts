/**
 * A4 preset systems. Each preset uses ONE published parameter solution (no mixing across papers),
 * as retrieved from the NASA Exoplanet Archive table `ps` (see reference/fetch_exoplanet_archive.mjs
 * and packages/sim-core/test/fixtures/exoplanet_archive_ps.json).
 *
 * Unit conventions follow the Archive: R♃ = 71 492 km and R⊕ = 6 378.1 km (equatorial, IAU 2015
 * nominal), M♃/M⊕ from GM values (IAU 2015 nominal: GM♃ = 1.2668653e17, GM⊕ = 3.986004e14 m³/s²).
 */

export const R_JUP_EQ_KM = 71_492;
export const R_EARTH_EQ_KM = 6_378.1;
/** Nominal Jupiter mass in Earth masses (IAU 2015 B3 GM ratio). */
export const MJUP_IN_MEARTH = 1.2668653e17 / 3.986004e14;

export interface PublishedValues {
  K?: number;          // m/s
  T14h?: number;       // hours
  depthPct?: number;   // %, as published (definition depends on the paper)
  b?: number;
  aR?: number;
  k?: number;
}

export interface ExoPreset {
  id: string;
  name: { vi: string; en: string };
  /** Bibliographic reference of the single solution used. */
  solution: string;
  solutionUrl?: string;
  /** Archive default parameter set? */
  archiveDefault?: boolean;
  // model inputs
  mStar: number;      // M☉
  rStar: number;      // R☉
  teff: number;       // K
  mPlanet: number;    // M⊕ (true mass, or M sin i when noted)
  rPlanet: number;    // R⊕
  P: number;          // days
  e: number;
  omegaDeg: number;
  incDeg: number;
  /** Notes on any input that is NOT from the cited solution. */
  assumed?: { vi: string; en: string };
  published: PublishedValues;
}

const rpFromK = (k: number, rStar: number) => (k * rStar * 695_700) / R_EARTH_EQ_KM;

export const EXO_PRESETS: ExoPreset[] = [
  {
    id: 'hd209458',
    name: { vi: 'HD 209458 b - quá cảnh đầu tiên', en: 'HD 209458 b - first transit' },
    solution: 'Torres, Winn & Holman 2008, ApJ 677, 1324',
    solutionUrl: 'https://ui.adsabs.harvard.edu/abs/2008ApJ...677.1324T/abstract',
    mStar: 1.119, rStar: 1.155, teff: 6065,
    mPlanet: 0.685 * MJUP_IN_MEARTH, rPlanet: rpFromK(0.12086, 1.155),
    P: 3.524746, e: 0, omegaDeg: 90, incDeg: 86.71,
    assumed: { vi: 'e = 0 (nghiệm Torres 2008 giả định quỹ đạo tròn).', en: 'e = 0 (the Torres 2008 solution assumes a circular orbit).' },
    published: { K: 84.67, depthPct: 1.55, b: 0.507, aR: 8.76, k: 0.12086 },
  },
  {
    id: 'hd189733',
    name: { vi: 'HD 189733 b - Sao Mộc nóng gần', en: 'HD 189733 b - nearby hot Jupiter' },
    solution: 'Addison et al. 2019, PASP 131, 115003',
    solutionUrl: 'https://ui.adsabs.harvard.edu/abs/2019PASP..131k5003A/abstract',
    mStar: 0.812, rStar: 0.765, teff: 5050,
    mPlanet: 1.166 * MJUP_IN_MEARTH, rPlanet: rpFromK(0.1504, 0.765),
    P: 2.218577, e: 0, omegaDeg: 90, incDeg: 85.69,
    assumed: { vi: 'e = 0 (không công bố trong nghiệm này).', en: 'e = 0 (not given in this solution).' },
    published: { K: 208, T14h: 1.8408, depthPct: 2.26, b: 0.656, aR: 8.73, k: 0.1504 },
  },
  {
    id: 'trappist1e',
    name: { vi: 'TRAPPIST-1 e - cỡ Trái Đất', en: 'TRAPPIST-1 e - Earth-sized' },
    solution: 'Agol et al. 2021, PSJ 2, 1 (Archive default)',
    solutionUrl: 'https://ui.adsabs.harvard.edu/abs/2021PSJ.....2....1A/abstract',
    archiveDefault: true,
    mStar: 0.0898, rStar: 0.1192, teff: 2566,
    mPlanet: 0.692, rPlanet: rpFromK(0.07079, 0.1192),
    P: 6.101013, e: 0, omegaDeg: 90, incDeg: 89.793,
    assumed: { vi: 'e = 0 (Agol 2021 cho e ≲ 0,01; giá trị cụ thể không có trong bảng).', en: 'e = 0 (Agol 2021 finds e ≲ 0.01; no value in the table).' },
    published: { T14h: 0.9293, depthPct: 0.5012, b: 0.191, aR: 52.855, k: 0.07079 },
  },
  {
    id: 'peg51',
    name: { vi: '51 Pegasi b - phát hiện bằng RV (1995)', en: '51 Pegasi b - RV discovery (1995)' },
    solution: 'Cont et al. 2026, A&A 710, A345 (Archive default)',
    solutionUrl: 'https://ui.adsabs.harvard.edu/abs/2026A&A...710A.345C/abstract',
    archiveDefault: true,
    mStar: 1.07, rStar: 1.19, teff: 5761,
    mPlanet: 0.61 * MJUP_IN_MEARTH, rPlanet: 1.2 * (R_JUP_EQ_KM / R_EARTH_EQ_KM),
    P: 4.2307966, e: 0.0063, omegaDeg: 90, incDeg: 49.8,
    assumed: { vi: 'Bán kính không được công bố (hành tinh không quá cảnh): giả định 1,2 R♃ chỉ để vẽ. ω không công bố: đặt 90°.', en: 'Radius not published (non-transiting): 1.2 R♃ assumed for drawing only. ω not published: set to 90°.' },
    published: { K: 55.77 },
  },
  {
    id: 'jupiter',
    name: { vi: 'Sao Mộc quanh Mặt Trời', en: 'Jupiter around the Sun' },
    solution: 'NASA Planetary Fact Sheet (Jupiter); IAU 2015 nominal solar values. K ≈ 12.5 m/s: textbook order-of-magnitude check',
    mStar: 1, rStar: 1, teff: 5772,
    mPlanet: MJUP_IN_MEARTH, rPlanet: R_JUP_EQ_KM / R_EARTH_EQ_KM,
    P: 4332.589, e: 0.0489, omegaDeg: 90, incDeg: 90,
    assumed: { vi: 'Nhìn ngang mặt phẳng quỹ đạo (i = 90°), ω = 90° - cấu hình giả định để so sánh.', en: 'Edge-on view (i = 90°), ω = 90° - assumed geometry for comparison.' },
    published: { K: 12.5 },
  },
  {
    id: 'earth',
    name: { vi: 'Trái Đất quanh Mặt Trời', en: 'Earth around the Sun' },
    solution: 'NASA Planetary Fact Sheet (Earth); IAU 2015 nominal solar values. K ≈ 0.09 m/s: textbook order-of-magnitude check',
    mStar: 1, rStar: 1, teff: 5772,
    mPlanet: 1, rPlanet: 1,
    P: 365.256, e: 0.0167, omegaDeg: 90, incDeg: 90,
    assumed: { vi: 'Nhìn ngang mặt phẳng quỹ đạo (i = 90°), ω = 90° - cấu hình giả định để so sánh.', en: 'Edge-on view (i = 90°), ω = 90° - assumed geometry for comparison.' },
    published: { K: 0.09 },
  },
];
