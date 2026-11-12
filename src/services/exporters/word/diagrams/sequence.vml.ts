/**
 * Sequence Diagram VML Generator for Microsoft Word
 * Produces native editable UML sequence diagrams with participant boxes,
 * vertical dashed lifelines, horizontal message arrows, and centered step labels.
 */
export class SequenceVmlBuilder {
  private static idCounter = 1;

  private static nextId(prefix: string): string {
    return `${prefix}_seq_${this.idCounter++}`;
  }

  public static render(code: string): string {
    const lines = code.split('\n');
    const participants: { id: string; label: string }[] = [];
    const participantMap = new Map<string, number>();

    const messages: { fromId: string; toId: string; label: string; isDashed: boolean }[] = [];

    // 1. Parse participants and messages
    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('%%') || line.startsWith('autonumber')) return;

      const partMatch = line.match(/^(?:actor|participant)\s+([a-zA-Z0-9_-]+)(?:\s+as\s+(.+))?/i);
      if (partMatch) {
        const id = partMatch[1];
        const label = (partMatch[2] || id).trim();
        if (!participantMap.has(id)) {
          participantMap.set(id, participants.length);
          participants.push({ id, label });
        }
        return;
      }

      const msgMatch = line.match(/^([a-zA-Z0-9_-]+)\s*(-->>|->>|-->|->)\s*([a-zA-Z0-9_-]+)\s*:\s*(.+)/);
      if (msgMatch) {
        const fromId = msgMatch[1];
        const op = msgMatch[2];
        const toId = msgMatch[3];
        const label = msgMatch[4].trim();

        if (!participantMap.has(fromId)) {
          participantMap.set(fromId, participants.length);
          participants.push({ id: fromId, label: fromId });
        }
        if (!participantMap.has(toId)) {
          participantMap.set(toId, participants.length);
          participants.push({ id: toId, label: toId });
        }

        messages.push({
          fromId,
          toId,
          label,
          isDashed: op.includes('--'),
        });
      }
    });

    if (participants.length === 0) return '';

    // 2. Geometry calculations
    const canvasWidth = 720;
    const partWidth = Math.min(Math.round(canvasWidth / (participants.length + 0.5)), 150);
    const partHeight = 44;
    const stepX = (canvasWidth - partWidth) / Math.max(participants.length - 1, 1);

    const messageSpacing = 42;
    const messageStartY = 80;
    const canvasHeight = messageStartY + messages.length * messageSpacing + partHeight + 40;

    const groupId = this.nextId('grp');
    const groupHeightPt = Math.round((canvasHeight / canvasWidth) * 460);

    let vml = `<v:group id="${groupId}" style="width:460pt;height:${groupHeightPt}pt;" coordorigin="0 0" coordsize="${canvasWidth} ${canvasHeight}">`;

    // 3. Render Vertical Lifelines
    participants.forEach((_, idx) => {
      const centerX = Math.round(idx * stepX + partWidth / 2);
      const lineId = this.nextId('life');
      vml += `<v:line id="${lineId}" from="${centerX},${partHeight + 10}" to="${centerX},${canvasHeight - partHeight - 10}" strokecolor="#94a3b8" strokeweight="1.25pt" dashstyle="dash"/>`;
    });

    // 4. Render Message Arrows & Labels
    messages.forEach((msg, idx) => {
      const fromIdx = participantMap.get(msg.fromId) ?? 0;
      const toIdx = participantMap.get(msg.toId) ?? 0;
      const fromX = Math.round(fromIdx * stepX + partWidth / 2);
      const toX = Math.round(toIdx * stepX + partWidth / 2);
      const y = messageStartY + idx * messageSpacing;

      const lineId = this.nextId('msg');
      const dashAttr = msg.isDashed ? 'dashstyle="dash"' : '';

      vml += `<v:line id="${lineId}" from="${fromX},${y}" to="${toX},${y}" strokecolor="#2563eb" strokeweight="1.75pt" ${dashAttr}>
        <v:stroke endarrow="classic" endarrowwidth="medium" endarrowlength="medium"/>
      </v:line>`;

      // Message label badge
      const midX = Math.round((fromX + toX) / 2);
      const labelWidth = Math.min(Math.abs(toX - fromX) - 20, 200);
      const labelLeft = Math.round(midX - labelWidth / 2);
      const lblId = this.nextId('lbl');

      vml += `<v:rect id="${lblId}" style="position:absolute;left:${labelLeft};top:${y - 18};width:${labelWidth};height:20" fillcolor="#ffffff" stroked="f">
        <v:textbox inset="1pt,1pt,1pt,1pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                  <w:sz w:val="16"/>
                  <w:color w:val="1E293B"/>
                </w:rPr>
                <w:t>${idx + 1}. ${this.escapeXml(msg.label)}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:rect>`;
    });

    // 5. Render Participant Cards (Top & Bottom)
    participants.forEach((p, idx) => {
      const x = Math.round(idx * stepX);
      const topId = this.nextId('top_node');
      const btmId = this.nextId('btm_node');

      const cardVml = (id: string, y: number) => `<v:roundrect id="${id}" style="position:absolute;left:${x};top:${y};width:${partWidth};height:${partHeight}" arcsize="0.2" fillcolor="#1e40af" strokecolor="#1e3a8a" strokeweight="1.5pt">
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
                <w:t>${this.escapeXml(p.label)}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:roundrect>`;

      vml += cardVml(topId, 10);
      vml += cardVml(btmId, canvasHeight - partHeight - 10);
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
