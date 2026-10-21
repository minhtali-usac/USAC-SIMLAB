/**
 * Tiny hash router + URL-parameter state (brief §3: every simulation is shareable by link).
 * URL shape: #/m/b1?e=0.5&q=1
 */
import { useCallback, useSyncExternalStore } from 'react';

const EVT = 'usac-urlstate';

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener('hashchange', cb);
    window.removeEventListener(EVT, cb);
  };
}
const getHash = () => window.location.hash || '#/';

export function useHash() {
  return useSyncExternalStore(subscribe, getHash, () => '#/');
}

export function parseHash(hash: string) {
  const h = hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = h.split('?');
  return { path: path || '/', params: new URLSearchParams(qs) };
}

export function useRoute() {
  const { path } = parseHash(useHash());
  return path;
}

export function navigate(path: string) {
  window.location.hash = path;
  window.scrollTo({ top: 0 });
}

/** Merge (or remove with null) parameters into the current hash without a history entry. */
export function setParams(patch: Record<string, string | number | boolean | null>) {
  const { path, params } = parseHash(getHash());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) params.delete(k);
    else params.set(k, typeof v === 'number' ? String(+v.toPrecision(10)) : String(v));
  }
  const qs = params.toString();
  history.replaceState(null, '', `#${path}${qs ? `?${qs}` : ''}`);
  window.dispatchEvent(new Event(EVT));
}

export function clearParams() {
  const { path } = parseHash(getHash());
  history.replaceState(null, '', `#${path}`);
  window.dispatchEvent(new Event(EVT));
}

type ParamValue = number | string | boolean;

/**
 * React state backed by a URL hash parameter. The type follows the default value.
 * Numbers are clamped to [min, max] if given.
 */
export function useParam(key: string, def: number, opts?: { min?: number; max?: number }): [number, (v: number) => void];
export function useParam(key: string, def: boolean): [boolean, (v: boolean) => void];
export function useParam(key: string, def: string): [string, (v: string) => void];
export function useParam<S extends string>(key: string, def: S): [S, (v: S) => void];
export function useParam<T extends ParamValue>(key: string, def: T, opts?: { min?: number; max?: number }): [T, (v: T) => void] {
  const hash = useHash();
  const raw = parseHash(hash).params.get(key);
  let value: T = def;
  if (raw !== null) {
    if (typeof def === 'number') {
      let n = Number(raw);
      if (Number.isFinite(n)) {
        if (opts?.min !== undefined) n = Math.max(opts.min, n);
        if (opts?.max !== undefined) n = Math.min(opts.max, n);
        value = n as T;
      }
    } else if (typeof def === 'boolean') value = (raw === 'true' || raw === '1') as T;
    else value = raw as T;
  }
  const set = useCallback((v: T) => setParams({ [key]: v === def ? null : v }), [key, def]);
  return [value, set];
}
