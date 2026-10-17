"""
Multilingual clinical translation service preserving clinical fidelity.

Offline, deterministic translator built for clinical report content. It uses a
phrase/terminology dictionary applied longest-match-first, preserves numeric
values, units and clinical operators verbatim, and normalises spacing so the
output is readable in Hindi (hi) and Marathi (mr).
"""

import re
from typing import Dict, List
from clinivara.multilingual.terminology import clinical_terminology
from clinivara.schemas.ai import TranslationResponse

# Strict preservation patterns: medications, numbers with units, and clinical operators
PRESERVED_PATTERNS = [
    r"\b\d+(?:\.\d+)?\s*(?:mg/dL|mmol/L|g/dL|mIU/L|mcg|mg|%|mmHg)\b",
    r"\b(?:[7-9]\d|1\d\d|2[0-1]\d)/(?:[4-9]\d|1[0-2]\d)\s*(?:mmHg)?\b",
    r"\b(?:Metformin|Lisinopril|Amlodipine|Atorvastatin|Aspirin|Insulin|Omeprazole|Paracetamol)\b",
    r"[<>=≤≥±]",
]

_HI: Dict[str, str] = {
    # ---- full sentences produced by the explanation engine ----
    "this explanation is educational and does not constitute medical diagnosis or advice": (
        "यह व्याख्या केवल शैक्षिक है और चिकित्सीय निदान या सलाह नहीं है।"
    ),
    "this information is for learning only": "यह जानकारी केवल सीखने के लिए है।",
    "always meet your doctor for the right advice": "सही सलाह के लिए हमेशा अपने डॉक्टर से मिलें।",
    # ---- multi-word clinical phrases (longest applied first) ----
    "hospital discharge summary": "अस्पताल डिस्चार्ज सारांश",
    "clinical laboratory report": "चिकित्सीय प्रयोगशाला रिपोर्ट",
    "complete blood count": "संपूर्ण रक्त गणना",
    "nothing to worry about": "चिंता की कोई बात नहीं",
    "please talk to your doctor": "कृपया अपने डॉक्टर से बात करें",
    "talk to your doctor": "अपने डॉक्टर से बात करें",
    "consult your doctor": "अपने डॉक्टर से परामर्श लें",
    "outside the normal range": "सामान्य सीमा से बाहर",
    "inside the normal range": "सामान्य सीमा के भीतर",
    "outside the normal": "सामान्य सीमा से बाहर",
    "inside the normal": "सामान्य सीमा के भीतर",
    "within normal limits": "सामान्य सीमा में",
    "normal range": "सामान्य सीमा",
    "reference range": "संदर्भ सीमा",
    "past medical history": "पिछला चिकित्सीय इतिहास",
    "current medications": "वर्तमान दवाएं",
    "laboratory results": "प्रयोगशाला जांच परिणाम",
    "assessment & plan": "चिकित्सीय मूल्यांकन एवं योजना",
    "chief complaint": "मुख्य समस्या",
    "blood test": "रक्त जांच",
    "blood sugar": "रक्त शर्करा",
    "fasting glucose": "उपवास ग्लूकोज",
    "follow up in": "पुनः परामर्श",
    "after food": "भोजन के बाद",
    "before food": "भोजन से पहले",
    "needs attention": "ध्यान देने की जरूरत है",
    "there is nothing": "कुछ नहीं है",
    "so there is nothing to worry about": "इसलिए चिंता की कोई बात नहीं",
    "there is nothing to worry about": "चिंता की कोई बात नहीं",
    "there are": "हैं",
    "there is": "है",
    "there": "",
    # ---- test / clinical terminology ----
    "hemoglobin": "हीमोग्लोबिन",
    "haemoglobin": "हीमोग्लोबिन",
    "platelet count": "प्लेटलेट गणना",
    "platelets": "प्लेटलेट",
    "platelet": "प्लेटलेट",
    "cholesterol": "कोलेस्ट्रॉल",
    "creatinine": "क्रिएटिनिन",
    "glucose": "ग्लूकोज",
    "bilirubin": "बिलीरुबिन",
    "albumin": "एल्ब्यूमिन",
    "protein": "प्रोटीन",
    "calcium": "कैल्शियम",
    "potassium": "पोटैशियम",
    "sodium": "सोडियम",
    "thyroid": "थायरॉइड",
    "urine": "मूत्र",
    "serum": "सीरम",
    "sample": "नमूना",
    "method": "विधि",
    "comment": "टिप्पणी",
    "impression": "निष्कर्ष",
    "conclusion": "निष्कर्ष",
    "advice": "सलाह",
    "prescription": "नुस्खा",
    "dosage": "खुराक",
    "tablet": "गोली",
    "tablets": "गोलियां",
    "capsule": "कैप्सूल",
    "injection": "इंजेक्शन",
    "morning": "सुबह",
    "evening": "शाम",
    "night": "रात",
    "daily": "प्रतिदिन",
    # ---- status / descriptors ----
    "borderline": "सीमा रेखा",
    "increased": "बढ़ा हुआ",
    "decreased": "घटा हुआ",
    "uncontrolled": "अनियंत्रित",
    "positive": "सकारात्मक",
    "negative": "नकारात्मक",
    "present": "उपस्थित",
    "absent": "अनुपस्थित",
    "normal": "सामान्य",
    "abnormal": "असामान्य",
    "high": "उच्च",
    "low": "निम्न",
    "critical": "गंभीर",
    "attention": "ध्यान",
    # ---- generic report vocabulary ----
    "report": "रिपोर्ट",
    "results": "नतीजे",
    "result": "नतीजा",
    "diagnosis": "निदान",
    "patient": "मरीज",
    "doctor": "डॉक्टर",
    "physician": "चिकित्सक",
    "test": "जांच",
    "tests": "जांच",
    "value": "मान",
    "values": "मान",
    "range": "सीमा",
    "medicine": "दवा",
    "medicines": "दवाएं",
    "body": "शरीर",
    "health": "स्वास्थ्य",
    "date": "तारीख",
    "name": "नाम",
    "age": "उम्र",
    "male": "पुरुष",
    "female": "महिला",
    "shows": "दिखाता है",
    "show": "दिखाता है",
    "your": "आपका",
    "please": "कृपया",
    "always": "हमेशा",
    "fasting": "उपवास",
    "worry": "चिंता",
    "needs": "जरूरत है",
    "need": "जरूरत है",
    "inside": "भीतर",
    "outside": "बाहर",
    "and": "और",
    "or": "या",
    "but": "लेकिन",
    "so": "इसलिए",
    "is": "है",
    "are": "हैं",
    "the": "",
    "for": "के लिए",
    "with": "के साथ",
    "about": "के बारे में",
    "from": "से",
    "in": "में",
    "on": "पर",
    "of": "का",
    "to": "को",
    "this": "यह",
    "that": "वह",
    "it": "यह",
}

_MR: Dict[str, str] = {
    # ---- full sentences produced by the explanation engine ----
    "this explanation is educational and does not constitute medical diagnosis or advice": (
        "ही स्पष्टीकरण केवळ शैक्षणिक आहे आणि वैद्यकीय निदान किंवा सल्ला नाही."
    ),
    "this information is for learning only": "ही माहिती केवळ शिकण्यासाठी आहे.",
    "always meet your doctor for the right advice": "योग्य सल्ल्यासाठी नेहमी डॉक्टरांना भेटा.",
    # ---- multi-word clinical phrases (longest applied first) ----
    "hospital discharge summary": "रुग्णालय डिस्चार्ज सारांश",
    "clinical laboratory report": "वैद्यकीय प्रयोगशाळा तपासणी अहवाल",
    "complete blood count": "संपूर्ण रक्त गणना",
    "nothing to worry about": "काळजीचे कारण नाही",
    "please talk to your doctor": "कृपया डॉक्टरांशी बोला",
    "talk to your doctor": "डॉक्टरांशी बोला",
    "consult your doctor": "डॉक्टरांचा सल्ला घ्या",
    "outside the normal range": "सामान्य मर्यादेबाहेर",
    "inside the normal range": "सामान्य मर्यादेत",
    "outside the normal": "सामान्य मर्यादेबाहेर",
    "inside the normal": "सामान्य मर्यादेत",
    "within normal limits": "सामान्य मर्यादेत",
    "normal range": "सामान्य मर्यादा",
    "reference range": "संदर्भ मर्यादा",
    "past medical history": "मागील वैद्यकीय इतिहास",
    "current medications": "सध्याची औषधे",
    "laboratory results": "प्रयोगशाळा चाचणी निष्कर्ष",
    "assessment & plan": "वैद्यकीय मूल्यमापन आणि पुढील योजना",
    "chief complaint": "मुख्य तक्रार",
    "blood test": "रक्त तपासणी",
    "blood sugar": "रक्तातील साखर",
    "fasting glucose": "उपाशी ग्लुकोज",
    "follow up in": "पुढील भेट",
    "after food": "जेवणानंतर",
    "before food": "जेवणापूर्वी",
    "needs attention": "लक्ष देणे आवश्यक आहे",
    "so there is nothing to worry about": "म्हणून काळजीचे कारण नाही",
    "there is nothing to worry about": "काळजीचे कारण नाही",
    "there are": "आहेत",
    "there is": "आहे",
    "there": "",
    # ---- test / clinical terminology ----
    "hemoglobin": "हिमोग्लोबिन",
    "haemoglobin": "हिमोग्लोबिन",
    "platelet count": "प्लेटलेट गणना",
    "platelets": "प्लेटलेट",
    "platelet": "प्लेटलेट",
    "cholesterol": "कोलेस्ट्रॉल",
    "creatinine": "क्रिएटिनिन",
    "glucose": "ग्लुकोज",
    "bilirubin": "बिलिरुबिन",
    "albumin": "अल्ब्युमिन",
    "protein": "प्रथिन",
    "calcium": "कॅल्शियम",
    "potassium": "पोटॅशियम",
    "sodium": "सोडियम",
    "thyroid": "थायरॉइड",
    "urine": "लघवी",
    "serum": "सीरम",
    "sample": "नमुना",
    "method": "पद्धत",
    "comment": "टिप्पणी",
    "impression": "निष्कर्ष",
    "conclusion": "निष्कर्ष",
    "advice": "सल्ला",
    "prescription": "औषधपत्र",
    "dosage": "डोस",
    "tablet": "गोळी",
    "tablets": "गोळ्या",
    "capsule": "कॅप्सूल",
    "injection": "इंजेक्शन",
    "morning": "सकाळी",
    "evening": "संध्याकाळी",
    "night": "रात्री",
    "daily": "दररोज",
    # ---- status / descriptors ----
    "borderline": "सीमारेषा",
    "increased": "वाढलेले",
    "decreased": "घटलेले",
    "uncontrolled": "अनियंत्रित",
    "positive": "सकारात्मक",
    "negative": "नकारात्मक",
    "present": "उपस्थित",
    "absent": "अनुपस्थित",
    "normal": "सामान्य",
    "abnormal": "असामान्य",
    "high": "जास्त",
    "low": "कमी",
    "critical": "गंभीर",
    "attention": "लक्ष",
    # ---- generic report vocabulary ----
    "report": "अहवाल",
    "results": "निकाल",
    "result": "निकाल",
    "diagnosis": "निदान",
    "patient": "रुग्ण",
    "doctor": "डॉक्टर",
    "physician": "वैद्य",
    "test": "चाचणी",
    "tests": "चाचण्या",
    "value": "मूल्य",
    "values": "मूल्ये",
    "range": "मर्यादा",
    "medicine": "औषध",
    "medicines": "औषधे",
    "body": "शरीर",
    "health": "आरोग्य",
    "date": "दिनांक",
    "name": "नाव",
    "age": "वय",
    "male": "पुरुष",
    "female": "स्त्री",
    "shows": "दाखवते",
    "show": "दाखवते",
    "your": "तुमचा",
    "please": "कृपया",
    "always": "नेहमी",
    "fasting": "उपाशी",
    "worry": "काळजी",
    "needs": "आवश्यक आहे",
    "need": "आवश्यक आहे",
    "inside": "आत",
    "outside": "बाहेर",
    "and": "आणि",
    "or": "किंवा",
    "but": "पण",
    "so": "म्हणून",
    "is": "आहे",
    "are": "आहेत",
    "the": "",
    "for": "साठी",
    "with": "सोबत",
    "about": "याबद्दल",
    "from": "पासून",
    "in": "मध्ये",
    "on": "वर",
    "of": "चे",
    "to": "ला",
    "this": "हे",
    "that": "ते",
    "it": "हे",
}


class ClinicalTranslationService:
    """Safe clinical translator with terminology and numerical preservation."""

    def __init__(self):
        self._dicts: Dict[str, Dict[str, str]] = {"hi": _HI, "mr": _MR}
        # Pre-sort keys longest-first so multi-word phrases win over single words.
        self._ordered: Dict[str, List[str]] = {
            lang: sorted(mapping.keys(), key=len, reverse=True)
            for lang, mapping in self._dicts.items()
        }
        # Reverse maps (indic -> english) for hi/mr source text.
        self._reverse: Dict[str, Dict[str, str]] = {
            lang: self._build_reverse(mapping) for lang, mapping in self._dicts.items()
        }
        self._reverse_ordered: Dict[str, List[str]] = {
            lang: sorted(mapping.keys(), key=len, reverse=True)
            for lang, mapping in self._reverse.items()
        }

    @staticmethod
    def _build_reverse(mapping: Dict[str, str]) -> Dict[str, str]:
        reverse: Dict[str, str] = {}
        for english, native in mapping.items():
            native = native.strip()
            if native and native not in reverse:
                reverse[native] = english
        return reverse

    @staticmethod
    def _apply(text: str, mapping: Dict[str, str], ordered: List[str]) -> str:
        result = text
        for phrase in ordered:
            pattern = re.compile(rf"(?<!\w){re.escape(phrase)}(?!\w)", re.IGNORECASE)
            result = pattern.sub(mapping[phrase], result)
        return result

    @staticmethod
    def _normalize(text: str) -> str:
        text = re.sub(r"[ \t]{2,}", " ", text)
        text = re.sub(r"\s+([,.;:।])", r"\1", text)
        text = re.sub(r"\(\s+", "(", text)
        text = re.sub(r"\s+\)", ")", text)
        return text.strip()

    def translate(
        self,
        text: str,
        source_language: str = "en",
        target_language: str = "en",
        preserve_medical_terms: bool = True,
        preserve_terms: bool = None,
    ) -> TranslationResponse:
        """Translate clinical text between English and Hindi/Marathi (both directions)."""
        if preserve_terms is not None:
            preserve_medical_terms = preserve_terms

        if not text or not text.strip():
            return TranslationResponse(
                original_text="",
                translated_text="",
                source_language=source_language,
                target_language=target_language,
                preserved_terms=[],
                quality_score=1.0,
            )

        if source_language.lower() == target_language.lower():
            return TranslationResponse(
                original_text=text,
                translated_text=text,
                source_language=source_language,
                target_language=target_language,
                preserved_terms=[],
                quality_score=1.0,
            )

        preserved_terms = self._extract_preserved_terms(text) if preserve_medical_terms else []

        src = source_language.lower()
        tgt = target_language.lower()

        if target_language in self._dicts:
            # English -> Hindi/Marathi (forward dictionary)
            translated = self._apply(
                text, self._dicts[target_language], self._ordered[target_language]
            )
            for concept in ("diabetes", "hypertension", "hba1c"):
                canonical = clinical_terminology.translate_concept(concept, target_language)
                if canonical and canonical != concept:
                    pattern = re.compile(rf"(?<!\w){re.escape(concept)}(?!\w)", re.IGNORECASE)
                    translated = pattern.sub(canonical, translated)
        elif target_language == "en" and source_language in self._dicts:
            translated = self._apply(
                text, self._reverse[source_language], self._reverse_ordered[source_language]
            )
        else:
            translated = text

        translated = self._normalize(translated)

        return TranslationResponse(
            original_text=text,
            translated_text=translated,
            source_language=source_language,
            target_language=target_language,
            preserved_terms=preserved_terms,
            quality_score=0.95,
        )

    def _extract_preserved_terms(self, text: str) -> List[str]:
        """Collect numeric values, units and clinical operators to preserve verbatim."""
        found: List[str] = []
        for pattern in PRESERVED_PATTERNS:
            for match in re.finditer(pattern, text):
                token = match.group(0).strip()
                if token and token not in found:
                    found.append(token)
        return found


MultilingualTranslator = ClinicalTranslationService
clinical_translator = ClinicalTranslationService()
