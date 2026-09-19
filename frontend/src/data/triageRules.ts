/**
 * TRIAGE RULES — Doctor/Hospital Staff Editable
 *
 * HOW TO MODIFY:
 * - Add keywords to any rule's `keywords` array (lowercase).
 * - Change `dept` to route to a different department key.
 * - Add a new rule object to the TRIAGE_RULES array.
 * - Emergency keywords are in EMERGENCY_KEYWORDS — add any critical symptom there.
 *
 * IMPORTANT: These rules only suggest a department. They are NOT medical diagnoses.
 */

import type { DeptKey } from "./doctors";

export interface TriageRule {
  keywords: string[];
  dept: DeptKey;
}

/** If ANY of these words appear in the symptom input → Emergency immediately */
export const EMERGENCY_KEYWORDS: string[] = [
  "chest pain",
  "heart attack",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "breathless",
  "unconscious",
  "fainted",
  "heavy bleeding",
  "severe bleeding",
  "stroke",
  "paralysis",
  "sudden weakness",
  "severe headache",
  "head injury",
  "accident",
  // Hindi
  "सीने में दर्द",
  "सांस नहीं",
  "बेहोश",
  "अत्यधिक रक्तस्राव",
  // Gujarati
  "છાતીમાં દુખાવો",
  "શ્વાસ નથી",
  "બેભાન",
  "ભારે રક્તસ્ત્રાવ",
];

/** Ordered rules — first match wins */
export const TRIAGE_RULES: TriageRule[] = [
  {
    keywords: ["skin", "rash", "acne", "eczema", "itching", "allergy", "hair loss", "nail", "त्वचा", "खुजली", "दाने", "ત્વચા", "ખંજવાળ"],
    dept: "dept_derma",
  },
  {
    keywords: ["bone", "joint", "fracture", "back pain", "knee", "shoulder", "spine", "arthritis", "हड्डी", "जोड़", "कमर दर्द", "हड्डी में दर्द", "હાડકું", "સાંધો", "કમર દુખાવો"],
    dept: "dept_ortho",
  },
  {
    keywords: ["pregnancy", "periods", "menstrual", "uterus", "ovary", "vaginal", "गर्भावस्था", "मासिक", "गर्भाशय", "ગર્ભાવસ્થા", "માસિક", "ગર્ભાશય"],
    dept: "dept_gynec",
  },
  {
    keywords: ["child", "baby", "infant", "toddler", "newborn", "बच्चा", "शिशु", "बच्चे", "બાળક", "શિશુ"],
    dept: "dept_pedia",
  },
  {
    keywords: ["ear", "nose", "throat", "hearing", "tonsil", "sinus", "कान", "नाक", "गला", "कान-नाक", "કાન", "નાક", "ગળું"],
    dept: "dept_ent",
  },
  {
    keywords: ["eye", "vision", "blur", "cataract", "glasses", "आंख", "दृष्टि", "धुंधला", "આંખ", "દ્રષ્ટિ", "ઝાંખું"],
    dept: "dept_ophthal",
  },
  {
    keywords: ["tooth", "teeth", "gum", "dental", "cavity", "mouth pain", "दांत", "मसूड़े", "दंत", "દાંત", "પેઢા", "દંત"],
    dept: "dept_dental",
  },
  {
    keywords: ["age below 12", "age under 12", "12 years", "10 years", "8 years", "6 years", "5 years", "4 years", "3 years", "2 years", "1 year"],
    dept: "dept_pedia",
  },
  // Default fallback — general medicine covers fever, cold, cough, diabetes, BP, etc.
  {
    keywords: ["fever", "cold", "cough", "diabetes", "blood pressure", "bp", "sugar", "fatigue", "weakness", "headache", "stomach", "vomit", "diarrhea", "बुखार", "खांसी", "जुकाम", "मधुमेह", "तनाव", "ताव", "ઉધરસ", "ઝાડા", "ઉલ્ટી"],
    dept: "dept_general",
  },
];

/** Fallback department when no rule matches */
export const DEFAULT_DEPT: DeptKey = "dept_general";
