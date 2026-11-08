# System Requirements Specification (SRS)
## MarkDownReader: Universal High-Performance Markdown Document Station

**Document Identifier:** `SRS-MDR-2026-V1.0`  
**Classification:** Engineering Specification & Architectural Standard  
**Revision:** `1.0.0`  
**Status:** Approved for Implementation

---

## 1. Project Scope & Executive Objectives

### 1.1 Executive Summary
Technical documentation and research writing have standardized around Markdown (`.md`) format. However, current Markdown desktop software (Typora, Obsidian, VS Code Preview, MarkText) fails systematically when processing complex documents combining:
1. Bi-Directional text rendering (Arabic RTL mixed with English technical tokens).
2. Advanced scientific and chemical typesetting ($\LaTeX$ / KaTeX).
3. Complex interactive vector diagramming (Mermaid.js).
4. Modern documentation callouts and extended frontmatter.

`MarkDownReader` is engineered as a zero-bloat, modular, cross-platform document station that delivers instant startup, sub-millisecond document parsing, first-class RTL Arabic typography, resilient mathematical typesetting, interactive diagram exploration, and versatile viewing modes (Light, Dark, Sepia, Terminal, and Presentation Deck).

### 1.2 Target Personas & Stakeholders
* **Software Engineers & System Architects:** Reading deep technical documentation, architecture decision records (ADRs), and API guides with high-density code snippets and Mermaid diagrams.
* **Researchers, Scientists & Academics:** Reviewing papers and technical notes containing complex $\LaTeX$ equations and chemical formulas (`mhchem`).
* **Bilingual Technical Writers & Analysts:** Producing executive reports in Arabic with embedded English code tokens, tables, and metrics.
* **Executive Decision Makers:** Reviewing instant slide decks rendered directly from raw markdown without external slide tools.

---

## 2. System Architecture & Separation of Concerns

The architecture strictly adheres to Domain-Driven Design (DDD), SOLID principles, and clean layer decoupling. The core engine is decoupled from the runtime host environment, enabling 100% code reuse across **Desktop (Tauri 2.0)** and **Web / PWA (Browser)**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation & UI Layer                         │
│   (Modular Component Tree: Svelte 5 / React, Tailwind CSS, Lucide)     │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐  │
│  │ DocumentViewer │ │ DynamicOutline │ │ WorkspaceFileTree          │  │
│  └────────────────┘ └────────────────┘ └────────────────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐  │
│  │ DiagramStudio  │ │ MathInspector  │ │ PresentationDeckView       │  │
│  └────────────────┘ └────────────────┘ └────────────────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐  │
│  │ DocumentDiff   │ │ HealthInspector│ │ ThemeEngine (Dark/Light/   │  │
│  │ Viewer         │ │ Drawer         │ │ Sepia/Terminal)            │  │
│  └────────────────┘ └────────────────┘ └────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ State & Action Dispatchers
┌───────────────────────────────────┴────────────────────────────────────┐
│                  Application Services & State Layer                    │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌─────────────┐  │
│  │ DocumentStore         │ │ ThemeStore             │ │ ConfigStore │  │
│  └───────────────────────┘ └────────────────────────┘ └─────────────┘  │
│  ┌───────────────────────┐ ┌────────────────────────┐ ┌─────────────┐  │
│  │ DiffEngineService     │ │ DiagnosticService      │ │ ExportSvc   │  │
│  └───────────────────────┘ └────────────────────────┘ └─────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Pure Business Logic & Parsers
┌───────────────────────────────────┴────────────────────────────────────┐
│                    Core Domain Markdown Engine                         │
│  ┌─────────────────────────────────┐ ┌──────────────────────────────┐  │
│  │ MarkdownParserPipeline          │ │ BiDiArbitrator (Smart RTL)   │  │
│  └─────────────────────────────────┘ └──────────────────────────────┘  │
│  ┌─────────────────────────────────┐ ┌──────────────────────────────┐  │
│  │ KaTeXMathTransformer            │ │ MermaidDiagramTransformer    │  │
│  └─────────────────────────────────┘ └──────────────────────────────┘  │
│  ┌─────────────────────────────────┐ ┌──────────────────────────────┐  │
│  │ CalloutAlertTransformer         │ │ FrontmatterExtractor         │  │
│  └─────────────────────────────────┘ └──────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Interface Abstraction (IFileSystem)
┌───────────────────────────────────┴────────────────────────────────────┐
│                         Host Adapter Layer                             │
│  ┌──────────────────────────────────┐ ┌─────────────────────────────┐  │
│  │ DesktopAdapter (Tauri 2.0 Rust)  │ │ WebAdapter (File System API)│  │
│  │ - Async native file watcher      │ │ - showOpenFilePicker()      │  │
│  │ - Native dialogs & file IO       │ │ - Drag & drop memory reader │  │
│  │ - Direct vector print / export   │ │ - Offline PWA Cache Worker  │  │
│  └──────────────────────────────────┘ └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Layer Responsibilities & Contracts
1. **Core Domain Markdown Engine (`src/core/`):**
   * Pure TypeScript, zero dependency on DOM or browser globals (runs in node, web workers, and browser).
   * Orchestrates the parsing AST lifecycle: tokenization -> AST enrichment (BiDi, Math, Diagrams, Callouts) -> sanitized HTML output.
2. **Application Services & Stores (`src/services/`):**
   * Reactive state management for active tabs, document metadata, theme selections, zoom scale, and search index.
   * `DiagnosticService`: Scans documents for broken links, missing local assets, malformed tables.
   * `DiffEngineService`: Computes structural block differences between two markdown revisions.
3. **Host Adapter Layer (`src/adapters/`):**
   * Defines standard interfaces (`IFileSystemAdapter`, `IWatcherAdapter`, `IDialogAdapter`).
   * Implements `TauriAdapter` for native desktop operation and `WebAdapter` for zero-install browser operation.
4. **Presentation & UI Layer (`src/ui/`):**
   * Atomic, accessible UI components.
   * Full responsive support across desktop screens, ultrawide monitors, and tablet/mobile viewports.

---

## 3. Granular Functional Requirements

### 3.1 Advanced Markdown Parsing Pipeline
* **FR-01 (GFM & CommonMark):** Full adherence to CommonMark and GitHub Flavored Markdown specs.
* **FR-02 (GitHub Alerts / Callouts):** Renders `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, and `> [!CAUTION]` with distinct icon sets, semantic accent borders, and accessibility ARIA roles.
* **FR-03 (Frontmatter Extraction):** Parses YAML and TOML frontmatter headers into a collapsed/expandable metadata inspector badge displaying authors, dates, tags, and document status.
* **FR-04 (Tabbed Code Groups):** Allows grouping code blocks with syntax:
  ````markdown
  ::: code-group
  ```bash [npm]
  npm install
  ```
  ```bash [pnpm]
  pnpm add
  ```
  :::
  ````
* **FR-05 (Syntax Highlighting & Code UX):** Highlighting powered by Shiki/Prism with line numbers, code copy indicator, and highlighted line ranges (`{2-4}`).

### 3.2 Intelligent Bi-Directional (Bidi) & Arabic RTL Engine
* **FR-06 (Block-Level Direction Detection):** Evaluates character glyph ranges. Blocks exceeding 30% Arabic/Hebrew character density automatically receive `dir="rtl"` with appropriate font cascade.
* **FR-07 (Code & Math LTR Isolation):** Automatically wraps inline code tokens (`` `...` ``) and math spans (`$...$`) inside `<bdi dir="ltr">` elements to prevent punctuation and parentheses inversion.
* **FR-08 (Punctuation Lock):** Prevents end-of-sentence punctuation (periods, question marks, colons) from flying to the reverse margin of the container.
* **FR-09 (Manual Direction Override):** A non-intrusive floating control on every block allows the user to force LTR or RTL state on the fly.

### 3.3 Scientific Math & Chemical Typesetting
* **FR-10 (KaTeX Sub-Millisecond Rendering):** High-speed local rendering of inline (`$...$`) and display (`$$...$$`) mathematical formulas.
* **FR-11 (Chemical Formulas):** Full support for `\ce{...}` via `mhchem` extension.
* **FR-12 (Error-Tolerant Math Inspector):** If a $\LaTeX$ formula has syntax errors, the parser gracefully flags the erroneous token while rendering the valid portion, offering a click-to-debug drawer.
* **FR-13 (Multi-Format Extraction):** Clicking any formula opens a copy menu: Raw LaTeX, MathML, or transparent high-DPI PNG.

### 3.4 Interactive Diagram Studio (Mermaid.js)
* **FR-14 (Complete Diagram Coverage):** Supports all Mermaid 10+ diagram types (Flowchart, Sequence, Class, State, ER, Gantt, Pie, GitGraph, Mindmap, Timeline, Quadrant, C4).
* **FR-15 (Native Arabic Typography in SVGs):** Injects Arabic webfonts directly into SVG text nodes with correct glyph connection.
* **FR-16 (Diagram Interactive Canvas):** Pan, smooth scroll-zoom, reset viewport, and fullscreen view.
* **FR-17 (One-Click Diagram Export):** Export any diagram individually to vector SVG, high-resolution PNG, or raw code clipboard.

### 3.5 Themes & Viewing Modes
* **FR-18 (Multiple Curated Themes):**
  1. `Light`: Executive clean paper style ($#ffffff$ background, $#1f2937$ text).
  2. `Dark`: High-contrast OLED / Slate style ($#0f172a$ background, $#f8fafc$ text).
  3. `Sepia`: Warm, eye-friendly paper tone ($#fbf0d9$ background, $#433422$ text).
  4. `Terminal`: Retro green-on-black or amber monospace theme with subtle scanline accents, Courier/JetBrains Mono typography, and high-contrast glow.
* **FR-19 (Presentation Mode / Slide Deck):** Converts markdown divided by `---` into a presentation slide deck with arrow navigation, full Mermaid, KaTeX, and presenter timer.
* **FR-20 (Focus / Zen Reader):** Dims all paragraphs except the active section under cursor/focus.

### 3.6 File Navigation, Multi-Tab Management & Exporting
* **FR-21 (Dynamic Multi-Tab Workspace):** Complete multi-tab document management allowing users to keep multiple `.md` files open simultaneously, with tab switching (`Ctrl+Tab`), tab closing (`Ctrl+W`), dirty state indicator, and per-tab independent scroll/cache preservation.
* **FR-22 (Dynamic Table of Contents):** Real-time scrollspy TOC with indent levels $H_1 - H_6$.
* **FR-23 (Live File Watcher):** Automatically refreshes open documents when modified externally with zero scroll position loss.
* **FR-24 (Document Health Inspector):** Reports broken relative image paths, dead internal heading anchors, and unclosed syntax fences.
* **FR-25 (Universal Single-File HTML Exporter):** Packages document into a single standalone `.html` file with Base64 embedded images, fonts, and inline CSS/JS that works 100% offline on any operating system.
* **FR-26 (Print-Engine PDF):** Vector PDF generation with clean page breaks and running headers/footers.
* **FR-27 (Rendered Visual Diff Viewer):** Synchronized dual-pane comparison between two markdown documents with highlighted additions and deletions.

---

## 4. Non-Functional Requirements & Engineering Standards

### 4.1 Performance & Resource Benchmarks
* **NFR-01 (Binary Footprint):** Native Desktop executable bundle must remain below **25 MB** (uncompressed).
* **NFR-02 (Memory Overhead):** Runtime memory consumption under 10,000 lines of markdown must not exceed **75 MB RAM** at idle.
* **NFR-03 (Startup Latency):** Cold startup time to interactive UI must be under **300 milliseconds**.
* **NFR-04 (Parsing Throughput):** Document parsing and AST generation must complete in under **15 milliseconds** for a 50 KB markdown file.

### 4.2 Security & Sandboxing
* **NFR-05 (DOM Sanitization):** Strict HTML sanitization (DOMPurify) preventing XSS attacks from untrusted markdown files.
* **NFR-06 (Zero Telemetry & Local Privacy):** The application is 100% offline-capable; zero outgoing network calls, telemetry, or user tracking.
* **NFR-07 (Safe Local Asset Loading):** Local file access is strictly bound to the workspace directory or explicitly opened files.

### 4.3 Code Quality & Maintainability
* **NFR-08 (Strict Static Typing):** 100% TypeScript strict mode enabled (`noImplicitAny`, `strictNullChecks`).
* **NFR-09 (Unit & Integration Test Coverage):** Minimum 85% test coverage across core parsing, BiDi, and transformation services.
* **NFR-10 (Anti-Monolith Limit):** No source code file shall exceed 400 lines of code; complex components must be decomposed into cohesive submodules.

---

## 5. Technology Stack Selection

* **Host Environment (Desktop):** Tauri 2.0 (Rust backend for fast async I/O, native dialogs, and low footprint).
* **Host Environment (Web):** Modern Progressive Web App (PWA) with File System Access API.
* **Frontend Framework:** React 19 / Svelte 5 with TypeScript.
* **Styling & Design System:** Tailwind CSS with custom CSS variables for runtime theme switching (Light, Dark, Sepia, Terminal).
* **Markdown Core Pipeline:** Unified.js / Remark / Rehype ecosystem with custom AST plugins.
* **Scientific Math Engine:** KaTeX 0.16+ with `mhchem`.
* **Diagramming Engine:** Mermaid.js 10.9+.
* **Code Highlighting:** Shiki / Prism with dual-theme tokenization.
* **Icons:** Lucide Icons.
* **Testing:** Vitest + Playwright.
