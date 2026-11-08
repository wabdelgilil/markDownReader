/**
 * Word OpenXML Table Builder
 * Converts HTML tables into styled WordprocessingML (<w:tbl>) grid tables
 * with full RTL BiDi alignment, alternating row shading, and cell borders.
 */

export class TableBuilder {
  public static convertTable(tableEl: HTMLElement, isRtl: boolean, escapeFn?: (text: string) => string): string {
    const esc = escapeFn || this.defaultEscapeXml;
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
                <w:t>${esc(cellText.trim())}</w:t>
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

  private static defaultEscapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const DocxTableBuilder = TableBuilder;
