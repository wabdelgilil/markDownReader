import { ParsedDocument } from '../../core/types';
import { BaseExporter } from './base.exporter';
import { IExporter, ExportOptions, ExportFormat } from './types';

/**
 * Raw Markdown Exporter
 * Exports the raw Markdown source text.
 */
export class MarkdownExporter extends BaseExporter implements IExporter {
  public readonly format: ExportFormat = 'markdown';
  public readonly mimeType = 'text/markdown;charset=utf-8';
  public readonly fileExtension = 'md';

  public async export(doc: ParsedDocument, options: ExportOptions): Promise<void> {
    const filename = this.resolveFilename(options, this.fileExtension);
    const blob = new Blob([doc.raw], { type: this.mimeType });
    this.triggerDownload(blob, filename);
  }
}
