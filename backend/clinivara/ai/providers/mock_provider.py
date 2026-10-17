"""
Deterministic Mock LLM Provider for offline testing, CI/CD, and non-external LLM operations.
Guarantees schema-compliant responses without network access or third-party API dependencies.
"""

import json
import re
from typing import Any, Dict, List, Optional, Type
from pydantic import BaseModel

from clinivara.ai.providers.base import LLMProvider
from clinivara.schemas.ai import (
    Citation,
    ClinicalEntity,
    ClinicalObservation,
    DocumentClassificationResult,
    ExtractedClinicalData,
    GroundedExplanation,
    KeyFindingExplanation,
    MedicationEntity,
    QuestionAnswerResponse,
    ReferenceRange,
    TranslationResponse,
)


class MockLLMProvider(LLMProvider):
    """Deterministic mock LLM provider for zero-cost offline validation."""

    def __init__(self, mock_language: str = "en"):
        self.mock_language = mock_language

    def health_check(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "provider": "mock",
            "offline_mode": True,
            "capabilities": ["classification", "extraction", "explanation", "qna", "translation"],
        }

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.0,
        max_tokens: int = 1000,
    ) -> str:
        """Generate deterministic text responses based on prompt keywords."""
        prompt_lower = prompt.lower()
        if "audit" in prompt_lower or "consistency" in prompt_lower:
            return "AUDIT_RESULT: PASS. All claims supported by source evidence. Zero altered values or lost negations."
        if "translate" in prompt_lower:
            return "This is a deterministic mock translation preserving clinical units and numeric precision."
        return "Deterministic educational explanation grounded strictly in the provided medical report."

    def generate_structured(
        self,
        prompt: str,
        response_model: Type[BaseModel],
        system_prompt: Optional[str] = None,
        temperature: float = 0.0,
    ) -> BaseModel:
        """Generate schema-conforming Pydantic models deterministically."""
        if issubclass(response_model, DocumentClassificationResult):
            return self._mock_classification(prompt)
        elif issubclass(response_model, ExtractedClinicalData):
            return self._mock_extraction(prompt)
        elif issubclass(response_model, GroundedExplanation):
            return self._mock_explanation(prompt)
        elif issubclass(response_model, QuestionAnswerResponse):
            return self._mock_qna(prompt)
        elif issubclass(response_model, TranslationResponse):
            return self._mock_translation(prompt)
        
        # Generic fallback using response_model fields if custom type requested
        return response_model.model_construct()

    def _mock_classification(self, prompt: str) -> DocumentClassificationResult:
        prompt_lower = prompt.lower()
        category = "UNKNOWN"
        confidence = 0.85
        detected_lang = "en"
        evidence_spans = []

        if any(w in prompt_lower for w in ["hemoglobin", "platelet", "wbc", "rbc", "hematology", "सीबीसी", "रक्त"]):
            category = "HEMATOLOGY_CBC"
            confidence = 0.95
            evidence_spans.append("Detected complete blood count test parameters")
        elif any(w in prompt_lower for w in ["glucose", "creatinine", "urea", "bilirubin", "lipid", "cholesterol", "बायोकेमिस्ट्री"]):
            category = "BIOCHEMISTRY_METABOLIC"
            confidence = 0.92
            evidence_spans.append("Detected metabolic panel parameters")
        elif any(w in prompt_lower for w in ["discharge", "admission", "hospital", "डिस्चार्ज"]):
            category = "DISCHARGE_SUMMARY"
            confidence = 0.90
            evidence_spans.append("Detected discharge summary clinical structure")

        # Script detection
        if any('\u0900' <= char <= '\u097F' for char in prompt):
            if "आहे" in prompt or "नाही" in prompt or "रुग्ण" in prompt:
                detected_lang = "mr"
            else:
                detected_lang = "hi"

        return DocumentClassificationResult(
            category=category,
            confidence=confidence,
            detected_language=detected_lang,
            secondary_languages=["en"] if detected_lang != "en" else [],
            is_multilingual=detected_lang != "en",
            evidence_spans=evidence_spans or ["Document text matching standard clinical format"],
            warnings=[],
        )

    def _mock_extraction(self, prompt: str) -> ExtractedClinicalData:
        # Simple regex extraction for key synthetic test parameters in prompt
        observations: List[ClinicalObservation] = []
        
        # Pattern for "TestName: Value Unit (Ref)" or "TestName Value Unit Ref"
        lines = prompt.splitlines()
        for idx, line in enumerate(lines):
            line_str = line.strip()
            # Fast scan for common tests
            for test in ["Hemoglobin", "WBC", "Platelet Count", "Fasting Glucose", "Serum Creatinine", "HbA1c"]:
                if test.lower() in line_str.lower():
                    # Parse numeric value if present
                    val_match = re.search(r"(\d+(?:\.\d+)?)", line_str)
                    val = val_match.group(1) if val_match else "12.0"
                    observations.append(
                        ClinicalObservation(
                            observation_id=f"obs-mock-{idx}",
                            test_name=test,
                            original_test_name=test,
                            normalized_test_name=test,
                            original_value=val,
                            numeric_value=float(val),
                            comparator=None,
                            original_unit="g/dL" if "hemo" in test.lower() else "mg/dL",
                            normalized_unit="g/dL" if "hemo" in test.lower() else "mg/dL",
                            reference_range=ReferenceRange(
                                raw_text="12.0 - 15.0",
                                low=12.0,
                                high=15.0,
                                unit="g/dL" if "hemo" in test.lower() else "mg/dL"
                            ),
                            source_reported_status=None,
                            derived_status="NORMAL",
                            is_abnormal=False,
                            source_page=1,
                            source_evidence=line_str,
                            extraction_method="LLM_STRUCTURED",
                            confidence=0.95,
                        )
                    )

        return ExtractedClinicalData(
            schema_version="1.0",
            document_id="doc-mock-extract",
            tenant_id="tenant-default",
            classification=DocumentClassificationResult(
                category="HEMATOLOGY_CBC",
                confidence=0.95,
                detected_language="en",
                evidence_spans=["Extracted laboratory test observations"],
            ),
            observations=observations,
            entities=[],
            medications=[],
            extraction_quality_score=0.95 if observations else 0.80,
            review_required=False,
        )

    def _mock_explanation(self, prompt: str) -> GroundedExplanation:
        target_lang = "en"
        lang_match = re.search(r"Preferred language:\s*([A-Za-z]{2})", prompt, re.IGNORECASE)
        if lang_match:
            target_lang = lang_match.group(1).lower()

        facts = self._extract_json_block(prompt, "validated_facts") or {}
        observations = facts.get("observations", []) or []

        citations: List[Citation] = []
        key_findings: List[KeyFindingExplanation] = []

        for idx, obs in enumerate(observations[:8], start=1):
            cit_id = f"cit-{idx}"
            evidence = str(obs.get("source_evidence") or "").strip()
            test = (
                obs.get("test_name")
                or obs.get("original_test_name")
                or obs.get("normalized_test_name")
                or "Test"
            )
            value = str(obs.get("original_value") or "").strip()
            unit = str(obs.get("original_unit") or "").strip()
            ref = obs.get("reference_range") or {}
            ref_txt = str(ref.get("raw_text") or "").strip()
            status_raw = str(obs.get("derived_status") or "UNKNOWN").upper()
            abnormal = bool(obs.get("is_abnormal")) or status_raw in (
                "HIGH", "LOW", "CRITICAL", "BORDERLINE"
            )

            citations.append(
                Citation(
                    citation_id=cit_id,
                    source_page=int(obs.get("source_page") or 1),
                    section_name="LABORATORY RESULTS",
                    evidence_text=evidence or f"{test} {value} {unit}".strip(),
                    relevance_score=1.0,
                )
            )
            key_findings.append(
                KeyFindingExplanation(
                    finding_title=test,
                    status="ATTENTION" if abnormal else "NORMAL",
                    lay_explanation=self._lay_explanation(
                        target_lang, test, value, unit, ref_txt, abnormal
                    ),
                    source_citations=[cit_id],
                )
            )

        abnormal_count = sum(1 for f in key_findings if f.status == "ATTENTION")
        total = len(key_findings)

        return GroundedExplanation(
            explanation_id="exp-mock-1",
            document_id=str(facts.get("document_id") or "doc-mock-1"),
            target_language=target_lang,
            summary=self._summary(target_lang, total, abnormal_count),
            key_findings=key_findings,
            educational_context=self._educational_context(target_lang),
            disclaimer=self._disclaimer(target_lang),
            citations=citations,
            insufficient_evidence=(total == 0),
            review_warnings=[] if total else ["No laboratory values were recognized in this report."],
        )

    @staticmethod
    def _extract_json_block(prompt: str, tag: str) -> Optional[Dict[str, Any]]:
        match = re.search(rf"<{tag}>\s*(.*?)\s*</{tag}>", prompt, re.DOTALL)
        if not match:
            return None
        try:
            return json.loads(match.group(1))
        except Exception:
            return None

    @staticmethod
    def _lay_explanation(
        lang: str, test: str, value: str, unit: str, ref_txt: str, abnormal: bool
    ) -> str:
        measured = f"{value} {unit}".strip() or value
        if lang == "hi":
            if abnormal:
                base = f"{test} आपका स्तर {measured} दिखाता है। यह सामान्य सीमा से बाहर है।"
                if ref_txt:
                    base += f" सामान्य सीमा {ref_txt} है।"
                return base + " कृपया अपने डॉक्टर से इस बारे में बात करें।"
            return f"{test} आपका स्तर {measured} दिखाता है। यह सामान्य सीमा में है, इसलिए चिंता की बात नहीं है।"
        if lang == "mr":
            if abnormal:
                base = f"{test} तुमची पातळी {measured} दाखवते. हे सामान्य मर्यादेबाहेर आहे."
                if ref_txt:
                    base += f" सामान्य मर्यादा {ref_txt} आहे."
                return base + " कृपया डॉक्टरांशी याबद्दल बोला."
            return f"{test} तुमची पातळी {measured} दाखवते. हे सामान्य मर्यादेत आहे, काळजीचे कारण नाही."
        if abnormal:
            base = f"Your {test} shows {measured}."
            if ref_txt:
                base += f" The normal range is {ref_txt}."
            return base + " This is outside the normal range, so please talk to your doctor about it."
        return f"Your {test} shows {measured}. This is inside the normal range, so there is nothing to worry about."

    @staticmethod
    def _summary(lang: str, total: int, abnormal: int) -> str:
        if total == 0:
            if lang == "hi":
                return "इस रिपोर्ट में कोई स्पष्ट जांच मान नहीं मिला।"
            if lang == "mr":
                return "या अहवालात कोणतीही स्पष्ट चाचणी मूल्ये आढळली नाहीत."
            return "No clear test values were found in this report."
        if lang == "hi":
            if abnormal == 0:
                return f"इस रिपोर्ट में {total} जांच नतीजे हैं और सभी सामान्य सीमा में हैं।"
            return f"इस रिपोर्ट में {total} जांच नतीजे हैं। इनमें से {abnormal} पर ध्यान देने की जरूरत है।"
        if lang == "mr":
            if abnormal == 0:
                return f"या अहवालात {total} चाचणी निकाल आहेत आणि सर्व सामान्य मर्यादेत आहेत."
            return f"या अहवालात {total} चाचणी निकाल आहेत. त्यापैकी {abnormal} कडे लक्ष देणे आवश्यक आहे."
        if abnormal == 0:
            return f"This report has {total} test result(s). All of them are inside their normal ranges."
        plural = "need" if abnormal > 1 else "needs"
        return f"This report has {total} test result(s). {abnormal} of them {plural} attention."

    @staticmethod
    def _educational_context(lang: str) -> str:
        if lang == "hi":
            return ("यह जानकारी केवल शिक्षा के लिए है। रक्त और मूत्र जांच शरीर के कामकाज को समझने में मदद करती है। "
                    "सही सलाह के लिए हमेशा डॉक्टर से मिलें।")
        if lang == "mr":
            return ("ही माहिती केवळ शिक्षणासाठी आहे. रक्त व लघवी तपासणी शरीराचे कार्य समजण्यास मदत करते. "
                    "योग्य सल्ल्यासाठी नेहमी डॉक्टरांना भेटा.")
        return ("This information is for learning only. Blood and urine tests help us understand how your body is working. "
                "Always meet your doctor for the right advice.")

    @staticmethod
    def _disclaimer(lang: str) -> str:
        if lang == "hi":
            return "यह व्याख्या केवल शैक्षिक है और चिकित्सीय सलाह नहीं है। कृपया अपने डॉक्टर से परामर्श लें।"
        if lang == "mr":
            return "ही स्पष्टीकरण केवळ शैक्षणिक आहे आणि वैद्यकीय सल्ला नाही. कृपया डॉक्टरांचा सल्ला घ्या."
        return ("This explanation is educational and does not constitute medical diagnosis or advice. "
                "Please consult your physician.")

    def _mock_qna(self, prompt: str) -> QuestionAnswerResponse:
        # Extract user question from prompt
        q_match = re.search(r"Question:\s*(.*?)\n\n", prompt, re.DOTALL)
        question = q_match.group(1).strip() if q_match else "User Question"

        # Extract target language
        lang_match = re.search(r"Preferred language:\s*([a-zA-Z]{2})", prompt)
        target_lang = (lang_match.group(1).lower() if lang_match else "en") or "en"

        # Extract evidence text from prompt if present
        evidence_match = re.search(r"<evidence>\s*(.*?)\s*</evidence>", prompt, re.DOTALL)
        evidence_text = evidence_match.group(1).strip() if evidence_match else ""

        # Sufficiency: at least one meaningful question keyword must appear in the evidence
        stopwords = {
            "what", "is", "are", "the", "this", "that", "my", "me", "about", "does", "do",
            "how", "why", "when", "where", "which", "tell", "explain", "value", "values",
            "result", "results", "test", "tests", "for", "and", "or", "of", "in", "on",
            "to", "a", "an", "please", "show", "shows", "reported", "report", "was", "were",
            "can", "you", "your", "have", "has", "had", "any", "there", "with", "from",
            "normal", "abnormal", "level", "levels", "reading", "readings", "number",
            "much", "many", "did", "get", "got", "given", "recent", "latest",
        }
        tokens = [w for w in re.findall(r"[a-z0-9]{3,}", question.lower()) if w not in stopwords]
        evidence_lower = evidence_text.lower()
        matched = [t for t in tokens if t in evidence_lower]

        if not evidence_text or not matched:
            return QuestionAnswerResponse(
                document_id="doc-mock-qna",
                question=question,
                answer=self._qna_phrase(target_lang, "insufficient"),
                target_language=target_lang,
                status="INSUFFICIENT_EVIDENCE",
                citations=[],
                warnings=["Query pertains to facts not present in approved source document."],
            )

        best_line = evidence_text.splitlines()[0].strip()
        for line in evidence_text.splitlines():
            if any(t in line.lower() for t in matched):
                best_line = line.strip()
                break
        best_line = re.sub(r"^\[cit-\d+\]\s*", "", best_line)

        citations = [
            Citation(
                citation_id="cit-qna-1",
                source_page=1,
                section_name="LABORATORY RESULTS",
                evidence_text=best_line,
                relevance_score=0.98,
            )
        ]

        return QuestionAnswerResponse(
            document_id="doc-mock-qna",
            question=question,
            answer=self._qna_phrase(target_lang, "answer", best_line),
            target_language=target_lang,
            status="ANSWERED",
            citations=citations,
            warnings=[],
        )

    @staticmethod
    def _qna_phrase(lang: str, kind: str, detail: str = "") -> str:
        if kind == "insufficient":
            if lang == "hi":
                return "यह जानकारी आपकी रिपोर्ट में नहीं मिली। कृपया अपने डॉक्टर से पूछें।"
            if lang == "mr":
                return "ही माहिती तुमच्या अहवालात आढळली नाही. कृपया डॉक्टरांना विचारा."
            return "I could not find this information in your report. Please ask your doctor."
        if lang == "hi":
            return f"आपकी रिपोर्ट के अनुसार: {detail}"
        if lang == "mr":
            return f"तुमच्या अहवालानुसार: {detail}"
        return f"From your report: {detail}"


    def _mock_translation(self, prompt: str) -> TranslationResponse:
        target_lang = "hi" if "target_language: hi" in prompt.lower() else "mr"
        return TranslationResponse(
            original_text="Hemoglobin is 13.5 g/dL which is within normal limits.",
            translated_text="हीमोग्लोबिन 13.5 g/dL है जो सामान्य सीमा के भीतर है।" if target_lang == "hi" else "हिमोग्लोबिन 13.5 g/dL आहे जे सामान्य मर्यादेत आहे.",
            source_language="en",
            target_language=target_lang,
            preserved_terms=["Hemoglobin", "13.5", "g/dL"],
            quality_score=0.98,
        )
