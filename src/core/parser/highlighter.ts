import Prism from 'prismjs';

// Load commonly used language syntaxes
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

/**
 * High-Performance Syntax Highlighting Engine powered by Prism.js
 */
export class CodeHighlighter {
  private static readonly LANG_ALIASES: Record<string, string> = {
    rs: 'rust',
    ts: 'typescript',
    js: 'javascript',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    md: 'markdown',
  };

  /**
   * Highlights code with Prism tokens or falls back to escaped HTML.
   */
  public static highlight(code: string, lang: string): string {
    const normalizedLang = this.LANG_ALIASES[lang.toLowerCase()] || lang.toLowerCase();
    const grammar = Prism.languages[normalizedLang];

    if (grammar) {
      try {
        return Prism.highlight(code, grammar, normalizedLang);
      } catch (err) {
        console.warn(`Syntax highlight error for ${lang}:`, err);
      }
    }

    // Default safe HTML escaping
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
