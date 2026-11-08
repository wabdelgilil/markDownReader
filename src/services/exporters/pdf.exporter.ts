import { ParsedDocument } from '../../core/types';
import { BaseExporter } from './base.exporter';
import { IExporter, ExportOptions, ExportFormat } from './types';

/**
 * High-Fidelity Paginated Vector PDF Exporter
 * Prepares an isolated, print-optimized document environment formatted for standard A4 pagination
 * with high-fidelity vector preservation, KaTeX math typesetting, running page numbering,
 * and font readiness synchronization.
 */
export class PdfExporter extends BaseExporter implements IExporter {
  public readonly format: ExportFormat = 'pdf';
  public readonly mimeType = 'application/pdf';
  public readonly fileExtension = 'pdf';

  public async export(doc: ParsedDocument, options: ExportOptions): Promise<void> {
    const title = doc.metadata.title || options.filename?.replace(/\.md$/i, '') || 'Document';
    const isRtl = options.locale !== 'en';

    // Inject live SVG / Canvas diagrams into placeholders
    let renderedHtml = doc.html;
    if (options.diagrams && options.diagrams.size > 0) {
      options.diagrams.forEach((_code, id) => {
        const liveContainer = document.getElementById(id);
        if (liveContainer) {
          const svgElement = liveContainer.querySelector('svg');
          const canvasElement = liveContainer.querySelector('canvas');

          if (svgElement) {
            // High-fidelity vector SVG embedding
            renderedHtml = renderedHtml.replace(
              new RegExp(`<div id="${id}"[^>]*>[\\s\\S]*?<\\/div>`, 'g'),
              `<div id="${id}" class="diagram-vector-container flex justify-center my-6" dir="ltr">${svgElement.outerHTML}</div>`
            );
          } else if (canvasElement) {
            // High-DPI Chart.js canvas snapshot
            try {
              const dataUrl = canvasElement.toDataURL('image/png', 1.0);
              renderedHtml = renderedHtml.replace(
                new RegExp(`<div id="${id}"[^>]*>[\\s\\S]*?<\\/div>`, 'g'),
                `<div id="${id}" class="diagram-vector-container flex justify-center my-6" dir="ltr"><img src="${dataUrl}" style="max-width:100%; height:auto;" alt="Diagram" /></div>`
              );
            } catch {
              // Canvas may be tainted or empty; retain existing markup
            }
          }
        }
      });
    }

    // Build metadata header info
    const metaBadges: string[] = [];
    if (doc.metadata.author) {
      metaBadges.push(`<span class="meta-item"><strong class="meta-label">${isRtl ? 'الكاتب:' : 'Author:'}</strong> ${this.escapeXml(doc.metadata.author)}</span>`);
    }
    if (doc.metadata.date) {
      metaBadges.push(`<span class="meta-item"><strong class="meta-label">${isRtl ? 'التاريخ:' : 'Date:'}</strong> ${this.escapeXml(doc.metadata.date)}</span>`);
    }
    if (doc.stats?.totalWords) {
      metaBadges.push(`<span class="meta-item"><strong class="meta-label">${isRtl ? 'الكلمات:' : 'Words:'}</strong> ${doc.stats.totalWords}</span>`);
    }
    if (doc.stats?.readingTimeMinutes) {
      metaBadges.push(`<span class="meta-item"><strong class="meta-label">${isRtl ? 'وقت القراءة:' : 'Reading Time:'}</strong> ${doc.stats.readingTimeMinutes} ${isRtl ? 'د' : 'min'}</span>`);
    }

    const headerHtml = `
      <header class="document-print-header">
        <h1 class="document-title">${this.escapeXml(title)}</h1>
        ${metaBadges.length > 0 ? `<div class="document-meta-row">${metaBadges.join('<span class="meta-separator">•</span>')}</div>` : ''}
        <hr class="header-divider" />
      </header>
    `;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '1200px';
    printFrame.style.height = '1200px';
    document.body.appendChild(printFrame);

    const docFrame = printFrame.contentWindow?.document;
    if (!docFrame) {
      document.body.removeChild(printFrame);
      return;
    }

    const printContent = `<!DOCTYPE html>
<html lang="${options.locale || 'ar'}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>${this.escapeXml(title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
      @top-left {
        content: "${this.escapeXml(title)}";
        font-family: 'Readex Pro', 'Segoe UI', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
      @bottom-center {
        content: counter(page);
        font-family: 'Readex Pro', 'Segoe UI', sans-serif;
        font-size: 8.5pt;
        color: #64748b;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Readex Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.75;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
      direction: ${isRtl ? 'rtl' : 'ltr'};
      text-align: ${isRtl ? 'right' : 'left'};
    }

    .document-print-header {
      margin-bottom: 24pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .document-title {
      font-size: 26pt;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0 0 10pt 0;
      line-height: 1.25;
    }
    .document-meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8pt;
      font-size: 9pt;
      color: #64748b;
      margin-bottom: 12pt;
    }
    .meta-separator {
      color: #cbd5e1;
    }
    .meta-label {
      color: #334155;
    }
    .header-divider {
      border: none;
      height: 1.5pt;
      background: #e2e8f0;
      margin: 10pt 0 0 0;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #0f172a;
      break-after: avoid;
      page-break-after: avoid;
      font-weight: 600;
    }
    h1 {
      font-size: 19pt;
      border-bottom: 1.5pt solid #e2e8f0;
      padding-bottom: 6pt;
      margin-top: 24pt;
      color: #1e3a8a;
    }
    h2 {
      font-size: 14pt;
      border-bottom: 1pt solid #e2e8f0;
      padding-bottom: 4pt;
      margin-top: 18pt;
      color: #2563eb;
    }
    h3 {
      font-size: 12pt;
      margin-top: 14pt;
      color: #1e293b;
    }
    p {
      margin: 8pt 0;
      text-align: justify;
    }
    blockquote {
      border-inline-start: 4pt solid #4f46e5;
      background: #f8fafc;
      padding: 8pt 14pt;
      margin: 12pt 0;
      border-radius: 4pt;
      color: #334155;
      font-style: italic;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14pt 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    thead {
      display: table-header-group;
    }
    th, td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 10pt;
      font-size: 9.5pt;
      text-align: start;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #0f172a;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    code {
      font-family: 'Consolas', 'Courier New', monospace;
      background: #f1f5f9;
      color: #be185d;
      padding: 2pt 5pt;
      border-radius: 3pt;
      font-size: 9.5pt;
      border: 1pt solid #e2e8f0;
    }
    pre {
      font-family: 'Consolas', 'Courier New', monospace;
      background: #f8fafc;
      border: 1pt solid #e2e8f0;
      border-inline-start: 3pt solid #3b82f6;
      border-radius: 5pt;
      padding: 10pt 12pt;
      margin: 12pt 0;
      font-size: 9pt;
      line-height: 1.5;
      overflow-x: hidden;
      white-space: pre-wrap;
      word-break: break-word;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    pre code {
      background: transparent;
      border: none;
      padding: 0;
      color: #1e293b;
    }
    .katex-display-wrapper {
      margin: 14pt 0;
      padding: 10pt;
      background: #f8fafc;
      border: 1pt solid #e2e8f0;
      border-radius: 6pt;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .diagram-vector-container {
      margin: 16pt 0;
      text-align: center;
      display: flex;
      justify-content: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .diagram-vector-container svg {
      max-width: 100% !important;
      height: auto !important;
    }
    ul, ol {
      margin: 8pt 0;
      padding-inline-start: 22pt;
    }
    li {
      margin-bottom: 4pt;
    }
    a {
      color: #2563eb;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <article>
    ${headerHtml}
    ${renderedHtml}
  </article>
</body>
</html>`;

    docFrame.open();
    docFrame.write(printContent);
    docFrame.close();

    // Ensure all webfonts (Readex Pro & KaTeX) are completely settled
    const frameWindow = printFrame.contentWindow;
    if (frameWindow) {
      try {
        if (frameWindow.document.fonts) {
          await frameWindow.document.fonts.ready;
        }
      } catch {
        // Fallback for browsers that restrict iframe font ready
      }

      setTimeout(() => {
        frameWindow.focus();
        frameWindow.print();
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 3000);
      }, 700);
    }
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
