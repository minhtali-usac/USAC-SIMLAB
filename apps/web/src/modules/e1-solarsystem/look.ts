/**
 * Names and appearance of the bodies in E1. Appearance is visual only (fidelity C): albedo colours of the moons
 * without a photographic map are rough mean colours, lighting weights follow Celestia's convention
 * (lunarLambert: 1 = Moon-like, 0 = Lambert).
 */
import type { PlanetId, SatelliteId } from '@usac/sim-core';
import type { AtmosphereLook } from '../../lib/celestiaShaders';

export type BodyId = 'sun' | PlanetId | SatelliteId;

export const NAMES: Record<BodyId, { vi: string; en: string }> = {
  sun: { vi: 'Mặt Trời', en: 'Sun' },
  mercury: { vi: 'Sao Thuỷ', en: 'Mercury' }, venus: { vi: 'Sao Kim', en: 'Venus' }, earth: { vi: 'Trái Đất', en: 'Earth' }, mars: { vi: 'Sao Hoả', en: 'Mars' },
  jupiter: { vi: 'Sao Mộc', en: 'Jupiter' }, saturn: { vi: 'Sao Thổ', en: 'Saturn' }, uranus: { vi: 'Sao Thiên Vương', en: 'Uranus' }, neptune: { vi: 'Sao Hải Vương', en: 'Neptune' },
  moon: { vi: 'Mặt Trăng', en: 'Moon' },
  io: { vi: 'Io', en: 'Io' }, europa: { vi: 'Europa', en: 'Europa' }, ganymede: { vi: 'Ganymede', en: 'Ganymede' }, callisto: { vi: 'Callisto', en: 'Callisto' },
  mimas: { vi: 'Mimas', en: 'Mimas' }, enceladus: { vi: 'Enceladus', en: 'Enceladus' }, tethys: { vi: 'Tethys', en: 'Tethys' }, dione: { vi: 'Dione', en: 'Dione' },
  rhea: { vi: 'Rhea', en: 'Rhea' }, titan: { vi: 'Titan', en: 'Titan' }, iapetus: { vi: 'Iapetus', en: 'Iapetus' },
  ariel: { vi: 'Ariel', en: 'Ariel' }, umbriel: { vi: 'Umbriel', en: 'Umbriel' }, titania: { vi: 'Titania', en: 'Titania' }, oberon: { vi: 'Oberon', en: 'Oberon' },
  triton: { vi: 'Triton', en: 'Triton' },
};

export interface SurfaceLook {
  /** Photographic map in public/tex, if any. */
  map?: string;
  nightMap?: string;
  /** sRGB hex colour when there is no map. */
  color: string;
  /** Strength of the procedural albedo variation for bodies without a map. */
  noise: number;
  /** Celestia's lunar-Lambert weight. */
  lunar: number;
  /** Terminator softening (atmospheres). */
  twilight: number;
  atmosphere?: AtmosphereLook;
  clouds?: string;
}

const A = (shell: number, scaleH: number, beta: [number, number, number], mie: number, mieG: number, gain: number): AtmosphereLook => ({ shell, scaleH, beta, mie, mieG, gain });

export const LOOK: Record<Exclude<BodyId, 'sun'>, SurfaceLook> = {
  mercury: { map: 'mercury.jpg', color: '#9a9590', noise: 0, lunar: 1, twilight: 0 },
  venus: { map: 'venus_atmosphere.jpg', color: '#e8c98a', noise: 0, lunar: 0, twilight: 0.28, atmosphere: A(0.045, 0.012, [6, 8, 14], 4, 0.7, 1.3) },
  earth: { map: 'earth_daymap.jpg', nightMap: 'earth_nightmap.jpg', clouds: 'earth_clouds.jpg', color: '#5aa2ff', noise: 0, lunar: 0, twilight: 0.07, atmosphere: A(0.05, 0.011, [5.2, 12.5, 31], 0.9, 0.76, 2.4) },
  mars: { map: 'mars.jpg', color: '#e2704a', noise: 0, lunar: 0.45, twilight: 0.03, atmosphere: A(0.022, 0.012, [9, 6, 3.4], 1.2, 0.7, 0.8) },
  jupiter: { map: 'jupiter.jpg', color: '#d9b38c', noise: 0, lunar: 0, twilight: 0.05, atmosphere: A(0.03, 0.011, [4, 5, 8], 0.8, 0.7, 0.55) },
  saturn: { map: 'saturn.jpg', color: '#e9d39b', noise: 0, lunar: 0, twilight: 0.05, atmosphere: A(0.03, 0.011, [5, 6, 8], 0.8, 0.7, 0.5) },
  uranus: { map: 'uranus.jpg', color: '#9fe3e6', noise: 0, lunar: 0, twilight: 0.08, atmosphere: A(0.035, 0.012, [3, 9, 14], 0.6, 0.7, 0.9) },
  neptune: { map: 'neptune.jpg', color: '#5b7fff', noise: 0, lunar: 0, twilight: 0.08, atmosphere: A(0.035, 0.012, [3, 7, 18], 0.6, 0.7, 0.9) },

  moon: { map: 'moon.jpg', color: '#aaa6a0', noise: 0, lunar: 1, twilight: 0 },
  io: { color: '#d9c56b', noise: 0.32, lunar: 0.85, twilight: 0 },
  europa: { color: '#d8d0c4', noise: 0.14, lunar: 0.9, twilight: 0 },
  ganymede: { color: '#a59c92', noise: 0.34, lunar: 0.95, twilight: 0 },
  callisto: { color: '#6e6358', noise: 0.38, lunar: 1, twilight: 0 },
  mimas: { color: '#b9b9b9', noise: 0.3, lunar: 1, twilight: 0 },
  enceladus: { color: '#f1f3f5', noise: 0.08, lunar: 0.8, twilight: 0 },
  tethys: { color: '#dadada', noise: 0.15, lunar: 0.9, twilight: 0 },
  dione: { color: '#d0d0d0', noise: 0.2, lunar: 0.95, twilight: 0 },
  rhea: { color: '#c5c1bd', noise: 0.25, lunar: 1, twilight: 0 },
  titan: { color: '#d99a4b', noise: 0.04, lunar: 0, twilight: 0.2, atmosphere: A(0.06, 0.02, [16, 9, 3.2], 3, 0.8, 1.2) },
  iapetus: { color: '#8c8072', noise: 0.5, lunar: 1, twilight: 0 },
  ariel: { color: '#b6b3ae', noise: 0.25, lunar: 1, twilight: 0 },
  umbriel: { color: '#7b7875', noise: 0.25, lunar: 1, twilight: 0 },
  titania: { color: '#a9a39c', noise: 0.25, lunar: 1, twilight: 0 },
  oberon: { color: '#8d827a', noise: 0.3, lunar: 1, twilight: 0 },
  triton: { color: '#d8cac1', noise: 0.18, lunar: 0.9, twilight: 0.02 },
};

/** Saturn's ring texture spans 1.24–2.27 Saturn radii (as in the previous E1; mean radius 58,232 km). Visual only. */
export const SATURN_RINGS = { inner: 1.24, outer: 2.27 };

/** Orbit colours of the planets (from sim-core PLANETS) and of moon orbits. */
export const MOON_ORBIT_COLOR = '#8fb8ff';
