import { Suspense, lazy, useMemo, useEffect, Component, type ReactNode } from 'react';
import { AppHeader } from './components/AppHeader';
import { useRoute } from './lib/router';
import { useT } from './i18n';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { MODULES } from './modules/registry';

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

class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  render() {
    if (this.state.err) {
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
