import { useRef } from 'react';
import UploadPanel from './UploadPanel.jsx';
import { useI18n } from '../i18n.jsx';

export default function Hero({ onUpload, busy, error, lastUpload, onViewResult }) {
  const anchorRef = useRef(null);
  const { t } = useI18n();

  const trust = [t('hero.trust1'), t('hero.trust2'), t('hero.trust3')];

  return (
    <section className="hero-section" id="home" ref={anchorRef}>
      <div className="hero-glow" aria-hidden="true" />

      <div className="hero-copy">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> {t('hero.eyebrow')}
        </span>
        <h1 className="hero-title">
          {t('hero.title1')}
          <span className="grad-text">{t('hero.title2')}</span>
        </h1>
        <p className="hero-sub">{t('hero.sub')}</p>

        <ul className="trust-row">
          {trust.map((item) => (
            <li key={item}>
              <span className="tick">✓</span> {item}
            </li>
          ))}
        </ul>

        <div className="hero-stats">
          <Stat value="8-node" label={t('hero.stat1')} />
          <Stat value="Hybrid" label={t('hero.stat2')} />
          <Stat value="3" label={t('hero.stat3')} />
        </div>
      </div>

      <div className="hero-upload" id="upload">
        <div className="upload-card glass">
          <div className="upload-card-head">
            <h3>{t('hero.cardTitle')}</h3>
            <span className="badge-soft">{t('hero.badge')}</span>
          </div>
          <UploadPanel onUpload={onUpload} busy={busy} error={error} />

          {lastUpload && (
            <div className={`upload-decision decision-${lastUpload.status}`}>
              <span className="decision-chip">{lastUpload.status}</span>
              <span className="decision-text">{lastUpload.message}</span>
              {lastUpload.status !== 'REJECTED' && (
                <button className="btn btn-sm" onClick={onViewResult}>
                  {t('hero.viewResult')}
                </button>
              )}
            </div>
          )}

          <p className="upload-foot">{t('hero.foot')}</p>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
