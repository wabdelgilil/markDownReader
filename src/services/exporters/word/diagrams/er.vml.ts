/**
 * Entity-Relationship (ER) Diagram VML Generator for Microsoft Word
 * Produces native database ER cards with entity headers, attribute rows,
 * and labeled relationship connectors.
 */
export class ErVmlBuilder {
  private static idCounter = 1;

  private static nextId(prefix: string): string {
    return `${prefix}_er_${this.idCounter++}`;
  }

  public static render(code: string): string {
    const lines = code.split('\n');

    interface Entity {
      name: string;
      attributes: string[];
    }

    const entities: Entity[] = [];
    const entityMap = new Map<string, Entity>();
    let currentEntity: Entity | null = null;

    const relationships: { from: string; to: string; label: string }[] = [];

    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line || line.startsWith('%%') || line.startsWith('erDiagram')) return;

      // Entity start: ENTITY {
      const startMatch = line.match(/^([a-zA-Z0-9_-]+)\s*\{/);
      if (startMatch) {
        const name = startMatch[1];
        currentEntity = { name, attributes: [] };
        entities.push(currentEntity);
        entityMap.set(name, currentEntity);
        return;
      }

      // Entity end: }
      if (line === '}' && currentEntity) {
        currentEntity = null;
        return;
      }

      // Inside entity: attribute
      if (currentEntity) {
        currentEntity.attributes.push(line);
        return;
      }

      // Relationship: ENTITY1 ||--o{ ENTITY2 : label
      const relMatch = line.match(/^([a-zA-Z0-9_-]+)\s*([\|\}o\-\.\<]+)\s*([a-zA-Z0-9_-]+)\s*:\s*(.+)/);
      if (relMatch) {
        relationships.push({
          from: relMatch[1],
          to: relMatch[3],
          label: relMatch[4].trim(),
        });
      }
    });

    if (entities.length === 0) return '';

    const canvasWidth = 720;
    const cardWidth = Math.min(Math.round((canvasWidth - 60) / entities.length), 200);
    const cardSpacing = Math.round((canvasWidth - cardWidth * entities.length) / Math.max(entities.length + 1, 1));

    const maxAttrs = Math.max(...entities.map((e) => e.attributes.length), 4);
    const cardHeight = 36 + maxAttrs * 24 + 16;
    const canvasHeight = cardHeight + 80;

    const groupId = this.nextId('grp');
    const groupHeightPt = Math.round((canvasHeight / canvasWidth) * 460);

    let vml = `<v:group id="${groupId}" style="width:460pt;height:${groupHeightPt}pt;" coordorigin="0 0" coordsize="${canvasWidth} ${canvasHeight}">`;

    const positions: { name: string; x: number; y: number }[] = [];

    // 1. Render Entity Cards
    entities.forEach((entity, idx) => {
      const x = cardSpacing + idx * (cardWidth + cardSpacing);
      const y = 30;
      positions.push({ name: entity.name, x, y });

      const headerId = this.nextId('hdr');
      const bodyId = this.nextId('bdy');

      // Card Header
      vml += `<v:rect id="${headerId}" style="position:absolute;left:${x};top:${y};width:${cardWidth};height:32" fillcolor="#1e40af" strokecolor="#1e3a8a" strokeweight="1.5pt">
        <v:textbox inset="3pt,3pt,3pt,3pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                  <w:b/><w:sz w:val="18"/><w:color w:val="FFFFFF"/>
                </w:rPr>
                <w:t>${this.escapeXml(entity.name)}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:rect>`;

      // Card Body with attributes
      let attrRuns = '';
      entity.attributes.forEach((attr, aIdx) => {
        const isPk = attr.includes('PK');
        const color = isPk ? 'BE185D' : '334155';
        attrRuns += `<w:r>
          <w:rPr>
            <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
            ${isPk ? '<w:b/>' : ''}
            <w:sz w:val="16"/>
            <w:color w:val="${color}"/>
          </w:rPr>
          <w:t xml:space="preserve">${this.escapeXml(attr)}</w:t>
        </w:r>${aIdx < entity.attributes.length - 1 ? '<w:r><w:br/></w:r>' : ''}`;
      });

      vml += `<v:rect id="${bodyId}" style="position:absolute;left:${x};top:${y + 32};width:${cardWidth};height:${cardHeight - 32}" fillcolor="#f8fafc" strokecolor="#cbd5e1" strokeweight="1.25pt">
        <v:shadow on="t" color="#e2e8f0" offset="1.5pt,1.5pt"/>
        <v:textbox inset="6pt,6pt,6pt,6pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="left"/><w:spacing w:line="240" w:lineRule="auto"/></w:pPr>
              ${attrRuns}
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:rect>`;
    });

    // 2. Render Relationships (Connecting Lines & Badges)
    relationships.forEach((rel) => {
      const pFrom = positions.find((p) => p.name === rel.from);
      const pTo = positions.find((p) => p.name === rel.to);
      if (!pFrom || !pTo) return;

      const fromX = pFrom.x < pTo.x ? pFrom.x + cardWidth : pFrom.x;
      const toX = pFrom.x < pTo.x ? pTo.x : pTo.x + cardWidth;
      const midY = 30 + Math.round(cardHeight / 2);

      const lineId = this.nextId('rel_line');
      vml += `<v:line id="${lineId}" from="${fromX},${midY}" to="${toX},${midY}" strokecolor="#0ea5e9" strokeweight="2pt">
        <v:stroke endarrow="classic"/>
      </v:line>`;

      // Label badge
      const lblX = Math.round((fromX + toX) / 2 - 35);
      const lblId = this.nextId('rel_lbl');
      vml += `<v:rect id="${lblId}" style="position:absolute;left:${lblX};top:${midY - 14};width:70;height:20" fillcolor="#ffffff" strokecolor="#0ea5e9" strokeweight="0.75pt">
        <v:textbox inset="1pt,1pt,1pt,1pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                  <w:sz w:val="14"/><w:color w:val="0369A1"/>
                </w:rPr>
                <w:t>${this.escapeXml(rel.label)}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:rect>`;
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
