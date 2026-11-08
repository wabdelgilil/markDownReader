import { ParsedDocument } from '../../core/types';
import { BaseExporter } from './base.exporter';
import { IExporter, ExportOptions, ExportFormat } from './types';

/**
 * Standalone Offline HTML Exporter
 * Generates an all-in-one HTML document containing KaTeX math styles,
 * typography rules, diagram vectors, and active theme variables.
 */
export class HtmlExporter extends BaseExporter implements IExporter {
  public readonly format: ExportFormat = 'html';
  public readonly mimeType = 'text/html;charset=utf-8';
  public readonly fileExtension = 'html';

  public async export(doc: ParsedDocument, options: ExportOptions): Promise<void> {
    const theme = options.theme || 'dark';
    const filename = this.resolveFilename(options, this.fileExtension);
    const title = doc.metadata.title || 'MDFull Document';

    // Inject SVG diagrams into their respective placeholders
    let renderedHtml = doc.html;
    if (options.diagrams && options.diagrams.size > 0) {
      options.diagrams.forEach((_code, id) => {
        const liveCanvas = document.getElementById(id);
        if (liveCanvas) {
          const svgElement = liveCanvas.querySelector('svg');
          if (svgElement) {
            renderedHtml = renderedHtml.replace(
              new RegExp(`<div id="${id}"[^>]*>[\\s\\S]*?<\\/div>`, 'g'),
              `<div id="${id}" class="diagram-exported flex justify-center my-6" dir="ltr">${svgElement.outerHTML}</div>`
            );
          }
        }
      });
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="${options.locale || 'ar'}" dir="${options.locale === 'en' ? 'ltr' : 'rtl'}" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root, [data-theme="light"] {
      --bg: #fafafa; --surface: #ffffff; --border: #e4e4e7; --text: #18181b; --muted: #71717a; --accent: #4f46e5;
    }
    [data-theme="dark"] {
      --bg: #09090b; --surface: #121215; --border: #27272a; --text: #f4f4f5; --muted: #a1a1aa; --accent: #6366f1;
    }
    [data-theme="sepia"] {
      --bg: #f7f3e9; --surface: #f0ead9; --border: #ded5c2; --text: #2c2217; --muted: #786b59; --accent: #9a4316;
    }
    [data-theme="editor"], [data-theme="terminal"] {
      --bg: #1e1e1e; --surface: #252526; --border: #333333; --text: #d4d4d4; --muted: #858585; --accent: #007acc;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Readex Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      margin: 0;
      padding: 2.5rem 1.5rem;
      display: flex;
      justify-content: center;
    }
    .markdown-container { max-width: 860px; width: 100%; }
    h1, h2, h3, h4 { color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 0.35rem; text-align: start; }
    p, li { text-align: start; }
    blockquote {
      border-inline-start: 4px solid var(--accent);
      background-color: var(--surface);
      padding: 0.75rem 1rem;
      margin: 1.25rem 0;
      border-radius: 4px;
      color: var(--muted);
      text-align: start;
    }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 1px solid var(--border); }
    th, td { border: 1px solid var(--border); padding: 0.6rem 1rem; text-align: start; }
    th { background-color: var(--surface); }
    code { font-family: monospace; background: var(--surface); padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid var(--border); }
    .notion-code-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin: 1.5rem 0; overflow: hidden; }
    .notion-code-card pre { margin: 0; padding: 1rem; overflow-x: auto; font-family: monospace; }
  </style>
</head>
<body>
  <div class="markdown-container">
    <article>
      ${renderedHtml}
    </article>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: this.mimeType });
    this.triggerDownload(blob, filename);
  }
}
