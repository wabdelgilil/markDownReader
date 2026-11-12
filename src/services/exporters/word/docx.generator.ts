import JSZip from 'jszip';
import { ParsedDocument } from '../../../core/types';
import { ExportOptions } from '../types';
import { OmmlConverter } from './omml';
import { WordDiagramShapeEngine } from './diagram.shapes';
import { OpenXmlTemplates } from './openxml.templates';
import { TableBuilder } from './table.builder';
import { BiDiArbitrator } from '../../../core/bidi/arbitrator';
import { CodeHighlighter } from '../../../core/parser/highlighter';
import Prism from 'prismjs';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

/**
 * Enterprise OpenXML DOCX Document Generator
 * Constructs fully compliant Microsoft Word documents with:
 * - Native OMML mathematical equations (editable in Word Equation Tools)
 * - Native Word drawing shapes / blocks for diagrams (editable VML blocks)
 * - Complete RTL Arabic bidirectional paragraph and table typography
 * - Clean callout alert boxes, shaded code cards, and outline headings without markdown artifacts
 */
export class DocxGenerator {
  private static bookmarkCounter = 1;

  private static nextBookmarkId(): number {
    return this.bookmarkCounter++;
  }

  private static cleanBookmarkName(raw: string): string {
    const sanitized = raw
      .replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')
      .replace(/^_+/, '')
      .substring(0, 36);
    return `bm_${sanitized || this.bookmarkCounter++}`;
  }

  public static async generate(doc: ParsedDocument, options: ExportOptions): Promise<Blob> {
    const isRtl = options.locale !== 'en';
    const zip = new JSZip();

    // 1. Static Package Files
    zip.file('[Content_Types].xml', OpenXmlTemplates.getContentTypesXml());
    zip.file('_rels/.rels', OpenXmlTemplates.getRootRelsXml());
    zip.file('word/_rels/document.xml.rels', OpenXmlTemplates.getDocumentRelsXml());
    zip.file('word/styles.xml', OpenXmlTemplates.getStylesXml());
    zip.file('word/fontTable.xml', OpenXmlTemplates.getFontTableXml());
    zip.file('word/settings.xml', OpenXmlTemplates.getSettingsXml());
    zip.file('word/webSettings.xml', OpenXmlTemplates.getWebSettingsXml());
    zip.file('word/theme/theme1.xml', OpenXmlTemplates.getThemeXml());
    zip.file('docProps/core.xml', OpenXmlTemplates.getDocPropsCoreXml(doc.metadata.title || 'Document', doc.metadata.author || 'MDFull'));
    zip.file('docProps/app.xml', OpenXmlTemplates.getDocPropsAppXml());

    // 2. Main Document Body
    const documentXml = this.buildDocumentXml(doc, options, isRtl);
    zip.file('word/document.xml', documentXml);

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }

  private static buildDocumentXml(doc: ParsedDocument, options: ExportOptions, isRtl: boolean): string {
    let docDom: Document;
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      docDom = parser.parseFromString(doc.html, 'text/html');
    } else {
      // Node.js test environment compatibility
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { JSDOM } = require('jsdom');
      docDom = new JSDOM(doc.html).window.document;
    }
    const bodyNodes = Array.from(docDom.body.childNodes);

    let bodyXml = '';

    // Title / Cover Header
    const rawTitle = doc.metadata.title || options.filename?.replace(/\.md$/i, '') || 'Document';
    const cleanTitle = rawTitle.replace(/^#+\s*/, '').trim();

    bodyXml += `
      <w:p>
        <w:pPr>
          <w:pStyle w:val="Title"/>
          ${isRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
          <w:spacing w:before="360" w:after="160"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
            <w:b/>
            <w:sz w:val="52"/>
            <w:color w:val="1E3A8A"/>
            ${isRtl ? '<w:rtl/>' : ''}
          </w:rPr>
          <w:t>${this.escapeXml(cleanTitle)}</w:t>
        </w:r>
      </w:p>
    `;

    // Metadata line if present (author, date, words)
    const metaParts: string[] = [];
    if (doc.metadata.author) metaParts.push(`الكاتب: ${doc.metadata.author}`);
    if (doc.metadata.date) metaParts.push(`التاريخ: ${doc.metadata.date}`);
    if (doc.stats?.totalWords) metaParts.push(`الكلمات: ${doc.stats.totalWords}`);

    if (metaParts.length > 0) {
      bodyXml += `
        <w:p>
          <w:pPr>
            ${isRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
            <w:spacing w:before="0" w:after="260"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
              <w:sz w:val="20"/>
              <w:color w:val="64748B"/>
              ${isRtl ? '<w:rtl/>' : ''}
            </w:rPr>
            <w:t>${this.escapeXml(metaParts.join('  |  '))}</w:t>
          </w:r>
        </w:p>
      `;
    }

    // Divider Line
    bodyXml += `
      <w:p>
        <w:pPr>
          <w:pBdr>
            <w:bottom w:val="single" w:sz="12" w:space="8" w:color="CBD5E1"/>
          </w:pBdr>
          <w:spacing w:before="60" w:after="240"/>
        </w:pPr>
      </w:p>
    `;

    // Convert each top-level HTML node
    for (const node of bodyNodes) {
      bodyXml += this.convertNode(node, options, isRtl);
    }

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w10="urn:schemas-microsoft-com:office:word">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
      ${isRtl ? '<w:bidi w:val="1"/>' : ''}
    </w:sectPr>
  </w:body>
</w:document>`;
  }

  private static convertNode(node: Node, options: ExportOptions, isRtl: boolean): string {
    if (node.nodeType === TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return '';
      return this.createParagraph(this.parseResidualMarkdown(text, isRtl), isRtl);
    }

    if (node.nodeType !== ELEMENT_NODE) return '';

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // 1. Headings (h1 - h6) - Cleanly strip any anchor # tags and stray hash symbols
    if (/^h[1-6]$/.test(tagName)) {
      const level = tagName[1];
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.heading-anchor, a[href^="#"]').forEach((a) => a.remove());
      const headingText = (clone.textContent || '').replace(/#/g, '').trim();

      if (!headingText) return '';

      const isHeadingRtl = isRtl || BiDiArbitrator.detectDirection(headingText) === 'rtl';
      const sz = level === '1' ? 40 : level === '2' ? 30 : 24;
      const color = level === '1' ? '1E3A8A' : level === '2' ? '2563EB' : '334155';

      const rawId = el.getAttribute('id') || headingText;
      const bmName = this.cleanBookmarkName(rawId);
      const bmId = this.nextBookmarkId();

      return `
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading${level}"/>
            ${isHeadingRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
            <w:spacing w:before="${level === '1' ? '360' : '240'}" w:after="120"/>
          </w:pPr>
          <w:bookmarkStart w:id="${bmId}" w:name="${bmName}"/>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
              <w:b/>
              <w:sz w:val="${sz}"/>
              <w:color w:val="${color}"/>
              ${isHeadingRtl ? '<w:rtl/>' : ''}
            </w:rPr>
            <w:t xml:space="preserve">${this.escapeXml(headingText)}</w:t>
          </w:r>
          <w:bookmarkEnd w:id="${bmId}"/>
        </w:p>
      `;
    }

    // 2. Display / Block Math Equation (from MathTransformer)
    if (el.classList.contains('katex-display-wrapper')) {
      const rawLatex = el.getAttribute('data-latex');
      if (rawLatex) {
        const decoded = decodeURIComponent(rawLatex);
        const ommlXml = OmmlConverter.latexToOmml(decoded, true);
        return `
          <w:p>
            <w:pPr>
              <w:jc w:val="center"/>
              <w:spacing w:before="200" w:after="200"/>
            </w:pPr>
            ${ommlXml}
          </w:p>
        `;
      }
    }

    // 3. Diagram Container (Flowchart, Sequence, Mindmap, etc.)
    if (el.classList.contains('mermaid-diagram-container') || el.hasAttribute('data-diagram-id') || (el.hasAttribute('id') && options.diagrams?.has(el.getAttribute('id')!))) {
      const diagramId = el.getAttribute('data-diagram-id') || el.getAttribute('id') || '';
      const encodedCode = el.getAttribute('data-diagram-code');
      const diagramCode = (encodedCode ? decodeURIComponent(encodedCode) : '') || (diagramId ? options.diagrams?.get(diagramId) : '') || '';
      if (diagramCode) {
        return WordDiagramShapeEngine.generateWordShapes(diagramCode);
      }
    }

    // 4. Notion Code Card (<div class="notion-code-card">)
    if (el.classList.contains('notion-code-card')) {
      const codeEl = el.querySelector('pre code') || el.querySelector('pre');
      const langMatch = codeEl?.className.match(/language-(\w+)/);
      const lang = langMatch?.[1] || el.querySelector('.code-card-header .font-mono:not(button *)')?.textContent?.trim() || '';
      const codeText = codeEl?.textContent || '';
      return this.renderCodeBlock(codeText, lang);
    }

    // Standalone <pre><code>
    if (tagName === 'pre') {
      const codeEl = el.querySelector('code') || el;
      const langMatch = codeEl?.className.match(/language-(\w+)/);
      const lang = langMatch?.[1] || '';
      const codeText = codeEl.textContent || '';
      return this.renderCodeBlock(codeText, lang);
    }

    // 5. GitHub / Markdown Callout Alerts (<div class="callout-block">)
    if (el.classList.contains('callout-block')) {
      return this.renderCalloutBox(el, isRtl);
    }

    // 6. Blockquote
    if (tagName === 'blockquote') {
      const innerParagraphs = Array.from(el.querySelectorAll('p'));
      const text = (innerParagraphs.length > 0 ? innerParagraphs.map(p => p.textContent).join('\n') : el.textContent) || '';
      return `
        <w:p>
          <w:pPr>
            <w:pBdr>
              <w:${isRtl ? 'right' : 'left'} w:val="single" w:sz="24" w:space="6" w:color="4F46E5"/>
            </w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
            ${isRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
            <w:spacing w:before="120" w:after="120"/>
            <w:ind w:${isRtl ? 'right' : 'left'}="240"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
              <w:i/>
              <w:sz w:val="21"/>
              <w:color w:val="475569"/>
              ${isRtl ? '<w:rtl/>' : ''}
            </w:rPr>
            <w:t>${this.escapeXml(text.trim())}</w:t>
          </w:r>
        </w:p>
      `;
    }

    // 7. Collapsible <details> Section
    if (tagName === 'details') {
      const summaryEl = el.querySelector('summary');
      const summaryText = (summaryEl?.textContent || 'تفاصيل إضافية').trim();
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelector('summary')?.remove();
      const contentNodes = Array.from(clone.childNodes);

      let innerXml = '';
      for (const child of contentNodes) {
        innerXml += this.convertNode(child, options, isRtl);
      }
      if (!innerXml.trim()) {
        const rawContent = (clone.textContent || '').trim();
        if (rawContent) {
          innerXml = this.createParagraph(this.parseResidualMarkdown(rawContent, isRtl), isRtl);
        }
      }

      return `
        <w:p>
          <w:pPr>
            <w:pBdr>
              <w:top w:val="single" w:sz="6" w:space="4" w:color="0EA5E9"/>
              <w:${isRtl ? 'right' : 'left'} w:val="single" w:sz="18" w:space="4" w:color="0EA5E9"/>
              <w:bottom w:val="single" w:sz="6" w:space="4" w:color="0EA5E9"/>
              <w:${isRtl ? 'left' : 'right'} w:val="single" w:sz="6" w:space="4" w:color="0EA5E9"/>
            </w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="F0F9FF"/>
            ${isRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
            <w:spacing w:before="120" w:after="80"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
              <w:b/>
              <w:sz w:val="21"/>
              <w:color w:val="0369A1"/>
              ${isRtl ? '<w:rtl/>' : ''}
            </w:rPr>
            <w:t xml:space="preserve">▼  ${this.escapeXml(summaryText)}</w:t>
          </w:r>
        </w:p>
        ${innerXml}
      `;
    }

    // 7. Tables
    if (tagName === 'table') {
      return TableBuilder.convertTable(el, isRtl);
    }

    // 8. Lists (ul, ol)
    if (tagName === 'ul' || tagName === 'ol') {
      return this.convertList(el, tagName === 'ol', isRtl);
    }

    // 9. Horizontal Rule (hr)
    if (tagName === 'hr') {
      return `
        <w:p>
          <w:pPr>
            <w:pBdr>
              <w:bottom w:val="single" w:sz="6" w:space="6" w:color="E2E8F0"/>
            </w:pBdr>
            <w:spacing w:before="180" w:after="180"/>
          </w:pPr>
        </w:p>
      `;
    }

    // 10. Standard Paragraphs or general containers
    const rawParaText = el.textContent || '';
    const isParaRtl = BiDiArbitrator.detectDirection(rawParaText) === 'rtl';
    const runs = this.convertInlineRuns(el, isParaRtl);
    if (!runs) return '';

    return `
      <w:p>
        <w:pPr>
          ${isParaRtl ? '<w:bidi/><w:jc w:val="both"/>' : '<w:jc w:val="left"/>'}
          <w:spacing w:before="60" w:after="100" w:line="276" w:lineRule="auto"/>
        </w:pPr>
        ${runs}
      </w:p>
    `;
  }

  /**
   * Renders a pristine code block inside a shaded box with language tag, borders, and syntax highlighting.
   */
  private static renderCodeBlock(codeText: string, lang: string): string {
    let codeRuns = '';

    if (lang) {
      codeRuns += `<w:r>
        <w:rPr>
          <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
          <w:b/>
          <w:sz w:val="18"/>
          <w:color w:val="2563EB"/>
        </w:rPr>
        <w:t xml:space="preserve">[${this.escapeXml(lang.toUpperCase())}]</w:t>
      </w:r><w:r><w:br/></w:r>`;
    }

    const tokens = CodeHighlighter.tokenize(codeText, lang);
    codeRuns += this.renderPrismTokens(tokens);

    return `
      <w:p>
        <w:pPr>
          <w:jc w:val="left"/>
          <w:keepLines/>
          <w:pBdr>
            <w:top w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/>
            <w:left w:val="single" w:sz="18" w:space="4" w:color="3B82F6"/>
            <w:bottom w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/>
            <w:right w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/>
          </w:pBdr>
          <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
          <w:spacing w:before="160" w:after="160"/>
        </w:pPr>
        ${codeRuns}
      </w:p>
    `;
  }

  /**
   * Translates Prism tokens into colored, styled Word OpenXML runs.
   */
  private static renderPrismTokens(
    tokens: (string | Prism.Token)[],
    inheritedColor?: string,
    inheritedBold?: boolean,
    inheritedItalic?: boolean
  ): string {
    let xml = '';

    const getTokenStyle = (type: string) => {
      switch (type) {
        case 'keyword':
        case 'boolean':
        case 'tag':
          return { color: '005CC5', bold: true, italic: false };
        case 'string':
        case 'char':
        case 'attr-value':
          return { color: '032F62', bold: false, italic: false };
        case 'comment':
        case 'prolog':
        case 'doctype':
        case 'cdata':
          return { color: '6A737D', bold: false, italic: true };
        case 'function':
        case 'function-variable':
          return { color: '6F42C1', bold: false, italic: false };
        case 'number':
          return { color: '005CC5', bold: false, italic: false };
        case 'operator':
        case 'entity':
        case 'url':
          return { color: 'D73A49', bold: false, italic: false };
        case 'class-name':
        case 'type':
          return { color: '6F42C1', bold: true, italic: false };
        case 'property':
        case 'constant':
        case 'symbol':
          return { color: '005CC5', bold: false, italic: false };
        case 'variable':
        case 'parameter':
          return { color: 'E36209', bold: false, italic: false };
        case 'punctuation':
          return { color: '24292E', bold: false, italic: false };
        default:
          return { color: '24292E', bold: false, italic: false };
      }
    };

    for (const token of tokens) {
      if (typeof token === 'string') {
        const color = inheritedColor || '24292E';
        const bold = inheritedBold || false;
        const italic = inheritedItalic || false;

        const lines = token.split('\n');
        lines.forEach((lineText, idx) => {
          if (idx > 0) {
            xml += '<w:r><w:br/></w:r>';
          }
          if (lineText) {
            xml += `<w:r>
              <w:rPr>
                <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                <w:sz w:val="19"/>
                <w:color w:val="${color}"/>
                ${bold ? '<w:b/>' : ''}
                ${italic ? '<w:i/>' : ''}
              </w:rPr>
              <w:t xml:space="preserve">${this.escapeXml(lineText)}</w:t>
            </w:r>`;
          }
        });
      } else {
        const style = getTokenStyle(token.type);
        const color = inheritedColor || style.color;
        const bold = inheritedBold !== undefined ? inheritedBold : style.bold;
        const italic = inheritedItalic !== undefined ? inheritedItalic : style.italic;

        if (typeof token.content === 'string') {
          const lines = token.content.split('\n');
          lines.forEach((lineText, idx) => {
            if (idx > 0) {
              xml += '<w:r><w:br/></w:r>';
            }
            if (lineText) {
              xml += `<w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                  <w:sz w:val="19"/>
                  <w:color w:val="${color}"/>
                  ${bold ? '<w:b/>' : ''}
                  ${italic ? '<w:i/>' : ''}
                </w:rPr>
                <w:t xml:space="preserve">${this.escapeXml(lineText)}</w:t>
              </w:r>`;
            }
          });
        } else if (Array.isArray(token.content)) {
          xml += this.renderPrismTokens(token.content, color, bold, italic);
        } else if (token.content && typeof token.content === 'object') {
          xml += this.renderPrismTokens([token.content as Prism.Token], color, bold, italic);
        }
      }
    }

    return xml;
  }

  /**
   * Renders a GitHub-style alert callout box as an elegant Word table card.
   */
  private static renderCalloutBox(calloutEl: HTMLElement, _defaultRtl: boolean): string {
    const titleEl = calloutEl.querySelector('.callout-title, .font-semibold') || calloutEl.firstElementChild;
    const titleText = (titleEl?.textContent || 'ملاحظة').trim();

    // Determine color theme based on callout title
    let borderColor = '3B82F6';
    let bgColor = 'EFF6FF';
    let titleColor = '1D4ED8';

    if (/tip|نصيحة/i.test(titleText)) {
      borderColor = '10B981';
      bgColor = 'ECFDF5';
      titleColor = '047857';
    } else if (/important|هام/i.test(titleText)) {
      borderColor = '8B5CF6';
      bgColor = 'F5F3FF';
      titleColor = '6D28D9';
    } else if (/warning|تحذير/i.test(titleText)) {
      borderColor = 'F59E0B';
      bgColor = 'FFFBEB';
      titleColor = 'B45309';
    } else if (/caution|خطر/i.test(titleText)) {
      borderColor = 'EF4444';
      bgColor = 'FEF2F2';
      titleColor = 'B91C1C';
    }

    const bodyEl = calloutEl.querySelector('.callout-body, .text-sm:last-child') || calloutEl;
    const isCalloutRtl = BiDiArbitrator.detectDirection(bodyEl.textContent || titleText) === 'rtl';

    let bodyRuns = '';
    if (bodyEl !== titleEl) {
      bodyRuns = this.convertInlineRuns(bodyEl as HTMLElement, isCalloutRtl);
    }
    if (!bodyRuns) {
      const rawBody = (bodyEl.textContent || '').replace(titleText, '').trim();
      bodyRuns = this.parseResidualMarkdown(rawBody, isCalloutRtl);
    }

    const titleRuns = `<w:r>
      <w:rPr>
        <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
        <w:b/>
        <w:sz w:val="21"/>
        <w:color w:val="${titleColor}"/>
        ${isCalloutRtl ? '<w:rtl/>' : ''}
      </w:rPr>
      <w:t xml:space="preserve">${this.escapeXml(titleText)}</w:t>
    </w:r>`;

    return `
      <w:tbl>
        <w:tblPr>
          <w:tblW w:w="5000" w:type="pct"/>
          ${isCalloutRtl ? '<w:bidiVisual/>' : ''}
          <w:tblBorders>
            <w:top w:val="none"/>
            <w:bottom w:val="none"/>
            <w:${isCalloutRtl ? 'right' : 'left'} w:val="single" w:sz="24" w:space="0" w:color="${borderColor}"/>
            <w:${isCalloutRtl ? 'left' : 'right'} w:val="none"/>
            <w:insideH w:val="none"/>
            <w:insideV w:val="none"/>
          </w:tblBorders>
          <w:tblCellMar>
            <w:top w:w="120" w:type="dxa"/>
            <w:left w:w="160" w:type="dxa"/>
            <w:bottom w:w="120" w:type="dxa"/>
            <w:right w:w="160" w:type="dxa"/>
          </w:tblCellMar>
        </w:tblPr>
        <w:tr>
          <w:trPr>
            <w:cantSplit/>
          </w:trPr>
          <w:tc>
            <w:tcPr>
              <w:tcW w:w="0" w:type="auto"/>
              <w:shd w:val="clear" w:color="auto" w:fill="${bgColor}"/>
            </w:tcPr>
            <w:p>
              <w:pPr>
                <w:keepNext/>
                ${isCalloutRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
                <w:spacing w:before="40" w:after="40"/>
              </w:pPr>
              ${titleRuns}
            </w:p>
            <w:p>
              <w:pPr>
                ${isCalloutRtl ? '<w:bidi/><w:jc w:val="both"/>' : '<w:jc w:val="left"/>'}
                <w:spacing w:before="40" w:after="60"/>
              </w:pPr>
              ${bodyRuns}
            </w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
    `;
  }

  private static convertList(listEl: HTMLElement, isOrdered: boolean, defaultRtl: boolean): string {
    const items = Array.from(listEl.querySelectorAll(':scope > li'));
    let xml = '';

    const hasAnyArabic = items.some((li) => /[\u0600-\u06FF]/.test(li.textContent || ''));
    const isListRtl = defaultRtl || hasAnyArabic;

    items.forEach((li, idx) => {
      const clone = li.cloneNode(true) as HTMLElement;
      const checkbox = clone.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      let prefix = isOrdered ? `${idx + 1}.` : '•';
      let prefixColor = '3B82F6';

      if (checkbox) {
        const isChecked = checkbox.checked || checkbox.hasAttribute('checked') || li.querySelector('input[checked]') !== null;
        prefix = isChecked ? '☑' : '☐';
        prefixColor = isChecked ? '10B981' : '94A3B8';
        checkbox.remove();
      }

      const runs = this.convertInlineRuns(clone, isListRtl);

      xml += `
        <w:p>
          <w:pPr>
            ${isListRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
            <w:spacing w:before="50" w:after="50"/>
            <w:ind w:${isListRtl ? 'right' : 'left'}="480" w:hanging="240"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
              <w:b/>
              <w:color w:val="${prefixColor}"/>
              ${isListRtl ? '<w:rtl/>' : ''}
            </w:rPr>
            <w:t xml:space="preserve">${prefix}  </w:t>
          </w:r>
          ${runs}
        </w:p>
      `;
    });

    return xml;
  }

  private static convertInlineRuns(parent: HTMLElement, isRtl: boolean): string {
    let runs = '';

    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === TEXT_NODE) {
        const text = child.textContent;
        if (text) {
          runs += this.parseResidualMarkdown(text, isRtl);
        }
        continue;
      }

      if (child.nodeType !== ELEMENT_NODE) continue;

      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Inline Math Equation
      if (el.classList.contains('katex-inline-wrapper')) {
        const rawLatex = el.getAttribute('data-latex');
        if (rawLatex) {
          const decoded = decodeURIComponent(rawLatex);
          runs += OmmlConverter.latexToOmml(decoded, false);
          continue;
        }
      }

      // Strong / Bold
      if (tag === 'strong' || tag === 'b') {
        runs += this.createRun(el.textContent || '', { bold: true }, isRtl);
        continue;
      }

      // Italic / Em
      if (tag === 'em' || tag === 'i') {
        runs += this.createRun(el.textContent || '', { italic: true }, isRtl);
        continue;
      }

      // Inline Code
      if (tag === 'code') {
        runs += `<w:r>
          <w:rPr>
            <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
            <w:sz w:val="19"/>
            <w:color w:val="BE185D"/>
            <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
            ${isRtl ? '<w:rtl/>' : ''}
          </w:rPr>
          <w:t xml:space="preserve">${this.escapeXml(el.textContent || '')}</w:t>
        </w:r>`;
        continue;
      }

      // Hyperlink
      if (tag === 'a') {
        // Ignore heading anchor
        if (el.classList.contains('heading-anchor')) {
          continue;
        }
        const linkText = el.textContent || '';
        const href = (el.getAttribute('href') || '').trim();

        if (href.startsWith('#')) {
          const rawTarget = decodeURIComponent(href.slice(1));
          const bmName = this.cleanBookmarkName(rawTarget);
          runs += `<w:hyperlink w:anchor="${this.escapeXml(bmName)}" w:history="1">
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                <w:color w:val="2563EB"/>
                <w:u w:val="single"/>
                ${isRtl ? '<w:rtl/>' : ''}
              </w:rPr>
              <w:t>${this.escapeXml(linkText)}</w:t>
            </w:r>
          </w:hyperlink>`;
          continue;
        }

        runs += `<w:r>
          <w:rPr>
            <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
            <w:color w:val="2563EB"/>
            <w:u w:val="single"/>
            ${isRtl ? '<w:rtl/>' : ''}
          </w:rPr>
          <w:t>${this.escapeXml(linkText)}</w:t>
        </w:r>`;
        continue;
      }

      // Recursive span / mark
      runs += this.convertInlineRuns(el, isRtl);
    }

    return runs;
  }

  /**
   * Parses residual markdown markers (**bold**, `code`) in raw text nodes.
   */
  private static parseResidualMarkdown(rawText: string, isRtl: boolean): string {
    if (!rawText.includes('**') && !rawText.includes('`')) {
      return this.createRun(rawText, {}, isRtl);
    }

    let xml = '';
    // Tokenize by **bold** or `code`
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = rawText.split(regex);

    parts.forEach((part) => {
      if (!part) return;
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        xml += this.createRun(part.slice(2, -2), { bold: true }, isRtl);
      } else if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        xml += `<w:r>
          <w:rPr>
            <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
            <w:sz w:val="19"/>
            <w:color w:val="BE185D"/>
            <w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>
            ${isRtl ? '<w:rtl/>' : ''}
          </w:rPr>
          <w:t xml:space="preserve">${this.escapeXml(part.slice(1, -1))}</w:t>
        </w:r>`;
      } else {
        xml += this.createRun(part, {}, isRtl);
      }
    });

    return xml;
  }

  private static createParagraph(content: string, isRtl: boolean): string {
    return `
      <w:p>
        <w:pPr>
          ${isRtl ? '<w:bidi/><w:jc w:val="both"/>' : '<w:jc w:val="left"/>'}
          <w:spacing w:before="60" w:after="100"/>
        </w:pPr>
        ${content}
      </w:p>
    `;
  }

  private static createRun(text: string, options: { bold?: boolean; italic?: boolean }, isParentRtl: boolean): string {
    const isRunRtl = isParentRtl ? true : /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);

    return `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
          ${options.bold ? '<w:b/>' : ''}
          ${options.italic ? '<w:i/>' : ''}
          <w:sz w:val="22"/>
          <w:color w:val="1E293B"/>
          ${isRunRtl ? '<w:rtl/>' : ''}
        </w:rPr>
        <w:t xml:space="preserve">${this.escapeXml(text)}</w:t>
      </w:r>
    `;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
