"""
Tesseract OCR engine with language configuration, defensive timeouts,
and quality metric extraction.
"""

import os
import shutil
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from PIL import Image

from clinivara.core.config import settings
from clinivara.core.errors import ExtractionError

_TESSERACT_INSTALL_HINT = (
    "Tesseract OCR executable not found. Install it with "
    "`winget install UB-Mannheim.TesseractOCR` (or choco install tesseract), "
    "then restart the terminal - or set CLINIVARA_TESSERACT_CMD to tesseract.exe."
)


def _resolve_tesseract_cmd() -> Optional[str]:
    """Find the tesseract binary: explicit setting > PATH > common install locations."""
    if settings.tesseract_cmd:
        return settings.tesseract_cmd

    on_path = shutil.which("tesseract")
    if on_path:
        return on_path

    if os.name != "nt":
        return None

    candidates = [
        Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "Tesseract-OCR" / "tesseract.exe",
        Path(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)")) / "Tesseract-OCR" / "tesseract.exe",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Tesseract-OCR" / "tesseract.exe",
        Path(os.environ.get("USERPROFILE", "")) / "scoop" / "apps" / "tesseract" / "current" / "tesseract.exe",
        Path(r"C:\ProgramData\chocolatey\bin\tesseract.exe"),
    ]
    for path in candidates:
        if str(path) and path.is_file():
            return str(path)
    return None


class OCREngine:
    """Tesseract OCR wrapper with defensive execution and confidence extraction."""

    def __init__(self):
        self.language = settings.ocr_default_language
        self.timeout = settings.ocr_timeout_seconds

    def extract_from_image_path(self, image_path: Path) -> Tuple[str, Optional[float], Dict[str, Any]]:
        """
        Run OCR on an image file.
        Returns:
            (extracted_text, average_confidence, quality_signals)
        """
        import pytesseract

        # Resolve on every call so a Tesseract installed mid-session is picked up.
        tesseract_cmd = _resolve_tesseract_cmd()
        if not tesseract_cmd:
            raise ExtractionError(_TESSERACT_INSTALL_HINT)
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

        try:
            with Image.open(image_path) as img:
                # Convert to RGB if needed
                if img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")

                # Extract data containing word-level confidences
                data = pytesseract.image_to_data(
                    img,
                    lang=self.language,
                    timeout=self.timeout,
                    output_type=pytesseract.Output.DICT,
                )

                # Extract text
                text = pytesseract.image_to_string(
                    img,
                    lang=self.language,
                    timeout=self.timeout,
                )

                # Calculate true mean confidence across detected word tokens (ignoring empty or -1)
                confidences = [
                    int(c) for c in data.get("conf", [])
                    if str(c).isdigit() and int(c) >= 0
                ]

                avg_conf = None
                if confidences:
                    avg_conf = round(sum(confidences) / len(confidences), 2)

                quality_signals = {
                    "token_count": len(confidences),
                    "confidence_available": avg_conf is not None,
                    "engine": "Tesseract",
                    "language": self.language,
                }

                return text.strip(), avg_conf, quality_signals

        except pytesseract.TesseractNotFoundError:
            raise ExtractionError(_TESSERACT_INSTALL_HINT)
        except Exception as e:
            # Avoid leaking raw text in exception messages
            raise ExtractionError(f"OCR execution failed: {type(e).__name__}")


ocr_engine = OCREngine()
