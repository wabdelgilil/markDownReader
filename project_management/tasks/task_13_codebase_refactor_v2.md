# Task Plan 13: Enterprise Modular Architecture Refactoring (Phase 2)

## 1. Executive Summary
Enforce the Rule 5 enterprise architecture and file sizing directives (< 400-500 lines per file, Single Responsibility Principle, zero dead code) across all newly developed sub-systems:
1. Decompose monolithic Word DOCX generator (665 lines) by isolating static OpenXML document manifests and schemas into `openxml.templates.ts`.
2. Decompose the monolithic `i18n.service.ts` (409 lines) into a modular dictionary directory structure (`src/services/i18n/locales/ar.ts`, `en.ts`, `types.ts`, and core service).
3. Decompose monolithic `Navbar.tsx` (350 lines) into cohesive, single-responsibility presentational units (`TabStrip.tsx`, `ExportDropdown.tsx`, `ThemeSwitcher.tsx`).
4. Eliminate obsolete prototype artifact (`src/services/exporter.service.ts`).

---

## 2. Technical Scope
- **DOCX Generator Decomposition:**
  - Create `src/services/exporters/word/openxml.templates.ts` housing Content Types, Root Rels, Document Rels, Settings, Styles, and Font Table OpenXML schemas.
  - Retain purely DOM-to-DOCX node parsing and AST conversion in `docx.generator.ts` (< 350 lines).
- **i18n Modularization:**
  - Create `src/services/i18n/types.ts` for dictionary schemas.
  - Extract Arabic translations into `src/services/i18n/locales/ar.ts`.
  - Extract English translations into `src/services/i18n/locales/en.ts`.
  - Maintain transparent re-export from `src/services/i18n.service.ts` for zero-breakage backward compatibility.
- **Navbar Decomposition:**
  - Create `src/ui/components/navbar/TabStrip.tsx` handling tab clicks, close buttons, active tab indicator, and add file action.
  - Create `src/ui/components/navbar/ExportDropdown.tsx` handling multi-format export menu items and outside click dismissal.
  - Create `src/ui/components/navbar/ThemeSwitcher.tsx` handling icon-only theme selector buttons.
  - Streamline `Navbar.tsx` to orchestrate actions cleanly (< 150 lines).
- **Hygiene & Dead Code Elimination:**
  - Safely remove unused legacy `src/services/exporter.service.ts`.

---

## 3. Verification Criteria
1. `npx tsc --noEmit` passes with 0 errors.
2. `npm run build` succeeds cleanly.
3. No file in `src/` exceeds 500 lines of code.
4. All tab navigation, theme switching, outline toggling, and multi-format exports remain 100% functional without regressions.
