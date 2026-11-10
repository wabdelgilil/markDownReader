# Task Plan 18: Word BiDi Run Segmentation & Direct PDF Export Polish (Phase 2)

## 1. Executive Summary
Polish the remaining nuances identified from the 9-page visual inspection of the Word export and direct PDF generator, ensuring complete parity with the markdown reading experience.

---

## 2. Granular Action Items for Resumption

### A. Word DOCX Engine (`src/services/exporters/word/`):
1. **BiDi Run Segmentation in Headings & Mixed Paragraphs:**
   * Detect paragraph-level direction dynamically via `BiDiArbitrator.detectDirection()`.
   * Isolate English phrases (e.g., `(Bilingual Coexistence & BiDi Showcase)`) so parentheses and neutral characters do not flip or split across lines.
   * Render English paragraphs/sections with native LTR alignment (`<w:jc w:val="left"/>`) without forcing `<w:bidi/>`.
2. **List Item Direction & Bullet Alignment:**
   * Align bullet points on the left for English list items and on the right for Arabic list items.
3. **Callout Box Flow & Non-Splitting:**
   * Set `<w:trPr><w:cantSplit/></w:trPr>` and `<w:pPr><w:keepNext/></w:pPr>` on alert boxes so they never split across page boundaries.
   * Position the colored border on the leading edge (right for Arabic, left for English).

### B. Direct PDF Exporter (`src/services/exporters/pdf.exporter.ts`):
1. **Hide Interactive UI Controls in Print:**
   * Hide diagram action buttons (`.diagram-action-btn`, `.diagram-toolbar`) in print styles.
2. **Prism Syntax Highlighting in Print:**
   * Embed GitHub-style clean syntax highlighting colors into the print iframe so code cards maintain colored tokens in PDF.
3. **Strict A4 Pagination & Header/Footer Precision:**
   * Ensure running page numbers and document titles align cleanly across all pages.

---

## 3. Verification Criteria
* Visual inspection of rendered PNG pages across all 9 pages showing zero overlap, correct text direction, and clean math accents.
* `npm run typecheck` passes with 0 errors.
* `npm run build` succeeds cleanly.
