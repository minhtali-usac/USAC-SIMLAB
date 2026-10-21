import { MathText, mathify } from './Tex';
import { Children, Fragment, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { useT } from '../i18n';
import { navigate, clearParams } from '../lib/router';
import { useKeys } from '../lib/hooks';
import { Icon } from './Icon';
import { FidelityBadge } from './FidelityBadge';
import { LessonDrawer } from './LessonDrawer';
import { ModelCardDialog } from './ModelCardDialog';
import type { Lesson, ModelCard } from '../modules/types';
import { MODULES } from '../modules/registry';
import { VIEW_META } from '../modules/viewMeta';
import { Section } from './Controls';

interface Props {
  id: string;
  lesson: Lesson;
  card: ModelCard;
  /** Main viewport (canvas / 3D / split panes). */
  children: ReactNode;
  panel: ReactNode;
  timeline?: ReactNode;
  onReset?: () => void;
  onTogglePlay?: () => void;
  /** Live formula / key result shown under the view (AstroSphere-style). */
  caption?: ReactNode;
}

export function SimLayout({ id, lesson, card, children, panel, timeline, onReset, onTogglePlay, caption }: Props) {
  const { t, tx } = useT();
  const meta = MODULES.find((m) => m.id === id)!;
  const view = VIEW_META[id];
  const [lessonOpen, setLessonOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `${meta.code} · ${tx(meta.title)} - USAC SimLab`;
  }, [meta, tx]);

  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(h);
  }, [toast]);

  const reset = () => {
    clearParams();
    onReset?.();
  };
  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('URL', url);
    }
    setToast(t('linkCopied'));
  };
  const snapshot = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const canvases = Array.from(stage.querySelectorAll('canvas'));
    if (!canvases.length) return;
    const sr = stage.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const out = document.createElement('canvas');
    out.width = Math.round(sr.width * dpr);
    out.height = Math.round(sr.height * dpr);
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg');
    ctx.fillRect(0, 0, out.width, out.height);
    for (const c of canvases) {
      const r = c.getBoundingClientRect();
      if (r.width === 0) continue;
      try {
        ctx.drawImage(c, (r.left - sr.left) * dpr, (r.top - sr.top) * dpr, r.width * dpr, r.height * dpr);
      } catch { /* tainted canvas */ }
    }
    ctx.font = `${12 * dpr}px 'Be Vietnam Pro', sans-serif`;
    ctx.fillStyle = 'rgba(160,170,210,0.8)';
    ctx.fillText(`USAC SimLab · ${meta.code} ${tx(meta.title)}`, 12 * dpr, out.height - 12 * dpr);
    const a = document.createElement('a');
    a.download = `usac-simlab-${meta.id}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    setToast(t('snapshotSaved'));
  };
  const fullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  useKeys({
    Space: () => onTogglePlay?.(),
    r: reset,
    l: () => setLessonOpen((v) => !v),
    i: () => setCardOpen((v) => !v),
    escape: () => { setLessonOpen(false); setCardOpen(false); },
  });

  return (
    <div className="sim-page">
      <div className="sim-topbar">
        <button className="icon-btn" onClick={() => navigate('/')} aria-label={t('back')} title={t('back')}>
          <Icon name="back" />
        </button>
        <div className="sim-title">
          <span className="chip code-chip" style={{ color: `var(--grp${meta.group})`, borderColor: `var(--grp${meta.group})` }}>{meta.code}</span>
          <h1>{tx(meta.title)}</h1>
          <FidelityBadge level={meta.fidelity} short />
        </div>
        <div className="sim-actions">
          {meta.href && (
            <a className="icon-btn" href={meta.href} target="_blank" rel="noopener" title={tx({ vi: 'Mở bản đầy đủ trên AstroSphere', en: 'Open the full version on AstroSphere' })}>
              <Icon name="globe" /><span className="lbl">AstroSphere ↗</span>
            </a>
          )}
          <button className="icon-btn primary" onClick={() => setLessonOpen(true)} title={`${t('lesson')} (L)`}>
            <Icon name="book" /><span className="lbl">{t('lesson')}</span>
          </button>
          <button className="icon-btn" onClick={() => setCardOpen(true)} title={`${t('modelCard')} (I)`} aria-label={t('modelCard')}>
            <Icon name="info" /><span className="lbl">{t('modelCard')}</span>
          </button>
          <button className="icon-btn" onClick={share} title={t('share')} aria-label={t('share')}><Icon name="share" /></button>
          <button className="icon-btn" onClick={snapshot} title={t('snapshot')} aria-label={t('snapshot')}><Icon name="camera" /></button>
          <button className="icon-btn" onClick={fullscreen} title={t('fullscreen')} aria-label={t('fullscreen')}><Icon name="expand" /></button>
          <button className="icon-btn" onClick={reset} title={`${t('reset')} (R)`} aria-label={t('reset')}><Icon name="reset" /></button>
          <button className="icon-btn collapse-panel-btn" onClick={() => setPanelCollapsed((v) => !v)} title={t('panel')} aria-label={t('panel')} aria-pressed={!panelCollapsed}>
            <Icon name="panel" />
          </button>
        </div>
      </div>
      <div className={`sim-body${panelCollapsed ? ' panel-collapsed' : ''}`}>
        <div className="sim-stage" ref={stageRef}>
          {view && (
            <div className="view-head">
              <h2>{mathify(tx(view.title))}</h2>
              <p>{mathify(tx(view.subtitle))}</p>
            </div>
          )}
          <div className="sim-viewport">{mathify(children)}</div>
          <div className="view-foot">
            <div className="view-caption">{mathify(caption)}</div>
            {view && <div className="view-hint">{mathify(tx(view.hint))}</div>}
          </div>
          {mathify(timeline)}
        </div>
        <aside className="sim-panel" aria-label={t('panel')}><PanelTabs panel={panel} /></aside>
      </div>
      {lessonOpen && <LessonDrawer meta={meta} lesson={lesson} onClose={() => setLessonOpen(false)} />}
      {cardOpen && <ModelCardDialog meta={meta} card={card} onClose={() => setCardOpen(false)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

/** Flatten fragments / arrays / falsy values into a flat element list. */
function flatten(node: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  Children.forEach(node, (c) => {
    if (c === null || c === undefined || c === false || c === true) return;
    if (isValidElement(c) && c.type === Fragment) out.push(...flatten((c.props as { children?: ReactNode }).children));
    else out.push(c);
  });
  return out;
}

type SectionEl = ReactElement<{ title: string; children: ReactNode }>;

/**
 * Turns the module's <Section>s into AstroSphere-style tabs. The readouts section
 * ("Số liệu") is not a tab: it stays visible under the active tab.
 */
function PanelTabs({ panel }: { panel: ReactNode }) {
  const { t } = useT();
  const items = flatten(panel);
  const sections = items.filter((c): c is SectionEl => isValidElement(c) && c.type === Section);
  const others = items.filter((c) => !(isValidElement(c) && c.type === Section));
  const readout = sections.find((s) => s.props.title === t('secReadouts'));
  const tabs = sections.filter((s) => s !== readout);
  const [active, setActive] = useState(0);
  const cur = tabs[Math.min(active, tabs.length - 1)];
  return (
    <>
      {tabs.length > 0 && (
        <div className="panel-card">
          {tabs.length > 1 && (
            <div className="panel-tabs" role="tablist">
              {tabs.map((s, i) => (
                <button key={s.props.title} role="tab" aria-selected={s === cur} onClick={() => setActive(i)}><MathText text={s.props.title} /></button>
              ))}
            </div>
          )}
          <div className="panel-tab-body" role="tabpanel">
            <h3 className="panel-title"><MathText text={cur.props.title} /></h3>
            {mathify(cur.props.children)}
          </div>
        </div>
      )}
      {readout && (
        <div className="panel-card">
          <div className="panel-tab-body">
            <h3 className="panel-title"><MathText text={readout.props.title} /></h3>
            {mathify(readout.props.children)}
          </div>
        </div>
      )}
      {mathify(others)}
    </>
  );
}
