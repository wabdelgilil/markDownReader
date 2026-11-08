/**
 * Domain Type Definitions for Core Markdown Engine
 */

export type ReadingTheme = 'dark' | 'light' | 'sepia' | 'editor';

export type TextDirection = 'rtl' | 'ltr' | 'auto';

export interface DocumentHeading {
  id: string;
  text: string;
  level: number;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  date?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface DocumentStats {
  totalWords: number;
  arabicWords: number;
  englishWords: number;
  readingTimeMinutes: number;
  headingsCount: number;
  diagramsCount: number;
  mathBlocksCount: number;
}

export interface DocumentDiagnosticIssue {
  type: 'broken_image' | 'dead_anchor' | 'malformed_math' | 'unclosed_fence';
  message: string;
  line?: number;
  severity: 'warning' | 'error' | 'info';
}

export interface ParsedDocument {
  raw: string;
  html: string;
  metadata: DocumentMetadata;
  headings: DocumentHeading[];
  stats: DocumentStats;
  diagnostics: DocumentDiagnosticIssue[];
}

export interface DocumentTab {
  id: string;
  name: string;
  path: string;
  content: string;
  parsed: ParsedDocument | null;
  scrollPosition: number;
  isModified?: boolean;
}

