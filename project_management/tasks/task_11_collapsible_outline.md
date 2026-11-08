# Task Plan 11: Collapsible Dynamic Table of Contents (Show/Hide Toggle)

## 1. Executive Summary
Empower users with full control over workspace screen real estate by introducing an interactive show/hide toggle mechanism for the Table of Contents (Outline) sidebar. The feature provides intuitive controls in the top navigation bar, an inline collapse trigger within the outline header, an edge-docked quick-expand pill, full keyboard shortcut support (`Ctrl+B` and `Ctrl+Shift+O`), persistent display preferences via local storage, and responsive slide-out drawer behavior on smaller viewports.

---

## 2. Technical Scope & Requirements
- **State Management & Persistence:**
  - Introduce `showOutline` boolean state with automatic persistence in `localStorage` under `markdown_reader_show_outline`.
  - Default to visible (`true`) on desktop displays while respecting user toggle history.
- **Top Navigation Bar Integration (`Navbar.tsx`):**
  - Add an outline toggle action button with `ListTree` icon and localized tooltip.
  - Reflect active/inactive visual state with subtle accent highlights and border styling.
  - Display badge indicating total heading count when active document is loaded.
- **Inline Header Collapse Action (`DynamicOutline.tsx`):**
  - Integrate a collapse button (`PanelLeftClose` / `PanelRightClose` or `X` / `Chevron`) inside the outline header.
  - Support smooth expand/collapse transition without visual layout jarring.
- **Floating Quick-Restore Edge Pill:**
  - When the outline is hidden and headings are present, render a subtle, non-intrusive edge tab along the document margin to allow single-click re-expansion.
- **Responsive Drawer for Mobile & Tablet:**
  - Adapt the outline to serve as a slide-out drawer with backdrop when toggled on viewports below the `lg` breakpoint.
- **Keyboard Shortcuts:**
  - Register `Ctrl+B` / `Cmd+B` and `Ctrl+Shift+O` / `Cmd+Shift+O` global shortcut listeners to toggle TOC visibility instantaneously.
- **Bilingual Localization (`i18n.service.ts`):**
  - Provide full Arabic and English dictionary keys for outline show, hide, toggle, and shortcut hints.

---

## 3. Verification Criteria
1. Clicking the navbar TOC button toggles the outline between shown and hidden states.
2. Clicking the inline collapse button inside the outline collapses the sidebar.
3. The floating edge quick-expand trigger reopens the outline smoothly.
4. Pressing `Ctrl+B` or `Ctrl+Shift+O` toggles the outline visibility.
5. User preference is preserved across page refreshes.
6. TypeScript build passes with zero errors and no compilation warnings.
