import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';

export default function HealthBadge() {
  const { t } = useI18n();
  const [state, setState] = useState({ status: 'checking', detail: null });

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const health = await api.getHealth();
        if (active) setState({ status: 'up', detail: health });
      } catch (err) {
        if (active) setState({ status: 'down', detail: err.message });
      }
    }
    check();
    const timer = setInterval(check, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const label =
    state.status === 'up'
      ? t('health.up')
      : state.status === 'down'
      ? t('health.down')
      : t('health.checking');

  return (
    <span className={`health-badge health-${state.status}`} title={api.baseUrl}>
      <span className="health-dot" />
      {label}
    </span>
  );
}
