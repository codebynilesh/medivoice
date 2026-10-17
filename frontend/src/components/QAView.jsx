import { useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';

function statusLabel(status, t) {
  switch (status) {
    case 'ANSWERED':
      return t('qa.statusAnswered');
    case 'INSUFFICIENT_EVIDENCE':
    case 'INSUFFICIENT_CONTEXT':
      return t('qa.statusInsufficient');
    case 'RESTRICTED':
    case 'BLOCKED':
      return t('qa.statusRestricted');
    default:
      return status;
  }
}

export default function QAView({ documentId, onError }) {
  const { lang, t } = useI18n();
  const [question, setQuestion] = useState('');
  const [state, setState] = useState({ loading: false, answer: null, error: null });

  async function submit(e) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3) return;
    setState({ loading: true, answer: null, error: null });
    try {
      const answer = await api.askQuestion(documentId, q, lang);
      setState({ loading: false, answer, error: null });
    } catch (err) {
      setState({ loading: false, answer: null, error: err.message });
      onError && onError(err.message);
    }
  }

  return (
    <div className="stack">
      <form className="qa-form" onSubmit={submit}>
        <input
          type="text"
          placeholder={t('qa.placeholder')}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          minLength={3}
          required
        />
        <button className="btn" type="submit" disabled={state.loading}>
          {state.loading ? t('qa.asking') : t('qa.ask')}
        </button>
      </form>

      <p className="muted small">{t('qa.tip')}</p>

      {state.error && <div className="alert alert-error">{state.error}</div>}

      {state.answer && (
        <section className="card">
          <div className="answer-head">
            <span className="tag">{statusLabel(state.answer.status, t)}</span>
          </div>
          <p className="answer-text">{state.answer.answer}</p>

          {state.answer.warnings && state.answer.warnings.length > 0 && (
            <ul className="warn-list">
              {state.answer.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}

          {state.answer.citations && state.answer.citations.length > 0 && (
            <div className="citation-list">
              {state.answer.citations.map((c) => (
                <div className="citation" key={c.citation_id}>
                  <span className="tag">
                    {t('common.page')} {c.source_page}
                  </span>
                  <span className="citation-text">{c.evidence_text}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
