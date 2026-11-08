# Task Plan 09: Multi-Format Document Export Engine (Native Word OMML Equations, Drawing Blocks & High-Fidelity Vector PDF)

## 1. Executive Summary
Architect and implement an enterprise-grade multi-format export pipeline for MarkDownReader. Exports loaded Markdown documents into true Microsoft Word (`.docx`) with native editable Word equations (OMML) and native Word drawing blocks (VML/DrawingML shapes), high-resolution vector-preserving paginated PDF, standalone offline HTML, and clean Markdown. Full preservation of RTL Arabic typography, heading hierarchies, table properties, and code fences.

---

## 2. Architectural Blueprint
```text
src/services/exporters/
├── types.ts                      <-- Strong TypeScript definitions (ExportFormat, ExportOptions, IExporter)
├── base.exporter.ts              <-- Shared download triggers, SVG/Canvas serialization, metadata
├── html.exporter.ts              <-- Standalone offline single-file HTML package
├── pdf.exporter.ts               <-- High-fidelity paginated PDF engine (A4, KaTeX vector, @page headers/footers)
├── markdown.exporter.ts          <-- Raw markdown preservation exporter
├── export.dispatcher.ts          <-- Facade orchestrator and format registry
└── word/
    ├── omml.ts                   <-- LaTeX to Office Math Markup Language (OMML) parser & generator
    ├── diagram.shapes.ts         <-- Mermaid/Flowchart to Native Word Drawing Shapes (VML/DrawingML)
    └── docx.generator.ts         <-- True OpenXML .docx packager (JSZip, document.xml, styles.xml, rels)
```

---

## 3. Implementation Steps
- [ ] **Step 1: LaTeX to Office Math Markup Language (OMML) Engine (`word/omml.ts`)**
  - Translate LaTeX expressions (fractions, powers, roots, Greek symbols, operators, parentheses, functions) into valid OpenXML `<m:oMath>` / `<m:oMathPara>` blocks.
- [ ] **Step 2: Diagram to Native Word Drawing Blocks (`word/diagram.shapes.ts`)**
  - Parse Mermaid flowchart definitions into nodes and directed connections.
  - Generate native Word drawing objects (`<v:group>`, `<v:roundrect>`, `<v:textbox>`, `<v:line>`) so Word users can click, format, and edit diagram blocks as native Word shapes.
- [ ] **Step 3: True OpenXML DOCX Document Generator (`word/docx.generator.ts`)**
  - Assemble OpenXML package using `jszip` (`[Content_Types].xml`, `_rels/.rels`, `word/document.xml`, `word/styles.xml`, `word/fontTable.xml`).
  - Render headings, RTL Arabic paragraphs, bullet/numbered lists, tables with borders/shading, code blocks, blockquotes, OMML equations, and drawing shape blocks.
- [ ] **Step 4: Enhanced DocxExporter Integration (`docx.exporter.ts`)**
  - Update `DocxExporter` to produce true `.docx` binary blob instead of `.doc` HTML fallback.
- [ ] **Step 5: High-Fidelity Paginated Vector PDF Engine (`pdf.exporter.ts`)**
  - Embed vector SVG diagrams, KaTeX stylesheet and font-readiness synchronization (`document.fonts.ready`).
  - Add print cover header, running header/footer with page counter, proper A4 pagination, and page-break rules.
- [ ] **Step 6: UI Verification & Comprehensive Test Suite**
  - Run typecheck and build tests.
  - Verify exported `.docx` structure and `.pdf` print iframe generation with zero runtime errors.
