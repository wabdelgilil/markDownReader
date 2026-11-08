import { ParsedDocument } from '../../core/types';
import { BaseExporter } from './base.exporter';
import { IExporter, ExportOptions, ExportFormat } from './types';

/**
 * PDF Exporter
 * Prepares an isolated, print-optimized document environment formatted for A4/Letter pagination
 * with high-fidelity vector preservation, custom header/footer layout, and browser print spooling.
 */
export class PdfExporter extends BaseExporter implements IExporter {
  public readonly format: ExportFormat = 'pdf';
  public readonly mimeType = 'application/pdf';
  public readonly fileExtension = 'pdf';

  public async export(doc: ParsedDocument, options: ExportOptions): Promise<void> {
    const title = doc.metadata.title || options.filename || 'Document';

    // Inject live SVG diagrams into placeholders
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

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '1000px';
    printFrame.style.height = '1000px';
    document.body.appendChild(printFrame);

    const docFrame = printFrame.contentWindow?.document;
    if (!docFrame) {
      document.body.removeChild(printFrame);
      return;
    }

    const printContent = `<!DOCTYPE html>
<html lang="${options.locale || 'ar'}" dir="${options.locale === 'en' ? 'ltr' : 'rtl'}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Readex Pro', sans-serif;
        font-size: 9pt;
        color: #71717a;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Readex Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #18181b;
      background: #ffffff;
      line-height: 1.7;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3 {
      color: #09090b;
      page-break-after: avoid;
      break-after: avoid;
      text-align: start;
    }
    h1 { font-size: 20pt; border-bottom: 2px solid #e4e4e7; padding-bottom: 6px; margin-top: 0; }
    h2 { font-size: 15pt; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px; margin-top: 18pt; }
    h3 { font-size: 12pt; margin-top: 14pt; }
    p, li { text-align: start; }
    blockquote {
      border-inline-start: 4px solid #4f46e5;
      background: #f4f4f5;
      padding: 8pt 12pt;
      margin: 12pt 0;
      border-radius: 4px;
      page-break-inside: avoid;
      break-inside: avoid;
      text-align: start;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #d4d4d8;
      padding: 6pt 10pt;
      text-align: start;
      font-size: 10pt;
    }
    th { background: #f4f4f5; font-weight: 600; }
    code {
      font-family: monospace;
      background: #f4f4f5;
      padding: 2pt 4pt;
      border-radius: 3px;
      font-size: 9.5pt;
      border: 1px solid #e4e4e7;
    }
    .notion-code-card {
      background: #f4f4f5;
      border: 1px solid #d4d4d8;
      border-radius: 6px;
      margin: 12pt 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .notion-code-card pre {
      margin: 0;
      padding: 10pt;
      font-family: monospace;
      font-size: 9.5pt;
      overflow-x: hidden;
    }
    .diagram-exported {
      page-break-inside: avoid;
      break-inside: avoid;
      margin: 15pt 0;
      display: flex;
      justify-content: center;
    }
    .diagram-exported svg {
      max-width: 100% !important;
      height: auto !important;
    }
  </style>
</head>
<body>
  <article>
    ${renderedHtml}
  </article>
</body>
</html>`;

    docFrame.open();
    docFrame.write(printContent);
    docFrame.close();

    // Allow fonts and math to settle before triggering print
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 2000);
    }, 600);
  }
}
