# Task Plan 08: Bilingual Localization Engine (Arabic & English)

## 1. Executive Summary
Provide comprehensive bilingual interface support for the Markdown Document Station, allowing users to seamlessly toggle between Arabic (العربية) and English with instant dynamic direction switching (`dir="rtl"` vs `dir="ltr"`), localized typography, persistent preference storage, and localized UI controls and diagnostics.

---

## 2. Technical Scope & Architecture
- **Language Dictionary Service (`src/services/i18n.service.ts`):**
  - Strongly-typed translation keys for all UI components (Navbar, DynamicOutline, DiagramModal, DiagramThemeModal, DiagnosticsDrawer, DocumentViewer empty states, buttons, tooltips).
  - Supported Locales: `ar` (Arabic - default) and `en` (English).
  - Dynamic `document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')` and `lang` attribute.
  - Persistent storage in `localStorage` under `md_reader_locale`.
- **UI Language Switcher Component:**
  - Modern toggle button in `Navbar.tsx` (e.g. `AR / EN` pill selector).
- **Document Rendering Alignment:**
  - BiDi arbitrator respects content direction while UI adapts to active language chrome.

---

## 3. Verification Criteria
- [ ] Language toggle instantly switches all UI labels between Arabic and English without page reload.
- [ ] Root `dir` switches between `rtl` and `ltr` smoothly with correct flex/grid alignments.
- [ ] Zero TypeScript errors and clean production build.
