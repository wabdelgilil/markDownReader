# Task 01: Architecture Scaffolding, Package Manifest & Build Pipeline

**Goal:** Establish the clean, modular project directory structure, TypeScript configuration, package manifests, and development environment supporting both Web/PWA and Tauri Desktop targets.

**Architecture:** Monorepo/Decoupled clean architecture separating core domain logic (`src/core`), application stores and services (`src/services`), host adapters (`src/adapters`), and presentation components (`src/ui`).

**Tech Stack:** TypeScript, Vite, Tailwind CSS, Lucide Icons, Vitest.

---

## 1. Directory Structure Map
```text
markDownReader/
├── .gitignore
├── README.md
├── SRS.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── docs/
│   └── BRAINSTORMING.md
├── project_management/
│   ├── MASTER_PLAN.md
│   ├── COMPLETED_WORK.md
│   └── tasks/
│       └── task_01_scaffold.md
└── src/
    ├── core/               # Pure domain logic (Markdown, BiDi, Math, Diagrams)
    │   ├── types.ts
    │   └── parser/
    ├── services/           # Application state, theme, diagnostics, diff
    │   ├── theme.service.ts
    │   └── document.store.ts
    ├── adapters/           # Host abstractions (Tauri vs Web File System)
    │   ├── types.ts
    │   ├── web.adapter.ts
    │   └── tauri.adapter.ts
    ├── ui/                 # Accessible presentation components
    │   ├── components/
    │   ├── themes/
    │   └── App.tsx (or App.svelte)
    └── styles/
        └── globals.css
```

---

## 2. Implementation Steps
- [ ] **Step 1:** Initialize `package.json` with strict dependencies, professional metadata, and clean script commands.
- [ ] **Step 2:** Configure `tsconfig.json` with strict type checking (`strict: true`, `noImplicitAny: true`, `skipLibCheck: true`).
- [ ] **Step 3:** Configure `vite.config.ts` and `tailwind.config.js` with support for dynamic theme variables (`dark`, `light`, `sepia`, `terminal`).
- [ ] **Step 4:** Create directory scaffolding across `src/core`, `src/services`, `src/adapters`, and `src/ui`.
- [ ] **Step 5:** Define core contract interfaces (`src/core/types.ts` and `src/adapters/types.ts`).
- [ ] **Step 6:** Verify build pipeline integrity with clean TypeScript compilation.
