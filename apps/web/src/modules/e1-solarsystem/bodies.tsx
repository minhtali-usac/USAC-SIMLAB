/**
 * react-three-fiber building blocks of the E1 scene: lit bodies (lunar-Lambert, eclipse and ring shadows), atmosphere
 * shells, Saturn's rings, star glows, the Sun, fading orbits and the ecliptic grid. Shading model and shaders adapted
 * from Celestia (see lib/celestiaShaders.ts).
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. Adapted from Celestia (Copyright (C) 2001-2026, the Celestia Development
 * Team): rendering approach. See NOTICE.md.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  BODY_VERTEX, BODY_FRAGMENT, RING_FRAGMENT, ATMOSPHERE_VERTEX, ATMOSPHERE_FRAGMENT, STAR_VERTEX, STAR_FRAGMENT,
  ORBIT_VERTEX, ORBIT_FRAGMENT, MAX_OCCLUDERS,
} from '../../lib/celestiaShaders';
import type { BodyFrame, SystemFrame } from './systemFrame';
import { LOOK, SATURN_RINGS, type BodyId, type SurfaceLook } from './look';

const texUrl = (name: string) => `${import.meta.env.BASE_URL}tex/${name}`;

/** Texture loaded without suspending, so the body keeps updating (and stays in place) while it loads. */
function useLazyTexture(name: string | undefined, opts: { mipmaps?: boolean } = {}): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!name) { setTex(null); return; }
    let live = true;
    new THREE.TextureLoader().load(texUrl(name), (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      if (opts.mipmaps === false) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }
      if (live) setTex(t);
    });
    return () => { live = false; };
  }, [name, opts.mipmaps]);
  return tex;
}

const EMPTY = new THREE.Texture();
const v3 = () => new THREE.Vector3();

export interface FrameSource { current: SystemFrame | null }

function frameOf(src: FrameSource, id: string, kind: 'planet' | 'moon'): BodyFrame | null {
  const f = src.current;
  if (!f) return null;
  return kind === 'planet' ? (f.planets as Record<string, BodyFrame>)[id] ?? null : f.moons.find((m) => m.id === id) ?? null;
}

interface LitProps {
  id: Exclude<BodyId, 'sun'>;
  kind: 'planet' | 'moon';
  source: FrameSource;
  label: string | null;
  labelColor: string;
  onSelect: (id: BodyId) => void;
  visible?: boolean;
  /** Draw Saturn's rings. */
  rings?: boolean;
}

/** One lit sphere with its optional cloud shell, atmosphere and rings; positioned every frame from the frame source. */
export function LitBody({ id, kind, source, label, labelColor, onSelect, rings }: LitProps) {
  const look: SurfaceLook = LOOK[id];
  const anchor = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const map = useLazyTexture(look.map);
  const night = useLazyTexture(look.nightMap);
  const cloudTex = useLazyTexture(look.clouds);
  const ringTex = useLazyTexture(rings ? 'saturn_ring.png' : undefined, { mipmaps: false });

  const make = (clouds: boolean) => new THREE.ShaderMaterial({
    vertexShader: BODY_VERTEX, fragmentShader: BODY_FRAGMENT,
    defines: clouds ? { CLOUDS: '' } : {},
    transparent: clouds, depthWrite: !clouds,
    uniforms: {
      map: { value: EMPTY }, nightMap: { value: EMPTY }, ringTex: { value: EMPTY },
      uHasMap: { value: false }, uHasNight: { value: false }, uHasRing: { value: false },
      uBaseColor: { value: new THREE.Color(look.color) }, uNoise: { value: look.noise },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) }, uSunDist: { value: 1.5e8 }, uSunRadius: { value: 695_700 },
      uRadiusKm: { value: 1000 }, uCenterW: { value: new THREE.Vector3() }, uKmPerUnit: { value: 1 },
      uLunar: { value: look.lunar }, uTwilight: { value: look.twilight }, uAmbient: { value: 0.035 }, uNightGain: { value: 1.1 },
      uOccN: { value: 0 }, uOccPos: { value: Array.from({ length: MAX_OCCLUDERS }, v3) }, uOccRad: { value: new Array(MAX_OCCLUDERS).fill(0) },
      uRingN: { value: new THREE.Vector3(0, 1, 0) }, uRingIn: { value: 0 }, uRingOut: { value: 0 },
    },
  });
  const body = useMemo(() => make(false), []); // eslint-disable-line react-hooks/exhaustive-deps
  const cloud = useMemo(() => (look.clouds ? make(true) : null), []); // eslint-disable-line react-hooks/exhaustive-deps
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 96, 48), []);

  const atmo = useMemo(() => {
    const a = look.atmosphere;
    if (!a) return null;
    return new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX, fragmentShader: ATMOSPHERE_FRAGMENT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        uSunDir: { value: new THREE.Vector3(1, 0, 0) }, uCenterW: { value: new THREE.Vector3() }, uRp: { value: 1 }, uRa: { value: 1 + a.shell },
        uScaleH: { value: a.scaleH }, uBeta: { value: new THREE.Vector3(...a.beta) }, uMie: { value: a.mie }, uMieG: { value: a.mieG }, uGain: { value: a.gain },
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ring = useMemo(() => (rings ? new THREE.ShaderMaterial({
    vertexShader: BODY_VERTEX, fragmentShader: RING_FRAGMENT, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: {
      ringTex: { value: EMPTY }, uSunDir: { value: new THREE.Vector3(1, 0, 0) }, uRingN: { value: new THREE.Vector3(0, 1, 0) },
      uCenterW: { value: new THREE.Vector3() }, uKmPerUnit: { value: 1 }, uRadiusKm: { value: 1 }, uRingIn: { value: 0 }, uRingOut: { value: 0 },
    },
  }) : null), [rings]);
  const ringGeo = useMemo(() => {
    if (!rings) return null;
    const g = new THREE.RingGeometry(SATURN_RINGS.inner, SATURN_RINGS.outer, 160, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [rings]);

  const q = useMemo(() => new THREE.Quaternion(), []);
  const n = useMemo(() => new THREE.Vector3(), []);
  const { camera } = useThree();

  useFrame(() => {
    const f = frameOf(source, id, kind);
    const a = anchor.current, s = spin.current;
    if (!a || !s) return;
    if (!f) { a.visible = false; return; }
    a.visible = true;
    a.position.set(...f.position);
    s.position.set(0, 0, 0);
    s.scale.setScalar(f.radiusVisual);
    q.set(...f.quat);
    s.quaternion.copy(q);
    const km = f.radiusKm / f.radiusVisual;
    const setCommon = (m: THREE.ShaderMaterial) => {
      const u = m.uniforms;
      u.uSunDir.value.set(...f.sunDir); u.uSunDist.value = f.sunDistKm; u.uRadiusKm.value = f.radiusKm;
      u.uCenterW.value.set(...f.position); u.uKmPerUnit.value = km;
      const occ = f.occluders;
      u.uOccN.value = occ.length;
      occ.forEach((o, i) => { u.uOccPos.value[i].set(...o.pos); u.uOccRad.value[i] = o.radiusKm; });
      if (rings) {
        n.set(0, 1, 0).applyQuaternion(q);
        u.uRingN.value.copy(n); u.uRingIn.value = SATURN_RINGS.inner * f.radiusKm; u.uRingOut.value = SATURN_RINGS.outer * f.radiusKm;
        u.uHasRing.value = !!ringTex; u.ringTex.value = ringTex ?? EMPTY;
      }
    };
    body.uniforms.map.value = map ?? EMPTY; body.uniforms.uHasMap.value = !!map;
    body.uniforms.nightMap.value = night ?? EMPTY; body.uniforms.uHasNight.value = !!night;
    setCommon(body);
    if (cloud) { cloud.uniforms.map.value = cloudTex ?? EMPTY; cloud.uniforms.uHasMap.value = !!cloudTex; setCommon(cloud); }
    if (atmo && look.atmosphere) {
      const u = atmo.uniforms;
      u.uSunDir.value.set(...f.sunDir); u.uCenterW.value.set(...f.position); u.uRp.value = f.radiusVisual; u.uRa.value = f.radiusVisual * (1 + look.atmosphere.shell);
      atmo.side = camera.position.distanceTo(a.position) < f.radiusVisual * (1 + look.atmosphere.shell) ? THREE.BackSide : THREE.FrontSide;
    }
    if (ring) {
      const u = ring.uniforms;
      n.set(0, 1, 0).applyQuaternion(q);
      u.uSunDir.value.set(...f.sunDir); u.uRingN.value.copy(n); u.uCenterW.value.set(...f.position); u.uKmPerUnit.value = km;
      u.uRadiusKm.value = f.radiusKm; u.uRingIn.value = SATURN_RINGS.inner * f.radiusKm; u.uRingOut.value = SATURN_RINGS.outer * f.radiusKm;
      u.ringTex.value = ringTex ?? EMPTY;
    }
  });

  const pointer = { onPointerOver: () => (document.body.style.cursor = 'pointer'), onPointerOut: () => (document.body.style.cursor = '') };
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(id); };
  return (
    <group ref={anchor}>
      <group ref={spin}>
        <mesh geometry={sphere} material={body} onClick={click} {...pointer} />
        {cloud && <mesh geometry={sphere} material={cloud} scale={1.012} />}
        {atmo && look.atmosphere && <mesh geometry={sphere} material={atmo} scale={1 + look.atmosphere.shell} renderOrder={2} />}
        {ring && ringGeo && <mesh geometry={ringGeo} material={ring} renderOrder={1} onClick={click} />}
      </group>
      {label && <Label color={labelColor} getLift={() => (frameOf(source, id, kind)?.radiusVisual ?? 0.2) * (kind === 'moon' ? 1.15 : 1.0) + (kind === 'moon' ? 0.01 : 0.12)}>{label}</Label>}
    </group>
  );
}

/** Text above a body, lifted by the body's radius so it clears the disc. */
function Label({ children, color, getLift }: { children: ReactNode; color: string; getLift: () => number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => { if (g.current) g.current.position.y = getLift(); });
  return (
    <group ref={g}>
      <Html center style={{ color, fontSize: 11.5, fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 4px #000, 0 0 2px #000', transform: 'translateY(-12px)' }}>{children}</Html>
    </group>
  );
}

/** The Sun: emissive globe, soft glare and a label. */
export function SunBody({ source, getRadius, tRef, label, onSelect }: { source: FrameSource; getRadius: () => number; tRef: { current: number }; label: string | null; onSelect: (id: BodyId) => void }) {
  const mesh = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Sprite>(null);
  const grp = useRef<THREE.Group>(null);
  const map = useLazyTexture('sun.jpg');
  const glowTex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,235,170,1)'); grd.addColorStop(0.12, 'rgba(255,215,120,0.75)'); grd.addColorStop(0.3, 'rgba(255,170,60,0.28)');
    grd.addColorStop(0.6, 'rgba(255,120,30,0.07)'); grd.addColorStop(1, 'rgba(255,100,20,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  useFrame(() => {
    const r = getRadius();
    if (mesh.current) { mesh.current.scale.setScalar(r); mesh.current.rotation.y = (2 * Math.PI * (tRef.current - 2451545)) / 25.38; }
    if (glow.current) glow.current.scale.setScalar(r * 7);
    if (grp.current) grp.current.visible = !!source.current;
  });
  return (
    <group ref={grp}>
      <mesh ref={mesh} onClick={(e) => { e.stopPropagation(); onSelect('sun'); }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial key={map ? 'textured' : 'plain'} map={map ?? undefined} color={map ? '#ffffff' : '#fff1b8'} toneMapped={false} />
      </mesh>
      <sprite ref={glow} renderOrder={3}>
        <spriteMaterial map={glowTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
      </sprite>
      {label && <Label color="#fde68a" getLift={() => getRadius() * 1.4}>{label}</Label>}
    </group>
  );
}

/** Bright stars as point-spread-function glows. */
export function StarGlows({ stars, radius = 900 }: { stars: { dir: [number, number, number]; mag: number; color: [number, number, number] }[]; radius?: number }) {
  const { gl } = useThree();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(stars.length * 3), mag = new Float32Array(stars.length), col = new Float32Array(stars.length * 3);
    stars.forEach((s, i) => { pos.set([s.dir[0] * radius, s.dir[1] * radius, s.dir[2] * radius], i * 3); mag[i] = s.mag; col.set(s.color, i * 3); });
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aMag', new THREE.BufferAttribute(mag, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    return g;
  }, [stars, radius]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: STAR_VERTEX, fragmentShader: STAR_FRAGMENT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uPx: { value: gl.getPixelRatio() }, uScale: { value: 1 } },
  }), [gl]);
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={-0.5} />;
}

interface OrbitProps {
  /** Closed polyline in scene units, in time order. */
  points: Float32Array;
  color: string;
  alpha?: number;
  fade?: number;
  /** Current position of the body on the orbit (scene units); the fade starts there. */
  getHead: () => [number, number, number] | null;
}

/** An orbit drawn as a line that fades out behind the body, as Celestia draws its orbit trails. */
export function FadingOrbit({ points, color, alpha = 0.7, fade = 2.2, getHead }: OrbitProps) {
  const n = points.length / 3;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) phase[i] = i / (n - 1);
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    return g;
  }, [points, n]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: ORBIT_VERTEX, fragmentShader: ORBIT_FRAGMENT, transparent: true, depthWrite: false,
    uniforms: { uHead: { value: 0 }, uFade: { value: fade }, uColor: { value: new THREE.Color(color) }, uAlpha: { value: alpha } },
  }), [color, alpha, fade]);
  const last = useRef(0);
  useFrame(({ clock }) => {
    if (clock.elapsedTime - last.current < 0.08) return;
    last.current = clock.elapsedTime;
    const h = getHead();
    if (!h) return;
    let best = 0, bd = Infinity;
    for (let i = 0; i < n; i++) {
      const dx = points[i * 3] - h[0], dy = points[i * 3 + 1] - h[1], dz = points[i * 3 + 2] - h[2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bd) { bd = d; best = i; }
    }
    mat.uniforms.uHead.value = best / (n - 1);
  });
  return <primitive object={new THREE.Line(geo, mat)} frustumCulled={false} />;
}

/** Ecliptic grid: circles at 0.5, 1, 2, 5, 10, 20, 30 au (drawn at the compressed radius when needed) and 12 spokes. */
export function EclipticGrid({ radii }: { radii: number[] }) {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const R = radii[radii.length - 1];
    for (const r of radii) {
      for (let i = 0; i < 180; i++) {
        const a0 = (i / 180) * 2 * Math.PI, a1 = ((i + 1) / 180) * 2 * Math.PI;
        pts.push(r * Math.cos(a0), 0, -r * Math.sin(a0), r * Math.cos(a1), 0, -r * Math.sin(a1));
      }
    }
    for (let k = 0; k < 12; k++) pts.push(0, 0, 0, R * Math.cos((k / 12) * 2 * Math.PI), 0, -R * Math.sin((k / 12) * 2 * Math.PI));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, [radii]);
  return <lineSegments geometry={geo} frustumCulled={false}><lineBasicMaterial color="#4a6fa5" transparent opacity={0.22} depthWrite={false} /></lineSegments>;
}
