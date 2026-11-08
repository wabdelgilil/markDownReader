import { ParsedDocument } from '../../core/types';
import { BaseExporter } from './base.exporter';
import { IExporter, ExportOptions, ExportFormat } from './types';
import { DocxGenerator } from './word/docx.generator';

/**
 * Microsoft Word (DOCX) Enterprise Exporter
 * Generates an authentic OpenXML (.docx) document archive featuring:
 * - Native Microsoft Word Equations (OMML) editable directly via Word Equation Tools
 * - Native Microsoft Word Drawing Shapes for flowcharts and mindmaps (editable VML blocks)
 * - Complete RTL Arabic typography and table bidi orientation
 * - Formatted code blocks, styled callouts, and hierarchical outline headings
 */
export class DocxExporter extends BaseExporter implements IExporter {
  public readonly format: ExportFormat = 'docx';
  public readonly mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  public readonly fileExtension = 'docx';

  public async export(doc: ParsedDocument, options: ExportOptions): Promise<void> {
    const filename = this.resolveFilename(options, this.fileExtension);
    const blob = await DocxGenerator.generate(doc, options);
    this.triggerDownload(blob, filename);
  }
}
