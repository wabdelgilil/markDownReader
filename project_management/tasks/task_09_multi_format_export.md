# Task Plan 09: Multi-Format Document Export Engine (HTML, PDF, DOCX, Markdown)

## 1. Executive Summary
Architect and implement an extensible, enterprise-grade multi-format export pipeline for MarkDownReader. Enables users to export loaded Markdown documents into standalone single-file HTML, high-resolution paginated PDF, Microsoft Word (DOCX), and raw Markdown with full preservation of RTL Arabic typography, KaTeX mathematics, and vector diagrams.

---

## 2. Architectural Blueprint
```text
src/services/exporters/
├── types.ts              <-- Strong TypeScript definitions (ExportFormat, ExportOptions, IExporter)
├── base.exporter.ts      <-- Shared download triggers, SVG serialization, and metadata injection
├── html.exporter.ts      <-- Standalone offline single-file HTML package
├── pdf.exporter.ts       <-- Print-optimized paginated PDF engine (A4, headers, page breaks)
├── docx.exporter.ts      <-- Microsoft Word (DOCX) compliant export pipeline
└── export.dispatcher.ts  <-- Facade orchestrator and format registry
```

---

## 3. Implementation Phases
- **Phase 1 (Architecture & Contracts):** Define `IExporter`, `ExportOptions`, and `BaseExporter` utilities.
- **Phase 2 (Exporters Scaffolding):**
  - Refactor HTML exporter into `html.exporter.ts`.
  - Implement `pdf.exporter.ts` with dedicated `@page` styling, headers/footers, and print iframe bridge.
  - Implement `docx.exporter.ts` with Word XML / MSO document formatting.
- **Phase 3 (UI Export Dropdown):**
  - Add multi-format export dropdown in `Navbar.tsx` with localized format titles and icons.
- **Phase 4 (Verification):**
  - Verify HTML export, PDF print preview, and Word doc generation with zero runtime errors.
