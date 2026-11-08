/**
 * High-Fidelity SVG Diagram Styler
 * Transforms raw Mermaid SVGs into enterprise-grade visuals:
 * - Flowcharts: Microsoft Visio & Lucidchart corporate styling
 * - Sequence Diagrams: High-contrast lifelines, messages, and actor cards
 * - Mindmaps: Obsidian & Miro organic chromatic hierarchy
 * - Gantt / Roadmaps: Microsoft Project executive timeline fidelity
 * - Git Graphs: GitHub / GitKraken tree with anti-collision commit labels
 */
export class DiagramStyler {
  /**
   * Primary entry point: enhances an SVG element in-place with software-grade aesthetics.
   */
  public static enhanceSvg(svg: SVGSVGElement): void {
    const currentTheme = (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme')
      : 'dark') || 'dark';

    const isLight = currentTheme === 'light';
    const isSepia = currentTheme === 'sepia';

    // 1. Inject SVG Defs (Gradients & Drop Shadows adapted to theme)
    this.injectDefs(svg, isLight, isSepia);

    // 2. Enforce strict LTR layout on the SVG
    svg.style.direction = 'ltr';
    svg.setAttribute('dir', 'ltr');

    // 3. Detect diagram type and apply specialized styling
    if (svg.classList.contains('gitGraph') || svg.querySelector('.commit')) {
      this.enhanceGitGraph(svg, isLight, isSepia);
    } else if (svg.querySelector('.mindmap-node') || svg.classList.contains('mindmap')) {
      this.enhanceMindmap(svg, isLight, isSepia);
    } else if (svg.querySelector('.task') || svg.classList.contains('gantt')) {
      this.enhanceGantt(svg, isLight, isSepia);
    } else if (svg.querySelector('.messageText') || svg.querySelector('.actor') || svg.classList.contains('sequenceDiagram')) {
      this.enhanceSequence(svg, isLight, isSepia);
    } else {
      this.enhanceFlowchart(svg, isLight, isSepia);
    }
  }

  /**
   * Injects reusable SVG filters, gradients, and markers adapted to the active theme.
   */
  private static injectDefs(svg: SVGSVGElement, isLight: boolean, isSepia: boolean): void {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    const shadowOpacity = isLight || isSepia ? '0.08' : '0.4';
    const shadowColor = '#000000';

    const procGradStart = isLight ? '#ffffff' : isSepia ? '#f0ead9' : '#18181b';
    const procGradEnd = isLight ? '#f4f4f5' : isSepia ? '#e9e1cd' : '#111113';

    const defsContent = `
      <!-- Ambient Drop Shadow Filter -->
      <filter id="visio-shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${shadowColor}" flood-opacity="${shadowOpacity}"/>
      </filter>

      <!-- Glow Filter for Milestones & Roots -->
      <filter id="obsidian-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#818cf8" flood-opacity="0.5"/>
      </filter>

      <!-- Visio Process Gradient -->
      <linearGradient id="visio-process-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${procGradStart}"/>
        <stop offset="100%" stop-color="${procGradEnd}"/>
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
  private static enhanceFlowchart(svg: SVGSVGElement, isLight: boolean, isSepia: boolean): void {
    const nodes = svg.querySelectorAll('.node');
    nodes.forEach((node) => {
      const rect = node.querySelector('rect');
      const polygon = node.querySelector('polygon');
      const circle = node.querySelector('circle');
      const text = node.querySelector('.nodeLabel, text');

      if (text) {
        (text as SVGElement).style.fontFamily = 'Readex Pro, system-ui, sans-serif';
        (text as SVGElement).style.fontWeight = '500';
      }

      if (rect) {
        const isStadium = rect.getAttribute('rx') && parseInt(rect.getAttribute('rx') || '0', 10) > 10;
        if (isStadium) {
          // Visio Start / End Capsule
          rect.style.fill = 'url(#visio-start-grad)';
          rect.style.stroke = '#10b981';
          rect.style.strokeWidth = '2px';
          rect.setAttribute('filter', 'url(#visio-shadow)');
          if (text) (text as SVGElement).style.fill = '#ffffff';
        } else {
          // Visio Corporate Process Box
          rect.setAttribute('rx', '10');
          rect.setAttribute('ry', '10');
          rect.style.fill = 'url(#visio-process-grad)';
          rect.style.stroke = isLight ? '#4f46e5' : isSepia ? '#9a4316' : '#6366f1';
          rect.style.strokeWidth = '1.75px';
          rect.setAttribute('filter', 'url(#visio-shadow)');
          if (text) (text as SVGElement).style.fill = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';
        }
      } else if (polygon) {
        // Visio Decision Diamond
        polygon.style.fill = 'url(#visio-decision-grad)';
        polygon.style.stroke = '#fbbf24';
        polygon.style.strokeWidth = '2px';
        polygon.setAttribute('filter', 'url(#visio-shadow)');
        if (text) (text as SVGElement).style.fill = '#ffffff';
      } else if (circle) {
        circle.style.fill = 'url(#visio-start-grad)';
        circle.style.stroke = '#10b981';
        circle.setAttribute('filter', 'url(#visio-shadow)');
        if (text) (text as SVGElement).style.fill = '#ffffff';
      }
    });

    // Style edge paths and arrows
    const paths = svg.querySelectorAll('.flowchart-link, path.link');
    paths.forEach((p) => {
      (p as SVGElement).style.stroke = isLight ? '#64748b' : isSepia ? '#7d6b53' : '#94a3b8';
      (p as SVGElement).style.strokeWidth = '1.8px';
    });
  }

  /**
   * Sequence Diagrams -> High-Contrast Architecture Fidelity
   */
  private static enhanceSequence(svg: SVGSVGElement, isLight: boolean, isSepia: boolean): void {
    const textColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';
    const accentColor = isLight ? '#4f46e5' : isSepia ? '#9a4316' : '#6366f1';
    const borderColor = isLight ? '#e4e4e7' : isSepia ? '#ded5c2' : '#27272a';

    // 1. Message texts between lifelines
    const messageTexts = svg.querySelectorAll<SVGTextElement>('.messageText');
    messageTexts.forEach((msg) => {
      msg.style.fill = textColor;
      msg.style.color = textColor;
      msg.style.fontFamily = 'Readex Pro, system-ui, sans-serif';
      msg.style.fontWeight = '600';
      msg.style.fontSize = '13px';
    });

    // 2. Sequence numbers
    const seqNumbers = svg.querySelectorAll<SVGTextElement>('.sequenceNumber');
    seqNumbers.forEach((sn) => {
      sn.style.fill = '#ffffff';
      sn.style.fontWeight = '700';
      sn.style.fontSize = '11px';
    });

    const seqRects = svg.querySelectorAll<SVGRectElement>('rect.sequenceNumber');
    seqRects.forEach((sr) => {
      sr.style.fill = accentColor;
      sr.setAttribute('rx', '4');
      sr.setAttribute('ry', '4');
    });

    // 3. Message lines & Arrowheads
    const messageLines = svg.querySelectorAll<SVGLineElement>('.messageLine0, .messageLine1');
    messageLines.forEach((ml) => {
      ml.style.stroke = accentColor;
      ml.style.strokeWidth = '1.75px';
    });

    const arrowheads = svg.querySelectorAll<SVGPathElement>('#arrowhead path, #crosshead path');
    arrowheads.forEach((ah) => {
      ah.style.fill = accentColor;
      ah.style.stroke = accentColor;
    });

    // 4. Actor boxes & Lifelines
    const actors = svg.querySelectorAll<SVGGElement>('.actor');
    actors.forEach((act) => {
      const rect = act.querySelector('rect');
      const text = act.querySelector('text');
      if (rect) {
        rect.style.fill = accentColor;
        rect.style.stroke = isLight ? '#1d4ed8' : isSepia ? '#78350f' : '#60a5fa';
        rect.style.strokeWidth = '1.5px';
        rect.setAttribute('rx', '8');
        rect.setAttribute('ry', '8');
        rect.setAttribute('filter', 'url(#visio-shadow)');
      }
      if (text) {
        text.style.fill = '#ffffff';
        text.style.fontWeight = '600';
        text.style.fontSize = '13px';
      }
    });

    const actorLines = svg.querySelectorAll<SVGLineElement>('.actor-line');
    actorLines.forEach((al) => {
      al.style.stroke = borderColor;
      al.style.strokeWidth = '1.5px';
      al.style.strokeDasharray = '4, 4';
    });

    // 5. Actor man (stick figure)
    const actorManTexts = svg.querySelectorAll<SVGTextElement>('.actor-man text');
    actorManTexts.forEach((amt) => {
      amt.style.fill = textColor;
      amt.style.fontWeight = '600';
    });
    const actorManFigures = svg.querySelectorAll<SVGElement>('.actor-man circle, .actor-man line');
    actorManFigures.forEach((amf) => {
      amf.style.stroke = accentColor;
      amf.style.strokeWidth = '2px';
    });
  }

  /**
   * Mindmap -> Obsidian & Miro Organic Palette
   */
  private static enhanceMindmap(svg: SVGSVGElement, _isLight: boolean, _isSepia: boolean): void {
    const mindmapNodes = svg.querySelectorAll('.mindmap-node');
    const branchColors = [
      { fill: '#4f46e5', stroke: '#818cf8' }, // Indigo
      { fill: '#0d9488', stroke: '#2dd4bf' }, // Teal
      { fill: '#d97706', stroke: '#fbbf24' }, // Amber
      { fill: '#7c3aed', stroke: '#c084fc' }, // Violet
      { fill: '#0284c7', stroke: '#38bdf8' }, // Sky
      { fill: '#e11d48', stroke: '#fb7185' }, // Rose
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
  private static enhanceGantt(svg: SVGSVGElement, isLight: boolean, isSepia: boolean): void {
    const textColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';
    const mutedColor = isLight ? '#71717a' : isSepia ? '#786b59' : '#a1a1aa';
    const gridColor = isLight ? '#e4e4e7' : isSepia ? '#ded5c2' : '#27272a';

    // Project Title
    const title = svg.querySelector('.titleText');
    if (title) {
      (title as SVGElement).style.fill = textColor;
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
      (dt as SVGElement).style.fill = mutedColor;
      (dt as SVGElement).style.fontWeight = '500';
      (dt as SVGElement).style.fontSize = '11px';
    });

    // Grid lines
    const gridLines = svg.querySelectorAll('.grid .tick line');
    gridLines.forEach((gl) => {
      (gl as SVGElement).style.stroke = gridColor;
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
   * Git Graph -> Clean GitHub Tree with Mathematical Anti-Collision Staggering
   */
  private static enhanceGitGraph(svg: SVGSVGElement, isLight: boolean, isSepia: boolean): void {
    const textColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';

    // 1. Remove opaque grey boxes behind commit labels
    const commitLabelBkgs = svg.querySelectorAll('.commit-label-bkg');
    commitLabelBkgs.forEach((bkg) => {
      (bkg as SVGElement).style.display = 'none';
      (bkg as SVGElement).style.opacity = '0';
    });

    // 2. Commit labels: Anti-collision staggering & theme color
    const commitLabels = svg.querySelectorAll<SVGTextElement>('.commit-label text');
    commitLabels.forEach((label, idx) => {
      label.style.fill = textColor;
      label.style.fontWeight = '600';
      label.style.fontSize = '11px';
      label.style.fontFamily = 'Readex Pro, system-ui, sans-serif';

      if (!isLight && !isSepia) {
        label.style.textShadow = '0 2px 4px rgba(0,0,0,0.95)';
      } else {
        label.style.textShadow = 'none';
      }

      // Stagger vertical offsets for consecutive commits to eliminate horizontal text collision
      const currentDy = parseFloat(label.getAttribute('dy') || '0');
      const offset = (idx % 2 === 1) ? 14 : -6;
      label.setAttribute('dy', `${currentDy + offset}px`);
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
        rect.setAttribute('filter', 'url(#visio-shadow)');
      }
      if (text) {
        (text as SVGElement).style.fill = '#ffffff';
        (text as SVGElement).style.fontWeight = '700';
        (text as SVGElement).style.fontSize = '11px';
      }
    });
  }
}
