import { ParsedDocument, ReadingTheme } from '../core/types';

export class HtmlExporterService {
  public static exportSingleFileHtml(
    document: ParsedDocument,
    theme: ReadingTheme,
    _diagrams?: Map<string, string>
  ): void {
    const title = document.metadata.title || 'MarkDown Document';

    const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" crossorigin="anonymous">
  <style>
    :root, [data-theme="light"] {
      --bg: #f8fafc; --surface: #ffffff; --border: #e2e8f0; --text: #0f172a; --muted: #64748b; --accent: #2563eb; --code: #f1f5f9;
    }
    [data-theme="dark"] {
      --bg: #090d16; --surface: #111827; --border: #1f2937; --text: #f9fafb; --muted: #9ca3af; --accent: #3b82f6; --code: #1e293b;
    }
    [data-theme="sepia"] {
      --bg: #fbf0d9; --surface: #f4e4c1; --border: #dfcaa2; --text: #433422; --muted: #7d6b53; --accent: #92400e; --code: #ede0bc;
    }
    [data-theme="terminal"] {
      --bg: #050505; --surface: #0d1117; --border: #00ff6633; --text: #00ff66; --muted: #00aa44; --accent: #00ff66; --code: #0a100d;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Readex Pro', system-ui, sans-serif;
      line-height: 1.7;
      margin: 0;
      padding: 2rem;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 860px;
      width: 100%;
    }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    th, td { padding: 10px 14px; border-bottom: 1px solid var(--border); text-align: start; }
    th { background: var(--bg); font-weight: 600; font-size: 0.85rem; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 0.9em; background: var(--code); padding: 2px 6px; border-radius: 4px; color: var(--accent); }
    .callout-block { margin: 1.5rem 0; padding: 1rem; border-radius: 10px; border-right: 4px solid var(--accent); background: var(--surface); }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
</head>
<body>
  <div class="container">
    ${document.html}
  </div>
  <script>
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    }
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-standalone.html`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
