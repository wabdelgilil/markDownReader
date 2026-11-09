# MDFull 🚀

<div align="center">

**Universal High-Performance Markdown Document Station**  
*First-Class Bi-Directional Arabic RTL • Scientific Math Typesetting ($\LaTeX$) • Interactive Diagrams (Mermaid.js) • Text Highlighting & Annotations • Executive Slide Deck Mode • Multi-Format Native Export*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

[Features](#-key-capabilities) • [Quick Start](#-quick-start) • [Shortcuts](#-keyboard-shortcuts) • [Architecture](#-project-architecture) • [Contributing](#-contributing) • [License](#-license)

</div>

---

## 📖 Overview

Technical documentation, academic research, and engineering notes have standardized around Markdown (`.md`). However, existing Markdown desktop tools (Typora, Obsidian, VS Code Preview, MarkText) systematically fall short when managing bilingual documents combining Arabic with English code tokens, rendering high-density scientific formulas, or exporting native, editable executive deliverables.

**MDFull** is an open-source, zero-bloat, high-performance Markdown document station designed from the ground up for engineers, researchers, bilingual technical authors, and executive teams.

---

## 🌟 Key Capabilities

### 1. First-Class Bi-Directional (BiDi) Engine 🌐
* **Autonomous Block Detection:** Evaluates script density per paragraph, rendering Arabic blocks natively in `RTL` and English code or notes cleanly in `LTR`.
* **Strict `<bdi>` Token Isolation:** Wraps inline code tokens, file paths (`C:\workspace\file.md`), and variables in isolated directional boundaries to eradicate inverted brackets and displaced semicolons.
* **Locked Punctuation Geometry:** Prevents trailing commas, question marks, and terminal punctuation from flipping awkwardly to the beginning of lines.

### 2. Resilient Scientific Mathematics ($\LaTeX$ / KaTeX) 🧮
* **Sub-Millisecond Rendering:** Pre-renders complex inline and block mathematical formulas with zero Layout Shift (CLS = 0.00).
* **Chemical Notation:** Built-in `mhchem` parsing for chemical formulas and reaction equations.
* **Graceful Degradation:** Malformed mathematical equations display cleanly with contextual diagnostic markers instead of crashing the reader.

### 3. Interactive Vector Diagram Studio (Mermaid.js) 📊
* **Multi-Diagram Support:** Native rendering for flowcharts, sequence diagrams, class diagrams, state machines, entity relationships, Gantt roadmaps, mindmaps, and Git graphs.
* **Canvas Pan & Zoom:** Smooth mouse drag-to-pan, scale controls ($0.5\times$ to $3.0\times$), and 1-click viewport reset.
* **Bilingual Font Injection:** Injects modern Arabic typography (`Readex Pro`) directly into SVG vector nodes.
* **Vector SVG Export:** 1-click download of raw, scalable SVG vector assets.

### 4. Text Highlighting & Reference Annotations Studio 🖍️
* **Floating Selection Toolbar:** Select any phrase to summon an instant color swatch palette (Yellow, Green, Blue, Pink, Purple).
* **Attached Personal Notes:** Attach rich notes and comments directly to highlighted text.
* **Slide-Out Annotations Drawer:** Slide-over sidebar (<kbd>Ctrl</kbd> + <kbd>H</kbd>) with real-time text query filtering, color filters, and click-to-scroll navigation with temporary pulse flashes.
* **Standalone Markdown Summary Export:** Export all highlights, user notes, and timestamps into a clean `.md` summary report or copy directly to clipboard.

### 5. 1-Click Executive Presentation Mode 📽️
* **Instant Slide Decks:** Partition any Markdown file with horizontal rules (`---`) and transform it into a full-screen interactive slide deck (<kbd>Ctrl</kbd> + <kbd>P</kbd>) with arrow navigation, progress indicators, and keyboard controls.

### 6. Enterprise Multi-Format Export Engine 📄
* **Native Microsoft Word (`.docx`):** Converts $\LaTeX$ formulas into genuine, editable Microsoft Word **OMML equations** (editable in Word Equation Tools) and converts flowcharts into native Word drawing shapes (VML blocks).
* **Vector Paginated PDF:** High-resolution A4 vector PDF with synchronized webfont loading, dynamic page numbering, and clean page breaks.
* **Standalone Offline HTML:** Self-contained single-file HTML bundle with all styles, fonts, and scripts embedded for 100% offline distribution.

### 7. Curated Visual Reading Themes 🎨
* **Dark OLED:** Deep contrast for low-light coding sessions.
* **Light Paper:** Clean executive styling for high-legibility document review.
* **Sepia Book:** Warm, eye-friendly tones engineered for long-form research reading.
* **Code Editor:** Authentic VS Code Dark+ styling (`#1e1e1e`) with jewel-tone syntax highlighting.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>O</kbd> | Open File | Open local `.md` file via Native File System Access |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | Toggle Outline | Show or hide the collapsible Table of Contents sidebar |
| <kbd>Ctrl</kbd> + <kbd>H</kbd> | Toggle Highlights | Open or close the Annotations & Reference Notes drawer |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Presentation Mode | Launch fullscreen interactive slide deck |
| <kbd>Ctrl</kbd> + <kbd>W</kbd> | Close Tab | Close the currently active document tab |
| <kbd>F11</kbd> | Fullscreen | Toggle immersive, distraction-free reading mode |
| <kbd>Esc</kbd> | Exit Modal | Exit slide presentation, diagram studio, or popover |

---

## 🛠️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/mdfull/mdfull.git
cd mdfull
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Typecheck & Build
```bash
# Validate strict static type assertions
npm run typecheck

# Build production bundle
npm run build
```

---

## 📁 Project Architecture

```text
MDFull/
├── .github/                  # GitHub Actions CI & Issue/PR Templates
├── docs/                     # Engineering Guides & Feature Showcases
├── project_management/       # Master Plan, Task Plans & Milestone Reports
├── public/                   # Static Public Assets
├── src/
│   ├── core/                 # Pure Domain Logic (Markdown AST, BiDi, Math, Diagrams, Types)
│   ├── services/             # State Stores, Exporters (Word OMML, PDF, HTML), Theme Engine
│   ├── adapters/             # Host Abstractions (Web File System Access API vs Desktop)
│   ├── ui/                   # Modular React 19 UI Components & Hooks
│   │   ├── components/       # DocumentViewer, Navbar, DynamicOutline, Modals
│   │   │   ├── annotations/  # HighlightToolbar, AnnotationPopover, AnnotationDrawer
│   │   │   ├── diagram-theme/# Diagram Color Presets & Custom Pickers
│   │   │   └── navbar/       # TabStrip, ExportDropdown, ThemeSwitcher
│   │   └── styles/           # Tailwind CSS and Theme Variable Systems
│   ├── main.tsx              # Application Root Entry Point
│   └── index.html            # HTML Shell with Google Font Preconnects
├── CONTRIBUTING.md           # Developer Onboarding & Contribution Guidelines
├── CODE_OF_CONDUCT.md        # Contributor Covenant Code of Conduct v2.1
├── LICENSE                   # Open-Source MIT License
├── README.md                 # Project Overview & Quickstart Guide
├── SRS.md                    # System Requirements Specification
└── package.json              # Project Manifest & Dependency Lock
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Please see our [Contributing Guide](CONTRIBUTING.md) for details on getting started, coding standards, branch conventions, and the pull request review process.

---

## 📜 License

MDFull is open-source software licensed under the [MIT License](LICENSE).  
Copyright © 2026 MDFull Core Contributors.
