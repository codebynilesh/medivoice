import Reveal from './Reveal.jsx';
import Tilt from './Tilt.jsx';
import { useI18n } from '../i18n.jsx';

const PILLARS = [
  { icon: '🔒', key: 'p1' },
  { icon: '🧩', key: 'p2' },
  { icon: '🛰️', key: 'p3' },
  { icon: '🌐', key: 'p4' },
];

export default function About() {
  const { t } = useI18n();

  return (
    <section className="section" id="about">
      <Reveal>
        <div className="section-head">
          <span className="eyebrow">{t('about.eyebrow')}</span>
          <h2>{t('about.title')}</h2>
          <p className="section-sub">{t('about.sub')}</p>
        </div>
      </Reveal>

      <div className="pillars">
        {PILLARS.map((p, i) => (
          <Reveal key={p.key} delay={i * 80}>
            <Tilt className="pillar glass" max={6}>
              <span className="pillar-icon">{p.icon}</span>
              <h3>{t(`about.${p.key}t`)}</h3>
              <p>{t(`about.${p.key}b`)}</p>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
