import { Suspense, lazy, useMemo, useEffect, Component, type ReactNode } from 'react';
import { AppHeader } from './components/AppHeader';
import { useRoute } from './lib/router';
import { useT } from './i18n';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { MODULES } from './modules/registry';
import { whenServiceWorkerUpdated } from './lib/serviceWorker';

function Loading() {
  const { t } = useT();
  return (
    <div className="loading" style={{ height: 'calc(100dvh - var(--header-h))' }}>
      <div style={{ display: 'grid', placeItems: 'center', gap: 12 }}>
        <div className="spinner" />
        <span>{t('loading')}</span>
      </div>
    </div>
  );
}

// A module chunk failed to load (Chrome / Safari / Firefox wording): after a deploy the hashed
// chunk names change, so a page opened before it - or a stale cached copy - cannot find them.
const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;
const RELOAD_KEY = 'usac-chunk-reload';

function ChunkError() {
  const { tx } = useT();
  return (
    <div className="page">
      <h1>⚠︎</h1>
      <p className="warn-box">{tx({ vi: 'Không tải được mô phỏng này, có thể do trang vừa được cập nhật. Hãy tải lại trang.', en: 'This simulation could not be loaded, probably because the site was just updated. Please reload the page.' })}</p>
      <button className="btn" onClick={() => location.reload()}>{tx({ vi: 'Tải lại trang', en: 'Reload page' })}</button>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error) {
    if (!CHUNK_ERROR.test(err.message)) return;
    // reload once to fetch the current index; the guard stops a reload loop if the chunk is really missing
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - last > 30_000) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        location.reload();
        return;
      }
    } catch { /* storage unavailable */ }
    // a newer service worker brings a fresh cache: retry as soon as it controls the page
    whenServiceWorkerUpdated(() => location.reload());
  }
  render() {
    if (this.state.err) {
      if (CHUNK_ERROR.test(this.state.err.message)) return <ChunkError />;
      return (
        <div className="page">
          <h1>⚠︎</h1>
          <p className="warn-box">{this.state.err.message}</p>
          <a className="btn" href="#/" onClick={() => this.setState({ err: null })}>←</a>
        </div>
      );
    }
    return this.props.children;
  }
}

function ModuleRoute({ id }: { id: string }) {
  const { t } = useT();
  const meta = MODULES.find((m) => m.id === id && m.ready);
  const Comp = useMemo(() => (meta?.load ? lazy(meta.load) : null), [meta]);
  if (!Comp) return <NotFound />;
  return (
    <ErrorBoundary key={id}>
      <Suspense fallback={<Loading />}>
        <Comp />
      </Suspense>
      <span className="sr-only">{t('keyboardHint')}</span>
    </ErrorBoundary>
  );
}

function NotFound() {
  const { t } = useT();
  return (
    <div className="page">
      <h1>404</h1>
      <p>{t('notFound')}</p>
      <a className="btn" href="#/">{t('backHome')}</a>
    </div>
  );
}

export function App() {
  const route = useRoute();
  const { t } = useT();
  useEffect(() => {
    if (!route.startsWith('/m/')) document.title = `USAC SimLab · ${t('appTagline')}`;
  }, [route, t]);
  let page: ReactNode;
  if (route === '/' || route === '') page = <Home />;
  else if (route === '/about') page = <About />;
  else if (route.startsWith('/m/')) page = <ModuleRoute id={route.slice(3)} />;
  else page = <NotFound />;
  return (
    <>
      <AppHeader />
      <main id="main">{page}</main>
    </>
  );
}
