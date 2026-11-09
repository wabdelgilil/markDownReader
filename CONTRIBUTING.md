# Contributing to MDFull

Thank you for your interest in contributing to **MDFull**! We welcome contributions from developers, researchers, technical writers, and designers worldwide to help build the premier universal Markdown document workstation.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to `conduct@mdfull.org`.

---

## Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher (or equivalent package manager)
* **Git**

### Local Setup
1. **Fork the repository** on GitHub.
2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/<your-username>/mdfull.git
   cd mdfull
   ```
3. **Install project dependencies:**
   ```bash
   npm install
   ```
4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173` to interact with the workstation.

---

## Development Workflow & Standards

### Branch Naming Convention
Always create a descriptive branch for your work branching off `main`:
* `feat/<feature-name>` for new capabilities
* `fix/<bug-description>` for bug fixes and patches
* `docs/<topic>` for documentation improvements
* `refactor/<module-name>` for architecture refactoring
* `perf/<optimization-scope>` for performance enhancements

```bash
git checkout -b feat/custom-math-macros
```

### Engineering & Architectural Principles
To maintain world-class code quality and reliability, all pull requests must follow these guidelines:
1. **Separation of Concerns (SoC):**
   * Core domain engines reside in `src/core/` (pure, decoupled logic).
   * State and exporters reside in `src/services/`.
   * UI components reside in `src/ui/`.
2. **Anti-Monolith File Limits:**
   * Keep modules focused and single-responsibility. No single file should exceed 400–500 lines of code; decompose complex components into clean sub-modules.
3. **Strict Static Type Safety:**
   * Full TypeScript type definitions. Avoid unjustified `any` annotations. Run `npm run typecheck` before pushing.
4. **First-Class Bi-Directional (BiDi) Awareness:**
   * Ensure any new UI or text rendering respects Arabic RTL and English LTR seamlessly.
   * Preserve `<bdi dir="ltr">` isolation for code tokens and math expressions.

---

## Commit Message Guidelines

We follow the standard [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short descriptive summary>

[optional body explaining rationale and constraints]
```

### Recognized Types:
* `feat`: A new user-facing feature or enhancement
* `fix`: A bug fix or defect resolution
* `docs`: Documentation additions or refinements
* `refactor`: Code reorganization with zero functional behavioral changes
* `perf`: Performance or memory footprint optimization
* `test`: Adding or updating test cases
* `chore`: Build scripts, dependencies, or configuration changes

**Example:**
```bash
git commit -m "feat(highlighter): add custom color swatches and note export"
```

---

## Submitting a Pull Request (PR)

1. Ensure the code compiles cleanly and passes all checks:
   ```bash
   npm run typecheck
   npm run build
   ```
2. Commit your changes with meaningful Conventional Commit messages.
3. Push your branch to your GitHub fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a Pull Request against the `main` branch of `MDFull`.
5. Complete the PR template checklist and provide screenshots or animated recordings for UI changes.

---

## Community & Discussions

Have questions, suggestions, or ideas? Feel free to open an issue or participate in GitHub Discussions. We appreciate your contributions to making Markdown documentation effortless and universally accessible!
