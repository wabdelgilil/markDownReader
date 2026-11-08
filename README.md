# MarkDownReader 🚀
> Universal High-Performance Markdown Document Station with First-Class Bi-Directional Arabic RTL, Scientific Math Typesetting ($\LaTeX$), Interactive Diagrams (Mermaid.js), Multi-Tab Navigation, and Curated Reading Themes.

---

## 🌟 Key Capabilities & Architectural Highlights

* **First-Class Bi-Directional (Bidi) Engine:** Contextual block-level Arabic detection, inline `<bdi dir="ltr">` isolation for code tokens and math formulas, and trailing punctuation anchoring.
* **Resilient Scientific Math ($\LaTeX$ / KaTeX):** Sub-millisecond rendering for inline and block equations, chemical notation (`mhchem`), Arabic variable annotations, and graceful syntax error degradation.
* **Interactive Diagram Studio (Mermaid.js):** Smooth zoom, pan, reset viewport, native Arabic font injection into SVG text nodes, and one-click SVG export.
* **Multi-Tab Document Workspace:** Keep multiple `.md` files open simultaneously with independent scroll preservation and fast tab switching.
* **Curated Visual Reading Themes:**
  * **Light:** Clean executive paper styling.
  * **Dark:** High-contrast OLED / Slate styling.
  * **Sepia:** Warm, eye-friendly paper tone.
  * **Terminal:** Retro hacker monospace green phosphor glow with subtle CRT scanlines.
* **1-Click Executive Presentation Mode:** Turn any markdown file partitioned by `---` into a fullscreen slide deck with arrow navigation.
* **Automated Document Diagnostics:** Instant detection of broken relative links, dead internal anchors, and reading metrics.
* **Single-File Standalone HTML Exporter:** Export document into a single standalone `.html` file with embedded styles and assets for 100% offline distribution.

---

## 🛠️ Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```

### 3. Production Build & Typecheck
```bash
npm run typecheck
npm run build
```

---

## 📁 Project Architecture & Directory Map

```text
markDownReader/
├── SRS.md                    # System Requirements Specification (Mandatory)
├── README.md                 # Project Overview & Quickstart Guide
├── docs/
│   └── BRAINSTORMING.md      # Research, Feature Analysis & Architectural Strategy
├── project_management/
│   ├── MASTER_PLAN.md        # Active-only radar and single source of truth
│   ├── COMPLETED_WORK.md     # Master archive index of closed deliverables
│   └── tasks/                # Granular task execution plans
└── src/
    ├── core/                 # Pure domain logic (Markdown, BiDi, Math, Diagrams)
    ├── services/             # State stores, theme engine, exporter
    ├── adapters/             # Host abstractions (Web File System Access API vs Desktop)
    ├── ui/                   # Modular React UI components
    └── styles/               # Tailwind CSS and theme definitions
```
