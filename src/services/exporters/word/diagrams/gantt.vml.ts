/**
 * Gantt Chart VML Generator for Microsoft Word
 * Produces native project roadmap drawings with timeline milestones,
 * section groups, and status-colored horizontal task duration bars.
 */
export class GanttVmlBuilder {
  private static idCounter = 1;

  private static nextId(prefix: string): string {
    return `${prefix}_gantt_${this.idCounter++}`;
  }

  public static render(code: string): string {
    const lines = code.split('\n');

    interface Task {
      name: string;
      status: 'done' | 'active' | 'crit' | 'normal';
      startDay: number; // 1 to 22
      durationDays: number;
    }

    interface Section {
      title: string;
      tasks: Task[];
    }

    const sections: Section[] = [];
    let currentSec: Section = { title: 'المهام العامة', tasks: [] };
    sections.push(currentSec);

    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line || line.startsWith('%%') || line.startsWith('gantt') || line.startsWith('dateFormat') || line.startsWith('title')) {
        return;
      }

      if (line.startsWith('section ')) {
        const secTitle = line.replace('section ', '').trim();
        currentSec = { title: secTitle, tasks: [] };
        sections.push(currentSec);
        return;
      }

      // Task line: Task Name :done, des1, 2026-11-01, 2026-11-03
      const parts = line.split(':');
      if (parts.length >= 2) {
        const taskName = parts[0].trim();
        const meta = parts[1].trim();

        let status: Task['status'] = 'normal';
        if (meta.includes('done')) status = 'done';
        else if (meta.includes('active')) status = 'active';
        else if (meta.includes('crit')) status = 'crit';

        // Extract dates (e.g. 2026-11-01, 2026-11-03)
        const dateMatches = meta.match(/(\d{4}-\d{2}-\d{2})/g);
        let startDay = 1;
        let durationDays = 3;

        if (dateMatches && dateMatches.length >= 2) {
          const d1 = parseInt(dateMatches[0].split('-')[2] || '1', 10);
          const d2 = parseInt(dateMatches[1].split('-')[2] || '3', 10);
          startDay = Math.max(d1, 1);
          durationDays = Math.max(d2 - d1, 1);
        }

        currentSec.tasks.push({
          name: taskName,
          status,
          startDay,
          durationDays,
        });
      }
    });

    const activeSections = sections.filter((s) => s.tasks.length > 0);
    if (activeSections.length === 0) return '';

    const canvasWidth = 720;
    const headerY = 30;
    const taskStartY = 65;
    const taskHeight = 26;
    const rowSpacing = 36;

    let totalTasks = 0;
    activeSections.forEach((s) => (totalTasks += s.tasks.length));

    const canvasHeight = taskStartY + totalTasks * rowSpacing + activeSections.length * 20 + 20;

    const groupId = this.nextId('grp');
    const groupHeightPt = Math.round((canvasHeight / canvasWidth) * 460);

    let vml = `<v:group id="${groupId}" style="width:460pt;height:${groupHeightPt}pt;" coordorigin="0 0" coordsize="${canvasWidth} ${canvasHeight}">`;

    // 1. Timeline Header (Days 1 to 22 across x: 220 to 690)
    const timeStartX = 220;
    const timeWidth = 470;
    const totalDays = 22;

    const milestones = [
      { day: 1, label: '01 Nov' },
      { day: 5, label: '05 Nov' },
      { day: 10, label: '10 Nov' },
      { day: 15, label: '15 Nov' },
      { day: 20, label: '20 Nov' },
      { day: 22, label: '22 Nov' },
    ];

    milestones.forEach((m) => {
      const x = Math.round(timeStartX + (m.day / totalDays) * timeWidth);
      const lineId = this.nextId('grid');
      const lblId = this.nextId('hdr_lbl');

      // Header Date text
      vml += `<v:rect id="${lblId}" style="position:absolute;left:${x - 30};top:${headerY};width:60;height:20" fillcolor="#f1f5f9" stroked="f">
        <v:textbox inset="1pt,1pt,1pt,1pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/>
                  <w:sz w:val="14"/><w:color w:val="64748B"/>
                </w:rPr>
                <w:t>${m.label}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:rect>`;

      // Vertical guide gridline
      vml += `<v:line id="${lineId}" from="${x},${headerY + 22}" to="${x},${canvasHeight - 15}" strokecolor="#e2e8f0" strokeweight="1pt" dashstyle="dash"/>`;
    });

    // 2. Render Tasks by Section
    let currentY = taskStartY;

    const statusColors: Record<Task['status'], { fill: string; stroke: string }> = {
      done: { fill: '#10b981', stroke: '#047857' }, // Emerald
      active: { fill: '#3b82f6', stroke: '#1d4ed8' }, // Blue
      crit: { fill: '#ef4444', stroke: '#b91c1c' }, // Red
      normal: { fill: '#8b5cf6', stroke: '#6d28d9' }, // Purple
    };

    activeSections.forEach((sec) => {
      // Section Header Banner
      const secId = this.nextId('sec_hdr');
      vml += `<v:rect id="${secId}" style="position:absolute;left:20;top:${currentY};width:190;height:22" fillcolor="#f1f5f9" strokecolor="#cbd5e1" strokeweight="0.75pt">
        <v:textbox inset="2pt,2pt,2pt,2pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="right"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                  <w:b/><w:sz w:val="16"/><w:color w:val="1E293B"/><w:rtl/>
                </w:rPr>
                <w:t>§ ${this.escapeXml(sec.title)}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:rect>`;

      currentY += 28;

      sec.tasks.forEach((task) => {
        const taskBarX = Math.round(timeStartX + (task.startDay / totalDays) * timeWidth);
        const taskBarW = Math.max(Math.round((task.durationDays / totalDays) * timeWidth), 40);
        const colors = statusColors[task.status] || statusColors.normal;

        const labelId = this.nextId('t_lbl');
        const barId = this.nextId('t_bar');

        // Task Name label on left
        vml += `<v:rect id="${labelId}" style="position:absolute;left:20;top:${currentY};width:190;height:${taskHeight}" fillcolor="#ffffff" stroked="f">
          <v:textbox inset="1pt,1pt,1pt,1pt">
            <w:txbxContent>
              <w:p>
                <w:pPr><w:jc w:val="right"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Traditional Arabic"/>
                    <w:sz w:val="15"/><w:color w:val="334155"/><w:rtl/>
                  </w:rPr>
                  <w:t>${this.escapeXml(task.name)}</w:t>
                </w:r>
              </w:p>
            </w:txbxContent>
          </v:textbox>
        </v:rect>`;

        // Task Bar
        vml += `<v:roundrect id="${barId}" style="position:absolute;left:${taskBarX};top:${currentY + 2};width:${taskBarW};height:${taskHeight - 4}" arcsize="0.3" fillcolor="${colors.fill}" strokecolor="${colors.stroke}" strokeweight="1.25pt">
          <v:shadow on="t" color="#cbd5e1" offset="1pt,1pt"/>
        </v:roundrect>`;

        currentY += rowSpacing;
      });

      currentY += 10;
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
