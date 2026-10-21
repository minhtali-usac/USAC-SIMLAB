import { useT } from '../i18n';
import { Icon } from './Icon';
import { Tex, RichText, InlineRich } from './Tex';
import { FidelityBadge } from './FidelityBadge';
import type { ModelCard, ModuleMeta } from '../modules/types';

export function ModelCardDialog({ meta, card, onClose }: { meta: ModuleMeta; card: ModelCard; onClose: () => void }) {
  const { t, tx, lang } = useT();
  const list = (items: string[]) => <ul>{items.map((x, i) => <li key={i}><InlineRich text={x} /></li>)}</ul>;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="dialog" role="dialog" aria-modal="true" aria-label={t('modelCard')}>
        <div className="dialog-head">
          <Icon name="info" size={20} />
          <h2>{t('modelCard')} · {meta.code} - {tx(meta.title)}</h2>
          <span style={{ flex: 1 }} />
          <button className="icon-btn" onClick={onClose} aria-label={t('close')}><Icon name="close" /></button>
        </div>
        <div className="dialog-body">
          <div className="mc-grid">
            <div className="mc-block full">
              <h4>{t('mcFidelity')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {card.parts.map((p, i) => (
                  <div key={i} className="mc-layer">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5 }}>
                      <FidelityBadge level={p.fidelity} short />
                      <strong><InlineRich text={tx(p.label)} /></strong>
                    </div>
                    {p.body && <RichText text={tx(p.body)} />}
                  </div>
                ))}
              </div>
              {card.fidelityNote && <p className="mc-note"><InlineRich text={tx(card.fidelityNote)} /></p>}
            </div>
            <div className="mc-block full">
              <h4>{card.methods ? tx({ vi: 'Phương pháp và công thức', en: 'Methods and formulas' }) : t('mcEquations')}</h4>
              {card.methods ? (
                card.methods.map((m, i) => (
                  <div key={i} className="mc-method">
                    <h5><InlineRich text={tx(m.title)} /></h5>
                    <div className="prose">{m.tex.map((e, j) => <Tex key={j} tex={e} display />)}</div>
                    <RichText text={tx(m.body)} />
                  </div>
                ))
              ) : (
                <div className="prose">{card.equations.map((e, i) => <Tex key={i} tex={e} display />)}</div>
              )}
            </div>
            <div className="mc-block"><h4>{t('mcAssumptions')}</h4>{list(card.assumptions[lang])}</div>
            <div className="mc-block">
              <h4>{t('mcValidity')}</h4>
              {list(card.validity[lang])}
              {card.scope && <RichText text={tx(card.scope)} />}
            </div>
            <div className="mc-block full">
              <h4>{tx({ vi: 'Kiểm chứng và sai số', en: 'Validation and errors' })}</h4>
              {card.validationText && <RichText text={tx(card.validationText)} />}
              {list(card.validation[lang])}
              {card.errors[lang].length > 0 && list(card.errors[lang])}
            </div>
            <div className="mc-block full"><h4>{t('mcLimitations')}</h4>{list(card.limitations[lang])}</div>
            <div className="mc-block full"><h4>{t('mcReferences')}</h4>{list(card.references)}</div>
          </div>
        </div>
      </div>
    </>
  );
}
