# Clinivara Backend (Medivoice)

Clinivara is the privacy-first core engine of **Medivoice** — a security-first, HIPAA- and DPDP-aligned clinical document intake, extraction, and de-identification engine designed to protect patient privacy before any data reaches downstream clinical AI models, vector stores, or LLM agents.

> Product/UI name: **Medivoice**. Backend Python package: `clinivara`.

---

## The Processing Invariant

```
Original Report -> Secure Intake -> Extraction -> Normalization -> Sensitive Entity Detection -> De-identification -> Independent Validation -> Approved Output
```

No downstream consumer may receive unvalidated extracted text or raw reports. Documents failing security checks, extraction quality, or independent privacy verification are quarantined or rejected (`REJECTED` or `REVIEW_REQUIRED`). Unsafe output is never silently released.

---

## Key Capabilities

- **Secure Document Upload**: Magic-byte signature verification (`%PDF-`, `PNG`, `JPEG`), path traversal rejection, image decompression bomb protection, file size and page count bounding.
- **Defensive Extraction & Selective OCR**: High-performance digital extraction via PyMuPDF with selective Tesseract OCR fallback on low-text or scanned pages. Ephemeral scratch images are automatically shredded.
- **Conservative Clinical Normalization**: Unicode NFKC cleaning, line-ending standardization, and clinical section parsing. Preserves negative signs, laboratory units (`mg/dL`, `mmol/L`, `mmHg`), and medication dosages (`500 mg PO BID`).
- **Clinical & Regional Entity Detection**: Presidio Analyzer, spaCy NLP, and custom recognizers for Hospital MRNs, Indian Aadhaar numbers, PAN cards, ABHA IDs, phone numbers, and doctor names.
- **Medical Whitelist Protection**: Preserves clinical diagnoses and standard medications from erroneous redaction.
- **Independent Privacy Release Gate**: Second-pass residual scanner and clinical preservation verifier ensuring fail-closed protection.
- **Multi-Tenant Data Isolation**: Storage partitioned into Boundary A (Raw Vault), Boundary B (Scratch), Boundary C (Approved Output), and Token Vault.
- **Privacy-Preserving Audit Logging**: Immutable JSON Lines audit events with log injection sanitization.

---

## Quickstart

### 1. Requirements
- Python 3.14+
- Tesseract OCR (`tesseract` on system PATH)

### 2. Local Setup
```bash
# Create virtual environment
python -m venv .venv

# Install dependencies (from backend/)
.venv\Scripts\pip install -e ".[dev]"

# Download spaCy model (optional - engine falls back to a blank model without it)
.venv\Scripts\python -m spacy download en_core_web_sm
```
> Tesseract is optional too: image/scan OCR degrades gracefully if `tesseract` is not on PATH.

### 3. Run Automated Tests
```bash
.venv\Scripts\pytest -v
```

### 4. Run Privacy & Clinical Preservation Benchmark
```bash
.venv\Scripts\python evaluation/evaluate_privacy.py
```

### 5. Run the REST API Server
```powershell
# Recommended: frees/avoids a busy port, then starts uvicorn with --reload
.\run.ps1

# Or manually
.venv\Scripts\uvicorn clinivara.main:app --reload --host 127.0.0.1 --port 8000
```
> If you see `WinError 10013`, another process is already bound to port 8000
> (`run.ps1` detects this and switches to the next free port automatically).

### 6. Run Everything with Docker (from repo root)
```bash
docker compose up --build
# Backend:  http://localhost:8000/api/v1/health
# API Docs: http://localhost:8000/docs (enable CLINIVARA_DEBUG=true to expose)
# Frontend: http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/documents` | Secure upload, extraction, de-identification, and validation. |
| `GET` | `/api/v1/documents/{id}/status` | Safe processing status and quality metadata. |
| `GET` | `/api/v1/documents/{id}/result` | Retrieve approved de-identified output (blocks unapproved). |
| `DELETE` | `/api/v1/documents/{id}` | Secure deletion of raw files, approved output, and metadata. |
| `GET` | `/api/v1/health` | Container readiness and operational monitoring. |

---

## Documentation
- [Architecture & Trust Boundaries](docs/architecture.md)
- [Security & Threat Model](docs/security.md)
- [De-identification Policy](docs/deidentification-policy.md)
- [Data Flow & Lifecycle](docs/data-flow.md)
- [API Contract Specification](docs/api.md)
- [Testing Strategy & Results](docs/testing.md)
- [Deployment Guide](docs/deployment.md)

---

## Limitations & Production Risks
- Tesseract OCR accuracy is dependent on source scan quality and DPI.
- Second-pass verification detects known residual patterns, but cannot mathematically guarantee zero re-identification risk in high-dimensional patient datasets.
- For public cloud production, persistent storage must be backed by encrypted block or object stores with strict KMS key rotation policies.
