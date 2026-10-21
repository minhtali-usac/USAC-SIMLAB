/**
 * @usac/sim-core - pure, framework-free physics for USAC SimLab.
 * Rules: float64 only, SI or geometric units stated per function, every formula cited,
 * no React/Three imports. See docs/AGENTS.md.
 */
export * from './units/constants';
export * from './units/convert';
export * from './math/vec';
export * from './math/roots';
export * from './math/ode';
export * from './math/quadrature';
export * from './time/julian';
export * from './celestial/coords';
export * from './celestial/sun';
export * from './celestial/moon';
export * from './celestial/lunarPhases';
export * from './celestial/planets';
export * from './celestial/lightTime';
export * from './data/brightStars';
export * from './orbits/kepler';
export * from './orbits/twoBody';
export * from './orbits/transfer';
export * from './orbits/lambert';
export * from './orbits/launchWindows';
export * from './orbits/cr3bp';
export * from './orbits/nbody';
export * from './relativity-sr/lorentz';
export * from './relativity-gr/schwarzschild';
export * from './relativity-gr/lensing';
export * from './relativity-gr/gps';
export * from './cosmology/friedmann';
export * from './stellar/blackbody';
export * from './stellar/habitable';
export * from './exoplanets/detection';
export * from './exoplanets/keplerTransit';
export * from './photometry/periodogram';
export * from './photometry/gls';
export * from './validation/moonValidation';
export * from './data/exoplanetPresets';
export * from './validation/exoValidation';
export * from './photometry/synthetic';
export * from './data/variableStars';
export * from './validation/variableValidation';
export * from './data/hzSystems';
export * from './validation/hzValidation';
export * from './validation/shadowValidation';
export * from './validation/ephemValidation';
export * from './data/keplerPresets';
export * from './validation/keplerValidation';
export * from './validation/transferValidation';
export * from './validation/cr3bpValidation';
export * from './cosmology/lss';
export * from './cosmology/cosmicWeb';
export * from './cosmology/snInference';
export * from './data/union21';
export * from './data/cosmicLandmarks';
export * from './waves/em';
export * from './waves/sound';
