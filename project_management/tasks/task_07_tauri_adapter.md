# Task Plan 07: Desktop Native Host Adapter (Tauri 2.0 Integration)

## 1. Executive Summary
Package MarkDownReader into an ultra-fast, native desktop application utilizing Tauri 2.0 (Rust backend + WebView frontend), yielding a binary footprint under 15MB, near-instant launch times, minimal idle RAM consumption (~35MB), and direct native operating system capabilities.

---

## 2. Technical Scope
- **Tauri Core Scaffolding (`src-tauri/`):**
  - Configured `Cargo.toml` and `tauri.conf.json` with secure sandbox capabilities.
  - Rust IPC commands for native file dialogs, direct disk I/O, and file system watching.
- **Native OS Integration:**
  - File association with `.md` / `.markdown` files so double-clicking any markdown file in Windows Explorer directly opens it in MarkDownReader.
  - Window titlebar styling, native menu bar, and system drag-drop protocol.
