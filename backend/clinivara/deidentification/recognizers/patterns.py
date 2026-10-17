"""
Regular expression patterns and context keywords for clinical and regional identifiers.
Includes Indian healthcare identifiers (Aadhaar, PAN, ABHA/UHID) and hospital MRN patterns.
Also covers international/US formats (phone, address, ZIP, month-name dates) and
labeled report fields (Name of Patient, Guardian, Doctor, Address, DOB, MRN, Contact).
"""

import re
from typing import Dict, List, Tuple

# Indian Aadhaar pattern: 12 digits, often grouped in 4-4-4
AADHAAR_REGEX = r"\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b"
AADHAAR_CONTEXT = ["aadhaar", "aadhar", "uid", "uidai", "gov id", "national id"]

# Indian Permanent Account Number (PAN): 5 uppercase letters, 4 digits, 1 uppercase letter
PAN_REGEX = r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"
PAN_CONTEXT = ["pan", "pan card", "income tax", "tax id"]

# Ayushman Bharat Health Account (ABHA) ID / Address: 14 digits formatted as 12-3456-7890-1234
ABHA_NUMBER_REGEX = r"\b\d{2}-\d{4}-\d{4}-\d{4}\b"
ABHA_CONTEXT = ["abha", "ndhm", "ayushman", "health id", "pmjay"]

# Hospital Medical Record Number (MRN) / Unique Hospital ID (UHID)
# Structured patterns like MRN-12345, UHID: 987654, HSP-4567, PID: A123456
HOSPITAL_MRN_REGEX = r"\b(?:MRN|UHID|PID|HSP|HOSP|IPD|OPD)[-:\s#]{1,3}[A-Z0-9\-/]{4,16}\b"
MRN_CONTEXT = [
    "mrn", "uhid", "medical record", "record number", "patient id", "chart number",
    "ipd no", "opd no", "admission no", "case no", "reg no", "registration"
]

# Indian Phone Numbers (+91 or starting with 6, 7, 8, 9)
INDIAN_PHONE_REGEX = r"(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b"
PHONE_CONTEXT = ["phone", "tel", "mobile", "contact", "cell", "call", "whatsapp"]

# Generic Doctor / Healthcare Provider prefix patterns
# Allows middle initials too: "Dr. Deborah S. Robinson", "Dr. John A. Doe"
DOCTOR_NAME_PREFIX_REGEX = (
    r"\b(?:Dr\.?|Doctor|Prof\.?)[ \t]+"
    r"([A-Z][a-z]+(?:\s+[A-Z]\.)*(?:\s+[A-Z][a-z]+)+)\b"
)
DOCTOR_CONTEXT = ["dr", "physician", "consultant", "attending", "specialist", "surgeon", "pathologist"]

# ---------------------------------------------------------------------------
# Extended (international / US) identifier formats
# ---------------------------------------------------------------------------

# Generic phone number: 222 555 7777, (222) 555-7777, +1-222-555-7777, 222.555.7777
GENERIC_PHONE_REGEX = (
    r"(?<![\d])(?:\+?\d{1,3}[\s.\-]?)?"
    r"(?:\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}(?![\d])"
)

# Month-name date: "July 2, 2050", "15-Aug-1990", "Jan 9 1988"
DOB_MONTH_REGEX = (
    r"\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|"
    r"Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?"
    r"\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}\b"
)

# Street address: "1114 Marion Street, Brattleboro, VT 05301"
ADDRESS_REGEX = (
    r"\b\d{1,6}\s+[A-Z][A-Za-z'.\-]*(?:\s+[A-Z][A-Za-z'.\-]*){0,4}\s+"
    r"(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct|"
    r"Place|Pl|Circle|Cir|Terrace|Ter|Highway|Hwy|Parkway|Pkwy|Square|Sq|Trail|Trl)\.?"
    r"(?:\s*,?\s*(?:Apt|Suite|Ste|Unit)\.?\s*[A-Za-z0-9\-]+)?"
    r"(?:\s*,?\s*[A-Z][A-Za-z]+)?"
    r"(?:\s*,?\s*[A-Z]{2})?"
    r"(?:\s*,?\s*\d{5}(?:-\d{4})?)?"
)

# US ZIP / ZIP+4 with state: "VT 05301"
US_ZIP_REGEX = r"\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b"

# ---------------------------------------------------------------------------
# Sensitive labeled report fields (value after a sensitive label is redacted)
# ---------------------------------------------------------------------------

SENSITIVE_FIELD_LABELS: Dict[str, str] = {
    "PATIENT_ID": (
        r"Medical\s+Record(?:s)?\s+(?:Number|No\.?)|MRN|UHID|Patient\s+ID|"
        r"Registration\s+(?:Number|No\.?)|Reg\.?\s*No\.?|Chart\s+(?:Number|No\.?)|"
        r"OPD\s+(?:Number|No\.?)|IPD\s+(?:Number|No\.?)|Admission\s+(?:Number|No\.?)|"
        r"Insurance\s+(?:Number|No\.?)|Policy\s+(?:Number|No\.?)|Health\s+Card\s+(?:Number|No\.?)"
    ),
    "PERSON": (
        r"Patient(?:'s)?\s+Name|Name\s+of\s+Patient|Pt\.?\s+Name|Patient|Full\s+Name|"
        r"Guardian(?:'s)?\s+Name|Name\s+of\s+Guardian|Guardian|"
        r"Father(?:'s)?\s+Name|Mother(?:'s)?\s+Name|Spouse(?:'s)?\s+Name|"
        r"Emergency\s+Contact|Next\s+of\s+Kin|Attendant(?:'s)?\s+Name|Caregiver(?:'s)?\s+Name|"
        r"Referred\s+By|Referring\s+Doctor|Consulting\s+Doctor|Consultant|Physician|"
        r"Attending(?:\s+Physician)?|Surgeon|Pathologist|Radiologist|Doctor"
    ),
    "LOCATION": (
        r"Residential\s+Address|Permanent\s+Address|Home\s+Address|Mailing\s+Address|"
        r"Patient\s+Address|Address"
    ),
    "DATE_TIME": r"Date\s+of\s+Birth|D\.?O\.?B\.?|Birth\s+Date",
    "PHONE_NUMBER": (
        r"Contact\s+(?:Number|No\.?)|Phone\s+(?:Number|No\.?)|Mobile\s+(?:Number|No\.?)|"
        r"Telephone|Tel\.?|Cell|WhatsApp"
    ),
    "EMAIL_ADDRESS": r"E-?mail(?:\s+Address)?",
}


def build_sensitive_field_patterns() -> List[Tuple[re.Pattern, str]]:
    """Compile labeled-field patterns that capture the value after a sensitive label.

    The captured named group ``value`` extends to the end of the line, so a single
    match may safely over-redact a whole header row rather than leak a value.
    """
    compiled: List[Tuple[re.Pattern, str]] = []
    for entity_type, labels in SENSITIVE_FIELD_LABELS.items():
        pattern = re.compile(rf"(?:{labels})\s*[:#]\s*(?P<value>[^\n]+)", re.IGNORECASE)
        compiled.append((pattern, entity_type))
    return compiled

