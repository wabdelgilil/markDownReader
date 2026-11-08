import { ParsedDocument } from '../../core/types';
import { BaseExporter } from './base.exporter';
import { IExporter, ExportOptions, ExportFormat } from './types';

/**
 * Microsoft Word (DOCX / MSO-HTML) Exporter
 * Generates an OpenXML/Word-compliant document container with full support
 * for Arabic RTL bidirectional tables, heading hierarchies, lists, and font definitions.
 */
export class DocxExporter extends BaseExporter implements IExporter {
  public readonly format: ExportFormat = 'docx';
  public readonly mimeType = 'application/vnd.ms-word;charset=utf-8';
  public readonly fileExtension = 'doc'; // Word-compatible HTML format recognized seamlessly by Microsoft Word

  public async export(doc: ParsedDocument, options: ExportOptions): Promise<void> {
    const filename = this.resolveFilename(options, this.fileExtension);
    const title = doc.metadata.title || 'Document';
    const isRtl = options.locale !== 'en';

    // Strip diagram canvases or convert into descriptive callouts for Word compatibility
    let docBody = doc.html.replace(
      /<div class="mermaid-diagram-container[\s\S]*?<\/div>\s*<\/div>/g,
      '<div style="padding: 10pt; background-color: #f4f4f5; border: 1pt solid #d4d4d8; font-family: Calibri, sans-serif; margin: 12pt 0; text-align: center;">[مخطط بياني تفاعلي - يمكن تصديره كـ SVG من واجهة البرنامج]</div>'
    );

    const docxContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Segoe UI', Arial, 'Traditional Arabic', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #111827;
      direction: ${isRtl ? 'rtl' : 'ltr'};
      text-align: ${isRtl ? 'right' : 'left'};
      margin: 1in;
    }
    h1 {
      font-size: 20pt;
      color: #1e3a8a;
      border-bottom: 2pt solid #e5e7eb;
      padding-bottom: 4pt;
      margin-top: 24pt;
    }
    h2 {
      font-size: 15pt;
      color: #1e3a8a;
      border-bottom: 1pt solid #e5e7eb;
      padding-bottom: 3pt;
      margin-top: 18pt;
    }
    h3 {
      font-size: 12pt;
      color: #374151;
      margin-top: 14pt;
    }
    p, li {
      font-size: 11pt;
      line-height: 1.6;
    }
    blockquote {
      border-${isRtl ? 'right' : 'left'}: 4pt solid #3b82f6;
      background-color: #f9fafb;
      padding: 6pt 12pt;
      margin: 10pt 0;
      color: #4b5563;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14pt 0;
    }
    th, td {
      border: 1pt solid #d1d5db;
      padding: 6pt 10pt;
      text-align: ${isRtl ? 'right' : 'left'};
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
    code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 10pt;
      background-color: #f3f4f6;
      padding: 2pt 4pt;
    }
    pre {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9.5pt;
      background-color: #f9fafb;
      border: 1pt solid #e5e7eb;
      padding: 8pt;
      margin: 12pt 0;
    }
  </style>
</head>
<body>
  <div>
    ${docBody}
  </div>
</body>
</html>`;

    const blob = new Blob([docxContent], { type: this.mimeType });
    this.triggerDownload(blob, filename);
  }
}
