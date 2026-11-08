import { ExportOptions } from './types';

/**
 * Base Exporter
 * Provides shared utilities for file downloading, MIME encoding, and metadata generation.
 */
export abstract class BaseExporter {
  protected triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  protected resolveFilename(options: ExportOptions, extension: string): string {
    const base = options.filename ? options.filename.replace(/\.[^/.]+$/, '') : 'document';
    const dateStr = new Date().toISOString().slice(0, 10);
    return `${base}_${dateStr}.${extension}`;
  }
}
