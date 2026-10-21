import { useId, type ReactNode } from 'react';
import { MathText, typesetsChildren } from './Tex';
import { plainMath } from '../lib/mathRuns';

/** Strings are typeset (explicit $tex$ + automatic subscripts/Greek); other nodes pass through. */
const M = (x: ReactNode) => (typeof x === 'string' ? <MathText text={x} /> : x);

export function Section({ title, children, open = true, dot }: { title: string; children: ReactNode; open?: boolean; dot?: string }) {
  return (
    <details className="panel-section" open={open}>
      <summary>
        {dot && <span className="dot" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />}
        {M(title)}
      </summary>
      <div className="panel-content">{children}</div>
    </details>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  /** Display string for the value (defaults to the number). */
  display?: string;
  hint?: string;
  /** Logarithmic slider mapping (min, max > 0). */
  log?: boolean;
  disabled?: boolean;
}

export function Slider({ label, value, min, max, step, onChange, display, hint, log, disabled }: SliderProps) {
  const id = useId();
  const toPos = (v: number) => (log ? (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min)) : (v - min) / (max - min));
  const fromPos = (p: number) => (log ? Math.exp(Math.log(min) + p * (Math.log(max) - Math.log(min))) : min + p * (max - min));
  const pos = Math.min(1, Math.max(0, toPos(value)));
  const resolution = 1000;
  return (
    <div className="field">
      <div className="field-head">
        <label htmlFor={id}>{M(label)}</label>
        <span className="val" aria-live="polite">{display !== undefined ? M(display) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        disabled={disabled}
        min={log ? 0 : min}
        max={log ? resolution : max}
        step={log ? 1 : step ?? (max - min) / 200}
        value={log ? Math.round(pos * resolution) : value}
        style={{ ['--pct' as string]: `${pos * 100}%` }}
        aria-valuetext={display !== undefined ? plainMath(display) : undefined}
        onChange={(e) => {
          const raw = Number(e.target.value);
          let v = log ? fromPos(raw / resolution) : raw;
          if (log && step) v = Math.round(v / step) * step;
          onChange(v);
        }}
      />
      {hint && <div className="field-hint">{M(hint)}</div>}
    </div>
  );
}

export function Toggle({ label, checked, onChange, swatch }: { label: string; checked: boolean; onChange: (v: boolean) => void; swatch?: string }) {
  return (
    <label className="toggle">
      <span>{swatch && <span className="swatch" style={{ background: swatch }} />}{M(label)}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange, small, ariaLabel }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; small?: boolean; ariaLabel?: string }) {
  return (
    <div className={`segmented${small ? ' small' : ''}`} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{M(o.label)}</button>
      ))}
    </div>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: { label?: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="field">
      {label && <div className="field-head"><label htmlFor={id}>{M(label)}</label></div>}
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.value} value={o.value}>{plainMath(o.label)}</option>)}
      </select>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="field">
      <div className="field-head"><label>{M(label)}</label></div>
      {children}
      {hint && <div className="field-hint">{M(hint)}</div>}
    </div>
  );
}

export function Readout({ k, v, unit, frame, wide, tone, title }: { k: ReactNode; v: ReactNode; unit?: ReactNode; frame?: ReactNode; wide?: boolean; tone?: 'good' | 'bad' | 'accent'; title?: string }) {
  return (
    <div className={`readout${wide ? ' wide' : ''}${tone ? ` ${tone}` : ''}`} title={typeof title === 'string' ? plainMath(title) : undefined}>
      <div className="k">{M(k)}</div>
      <div className="v">{M(v)}{unit && <small>{M(unit)}</small>}</div>
      {frame && <div className="frame">{M(frame)}</div>}
    </div>
  );
}

export function Readouts({ children }: { children: ReactNode }) {
  return <div className="readouts" aria-live="off">{children}</div>;
}

// containers whose children mathify() may typeset (other components render their own props)
typesetsChildren(Section, Field, Readouts);
