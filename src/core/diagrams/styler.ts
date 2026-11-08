/**
 * High-Fidelity SVG Diagram Styler
 * Transforms raw Mermaid SVGs into enterprise-grade visuals:
 * - Flowcharts: Microsoft Visio & Lucidchart corporate styling
 * - Mindmaps: Obsidian & Miro organic chromatic hierarchy
 * - Gantt / Roadmaps: Microsoft Project executive timeline fidelity
 * - Git Graphs: GitHub / GitKraken vibrant branch trees
 */
export class DiagramStyler {
  /**
   * Primary entry point: enhances an SVG element in-place with software-grade aesthetics.
   */
  public static enhanceSvg(svg: SVGSVGElement): void {
    // 1. Inject SVG Defs (Gradients & Drop Shadows)
    this.injectDefs(svg);

    // 2. Enforce strict LTR layout on the SVG
    svg.style.direction = 'ltr';
    svg.setAttribute('dir', 'ltr');

    // 3. Detect diagram type and apply specialized styling
    if (svg.classList.contains('gitGraph') || svg.querySelector('.commit')) {
      this.enhanceGitGraph(svg);
    } else if (svg.querySelector('.mindmap-node') || svg.classList.contains('mindmap')) {
      this.enhanceMindmap(svg);
    } else if (svg.querySelector('.task') || svg.classList.contains('gantt')) {
      this.enhanceGantt(svg);
    } else {
      this.enhanceFlowchart(svg);
    }
  }

  /**
   * Injects reusable SVG filters, gradients, and markers.
   */
  private static injectDefs(svg: SVGSVGElement): void {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    const defsContent = `
      <!-- Ambient Drop Shadow Filter -->
      <filter id="visio-shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.35"/>
      </filter>

      <!-- Glow Filter for Milestones & Roots -->
      <filter id="obsidian-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#818cf8" flood-opacity="0.5"/>
      </filter>

      <!-- Visio Process Gradient (Royal Slate) -->
      <linearGradient id="visio-process-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>

      <!-- Visio Start/End Stadium Gradient (Emerald) -->
      <linearGradient id="visio-start-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#059669"/>
        <stop offset="100%" stop-color="#047857"/>
      </linearGradient>

      <!-- Visio Decision Gradient (Amber Gold) -->
      <linearGradient id="visio-decision-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>

      <!-- Obsidian Mindmap Root Gradient -->
      <linearGradient id="obsidian-root-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#4f46e5"/>
      </linearGradient>
    `;

    defs.innerHTML += defsContent;
  }

  /**
   * Flowcharts -> Microsoft Visio & Lucidchart Enterprise Styling
   */
  private static enhanceFlowchart(svg: SVGSVGElement): void {
    const nodes = svg.querySelectorAll('.node');
    nodes.forEach((node) => {
      // Shape container (rect, circle, polygon)
      const rect = node.querySelector('rect');
      const polygon = node.querySelector('polygon');
      const circle = node.querySelector('circle');
      const text = node.querySelector('.nodeLabel, text');

      if (text) {
        (text as SVGElement).style.fontFamily = 'Readex Pro, system-ui, sans-serif';
        (text as SVGElement).style.fontWeight = '500';
      }

      if (rect) {
        const isStadium = rect.getAttribute('rx') && parseInt(rect.getAttribute('rx') || '0') > 10;
        if (isStadium) {
          // Visio Start / End Capsule
          rect.style.fill = 'url(#visio-start-grad)';
          rect.style.stroke = '#34d399';
          rect.style.strokeWidth = '2px';
          rect.setAttribute('filter', 'url(#visio-shadow)');
        } else {
          // Visio Corporate Process Box
          rect.setAttribute('rx', '10');
          rect.setAttribute('ry', '10');
          rect.style.fill = 'url(#visio-process-grad)';
          rect.style.stroke = '#3b82f6';
          rect.style.strokeWidth = '1.75px';
          rect.setAttribute('filter', 'url(#visio-shadow)');
        }
      } else if (polygon) {
        // Visio Decision Diamond
        polygon.style.fill = 'url(#visio-decision-grad)';
        polygon.style.stroke = '#fbbf24';
        polygon.style.strokeWidth = '2px';
        polygon.setAttribute('filter', 'url(#visio-shadow)');
      } else if (circle) {
        circle.style.fill = 'url(#visio-start-grad)';
        circle.style.stroke = '#10b981';
        circle.setAttribute('filter', 'url(#visio-shadow)');
      }
    });

    // Style edge paths and arrows
    const paths = svg.querySelectorAll('.flowchart-link, path.link');
    paths.forEach((p) => {
      (p as SVGElement).style.stroke = '#64748b';
      (p as SVGElement).style.strokeWidth = '1.8px';
    });
  }

  /**
   * Mindmap -> Obsidian & Miro Organic Palette
   */
  private static enhanceMindmap(svg: SVGSVGElement): void {
    const mindmapNodes = svg.querySelectorAll('.mindmap-node');
    const branchColors = [
      { fill: '#059669', stroke: '#34d399' }, // Emerald
      { fill: '#7c3aed', stroke: '#a78bfa' }, // Purple
      { fill: '#d97706', stroke: '#fbbf24' }, // Amber
      { fill: '#0891b2', stroke: '#22d3ee' }, // Cyan
      { fill: '#e11d48', stroke: '#fb7185' }, // Rose
      { fill: '#2563eb', stroke: '#60a5fa' }, // Blue
    ];

    let colorIndex = 0;

    mindmapNodes.forEach((node) => {
      const circle = node.querySelector('circle');
      const rect = node.querySelector('rect');
      const text = node.querySelector('text');

      if (text) {
        (text as SVGElement).style.fill = '#ffffff';
        (text as SVGElement).style.fontWeight = '600';
        (text as SVGElement).style.fontSize = '12px';
      }

      if (circle) {
        // Central Root Node: Obsidian glowing orb
        circle.style.fill = 'url(#obsidian-root-grad)';
        circle.style.stroke = '#818cf8';
        circle.style.strokeWidth = '3px';
        circle.setAttribute('filter', 'url(#obsidian-glow)');
      } else if (rect) {
        // Radiating Node Cards: Obsidian modern rounded capsules
        const palette = branchColors[colorIndex % branchColors.length];
        colorIndex++;

        rect.setAttribute('rx', '14');
        rect.setAttribute('ry', '14');
        rect.style.fill = palette.fill;
        rect.style.stroke = palette.stroke;
        rect.style.strokeWidth = '2px';
        rect.setAttribute('filter', 'url(#visio-shadow)');
      }
    });

    // Connecting branches
    const lines = svg.querySelectorAll('path.mindmap-edge');
    lines.forEach((line) => {
      (line as SVGElement).style.stroke = '#818cf8';
      (line as SVGElement).style.strokeWidth = '2.5px';
      (line as SVGElement).style.opacity = '0.85';
    });
  }

  /**
   * Gantt -> Microsoft Project Executive Timeline
   */
  private static enhanceGantt(svg: SVGSVGElement): void {
    // Project Title
    const title = svg.querySelector('.titleText');
    if (title) {
      (title as SVGElement).style.fill = '#f8fafc';
      (title as SVGElement).style.fontWeight = '700';
      (title as SVGElement).style.fontSize = '16px';
    }

    // Task text labels
    const taskTexts = svg.querySelectorAll('.taskText, .taskTextOutsideRight');
    taskTexts.forEach((t) => {
      (t as SVGElement).style.fill = '#ffffff';
      (t as SVGElement).style.fontWeight = '600';
      (t as SVGElement).style.fontSize = '12px';
      (t as SVGElement).style.textShadow = '0 1px 3px rgba(0,0,0,0.85)';
    });

    // Task bars: MS Project Capsules
    const tasks = svg.querySelectorAll('rect.task');
    tasks.forEach((t) => {
      t.setAttribute('rx', '6');
      t.setAttribute('ry', '6');
      t.setAttribute('filter', 'url(#visio-shadow)');
    });

    // Axis date text
    const dateTicks = svg.querySelectorAll('.tick text');
    dateTicks.forEach((dt) => {
      (dt as SVGElement).style.fill = '#94a3b8';
      (dt as SVGElement).style.fontWeight = '500';
      (dt as SVGElement).style.fontSize = '11px';
    });

    // Grid lines
    const gridLines = svg.querySelectorAll('.grid .tick line');
    gridLines.forEach((gl) => {
      (gl as SVGElement).style.stroke = '#334155';
      (gl as SVGElement).style.strokeDasharray = '4 4';
    });

    // Today Marker
    const todayLine = svg.querySelector('.today');
    if (todayLine) {
      (todayLine as SVGElement).style.stroke = '#ef4444';
      (todayLine as SVGElement).style.strokeWidth = '2.5px';
      (todayLine as SVGElement).style.strokeDasharray = '4 2';
    }
  }

  /**
   * Git Graph -> Clean GitHub / GitKraken Tree
   */
  private static enhanceGitGraph(svg: SVGSVGElement): void {
    // 1. Remove opaque grey boxes behind commit labels
    const commitLabelBkgs = svg.querySelectorAll('.commit-label-bkg');
    commitLabelBkgs.forEach((bkg) => {
      (bkg as SVGElement).style.display = 'none';
      (bkg as SVGElement).style.opacity = '0';
    });

    // 2. Commit labels: crisp text with drop-shadow
    const commitLabels = svg.querySelectorAll('.commit-label text');
    commitLabels.forEach((label) => {
      (label as SVGElement).style.fill = '#f8fafc';
      (label as SVGElement).style.fontWeight = '600';
      (label as SVGElement).style.fontSize = '11px';
      (label as SVGElement).style.textShadow = '0 2px 4px rgba(0,0,0,0.95)';
    });

    // 3. Branch labels: rounded pills
    const branchLabels = svg.querySelectorAll('.branch-label');
    branchLabels.forEach((bl) => {
      const rect = bl.querySelector('rect');
      const text = bl.querySelector('text');
      if (rect) {
        rect.setAttribute('rx', '8');
        rect.setAttribute('ry', '8');
        rect.style.strokeWidth = '1.5px';
      }
      if (text) {
        (text as SVGElement).style.fill = '#ffffff';
        (text as SVGElement).style.fontWeight = '700';
        (text as SVGElement).style.fontSize = '11px';
      }
    });
  }
}
