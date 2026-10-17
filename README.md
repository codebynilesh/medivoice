# Medivoice

> Privacy-first, free and accessible multi-agent medical intelligence — upload a
> diagnostic report, get a verified plain-language explanation in your own language.

## Why Medivoice

Millions of patients receive medical reports filled with clinical jargon,
biomarkers and foreign terminology they cannot interpret. Limited consultation time,
language gaps and low literacy leave people confused about their own health.

Existing commercial AI tools make it worse: they send sensitive health data to the
cloud, charge subscription fees, cover few regional languages, and risk clinical
hallucinations.

Medivoice exists to bridge that healthcare-literacy gap — securely, at no cost, on
everyday hardware.

## What it does

- **Ingests multi-format reports** — PDFs, images and physical scans, read via OCR
  with structured schema extraction (no free-form string blobs).
- **Analyzes clinical values** — deterministic biomarker rules flag abnormalities
  and severity before anything is shown to the patient.
- **Grounds every answer** — hybrid retrieval (vector + BM25 keyword search) over
  verified medical knowledge from WHO, ICMR and MedlinePlus.
- **Simplifies & translates** — rewrites jargon into plain language, then
  translates to Hindi, Marathi, Gujarati and Tamil with medical terms preserved.
- **Speaks it back** — neural text-to-speech narration for low-literacy and
  visually-impaired users.
- **Delivers insights** — a dashboard with structured views, downloadable summaries
  and playable audio.

## How it works — 8-node pipeline

```
[1. Secure Login] ➔ [2. Upload Report] ➔ [3. OCR & Extraction] ➔ [4. Medical Analysis]
                                                                        │
[8. Delivery Dashboard] ◄ [7. Voice Generation] ◄ [6. Simplification] ◄ [5. Knowledge Retrieval]
```

| Node | Role |
| :--- | :--- |
| **1. Secure Login** | Authentication and session management. |
| **2. Upload Report** | Multi-format intake through a FastAPI REST backend. |
| **3. OCR & Extraction** | Text extraction with OCR, structured into strict schemas. |
| **4. Medical Analysis** | Evaluates biomarkers against reference rules and reasoning to flag severity. |
| **5. Knowledge Retrieval** | Hybrid semantic + keyword search over a verified medical knowledge base. |
| **6. Simplification & Translation** | Plain-language rewrite, then regional-language translation. |
| **7. Voice Generation** | Lightweight neural TTS synthesis for the target language. |
| **8. Delivery Dashboard** | Renders insights, downloadable summaries and playable audio. |

## Safety & evaluation

- **Runtime guardrails** intercept invalid or harmful medical guidance.
- **Structured validation** — every extracted attribute passes strict schema parsing,
  so numerical values (hemoglobin, blood glucose, …) must match expected clinical
  types before downstream analysis.
- **Hallucination control** — retrieved context is injected under strict system
  instructions, coupling vector similarity with exact-match scoring.
- **Evaluation** measures faithfulness, answer relevance and context recall.
- **Auditability** — all agent execution traces are logged.

## Hardware

Core modules are optimized to run efficiently on baseline **8GB RAM** hardware, with
offline execution for privacy-sensitive environments. No cloud round-trip is required
to process a report.

## Getting started

```bash
docker compose up --build
```

OR

backend:

```powershell
cd backend
python -m venv .venv
pip install -e .
.venv\Scripts\activate 
uvicorn clinivara.main:app --reload
```

frontend:

```powershell
cd frontend
npm i
npm run dev
```

- Frontend: <http://localhost:3000>
- Backend health: <http://localhost:8000/api/v1/health>

## Repository structure

| Folder | Description |
| :--- | :--- |
| `backend/` | FastAPI service — secure intake, extraction, clinical analysis and AI endpoints. |
| `frontend/` | Medivoice web interface (React + Vite), served by nginx. |

> Local (non-Docker) backend setup and full API documentation live in
> `backend/README.md`.

## Disclaimer

Medivoice is for educational use only and is not a substitute for professional
medical advice, diagnosis or treatment.
