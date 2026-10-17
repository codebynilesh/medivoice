import { createContext, useContext, useEffect, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

const EN = {
  'brand.sub': 'Clinical document privacy',

  'nav.home': 'Home',
  'nav.how': 'How it works',
  'nav.about': 'About',
  'nav.upload': 'Upload report',
  'nav.language': 'Language',

  'hero.eyebrow': 'Privacy-first clinical AI',
  'hero.title1': 'Your medical reports,',
  'hero.title2': ' explained in your language.',
  'hero.sub':
    'Medivoice turns dense diagnostic reports into clear, verified explanations. It reads PDFs, images and scans, grounds every answer in trusted medical knowledge, translates to regional Indian languages, and keeps your data private — all without sending it to the cloud.',
  'hero.trust1': 'Local-first & offline-capable',
  'hero.trust2': 'Guardrails-enforced safety',
  'hero.trust3': 'Free for patients',
  'hero.stat1': 'Agent pipeline',
  'hero.stat2': 'RAG grounding',
  'hero.stat3': 'Languages',
  'hero.cardTitle': 'Process a document',
  'hero.badge': 'Secure intake',
  'hero.viewResult': 'View result',
  'hero.foot': 'Files validated by signature · max 25 MB · PDF, PNG, JPEG',

  'upload.processing': 'Processing document…',
  'upload.dropTitle': 'Drop a clinical document here',
  'upload.dropSub': 'or click to browse — PDF, PNG, JPEG up to 25 MB',
  'upload.busySub': 'Running secure intake, extraction & de-identification',
  'upload.errType': 'Only PDF, PNG, or JPEG documents are supported.',
  'upload.errSize': 'File exceeds the 25 MB upload limit.',

  'how.eyebrow': 'How it works',
  'how.title': 'From raw report to trusted, spoken insight',
  'how.sub':
    'Medivoice runs a multi-step pipeline. Every stage is structured, grounded and auditable — so patients get an explanation they can trust and actually understand.',
  'how.step': 'step',
  'how.s1t': 'Secure intake & OCR',
  'how.s1b':
    'PDFs, images and physical scans are validated and read with OCR, then structured into strict schemas.',
  'how.s2t': 'Analysis & retrieval',
  'how.s2b':
    'Deterministic biomarker rules flag abnormalities while hybrid retrieval pulls verified context from trusted sources.',
  'how.s3t': 'Simplify & translate',
  'how.s3b':
    'Clinical jargon is rewritten into plain language, then translated to Hindi and Marathi with medical terms preserved.',
  'how.s4t': 'Voice & delivery',
  'how.s4b':
    'Lightweight neural TTS narrates the result in your language on a dashboard with downloadable summaries — built for low-literacy users.',

  'about.eyebrow': 'About Medivoice',
  'about.title': 'Privacy-first, free, and accessible medical AI',
  'about.sub':
    'Millions of patients receive diagnostic reports filled with clinical jargon they cannot interpret. Limited consultation time, language gaps and low literacy leave them confused about their own health. Medivoice bridges that literacy gap — securely, at no cost, on everyday hardware.',
  'about.p1t': 'Local-first privacy',
  'about.p1b':
    'Engineered to run on standard 8GB RAM hardware, including offline. Your reports and personal data never leave your device or reach external cloud servers.',
  'about.p2t': 'Multi-agent intelligence',
  'about.p2b':
    'An orchestration pipeline with strict extraction schemas keeps every step structured, validated and fully auditable.',
  'about.p3t': 'Hybrid retrieval grounding',
  'about.p3b':
    'Vector search combined with exact-match retrieval over trusted medical knowledge cuts hallucination and keeps answers evidence-based.',
  'about.p4t': 'Accessible for everyone',
  'about.p4b':
    'Plain-language explanations, regional Indic translation and clear presentation make health information usable by low-literacy users.',

  'footer.tagline':
    'Privacy-first clinical document processing. De-identify before you analyse.',
  'footer.product': 'Product',
  'footer.developers': 'Developers',
  'footer.health': 'Health endpoint',
  'footer.capabilities': 'AI capabilities',
  'footer.apiBase': 'API base',
  'footer.disclaimer':
    'Educational use only — not a substitute for professional medical advice.',

  'rs.eyebrow': 'Your report, explained',
  'rs.title': 'Simple results in your language',
  'rs.lead':
    'We removed your personal details (name, address, date of birth) before analysing. Only the medical values are shown.',
  'rs.newUpload': 'New upload',

  'ws.deidSummary': 'De-identified clinical text',
  'ws.deidHint': 'Click to expand — your personal details were removed.',
  'ws.document': 'Document',
  'ws.tabOverview': 'Overview',
  'ws.tabClinical': 'Clinical data',
  'ws.tabAsk': 'Ask',
  'ws.tabTranslate': 'Translate',
  'ws.tabDisabled': 'Available after the document is approved',
  'ws.refresh': 'Refresh',
  'ws.refreshing': 'Refreshing…',
  'ws.delete': 'Delete',
  'ws.newUpload': 'New upload',
  'ws.confirmDelete': 'Delete this document and all derived artifacts?',
  'ws.confirmNewUpload':
    'Start a new upload? This will discard the current report and results.',

  'ov.notApproved': 'This document has not been approved for release yet.',
  'ov.currentStatus': 'Current status',
  'ov.stage': 'stage',
  'ov.releaseStatus': 'Release status',
  'ov.pages': 'Pages',
  'ov.extraction': 'Extraction',
  'ov.privacyValidation': 'Privacy validation',
  'ov.clinicalSections': 'Clinical sections',
  'ov.protectedEntities': 'Protected entities',
  'ov.noEntities': 'No sensitive entities were detected.',
  'ov.qualityChecks': 'Quality checks',
  'ov.schemaValid': 'Schema valid',
  'ov.clinicalPreserved': 'Clinical content preserved',
  'ov.residual': 'Residual identifiers',
  'ov.methods': 'Extraction methods',

  'cd.loading': 'Extracting clinical data…',
  'cd.docType': 'Document type',
  'cd.language': 'Language',
  'cd.quality': 'Quality score',
  'cd.obs': 'Laboratory observations',
  'cd.noObs': 'No structured observations detected.',
  'cd.test': 'Test',
  'cd.value': 'Value',
  'cd.unit': 'Unit',
  'cd.reference': 'Reference',
  'cd.status': 'Status',
  'cd.entities': 'Clinical entities',
  'cd.medications': 'Medications',
  'cd.none': 'None detected.',
  'cd.negated': 'negated',
  'cd.uncertain': 'uncertain',

  'qa.placeholder': 'Ask a question about this report…',
  'qa.ask': 'Ask',
  'qa.asking': 'Asking…',
  'qa.tip': 'Try: "What is my glucose?" or "Is my hemoglobin normal?"',
  'qa.statusAnswered': 'Answered',
  'qa.statusInsufficient': 'Not found in report',
  'qa.statusRestricted': 'Blocked for safety',

  'tr.from': 'From',
  'tr.to': 'To',
  'tr.translate': 'Translate',
  'tr.translating': 'Translating…',
  'tr.source': 'Source text',
  'tr.result': 'Translation',
  'tr.sourcePlaceholder': 'Paste or type text to translate…',
  'tr.preserved': 'Preserved medical terms',
  'tr.willAppear': 'Translation will appear here.',
  'tr.sameLang': 'Select a different target language to translate.',

  'common.page': 'page',
  'common.statusNormal': 'Normal',
  'common.statusAttention': 'Needs attention',
  'common.statusInformational': 'Information',

  'app.rejected':
    'The document was rejected by the privacy release gate and cannot be viewed.',

  'health.up': 'Backend connected',
  'health.down': 'Backend offline',
  'health.checking': 'Checking backend…',
};

const HI = {
  'brand.sub': 'क्लिनिकल दस्तावेज़ गोपनीयता',

  'nav.home': 'होम',
  'nav.how': 'यह कैसे काम करता है',
  'nav.about': 'परिचय',
  'nav.upload': 'रिपोर्ट अपलोड करें',
  'nav.language': 'भाषा',

  'hero.eyebrow': 'गोपनीयता-प्रथम क्लिनिकल AI',
  'hero.title1': 'आपकी मेडिकल रिपोर्ट,',
  'hero.title2': ' आपकी भाषा में समझाई गई।',
  'hero.sub':
    'Medivoice जटिल डायग्नोस्टिक रिपोर्ट को सरल और सत्यापित जानकारी में बदलता है। यह PDF, इमेज और स्कैन पढ़ता है, हर उत्तर को भरोसेमंद मेडिकल जानकारी पर आधारित रखता है, क्षेत्रीय भारतीय भाषाओं में अनुवाद करता है — और आपका डेटा निजी रखता है, क्लाउड पर भेजे बिना।',
  'hero.trust1': 'लोकल-प्रथम और ऑफलाइन-सक्षम',
  'hero.trust2': 'गार्डरेल-सुरक्षित',
  'hero.trust3': 'मरीजों के लिए मुफ्त',
  'hero.stat1': 'एजेंट पाइपलाइन',
  'hero.stat2': 'RAG ग्राउंडिंग',
  'hero.stat3': 'भाषाएं',
  'hero.cardTitle': 'दस्तावेज़ प्रोसेस करें',
  'hero.badge': 'सुरक्षित इनटेक',
  'hero.viewResult': 'परिणाम देखें',
  'hero.foot': 'हस्ताक्षर से सत्यापित · अधिकतम 25 MB · PDF, PNG, JPEG',

  'upload.processing': 'दस्तावेज़ प्रोसेस हो रहा है…',
  'upload.dropTitle': 'यहां क्लिनिकल दस्तावेज़ छोड़ें',
  'upload.dropSub': 'या ब्राउज़ करने के लिए क्लिक करें — PDF, PNG, JPEG, 25 MB तक',
  'upload.busySub': 'सुरक्षित इनटेक, एक्सट्रैक्शन और डी-आइडेंटिफिकेशन चल रहा है',
  'upload.errType': 'केवल PDF, PNG या JPEG दस्तावेज़ समर्थित हैं।',
  'upload.errSize': 'फ़ाइल 25 MB की सीमा से बड़ी है।',

  'how.eyebrow': 'यह कैसे काम करता है',
  'how.title': 'कच्ची रिपोर्ट से भरोसेमंद जानकारी तक',
  'how.sub':
    'Medivoice एक बहु-चरणीय पाइपलाइन चलाता है। हर चरण संरचित, ग्राउंडेड और ऑडिट-योग्य है — ताकि मरीजों को भरोसेमंद और आसान समझ आने वाली जानकारी मिले।',
  'how.step': 'चरण',
  'how.s1t': 'सुरक्षित इनटेक और OCR',
  'how.s1b':
    'PDF, इमेज और स्कैन को सत्यापित करके OCR से पढ़ा जाता है, फिर कठोर स्कीमा में व्यवस्थित किया जाता है।',
  'how.s2t': 'विश्लेषण और रिट्रीवल',
  'how.s2b':
    'नियम-आधारित जांच असामान्यताएं दिखाती है, और हाइब्रिड रिट्रीवल भरोसेमंद स्रोतों से सत्यापित जानकारी लाता है।',
  'how.s3t': 'सरल करें और अनुवाद करें',
  'how.s3b':
    'क्लिनिकल शब्दों को सरल भाषा में बदला जाता है, फिर मेडिकल शब्द सुरक्षित रखते हुए हिंदी और मराठी में अनुवाद किया जाता है।',
  'how.s4t': 'आवाज़ और प्रस्तुति',
  'how.s4b':
    'हल्का न्यूरल TTS परिणाम को आपकी भाषा में सुनाता है और डैशबोर्ड पर डाउनलोड करने योग्य सारांश देता है — कम साक्षरता वाले उपयोगकर्ताओं के लिए।',

  'about.eyebrow': 'Medivoice के बारे में',
  'about.title': 'गोपनीयता-प्रथम, मुफ्त और सुलभ मेडिकल AI',
  'about.sub':
    'लाखों मरीजों को ऐसी डायग्नोस्टिक रिपोर्ट मिलती हैं जो क्लिनिकल शब्दों से भरी होती हैं और समझ नहीं आतीं। कम परामर्श समय, भाषा की बाधा और कम साक्षरता उन्हें अपनी सेहत के बारे में उलझन में डाल देती है। Medivoice इस साक्षरता अंतर को सुरक्षित रूप से, बिना किसी शुल्क के, आम हार्डवेयर पर पाटता है।',
  'about.p1t': 'लोकल-प्रथम गोपनीयता',
  'about.p1b':
    '8GB RAM वाले सामान्य हार्डवेयर पर, ऑफलाइन भी चलने के लिए बनाया गया। आपकी रिपोर्ट और निजी डेटा आपके डिवाइस से बाहर या क्लाउड सर्वर तक कभी नहीं जाते।',
  'about.p2t': 'बहु-एजेंट बुद्धिमत्ता',
  'about.p2b':
    'कठोर एक्सट्रैक्शन स्कीमा वाली ऑर्केस्ट्रेशन पाइपलाइन हर चरण को संरचित, सत्यापित और पूरी तरह ऑडिट-योग्य रखती है।',
  'about.p3t': 'हाइब्रिड रिट्रीवल ग्राउंडिंग',
  'about.p3b':
    'भरोसेमंद मेडिकल ज्ञान पर वेक्टर सर्च और सटीक-मिलान रिट्रीवल मिलकर भ्रम कम करते हैं और उत्तरों को साक्ष्य-आधारित रखते हैं।',
  'about.p4t': 'सबके लिए सुलभ',
  'about.p4b':
    'सरल भाषा में व्याख्या, क्षेत्रीय भारतीय भाषाओं में अनुवाद और स्पष्ट प्रस्तुति स्वास्थ्य जानकारी को कम साक्षरता वाले उपयोगकर्ताओं के लिए उपयोगी बनाती है।',

  'footer.tagline':
    'गोपनीयता-प्रथम क्लिनिकल दस्तावेज़ प्रोसेसिंग। विश्लेषण से पहले डी-आइडेंटिफाई करें।',
  'footer.product': 'उत्पाद',
  'footer.developers': 'डेवलपर्स',
  'footer.health': 'हेल्थ एंडपॉइंट',
  'footer.capabilities': 'AI क्षमताएं',
  'footer.apiBase': 'API बेस',
  'footer.disclaimer':
    'केवल शैक्षिक उपयोग हेतु — पेशेवर चिकित्सीय सलाह का विकल्प नहीं।',

  'rs.eyebrow': 'आपकी रिपोर्ट, समझाई गई',
  'rs.title': 'आपकी भाषा में सरल परिणाम',
  'rs.lead':
    'विश्लेषण से पहले हमने आपकी निजी जानकारी (नाम, पता, जन्म तिथि) हटा दी है। केवल मेडिकल मान दिखाए गए हैं।',
  'rs.newUpload': 'नया अपलोड',

  'ws.deidSummary': 'डी-आइडेंटिफाइड क्लिनिकल टेक्स्ट',
  'ws.deidHint': 'देखने के लिए क्लिक करें — आपकी निजी जानकारी हटा दी गई है।',
  'ws.tabOverview': 'सारांश',
  'ws.tabClinical': 'क्लिनिकल डेटा',
  'ws.tabAsk': 'पूछें',
  'ws.tabTranslate': 'अनुवाद',
  'ws.tabDisabled': 'दस्तावेज़ स्वीकृत होने के बाद उपलब्ध',
  'ws.refresh': 'रिफ्रेश',
  'ws.refreshing': 'रिफ्रेश हो रहा है…',
  'ws.delete': 'हटाएं',
  'ws.newUpload': 'नया अपलोड',
  'ws.confirmDelete': 'इस दस्तावेज़ और इससे बने सभी आर्टिफैक्ट हटाएं?',
  'ws.confirmNewUpload':
    'नया अपलोड शुरू करें? इससे वर्तमान रिपोर्ट और परिणाम हट जाएंगे।',

  'ov.notApproved': 'यह दस्तावेज़ अभी रिलीज़ के लिए स्वीकृत नहीं है।',
  'ov.currentStatus': 'वर्तमान स्थिति',
  'ov.stage': 'चरण',
  'ov.releaseStatus': 'रिलीज़ स्थिति',
  'ov.pages': 'पृष्ठ',
  'ov.extraction': 'एक्सट्रैक्शन',
  'ov.privacyValidation': 'गोपनीयता सत्यापन',
  'ov.clinicalSections': 'क्लिनिकल अनुभाग',
  'ov.protectedEntities': 'संरक्षित तत्व',
  'ov.noEntities': 'कोई संवेदनशील तत्व नहीं मिला।',
  'ov.qualityChecks': 'गुणवत्ता जांच',
  'ov.schemaValid': 'स्कीमा मान्य',
  'ov.clinicalPreserved': 'क्लिनिकल सामग्री सुरक्षित',
  'ov.residual': 'शेष पहचानकर्ता',
  'ov.methods': 'एक्सट्रैक्शन विधियां',

  'cd.loading': 'क्लिनिकल डेटा निकाला जा रहा है…',
  'cd.docType': 'दस्तावेज़ प्रकार',
  'cd.language': 'भाषा',
  'cd.quality': 'गुणवत्ता स्कोर',
  'cd.obs': 'प्रयोगशाला अवलोकन',
  'cd.noObs': 'कोई संरचित अवलोकन नहीं मिला।',
  'cd.test': 'जांच',
  'cd.value': 'मान',
  'cd.unit': 'इकाई',
  'cd.reference': 'संदर्भ',
  'cd.status': 'स्थिति',
  'cd.entities': 'क्लिनिकल तत्व',
  'cd.medications': 'दवाएं',
  'cd.none': 'कोई नहीं मिला।',
  'cd.negated': 'नकारात्मक',
  'cd.uncertain': 'अनिश्चित',

  'qa.placeholder': 'इस रिपोर्ट के बारे में सवाल पूछें…',
  'qa.ask': 'पूछें',
  'qa.asking': 'पूछा जा रहा है…',
  'qa.tip': 'कोशिश करें: "मेरा ग्लूकोज क्या है?" या "क्या मेरा हीमोग्लोबिन सामान्य है?"',
  'qa.statusAnswered': 'उत्तर दिया',
  'qa.statusInsufficient': 'रिपोर्ट में नहीं मिला',
  'qa.statusRestricted': 'सुरक्षा के लिए रोका गया',

  'tr.from': 'से',
  'tr.to': 'में',
  'tr.translate': 'अनुवाद करें',
  'tr.translating': 'अनुवाद हो रहा है…',
  'tr.source': 'स्रोत टेक्स्ट',
  'tr.result': 'अनुवाद',
  'tr.sourcePlaceholder': 'अनुवाद के लिए टेक्स्ट पेस्ट या टाइप करें…',
  'tr.preserved': 'सुरक्षित मेडिकल शब्द',
  'tr.willAppear': 'अनुवाद यहां दिखेगा।',
  'tr.sameLang': 'अनुवाद के लिए कोई दूसरी भाषा चुनें।',

  'common.page': 'पृष्ठ',
  'common.statusNormal': 'सामान्य',
  'common.statusAttention': 'ध्यान दें',
  'common.statusInformational': 'जानकारी',

  'app.rejected':
    'गोपनीयता रिलीज़ गेट ने इस दस्तावेज़ को अस्वीकार कर दिया, इसे देखा नहीं जा सकता।',

  'health.up': 'बैकएंड जुड़ा है',
  'health.down': 'बैकएंड ऑफलाइन',
  'health.checking': 'बैकएंड जांच रहा है…',
};

const MR = {
  'brand.sub': 'क्लिनिकल दस्तऐवज गोपनीयता',

  'nav.home': 'मुख्यपृष्ठ',
  'nav.how': 'हे कसे काम करते',
  'nav.about': 'आमच्याबद्दल',
  'nav.upload': 'अहवाल अपलोड करा',
  'nav.language': 'भाषा',

  'hero.eyebrow': 'गोपनीयता-प्रथम क्लिनिकल AI',
  'hero.title1': 'तुमचे वैद्यकीय अहवाल,',
  'hero.title2': ' तुमच्या भाषेत स्पष्ट केले.',
  'hero.sub':
    'Medivoice गुंतागुंतीचे निदान अहवाल स्पष्ट आणि पडताळलेल्या माहितीत बदलते. ते PDF, प्रतिमा व स्कॅन वाचते, प्रत्येक उत्तर विश्वासार्ह वैद्यकीय माहितीवर आधारित ठेवते, प्रादेशिक भारतीय भाषांमध्ये भाषांतर करते — आणि तुमची माहिती खाजगी ठेवते, क्लाउडवर न पाठवता.',
  'hero.trust1': 'लोकल-प्रथम व ऑफलाइन-सक्षम',
  'hero.trust2': 'गार्डरेल-सुरक्षित',
  'hero.trust3': 'रुग्णांसाठी मोफत',
  'hero.stat1': 'एजंट पाइपलाइन',
  'hero.stat2': 'RAG ग्राउंडिंग',
  'hero.stat3': 'भाषा',
  'hero.cardTitle': 'दस्तऐवज प्रक्रिया करा',
  'hero.badge': 'सुरक्षित इनटेक',
  'hero.viewResult': 'निकाल पाहा',
  'hero.foot': 'स्वाक्षरीद्वारे पडताळले · कमाल 25 MB · PDF, PNG, JPEG',

  'upload.processing': 'दस्तऐवज प्रक्रिया होत आहे…',
  'upload.dropTitle': 'इथे क्लिनिकल दस्तऐवज टाका',
  'upload.dropSub': 'किंवा ब्राउझ करण्यासाठी क्लिक करा — PDF, PNG, JPEG, 25 MB पर्यंत',
  'upload.busySub': 'सुरक्षित इनटेक, एक्सट्रॅक्शन व डी-आयडेंटिफिकेशन चालू आहे',
  'upload.errType': 'फक्त PDF, PNG किंवा JPEG दस्तऐवज समर्थित आहेत.',
  'upload.errSize': 'फाइल 25 MB मर्यादेपेक्षा मोठी आहे.',

  'how.eyebrow': 'हे कसे काम करते',
  'how.title': 'कच्च्या अहवालापासून विश्वासार्ह माहितीपर्यंत',
  'how.sub':
    'Medivoice बहु-टप्प्यांची पाइपलाइन चालवते. प्रत्येक टप्पा संरचित, ग्राउंडेड व ऑडिट-योग्य आहे — जेणेकरून रुग्णांना विश्वासार्ह आणि सहज समजणारी माहिती मिळेल.',
  'how.step': 'टप्पा',
  'how.s1t': 'सुरक्षित इनटेक व OCR',
  'how.s1b':
    'PDF, प्रतिमा व स्कॅन पडताळून OCR ने वाचले जातात, नंतर कठोर स्कीमामध्ये व्यवस्थित केले जातात.',
  'how.s2t': 'विश्लेषण व रिट्रीव्हल',
  'how.s2b':
    'नियम-आधारित तपासणी असामान्यता दर्शवते, आणि हायब्रिड रिट्रीव्हल विश्वासार्ह स्रोतांकडून पडताळलेली माहिती आणते.',
  'how.s3t': 'सोपे करा व भाषांतर करा',
  'how.s3b':
    'क्लिनिकल शब्द सोप्या भाषेत बदलले जातात, नंतर वैद्यकीय शब्द जपून हिंदी व मराठीत भाषांतर केले जाते.',
  'how.s4t': 'आवाज व सादरीकरण',
  'how.s4b':
    'हलके न्यूरल TTS निकाल तुमच्या भाषेत सांगते आणि डॅशबोर्डवर डाउनलोड करण्यायोग्य सारांश देते — कमी साक्षरतेच्या वापरकर्त्यांसाठी.',

  'about.eyebrow': 'Medivoice बद्दल',
  'about.title': 'गोपनीयता-प्रथम, मोफत आणि सुलभ वैद्यकीय AI',
  'about.sub':
    'लाखो रुग्णांना क्लिनिकल शब्दांनी भरलेले निदान अहवाल मिळतात जे त्यांना समजत नाहीत. कमी सल्ला-वेळ, भाषेचा अडथळा आणि कमी साक्षरता त्यांना स्वतःच्या आरोग्याबद्दल संभ्रमात टाकते. Medivoice हे साक्षरता-अंतर सुरक्षितपणे, विनाशुल्क, सामान्य हार्डवेअरवर भरून काढते.',
  'about.p1t': 'लोकल-प्रथम गोपनीयता',
  'about.p1b':
    '8GB RAM च्या सामान्य हार्डवेअरवर, ऑफलाइनही चालण्यासाठी तयार. तुमचे अहवाल व वैयक्तिक माहिती तुमच्या डिव्हाइसबाहेर किंवा क्लाउड सर्व्हरपर्यंत कधीही जात नाही.',
  'about.p2t': 'बहु-एजंट बुद्धिमत्ता',
  'about.p2b':
    'कठोर एक्सट्रॅक्शन स्कीमा असलेली ऑर्केस्ट्रेशन पाइपलाइन प्रत्येक टप्पा संरचित, पडताळलेला व पूर्णपणे ऑडिट-योग्य ठेवते.',
  'about.p3t': 'हायब्रिड रिट्रीव्हल ग्राउंडिंग',
  'about.p3b':
    'विश्वासार्ह वैद्यकीय ज्ञानावर व्हेक्टर सर्च आणि अचूक-जुळणी रिट्रीव्हल एकत्रितपणे गोंधळ कमी करतात व उत्तरे पुराव्यावर आधारित ठेवतात.',
  'about.p4t': 'सर्वांसाठी सुलभ',
  'about.p4b':
    'सोप्या भाषेतील स्पष्टीकरण, प्रादेशिक भारतीय भाषांमधील भाषांतर व स्पष्ट सादरीकरण आरोग्य माहिती कमी साक्षरतेच्या वापरकर्त्यांसाठी उपयुक्त करते.',

  'footer.tagline':
    'गोपनीयता-प्रथम क्लिनिकल दस्तऐवज प्रक्रिया. विश्लेषणापूर्वी डी-आयडेंटिफाय करा.',
  'footer.product': 'उत्पादन',
  'footer.developers': 'डेव्हलपर्स',
  'footer.health': 'हेल्थ एंडपॉइंट',
  'footer.capabilities': 'AI क्षमता',
  'footer.apiBase': 'API बेस',
  'footer.disclaimer':
    'फक्त शैक्षणिक वापरासाठी — व्यावसायिक वैद्यकीय सल्ल्याचा पर्याय नाही.',

  'rs.eyebrow': 'तुमचा अहवाल, स्पष्ट केला',
  'rs.title': 'तुमच्या भाषेत सोपे निकाल',
  'rs.lead':
    'विश्लेषणापूर्वी आम्ही तुमची वैयक्तिक माहिती (नाव, पत्ता, जन्मतारीख) काढून टाकली आहे. फक्त वैद्यकीय मूल्ये दाखवली आहेत.',
  'rs.newUpload': 'नवीन अपलोड',

  'ws.deidSummary': 'डी-आयडेंटिफाइड क्लिनिकल मजकूर',
  'ws.deidHint': 'पाहण्यासाठी क्लिक करा — तुमची वैयक्तिक माहिती काढून टाकली आहे.',
  'ws.tabOverview': 'सारांश',
  'ws.tabClinical': 'क्लिनिकल डेटा',
  'ws.tabAsk': 'विचारा',
  'ws.tabTranslate': 'भाषांतर',
  'ws.tabDisabled': 'दस्तऐवज मंजूर झाल्यानंतर उपलब्ध',
  'ws.refresh': 'रिफ्रेश',
  'ws.refreshing': 'रिफ्रेश होत आहे…',
  'ws.delete': 'हटवा',
  'ws.newUpload': 'नवीन अपलोड',
  'ws.confirmDelete': 'हा दस्तऐवज व त्यातून तयार झालेले सर्व आर्टिफॅक्ट हटवायचे?',
  'ws.confirmNewUpload':
    'नवीन अपलोड सुरू करायचे? यामुळे सध्याचा अहवाल व निकाल काढून टाकले जातील.',

  'ov.notApproved': 'हा दस्तऐवज अजून रिलीजसाठी मंजूर नाही.',
  'ov.currentStatus': 'सध्याची स्थिती',
  'ov.stage': 'टप्पा',
  'ov.releaseStatus': 'रिलीज स्थिती',
  'ov.pages': 'पाने',
  'ov.extraction': 'एक्सट्रॅक्शन',
  'ov.privacyValidation': 'गोपनीयता पडताळणी',
  'ov.clinicalSections': 'क्लिनिकल विभाग',
  'ov.protectedEntities': 'संरक्षित घटक',
  'ov.noEntities': 'कोणतेही संवेदनशील घटक आढळले नाहीत.',
  'ov.qualityChecks': 'गुणवत्ता तपासण्या',
  'ov.schemaValid': 'स्कीमा वैध',
  'ov.clinicalPreserved': 'क्लिनिकल सामग्री जपली',
  'ov.residual': 'उर्वरित ओळखकर्ते',
  'ov.methods': 'एक्सट्रॅक्शन पद्धती',

  'cd.loading': 'क्लिनिकल डेटा काढला जात आहे…',
  'cd.docType': 'दस्तऐवज प्रकार',
  'cd.language': 'भाषा',
  'cd.quality': 'गुणवत्ता स्कोअर',
  'cd.obs': 'प्रयोगशाळा निरीक्षणे',
  'cd.noObs': 'कोणतेही संरचित निरीक्षण आढळले नाही.',
  'cd.test': 'चाचणी',
  'cd.value': 'मूल्य',
  'cd.unit': 'एकक',
  'cd.reference': 'संदर्भ',
  'cd.status': 'स्थिती',
  'cd.entities': 'क्लिनिकल घटक',
  'cd.medications': 'औषधे',
  'cd.none': 'कोणतेही आढळले नाही.',
  'cd.negated': 'नकारात्मक',
  'cd.uncertain': 'अनिश्चित',

  'qa.placeholder': 'या अहवालाबद्दल प्रश्न विचारा…',
  'qa.ask': 'विचारा',
  'qa.asking': 'विचारत आहे…',
  'qa.tip': 'प्रयत्न करा: "माझा ग्लुकोज किती आहे?" किंवा "माझे हिमोग्लोबिन सामान्य आहे का?"',
  'qa.statusAnswered': 'उत्तर दिले',
  'qa.statusInsufficient': 'अहवालात आढळले नाही',
  'qa.statusRestricted': 'सुरक्षेसाठी थांबवले',

  'tr.from': 'पासून',
  'tr.to': 'मध्ये',
  'tr.translate': 'भाषांतर करा',
  'tr.translating': 'भाषांतर होत आहे…',
  'tr.source': 'स्रोत मजकूर',
  'tr.result': 'भाषांतर',
  'tr.sourcePlaceholder': 'भाषांतरासाठी मजकूर पेस्ट किंवा टाइप करा…',
  'tr.preserved': 'जपलेले वैद्यकीय शब्द',
  'tr.willAppear': 'भाषांतर इथे दिसेल.',
  'tr.sameLang': 'भाषांतरासाठी वेगळी भाषा निवडा.',

  'common.page': 'पृष्ठ',
  'common.statusNormal': 'सामान्य',
  'common.statusAttention': 'लक्ष द्या',
  'common.statusInformational': 'माहिती',

  'app.rejected':
    'गोपनीयता रिलीज गेटने हा दस्तऐवज नाकारला, तो पाहता येत नाही.',

  'health.up': 'बॅकएंड जोडलेले',
  'health.down': 'बॅकएंड ऑफलाइन',
  'health.checking': 'बॅकएंड तपासत आहे…',
};

const DICTS = { en: EN, hi: HI, mr: MR };

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('medivoice.lang') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('medivoice.lang', lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  function t(key, vars) {
    const dict = DICTS[lang] || EN;
    let s = dict[key] ?? EN[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.split(`{${k}}`).join(String(v));
      }
    }
    return s;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
