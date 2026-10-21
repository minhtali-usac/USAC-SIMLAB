import { create } from 'zustand';

export type Lang = 'vi' | 'en';
export type Level = 'explorer' | 'student' | 'advanced';
export type Theme = 'dark' | 'light';
export type Quality = 'high' | 'saver';

interface Settings {
  lang: Lang;
  level: Level;
  theme: Theme;
  quality: Quality;
  set: (p: Partial<Omit<Settings, 'set'>>) => void;
}

const KEY = 'usac-simlab-settings';

function load(): Partial<Settings> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const initial = load();
const lowEnd = typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency ?? 8) <= 4 || /Mobi/i.test(navigator.userAgent));

export const useSettings = create<Settings>((set, get) => ({
  lang: initial.lang ?? (typeof navigator !== 'undefined' && !navigator.language.startsWith('vi') && navigator.language.startsWith('en') ? 'en' : 'vi'),
  level: initial.level ?? 'student',
  theme: initial.theme ?? 'dark', // brief §10: dark by default
  quality: initial.quality ?? (lowEnd ? 'saver' : 'high'),
  set: (p) => {
    // apply theme synchronously so canvases reading CSS variables see the new palette
    if (p.theme) document.documentElement.dataset.theme = p.theme;
    if (p.lang) document.documentElement.lang = p.lang;
    set(p);
    const { lang, level, theme, quality } = get();
    try { localStorage.setItem(KEY, JSON.stringify({ lang, level, theme, quality })); } catch { /* storage unavailable */ }
  },
}));

export const levelRank = (l: Level) => (l === 'explorer' ? 0 : l === 'student' ? 1 : 2);
/** True when the current level is at least `min`. */
export const useLevelAtLeast = (min: Level) => levelRank(useSettings((s) => s.level)) >= levelRank(min);

// apply persisted theme & language before the first render
if (typeof document !== 'undefined') {
  document.documentElement.dataset.theme = useSettings.getState().theme;
  document.documentElement.lang = useSettings.getState().lang;
}
