import type { ReactNode } from 'react';
import { useT } from '../i18n';
import { Icon } from './Icon';
import { mathify, typesetsChildren } from './Tex';
import { plainMath } from '../lib/mathRuns';

interface Props {
  playing: boolean;
  onToggle: () => void;
  onStep?: (dir: 1 | -1) => void;
  speed?: number;
  speeds?: { value: number; label: string }[];
  onSpeed?: (v: number) => void;
  label: ReactNode;
  children?: ReactNode;
}

/** Central simulation clock controls (brief §7: play/pause, speed, step, reverse). */
export function Timeline({ playing, onToggle, onStep, speed, speeds, onSpeed, label, children }: Props) {
  const { t } = useT();
  return (
    <div className="timeline">
      {onStep && <button className="icon-btn" onClick={() => onStep(-1)} aria-label={t('stepBack')} title={t('stepBack')}><Icon name="stepB" /></button>}
      <button className="icon-btn primary play" onClick={onToggle} aria-label={playing ? t('pause') : t('play')} title={`${playing ? t('pause') : t('play')} (Space)`}>
        <Icon name={playing ? 'pause' : 'play'} />
      </button>
      {onStep && <button className="icon-btn" onClick={() => onStep(1)} aria-label={t('stepFwd')} title={t('stepFwd')}><Icon name="stepF" /></button>}
      {speeds && onSpeed && (
        <select className="select" style={{ width: 'auto' }} value={speed} onChange={(e) => onSpeed(Number(e.target.value))} aria-label={t('speed')}>
          {speeds.map((s) => <option key={s.value} value={s.value}>{plainMath(s.label)}</option>)}
        </select>
      )}
      <div className="time-label">{mathify(label)}</div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

typesetsChildren(Timeline);
