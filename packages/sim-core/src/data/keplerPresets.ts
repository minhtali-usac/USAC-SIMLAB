/**
 * B1 presets: periapsis q [au], eccentricity e, mass ratio m/M (orbiting body / central star) and a reference period.
 *  - Planets: Standish (JPL) Table 1 mean elements at J2000 (a, e → q = a(1 − e)); masses from NASA Planetary
 *    Fact Sheet (Earth: Earth + Moon, GM_EARTH + GM_MOON, since the element set is for the Earth–Moon barycentre).
 *    Reference period = 360°/(mean-longitude rate) from the same element set.
 *  - Small bodies: JPL Small-Body Database API (full precision, queried 2026-10-20), osculating elements at the
 *    listed epoch; reference period = SBDB `per` where defined.
 *  - "ideal1au": idealised circular orbit, a = 1 au, m = 0 - NOT Earth's real orbit.
 */
import { planetElements, planetPeriodDays, PLANETS, type PlanetId } from '../celestial/planets';
import { JD_J2000, G, GM_SUN, GM_EARTH, GM_MOON } from '../units/constants';

export interface KeplerPreset {
  id: string;
  name: { vi: string; en: string };
  q: number; e: number;
  /** m/M with M = 1 M☉. */
  massRatio: number;
  /** Reference period [days] from the data source, when the orbit is closed. */
  refPeriodDays?: number;
  refPeriodSource?: string;
  source: string;
}

const PLANET_NAMES: Record<PlanetId, [string, string]> = {
  mercury: ['Sao Thuỷ', 'Mercury'], venus: ['Sao Kim', 'Venus'], earth: ['Trái Đất (khối tâm Trái Đất–Mặt Trăng)', 'Earth (Earth–Moon barycentre)'], mars: ['Sao Hoả', 'Mars'],
  jupiter: ['Sao Mộc', 'Jupiter'], saturn: ['Sao Thổ', 'Saturn'], uranus: ['Sao Thiên Vương', 'Uranus'], neptune: ['Sao Hải Vương', 'Neptune'],
};

const planets: KeplerPreset[] = PLANETS.map((p) => {
  const el = planetElements(p.id, JD_J2000);
  const massRatio = p.id === 'earth' ? (GM_EARTH + GM_MOON) / GM_SUN : (G * p.massKg) / GM_SUN;
  return {
    id: p.id, name: { vi: PLANET_NAMES[p.id][0], en: PLANET_NAMES[p.id][1] },
    q: el.a * (1 - el.e), e: el.e, massRatio,
    refPeriodDays: p.id === 'earth' ? 365.256 : planetPeriodDays(p.id),
    refPeriodSource: p.id === 'earth' ? 'NASA Earth Fact Sheet (sidereal orbit period 365.256 d)' : 'JPL Standish Table 1 mean-longitude rate',
    source: 'JPL Standish Table 1 (J2000 mean elements); NASA Planetary Fact Sheet (mass)',
  };
});

export const KEPLER_PRESETS: KeplerPreset[] = [
  ...planets,
  {
    id: 'ideal1au', name: { vi: 'Quỹ đạo tròn lý tưởng a = 1 au (không phải Trái Đất thật)', en: 'Idealised circle a = 1 au (not the real Earth)' },
    q: 1, e: 0, massRatio: 0, source: 'Idealised configuration',
  },
  {
    id: 'ceres', name: { vi: 'Ceres (hành tinh lùn)', en: 'Ceres (dwarf planet)' }, q: 2.545159361382861, e: 0.07969229514816586,
    massRatio: 62.6284e9 / GM_SUN, refPeriodDays: 1679.853119758983, refPeriodSource: 'JPL SBDB (osculating, epoch JD 2461200.5)',
    source: 'JPL SBDB, epoch JD 2461200.5; GM = 62.6284 km³/s²',
  },
  {
    id: 'halley', name: { vi: 'Sao chổi 1P/Halley', en: 'Comet 1P/Halley' }, q: 0.5748638313743413, e: 0.9679359956953211,
    massRatio: 0, refPeriodDays: 27728.04608790421, refPeriodSource: 'JPL SBDB (osculating, epoch JD 2439875.5 = 1968)',
    source: 'JPL SBDB, epoch JD 2439875.5',
  },
  {
    id: 'oumuamua', name: { vi: '1I/ʻOumuamua (liên sao)', en: '1I/ʻOumuamua (interstellar)' }, q: 0.2559115812959116, e: 1.201133796102373,
    massRatio: 0, source: 'JPL SBDB, epoch JD 2458080.5',
  },
  {
    id: 'borisov', name: { vi: '2I/Borisov (liên sao)', en: '2I/Borisov (interstellar)' }, q: 2.006520878500843, e: 3.356475782676596,
    massRatio: 0, source: 'JPL SBDB, epoch JD 2458853.5',
  },
];
