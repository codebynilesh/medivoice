import { statusTone } from '../constants.js';
import { useI18n } from '../i18n.jsx';

const METHOD_LABEL = {
  digital_text: 'Digital text',
  ocr: 'OCR',
};

export default function OverviewView({ status, result }) {
  const { t } = useI18n();

  if (!result) {
    return (
      <div className="empty-state">
        <p>{t('ov.notApproved')}</p>
        {status && (
          <p className="muted">
            {t('ov.currentStatus')}: <strong>{status.status}</strong>
            {status.stage ? ` · ${t('ov.stage')}: ${status.stage}` : ''}
          </p>
        )}
        {status && status.warnings && status.warnings.length > 0 && (
          <ul className="warn-list">
            {status.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const { extraction, deidentification, clinical_content, quality } = result;

  return (
    <div className="stack">
      <div className="meta-grid">
        <MetaCard label={t('ov.releaseStatus')} value={result.processing_status} tone="ok" />
        <MetaCard label={t('ov.pages')} value={extraction.pages_processed} />
        <MetaCard
          label={t('ov.extraction')}
          value={extraction.status}
          tone={extraction.status === 'COMPLETED' ? 'ok' : 'warn'}
        />
        <MetaCard
          label={t('ov.privacyValidation')}
          value={deidentification.validation_status}
          tone={deidentification.validation_status === 'PASSED' ? 'ok' : 'warn'}
        />
      </div>

      {clinical_content.sections && clinical_content.sections.length > 0 && (
        <section className="card">
          <h3>{t('ov.clinicalSections')}</h3>
          <div className="section-list">
            {clinical_content.sections.map((s, i) => (
              <div className="section-item" key={i}>
                <div className="section-title">{s.title}</div>
                <div className="section-content">{s.content}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="two-col">
        <section className="card">
          <h3>{t('ov.protectedEntities')}</h3>
          {Object.keys(deidentification.transformed_entity_counts || {}).length ===
          0 ? (
            <p className="muted">{t('ov.noEntities')}</p>
          ) : (
            <ul className="pill-list">
              {Object.entries(deidentification.transformed_entity_counts).map(
                ([type, count]) => (
                  <li className="pill" key={type}>
                    {type} <span className="pill-count">{count}</span>
                  </li>
                )
              )}
            </ul>
          )}
        </section>

        <section className="card">
          <h3>{t('ov.qualityChecks')}</h3>
          <ul className="check-list">
            <Check ok={quality.schema_valid} label={t('ov.schemaValid')} />
            <Check
              ok={quality.clinical_content_preserved}
              label={t('ov.clinicalPreserved')}
            />
            <Check
              ok={quality.residual_identifiers_detected === 0}
              label={`${t('ov.residual')}: ${quality.residual_identifiers_detected}`}
            />
          </ul>
          <p className="muted small">
            {t('ov.methods')}:{' '}
            {extraction.methods_used
              .map((m) => METHOD_LABEL[m] || m)
              .join(', ') || '—'}
          </p>
        </section>
      </div>
    </div>
  );
}

function MetaCard({ label, value, tone }) {
  return (
    <div className={`meta-card ${tone ? `tone-${tone}` : ''}`}>
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  );
}

function Check({ ok, label }) {
  return (
    <li className={ok ? 'check-ok' : 'check-bad'}>
      <span className="check-icon">{ok ? '✓' : '✕'}</span>
      {label}
    </li>
  );
}

export { statusTone };
