import { useState } from 'react';
import { useT } from '../i18n';
import { setParams } from '../lib/router';
import { Icon } from './Icon';
import { RichText, InlineRich as RichTextInline } from './Tex';
import type { Lesson, ModuleMeta } from '../modules/types';

type Tab = 'intro' | 'background' | 'try' | 'quiz' | 'resources';

export function LessonDrawer({ meta, lesson, onClose }: { meta: ModuleMeta; lesson: Lesson; onClose: () => void }) {
  const { t, tx, lang } = useT();
  const [tab, setTab] = useState<Tab>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = lesson.quiz.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'intro', label: t('tabIntro') },
    { id: 'background', label: t('tabBackground') },
    { id: 'try', label: t('tabTry') },
    { id: 'quiz', label: t('tabQuiz') },
    { id: 'resources', label: t('tabResources') },
  ];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t('lesson')}>
        <div className="drawer-head">
          <span className="chip code-chip" style={{ color: `var(--grp${meta.group})`, borderColor: `var(--grp${meta.group})` }}>{meta.code}</span>
          <h2>{tx(meta.title)}</h2>
          <span style={{ flex: 1 }} />
          <button className="icon-btn" onClick={onClose} aria-label={t('close')}><Icon name="close" /></button>
        </div>
        <div className="drawer-tabs" role="tablist">
          {tabs.map((x) => (
            <button key={x.id} role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}>{x.label}</button>
          ))}
        </div>
        <div className="drawer-body">
          {tab === 'intro' && (
            <div className="prose">
              <p><RichTextInline text={tx(meta.summary)} /></p>
              <h3>{t('objectives')}</h3>
              <ul>{lesson.objectives[lang].map((o, i) => <li key={i}><RichTextInline text={o} /></li>)}</ul>
              <p><strong>{t('duration')}:</strong> ~{lesson.durationMin} {t('minutes')}</p>
              <p><strong>{t('prerequisites')}:</strong> <RichTextInline text={tx(lesson.prerequisites)} /></p>
              <p className="hint-box">{t('keyboardHint')}</p>
            </div>
          )}
          {tab === 'background' && lesson.background.map((b, i) => (
            <section key={i} style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>{i + 1}. <RichTextInline text={tx(b.title).replace(/^\d+\.\s*/, '')} /></h3>
              <RichText text={tx(b.body)} />
            </section>
          ))}
          {tab === 'try' && lesson.activities.map((a, i) => (
            <div className="activity" key={i}>
              <h4><span className="n">{i + 1}</span><RichTextInline text={tx(a.title)} /></h4>
              <RichText text={tx(a.text)} />
              {a.params && (
                <button className="btn small" onClick={() => { setParams(a.params!); onClose(); }}>
                  <Icon name="flask" />{t('applyActivity')}
                </button>
              )}
            </div>
          ))}
          {tab === 'quiz' && (
            <div>
              {lesson.quiz.map((q, i) => (
                <div className="quiz-q" key={i}>
                  <h4>{i + 1}. <RichTextInline text={tx(q.q)} /></h4>
                  {q.options.map((o, j) => {
                    const chosen = answers[i] === j;
                    const cls = answers[i] === undefined ? '' : j === q.answer ? ' right' : chosen ? ' wrong' : '';
                    return (
                      <button key={j} className={`quiz-opt${cls}`} onClick={() => setAnswers({ ...answers, [i]: j })} aria-pressed={chosen}>
                        {String.fromCharCode(65 + j)}. <RichTextInline text={tx(o)} />
                      </button>
                    );
                  })}
                  {answers[i] !== undefined && (
                    <div className="quiz-explain">
                      <strong>{answers[i] === q.answer ? t('correct') : t('incorrect')}</strong> <RichTextInline text={tx(q.explain)} />
                    </div>
                  )}
                </div>
              ))}
              <p className="hint-box">{t('score')}: <b className="num">{score}/{lesson.quiz.length}</b></p>
            </div>
          )}
          {tab === 'resources' && (
            <div className="prose">
              <button className="btn small no-print" onClick={() => window.print()}><Icon name="printer" />{t('printWorksheet')}</button>
              {lesson.instructor && (
                <>
                  <h3 style={{ marginTop: 18 }}>{t('instructorNotes')}</h3>
                  <RichText text={tx(lesson.instructor)} />
                </>
              )}
              <h3 style={{ marginTop: 18 }}>{t('tabTry')}</h3>
              <ol>{lesson.activities.map((a, i) => <li key={i}><strong><RichTextInline text={tx(a.title)} /></strong> - <RichTextInline text={tx(a.text)} /></li>)}</ol>
              <h3>{t('tabQuiz')}</h3>
              <ol>{lesson.quiz.map((q, i) => <li key={i}><RichTextInline text={tx(q.q)} /></li>)}</ol>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
