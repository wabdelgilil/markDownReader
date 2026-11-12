/**
 * Git Graph VML Generator for Microsoft Word
 * Produces native Git history drawings with branch tracks, commit circles,
 * merge lines, and release tag badges.
 */
export class GitGraphVmlBuilder {
  private static idCounter = 1;

  private static nextId(prefix: string): string {
    return `${prefix}_git_${this.idCounter++}`;
  }

  public static render(code: string): string {
    const lines = code.split('\n');

    interface Commit {
      id: string;
      tag?: string;
      branch: string;
      isMerge?: boolean;
    }

    const branches = ['main', 'develop', 'feature'];
    const branchColors: Record<string, string> = {
      main: '#2563eb', // Blue
      develop: '#059669', // Emerald
      feature: '#7c3aed', // Purple
    };

    const commits: Commit[] = [];
    let currentBranch = 'main';

    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line || line.startsWith('%%') || line.startsWith('gitGraph')) return;

      if (line.startsWith('branch ')) {
        const b = line.replace('branch ', '').trim();
        const shortB = b.includes('feature') ? 'feature' : b;
        currentBranch = shortB;
        return;
      }
      if (line.startsWith('checkout ')) {
        const b = line.replace('checkout ', '').trim();
        const shortB = b.includes('feature') ? 'feature' : b;
        currentBranch = shortB;
        return;
      }
      if (line.startsWith('commit')) {
        const idMatch = line.match(/id:\s*"([^"]+)"/);
        const tagMatch = line.match(/tag:\s*"([^"]+)"/);
        commits.push({
          id: idMatch ? idMatch[1] : `c_${commits.length}`,
          tag: tagMatch ? tagMatch[1] : undefined,
          branch: currentBranch,
        });
        return;
      }
      if (line.startsWith('merge')) {
        const tagMatch = line.match(/tag:\s*"([^"]+)"/);
        commits.push({
          id: `Merge to ${currentBranch}`,
          tag: tagMatch ? tagMatch[1] : undefined,
          branch: currentBranch,
          isMerge: true,
        });
      }
    });

    if (commits.length === 0) return '';

    const canvasWidth = 740;
    const branchYs: Record<string, number> = {
      main: 60,
      develop: 130,
      feature: 200,
    };

    const canvasHeight = 270;
    const startX = 140;
    const stepX = (canvasWidth - startX - 40) / Math.max(commits.length - 1, 1);

    const groupId = this.nextId('grp');
    const groupHeightPt = Math.round((canvasHeight / canvasWidth) * 460);

    let vml = `<v:group id="${groupId}" style="width:460pt;height:${groupHeightPt}pt;" coordorigin="0 0" coordsize="${canvasWidth} ${canvasHeight}">`;

    // 1. Branch Rails & Badges (Left)
    branches.forEach((bName) => {
      const y = branchYs[bName];
      const color = branchColors[bName];
      const badgeId = this.nextId('b_badge');
      const railId = this.nextId('b_rail');

      // Badge on left
      vml += `<v:roundrect id="${badgeId}" style="position:absolute;left:20;top:${y - 14};width:100;height:28" arcsize="0.3" fillcolor="${color}" strokecolor="${color}">
        <v:textbox inset="2pt,2pt,2pt,2pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                  <w:b/><w:sz w:val="17"/><w:color w:val="FFFFFF"/>
                </w:rPr>
                <w:t>${bName}</w:t>
              </w:r>
            </w:p>
          </w:txbxContent>
        </v:textbox>
      </v:roundrect>`;

      // Horizontal Rail line
      vml += `<v:line id="${railId}" from="120,${y}" to="${canvasWidth - 20},${y}" strokecolor="${color}" strokeweight="2.5pt"/>`;
    });

    // 2. Commit Nodes & Tags
    commits.forEach((commit, idx) => {
      const x = Math.round(startX + idx * stepX);
      const y = branchYs[commit.branch] || 60;
      const color = branchColors[commit.branch] || '#2563eb';

      const ovalId = this.nextId('commit_node');

      // Commit circle
      vml += `<v:oval id="${ovalId}" style="position:absolute;left:${x - 9};top:${y - 9};width:18;height:18" fillcolor="${color}" strokecolor="#ffffff" strokeweight="2pt">
        <v:shadow on="t" color="#cbd5e1" offset="1pt,1pt"/>
      </v:oval>`;

      // Tag pill badge if present
      if (commit.tag) {
        const tagId = this.nextId('tag_pill');
        vml += `<v:roundrect id="${tagId}" style="position:absolute;left:${x - 28};top:${y - 36};width:56;height:20" arcsize="0.4" fillcolor="#f59e0b" strokecolor="#d97706" strokeweight="1pt">
          <v:textbox inset="1pt,1pt,1pt,1pt">
            <w:txbxContent>
              <w:p>
                <w:pPr><w:jc w:val="center"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/>
                    <w:b/><w:sz w:val="14"/><w:color w:val="FFFFFF"/>
                  </w:rPr>
                  <w:t>${this.escapeXml(commit.tag)}</w:t>
                </w:r>
              </w:p>
            </w:txbxContent>
          </v:textbox>
        </v:roundrect>`;
      }

      // Commit short label below
      const labelId = this.nextId('msg_lbl');
      const cleanMsg = commit.id.replace(/^feat:\s*/, '');
      vml += `<v:rect id="${labelId}" style="position:absolute;left:${x - 45};top:${y + 12};width:90;height:18" fillcolor="#ffffff" stroked="f">
        <v:textbox inset="1pt,1pt,1pt,1pt">
          <w:txbxContent>
            <w:p>
              <w:pPr><w:jc w:val="center"/></w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
                  <w:sz w:val="13"/><w:color w:val="475569"/>
                </w:rPr>
                <w:t>${this.escapeXml(cleanMsg.slice(0, 14))}</w:t>
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
