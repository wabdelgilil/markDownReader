import { Marked, Tokens } from 'marked';
import DOMPurify from 'dompurify';
import { BiDiArbitrator } from '../bidi/arbitrator';
import { MathTransformer } from '../math/katex';
import { DiagramEngine } from '../diagrams/mermaid';
import { CodeHighlighter } from './highlighter';
import {
  ParsedDocument,
  DocumentHeading,
  DocumentMetadata,
  DocumentStats,
  DocumentDiagnosticIssue,
} from '../types';

/**
 * Universal Markdown Parser Pipeline
 */
export class MarkdownPipeline {
  /**
   * Primary entry point: transforms raw markdown into a fully typed ParsedDocument.
   */
  public static parse(raw: string): {
    document: ParsedDocument;
    diagrams: Map<string, string>;
  } {
    const diagnostics: DocumentDiagnosticIssue[] = [];
    const headings: DocumentHeading[] = [];

    // 1. Extract Frontmatter (YAML metadata)
    const { content: withoutFrontmatter, metadata } = this.extractFrontmatter(raw);

    // 2. Extract Mermaid Diagrams into placeholders before markdown tokenization
    const { content: withoutDiagrams, diagrams } = DiagramEngine.extractPlaceholders(withoutFrontmatter);

    // 3. Extract KaTeX Mathematics into safe placeholders to prevent markdown corruption
    const { content: withoutMath, mathMap } = MathTransformer.extractPlaceholders(withoutDiagrams);

    // 4. Process GitHub Alerts / Callouts
    const withCallouts = this.transformCallouts(withoutMath);

    // 5. Configure Marked parser with custom heading and paragraph hooks
    const markedInstance = new Marked({
      gfm: true,
      breaks: true,
    });

    markedInstance.use({
      renderer: {
        heading(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, { tokens, depth }: Tokens.Heading): string {
          const text = this.parser.parseInline(tokens);
          const slug = text
            .toLowerCase()
            .replace(/<[^>]*>/g, '')
            .replace(/[^\w\u0600-\u06FF]+/g, '-')
            .replace(/^-+|-+$/g, '');

          const headingId = slug || `section-${headings.length + 1}`;
          const plainText = text.replace(/<[^>]*>/g, '');
          
          headings.push({ id: headingId, text: plainText, level: depth });

          const dir = BiDiArbitrator.detectDirection(plainText);
          return `<h${depth} id="${headingId}" class="markdown-heading font-semibold scroll-mt-20 my-4 text-theme-text" dir="${dir}">
            <a href="#${headingId}" class="heading-anchor text-theme-muted hover:text-theme-accent transition-colors ml-1.5 opacity-60 hover:opacity-100">#</a>
            ${text}
          </h${depth}>`;
        },
        paragraph(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, { tokens }: Tokens.Paragraph): string {
          const text = this.parser.parseInline(tokens);
          const dir = BiDiArbitrator.detectDirection(text);
          return `<p class="markdown-paragraph my-3 leading-relaxed text-theme-text" dir="${dir}">${text}</p>`;
        },
        codespan({ text }: Tokens.Codespan): string {
          return `<code class="font-mono text-xs md:text-sm px-1.5 py-0.5 rounded bg-theme-surface text-theme-accent border border-theme-border/60" dir="ltr"><bdi dir="ltr">${text}</bdi></code>`;
        },
        code({ text, lang }: Tokens.Code): string {
          const language = (lang || 'code').trim();
          const highlightedCode = CodeHighlighter.highlight(text, language);
          const encodedRaw = encodeURIComponent(text);

          return `<div class="notion-code-card my-6 rounded-2xl border border-theme-border bg-theme-surface shadow-md overflow-hidden select-text" dir="ltr" style="direction: ltr !important; text-align: left !important;">
            <div class="code-card-header flex items-center justify-between px-4 py-2.5 border-b border-theme-border bg-theme-bg/90 text-xs font-mono select-none" dir="ltr" style="direction: ltr !important;">
              <div class="flex items-center gap-2">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                <span class="ml-2 px-2.5 py-0.5 rounded-md font-semibold text-[11px] uppercase tracking-wider bg-theme-accent/15 text-theme-accent border border-theme-accent/30 font-mono">${language}</span>
              </div>
              <button class="copy-code-btn flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans font-medium text-theme-muted hover:text-theme-text hover:bg-theme-surface border border-theme-border transition-all cursor-pointer active:scale-95" data-code="${encodedRaw}" title="نسخ الكود إلى الحافظة">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span class="btn-text">نسخ الكود</span>
              </button>
            </div>
            <div class="p-4 overflow-x-auto text-left font-mono text-xs md:text-sm leading-relaxed" dir="ltr" style="direction: ltr !important; text-align: left !important;">
              <pre class="m-0 p-0 font-mono" dir="ltr" style="direction: ltr !important; text-align: left !important;"><code class="language-${language} font-mono" dir="ltr" style="direction: ltr !important; text-align: left !important;">${highlightedCode}</code></pre>
            </div>
          </div>`;
        },
      },
    });

    const parsedRawHtml = markedInstance.parse(withCallouts) as string;

    // 6. Restore KaTeX Mathematics with resilient HTML rendering
    const withRestoredMath = MathTransformer.restorePlaceholders(parsedRawHtml, mathMap, diagnostics);

    // 7. Sanitize HTML preserving styling and math attributes
    const sanitizedHtml = DOMPurify.sanitize(withRestoredMath, {
      ADD_TAGS: [
        'bdi', 'span', 'div', 'button', 'svg', 'path', 'details', 'summary',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre', 'hr',
      ],
      ADD_ATTR: [
        'dir', 'data-diagram-id', 'data-diagram-code', 'data-latex',
        'data-action', 'data-code', 'target', 'class', 'id', 'align', 'title', 'style',
        'aria-hidden',
      ],
    });

    // 8. Compute Document Metrics & Diagnostics
    const stats = this.computeStats(raw, headings.length, diagrams.size);
    this.runDiagnostics(raw, headings, diagnostics);

    return {
      document: {
        raw,
        html: sanitizedHtml,
        metadata,
        headings,
        stats,
        diagnostics,
      },
      diagrams,
    };
  }

  private static extractFrontmatter(raw: string): {
    content: string;
    metadata: DocumentMetadata;
  } {
    const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!frontmatterMatch) {
      return { content: raw, metadata: {} };
    }

    const yamlBlock = frontmatterMatch[1];
    const metadata: DocumentMetadata = {};

    yamlBlock.split('\n').forEach((line) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
        metadata[key] = value;
      }
    });

    const content = raw.substring(frontmatterMatch[0].length);
    return { content, metadata };
  }

  private static transformCallouts(content: string): string {
    const calloutTypes: Record<string, { title: string; color: string; border: string; bg: string; icon: string }> = {
      NOTE: { title: 'ملاحظة', color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500/10', icon: 'ℹ️' },
      TIP: { title: 'نصيحة', color: 'text-emerald-500', border: 'border-emerald-500', bg: 'bg-emerald-500/10', icon: '💡' },
      IMPORTANT: { title: 'هام', color: 'text-purple-500', border: 'border-purple-500', bg: 'bg-purple-500/10', icon: '📌' },
      WARNING: { title: 'تحذير', color: 'text-amber-500', border: 'border-amber-500', bg: 'bg-amber-500/10', icon: '⚠️' },
      CAUTION: { title: 'تنبيه خطر', color: 'text-rose-500', border: 'border-rose-500', bg: 'bg-rose-500/10', icon: '🚨' },
    };

    return content.replace(/>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\r?\n((?:>.*\r?\n?)*)/gi, (_match, type, body) => {
      const upperType = type.toUpperCase();
      const meta = calloutTypes[upperType] || calloutTypes.NOTE;
      const cleanBody = body.replace(/^>\s?/gm, '').trim();
      const dir = BiDiArbitrator.detectDirection(cleanBody);

      return `<div class="callout-block my-5 p-4 rounded-xl border-r-4 ${meta.border} ${meta.bg} shadow-sm" dir="${dir}">
        <div class="flex items-center gap-2 font-semibold text-sm ${meta.color} mb-1.5">
          <span>${meta.icon}</span>
          <span>${meta.title} (${upperType})</span>
        </div>
        <div class="text-sm leading-relaxed text-theme-text/90">${cleanBody}</div>
      </div>\n\n`;
    });
  }

  private static computeStats(raw: string, headingsCount: number, diagramsCount: number): DocumentStats {
    const arabicWords = (raw.match(/[\u0600-\u06FF]+/g) || []).length;
    const englishWords = (raw.match(/[a-zA-Z]+/g) || []).length;
    const totalWords = arabicWords + englishWords;
    const mathBlocksCount = (raw.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) || []).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 180));

    return {
      totalWords,
      arabicWords,
      englishWords,
      readingTimeMinutes,
      headingsCount,
      diagramsCount,
      mathBlocksCount,
    };
  }

  private static runDiagnostics(
    raw: string,
    headings: DocumentHeading[],
    diagnostics: DocumentDiagnosticIssue[]
  ): void {
    // 1. Detect broken internal anchor links [text](#slug)
    const validSlugs = new Set(headings.map((h) => h.id));
    const anchorMatches = raw.matchAll(/\[.*?\]\(#([^\)]+)\)/g);
    for (const match of anchorMatches) {
      const slug = match[1];
      if (!validSlugs.has(slug)) {
        diagnostics.push({
          type: 'dead_anchor',
          message: `رابط داخلي لقسم غير موجود: #${slug}`,
          severity: 'warning',
        });
      }
    }

    // 2. Check for missing local image references
    const imageMatches = raw.matchAll(/!\[.*?\]\((?!https?:\/\/)(.*?)\)/g);
    for (const match of imageMatches) {
      diagnostics.push({
        type: 'broken_image',
        message: `صورة محلية قد تتطلب التحقق من مسارها: ${match[1]}`,
        severity: 'info',
      });
    }
  }
}
