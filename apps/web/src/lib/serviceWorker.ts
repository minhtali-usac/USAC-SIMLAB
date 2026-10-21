/**
 * Service-worker registration plus a signal for "a newer worker has just taken over this page".
 * A worker update brings a fresh cache, so a module chunk that failed under the old worker is worth
 * one more try once the new one is in control (see ErrorBoundary in App.tsx).
 */
let updated = false;
const waiting = new Set<() => void>();

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  // only a replacement counts: the very first install has nothing stale to fix
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || updated) return;
    updated = true;
    waiting.forEach((cb) => cb());
    waiting.clear();
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => undefined));
}

/** Run `cb` once a newer service worker controls the page (immediately if that already happened). */
export function whenServiceWorkerUpdated(cb: () => void) {
  if (updated) cb();
  else waiting.add(cb);
}
