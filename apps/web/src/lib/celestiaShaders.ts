/**
 * GLSL for the 3D solar system, adapted from the rendering model of Celestia (src/celengine/shadermanager.cpp and
 * shaders/*.glsl, Celestia 1.7.0) and written for three.js / WebGL2:
 *
 *  - lunar-Lambert diffuse model with McEwen's (1996) limb-darkening law, as in Celestia's `LunarLambert()`;
 *  - soft terminator for bodies with an atmosphere (Celestia's "cloud lighting" twilight term);
 *  - night-side texture, blended where Celestia fades the day texture;
 *  - eclipse shadows: the fraction of the Sun's disc hidden by each occluding sphere (the exact circle-overlap area;
 *    Celestia uses a linear fall-off between umbra and penumbra), evaluated in real kilometres so that shadows fall
 *    where they really do even when the picture is drawn at an exaggerated scale;
 *  - ring shadows on the planet and the planet's shadow on the rings;
 *  - single-scattering atmosphere (Rayleigh + Mie phase functions as in Celestia) integrated along the view ray;
 *  - point-spread-function star glows (Celestia's psfstarglow shaders).
 *
 * Illumination is the same for every body (no 1/r² fall-off), like Celestia's automatic exposure; sizes and
 * distances of the atmosphere shells are exaggerated for visibility. Visual only (fidelity C).
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. Adapted from Celestia (Copyright (C) 2001-2026, the Celestia Development
 * Team): lighting model, shadows and star rendering. Modified for USAC SimLab; see NOTICE.md.
 */

export const MAX_OCCLUDERS = 4;

const COMMON = /* glsl */ `
const float PI = 3.14159265358979;

float hash13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int k = 0; k < 5; k++) { s += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }

// fraction of the Sun's disc (angular radius rs) hidden by a disc of angular radius ro whose centre is d away
float overlapFraction(float rs, float ro, float d){
  if (d >= rs + ro) return 0.0;
  if (d <= abs(ro - rs)) return ro >= rs ? 1.0 : (ro * ro) / (rs * rs);
  float a = rs * rs * acos(clamp((d * d + rs * rs - ro * ro) / (2.0 * d * rs), -1.0, 1.0))
          + ro * ro * acos(clamp((d * d + ro * ro - rs * rs) / (2.0 * d * ro), -1.0, 1.0))
          - 0.5 * sqrt(max((-d + rs + ro) * (d + rs - ro) * (d - rs + ro) * (d + rs + ro), 0.0));
  return clamp(a / (PI * rs * rs), 0.0, 1.0);
}
`;

/** Planet, moon (and Sun-less) surfaces. */
export const BODY_VERTEX = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec2 vUv;
varying vec3 vLocal;
void main(){
  vUv = uv;
  vLocal = normalize(position);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const BODY_FRAGMENT = /* glsl */ `
${COMMON}
uniform sampler2D map;
uniform sampler2D nightMap;
uniform sampler2D ringTex;
uniform bool uHasMap;
uniform bool uHasNight;
uniform bool uHasRing;
uniform vec3 uBaseColor;
uniform float uNoise;
uniform vec3 uSunDir;       // unit vector towards the Sun, scene axes
uniform float uSunDist;     // km
uniform float uSunRadius;   // km
uniform float uRadiusKm;
uniform vec3 uCenterW;
uniform float uKmPerUnit;   // real km per scene unit for this body
uniform float uLunar;       // 0 = Lambert … 1 = lunar-Lambert (Moon-like)
uniform float uTwilight;    // terminator softening for atmospheres
uniform float uAmbient;
uniform float uNightGain;
uniform int uOccN;
uniform vec3 uOccPos[${MAX_OCCLUDERS}];   // km relative to this body's centre
uniform float uOccRad[${MAX_OCCLUDERS}];
uniform vec3 uRingN; uniform float uRingIn; uniform float uRingOut;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec2 vUv;
varying vec3 vLocal;

float eclipse(vec3 p){
  vec3 toSun = uSunDir * uSunDist - p;
  float ds = length(toSun);
  float as = asin(min(uSunRadius / ds, 1.0));
  float vis = 1.0;
  for (int i = 0; i < ${MAX_OCCLUDERS}; i++) {
    if (i >= uOccN) break;
    vec3 toO = uOccPos[i] - p;
    float dO = length(toO);
    if (dO <= uOccRad[i]) { vis = 0.0; continue; }
    if (dO >= ds) continue;
    float ao = asin(min(uOccRad[i] / dO, 1.0));
    float d = acos(clamp(dot(toSun / ds, toO / dO), -1.0, 1.0));
    vis *= 1.0 - overlapFraction(as, ao, d);
  }
  return vis;
}

float ringShadow(vec3 p){
  if (!uHasRing) return 1.0;
  float dl = dot(uSunDir, uRingN);
  if (abs(dl) < 1e-4) return 1.0;
  float s = -dot(p, uRingN) / dl;
  if (s <= 0.0) return 1.0;
  float r = length(p + uSunDir * s);
  if (r < uRingIn || r > uRingOut) return 1.0;
  float a = texture2D(ringTex, vec2((r - uRingIn) / (uRingOut - uRingIn), 0.5)).a;
  return 1.0 - 0.92 * a;
}

void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uSunDir);
  #ifdef CLOUDS
    vec3 albedo = vec3(1.0);
  #else
    vec3 albedo = uHasMap ? texture2D(map, vUv).rgb : uBaseColor;
  #endif
  if (uNoise > 0.0) {
    float n = fbm(vLocal * 7.0) * 0.65 + fbm(vLocal * 26.0) * 0.35;
    albedo *= 1.0 + uNoise * (n - 0.5) * 2.0;
  }

  float nlRaw = dot(N, L);
  float NL = max(0.0, (nlRaw + uTwilight) / (1.0 + uTwilight));
  float NV = max(dot(N, V), 0.0);
  // Celestia's lunar-Lambert: weight the Lommel-Seeliger term by McEwen's phase-angle law
  float alpha = degrees(acos(clamp(dot(V, L), -1.0, 1.0)));
  float limb = 1.0 + alpha * (-0.019 + alpha * (0.242e-3 - alpha * 1.46e-6));
  float w = uLunar * max(limb, 0.0);
  float diffuse = mix(NL, 2.0 * NL / (max(NV, 0.001) + NL), w);

  vec3 p = N * uRadiusKm;
  float shadow = eclipse(p) * ringShadow(p);
  vec3 col = albedo * (diffuse * shadow + uAmbient);

  if (uHasNight) {
    float dark = 1.0 - smoothstep(-0.02, 0.12, nlRaw);
    col += texture2D(nightMap, vUv).rgb * dark * uNightGain * (0.4 + 0.6 * shadow);
  }
  #ifdef CLOUDS
    // cloud shell: white, lit with the same model, opacity from the cloud map
    float cover = texture2D(map, vUv).r;
    vec3 cloudCol = vec3(1.0) * (diffuse * shadow + uAmbient * 0.6);
    gl_FragColor = vec4(cloudCol, cover * 0.88);
  #else
    gl_FragColor = vec4(col, 1.0);
  #endif
  #include <colorspace_fragment>
}`;

/** Planetary rings: lit/transmitted light, shadow of the planet. */
export const RING_FRAGMENT = /* glsl */ `
${COMMON}
uniform sampler2D ringTex;
uniform vec3 uSunDir;
uniform vec3 uRingN;
uniform vec3 uCenterW;
uniform float uKmPerUnit;
uniform float uRadiusKm;     // planet radius, km
uniform float uRingIn; uniform float uRingOut;
varying vec3 vPosW;
void main(){
  vec3 p = (vPosW - uCenterW) * uKmPerUnit;
  float r = length(p);
  vec4 t = texture2D(ringTex, vec2(clamp((r - uRingIn) / (uRingOut - uRingIn), 0.0, 1.0), 0.5));
  vec3 V = normalize(cameraPosition - vPosW);
  float sunSide = dot(uRingN, uSunDir);
  float viewSide = dot(uRingN, V);
  // lit face: reflected light; unlit face seen from the other side: dim transmitted light
  float light = sunSide * viewSide > 0.0 ? 0.95 : 0.3;
  // planet's shadow: does the ray to the Sun pass through the planet?
  float tc = dot(-p, uSunDir);
  float shadow = 1.0;
  if (tc > 0.0) { float d = length(p + uSunDir * tc); shadow = smoothstep(uRadiusKm * 0.985, uRadiusKm * 1.01, d); }
  vec3 col = t.rgb * light * (0.12 + 0.88 * shadow);
  gl_FragColor = vec4(col, t.a * (sunSide * viewSide > 0.0 ? 1.0 : 0.85));
  #include <colorspace_fragment>
}`;

/** Atmosphere shell: single scattering integrated along the view ray (Rayleigh + Mie). */
export const ATMOSPHERE_VERTEX = /* glsl */ `
varying vec3 vPosW;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vPosW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;

export const ATMOSPHERE_FRAGMENT = /* glsl */ `
${COMMON}
uniform vec3 uSunDir;
uniform vec3 uCenterW;
uniform float uRp;          // planet radius (scene units)
uniform float uRa;          // outer radius of the shell (scene units)
uniform float uScaleH;      // scale height, in planet radii
uniform vec3 uBeta;         // Rayleigh extinction per planet radius, RGB
uniform float uMie;         // Mie extinction per planet radius
uniform float uMieG;
uniform float uGain;
varying vec3 vPosW;

// nearest/farthest intersection of a ray with a sphere at the origin; x = near, y = far, y < 0 means a miss
vec2 sphere(vec3 ro, vec3 rd, float r){
  float b = dot(ro, rd), c = dot(ro, ro) - r * r, h = b * b - c;
  if (h < 0.0) return vec2(-1.0, -1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}
float density(vec3 p){ return exp(-max(length(p) - 1.0, 0.0) / uScaleH); }

void main(){
  float k = 1.0 / uRp;                         // work in planet radii
  vec3 ro = (cameraPosition - uCenterW) * k;
  vec3 rd = normalize(vPosW - cameraPosition);
  float Ra = uRa * k;
  vec2 ta = sphere(ro, rd, Ra);
  if (ta.y < 0.0) discard;
  float t0 = max(ta.x, 0.0), t1 = ta.y;
  vec2 tp = sphere(ro, rd, 1.0);
  if (tp.x > 0.0) t1 = min(t1, tp.x);
  if (t1 <= t0) discard;

  const int N = 14, M = 5;
  float ds = (t1 - t0) / float(N);
  vec3 L = normalize(uSunDir);
  float mu = dot(rd, L);
  float phR = 0.75 * (1.0 + mu * mu);
  float g = uMieG;
  float phM = (1.0 - g * g) / (4.0 * PI * pow(1.0 + g * g - 2.0 * g * mu, 1.5)) * 4.0 * PI * 0.25;
  vec3 sum = vec3(0.0);
  float odV = 0.0;
  for (int i = 0; i < N; i++) {
    vec3 P = ro + rd * (t0 + (float(i) + 0.5) * ds);
    float d = density(P);
    odV += d * ds;
    // optical depth towards the Sun; the planet shadows it
    vec2 ts = sphere(P, L, 1.0);
    float vis = ts.x > 0.0 ? 0.0 : 1.0;
    float odS = 0.0;
    vec2 tsa = sphere(P, L, Ra);
    float sl = max(tsa.y, 0.0) / float(M);
    for (int j = 0; j < M; j++) odS += density(P + L * (float(j) + 0.5) * sl) * sl;
    vec3 trans = exp(-(uBeta + uMie) * (odV + odS));
    sum += d * ds * trans * vis * (uBeta * phR + vec3(uMie) * phM);
  }
  vec3 col = sum * uGain;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

/** Star glows (point-spread function): a bright core and a faint halo, colour from B−V. */
export const STAR_VERTEX = /* glsl */ `
attribute float aMag;
attribute vec3 aColor;
uniform float uPx;
uniform float uScale;
varying vec3 vCol;
varying float vI;
void main(){
  vCol = aColor;
  vI = pow(10.0, -0.4 * (aMag - 1.0));                 // flux relative to a magnitude-1 star
  gl_PointSize = clamp((2.6 + 5.2 * log(1.0 + vI * 2.2)) * uScale, 2.0, 30.0) * uPx;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const STAR_FRAGMENT = /* glsl */ `
varying vec3 vCol;
varying float vI;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c) * 4.0;                          // 0 at the centre, 1 at the sprite edge
  if (r2 > 1.0) discard;
  float core = exp(-r2 * 26.0);
  float halo = 0.22 / (1.0 + r2 * 40.0) * (1.0 - r2);
  float a = core + halo * min(vI, 1.6);
  gl_FragColor = vec4(vCol * a, a);
}`;

/** Orbit line whose brightness fades away behind the body, like Celestia's orbit trails. */
export const ORBIT_VERTEX = /* glsl */ `
attribute float aPhase;
uniform float uHead;
uniform float uFade;
varying float vA;
void main(){
  float behind = fract(uHead - aPhase);                // 0 at the body, → 1 just ahead of it
  vA = pow(1.0 - behind, uFade);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const ORBIT_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
varying float vA;
void main(){ gl_FragColor = vec4(uColor, uAlpha * (0.12 + 0.88 * vA)); }`;

/** Per-planet appearance (visual only). Atmosphere: scale height in planet radii, RGB Rayleigh and Mie extinction. */
export interface AtmosphereLook { shell: number; scaleH: number; beta: [number, number, number]; mie: number; mieG: number; gain: number }
