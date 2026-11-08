# Task Plan 10: Distraction-Free Fullscreen Reading Mode (Zen Mode)

## 1. Executive Summary
Provide a first-class Fullscreen / Zen Reading experience for document consumption. Allows users to expand the document reader into full distraction-free screen mode via native HTML5 Fullscreen API with keyboard shortcut toggle (<kbd>F11</kbd> or <kbd>Ctrl+Shift+F</kbd>), collapsible sidebar outline toggle, and an unobtrusive floating exit control.

---

## 2. Technical Scope
- **Native Fullscreen Adapter:**
  - Wraps `document.fullscreenElement`, `element.requestFullscreen()`, and `document.exitFullscreen()`.
  - Emits fullscreen change events to update UI icons dynamically (`Maximize` vs `Minimize`).
- **Zen Mode Layout:**
  - Toggle button in `Navbar.tsx` alongside presentation and export controls.
  - Option to collapse outline in zen mode while keeping central article width centered for maximum readability.
- **Bilingual Labels & Tooltips:**
  - Integrated with `I18nService` (`ملء الشاشة` / `Fullscreen`, `إنهاء ملء الشاشة` / `Exit Fullscreen`).
