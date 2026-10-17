# syntax=docker/dockerfile:1
FROM python:3.14-slim-bookworm AS base

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    UV_SYSTEM_PYTHON=1 \
    UV_LINK_MODE=copy

# System dependencies: Tesseract OCR + curl (healthcheck).
# Note: PyMuPDF wheels bundle MuPDF, so libmupdf-dev is NOT required.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged application user
RUN groupadd -r medivoice --gid 1001 && \
    useradd -r -g medivoice --uid 1001 --shell /bin/bash medivoice

WORKDIR /app

# Install uv (fast, parallel resolver/downloader) then all dependencies.
# The cache mount keeps downloaded wheels between builds so subsequent
# builds are near-instant instead of re-downloading ~400 MB.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip uv

RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system \
    fastapi \
    "uvicorn[standard]" \
    pydantic \
    pydantic-settings \
    pymupdf \
    pytesseract \
    pillow \
    presidio-analyzer \
    presidio-anonymizer \
    spacy \
    cryptography \
    python-multipart \
    httpx \
    numpy \
    scikit-learn

# Pre-download spaCy English model for fast offline startup
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m spacy download en_core_web_sm

# Copy dependency manifest and application source code
COPY pyproject.toml .
COPY clinivara/ ./clinivara/
COPY evaluation/ ./evaluation/

# Create segregated storage directories with restricted ownership
RUN mkdir -p /app/data/storage/boundary_a_raw \
             /app/data/storage/boundary_b_scratch \
             /app/data/storage/boundary_c_approved \
             /app/data/storage/token_vault \
             /app/data/storage/metadata \
             /app/data/audit && \
    chown -R medivoice:medivoice /app/data && \
    chmod -R 700 /app/data/storage

# Switch to unprivileged non-root user
USER medivoice

EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "clinivara.main:app", "--host", "0.0.0.0", "--port", "8000"]
