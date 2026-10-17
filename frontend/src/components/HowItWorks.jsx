import Reveal from './Reveal.jsx';
import Tilt from './Tilt.jsx';
import { useI18n } from '../i18n.jsx';

const STEPS = [
  { n: '01', key: 's1', icon: '🛡️' },
  { n: '02', key: 's2', icon: '🛰️' },
  { n: '03', key: 's3', icon: '🌐' },
  { n: '04', key: 's4', icon: '🔊' },
];

export default function HowItWorks() {
  const { t } = useI18n();

  return (
    <section className="section" id="how">
      <Reveal>
        <div className="section-head">
          <span className="eyebrow">{t('how.eyebrow')}</span>
          <h2>{t('how.title')}</h2>
          <p className="section-sub">{t('how.sub')}</p>
        </div>
      </Reveal>

      <div className="steps">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 90}>
            <Tilt className="step-card glass" max={7}>
              <div className="step-top">
                <span className="step-icon">{s.icon}</span>
                <span className="step-n">
                  {t('how.step')} {s.n}
                </span>
              </div>
              <h3>{t(`how.${s.key}t`)}</h3>
              <p>{t(`how.${s.key}b`)}</p>
              <span className="step-line" aria-hidden="true" />
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
