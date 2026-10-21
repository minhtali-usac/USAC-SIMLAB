import { useT } from '../i18n';
import { useSettings, type Level } from '../store/settings';
import { useRoute } from '../lib/router';
import { Segmented } from './Controls';
import { Icon } from './Icon';

export function AppHeader() {
  const { t } = useT();
  const { lang, level, theme, set } = useSettings();
  const route = useRoute();
  return (
    <header className="app-header">
      <a className="brand" href="#/" aria-label="USAC SimLab">
        <img src="./usac-logo.png" alt="" />
        <span><small>CLB Thiên văn USAC</small>SimLab <em className="brand-tag">{t('appTagline')}</em></span>
      </a>
      <nav className="header-nav" aria-label="main">
        <a href="#/" className={route === '/' ? 'active' : ''}>{t('navModules')}</a>
        <a href="#/about" className={route === '/about' ? 'active' : ''}>{t('navAbout')}</a>
      </nav>
      <div className="header-spacer" />
      <div className="header-tools">
        <Segmented<Level>
          small
          ariaLabel={t('levelLabel')}
          value={level}
          onChange={(v) => set({ level: v })}
          options={[
            { value: 'explorer', label: t('levelExplorer') },
            { value: 'student', label: t('levelStudent') },
            { value: 'advanced', label: t('levelAdvanced') },
          ]}
        />
        <button className="icon-btn" onClick={() => set({ lang: lang === 'vi' ? 'en' : 'vi' })} aria-label={t('language')} title={t('language')}>
          <Icon name="globe" /><span className="lbl">{lang === 'vi' ? 'VI' : 'EN'}</span>
        </button>
        <button className="icon-btn" onClick={() => set({ theme: theme === 'dark' ? 'light' : 'dark' })} aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')} title={theme === 'dark' ? t('themeLight') : t('themeDark')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
    </header>
  );
}
