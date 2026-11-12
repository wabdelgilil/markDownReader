import katex from 'katex';
import 'katex/contrib/mhchem';
import { DocumentDiagnosticIssue } from '../types';

export interface MathFormulaItem {
  code: string;
  displayMode: boolean;
}

/**
 * Resilient Mathematical & Scientific Typesetting Engine
 * Extracts formulas into safe placeholders before Markdown tokenization,
 * preventing Markdown parsers from escaping backslashes or corrupting underscores.
 */
export class MathTransformer {
  /**
   * Extracts math delimiters ($$ and $) into safe placeholder tokens.
   */
  public static extractPlaceholders(content: string): {
    content: string;
    mathMap: Map<string, MathFormulaItem>;
  } {
    const mathMap = new Map<string, MathFormulaItem>();
    let counter = 0;

    // 1. Extract Display/Block Math: $$...$$
    let protectedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (_match, code) => {
      const placeholder = `%%MATH_BLOCK_${counter++}%%`;
      mathMap.set(placeholder, { code: code.trim(), displayMode: true });
      return placeholder;
    });

    // 2. Extract Inline Math: $...$
    // Ensure we don't match currency like $10 or escaped \$
    protectedContent = protectedContent.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (_match, code) => {
      const placeholder = `%%MATH_INLINE_${counter++}%%`;
      mathMap.set(placeholder, { code: code.trim(), displayMode: false });
      return placeholder;
    });

    return { content: protectedContent, mathMap };
  }

  /**
   * Restores placeholders by rendering each formula into beautiful KaTeX HTML.
   */
  public static restorePlaceholders(
    html: string,
    mathMap: Map<string, MathFormulaItem>,
    diagnostics: DocumentDiagnosticIssue[]
  ): string {
    let result = html;

    for (const [placeholder, item] of mathMap.entries()) {
      const rendered = this.renderFormula(item.code, item.displayMode, diagnostics);
      // Replace all occurrences of placeholder
      result = result.split(placeholder).join(rendered);
    }

    return result;
  }

  private static renderFormula(
    latex: string,
    displayMode: boolean,
    diagnostics: DocumentDiagnosticIssue[]
  ): string {
    try {
      const renderedHtml = katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
        output: 'html', // Clean HTML with CSS typography
        trust: true,
      });

      if (displayMode) {
        return `<div class="katex-display-wrapper my-5 py-3 px-4 rounded-xl bg-theme-surface/80 border border-theme-border/60 shadow-xs overflow-x-auto text-center" dir="ltr" data-latex="${encodeURIComponent(latex)}">${renderedHtml}</div>`;
      }

      return `<span class="katex-inline-wrapper px-1" dir="ltr" data-latex="${encodeURIComponent(latex)}">${renderedHtml}</span>`;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Syntax error in LaTeX equation';
      diagnostics.push({
        type: 'malformed_math',
        message: `خطأ في صياغة معادلة LaTeX: ${errorMessage.slice(0, 100)}`,
        severity: 'warning',
      });

      // Graceful visual degradation
      return `<span class="inline-flex items-center gap-1.5 px-2 py-1 my-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs" dir="ltr" title="${errorMessage}">
        <span class="opacity-75">⚠️ [LaTeX]</span>
        <code>${latex.replace(/</g, '&lt;')}</code>
      </span>`;
    }
  }
}
