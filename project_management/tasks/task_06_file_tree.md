# Task Plan 06: Local Workspace Folder Tree & File Drag-and-Drop

## 1. Executive Summary
Provide a full-featured workspace file explorer panel enabling users to open an entire folder of Markdown notes/documentation, browse the directory hierarchy in a collapsible tree sidebar, and seamlessly drag-and-drop `.md` files directly from their operating system desktop into the application.

---

## 2. Technical Scope
- **File System Directory Tree Adapter:**
  - Support for Web File System Access API (`showDirectoryPicker`) where supported, with graceful fallback to file input directory upload (`webkitdirectory`).
  - Recursive tree data structure: `WorkspaceNode { name, path, isDirectory, children, extension }`.
- **Drag-and-Drop Dropzone Overlay:**
  - Full-window drag-and-drop listener detecting `.md` and `.markdown` files.
  - Visual glassmorphic dropzone overlay activating on dragenter.
- **Sidebar Integration:**
  - Left/Right collapsible panel toggleable alongside the Table of Contents outline.
