import { useRef } from 'react';
import { conicState } from '@usac/sim-core';
import { useT } from '../i18n';
import { MODULES, GROUPS } from '../modules/registry';
import { FidelityBadge } from '../components/FidelityBadge';
import { Thumb } from '../components/Thumb';
import { IMAGES } from '../modules/images';
import { Icon } from '../components/Icon';
import { MathText } from '../components/Tex';
import { SiteFooter } from '../components/SiteFooter';
import { useAnimationFrame, useCanvas2D, usePrefersReducedMotion } from '../lib/hooks';

/** Fixed, full-page decorative star field with gentle twinkle. */
function StarBackdrop() {
  const reduce = usePrefersReducedMotion();
  const stars = useRef<{ x: number; y: number; r: number; p: number; s: number }[]>([]);
  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    if (stars.current.length === 0) {
      let seed = 11;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      stars.current = Array.from({ length: 420 }, () => ({ x: rnd(), y: rnd(), r: rnd() ** 3 * 1.6 + 0.3, p: rnd() * 6.28, s: 0.4 + rnd() * 1.5 }));
    }
    ctx.clearRect(0, 0, w, h);
    if (document.documentElement.dataset.theme === 'light') return;
    const t = performance.now() / 1000;
    for (const s of stars.current) {
      const a = 0.35 + 0.35 * Math.sin(t * s.s + s.p);
      ctx.fillStyle = `rgba(210,220,255,${a})`;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, 6.283);
      ctx.fill();
    }
  });
  useAnimationFrame(() => redraw(), !reduce);
  return <canvas ref={canvasRef} className="home-bg" style={{ width: '100vw', height: '100vh' }} aria-hidden />;
}

/** Hero: a genuine Kepler orbit (e = 0.6) with equal-time swept areas - Kepler's 2nd law. */
function HeroOrbit() {
  const reduce = usePrefersReducedMotion();
  const tRef = useRef(0.8);
  const { canvasRef, redraw } = useCanvas2D((ctx, { w, h }) => {
    ctx.clearRect(0, 0, w, h);
    const e = 0.6, q = 1, a = q / (1 - e), b = a * Math.sqrt(1 - e * e);
    const P = 2 * Math.PI * Math.sqrt(a ** 3);
    const scale = (Math.min(w, h) * 0.46) / a;
    // ellipse centred in the canvas; the focus (Sun) sits at +ae from the centre
    const cy = h / 2;
    const X = (s: { x: number }) => w / 2 + (s.x + a * e) * scale;
    const Y = (s: { y: number }) => cy - s.y * scale;
    const sunX = X({ x: 0 }), sunY = cy;
    const light = document.documentElement.dataset.theme === 'light';
    // swept sectors
    const nSect = 8;
    for (let k = 0; k < nSect; k++) {
      const t0 = (k * P) / nSect, t1 = t0 + P / nSect / 2.2;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      for (let i = 0; i <= 24; i++) { const s = conicState(q, e, 1, t0 + ((t1 - t0) * i) / 24); ctx.lineTo(X(s), Y(s)); }
      ctx.closePath();
      ctx.fillStyle = k % 2 ? 'rgba(124,156,255,0.16)' : 'rgba(167,139,250,0.16)';
      ctx.fill();
    }
    // orbit
    ctx.beginPath();
    ctx.ellipse(w / 2, cy, a * scale, b * scale, 0, 0, Math.PI * 2);
    ctx.strokeStyle = light ? 'rgba(66,85,212,0.6)' : 'rgba(160,180,255,0.55)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // sun glow
    const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 46);
    g.addColorStop(0, '#fff7d6'); g.addColorStop(0.18, '#fbbf24'); g.addColorStop(0.45, 'rgba(251,191,36,0.25)'); g.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sunX, sunY, 46, 0, 6.283); ctx.fill();
    // planet + trail
    const t = tRef.current;
    for (let i = 30; i >= 0; i--) {
      const s = conicState(q, e, 1, t - i * 0.03);
      ctx.fillStyle = `rgba(94,234,212,${(1 - i / 30) * 0.6})`;
      ctx.beginPath(); ctx.arc(X(s), Y(s), 2.2, 0, 6.283); ctx.fill();
    }
    const s = conicState(q, e, 1, t);
    ctx.beginPath(); ctx.arc(X(s), Y(s), 6, 0, 6.283); ctx.fillStyle = '#5eead4'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(X(s), Y(s)); ctx.strokeStyle = 'rgba(94,234,212,0.35)'; ctx.stroke();
    // velocity vector
    const vs = 18;
    ctx.beginPath(); ctx.moveTo(X(s), Y(s)); ctx.lineTo(X(s) + s.vx * vs, Y(s) - s.vy * vs); ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 2; ctx.stroke();
  });
  useAnimationFrame((dt) => { tRef.current += dt * 0.9; redraw(); }, !reduce);
  return <canvas ref={canvasRef} aria-label="Kepler orbit animation" role="img" />;
}

/** Number of automated tests in `npm test` (update when tests are added). */
export const PHYSICS_TESTS = 247;

export function Home() {
  const { t, tx } = useT();
  const ready = MODULES.filter((m) => m.ready).length;
  return (
    <div className="home">
      <StarBackdrop />
      <section className="hero">
        <div>
          <div className="hero-kicker">USAC Astronomy Simulation Laboratory</div>
          <h1>
            {tx({ vi: 'Phòng thí nghiệm', en: 'The virtual' })}{' '}
            <span className="grad">{tx({ vi: 'thiên văn ảo', en: 'astronomy lab' })}</span>
          </h1>
          <p className="lead">
            {tx({
              vi: 'Chơi như một trò chơi, chính xác như một giáo trình. Mô phỏng tương tác từ chuyển động Mặt Trời đến lỗ đen - dữ liệu thật, phương trình thật, sai số được ghi rõ.',
              en: 'Play like a game, precise like a textbook. Interactive simulations from the Sun’s motion to black holes - real data, real equations, stated errors.',
            })}
          </p>
          <div className="hero-cta">
            <a className="btn primary" href="#/m/b1"><Icon name="play" />{t('startGolden')}</a>
            <a className="btn" href="#catalog" onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}>{t('allModules')}<Icon name="arrowR" /></a>
          </div>
          <div className="hero-stats">
            <div><b>{ready}</b>{t('modulesReady')}</div>
            <div><b>{PHYSICS_TESTS}</b>{t('physicsTests')}</div>
            <div><b>2</b>{t('languages')}</div>
            <div><b>0</b>{t('noLogin')}</div>
          </div>
        </div>
        <div className="hero-visual"><HeroOrbit /></div>
      </section>

      <section className="pillars">
        {GROUPS.map((g) => (
          <div className="pillar" key={g.id}>
            <div className="bar" style={{ background: `var(--grp${g.id})` }} />
            <h3>{tx(g.title)}</h3>
            <p>{tx(g.blurb)}</p>
          </div>
        ))}
      </section>

      <section className="catalog" id="catalog">
        <div className="catalog-head">
          <h2>{t('allModules')}</h2>
          <div className="row" style={{ gap: 6 }}>
            <FidelityBadge level="A" short /><FidelityBadge level="B" short /><FidelityBadge level="C" short />
          </div>
        </div>
        {GROUPS.map((g) => {
          const mods = MODULES.filter((m) => m.group === g.id);
          return (
            <div key={g.id}>
              <div className="group-title">
                <span className="gl" style={{ background: `var(--grp${g.id})` }}>{g.id}</span>
                {tx(g.title)}
              </div>
              <div className="grid">
                {mods.filter((m) => m.ready).map((m) => {
                  const img = IMAGES[m.id];
                  const external = !!m.href;
                  return (
                    <div key={m.id} className={`card${external ? ' external' : ''}`}>
                      <div className="thumb">
                        {img ? (
                          <img src={img.src} alt={tx(img.caption)} loading="lazy" decoding="async" style={{ objectPosition: img.pos }} />
                        ) : (
                          <Thumb id={m.id} />
                        )}
                        {img && (
                          <span className="thumb-credit" title={`${tx(img.caption)} - ${img.credit} · ${img.license}`}>
                            © {img.credit.split(',')[0]} · {img.license}
                          </span>
                        )}
                        {external && <span className="thumb-badge">AstroSphere ↗</span>}
                      </div>
                      <div className="body">
                        <div className="meta">
                          <span className="chip code-chip" style={{ color: `var(--grp${m.group})`, borderColor: `var(--grp${m.group})` }}>{m.code}{m.tags?.length ? ` · ${m.tags.join(' ')}` : ''}</span>
                          <FidelityBadge level={m.fidelity} short />
                        </div>
                        <h3>{tx(m.title)}</h3>
                        <p><MathText text={tx(m.summary)} /></p>
                        {img && <p className="card-caption">{tx(img.caption)}</p>}
                        {external && (
                          <a className="card-alt" href={`#/m/${m.id}`}>
                            {tx({ vi: 'Hoặc mở bản rút gọn trong SimLab →', en: 'Or open the compact SimLab version →' })}
                          </a>
                        )}
                      </div>
                      <a
                        className="card-link"
                        href={external ? m.href : `#/m/${m.id}`}
                        {...(external ? { target: '_blank', rel: 'noopener' } : {})}
                        aria-label={`${m.code} ${tx(m.title)}${external ? ' (AstroSphere)' : ''}`}
                      />
                    </div>
                  );
                })}
                {mods.filter((m) => !m.ready).map((m) => (
                  <div key={m.id} className="card soon" aria-disabled>
                    <div className="body">
                      <div className="meta">
                        <span className="chip code-chip">{m.code}</span>
                        <span className="chip">{t('comingSoon')}</span>
                      </div>
                      <h3>{tx(m.title)}</h3>
                      <p><MathText text={tx(m.summary)} /></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
      <SiteFooter />
    </div>
  );
}
