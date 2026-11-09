# [TSK-16] Open-Source Repository Readiness & Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the MDFull codebase into a premier, community-ready open-source project by establishing standard legal licenses, contribution guidelines, GitHub automation workflows, issue/PR templates, and comprehensive executive documentation.

**Architecture:** Implement standard open-source governance artifacts: standard MIT License, Contributor Covenant Code of Conduct, developer onboarding instructions in `CONTRIBUTING.md`, GitHub Actions CI pipeline (`ci.yml`), structured issue/PR templates in `.github/`, and enterprise metadata in `package.json`.

**Tech Stack:** GitHub Actions, Markdown, Node.js / Vite build automation.

**Spec:** [SRS.md](file:///d:/Programming/markDownReader/SRS.md) & [MASTER_PLAN.md](file:///d:/Programming/markDownReader/project_management/MASTER_PLAN.md)

---

## Global Constraints

* Strict compliance with Rule 1 Zero AI Footprint (no automated watermarks, professional human engineering tone).
* Adhere to Rule 3 Pristine Root Directory Policy (only standard governance files permitted at root: `LICENSE`, `README.md`, `SRS.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.gitignore`, `package.json`).
* Ensure all links, scripts, and workflows pass strict verification.

---

## Task Breakdown & Implementation Steps

### Task 1: Legal Licensing & Community Governance
- [ ] Create `LICENSE` (MIT License).
- [ ] Create `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1).
- [ ] Create `CONTRIBUTING.md` detailing development setup, branch conventions, Conventional Commits, code standards, and PR workflows.

### Task 2: GitHub Repository Automation & Issue Templates
- [ ] Create `.github/workflows/ci.yml` running Node.js setup, dependency installation, `npm run typecheck`, and `npm run build` on pushes and pull requests.
- [ ] Create `.github/ISSUE_TEMPLATE/bug_report.md`.
- [ ] Create `.github/ISSUE_TEMPLATE/feature_request.md`.
- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md`.

### Task 3: Package Metadata & Manifest Optimization
- [ ] Update `package.json` with repository URL, homepage, issue tracker, keywords, and human engineering author credits.
- [ ] Ensure `.gitignore` is comprehensive and excludes all local/temporary test artifacts.

### Task 4: Master README.md Showcase Overhaul
- [ ] Rewrite `README.md` to feature:
  - Professional shields/badges (License, TypeScript, React 19, PRs Welcome, Vite).
  - High-impact capability breakdown (Bidi Arabic RTL, $\LaTeX$ OMML, Mermaid Studio, Slide Deck, Document Diagnostics, Highlighting Studio).
  - Interactive Keyboard Shortcuts cheat sheet.
  - Architecture overview and quickstart guide.
- [ ] Run full verification pipeline (`typecheck`, `build`, git hygiene check).
