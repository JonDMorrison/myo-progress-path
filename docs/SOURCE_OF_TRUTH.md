# ⚠️ DEVELOPER NOTICE: SOURCE OF TRUTH

> **This document is for developers only. NOT patient-facing.**

---

## Authoritative Documents

All program structure, exercises, instructions, cadence, and assessments **MUST** be copied **verbatim** from these two documents:

### 1. Myofunctional Therapy Program – WITHOUT Frenectomy
- **File**: `docs/source-of-truth/MFT_without_Frenectomy.docx`
- **Authors**: Samantha Raniak, RDH, OMT & Matt Francisco, DMD
- **Database Program**: `Non-Frenectomy Program` (program_variant: `non_frenectomy`)

### 2. Myofunctional Therapy Program – WITH Frenectomy
- **File**: `docs/source-of-truth/MFT_with_Frenectomy.docx`
- **Authors**: Samantha Raniak, RDH, OMT & Matt Francisco, DMD
- **Database Program**: `Frenectomy Program` (program_variant: `frenectomy`)

---

## ⛔ STRICT RULES

1. **NO summarization** – Copy exercise names, instructions, and details exactly as written
2. **NO rewording** – Use the exact language from the source documents
3. **NO inferred changes** – If it's not explicitly in the document, don't add it
4. **NO modifications** – Cadence, frequency, duration must match exactly

---

## 🚩 Content Mapping Requirements

When implementing or updating program content:

1. **Every exercise** in the app must map directly to an exercise in the source document
2. **Every instruction** must be verbatim from the source
3. **Every week structure** must match the document's week groupings
4. **Every assessment/checklist** must match the document's requirements

---

## 🔴 Flagging Non-Mapped Content

If existing content in the database **cannot** be mapped directly to these documents:

1. Add a comment in the code: `// FLAG: Cannot map to source document`
2. Log the discrepancy in `docs/CONTENT_DISCREPANCIES.md`
3. Do NOT delete or modify until clinician review

---

## Document Structure Reference

### WITHOUT Frenectomy (24 Weeks)
- Week 1-2: Foundation exercises (Clicks, Brushing, Tongue Trace, BOLT, Elastic Hold)
- Weeks 3-24: Progressive exercise program without surgical recovery periods
- Introduces elastic holds and mouth taping earlier in program

### WITH Frenectomy (24 Weeks)
- Week 1-2: Pre-frenectomy foundation
- Week 3-8: Pre-operative preparation
- Week 9-10: Pre-operative protocol (Dr. Caylor's)
- Post-frenectomy: Modified/gentle exercises during recovery
- Week 11-24: Progressive rehabilitation and mastery

---

## Version Control

| Date | Action | By |
|------|--------|-----|
| 2025-01-29 | Source documents added to repository | System |

---

## Contact for Clinical Questions

For any questions about exercise interpretation or program structure:
- **Samantha Raniak, RDH, OMT** – Clinical Lead
- **Email**: myo@montrosedentalcentre.com
