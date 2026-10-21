import { mathRuns, RUN_SCALE, RUN_SHIFT } from '../lib/mathRuns';

/** SVG <text> content with real subscripts/superscripts (KaTeX HTML cannot live inside SVG text). */
export function SvgRuns({ text }: { text: string }) {
  const runs = mathRuns(text);
  if (runs.length === 1 && runs[0].k === 'n') return <>{text}</>;
  let shift = 0; // current baseline offset in base-font em
  return (
    <>
      {runs.map((r, i) => {
        const target = RUN_SHIFT[r.k];
        const scale = RUN_SCALE[r.k];
        // dy is measured in the tspan's own (scaled) em
        const dy = (target - shift) / scale;
        shift = target;
        return <tspan key={i} dy={dy ? `${dy.toFixed(3)}em` : undefined} fontSize={scale === 1 ? undefined : `${scale * 100}%`}>{r.t}</tspan>;
      })}
    </>
  );
}
