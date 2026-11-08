# Task Plan: Comprehensive Architectural Refactoring & Modularization
**Task ID:** TSK-04-CODEBASE-REFACTOR  
**Status:** In Progress `[/]`  
**Target Completion:** 2026-11-09  

---

## 1. Executive Summary & Objective
Perform comprehensive architectural refactoring across the codebase to eliminate monolithic bloat, enforce Single Responsibility Principle (SRP) per Rule 5, decouple oversized modules (>400 lines), and modularize CSS stylesheets and UI dialogs.

---

## 2. Identified Refactoring Targets

### A. Diagram Styler Decomposition (`src/core/diagrams/styler.ts` - 508 lines):
* Split monolithic `DiagramStyler` into a modular package `src/core/diagrams/stylers/`:
  - `defs.manager.ts`: Reusable SVG filters, defs, and gradient generation.
  - `flowchart.styler.ts`: Flowchart styling for all 4 presets (Corporate, Minimalist, Modern, Custom).
  - `sequence.styler.ts`: Sequence diagram styling, actor boxes, and lifelines.
  - `mindmap.styler.ts`: Mindmap node card and branch styling.
  - `gantt.styler.ts`: Timeline task capsules and axis styling.
  - `gitgraph.styler.ts`: Git tree and anti-collision label staggering.
  - `styler.ts` / `index.ts`: Clean facade preserving existing public API.

### B. Diagram Theme Modal Decomposition (`src/ui/components/DiagramThemeModal.tsx` - 436 lines):
* Decouple sub-components into `src/ui/components/diagram-theme/`:
  - `PresetSelectorGrid.tsx`: Grid of the 4 style presets.
  - `CustomColorPickers.tsx`: Grid of individual color pickers.
  - `LiveMiniPreview.tsx`: Live SVG flowchart preview updating in real-time.
  - `DiagramThemeModal.tsx`: Thin modal wrapper orchestrating state and actions.

### C. Modular CSS Architecture (`src/styles/globals.css` - 451 lines):
* Break monolithic `globals.css` into modular stylesheets:
  - `themes.css`: Semantic CSS variables for light, dark, sepia, terminal.
  - `typography.css`: Base markdown typographic hierarchy, tables, checklists.
  - `prism.css`: Multi-theme syntax token coloring.
  - `diagrams.css`: Mermaid, Markmap, and SVG container styles.
  - `globals.css`: Main import entrypoint.

### D. Multi-Engine Diagram Dispatcher (`src/core/diagrams/dispatcher.ts` - 235 lines):
* Decouple specialized engine drivers into `src/core/diagrams/engines/`:
  - `markmap.driver.ts`: Markmap mindmap parsing and interactive D3 tree rendering.
  - `chartjs.driver.ts`: Chart.js analytical pie/doughnut parsing and rendering.

---

## 3. Verification Criteria (DoD)
* [ ] Zero breaking changes in existing features (tabs, themes, diagram zoom, syntax highlighting).
* [ ] All source files kept well under the 400-line ceiling per Rule 5.
* [ ] `npm run typecheck` passes with 0 errors.
* [ ] `npm run build` completes production bundle successfully.
* [ ] Git commits cleanly pushed to GitHub without AI markers.
