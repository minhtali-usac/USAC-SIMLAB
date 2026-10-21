import type { L, LList } from '../i18n';

export type Fidelity = 'A' | 'B' | 'C';
export type Group = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Activity {
  title: L;
  text: L;
  /** URL parameters applied when the learner clicks "try". */
  params?: Record<string, string | number | boolean>;
}

export interface QuizQuestion {
  q: L;
  options: L[];
  answer: number;
  explain: L;
}

export interface Lesson {
  objectives: LList;
  durationMin: number;
  prerequisites: L;
  /** Background pages: markdown-lite with $inline$ and $$display$$ TeX, **bold**, "- " lists, "### " headings. */
  background: { title: L; body: L }[];
  activities: Activity[];
  quiz: QuizQuestion[];
  instructor?: L;
}

export interface ModelCard {
  /** Fidelity of each part of the module (brief §5). `body` adds an explanatory paragraph. */
  parts: { label: L; fidelity: Fidelity; body?: L }[];
  /** Note under the fidelity block (e.g. that A/B/C is an internal SimLab scale). */
  fidelityNote?: L;
  /** Methods with explanation; when present it replaces the bare equation list. */
  methods?: { title: L; tex: string[]; body: L }[];
  /** Free-text scope paragraph shown with the validity list. */
  scope?: L;
  /** Free-text validation summary (measured errors, scope of the check). */
  validationText?: L;
  /** TeX equations. */
  equations: string[];
  assumptions: LList;
  validity: LList;
  errors: LList;
  validation: LList;
  limitations: LList;
  references: string[];
}

export interface ModuleMeta {
  id: string;
  code: string;
  group: Group;
  title: L;
  summary: L;
  fidelity: Fidelity;
  tags?: string[];
  /** true → implemented; false → listed as roadmap. */
  ready: boolean;
  /** External companion app (opens in a new tab instead of the built-in module). */
  href?: string;
  load?: () => Promise<{ default: React.ComponentType }>;
}
