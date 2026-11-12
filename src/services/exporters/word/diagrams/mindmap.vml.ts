/**
 * Mindmap VML Generator for Microsoft Word
 * Produces native hierarchical tree drawings with root node, category branches,
 * leaf topics, and connecting lines.
 */
export class MindmapVmlBuilder {
  private static idCounter = 1;

  private static nextId(prefix: string): string {
    return `${prefix}_mm_${this.idCounter++}`;
  }

  public static render(code: string): string {
    const lines = code.split('\n').filter((l) => l.trim() && !l.trim().startsWith('%%') && !l.trim().startsWith('mindmap'));
    if (lines.length === 0) return '';

    // Extract root
    const rootRaw = lines[0].trim().replace(/^root\s*\(\((.*?)\)\)|^root\s*\[(.*?)\]|^\(\((.*?)\)\)|^\[(.*?)\]|^root/i, '$1$2$3$4');
    const rootText = rootRaw || 'محطة MDFull';

    // Parse hierarchy by indentation
    interface Category {
      name: string;
      leaves: string[];
    }
    const categories: Category[] = [];
    let currentCat: Category | null = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed) continue;

      const indent = line.search(/\S/);
      const clean = trimmed.replace(/^[-+*]?\s*[\(\[]?|[\)\]]?\s*$/g, '').trim();

      if (indent <= 4 || categories.length === 0) {
        currentCat = { name: clean, leaves: [] };
        categories.push(currentCat);
      } else if (currentCat) {
        currentCat.leaves.push(clean);
      }
    }

    if (categories.length === 0) return '';

    const canvasWidth = 700;
    const catColors = [
      { fill: '#0d9488', stroke: '#0f766e' }, // Teal
      { fill: '#f59e0b', stroke: '#b45309' }, // Amber
      { fill: '#8b5cf6', stroke: '#6d28d9' }, // Purple
      { fill: '#ec4899', stroke: '#be185d' }, // Rose
    ];

    // Compute vertical positions
    let currentY = 20;
    const catLayouts: { cat: Category; y: number; height: number; leafYs: number[] }[] = [];

    categories.forEach((cat) => {
      const leafCount = Math.max(cat.leaves.length, 1);
      const catBlockHeight = leafCount * 30 + 10;
      const leafYs: number[] = [];
      for (let j = 0; j < cat.leaves.length; j++) {
        leafYs.push(currentY + j * 30);
      }
      const catCenterY = currentY + Math.round(catBlockHeight / 2) - 18;
      catLayouts.push({ cat, y: catCenterY, height: catBlockHeight, leafYs });
      currentY += catBlockHeight + 16;
    });

    const canvasHeight = Math.max(currentY + 20, 360);
    const rootX = 30;
    const rootY = Math.round(canvasHeight / 2 - 27);

    const groupId = this.nextId('grp');
    const groupHeightPt = Math.round((canvasHeight / canvasWidth) * 460);

    let vml = `<v:group id="${groupId}" style="width:460pt;height:${groupHeightPt}pt;" coordorigin="0 0" coordsize="${canvasWidth} ${canvasHeight}">`;

    // 1. Root Node
    const rootId = this.nextId('root');
    vml += `<v:roundrect id="${rootId}" style="position:absolute;left:${rootX};top:${rootY};width:150;height:54" arcsize="0.3" fillcolor="#4f46e5" strokecolor="#3730a3" strokeweight="2pt">
      <v:shadow on="t" color="#cbd5e1" offset="2pt,2pt"/>
      <v:textbox inset="4pt,4pt,4pt,4pt">
        <w:txbxContent>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                <w:b/><w:sz w:val="21"/><w:color w:val="FFFFFF"/>
              </w:rPr>
              <w:t>${this.escapeXml(rootText)}</w:t>
            </w:r>
          </w:p>
        </w:txbxContent>
      </v:textbox>
    </v:roundrect>`;

    // 2. Render Categories & Leaves
    const catX = 220;
    const catW = 160;
    const leafX = 430;
    const leafW = 180;

    catLayouts.forEach((layout, cIdx) => {
      const color = catColors[cIdx % catColors.length];
      const catY = layout.y;

      // Line: Root -> Category
      const line1Id = this.nextId('line_rc');
      vml += `<v:line id="${line1Id}" from="${rootX + 150},${rootY + 27}" to="${catX},${catY + 18}" strokecolor="${color.stroke}" strokeweight="1.75pt">
        <v:stroke endarrow="classic"/>
      </v:line>`;

      // Category Box
      const catBoxId = this.nextId('cat');
      vml += `<v:roundrect id="${catBoxId}" style="position:absolute;left:${catX};top:${catY};width:${catW};height:36" arcsize="0.25" fillcolor="${color.fill}" strokecolor="${color.stroke}" strokeweight="1.5pt">
        <v:shadow on="t" color="#cbd5e1" offset="1.5pt,1.5pt"/>
        <v:textbox inset="3pt,3pt,3pt,3pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                  <w:b/><w:sz w:val="17"/><w:color w:val="FFFFFF"/>
                </w:rPr>
                <w:t>${this.escapeXml(layout.cat.name)}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:roundrect>`;

      // Leaves
      layout.cat.leaves.forEach((leafText, lIdx) => {
        const lY = layout.leafYs[lIdx];
        const line2Id = this.nextId('line_cl');

        // Line: Category -> Leaf
        vml += `<v:line id="${line2Id}" from="${catX + catW},${catY + 18}" to="${leafX},${lY + 12}" strokecolor="#94a3b8" strokeweight="1.25pt">
          <v:stroke endarrow="classic" endarrowwidth="narrow"/>
        </v:line>`;

        // Leaf Box
        const leafBoxId = this.nextId('leaf');
        vml += `<v:roundrect id="${leafBoxId}" style="position:absolute;left:${leafX};top:${lY};width:${leafW};height:24" arcsize="0.2" fillcolor="#f8fafc" strokecolor="#cbd5e1" strokeweight="1pt">
          <v:textbox inset="2pt,2pt,2pt,2pt">
            <w:txbxContent>
              <w:p>
                <w:pPr><w:jc w:val="center"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                    <w:sz w:val="15"/><w:color w:val="1E293B"/>
                  </w:rPr>
                  <w:t>${this.escapeXml(leafText)}</w:t>
                </w:r>
              </w:p>
            </w:txbxContent>
          </v:textbox>
        </v:roundrect>`;
      });
    });

    vml += `</v:group>`;

    return `<w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="180" w:after="${Math.round(groupHeightPt * 20) + 120}"/>
        <w:keepLines/>
      </w:pPr>
      <w:r><w:pict>${vml}</w:pict></w:r>
    </w:p>`;
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
