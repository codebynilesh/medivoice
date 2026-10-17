import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer className="site-footer glass">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <span className="brand-mark">M</span>
            <span className="brand-name">Medivoice</span>
          </div>
          <p className="muted small">{t('footer.tagline')}</p>
        </div>

        <div className="footer-col">
          <h4>{t('footer.product')}</h4>
          <a href="#home">{t('nav.home')}</a>
          <a href="#how">{t('nav.how')}</a>
          <a href="#about">{t('nav.about')}</a>
        </div>

        <div className="footer-col">
          <h4>{t('footer.developers')}</h4>
          <a href={`${api.baseUrl}/api/v1/health`} target="_blank" rel="noopener noreferrer">
            {t('footer.health')}
          </a>
          <a href={`${api.baseUrl}/api/v1/ai/capabilities`} target="_blank" rel="noopener noreferrer">
            {t('footer.capabilities')}
          </a>
          <a href={`${api.baseUrl}`} target="_blank" rel="noopener noreferrer">
            {t('footer.apiBase')}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} Medivoice</span>
        <span className="muted small">{t('footer.disclaimer')}</span>
      </div>
    </footer>
  );
}
