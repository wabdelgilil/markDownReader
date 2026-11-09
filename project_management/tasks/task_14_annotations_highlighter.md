# [TSK-14] Interactive Document Highlighting & Annotation Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a first-class, theme-adaptive text highlighting and annotation engine in MDFull, enabling readers to select text, apply semantic highlight colors, attach markdown notes, navigate notes via a dedicated slide-over drawer, and export summary reports.

**Architecture:** Decouple annotation state and persistence into a dedicated `AnnotationStore` service with DOM range anchoring; provide a responsive floating selection toolbar (`HighlightToolbar`), an interactive inline mark inspector (`AnnotationPopover`), and an executive slide-out drawer (`AnnotationDrawer`) integrated into the Navbar and DocumentViewer.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide icons, localStorage persistence, BiDi Arabic isolation.

**Spec:** [SRS.md](file:///d:/Programming/markDownReader/SRS.md) & [MASTER_PLAN.md](file:///d:/Programming/markDownReader/project_management/MASTER_PLAN.md)

---

## Global Constraints

* Must maintain zero AI footprint in all comments and code artifacts.
* Must preserve strict Rule 5 anti-monolith file limits (< 400 lines per file).
* Must support all 4 themes (Dark, Light, Sepia, Code Editor) with contrast-safe highlight colors.
* Must support full Arabic RTL and English LTR without layout shifts.
* Must pass complete typecheck (`tsc --noEmit`) and production build (`npm run build`) with 0 errors.

---

## Task Breakdown & Implementation Steps

### Task 1: Annotation Domain Types & Persistent Store
- [ ] Create `src/core/types/annotation.ts` defining `Annotation`, `HighlightColor`, and `AnnotationFilter`.
- [ ] Create `src/services/annotation.store.ts` implementing reactive subscriptions, localStorage persistence, range calculation, search, and Markdown report export.
- [ ] Add i18n keys for annotations in `src/services/i18n/types.ts`, `src/services/i18n/locales/ar.ts`, and `src/services/i18n/locales/en.ts`.

### Task 2: In-DOM Range Highlighting & Interactive Selection Floating Toolbar
- [ ] Create `src/ui/components/annotations/HighlightToolbar.tsx` with color swatch triggers, note button, copy button, and viewport-boundary detection.
- [ ] Create DOM highlighter engine utility to cleanly wrap text nodes in `<mark data-annotation-id="...">` without breaking code blocks or KaTeX math expressions.
- [ ] Create `src/ui/components/annotations/AnnotationPopover.tsx` for quick note editing, color switching, and highlight deletion directly on click.

### Task 3: Executive Annotations Drawer & Navigation
- [ ] Create `src/ui/components/annotations/AnnotationDrawer.tsx` featuring:
  - Search filter and color-based filtering.
  - Chronological or document-order listing of all notes and highlights.
  - Click-to-scroll with brief highlight flashing in the active document.
  - Delete individual or clear all document annotations.
  - Export highlights & notes to a standalone Markdown summary or clipboard.

### Task 4: UI Integration & Verification Gate
- [ ] Integrate floating toolbar and mark click listener into `src/ui/components/DocumentViewer.tsx`.
- [ ] Add drawer toggle button with active highlight count badge in `src/ui/components/Navbar.tsx`.
- [ ] Wire drawer state and document switching in `src/ui/App.tsx`.
- [ ] Verify build, typecheck, RTL/LTR behavior, and responsive themes.
