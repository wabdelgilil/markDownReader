import { ParsedDocument } from '../../core/types';
import { ExportFormat, ExportOptions, IExporter } from './types';
import { HtmlExporter } from './html.exporter';
import { PdfExporter } from './pdf.exporter';
import { DocxExporter } from './docx.exporter';
import { MarkdownExporter } from './markdown.exporter';

/**
 * Export Dispatcher
 * Central registry and orchestrator for all document export formats.
 */
export class ExportDispatcher {
  private static exporters: Map<ExportFormat, IExporter> = new Map<ExportFormat, IExporter>([
    ['html', new HtmlExporter()],
    ['pdf', new PdfExporter()],
    ['docx', new DocxExporter()],
    ['markdown', new MarkdownExporter()],
  ]);

  public static async export(
    format: ExportFormat,
    doc: ParsedDocument,
    options: ExportOptions = {}
  ): Promise<void> {
    const exporter = this.exporters.get(format);
    if (!exporter) {
      throw new Error(`Unsupported export format: ${format}`);
    }
    await exporter.export(doc, options);
  }

  public static getSupportedFormats(): ExportFormat[] {
    return Array.from(this.exporters.keys());
  }
}
