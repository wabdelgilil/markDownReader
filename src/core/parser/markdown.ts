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
   * Generates a deterministic, URL-safe slug from arbitrary text supporting Arabic and Latin scripts.
   */
  public static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\w\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

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

    // 5. Configure Marked parser with custom heading, link, and paragraph hooks
    const markedInstance = new Marked({
      gfm: true,
      breaks: true,
    });

    markedInstance.use({
      renderer: {
        heading(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, { tokens, depth }: Tokens.Heading): string {
          const text = this.parser.parseInline(tokens);
          const slug = MarkdownPipeline.generateSlug(text);
          const headingId = slug || `section-${headings.length + 1}`;
          const plainText = text.replace(/<[^>]*>/g, '');
          
          headings.push({ id: headingId, text: plainText, level: depth });

          const dir = BiDiArbitrator.detectDirection(plainText);
          return `<h${depth} id="${headingId}" class="markdown-heading group font-semibold scroll-mt-20 my-4 text-theme-text transition-all duration-300" dir="${dir}">
            ${text}
            <a href="#${headingId}" data-internal-anchor="${headingId}" class="heading-anchor text-theme-muted hover:text-theme-accent transition-opacity mx-2 opacity-0 group-hover:opacity-100" title="رابط مباشر للعنوان" aria-label="رابط مباشر للعنوان">🔗</a>
          </h${depth}>`;
        },
        link(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, { href, title, tokens }: Tokens.Link): string {
          const text = this.parser.parseInline(tokens);
          const safeHref = (href || '').trim();
          const isExternal = /^https?:\/\//i.test(safeHref) || /^mailto:/i.test(safeHref) || /^tel:/i.test(safeHref);
          const isAnchor = safeHref.startsWith('#');
          const isWorkspaceDoc = !isExternal && !isAnchor && (safeHref.endsWith('.md') || safeHref.endsWith('.markdown') || safeHref.includes('.md#'));
          const titleAttr = title ? ` title="${title}"` : '';

          if (isExternal) {
            return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttr} class="markdown-link external-link inline-flex items-center gap-1 font-medium text-theme-accent hover:text-theme-accent-hover underline underline-offset-4 decoration-theme-accent/40 hover:decoration-theme-accent transition-colors group"><span>${text}</span><svg class="w-3.5 h-3.5 inline-block shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`;
          }

          if (isAnchor) {
            const rawTarget = decodeURIComponent(safeHref.slice(1));
            const normalizedSlug = MarkdownPipeline.generateSlug(rawTarget) || rawTarget;
            return `<a href="#${normalizedSlug}" data-internal-anchor="${normalizedSlug}" data-raw-target="${rawTarget}"${titleAttr} class="markdown-link internal-anchor-link inline-flex items-center gap-1 font-medium text-theme-accent hover:text-theme-accent-hover underline underline-offset-4 decoration-theme-accent/30 hover:decoration-theme-accent cursor-pointer transition-colors">${text}</a>`;
          }

          if (isWorkspaceDoc) {
            return `<a href="${safeHref}" data-workspace-link="${safeHref}"${titleAttr} class="markdown-link workspace-doc-link inline-flex items-center gap-1 font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/40 hover:decoration-indigo-400 cursor-pointer transition-colors"><span>${text}</span><svg class="w-3.5 h-3.5 inline-block shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></a>`;
          }

          return `<a href="${safeHref}"${titleAttr} class="markdown-link font-medium text-theme-accent hover:text-theme-accent-hover underline underline-offset-4 decoration-theme-accent/30 hover:decoration-theme-accent transition-colors">${text}</a>`;
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
    let domPurifyInstance = DOMPurify;
    if (typeof (DOMPurify as any) === 'function' && typeof (DOMPurify as any).sanitize !== 'function') {
      if (typeof window !== 'undefined') {
        domPurifyInstance = (DOMPurify as any)(window);
      } else {
        try {
          const { JSDOM } = require('jsdom');
          domPurifyInstance = (DOMPurify as any)(new JSDOM('').window);
        } catch {
          domPurifyInstance = DOMPurify;
        }
      }
    }

    const sanitizedHtml = domPurifyInstance.sanitize(withRestoredMath, {
      ADD_TAGS: [
        'bdi', 'span', 'div', 'button', 'svg', 'path', 'polyline', 'line', 'rect', 'details', 'summary',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'pre', 'hr', 'a', 'mark',
      ],
      ADD_ATTR: [
        'dir', 'data-diagram-id', 'data-diagram-code', 'data-latex',
        'data-action', 'data-code', 'target', 'rel', 'class', 'id', 'align', 'title', 'style',
        'aria-hidden', 'href', 'data-internal-anchor', 'data-raw-target', 'data-workspace-link',
        'data-annotation-id', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
        'stroke-linejoin', 'x1', 'y1', 'x2', 'y2', 'points', 'd',
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

    const inlineParser = new Marked({ gfm: true, breaks: true });

    return content.replace(/>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\r?\n((?:>.*\r?\n?)*)/gi, (_match, type, body) => {
      const upperType = type.toUpperCase();
      const meta = calloutTypes[upperType] || calloutTypes.NOTE;
      const cleanBody = body.replace(/^>\s?/gm, '').trim();
      const parsedBody = (inlineParser.parseInline(cleanBody) as string) || cleanBody;
      const dir = BiDiArbitrator.detectDirection(cleanBody);

      return `<div class="callout-block my-5 p-4 rounded-xl border-r-4 ${meta.border} ${meta.bg} shadow-sm" dir="${dir}">
        <div class="callout-title flex items-center gap-2 font-semibold text-sm ${meta.color} mb-1.5">
          <span>${meta.icon}</span>
          <span>${meta.title} (${upperType})</span>
        </div>
        <div class="callout-body text-sm leading-relaxed text-theme-text/90">${parsedBody}</div>
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
      const slug = match[1].trim();
      const decoded = decodeURIComponent(slug);
      const normalized = this.generateSlug(decoded);
      if (!validSlugs.has(slug) && !validSlugs.has(decoded) && !validSlugs.has(normalized)) {
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
