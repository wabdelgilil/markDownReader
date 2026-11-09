# [TSK-15] Enterprise Link Orchestration & Interactivity Engine Implementation Plan

**Goal:** Implement a comprehensive link processing and navigation engine in MDFull, distinguishing and optimizing external links (security sandbox, visual badge), internal anchor links (smooth container scroll, target attention glow, dead-anchor diagnostics), and workspace document links (in-app tab opening).

**Architecture:** Intercept Marked link token generation in `MarkdownPipeline`, sanitize with `DOMPurify` preserving security attributes (`target="_blank"`, `rel="noopener noreferrer"`, `data-internal-anchor`, `data-workspace-link`), implement click delegation with smooth-scroll and attention pulse in `DocumentViewer`, and expand the test showcase document (`docs/SHOWCASE_FEATURE_SUITE.md`).

**Tech Stack:** TypeScript, Marked v15, DOMPurify, React 19, Tailwind CSS.

**Spec:** [SRS.md](file:///d:/Programming/markDownReader/SRS.md) & [MASTER_PLAN.md](file:///d:/Programming/markDownReader/project_management/MASTER_PLAN.md)

---

## Task Breakdown & Implementation Steps

### Task 1: Parser Link Renderer & Sanitization Gate
- [ ] Implement custom `link` renderer in `src/core/parser/markdown.ts`:
  - Classify external links (`https://`, `http://`, `mailto:`), apply `target="_blank"`, `rel="noopener noreferrer"`, and inline vector indicator.
  - Classify internal anchor links (`#slug`), normalize target slug, and mark with `data-internal-anchor`.
  - Classify relative Markdown files (`.md`), mark with `data-workspace-link`.
- [ ] Add `rel`, `data-internal-anchor`, `data-workspace-link` to `DOMPurify` attribute whitelist.
- [ ] Refine `runDiagnostics` for accurate anchor matching and reporting.

### Task 2: Smooth Scrolling & Workspace Interactivity
- [ ] In `src/ui/components/DocumentViewer.tsx`, intercept click events on links:
  - For internal anchors: `scrollIntoView({ behavior: 'smooth' })` within `#document-scroll-container`, with visual landing pulse effect.
  - For workspace markdown links: look up file or switch tab seamlessly.

### Task 3: CSS Typography & Visual Styling
- [ ] In `src/styles/typography.css`, define polished styling for `.markdown-link`, `.external-link`, `.internal-anchor-link`, and `.workspace-doc-link` with theme-adaptive colors.

### Task 4: Comprehensive Test Showcase Expansion
- [ ] Update `docs/SHOWCASE_FEATURE_SUITE.md` with a complete, bidirectional link laboratory testing all link types, dead-link diagnostic warnings, and return anchors.
- [ ] Verify build (`npm run build`), typecheck, and end-to-end functionality.
