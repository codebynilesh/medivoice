"""
Independent second-pass scanner for detecting residual personal identifiers.

Operates independently from the primary detector to catch any leaks,
unredacted names, phone numbers, emails, government IDs, or raw tokens.
"""

import re
from typing import List, Tuple

from clinivara.deidentification.recognizers.patterns import (
    ADDRESS_REGEX,
    DOB_MONTH_REGEX,
    GENERIC_PHONE_REGEX,
    SENSITIVE_FIELD_LABELS,
    US_ZIP_REGEX,
)

# Placeholder produced by the redactor, e.g. [NAME], [PATIENT_ID]
_PLACEHOLDER = re.compile(r"^\[[A-Z0-9_]+\]")

# Independent secondary residual regex patterns
RESIDUAL_PATTERNS = [
    # Residual Email
    (re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"), "RESIDUAL_EMAIL"),
    # Residual Phone: 10 digit or international phone formats not enclosed in brackets
    (re.compile(r"(?<!\[)(?:\+91[\-\s]?)?[6-9]\d{9}(?!\])"), "RESIDUAL_PHONE"),
    # Residual generic/US phone (space, dot, or dash separated)
    (re.compile(GENERIC_PHONE_REGEX), "RESIDUAL_PHONE"),
    # Residual Aadhaar: 12 digits (4-4-4 or continuous)
    (re.compile(r"(?<!\[)\b[2-9]\d{3}\s\d{4}\s\d{4}\b(?!\])"), "RESIDUAL_AADHAAR"),
    # Residual PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
    (re.compile(r"(?<!\[)\b[A-Z]{5}[0-9]{4}[A-Z]\b(?!\])"), "RESIDUAL_PAN"),
    # Residual Hospital MRN / UHID
    (re.compile(r"(?<!\[)\b(?:MRN|UHID|PID|HSP)[-:\s#]{1,3}[A-Z0-9\-/]{4,16}\b(?!\])", re.IGNORECASE), "RESIDUAL_MRN"),
    # Unredacted Patient / Doctor Name indicator
    (re.compile(r"\b(?:Patient(?:\s+Name)?|Pt(?:\s+Name)?)[ \t]*:[ \t]*([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3})\b", re.IGNORECASE), "UNREDACTED_PATIENT_NAME"),
    (re.compile(r"\b(?:Dr\.?|Doctor|Prof\.?)[ \t]+([A-Z][a-z]+(?:\s+[A-Z]\.)*(?:\s+[A-Z][a-z]+)+)\b", re.IGNORECASE), "UNREDACTED_DOCTOR_NAME"),
    # Residual street address / US ZIP
    (re.compile(ADDRESS_REGEX), "RESIDUAL_ADDRESS"),
    (re.compile(US_ZIP_REGEX), "RESIDUAL_ADDRESS"),
    (re.compile(DOB_MONTH_REGEX, re.IGNORECASE), "RESIDUAL_DATE"),
    # Leaked internal storage paths
    (re.compile(r"(?:[A-Za-z]:\\(?:Users|Data|Clinivara)|/(?:home|var|tmp|data)/clinivara)", re.IGNORECASE), "INTERNAL_PATH_LEAK"),
]

# Labeled sensitive fields: value after the label must be a redaction placeholder.
_RESIDUAL_FIELD_PATTERNS = [
    (
        re.compile(rf"(?:{labels})\s*[:#]\s*(?P<value>[^\n]+)", re.IGNORECASE),
        entity_type,
    )
    for entity_type, labels in SENSITIVE_FIELD_LABELS.items()
]


def _is_redacted(value: str) -> bool:
    stripped = value.strip()
    return not stripped or bool(_PLACEHOLDER.match(stripped))



class ResidualIdentifierScanner:
    """Independent second-pass scanner evaluating de-identified text for residual identifiers."""

    @staticmethod
    def scan_for_residuals(text: str) -> Tuple[int, List[str]]:
        """
        Scan de-identified text for any residual unredacted identifiers.
        Returns:
            (residual_count, list_of_warning_descriptions_without_leaking_values)
        """
        residual_count = 0
        findings = []

        for pattern, finding_type in RESIDUAL_PATTERNS:
            matches = list(pattern.finditer(text))
            if matches:
                # Count matches
                count = len(matches)
                residual_count += count
                # Report finding type without leaking the actual matched value
                findings.append(f"Independent validation detected {count} instance(s) of '{finding_type}'.")

        # Labeled sensitive fields must have a redaction placeholder as their value.
        for pattern, entity_type in _RESIDUAL_FIELD_PATTERNS:
            leaked = 0
            for match in pattern.finditer(text):
                if not _is_redacted(match.group("value")):
                    leaked += 1
            if leaked:
                residual_count += leaked
                findings.append(
                    f"Independent validation detected {leaked} unredacted '{entity_type}' field value(s)."
                )

        return residual_count, findings


residual_scanner = ResidualIdentifierScanner()
