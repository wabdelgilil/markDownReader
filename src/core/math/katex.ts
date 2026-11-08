import katex from 'katex';
import { DocumentDiagnosticIssue } from '../types';

/**
 * Resilient Mathematical & Scientific Typesetting Engine
 */
export class MathTransformer {
  /**
   * Transforms math delimiters ($...$ and $$...$$) into rendered KaTeX HTML or accessible fallbacks.
   */
  public static transform(
    content: string,
    diagnostics: DocumentDiagnosticIssue[]
  ): string {
    // 1. Process Block Math: $$...$$ or \[...\]
    let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_match, mathCode) => {
      return this.renderFormula(mathCode.trim(), true, diagnostics);
    });

    // 2. Process Inline Math: $...$ or \(...\)
    // Avoid matching escaped currency \$ and multi-dollar collisions
    processed = processed.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (_match, mathCode) => {
      return this.renderFormula(mathCode.trim(), false, diagnostics);
    });

    return processed;
  }

  private static renderFormula(
    latex: string,
    displayMode: boolean,
    diagnostics: DocumentDiagnosticIssue[]
  ): string {
    try {
      const renderedHtml = katex.renderToString(latex, {
        displayMode,
        throwOnError: true,
        output: 'htmlAndMathml',
        trust: false,
      });

      const wrapperClass = displayMode
        ? 'katex-block-wrapper my-4 py-2 px-4 rounded bg-theme-surface/50 border border-theme-border/40 overflow-x-auto text-center'
        : 'katex-inline-wrapper px-1';

      return `<span class="${wrapperClass}" dir="ltr" data-latex="${encodeURIComponent(latex)}">${renderedHtml}</span>`;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Syntax error in LaTeX equation';
      diagnostics.push({
        type: 'malformed_math',
        message: `LaTeX parsing error: ${errorMessage.slice(0, 100)}`,
        severity: 'warning',
      });

      // Graceful visual degradation without destroying layout
      return `<span class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs" dir="ltr" title="${errorMessage}">
        <span class="opacity-75">⚠️ [LaTeX]</span>
        <code>${latex.replace(/</g, '&lt;')}</code>
      </span>`;
    }
  }
}
