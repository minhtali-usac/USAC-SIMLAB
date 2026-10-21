/**
 * Schwarzschild null-geodesic ray tracer (GLSL ES 3.00). Units: G = c = M = 1.
 * Each pixel's ray lies in the plane spanned by the camera position and the ray direction;
 * in that plane we integrate the exact Binet equation for light, u'' = −u + 3u² (u = 1/r),
 * with RK4 in φ. Initial slope for a static observer at r0 seeing the ray at angle α from
 * the inward radial direction: u'(0) = u0 √(1 − 2u0) cot α.
 * Thin disk in the equatorial plane (y = 0), Keplerian emitters Ω = r^{-3/2},
 * redshift g = √(1 − 3/r) / [(1 − Ω L_z) √(1 − 2/r_obs)]; bolometric intensity ∝ g⁴ · F(r),
 * F(r) ∝ r⁻³ (1 − √(r_in/r)) (Novikov–Thorne/Shakura–Sunyaev Newtonian profile).
 * Rendering precision: float32 (display only - quantitative values come from the float64 core).
 */
export const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec3 uCamPos;
uniform mat3 uCamRot;
uniform float uTanHalfFov;
uniform float uRin;
uniform float uRout;
uniform float uTime;
uniform float uStep;
uniform int uMaxSteps;
uniform int uDisk;
uniform int uBg;        // 0 stars, 1 grid
uniform int uDoppler;   // 0 none, 1 Doppler + gravitational redshift
uniform float uExposure;
out vec4 frag;

const float PI = 3.141592653589793;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Approximate blackbody chromaticity (fit; visual only)
vec3 bbColor(float T) {
  T = clamp(T, 1000.0, 40000.0) / 100.0;
  vec3 c;
  c.r = T <= 66.0 ? 1.0 : clamp(1.292936 * pow(T - 60.0, -0.1332047), 0.0, 1.0);
  c.g = T <= 66.0 ? clamp(0.3900816 * log(T) - 0.6318414, 0.0, 1.0) : clamp(1.1298909 * pow(T - 60.0, -0.0755148), 0.0, 1.0);
  c.b = T >= 66.0 ? 1.0 : (T <= 19.0 ? 0.0 : clamp(0.5432068 * log(T - 10.0) - 1.1962541, 0.0, 1.0));
  return c;
}

vec3 background(vec3 d) {
  if (uBg == 1) {
    float th = acos(clamp(d.y, -1.0, 1.0));
    float ph = atan(d.z, d.x);
    float gx = abs(fract(ph / (2.0 * PI) * 24.0) - 0.5);
    float gy = abs(fract(th / PI * 12.0) - 0.5);
    float line = smoothstep(0.47, 0.5, max(gx, gy));
    vec3 base = mix(vec3(0.05, 0.07, 0.16), vec3(0.10, 0.06, 0.18), step(0.0, d.z));
    vec3 col = mix(base, vec3(0.35, 0.55, 1.0), line);
    if (d.x > 0.0 && d.y > 0.0) col += vec3(0.08, 0.03, 0.0);
    return col;
  }
  // procedural star field (decorative) + faint band
  vec3 col = vec3(0.004, 0.006, 0.014);
  float band = exp(-pow(dot(d, normalize(vec3(0.2, 0.9, 0.4))) / 0.18, 2.0));
  col += vec3(0.05, 0.045, 0.06) * band;
  for (int s = 0; s < 2; s++) {
    float scale = s == 0 ? 90.0 : 220.0;
    vec3 cell = floor(d * scale);
    float h = hash(cell + float(s) * 13.1);
    if (h > (s == 0 ? 0.992 : 0.978)) {
      vec3 center = (cell + 0.3 + 0.4 * vec3(hash(cell + 1.7), hash(cell + 2.3), hash(cell + 5.1))) / scale;
      float dist = length(d - normalize(center)) * scale;
      float b = exp(-dist * dist * 40.0) * (s == 0 ? 2.4 : 0.9) * (0.3 + h);
      col += b * bbColor(3000.0 + 9000.0 * hash(cell + 9.9));
    }
  }
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 dir = normalize(uCamRot * vec3(uv * 2.0 * uTanHalfFov, -1.0));
  float r0 = length(uCamPos);
  vec3 e1 = uCamPos / r0;
  float cosA = -dot(dir, e1);
  vec3 tang = dir + cosA * e1;
  float sinA = length(tang);
  vec3 e2 = sinA > 1e-6 ? tang / sinA : normalize(cross(e1, abs(e1.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  sinA = max(sinA, 1e-6);

  float u = 1.0 / r0;
  float du = u * sqrt(1.0 - 2.0 * u) * cosA / sinA;
  // impact parameter b = r0 sinα / √(1 − 2/r0); forward photon angular momentum about disk axis
  float b = r0 * sinA / sqrt(1.0 - 2.0 / r0);
  float Lz = -b * dot(cross(e1, e2), vec3(0.0, 1.0, 0.0));

  float phi = 0.0;
  float h = uStep;
  float s0 = e1.y; // disk-plane indicator at φ = 0
  vec3 col = vec3(0.0);
  bool done = false;
  float ny1 = e1.y, ny2 = e2.y;

  for (int i = 0; i < 4000; i++) {
    if (i >= uMaxSteps) break;
    // RK4 for (u, u')
    float k1u = du,                      k1v = -u + 3.0 * u * u;
    float u2 = u + 0.5 * h * k1u, v2 = du + 0.5 * h * k1v;
    float k2u = v2,                      k2v = -u2 + 3.0 * u2 * u2;
    float u3 = u + 0.5 * h * k2u, v3 = du + 0.5 * h * k2v;
    float k3u = v3,                      k3v = -u3 + 3.0 * u3 * u3;
    float u4 = u + h * k3u, v4 = du + h * k3v;
    float k4u = v4,                      k4v = -u4 + 3.0 * u4 * u4;
    float un = u + h / 6.0 * (k1u + 2.0 * k2u + 2.0 * k3u + k4u);
    float dun = du + h / 6.0 * (k1v + 2.0 * k2v + 2.0 * k3v + k4v);
    float phin = phi + h;

    // equatorial-plane crossing → thin disk
    float s1 = cos(phin) * ny1 + sin(phin) * ny2;
    if (uDisk == 1 && s0 * s1 <= 0.0 && un > 0.0) {
      float f = s0 / (s0 - s1);
      float uc = mix(u, un, f);
      float rc = 1.0 / uc;
      if (rc >= uRin && rc <= uRout) {
        float x = uRin / rc;
        float F = pow(x, 3.0) * (1.0 - sqrt(x));
        float Fmax = pow(36.0 / 49.0, 3.0) * (1.0 - sqrt(36.0 / 49.0));
        float Tem = 4600.0 * pow(max(F / Fmax, 1e-6), 0.25);
        float g = 1.0;
        if (uDoppler == 1) {
          float Om = pow(rc, -1.5);
          g = sqrt(max(1.0 - 3.0 / rc, 1e-4)) / (1.0 - Om * Lz);
        }
        // the camera is a static observer at r0: blueshift by 1/sqrt(1 - 2/r0)
        g /= sqrt(1.0 - 2.0 / r0);
        // azimuthal texture moving with the flow (visual cue of rotation)
        float pc = mix(phi, phin, f);
        vec3 pos = (cos(pc) * e1 + sin(pc) * e2) * rc;
        float ang = atan(pos.z, pos.x) + uTime * pow(rc, -1.5);
        float streak = 0.86 + 0.14 * sin(ang * 9.0 + rc * 1.7) * sin(rc * 3.1 - ang * 2.0);
        float I = (F / Fmax) * pow(g, 4.0) * streak;
        col = pow(bbColor(Tem * g), vec3(1.5)) * I * 1.5; // boosted saturation (visual choice)
        done = true;
        break;
      }
    }
    s0 = s1;

    if (un >= 0.5) { col = vec3(0.0); done = true; break; }   // crossed the horizon r = 2M
    if (un <= 0.0) {
      float f = u / (u - un);
      float pinf = phi + f * h;
      vec3 d = cos(pinf) * e1 + sin(pinf) * e2;
      col = background(d);
      done = true;
      break;
    }
    u = un; du = dun; phi = phin;
  }
  if (!done) col = vec3(0.0);
  col *= uExposure;
  col = col / (1.0 + col);              // Reinhard tone map
  col = pow(col, vec3(1.0 / 2.2));
  frag = vec4(col, 1.0);
}
`;
