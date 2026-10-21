import { describe, it, expect } from 'vitest';
import { tokenToTex, texSym } from './Tex';
import { sci, fmt } from '../i18n';
import { mathRuns, plainMath } from '../lib/mathRuns';

describe('automatic label typesetting', () => {
  it.each([
    ['C_L1', 'C_{\\mathrm{L1}}'], ['T_eff', 'T_{\\mathrm{eff}}'], ['μ_R', '\\mu_{R}'], ['Δv₁', '\\Delta v_{1}'], ['r₂', 'r_{2}'],
    ['θ₊', '\\theta_{+}'], ['θ_E', '\\theta_{E}'], ['v_esc', 'v_{\\mathrm{esc}}'], ['M_V', 'M_{V}'], ['Ω_k', '\\Omega_{k}'], ['T₁₄', 'T_{14}'], ['rₛ', 'r_{s}'],
    ['R_p²', 'R_{p}^{2}'], ['Δv₁²', '\\Delta v_{1}^{2}'], ['Ω_Λ', '\\Omega_{\\Lambda}'], ['σ₈', '\\sigma_{8}'],
    ['P_thử', 'P_{\\text{thử}}'],
    ['M☉', 'M_{\\odot}'], ['S⊕', 'S_{\\oplus}'], ['M★', 'M_{\\star}'], ['R_★', 'R_{\\star}'], ['v∞', 'v_{\\infty}'], ['ν∞', '\\nu_{\\infty}'],
  ])('%s → %s', (a, b) => expect(tokenToTex(a)).toBe(b));
  it('symbol table', () => expect(texSym('M☉')).toBe('M\\odot'));
});

describe('canvas / SVG sub- and superscript runs', () => {
  const show = (s: string) => mathRuns(s).map((r) => (r.k === 'n' ? r.t : `${r.k}(${r.t})`)).join('');
  it.each([
    ['T_eff = 5780 K', 'Tsub(eff) = 5780 K'],
    ['Ω_m-Ω_Λ', 'Ωsub(m)-Ωsub(Λ)'],
    ['σ₈ = 0,81', 'σsub(8) = 0,81'],
    ['1,5 × 10⁻⁹', '1,5 × 10sup(−9)'],
    ['P = a^1.5/√(M+m)', 'P = asup(1.5)/√(M+m)'],
    ['x_{max}', 'xsub(max)'],
    ['a_max.', 'asub(max).'],
    ['Đơn vị θ_E', 'Đơn vị θsub(E)'],
    ['1 M☉ · 0,3 S⊕', '1 Msub(☉) · 0,3 Ssub(⊕)'],
    ['★ sao', '★ sao'],
    ['plain text, no math', 'plain text, no math'],
  ])('%s', (a, b) => expect(show(a)).toBe(b));

  it('plain-text form uses unicode only where every character exists', () => {
    expect(plainMath('Ω_m')).toBe('Ωₘ');
    expect(plainMath('σ₈ = 0,8')).toBe('σ₈ = 0,8');
    expect(plainMath('P_GLS = 3 d')).toBe('P GLS = 3 d');
    expect(plainMath('a^1.5')).toBe('a^1.5');
    expect(plainMath('r^2')).toBe('r²');
    expect(plainMath('Sgr A* (4,3×10⁶ M☉)')).toBe('Sgr A* (4,3×10⁶ M☉)');
  });
});

describe('human-readable numbers (no "e" notation)', () => {
  it('powers of ten with locale decimal separator', () => {
    expect(sci(2.6e-9, 2, 'vi')).toBe('2,6 × 10⁻⁹');
    expect(sci(2.6e-9, 2, 'en')).toBe('2.6 × 10⁻⁹');
    expect(sci(1e-8, 1, 'vi')).toBe('10⁻⁸');
    expect(sci(9.96e-5, 2, 'vi')).toBe('10⁻⁴');
    expect(sci(-3.2e12, 2, 'en')).toBe('−3.2 × 10¹²');
  });
  it('plain digits with thousands separators below 10⁹', () => {
    expect(fmt(149597871, 0, 'vi')).toBe('149.597.871');
    expect(fmt(1.5e12, 2, 'vi')).toBe('1,5 × 10¹²');
    for (const x of [1e-12, 3.3e-7, 4e15]) expect(fmt(x, 3, 'en')).not.toMatch(/e/i);
  });
});
