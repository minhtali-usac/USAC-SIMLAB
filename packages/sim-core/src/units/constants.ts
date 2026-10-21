/**
 * Physical and astronomical constants, SI units unless stated otherwise.
 * Every value carries its source. Do not add a constant without a source.
 */

// ── Fundamental ─────────────────────────────────────────────────────────────
/** Speed of light in vacuum [m/s]. Exact (SI 2019). */
export const C = 299_792_458;
/** Newtonian constant of gravitation [m^3 kg^-1 s^-2]. CODATA 2018. */
export const G = 6.674_30e-11;
/** Stefan–Boltzmann constant [W m^-2 K^-4]. Exact (CODATA 2018). */
export const SIGMA_SB = 5.670_374_419e-8;
/** Planck constant [J s]. Exact (SI 2019). */
export const H_PLANCK = 6.626_070_15e-34;
/** Boltzmann constant [J/K]. Exact (SI 2019). */
export const K_B = 1.380_649e-23;
/** Standard gravity [m/s^2]. Exact (CGPM 1901). */
export const G0 = 9.806_65;

// ── Time ────────────────────────────────────────────────────────────────────
export const SECONDS_PER_DAY = 86_400;
/** Julian year [days]. IAU definition. */
export const JULIAN_YEAR_DAYS = 365.25;
export const JULIAN_YEAR = JULIAN_YEAR_DAYS * SECONDS_PER_DAY;
export const JULIAN_CENTURY_DAYS = 36_525;
/** Julian Date of the J2000.0 epoch (2000-01-01 12:00 TT). */
export const JD_J2000 = 2_451_545.0;
/** Sidereal year [days]. Astronomical Almanac (J2000). */
export const SIDEREAL_YEAR_DAYS = 365.256_363_004;
/** Mean synodic month [days]. Meeus, Astronomical Algorithms 2nd ed., ch. 49. */
export const SYNODIC_MONTH_DAYS = 29.530_588_861;
/** Mean sidereal month [days]. Astronomical Almanac. */
export const SIDEREAL_MONTH_DAYS = 27.321_661;

// ── Distance ────────────────────────────────────────────────────────────────
/** Astronomical unit [m]. Exact (IAU 2012 Resolution B2). */
export const AU = 149_597_870_700;
/** Parsec [m]. IAU 2015 Resolution B2: 648000/π au. */
export const PARSEC = (648_000 / Math.PI) * AU;
/** Light-year [m] (Julian year). */
export const LIGHT_YEAR = C * JULIAN_YEAR;
/** Megaparsec [km] - convenient for cosmology. */
export const MPC_KM = PARSEC / 1e3 * 1e6;

// ── Sun ─────────────────────────────────────────────────────────────────────
/** Heliocentric gravitational constant [m^3/s^2]. JPL DE430 (Folkner et al. 2014). */
export const GM_SUN = 1.327_124_400_419_39e20;
/** Solar mass [kg] derived as GM_SUN / G. */
export const M_SUN = GM_SUN / G;
/** Nominal solar radius [m]. IAU 2015 Resolution B3. */
export const R_SUN = 6.957e8;
/** Nominal solar luminosity [W]. IAU 2015 Resolution B3. */
export const L_SUN = 3.828e26;
/** Nominal solar effective temperature [K]. IAU 2015 Resolution B3. */
export const T_SUN = 5772;

// ── Earth & Moon ────────────────────────────────────────────────────────────
/** Geocentric gravitational constant [m^3/s^2]. IERS Conventions 2010 / WGS84 (EGM). */
export const GM_EARTH = 3.986_004_418e14;
/** Lunar gravitational constant [m^3/s^2]. JPL DE430. */
export const GM_MOON = 4.902_800_066e12;
/** Nominal equatorial Earth radius [m]. IAU 2015 Resolution B3. */
export const R_EARTH = 6.3781e6;
/** Mean Earth radius [m]. NASA Earth Fact Sheet. */
export const R_EARTH_MEAN = 6.371e6;
/** Earth's sidereal rotation rate [rad/s]. IERS Conventions 2010. */
export const OMEGA_EARTH = 7.292_115e-5;
/** Earth's second zonal harmonic J2 (dimensionless). EGM2008 / IERS. */
export const J2_EARTH = 1.082_626_7e-3;
/** Mean Earth–Moon distance [m]. NASA Moon Fact Sheet (semi-major axis 384 400 km). */
export const EARTH_MOON_DISTANCE = 3.844e8;
/** Mean lunar radius [m]. NASA Moon Fact Sheet. */
export const R_MOON = 1.7374e6;
/** Mean obliquity of the ecliptic at J2000 [deg]. IAU 1980 (23°26′21.448″). */
export const OBLIQUITY_J2000_DEG = 23.439_291_11;

// ── Planets ─────────────────────────────────────────────────────────────────
/** Jupiter-system gravitational constant [m^3/s^2]. JPL DE430. */
export const GM_JUPITER = 1.267_127_648e17;

// ── Particle physics ────────────────────────────────────────────────────────
/** Muon mean lifetime at rest [s]. Particle Data Group (2022): 2.1969811 μs. */
export const MUON_LIFETIME = 2.196_981_1e-6;
/** Muon rest energy [MeV]. PDG 2022. */
export const MUON_MASS_MEV = 105.658_375_5;

// ── GPS (Ashby 2003, Living Rev. Relativity 6, 1) ───────────────────────────
/** Nominal GPS orbit semi-major axis [m]. Ashby (2003). */
export const GPS_SEMI_MAJOR_AXIS = 2.656_175e7;
