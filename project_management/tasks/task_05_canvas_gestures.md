# Task Plan 05: Enhanced Diagram Pan & Canvas Zoom Gestures

## 1. Executive Summary
Empower users to interact seamlessly with dense architectural diagrams and flowcharts through smooth mouse drag-and-pan gestures, cursor-centered mouse wheel zooming, touchpad pinch-to-zoom, and mini-map navigation both inline and within the fullscreen studio modal.

---

## 2. Technical Scope
- **Interactive Pan & Zoom Hook / Engine (`src/ui/hooks/useCanvasTransform.ts`):**
  - Smooth pan offsets `(translateX, translateY)` with velocity dampening.
  - Scale factor clamping between `0.25x` and `5.0x`.
  - Transform origin tracking based on pointer position `(clientX, clientY)` during wheel events.
  - Touch event listeners for two-finger pinch-to-zoom gestures.
- **Visual Controls Overlay:**
  - Floating HUD over diagrams showing current zoom percentage (e.g. `120%`), fit-to-screen button, and reset button.
  - Grab/Grabbing dynamic cursor states.
