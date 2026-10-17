// Medivoice API client.
// Backend base URL and API key are resolved at runtime from (in priority order):
//   1. window.__MEDIVOICE_CONFIG__  (injected by container entrypoint)
//   2. Vite build-time env vars (VITE_API_BASE_URL / VITE_API_KEY)
//   3. Localhost defaults

const runtime = (typeof window !== 'undefined' && window.__MEDIVOICE_CONFIG__) || {};

export const API_BASE_URL = (
  runtime.apiBaseUrl ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000'
).replace(/\/$/, '');

export const API_KEY =
  runtime.apiKey ||
  import.meta.env.VITE_API_KEY ||
  'medivoice-dev-client-key-2024';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function authHeaders(extra = {}) {
  return { 'X-API-Key': API_KEY, ...extra };
}

async function parseError(response) {
  let detail = null;
  try {
    detail = await response.json();
  } catch {
    try {
      detail = { message: await response.text() };
    } catch {
      detail = null;
    }
  }
  const d = detail && (detail.detail || detail);
  const message =
    (d && (d.message || d.error_code)) ||
    `Request failed with status ${response.status}`;
  return new ApiError(message, response.status, detail);
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (err) {
    throw new ApiError(
      `Cannot reach the backend at ${API_BASE_URL}. Is it running?`,
      0,
      { cause: String(err) }
    );
  }
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  baseUrl: API_BASE_URL,

  getHealth() {
    return request('/api/v1/health');
  },

  getAiHealth() {
    return request('/api/v1/ai/health');
  },

  getLanguages() {
    return request('/api/v1/ai/languages');
  },

  getCapabilities() {
    return request('/api/v1/ai/capabilities');
  },

  uploadDocument(file) {
    const form = new FormData();
    form.append('file', file);
    return request('/api/v1/documents', {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
  },

  getStatus(documentId) {
    return request(`/api/v1/documents/${documentId}/status`, {
      headers: authHeaders(),
    });
  },

  getResult(documentId) {
    return request(`/api/v1/documents/${documentId}/result`, {
      headers: authHeaders(),
    });
  },

  deleteDocument(documentId) {
    return request(`/api/v1/documents/${documentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
  },

  extractClinicalData(documentId, targetLanguage = 'en') {
    return request(
      `/api/v1/ai/documents/${documentId}/extract?target_language=${encodeURIComponent(
        targetLanguage
      )}`,
      { method: 'POST', headers: authHeaders() }
    );
  },

  getClinicalData(documentId) {
    return request(`/api/v1/ai/documents/${documentId}/clinical-data`, {
      headers: authHeaders(),
    });
  },

  explain(documentId, targetLanguage = 'en') {
    return request(`/api/v1/ai/documents/${documentId}/explain`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ target_language: targetLanguage }),
    });
  },

  askQuestion(documentId, question, targetLanguage = 'en') {
    return request(`/api/v1/ai/documents/${documentId}/questions`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        question,
        target_language: targetLanguage,
      }),
    });
  },

  translate(text, targetLanguage, sourceLanguage = 'en') {
    return request('/api/v1/ai/translate', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
        source_language: sourceLanguage,
        preserve_medical_terms: true,
      }),
    });
  },
};
