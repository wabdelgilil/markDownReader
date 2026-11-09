/**
 * Native Microsoft Word Drawing Shapes Generator
 * Converts Mermaid diagram source code into genuine Word DrawingML / VML shape blocks.
 * Enables users to click, edit, reposition, and format diagram elements as native Word shapes.
 */

export interface WordDiagramNode {
  id: string;
  label: string;
  shapeType: 'rectangle' | 'roundrect' | 'oval' | 'diamond' | 'database';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  textColor: string;
}

export interface WordDiagramEdge {
  fromId: string;
  toId: string;
  label?: string;
  isDashed?: boolean;
}

export class WordDiagramShapeEngine {
  private static shapeCounter = 1;

  private static nextId(prefix: string): string {
    return `${prefix}_${this.shapeCounter++}`;
  }

  /**
   * Transforms diagram code into native Microsoft Word OpenXML shape elements.
   * If parsing succeeds, returns `<w:p>...<w:pict>...</w:pict>...</w:p>`.
   */
  public static generateWordShapes(diagramCode: string): string {
    const trimmed = diagramCode.trim();

    // Check if it is a flowchart / graph
    if (/^(flowchart|graph)\s+/i.test(trimmed)) {
      return this.renderFlowchartAsShapes(trimmed);
    }

    // Check if it is a mindmap
    if (/^mindmap/i.test(trimmed)) {
      return this.renderMindmapAsShapes(trimmed);
    }

    // Fallback: structured callout block for sequence / gitgraph / gantt
    return this.renderStructuredCalloutBlock(trimmed);
  }

  /**
   * Flowchart to native Word shapes.
   */
  private static renderFlowchartAsShapes(code: string): string {
    const lines = code.split('\n');
    const isLR = /^(flowchart|graph)\s+LR/i.test(lines[0].trim());

    const nodesMap = new Map<string, WordDiagramNode>();
    const edges: WordDiagramEdge[] = [];

    // Color palette for professional diagrams
    const palettes = [
      { fill: '#3b82f6', stroke: '#1d4ed8', text: '#ffffff' }, // Indigo / Blue
      { fill: '#10b981', stroke: '#047857', text: '#ffffff' }, // Emerald / Green
      { fill: '#f59e0b', stroke: '#b45309', text: '#ffffff' }, // Amber / Orange
      { fill: '#8b5cf6', stroke: '#6d28d9', text: '#ffffff' }, // Purple
      { fill: '#ec4899', stroke: '#be185d', text: '#ffffff' }, // Rose
    ];

    let colorIdx = 0;

    // Helper to get or create node
    const ensureNode = (id: string, rawLabel?: string, shapeType: WordDiagramNode['shapeType'] = 'roundrect') => {
      const cleanId = id.trim();
      if (!nodesMap.has(cleanId)) {
        const palette = palettes[colorIdx % palettes.length];
        colorIdx++;

        let label = cleanId;
        if (rawLabel) {
          label = rawLabel.trim().replace(/^["']|["']$/g, '');
        }

        nodesMap.set(cleanId, {
          id: cleanId,
          label: label || cleanId,
          shapeType,
          x: 0,
          y: 0,
          width: 160,
          height: 60,
          fillColor: palette.fill,
          strokeColor: palette.stroke,
          textColor: palette.text,
        });
      } else if (rawLabel) {
        const node = nodesMap.get(cleanId)!;
        node.label = rawLabel.trim().replace(/^["']|["']$/g, '');
        node.shapeType = shapeType;
      }
      return nodesMap.get(cleanId)!;
    };

    // Parse lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%') || line.startsWith('style') || line.startsWith('classDef') || line.startsWith('subgraph') || line === 'end') {
        continue;
      }

      // Check for connection: NodeA -->|label| NodeB or NodeA --> NodeB
      const linkMatch = line.match(/^([a-zA-Z0-9_-]+)(?:\[(.*?)\]|\((.*?)\)|\{\{(.*?)\}\}|\{(.*?)\}|\(\((.*?)\)\))?\s*(-->|---|-.->|==>)(?:\|(.*?)\|)?\s*([a-zA-Z0-9_-]+)(?:\[(.*?)\]|\((.*?)\)|\{\{(.*?)\}\}|\{(.*?)\}|\(\((.*?)\)\))?/);

      if (linkMatch) {
        const sourceId = linkMatch[1];
        const sourceLabel = linkMatch[2] || linkMatch[3] || linkMatch[4] || linkMatch[5] || linkMatch[6];
        const sourceShape: WordDiagramNode['shapeType'] = linkMatch[2] ? 'rectangle' : linkMatch[5] ? 'diamond' : linkMatch[6] ? 'oval' : 'roundrect';
        ensureNode(sourceId, sourceLabel, sourceShape);

        const linkOp = linkMatch[7];
        const edgeLabel = linkMatch[8];

        const targetId = linkMatch[9];
        const targetLabel = linkMatch[10] || linkMatch[11] || linkMatch[12] || linkMatch[13] || linkMatch[14];
        const targetShape: WordDiagramNode['shapeType'] = linkMatch[10] ? 'rectangle' : linkMatch[13] ? 'diamond' : linkMatch[14] ? 'oval' : 'roundrect';
        ensureNode(targetId, targetLabel, targetShape);

        edges.push({
          fromId: sourceId,
          toId: targetId,
          label: edgeLabel ? edgeLabel.trim() : undefined,
          isDashed: linkOp.includes('.'),
        });
        continue;
      }

      // Single Node definition: NodeA[Text]
      const singleMatch = line.match(/^([a-zA-Z0-9_-]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\}|\(\((.*?)\)\))/);
      if (singleMatch) {
        const id = singleMatch[1];
        const label = singleMatch[2] || singleMatch[3] || singleMatch[4] || singleMatch[5];
        const shapeType: WordDiagramNode['shapeType'] = singleMatch[2] ? 'rectangle' : singleMatch[4] ? 'diamond' : singleMatch[5] ? 'oval' : 'roundrect';
        ensureNode(id, label, shapeType);
      }
    }

    const nodesList = Array.from(nodesMap.values());
    if (nodesList.length === 0) {
      return this.renderStructuredCalloutBlock(code);
    }

    // Topological/Layered auto-layout calculation
    this.calculateLayout(nodesList, edges, isLR);

    // Bounding Box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodesList.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    });

    const padding = 40;
    const canvasWidth = Math.max(maxX - minX + padding * 2, 600);
    const canvasHeight = Math.max(maxY - minY + padding * 2, 350);

    // Normalize coordinates relative to origin
    nodesList.forEach((n) => {
      n.x = n.x - minX + padding;
      n.y = n.y - minY + padding;
    });

    const groupId = this.nextId('vml_grp');

    // Build VML XML string - mandatory ID on v:group and every child shape for OpenXML compliance
    let vmlContent = `<v:group id="${groupId}" style="width:500pt;height:${Math.round((canvasHeight / canvasWidth) * 500)}pt;position:relative" coordorigin="0 0" coordsize="${canvasWidth} ${canvasHeight}">`;

    // 1. Render Connectors (Lines with arrows)
    edges.forEach((edge) => {
      const fromNode = nodesMap.get(edge.fromId);
      const toNode = nodesMap.get(edge.toId);
      if (!fromNode || !toNode) return;

      const fromX = Math.round(fromNode.x + fromNode.width / 2);
      const fromY = Math.round(fromNode.y + (isLR ? fromNode.height / 2 : fromNode.height));
      const toX = Math.round(toNode.x + (isLR ? 0 : toNode.width / 2));
      const toY = Math.round(toNode.y + (isLR ? toNode.height / 2 : 0));

      const strokeDash = edge.isDashed ? 'dashstyle="dash"' : '';
      const lineId = this.nextId('vml_line');

      vmlContent += `<v:line id="${lineId}" from="${fromX},${fromY}" to="${toX},${toY}" strokecolor="#64748b" strokeweight="1.75pt" ${strokeDash}>
        <v:stroke endarrow="classic" endarrowwidth="medium" endarrowlength="medium"/>
      </v:line>`;

      // Render edge label if present
      if (edge.label) {
        const midX = Math.round((fromX + toX) / 2 - 40);
        const midY = Math.round((fromY + toY) / 2 - 12);
        const labelRectId = this.nextId('vml_lbl');
        vmlContent += `<v:rect id="${labelRectId}" style="position:absolute;left:${midX};top:${midY};width:80;height:24" fillcolor="#f8fafc" stroked="f">
          <v:textbox inset="2pt,2pt,2pt,2pt">
            <w:txbxContent>
              <w:p>
                <w:pPr><w:jc w:val="center"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                    <w:sz w:val="16"/>
                    <w:color w:val="475569"/>
                  </w:rPr>
                  <w:t>${this.escapeXml(edge.label)}</w:t>
                </w:r>
              </w:p>
            </w:txbxContent>
          </v:textbox>
        </v:rect>`;
      }
    });

    // 2. Render Shape Blocks (Roundrects / Rects / Ovals)
    nodesList.forEach((node) => {
      const x = Math.round(node.x);
      const y = Math.round(node.y);
      const w = Math.round(node.width);
      const h = Math.round(node.height);

      let shapeTag = 'v:roundrect';
      let extraAttrs = 'arcsize="0.25"';

      if (node.shapeType === 'rectangle') {
        shapeTag = 'v:rect';
        extraAttrs = '';
      } else if (node.shapeType === 'oval') {
        shapeTag = 'v:oval';
        extraAttrs = '';
      }

      const shapeId = this.nextId('vml_shape');

      vmlContent += `<${shapeTag} id="${shapeId}" style="position:absolute;left:${x};top:${y};width:${w};height:${h}" ${extraAttrs} fillcolor="${node.fillColor}" strokecolor="${node.strokeColor}" strokeweight="1.5pt">
        <v:shadow on="t" color="#cbd5e1" offset="2pt,2pt"/>
        <v:textbox inset="6pt,6pt,6pt,6pt">
          <w:txbxContent>
            <w:p>
              <w:pPr>
                <w:jc w:val="center"/>
                <w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                  <w:b/>
                  <w:sz w:val="20"/>
                  <w:color w:val="${node.textColor.replace('#', '')}"/>
                </w:rPr>
                <w:t>${this.escapeXml(node.label)}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </${shapeTag}>`;
    });

    vmlContent += `</v:group>`;

    return `<w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="240" w:after="240"/>
      </w:pPr>
      <w:r>
        <w:pict>
          ${vmlContent}
        </w:pict>
      </w:r>
    </w:p>`;
  }

  /**
   * Mindmap code to native hierarchical tree shapes in Word.
   */
  private static renderMindmapAsShapes(code: string): string {
    const lines = code.split('\n').filter((l) => l.trim() && !l.trim().startsWith('%%') && !l.trim().startsWith('mindmap'));
    if (lines.length === 0) return '';

    const rootLine = lines[0].trim().replace(/^root\s*\((.*?)\)|^root\[(.*?)\]|^\((.*?)\)|^\[(.*?)\]|^root/i, '$1$2$3$4');
    const rootText = rootLine || 'الرئيسية';

    const childNodes: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const clean = lines[i].replace(/^\s*[-+*]?\s*[\(\[]?|[\)\]]?\s*$/g, '').trim();
      if (clean) childNodes.push(clean);
    }

    const canvasWidth = 700;
    const canvasHeight = Math.max(200 + childNodes.length * 70, 360);
    const rootX = 60;
    const rootY = Math.round(canvasHeight / 2 - 35);

    const groupId = this.nextId('vml_grp');
    let vml = `<v:group id="${groupId}" style="width:480pt;height:${Math.round((canvasHeight / canvasWidth) * 480)}pt;position:relative" coordorigin="0 0" coordsize="${canvasWidth} ${canvasHeight}">`;

    // Root Node
    const rootId = this.nextId('vml_root');
    vml += `<v:roundrect id="${rootId}" style="position:absolute;left:${rootX};top:${rootY};width:160;height:70" arcsize="0.3" fillcolor="#4f46e5" strokecolor="#3730a3" strokeweight="2pt">
      <v:shadow on="t" color="#cbd5e1" offset="2pt,2pt"/>
      <v:textbox inset="6pt,6pt,6pt,6pt">
        <w:txbxContent>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                <w:b/><w:sz w:val="22"/><w:color w:val="FFFFFF"/>
              </w:rPr>
              <w:t>${this.escapeXml(rootText)}</w:t>
            </w:r>
          </w:p>
        </w:txbxContent>
      </v:textbox>
    </v:roundrect>`;

    // Children nodes
    const startY = 40;
    const stepY = childNodes.length > 1 ? (canvasHeight - 120) / (childNodes.length - 1) : 0;
    const childX = 350;

    childNodes.forEach((childText, idx) => {
      const childY = Math.round(startY + idx * stepY);
      const lineId = this.nextId('vml_line');
      const childId = this.nextId('vml_node');

      // Connecting line
      vml += `<v:line id="${lineId}" from="${rootX + 160},${rootY + 35}" to="${childX},${childY + 25}" strokecolor="#818cf8" strokeweight="2pt">
        <v:stroke endarrow="classic" endarrowwidth="medium"/>
      </v:line>`;

      // Child block
      vml += `<v:roundrect id="${childId}" style="position:absolute;left:${childX};top:${childY};width:180;height:50" arcsize="0.2" fillcolor="#0d9488" strokecolor="#0f766e" strokeweight="1.5pt">
        <v:textbox inset="4pt,4pt,4pt,4pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                  <w:b/><w:sz w:val="18"/><w:color w:val="FFFFFF"/>
                </w:rPr>
                <w:t>${this.escapeXml(childText)}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:roundrect>`;
    });

    vml += `</v:group>`;

    return `<w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="240"/></w:pPr>
      <w:r><w:pict>${vml}</w:pict></w:r>
    </w:p>`;
  }

  /**
   * Simple layered placement algorithm for DAG/Flowchart.
   */
  private static calculateLayout(nodes: WordDiagramNode[], edges: WordDiagramEdge[], isLR: boolean): void {
    const layers: WordDiagramNode[][] = [];
    const visited = new Set<string>();

    const hasIncoming = new Set(edges.map((e) => e.toId));
    let currentLayer = nodes.filter((n) => !hasIncoming.has(n.id));

    if (currentLayer.length === 0 && nodes.length > 0) {
      currentLayer = [nodes[0]];
    }

    currentLayer.forEach((n) => visited.add(n.id));
    layers.push(currentLayer);

    while (visited.size < nodes.length) {
      const nextLayer: WordDiagramNode[] = [];
      const currentIds = new Set(currentLayer.map((n) => n.id));

      edges.forEach((e) => {
        if (currentIds.has(e.fromId) && !visited.has(e.toId)) {
          const targetNode = nodes.find((n) => n.id === e.toId);
          if (targetNode && !nextLayer.includes(targetNode)) {
            nextLayer.push(targetNode);
            visited.add(targetNode.id);
          }
        }
      });

      if (nextLayer.length === 0) {
        const remaining = nodes.filter((n) => !visited.has(n.id));
        if (remaining.length > 0) {
          nextLayer.push(remaining[0]);
          visited.add(remaining[0].id);
        } else {
          break;
        }
      }

      layers.push(nextLayer);
      currentLayer = nextLayer;
    }

    const layerSpacing = isLR ? 240 : 120;
    const nodeSpacing = isLR ? 90 : 200;

    layers.forEach((layer, layerIdx) => {
      const layerOffset = isLR ? layerIdx * layerSpacing : layerIdx * layerSpacing;
      const totalWidthInLayer = (layer.length - 1) * nodeSpacing;
      const startCross = -(totalWidthInLayer / 2);

      layer.forEach((node, nodeIdx) => {
        const crossOffset = startCross + nodeIdx * nodeSpacing;
        if (isLR) {
          node.x = layerOffset;
          node.y = 200 + crossOffset;
        } else {
          node.x = 250 + crossOffset;
          node.y = layerOffset;
        }
      });
    });
  }

  private static renderStructuredCalloutBlock(code: string): string {
    const cleanLines = code.split('\n').filter((l) => l.trim());
    const headerTitle = cleanLines[0] || 'Diagram Structure';

    return `<w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="12" w:space="0" w:color="3B82F6"/>
          <w:left w:val="single" w:sz="12" w:space="0" w:color="3B82F6"/>
          <w:bottom w:val="single" w:sz="12" w:space="0" w:color="3B82F6"/>
          <w:right w:val="single" w:sz="12" w:space="0" w:color="3B82F6"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="120" w:type="dxa"/>
          <w:left w:w="180" w:type="dxa"/>
          <w:bottom w:w="120" w:type="dxa"/>
          <w:right w:w="180" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:shd w:val="clear" w:color="auto" w:fill="EFF6FF"/>
          </w:tcPr>
          <w:p>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                <w:b/><w:color w:val="1E40AF"/>
              </w:rPr>
              <w:t>📊 ${this.escapeXml(headerTitle)}</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                <w:sz w:val="18"/>
                <w:color w:val="475569"/>
              </w:rPr>
              <w:t>${this.escapeXml(cleanLines.slice(1).join('\n'))}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>`;
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
