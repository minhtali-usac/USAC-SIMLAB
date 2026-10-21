/**
 * Real Milky Way backdrop for 3D scenes: the ESO/S. Brunier all-sky panorama (CC BY 4.0), which is an
 * equirectangular map in galactic coordinates centred on l = 0, b = 0 with l increasing to the left.
 * Each fragment's view direction (ecliptic J2000, scene axes x = ecl x, y = ecl z, z = −ecl y) is
 * rotated to galactic (l, b) with the IAU equatorial→galactic matrix (Hipparcos, ESA 1997, vol. 1 §1.5.3)
 * after ecliptic→equatorial (ε = 23.4392911°), so the band lies where it really is on the sky.
 */
import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const EPS = (23.4392911 * Math.PI) / 180;
const EQ2GAL = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.444829630, 0.7469822445],
  [-0.867666149, -0.1980763734, 0.4559837762],
];

/** Matrix taking a scene-frame direction to galactic Cartesian coordinates. */
function sceneToGalactic(): THREE.Matrix3 {
  // scene → ecliptic: (x, y, z)_scene = (ex, ez, −ey) ⇒ ex = x, ey = −z, ez = y
  const s2e = [[1, 0, 0], [0, 0, -1], [0, 1, 0]];
  const e2q = [[1, 0, 0], [0, Math.cos(EPS), -Math.sin(EPS)], [0, Math.sin(EPS), Math.cos(EPS)]];
  const mul = (a: number[][], b: number[][]) => a.map((r) => b[0].map((_, j) => r.reduce((s, v, k) => s + v * b[k][j], 0)));
  const m = mul(EQ2GAL, mul(e2q, s2e));
  return new THREE.Matrix3().set(m[0][0], m[0][1], m[0][2], m[1][0], m[1][1], m[1][2], m[2][0], m[2][1], m[2][2]);
}

export function SkySphere({ radius = 1500, brightness = 0.55 }: { radius?: number; brightness?: number }) {
  const tex = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}img/milkyway.jpg`);
  tex.colorSpace = THREE.SRGBColorSpace;
  // no mipmaps: the longitude wrap at l = ±180° would otherwise pick the coarsest mip and draw a seam
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  const material = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { map: { value: tex }, rot: { value: sceneToGalactic() }, gain: { value: brightness } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D map; uniform mat3 rot; uniform float gain; varying vec3 vDir;
      void main(){
        vec3 g = rot * normalize(vDir);
        float l = atan(g.y, g.x);            // galactic longitude, −π..π
        float b = asin(clamp(g.z, -1.0, 1.0));
        vec2 uv = vec2(0.5 - l / 6.28318530718, 0.5 + b / 3.14159265359);
        gl_FragColor = vec4(texture2D(map, uv).rgb * gain, 1.0);
        #include <colorspace_fragment>
      }`,
  }), [tex, brightness]);
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[radius, 64, 32]} />
    </mesh>
  );
}
