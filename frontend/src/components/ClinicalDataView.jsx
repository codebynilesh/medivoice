import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';

export default function ClinicalDataView({ documentId, onError }) {
  const { t } = useI18n();
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let active = true;
    setState({ loading: true, data: null, error: null });
    api
      .getClinicalData(documentId)
      .then((data) => active && setState({ loading: false, data, error: null }))
      .catch((err) => {
        if (active) {
          setState({ loading: false, data: null, error: err.message });
          onError && onError(err.message);
        }
      });
    return () => {
      active = false;
    };
  }, [documentId]);

  if (state.loading) return <div className="empty-state">{t('cd.loading')}</div>;
  if (state.error) return <div className="alert alert-error">{state.error}</div>;
  if (!state.data) return null;

  const { classification, observations, entities, medications, extraction_quality_score } =
    state.data;

  return (
    <div className="stack">
      <div className="meta-grid">
        <div className="meta-card">
          <span className="meta-label">{t('cd.docType')}</span>
          <span className="meta-value">{classification.category}</span>
        </div>
        <div className="meta-card">
          <span className="meta-label">{t('cd.language')}</span>
          <span className="meta-value">{classification.detected_language}</span>
        </div>
        <div className="meta-card tone-ok">
          <span className="meta-label">{t('cd.quality')}</span>
          <span className="meta-value">
            {Math.round((extraction_quality_score || 0) * 100)}%
          </span>
        </div>
      </div>

      <section className="card">
        <h3>
          {t('cd.obs')} ({observations.length})
        </h3>
        {observations.length === 0 ? (
          <p className="muted">{t('cd.noObs')}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('cd.test')}</th>
                  <th>{t('cd.value')}</th>
                  <th>{t('cd.unit')}</th>
                  <th>{t('cd.reference')}</th>
                  <th>{t('cd.status')}</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((o) => (
                  <tr key={o.observation_id}>
                    <td>{o.normalized_test_name || o.test_name}</td>
                    <td>
                      {o.comparator || ''}
                      {o.original_value}
                    </td>
                    <td>{o.original_unit || '—'}</td>
                    <td>{o.reference_range ? o.reference_range.raw_text : '—'}</td>
                    <td>
                      <span className={`flag flag-${o.derived_status.toLowerCase()}`}>
                        {o.is_abnormal ? o.derived_status : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="two-col">
        <EntityCard title={t('cd.entities')} items={entities} />
        <MedicationCard items={medications} />
      </div>
    </div>
  );
}

function EntityCard({ title, items }) {
  const { t } = useI18n();
  return (
    <section className="card">
      <h3>
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="muted">{t('cd.none')}</p>
      ) : (
        <ul className="entity-list">
          {items.map((e, i) => (
            <li key={i}>
              <span className="entity-text">{e.text}</span>
              <span className="entity-type">{e.entity_type}</span>
              {e.is_negated && <span className="tag tag-muted">{t('cd.negated')}</span>}
              {e.is_uncertain && <span className="tag tag-warn">{t('cd.uncertain')}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MedicationCard({ items }) {
  const { t } = useI18n();
  return (
    <section className="card">
      <h3>
        {t('cd.medications')} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="muted">{t('cd.none')}</p>
      ) : (
        <ul className="entity-list">
          {items.map((m, i) => (
            <li key={i}>
              <span className="entity-text">{m.name}</span>
              <span className="entity-type">
                {[m.dosage, m.route, m.frequency].filter(Boolean).join(' · ') || '—'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
