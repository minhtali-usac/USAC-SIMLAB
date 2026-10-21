import { useCallback } from 'react';
import { useSettings, type Lang } from '../store/settings';
import { UI, type UiKey } from './ui';

/** A bilingual string. All user-facing content is written as L (brief §11: no hard-coded strings). */
export type L = { vi: string; en: string };
export type LList = { vi: string[]; en: string[] };

export const useLang = () => useSettings((s) => s.lang);

/** Translator for UI keys and inline bilingual content. */
export function useT() {
  const lang = useLang();
  const t = useCallback((k: UiKey, vars?: Record<string, string | number>) => {
    let s: string = UI[lang][k] ?? UI.vi[k] ?? k;
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, String(b));
    return s;
  }, [lang]);
  const tx = useCallback((l: L | string) => (typeof l === 'string' ? l : l[lang] ?? l.vi), [lang]);
  return { t, tx, lang };
}

export const pick = (l: L, lang: Lang) => l[lang] ?? l.vi;

/**
 * Locale-aware number formatting for readers without a science background: plain digits with
 * thousands separators up to 10⁹ (e.g. 149.597.871), otherwise "1,5 × 10¹²" - never "1.5e12".
 */
export function fmt(x: number, digits = 3, lang: Lang = 'vi'): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '-';
  const ax = Math.abs(x);
  if (ax !== 0 && (ax >= 1e9 || ax < 1e-3)) return sci(x, digits, lang);
  return x.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).replace('-', '−');
}

/** Fixed number of decimals, locale-aware, tabular. */
export function fix(x: number, decimals = 2, lang: Lang = 'vi'): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '-';
  return x.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).replace('-', '−');
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
/**
 * Powers-of-ten notation for very large/small values, written the way people read it:
 * "2,6 × 10⁻⁹" (vi) / "2.6 × 10⁻⁹" (en); a mantissa of exactly 1 is dropped ("10⁻⁸").
 * `digits` = significant digits. Language defaults to the current interface language.
 */
export function sci(x: number, digits = 3, lang: Lang = useSettings.getState().lang): string {
  if (x === 0) return '0';
  if (!Number.isFinite(x)) return '-';
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / 10 ** e;
  const d = Math.max(0, digits - 1);
  if (Math.abs(Number(m.toFixed(d))) >= 10) { m /= 10; e += 1; }
  const pow = `10${String(e).split('').map((c) => SUP[c] ?? c).join('')}`;
  if (e === 0) return fix(m, d, lang);
  if (Math.abs(Number(m.toFixed(d))) === 1) return `${m < 0 ? '−' : ''}${pow}`;
  return `${fix(m, d, lang)} × ${pow}`;
}
