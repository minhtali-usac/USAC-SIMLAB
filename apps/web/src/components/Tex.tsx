import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Fragment, cloneElement, isValidElement, useMemo, type ReactElement, type ReactNode } from 'react';
import { plainMath } from '../lib/mathRuns';
import { SvgRuns } from './SvgRuns';

/**
 * KaTeX output. Display equations are typeset in inline mode with \displaystyle so that long lines can wrap
 * after relations/operators (and after ", \quad" separators) on narrow panels and phones, instead of overflowing.
 */
export function Tex({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => {
    try {
      const src = display ? `\\displaystyle ${tex.replace(/,\s*\\(q?quad)/g, ',\\allowbreak\\$1')}` : tex;
      return katex.renderToString(src, { displayMode: false, throwOnError: false, strict: 'ignore' });
    } catch {
      return tex;
    }
  }, [tex, display]);
  return <span className={display ? 'tex-display' : 'tex'} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Inline formatting: $tex$, **bold**, `code`; plain text gets the same automatic symbol typesetting as MathText. */
export function InlineRich({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('$') && p.endsWith('$') && p.length > 2) return <Tex key={i} tex={p.slice(1, -1)} />;
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}><MathText text={p.slice(2, -2)} /></strong>;
        if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={i} className="kbd">{p.slice(1, -1)}</code>;
        return <MathText key={i} text={p} />;
      })}
    </>
  );
}

/**
 * Markdown-lite renderer for lesson content: paragraphs (blank line), "### " headings,
 * "- " bullet lists, "1. " numbered lists, $$display math$$ blocks.
 */
export function RichText({ text }: { text: string }) {
  // split display math out first so $$…$$ may sit inside a paragraph
  const segments = text.trim().split(/(\$\$[\s\S]+?\$\$)/g);
  const out: ReactNode[] = [];
  segments.forEach((seg, si) => {
    if (seg.startsWith('$$') && seg.endsWith('$$')) {
      out.push(<Tex key={`m${si}`} tex={seg.slice(2, -2)} display />);
      return;
    }
    seg.split(/\n\s*\n/).forEach((b, i) => {
      const t = b.trim();
      if (!t) return;
      const key = `${si}-${i}`;
      if (t.startsWith('### ')) { out.push(<h3 key={key}><InlineRich text={t.slice(4)} /></h3>); return; }
      const lines = t.split('\n');
      if (lines.every((l) => l.trim().startsWith('- '))) {
        out.push(<ul key={key}>{lines.map((l, j) => <li key={j}><InlineRich text={l.trim().slice(2)} /></li>)}</ul>);
        return;
      }
      if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
        out.push(<ol key={key}>{lines.map((l, j) => <li key={j}><InlineRich text={l.trim().replace(/^\d+\.\s/, '')} /></li>)}</ol>);
        return;
      }
      out.push(<p key={key}><InlineRich text={t.replace(/\n/g, ' ')} /></p>);
    });
  });
  return <div className="prose">{out}</div>;
}

// ── Automatic math typesetting for short UI labels ─────────────────────────────────────────────
const GREEK: Record<string, string> = {
  α: '\\alpha', β: '\\beta', γ: '\\gamma', δ: '\\delta', ε: '\\varepsilon', η: '\\eta', θ: '\\theta', λ: '\\lambda', μ: '\\mu', ν: '\\nu',
  ξ: '\\xi', π: '\\pi', ρ: '\\rho', σ: '\\sigma', τ: '\\tau', φ: '\\phi', χ: '\\chi', ψ: '\\psi', ω: '\\omega', Γ: '\\Gamma', Δ: '\\Delta',
  Θ: '\\Theta', Λ: '\\Lambda', Σ: '\\Sigma', Φ: '\\Phi', Ψ: '\\Psi', Ω: '\\Omega',
};
const SUBS: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '-', 'ₛ': 's', 'ₑ': 'e', 'ₓ': 'x', 'ₘ': 'm', 'ₙ': 'n', 'ᵢ': 'i' };
const SYMBOLS: Record<string, string> = { '☉': '\\odot', '⊕': '\\oplus', '★': '\\star', '∞': '\\infty' };
const SUB_CHARS = '₀₁₂₃₄₅₆₇₈₉₊₋ₛₑₓₘₙᵢ';
const SUPS: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
const SUP_CHARS = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺';

/** Unicode Greek/astronomical symbols → TeX commands (a space is added between a command and a following letter). */
export function texSym(s: string): string {
  let out = '';
  let afterCommand = false;
  for (const c of s) {
    const cmd = GREEK[c] ?? SYMBOLS[c];
    if (cmd) { out += cmd; afterCommand = true; continue; }
    if (afterCommand && /[A-Za-z]/.test(c)) out += ' ';
    out += c;
    afterCommand = false;
  }
  return out;
}

/** Convert one auto-detected token (e.g. "C_L1", "μ_R", "Δv₁", "T_eff", "θ₊", "R_p²", "M☉") to TeX. */
export function tokenToTex(tok: string): string {
  // trailing unicode superscripts (R_p², Δv₁²) become ^{…}
  const chars = [...tok];
  let k = chars.length;
  while (k > 0 && SUP_CHARS.includes(chars[k - 1])) k--;
  if (k < chars.length) return `${tokenToTex(chars.slice(0, k).join(''))}^{${chars.slice(k).map((c) => SUPS[c]).join('')}}`;
  const us = tok.indexOf('_');
  let base: string, sub: string;
  if (us > 0) { base = tok.slice(0, us); sub = tok.slice(us + 1); }
  else if (/^[^☉⊕★∞]+[☉⊕★∞]$/u.test(tok)) { base = [...tok].slice(0, -1).join(''); sub = [...tok].slice(-1)[0]; } // M☉ → M_⊙, v∞ → v_∞
  else {
    const k = [...tok].findIndex((c) => SUB_CHARS.includes(c));
    if (k < 0) return texSym(tok);
    const chars = [...tok];
    base = chars.slice(0, k).join('');
    sub = chars.slice(k).map((c) => SUBS[c] ?? c).join('');
  }
  if (sub.startsWith('{') && sub.endsWith('}')) sub = sub.slice(1, -1);
  const plain = /^[0-9+\-]+$/.test(sub) || /^[A-Za-z]$/.test(sub) || [...sub].every((c) => GREEK[c] || SYMBOLS[c]);
  // word subscripts are upright; non-ASCII words (P_thử) go through \text so KaTeX uses the page font
  const subTex = plain ? texSym(sub) : /^[\x20-\x7E]*$/.test(texSym(sub)) ? `\\mathrm{${texSym(sub)}}` : `\\text{${sub}}`;
  return `${texSym(base)}_{${subTex}}`;
}

// a symbol: optional Δ/δ/Σ prefix, one Latin/Greek letter (optional prime), then "_sub", unicode subscripts
// or a symbol used as a subscript (M☉, S⊕, M★, v∞), optionally followed by unicode superscripts (R_p², Δv₁²)
const AUTO = new RegExp(`(?<![\\p{L}\\p{N}_\\\\$])((?:[ΔδΣ])?[A-Za-zα-ωΑ-Ω][′']?(?:_(?:\\{[^}]*\\}|[\\p{L}\\p{N}☉⊕★∞]+)|[${SUB_CHARS}]+|[☉⊕★∞])[${SUP_CHARS}]*)(?![\\p{L}\\p{N}])`, 'gu');
// chemical formulas keep upright unicode subscripts (N₂–H₂O–CO₂), not italic math
const CHEM = new Set(['N₂', 'O₂', 'H₂', 'O₃', 'C₂']);
const LONE_GREEK = /(?<![\p{L}\p{N}\\$])([α-ωΑ-Ω])(?![\p{L}\p{N}])/gu;

/**
 * Short label renderer: explicit `$tex$` is typeset with KaTeX; outside it, subscripted symbols
 * (C_L1, T_eff, μ_R, Δv₁, r₂, θ₊) and lone Greek letters (γ, μ, Ω) are typeset automatically.
 */
export function MathText({ text, auto = true }: { text: string; auto?: boolean }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  const out: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (p.startsWith('$') && p.endsWith('$') && p.length > 2) { out.push(<Tex key={i} tex={p.slice(1, -1)} />); return; }
    if (!auto) { out.push(<Fragment key={i}>{p}</Fragment>); return; }
    const marked = p.replace(AUTO, (tok) => (CHEM.has(tok) ? tok : `\u0000${tokenToTex(tok)}\u0000`)).replace(LONE_GREEK, (g) => `\u0000${GREEK[g]}\u0000`);
    marked.split('\u0000').forEach((seg, j) => {
      if (j % 2 === 1) out.push(<Tex key={`${i}-${j}`} tex={seg} />);
      else if (seg) out.push(<Fragment key={`${i}-${j}`}>{seg}</Fragment>);
    });
  });
  return <>{out}</>;
}

/** Typeset every string among its children (hints, notes and table cells built from JSX). */
export function Typeset({ children }: { children: ReactNode }) {
  return <>{mathify(children)}</>;
}

// Components (besides HTML/SVG elements and fragments) whose children mathify() may descend into.
// Anything else - notably the react-three-fiber <Canvas> tree and drei <Text> - is left untouched.
const CONTAINERS = new WeakSet<object>();
export function typesetsChildren(...components: object[]) {
  for (const c of components) CONTAINERS.add(c);
}
// host elements whose text must stay verbatim
const VERBATIM = new Set(['code', 'pre', 'kbd', 'samp', 'title', 'textarea', 'style', 'script']);

function mapText(node: ReactNode, f: (s: string) => ReactNode): ReactNode {
  if (typeof node === 'string') return f(node);
  if (Array.isArray(node)) return node.map((n, i) => (typeof n === 'string' ? <Fragment key={i}>{f(n)}</Fragment> : n));
  return node;
}

/**
 * Recursively typeset every string inside a React node tree: HTML text gets KaTeX (MathText), SVG
 * <text> gets shifted <tspan> runs, <option> gets unicode sub/superscripts. Keys of list items are kept.
 */
export function mathify(node: ReactNode): ReactNode {
  if (typeof node === 'string') return <MathText text={node} />;
  // keyed list items keep their key; anything else gets a positional fragment key
  if (Array.isArray(node)) return node.map((n, i) => (isValidElement(n) && n.key != null ? mathify(n) : <Fragment key={i}>{mathify(n)}</Fragment>));
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<{ children?: ReactNode }>;
  const kids = el.props.children;
  if (kids === undefined || kids === null || typeof kids === 'function') return el;
  const { type } = el;
  if (typeof type === 'string') {
    if (VERBATIM.has(type)) return el;
    if (type === 'option') return cloneElement(el, undefined, mapText(kids, plainMath));
    if (type === 'text' || type === 'tspan') return cloneElement(el, undefined, mapText(kids, (s) => <SvgRuns text={s} />));
  } else if (type !== Fragment && !CONTAINERS.has(type as object)) return el;
  // pass several children as separate arguments (like JSX) so unkeyed siblings do not warn
  return Array.isArray(kids) ? cloneElement(el, undefined, ...kids.map(mathifyChild)) : cloneElement(el, undefined, mathify(kids));
}

function mathifyChild(n: ReactNode): ReactNode {
  return typeof n === 'string' ? <MathText text={n} /> : mathify(n);
}
