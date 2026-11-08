# Task Plan: Multi-Style Diagram Theme Engine & Custom User Palette
**Task ID:** TSK-03-DIAGRAM-THEMES  
**Status:** In Progress `[/]`  
**Target Completion:** 2026-11-09  

---

## 1. Executive Summary & Objective
Empower users with dynamic diagram aesthetic switching across 3 built-in styles (`corporate` [Default], `minimalist`, `modern`) plus a fully custom user-defined palette editor with live preview and local persistence.

---

## 2. Technical Architecture & Component Breakdown

### A. Data Schema & Core Service (`src/services/diagram-theme.service.ts`):
* `DiagramStylePreset`: `'corporate' | 'minimalist' | 'modern' | 'custom'`.
* `CustomDiagramColors`:
  - `processFill`: string (hex/gradient)
  - `processStroke`: string
  - `startEndFill`: string
  - `startEndStroke`: string
  - `decisionFill`: string
  - `decisionStroke`: string
  - `arrowColor`: string
  - `textColor`: string
* Persistence in `localStorage` (`md_reader_diagram_style`, `md_reader_custom_diagram_colors`).
* Event emitter / subscriber pattern to notify UI when diagram style or colors change.

### B. High-Fidelity SVG Styler Enhancements (`src/core/diagrams/styler.ts`):
* Parameterize `DiagramStyler.enhanceSvg(svg, stylePreset, customColors)`:
  - **`corporate` (Default Visio):** Soft emerald start/end, royal blue process, amber decision diamonds.
  - **`minimalist` (Notion / Linear):** Unified slate-zinc card background matching active document theme, crisp borders, high-contrast monochrome arrows.
  - **`modern` (Obsidian / Raycast):** Glowing indigo orbs, violet process nodes, ambient glow drop shadows, cyan highlight accents.
  - **`custom` (User-Defined):** Dynamically injects user's custom fill, stroke, and arrow SVG defs.

### C. UI Components:
* **`DiagramThemePicker.tsx` / Modal:**
  - Quick dropdown / button in Navbar and Diagram headers.
  - Interactive Custom Palette Editor modal with HTML color pickers (`<input type="color">`), hex inputs, live mini-preview, "استعادة الافتراضي" (Reset to Defaults), and "حفظ وتطبيق فوراً" (Save & Apply).

---

## 3. Verification Criteria
* [ ] Default style is set to `corporate` (Visio / Lucidchart).
* [ ] User can switch to `minimalist` (Notion) and see all open diagrams update instantly.
* [ ] User can switch to `modern` (Obsidian) and see glowing orbs & violet cards.
* [ ] User can open Custom Theme Editor, pick custom colors, and see them rendered on diagrams.
* [ ] Persistence: reloading page preserves chosen style and custom palette.
* [ ] Zero TypeScript errors (`npm run typecheck`) and successful production build (`npm run build`).
