/**
 * E1 scene: Sun, eight planets, the moons of the selected planet, orbits, star field, ecliptic grid, camera follow.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * Copyright (C) 2026, the USAC SimLab team. Adapted from Celestia (Copyright (C) 2001-2026, the Celestia Development
 * Team): rendering approach (see bodies.tsx). See NOTICE.md.
 */
import { Suspense, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  PLANETS, SATELLITES, BRIGHT_STARS, equatorialToEcliptic, OBLIQUITY_J2000_DEG, bvToTemperature, blackbodyCss, jdUtToTt,
  vsop87OrbitPath, vsop87PeriodDays, planetOrbitPath, satelliteOrbitPath, satellitesOf, type PlanetId, type ParentId, type EphemerisModel,
} from '@usac/sim-core';
import { SkySphere } from '../../components/SkySphere';
import { LitBody, SunBody, StarGlows, FadingOrbit, EclipticGrid, type FrameSource } from './bodies';
import {
  computeFrame, mapDistance, moonOffset, visualRadius, eclToScene, type DistanceMode, type SizeMode,
} from './systemFrame';
import { MOON_ORBIT_COLOR, type BodyId } from './look';

export interface SceneProps {
  tRef: { current: number };
  dist: DistanceMode;
  size: SizeMode;
  model: EphemerisModel;
  selected: BodyId;
  onSelect: (id: BodyId) => void;
  showLabels: boolean;
  showTrails: boolean;
  showGrid: boolean;
  showMoons: boolean;
  names: Record<BodyId, string>;
}

const PLANET_IDS = PLANETS.map((p) => p.id) as string[];
const WITH_MOONS = ['earth', 'jupiter', 'saturn', 'uranus', 'neptune'];
/** The planet whose moons belong with a selection: the planet itself, or the parent of a selected moon. */
const parentOf = (id: BodyId): ParentId | null => {
  if (id === 'sun') return null;
  if (PLANET_IDS.includes(id)) return WITH_MOONS.includes(id) ? (id as ParentId) : null;
  return SATELLITES.find((s) => s.id === id)?.parent ?? null;
};

function useStars() {
  return useMemo(() => BRIGHT_STARS.map((s) => {
    const e = equatorialToEcliptic(s, OBLIQUITY_J2000_DEG);
    const l = (e.lon * Math.PI) / 180, b = (e.lat * Math.PI) / 180;
    const c = new THREE.Color(blackbodyCss(bvToTemperature(s.bv)));
    return { dir: eclToScene([Math.cos(b) * Math.cos(l), Math.cos(b) * Math.sin(l), Math.sin(b)]), mag: s.mag, color: [c.r, c.g, c.b] as [number, number, number] };
  }), []);
}

const GRID_AU = [0.5, 1, 2, 5, 10, 20, 30];

/** Orbit of a planet, resampled when the date has drifted a few percent of a period. */
function PlanetOrbit({ id, dist, model, source, tRef, color, highlight }: { id: PlanetId; dist: DistanceMode; model: EphemerisModel; source: FrameSource; tRef: { current: number }; color: string; highlight: boolean }) {
  const [epoch, setEpoch] = useState(tRef.current);
  const period = vsop87PeriodDays(id);
  useFrame(() => { if (Math.abs(tRef.current - epoch) > period * 0.04) setEpoch(tRef.current); });
  const points = useMemo(() => {
    const tt = jdUtToTt(epoch);
    const path = model === 'vsop87' ? vsop87OrbitPath(id, tt, 256) : planetOrbitPath(id, tt, 256);
    const out = new Float32Array(path.length * 3);
    path.forEach((p, i) => out.set(mapDistance(p, dist), i * 3));
    return out;
  }, [id, dist, model, epoch]);
  return <FadingOrbit key={`${id}-${epoch}-${dist}-${model}`} points={points} color={color} alpha={highlight ? 0.95 : 0.5} fade={highlight ? 1.6 : 2.4}
    getHead={() => source.current?.planets[id].position ?? null} />;
}

/** Orbit of a moon around its (moving) planet. */
function MoonOrbit({ id, parent, dist, size, source, tRef }: { id: string; parent: PlanetId; dist: DistanceMode; size: SizeMode; source: FrameSource; tRef: { current: number } }) {
  const group = useRef<THREE.Group>(null);
  const info = satellitesOf(parent as ParentId).find((s) => s.id === id)!;
  const [epoch, setEpoch] = useState(tRef.current);
  useFrame(() => {
    if (Math.abs(tRef.current - epoch) > info.periodDays * 0.04) setEpoch(tRef.current);
    const f = source.current;
    if (group.current && f) group.current.position.set(...f.planets[parent].position);
  });
  const points = useMemo(() => {
    const f = source.current;
    const pl = PLANETS.find((p) => p.id === parent)!;
    const pv = f ? f.planets[parent].radiusVisual : visualRadius('planet', pl.radiusKm, size, dist);
    const path = satelliteOrbitPath(info.id, jdUtToTt(epoch), 120);
    const out = new Float32Array(path.length * 3);
    path.forEach((p, i) => out.set(moonOffset(p, pl.radiusKm, pv, size, dist), i * 3));
    return out;
  }, [id, parent, dist, size, epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group ref={group}>
      <FadingOrbit key={`${id}-${epoch}-${dist}-${size}`} points={points} color={MOON_ORBIT_COLOR} alpha={0.75} fade={1.8}
        getHead={() => source.current?.moons.find((m) => m.id === id)?.offset ?? null} />
    </group>
  );
}

function CameraRig({ source, selected, size }: { source: FrameSource; selected: BodyId; size: SizeMode }) {
  const controls = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const fly = useRef({ id: '' as BodyId | '', frames: 0 });
  if (fly.current.id !== selected) fly.current = { id: selected, frames: 130 };
  const init = useRef(false);
  if (!init.current) { camera.position.set(0, 26, 34); init.current = true; }

  useFrame(() => {
    const f = source.current;
    const c = controls.current;
    if (!f || !c) return;
    let pos: [number, number, number] = [0, 0, 0];
    let radius = visualRadius('sun', 695_700, size, 'log');
    if (selected !== 'sun') {
      const body = (f.planets as Record<string, { position: [number, number, number]; radiusVisual: number }>)[selected] ?? f.moons.find((m) => m.id === selected);
      if (body) { pos = body.position; radius = body.radiusVisual; }
    } else radius = Math.max(radius, 0.02);
    target.set(...pos);
    c.target.lerp(target, 0.12);
    c.minDistance = Math.max(radius * 1.25, 1e-6);
    const dist = camera.position.distanceTo(c.target);
    const near = Math.max(1e-6, Math.min(dist * 0.02, 0.5));
    if (Math.abs(camera.near - near) > camera.near * 0.2) { camera.near = near; camera.updateProjectionMatrix(); }
    if (fly.current.frames > 0) {
      fly.current.frames--;
      // a planet with moons is framed wider so that its inner moons come into view; zoom in from there
      const wide = f.moons.length > 0 && !!(f.planets as Record<string, unknown>)[selected];
      const want = selected === 'sun' ? Math.max(radius * 6, 18) : Math.max(radius * (wide ? 11 : 7), 1e-5);
      const off = camera.position.clone().sub(c.target);
      const d = off.length();
      // interpolate the distance in log space: it spans many orders of magnitude between the whole system and a moon
      off.setLength(Math.exp(Math.log(d) + (Math.log(want) - Math.log(d)) * 0.07));
      camera.position.copy(c.target).add(off);
    }
    c.update();
  });
  return <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={1e-6} maxDistance={900} />;
}

export function Scene(p: SceneProps) {
  const source = useMemo<FrameSource>(() => ({ current: null }), []);
  const stars = useStars();
  const live = useRef(p);
  live.current = p;
  const system = p.showMoons ? parentOf(p.selected) : null;

  // one frame computation per rendered frame, before any child reads it
  useFrame(() => {
    const q = live.current;
    const sys = q.showMoons ? parentOf(q.selected) : null;
    source.current = computeFrame(q.tRef.current, { dist: q.dist, size: q.size, model: q.model, system: sys });
  }, -1);

  const sunRadius = () => visualRadius('sun', 695_700, live.current.size, live.current.dist);
  const gridRadii = useMemo(() => GRID_AU.map((r) => (p.dist === 'linear' ? 10 * r : 16 * Math.log10(1 + r / 0.25))), [p.dist]);
  const sysPlanet = system as PlanetId | null;
  const moons = system ? satellitesOf(system) : [];

  return (
    <>
      <Suspense fallback={null}><SkySphere radius={1500} /></Suspense>
      <StarGlows stars={stars} />
      {p.showGrid && <EclipticGrid radii={gridRadii} />}
      <SunBody source={source} getRadius={sunRadius} tRef={p.tRef} label={p.showLabels ? p.names.sun : null} onSelect={p.onSelect} />
      {PLANETS.map((pl) => (
        <LitBody key={pl.id} id={pl.id} kind="planet" source={source} rings={pl.id === 'saturn'}
          label={p.showLabels ? p.names[pl.id] : null} labelColor={pl.color} onSelect={p.onSelect} />
      ))}
      {moons.map((m) => (
        <LitBody key={m.id} id={m.id} kind="moon" source={source} label={p.showLabels ? p.names[m.id] : null} labelColor="#cfe0ff" onSelect={p.onSelect} />
      ))}
      {p.showTrails && PLANETS.map((pl) => (
        <PlanetOrbit key={pl.id} id={pl.id} dist={p.dist} model={p.model} source={source} tRef={p.tRef} color={pl.color} highlight={p.selected === pl.id} />
      ))}
      {p.showTrails && sysPlanet && moons.map((m) => (
        <MoonOrbit key={m.id} id={m.id} parent={sysPlanet} dist={p.dist} size={p.size} source={source} tRef={p.tRef} />
      ))}
      <CameraRig source={source} selected={p.selected} size={p.size} />
    </>
  );
}
