import JSZip from 'jszip';
import { ParsedDocument } from '../../../core/types';
import { ExportOptions } from '../types';
import { OmmlConverter } from './omml';
import { WordDiagramShapeEngine } from './diagram.shapes';

/**
 * Enterprise OpenXML DOCX Document Generator
 * Constructs fully compliant Microsoft Word documents with:
 * - Native OMML mathematical equations (editable in Word Equation Tools)
 * - Native Word drawing shapes / blocks for diagrams (editable VML shapes)
 * - Complete RTL Arabic bidirectional paragraph and table typography
 * - Formatted tables, code blocks, lists, blockquotes, and heading outlines
 */
export class DocxGenerator {
  public static async generate(doc: ParsedDocument, options: ExportOptions): Promise<Blob> {
    const isRtl = options.locale !== 'en';
    const zip = new JSZip();

    // 1. [Content_Types].xml
    zip.file('[Content_Types].xml', this.getContentTypesXml());

    // 2. _rels/.rels
    zip.file('_rels/.rels', this.getRootRelsXml());

    // 3. word/_rels/document.xml.rels
    zip.file('word/_rels/document.xml.rels', this.getDocumentRelsXml());

    // 4. word/styles.xml
    zip.file('word/styles.xml', this.getStylesXml(isRtl));

    // 5. word/fontTable.xml
    zip.file('word/fontTable.xml', this.getFontTableXml());

    // 6. word/settings.xml
    zip.file('word/settings.xml', this.getSettingsXml());

    // 7. word/document.xml
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
    const parser = new DOMParser();
    const docDom = parser.parseFromString(doc.html, 'text/html');
    const bodyNodes = Array.from(docDom.body.childNodes);

    let bodyXml = '';

    // Title / Cover Header
    const title = doc.metadata.title || options.filename?.replace(/\.md$/i, '') || 'Document';
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
          <w:t>${this.escapeXml(title)}</w:t>
        </w:r>
      </w:p>
    `;

    // Metadata line if present (author, date)
    const metaParts: string[] = [];
    if (doc.metadata.author) metaParts.push(`الكاتب: ${doc.metadata.author}`);
    if (doc.metadata.date) metaParts.push(`التاريخ: ${doc.metadata.date}`);
    if (doc.stats?.totalWords) metaParts.push(`الكلمات: ${doc.stats.totalWords}`);

    if (metaParts.length > 0) {
      bodyXml += `
        <w:p>
          <w:pPr>
            ${isRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
            <w:spacing w:before="0" w:after="300"/>
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
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return '';
      return this.createParagraph(this.createRun(text, {}, isRtl), isRtl);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // 1. Headings (h1 - h6)
    if (/^h[1-6]$/.test(tagName)) {
      const level = tagName[1];
      const headingText = el.textContent || '';
      return `
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Heading${level}"/>
            ${isRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
            <w:spacing w:before="${level === '1' ? '360' : '240'}" w:after="120"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
              <w:b/>
              <w:sz w:val="${level === '1' ? '40' : level === '2' ? '30' : '24'}"/>
              <w:color w:val="${level === '1' ? '1E3A8A' : level === '2' ? '2563EB' : '334155'}"/>
              ${isRtl ? '<w:rtl/>' : ''}
            </w:rPr>
            <w:t>${this.escapeXml(headingText)}</w:t>
          </w:r>
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
    if (el.classList.contains('mermaid-diagram-container') || el.hasAttribute('id') && options.diagrams?.has(el.getAttribute('id')!)) {
      const id = el.getAttribute('id') || '';
      const diagramCode = options.diagrams?.get(id);
      if (diagramCode) {
        return WordDiagramShapeEngine.generateWordShapes(diagramCode);
      }
    }

    // 4. Code Block (<pre><code>)
    if (tagName === 'pre') {
      const codeText = el.textContent || '';
      const lines = codeText.split('\n');
      let codeRuns = '';
      lines.forEach((line, idx) => {
        codeRuns += `<w:r>
          <w:rPr>
            <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
            <w:sz w:val="19"/>
            <w:color w:val="334155"/>
          </w:rPr>
          <w:t xml:space="preserve">${this.escapeXml(line)}</w:t>
        </w:r>${idx < lines.length - 1 ? '<w:r><w:br/></w:r>' : ''}`;
      });

      return `
        <w:p>
          <w:pPr>
            <w:pBdr>
              <w:top w:val="single" w:sz="6" w:space="4" w:color="E2E8F0"/>
              <w:left w:val="single" w:sz="12" w:space="4" w:color="3B82F6"/>
              <w:bottom w:val="single" w:sz="6" w:space="4" w:color="E2E8F0"/>
              <w:right w:val="single" w:sz="6" w:space="4" w:color="E2E8F0"/>
            </w:pBdr>
            <w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>
            <w:spacing w:before="140" w:after="140"/>
          </w:pPr>
          ${codeRuns}
        </w:p>
      `;
    }

    // 5. Blockquote
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

    // 6. Tables
    if (tagName === 'table') {
      return this.convertTable(el, isRtl);
    }

    // 7. Lists (ul, ol)
    if (tagName === 'ul' || tagName === 'ol') {
      return this.convertList(el, tagName === 'ol', isRtl);
    }

    // 8. Horizontal Rule (hr)
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

    // 9. Standard Paragraphs or general containers
    const runs = this.convertInlineRuns(el, isRtl);
    if (!runs) return '';

    return `
      <w:p>
        <w:pPr>
          ${isRtl ? '<w:bidi/><w:jc w:val="both"/>' : '<w:jc w:val="left"/>'}
          <w:spacing w:before="60" w:after="100" w:line="276" w:lineRule="auto"/>
        </w:pPr>
        ${runs}
      </w:p>
    `;
  }

  private static convertInlineRuns(parent: HTMLElement, isRtl: boolean): string {
    let runs = '';

    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (text) {
          runs += this.createRun(text, {}, isRtl);
        }
        continue;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) continue;

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
          </w:rPr>
          <w:t xml:space="preserve">${this.escapeXml(el.textContent || '')}</w:t>
        </w:r>`;
        continue;
      }

      // Hyperlink
      if (tag === 'a') {
        const linkText = el.textContent || '';
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

  private static convertTable(tableEl: HTMLElement, isRtl: boolean): string {
    const rows = Array.from(tableEl.querySelectorAll('tr'));
    if (rows.length === 0) return '';

    let rowsXml = '';

    rows.forEach((tr, rowIdx) => {
      const isHeader = tr.parentElement?.tagName.toLowerCase() === 'thead' || rowIdx === 0;
      const cells = Array.from(tr.querySelectorAll('th, td'));

      let cellsXml = '';
      cells.forEach((cell) => {
        const cellText = cell.textContent || '';
        const bgFill = isHeader ? 'E2E8F0' : rowIdx % 2 === 1 ? 'FFFFFF' : 'F8FAFC';

        cellsXml += `
          <w:tc>
            <w:tcPr>
              <w:tcW w:w="0" w:type="auto"/>
              <w:shd w:val="clear" w:color="auto" w:fill="${bgFill}"/>
              <w:tcMar>
                <w:top w:w="120" w:type="dxa"/>
                <w:left w:w="140" w:type="dxa"/>
                <w:bottom w:w="120" w:type="dxa"/>
                <w:right w:w="140" w:type="dxa"/>
              </w:tcMar>
            </w:tcPr>
            <w:p>
              <w:pPr>
                ${isRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
                <w:spacing w:before="20" w:after="20"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                  ${isHeader ? '<w:b/>' : ''}
                  <w:sz w:val="${isHeader ? '21' : '20'}"/>
                  <w:color w:val="${isHeader ? '0F172A' : '334155'}"/>
                  ${isRtl ? '<w:rtl/>' : ''}
                </w:rPr>
                <w:t>${this.escapeXml(cellText.trim())}</w:t>
              </w:r>
            </w:p>
          </w:tc>
        `;
      });

      rowsXml += `
        <w:tr>
          <w:trPr>
            ${isHeader ? '<w:tblHeader/>' : ''}
          </w:trPr>
          ${cellsXml}
        </w:tr>
      `;
    });

    return `
      <w:tbl>
        <w:tblPr>
          <w:tblW w:w="5000" w:type="pct"/>
          ${isRtl ? '<w:bidiVisual/>' : ''}
          <w:tblBorders>
            <w:top w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
            <w:left w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
            <w:right w:val="single" w:sz="8" w:space="0" w:color="CBD5E1"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          </w:tblBorders>
        </w:tblPr>
        ${rowsXml}
      </w:tbl>
    `;
  }

  private static convertList(listEl: HTMLElement, isOrdered: boolean, isRtl: boolean): string {
    const items = Array.from(listEl.querySelectorAll(':scope > li'));
    let xml = '';

    items.forEach((li, idx) => {
      const prefix = isOrdered ? `${idx + 1}. ` : '• ';
      const runs = this.convertInlineRuns(li as HTMLElement, isRtl);

      xml += `
        <w:p>
          <w:pPr>
            ${isRtl ? '<w:bidi/><w:jc w:val="right"/>' : '<w:jc w:val="left"/>'}
            <w:spacing w:before="40" w:after="40"/>
            <w:ind w:${isRtl ? 'right' : 'left'}="360" w:hanging="240"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
              <w:b/>
              <w:color w:val="3B82F6"/>
              ${isRtl ? '<w:rtl/>' : ''}
            </w:rPr>
            <w:t>${prefix}</w:t>
          </w:r>
          ${runs}
        </w:p>
      `;
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

  private static createRun(text: string, options: { bold?: boolean; italic?: boolean }, isRtl: boolean): string {
    return `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
          ${options.bold ? '<w:b/>' : ''}
          ${options.italic ? '<w:i/>' : ''}
          <w:sz w:val="22"/>
          <w:color w:val="1E293B"/>
          ${isRtl ? '<w:rtl/>' : ''}
        </w:rPr>
        <w:t xml:space="preserve">${this.escapeXml(text)}</w:t>
      </w:r>
    `;
  }

  private static getContentTypesXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
</Types>`;
  }

  private static getRootRelsXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  }

  private static getDocumentRelsXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
</Relationships>`;
  }

  private static getStylesXml(isRtl: boolean): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:eastAsia="Segoe UI" w:cs="Traditional Arabic"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="en-US" w:bidi="ar-SA"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        ${isRtl ? '<w:bidi/>' : ''}
        <w:spacing w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:outlineLvl w:val="0"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="40"/>
      <w:color w:val="1E3A8A"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:outlineLvl w:val="1"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="30"/>
      <w:color w:val="2563EB"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:outlineLvl w:val="2"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
      <w:color w:val="334155"/>
    </w:rPr>
  </w:style>
</w:styles>`;
  }

  private static getFontTableXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fontTable xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:font w:name="Segoe UI">
    <w:panose1 w:val="020B0502040204020203"/>
    <w:charset w:val="00"/>
  </w:font>
  <w:font w:name="Traditional Arabic">
    <w:panose1 w:val="02010602050305020703"/>
    <w:charset w:val="B2"/>
  </w:font>
  <w:font w:name="Consolas">
    <w:panose1 w:val="020B0609020204030204"/>
    <w:charset w:val="00"/>
  </w:font>
  <w:font w:name="Cambria Math">
    <w:panose1 w:val="02040503050406030204"/>
    <w:charset w:val="00"/>
  </w:font>
</w:fontTable>`;
  }

  private static getSettingsXml(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">
  <w:zoom w:percent="100"/>
  <m:mathPr>
    <m:mathFont m:val="Cambria Math"/>
    <m:brkBin m:val="before"/>
    <m:brkBinSub m:val="--"/>
    <m:smallFrac m:val="0"/>
    <m:dispDef/>
    <m:lMargin m:val="0"/>
    <m:rMargin m:val="0"/>
    <m:defJc m:val="center"/>
    <m:wrapIndent m:val="1440"/>
  </m:mathPr>
</w:settings>`;
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
