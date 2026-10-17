import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { LANGUAGES, useI18n } from '../i18n.jsx';

export default function TranslateView({ onError, defaultText }) {
  const { lang, t } = useI18n();
  const [text, setText] = useState(defaultText || '');
  const [target, setTarget] = useState(lang === 'en' ? 'hi' : lang);
  const [source, setSource] = useState('en');
  const [state, setState] = useState({ loading: false, result: null, error: null });

  useEffect(() => {
    if (defaultText) setText(defaultText);
  }, [defaultText]);

  useEffect(() => {
    setTarget(lang === 'en' ? 'hi' : lang);
  }, [lang]);

  const sameLang = source === target;

  async function run() {
    if (!text.trim() || sameLang) return;
    setState({ loading: true, result: null, error: null });
    try {
      const result = await api.translate(text, target, source);
      setState({ loading: false, result, error: null });
    } catch (err) {
      setState({ loading: false, result: null, error: err.message });
      onError && onError(err.message);
    }
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <label>
          {t('tr.from')}
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('tr.to')}
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn"
          onClick={run}
          disabled={state.loading || !text.trim() || sameLang}
        >
          {state.loading ? t('tr.translating') : t('tr.translate')}
        </button>
      </div>

      {sameLang && <p className="muted small">{t('tr.sameLang')}</p>}
      {state.error && <div className="alert alert-error">{state.error}</div>}

      <div className="two-col">
        <section className="card">
          <h3>{t('tr.source')}</h3>
          <textarea
            rows={10}
            placeholder={t('tr.sourcePlaceholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </section>
        <section className="card">
          <h3>{t('tr.result')}</h3>
          {state.result ? (
            <>
              <p className="translated">{state.result.translated_text}</p>
              {state.result.preserved_terms &&
                state.result.preserved_terms.length > 0 && (
                  <>
                    <p className="muted small">{t('tr.preserved')}</p>
                    <ul className="pill-list">
                      {state.result.preserved_terms.map((term, i) => (
                        <li className="pill" key={i}>
                          {term}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
            </>
          ) : (
            <p className="muted">{t('tr.willAppear')}</p>
          )}
        </section>
      </div>
    </div>
  );
}
