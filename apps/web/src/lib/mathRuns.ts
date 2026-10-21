/**
 * Split a short plain-text label into normal / subscript / superscript runs, for surfaces that cannot
 * host KaTeX (canvas, SVG <text>). Recognised: "x_sub", "x_{sub}", "x^sup", "x^{sup}" after a letter,
 * prime or closing bracket, and runs of unicode sub/superscript characters (σ₈, 10⁻⁹), which are drawn
 * as real shifted text so they do not depend on the font having those glyphs.
 */
export type RunKind = 'n' | 'sub' | 'sup';
export interface Run { t: string; k: RunKind }

const SUBS: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '−', 'ₐ': 'a', 'ₑ': 'e', 'ₕ': 'h', 'ᵢ': 'i', 'ⱼ': 'j', 'ₖ': 'k', 'ₗ': 'l', 'ₘ': 'm', 'ₙ': 'n', 'ₒ': 'o', 'ₚ': 'p', 'ᵣ': 'r', 'ₛ': 's', 'ₜ': 't', 'ᵤ': 'u', 'ᵥ': 'v', 'ₓ': 'x' };
const SUPS: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '−', '⁺': '+', 'ⁿ': 'n', 'ⁱ': 'i' };

// base: a letter, prime, closing bracket or digit; then _/^ with a braced group or a short token
const MARK = /(?<=[\p{L}′')\]}☉⊕★\d])([_^])(\{[^}]*\}|[−\-+]?[\p{L}\p{N}☉⊕★∞.]+)/gu;
const UNI = new RegExp(`[${Object.keys(SUBS).join('')}]+|[${Object.keys(SUPS).join('')}]+`, 'gu');

export function mathRuns(input: string): Run[] {
  // symbol subscripts written inline: M☉, L☉, S⊕, M★, v∞ → M_☉ …
  const text = input.replace(/(?<=[A-Za-zα-ωΑ-Ω])(?=[☉⊕★∞])/g, '_');
  const runs: Run[] = [];
  const push = (t: string, k: RunKind) => {
    if (!t) return;
    const last = runs[runs.length - 1];
    if (last && last.k === k) last.t += t;
    else runs.push({ t, k });
  };
  const pushUni = (s: string) => {
    let i = 0;
    for (const m of s.matchAll(UNI)) {
      push(s.slice(i, m.index), 'n');
      const isSub = m[0][0] in SUBS;
      push([...m[0]].map((c) => (isSub ? SUBS[c] : SUPS[c])).join(''), isSub ? 'sub' : 'sup');
      i = m.index! + m[0].length;
    }
    push(s.slice(i), 'n');
  };
  let i = 0;
  for (const m of text.matchAll(MARK)) {
    // "x^1.5" keeps the decimal; a trailing full stop ends the sentence instead
    let body = m[2];
    let tail = '';
    if (body.endsWith('.')) { body = body.slice(0, -1); tail = '.'; }
    if (body.startsWith('{')) body = body.slice(1, -1);
    pushUni(text.slice(i, m.index));
    push(body.replace(/-/g, '−'), m[1] === '_' ? 'sub' : 'sup');
    pushUni(tail);
    i = m.index! + m[0].length;
  }
  pushUni(text.slice(i));
  return runs;
}

const TO_SUB: Record<string, string> = Object.fromEntries(Object.entries(SUBS).map(([u, a]) => [a, u]));
const TO_SUP: Record<string, string> = Object.fromEntries(Object.entries(SUPS).map(([u, a]) => [a, u]));

/**
 * Plain-text form for places that hold only text (<option>, aria-label, title). A sub/superscript run
 * becomes unicode characters only when every character in it has one (Ω_m → Ωₘ, θ_E stays "θ E");
 * otherwise a subscript follows a thin space and a superscript keeps its caret.
 */
export function plainMath(text: string): string {
  return mathRuns(text).map((r) => {
    if (r.k === 'n' || /^[☉⊕★∞]+$/u.test(r.t)) return r.t;
    const map = r.k === 'sub' ? TO_SUB : TO_SUP;
    const chars = [...r.t];
    if (chars.every((c) => map[c])) return chars.map((c) => map[c]).join('');
    return r.k === 'sub' ? ` ${r.t}` : `^${r.t}`;
  }).join('');
}

/** Relative size and baseline shift (in units of the base font size, +down) for each run kind. */
export const RUN_SCALE: Record<RunKind, number> = { n: 1, sub: 0.72, sup: 0.72 };
export const RUN_SHIFT: Record<RunKind, number> = { n: 0, sub: 0.28, sup: -0.4 };
