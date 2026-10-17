import { useEffect, useState } from 'react';
import HealthBadge from './HealthBadge.jsx';
import LanguageSelect from './LanguageSelect.jsx';
import { useI18n } from '../i18n.jsx';

export default function Navbar({ onUploadClick }) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#home', label: t('nav.home') },
    { href: '#how', label: t('nav.how') },
    { href: '#about', label: t('nav.about') },
  ];

  return (
    <header className={`navbar glass ${scrolled ? 'scrolled' : ''}`}>
      <a className="brand" href="#home" onClick={() => setOpen(false)}>
        <span className="brand-mark">M</span>
        <span className="brand-text">
          <span className="brand-name">Medivoice</span>
          <span className="brand-sub">{t('brand.sub')}</span>
        </span>
      </a>

      <nav className={`nav-links ${open ? 'open' : ''}`}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </nav>

      <div className="nav-right">
        <HealthBadge />
        <LanguageSelect />
        <button
          className="btn btn-sm"
          onClick={() => {
            setOpen(false);
            onUploadClick && onUploadClick();
          }}
        >
          {t('nav.upload')}
        </button>
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
