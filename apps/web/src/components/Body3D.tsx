/**
 * Textured celestial bodies for react-three-fiber scenes. Textures: Solar System Scope (CC BY 4.0,
 * based on NASA mission imagery). Axial tilt and sidereal rotation are real values; the texture
 * longitude origin is not tied to IAU prime meridians (visual only, fidelity C).
 */
import { Suspense, useMemo, useRef } from 'react';
import { useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

const url = (name: string) => `${import.meta.env.BASE_URL}tex/${name}`;

function useTex(name: string) {
  const t = useLoader(THREE.TextureLoader, url(name));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

interface Props {
  tex: string;
  radius: number;
  /** Obliquity [deg] (tilt of the spin axis). */
  tiltDeg?: number;
  /** Spin angle [rad] at the current frame (from the sidereal rotation period and time). */
  getSpin?: () => number;
  emissive?: boolean;
  clouds?: boolean;
  ring?: { inner: number; outer: number } | null;
  fallback: string;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  segments?: number;
}

function Ring({ inner, outer }: { inner: number; outer: number }) {
  const map = useLoader(THREE.TextureLoader, url('saturn_ring.png'));
  map.colorSpace = THREE.SRGBColorSpace;
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(inner, outer, 128, 1);
    const pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i));
      uv.setXY(i, (r - inner) / (outer - inner), 0.5); // the texture is a radial strip
    }
    return g;
  }, [inner, outer]);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial map={map} side={THREE.DoubleSide} transparent depthWrite={false} roughness={1} />
    </mesh>
  );
}

function Textured({ tex, radius, emissive, clouds, ring, onClick, segments = 64, getSpin }: Props) {
  const map = useTex(tex);
  const cloudMap = clouds ? useTex('earth_clouds.jpg') : null; // eslint-disable-line react-hooks/rules-of-hooks
  const bodyRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const drift = useRef(0);
  useFrame((_, dt) => {
    const a = getSpin ? getSpin() : 0;
    if (bodyRef.current) bodyRef.current.rotation.y = a;
    drift.current += dt * 0.01; // clouds drift slowly relative to the surface (visual)
    if (cloudRef.current) cloudRef.current.rotation.y = a + drift.current;
  });
  return (
    <>
      <mesh ref={bodyRef} onClick={onClick}>
        <sphereGeometry args={[radius, segments, segments / 2]} />
        {emissive ? <meshBasicMaterial map={map} toneMapped={false} /> : <meshStandardMaterial map={map} roughness={0.95} metalness={0} />}
      </mesh>
      {cloudMap && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[radius * 1.012, segments, segments / 2]} />
          <meshStandardMaterial alphaMap={cloudMap} color="#ffffff" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      )}
      {ring && <Ring inner={ring.inner} outer={ring.outer} />}
    </>
  );
}

/** A body: tilted group (spin axis = local +y) with textured sphere; plain colour while loading. */
export function Body3D(props: Props) {
  const { radius, tiltDeg = 0, fallback, onClick } = props;
  return (
    <group rotation={[0, 0, (-tiltDeg * Math.PI) / 180]}>
      <Suspense fallback={<mesh onClick={onClick}><sphereGeometry args={[radius, 24, 12]} /><meshStandardMaterial color={fallback} /></mesh>}>
        <Textured {...props} />
      </Suspense>
    </group>
  );
}
