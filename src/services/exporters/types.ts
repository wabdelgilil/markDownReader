import { ParsedDocument, ReadingTheme } from '../../core/types';

export type ExportFormat = 'html' | 'pdf' | 'docx' | 'markdown';

export interface ExportOptions {
  filename?: string;
  theme?: ReadingTheme;
  locale?: 'ar' | 'en';
  diagrams?: Map<string, string>;
  pageSize?: 'A4' | 'Letter';
  includeDiagrams?: boolean;
  includeMath?: boolean;
}

export interface IExporter {
  readonly format: ExportFormat;
  readonly mimeType: string;
  readonly fileExtension: string;
  export(doc: ParsedDocument, options: ExportOptions): Promise<void>;
}
