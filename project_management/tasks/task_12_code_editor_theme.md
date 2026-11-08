# Task Plan 12: Code Editor (VS Code / IDE) Theme Modernization

## 1. Executive Summary
Transform the existing monochromatic green terminal theme into a modern, developer-grade "Code Editor" theme inspired by VS Code Dark+ / JetBrains Darcula. This delivers an authentic coding environment with rich syntax contrast, editor surface grays (`#1e1e1e`), subtle border lines, vibrant syntax hues (cyan, amber, purple, soft green), and refined developer typography instead of the eye-straining monochrome green scanlines.

---

## 2. Technical Scope
- **Theme Definition & Palette:**
  - Update `themes.css` replacing/enhancing `[data-theme="terminal"]` (or introducing `editor` theme):
    - Background: `#1e1e1e` (Editor canvas)
    - Surface: `#252526` (Sidebar & toolbars)
    - Border: `#333333` / `#3c3c3c`
    - Text: `#d4d4d4`
    - Muted: `#858585`
    - Accent: `#007acc` / `#0e639c` (VS Code blue) or modern cyan `#38bdf8`
  - Remove harsh global green override and CRT scanline filter that degraded text readability.
  - Refine Prism syntax highlighting in `prism.css` for code editor theme.
- **UI Elements & Iconography:**
  - Update theme switcher option icon (e.g., `Code2` or `FileCode` instead of terminal icon).
  - Update i18n labels ("محرر أكواد (VS Code)" / "Code Editor (IDE)").
- **Diagram Harmonization:**
  - Ensure diagrams render with high-contrast editor styling.
