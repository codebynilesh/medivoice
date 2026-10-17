// Runtime configuration placeholder.
// In the Docker image this file is overwritten at container start with
// values from environment variables (MEDIVOICE_API_BASE_URL, MEDIVOICE_API_KEY).
// In local dev this is empty and the app falls back to Vite env vars / defaults.
window.__MEDIVOICE_CONFIG__ = {};
