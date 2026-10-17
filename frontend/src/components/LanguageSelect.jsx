import { LANGUAGES, useI18n } from '../i18n.jsx';

export default function LanguageSelect() {
  const { lang, setLang, t } = useI18n();

  return (
    <label className="lang-select" title={t('nav.language')}>
      <span className="lang-globe" aria-hidden="true">
        🌐
      </span>
      <select
        value={lang}
        aria-label={t('nav.language')}
        onChange={(e) => setLang(e.target.value)}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}
