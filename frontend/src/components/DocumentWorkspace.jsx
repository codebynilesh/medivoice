import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { statusTone } from '../constants.js';
import { useI18n } from '../i18n.jsx';
import OverviewView from './OverviewView.jsx';
import ClinicalDataView from './ClinicalDataView.jsx';
import QAView from './QAView.jsx';
import TranslateView from './TranslateView.jsx';

export default function DocumentWorkspace({ documentId, onClose }) {
  const { t } = useI18n();
  const [tab, setTab] = useState('overview');
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const tabs = [
    { id: 'overview', label: t('ws.tabOverview') },
    { id: 'clinical', label: t('ws.tabClinical') },
    { id: 'qa', label: t('ws.tabAsk') },
    { id: 'translate', label: t('ws.tabTranslate') },
  ];

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const s = await api.getStatus(documentId);
      setStatus(s);
      if (s.status === 'APPROVED') {
        try {
          const r = await api.getResult(documentId);
          setResult(r);
          setConfirmed(true);
        } catch (err) {
          setResult(null);
          setError(err.message);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }, [documentId]);

  useEffect(() => {
    setResult(null);
    setConfirmed(false);
    setTab('overview');
    load();
  }, [documentId, load]);

  async function remove() {
    if (!window.confirm(t('ws.confirmDelete'))) return;
    try {
      await api.deleteDocument(documentId);
      onClose && onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  const deidText = result?.clinical_content?.text;

  return (
    <section className="workspace card">
      <header className="workspace-head">
        <div>
          <div className="workspace-title">{t('ws.document')}</div>
          <code className="doc-id">{documentId}</code>
        </div>
        <div className="workspace-actions">
          {status && (
            <span className={`status-chip status-${statusTone(status.status)}`}>
              {status.status}
            </span>
          )}
          <button className="btn btn-ghost" onClick={load} disabled={busy}>
            {busy ? t('ws.refreshing') : t('ws.refresh')}
          </button>
          <button className="btn btn-danger-ghost" onClick={remove}>
            {t('ws.delete')}
          </button>
          {onClose && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (window.confirm(t('ws.confirmNewUpload'))) onClose();
              }}
            >
              {t('ws.newUpload')}
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {deidText && (
        <details className="deid-drawer">
          <summary>
            <span className="deid-drawer-title">{t('ws.deidSummary')}</span>
            <span className="deid-drawer-hint">{t('ws.deidHint')}</span>
            <span className="deid-drawer-chevron" aria-hidden="true">
              ▾
            </span>
          </summary>
          <pre className="deid-text">{deidText}</pre>
        </details>
      )}

      <nav className="tabs">
        {tabs.map((item) => {
          const disabled = !confirmed && item.id !== 'overview';
          return (
            <button
              key={item.id}
              className={`tab ${tab === item.id ? 'active' : ''}`}
              disabled={disabled}
              title={disabled ? t('ws.tabDisabled') : ''}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="tab-body">
        {tab === 'overview' && <OverviewView status={status} result={result} />}
        {tab === 'clinical' && confirmed && (
          <ClinicalDataView documentId={documentId} onError={setError} />
        )}
        {tab === 'qa' && confirmed && (
          <QAView documentId={documentId} onError={setError} />
        )}
        {tab === 'translate' && <TranslateView onError={setError} defaultText={deidText} />}
      </div>
    </section>
  );
}
