import { useT } from '../i18n';
import type { Fidelity } from '../modules/types';

export function FidelityBadge({ level, short }: { level: Fidelity; short?: boolean }) {
  const { t } = useT();
  const long = level === 'A' ? t('fidA') : level === 'B' ? t('fidB') : t('fidC');
  return (
    <span className={`fid ${level}`} title={`${t(`fid${level}Short` as const)} - ${long}`}>
      <b>{level}</b>
      {short ? t(`fid${level}Short` as const) : long}
    </span>
  );
}
