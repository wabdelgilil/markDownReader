import { DiagramThemeService, DiagramStylePreset, CustomDiagramColors } from '../../services/diagram-theme.service';

/**
 * High-Fidelity SVG Diagram Styler
 * Transforms raw Mermaid SVGs into enterprise-grade visuals with multi-style preset support:
 * 1. Corporate (Default - Microsoft Visio & Lucidchart)
 * 2. Minimalist (Notion & Linear Unified)
 * 3. Modern (Obsidian & Raycast Glow)
 * 4. Custom (Fully User-Configured Palette)
 */
export class DiagramStyler {
  /**
   * Primary entry point: enhances an SVG element in-place with chosen preset aesthetics.
   */
  public static enhanceSvg(svg: SVGSVGElement): void {
    const currentTheme = (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme')
      : 'dark') || 'dark';

    const isLight = currentTheme === 'light';
    const isSepia = currentTheme === 'sepia';
    const stylePreset = DiagramThemeService.getStylePreset();
    const customColors = DiagramThemeService.getCustomColors();

    // 1. Inject SVG Defs (Gradients & Drop Shadows adapted to preset and theme)
    this.injectDefs(svg, isLight, isSepia, stylePreset, customColors);

    // 2. Enforce strict LTR layout on the SVG
    svg.style.direction = 'ltr';
    svg.setAttribute('dir', 'ltr');

    // 3. Detect diagram type and apply specialized styling
    if (svg.classList.contains('gitGraph') || svg.querySelector('.commit')) {
      this.enhanceGitGraph(svg, isLight, isSepia, stylePreset, customColors);
    } else if (svg.querySelector('.mindmap-node') || svg.classList.contains('mindmap')) {
      this.enhanceMindmap(svg, isLight, isSepia, stylePreset);
    } else if (svg.querySelector('.task') || svg.classList.contains('gantt')) {
      this.enhanceGantt(svg, isLight, isSepia, stylePreset);
    } else if (svg.querySelector('.messageText') || svg.querySelector('.actor') || svg.classList.contains('sequenceDiagram')) {
      this.enhanceSequence(svg, isLight, isSepia, stylePreset, customColors);
    } else {
      this.enhanceFlowchart(svg, isLight, isSepia, stylePreset, customColors);
    }
  }

  /**
   * Injects reusable SVG filters, gradients, and markers adapted to the preset and active theme.
   */
  private static injectDefs(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    _preset: DiagramStylePreset,
    customColors: CustomDiagramColors
  ): void {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    const shadowOpacity = isLight || isSepia ? '0.08' : '0.4';
    const shadowColor = '#000000';

    const defsContent = `
      <!-- Ambient Drop Shadow Filter -->
      <filter id="visio-shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="${shadowColor}" flood-opacity="${shadowOpacity}"/>
      </filter>

      <!-- Glow Filter for Milestones & Roots -->
      <filter id="obsidian-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#818cf8" flood-opacity="0.5"/>
      </filter>

      <!-- Visio Corporate Process Gradient (Royal Slate Blue) -->
      <linearGradient id="visio-proc-corp" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>

      <!-- Visio Start/End Stadium Gradient (Emerald) -->
      <linearGradient id="visio-start-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#059669"/>
        <stop offset="100%" stop-color="#047857"/>
      </linearGradient>

      <!-- Visio Decision Gradient (Amber Gold) -->
      <linearGradient id="visio-decision-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#b45309"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>

      <!-- Modern Preset Violet Process Gradient -->
      <linearGradient id="modern-proc-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#2e1065"/>
        <stop offset="100%" stop-color="#1e1838"/>
      </linearGradient>

      <!-- Modern Preset Cyan Decision Gradient -->
      <linearGradient id="modern-dec-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#082f49"/>
        <stop offset="100%" stop-color="#0c1d2e"/>
      </linearGradient>

      <!-- Obsidian Mindmap Root Gradient -->
      <linearGradient id="obsidian-root-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#4f46e5"/>
      </linearGradient>

      <!-- Custom Arrow Marker -->
      <marker id="custom-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M 0 0 L 6 3 L 0 6 z" fill="${customColors.arrowColor}"/>
      </marker>
    `;

    defs.innerHTML += defsContent;
  }

  /**
   * Flowcharts -> Parameterized by Diagram Style Preset
   */
  private static enhanceFlowchart(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    preset: DiagramStylePreset,
    custom: CustomDiagramColors
  ): void {
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
          // ================= Start / End Capsule =================
          if (preset === 'minimalist') {
            rect.style.fill = isLight ? '#f4f4f5' : '#18181b';
            rect.style.stroke = isLight ? '#d4d4d8' : '#3f3f46';
            rect.style.strokeWidth = '1.5px';
            rect.removeAttribute('filter');
            if (text) (text as SVGElement).style.fill = isLight ? '#18181b' : '#f4f4f5';
          } else if (preset === 'modern') {
            rect.style.fill = '#4f46e5';
            rect.style.stroke = '#818cf8';
            rect.style.strokeWidth = '2px';
            rect.setAttribute('filter', 'url(#obsidian-glow)');
            if (text) (text as SVGElement).style.fill = '#ffffff';
          } else if (preset === 'custom') {
            rect.style.fill = custom.startEndFill;
            rect.style.stroke = custom.startEndStroke;
            rect.style.strokeWidth = '2px';
            rect.setAttribute('filter', 'url(#visio-shadow)');
            if (text) (text as SVGElement).style.fill = custom.textColor;
          } else {
            // Corporate (Visio)
            rect.style.fill = 'url(#visio-start-grad)';
            rect.style.stroke = '#10b981';
            rect.style.strokeWidth = '1.75px';
            rect.setAttribute('filter', 'url(#visio-shadow)');
            if (text) (text as SVGElement).style.fill = '#ffffff';
          }
        } else {
          // ================= Corporate / Standard Process Box =================
          rect.setAttribute('rx', '10');
          rect.setAttribute('ry', '10');

          if (preset === 'minimalist') {
            rect.style.fill = isLight ? '#ffffff' : '#18181b';
            rect.style.stroke = isLight ? '#e4e4e7' : '#27272a';
            rect.style.strokeWidth = '1.5px';
            rect.removeAttribute('filter');
            if (text) (text as SVGElement).style.fill = isLight ? '#18181b' : '#f4f4f5';
          } else if (preset === 'modern') {
            rect.style.fill = 'url(#modern-proc-grad)';
            rect.style.stroke = '#a78bfa';
            rect.style.strokeWidth = '1.75px';
            rect.setAttribute('filter', 'url(#visio-shadow)');
            if (text) (text as SVGElement).style.fill = '#f5f3ff';
          } else if (preset === 'custom') {
            rect.style.fill = custom.processFill;
            rect.style.stroke = custom.processStroke;
            rect.style.strokeWidth = '1.75px';
            rect.setAttribute('filter', 'url(#visio-shadow)');
            if (text) (text as SVGElement).style.fill = custom.textColor;
          } else {
            // Corporate (Visio)
            rect.style.fill = isLight ? '#ffffff' : isSepia ? '#f0ead9' : 'url(#visio-proc-corp)';
            rect.style.stroke = isLight ? '#4f46e5' : isSepia ? '#9a4316' : '#3b82f6';
            rect.style.strokeWidth = '1.75px';
            rect.setAttribute('filter', 'url(#visio-shadow)');
            if (text) (text as SVGElement).style.fill = isLight ? '#18181b' : isSepia ? '#2c2217' : '#ffffff';
          }
        }
      } else if (polygon) {
        // ================= Decision Diamond =================
        if (preset === 'minimalist') {
          polygon.style.fill = isLight ? '#f4f4f5' : '#18181b';
          polygon.style.stroke = isLight ? '#d4d4d8' : '#3f3f46';
          polygon.style.strokeWidth = '1.5px';
          polygon.removeAttribute('filter');
          if (text) (text as SVGElement).style.fill = isLight ? '#18181b' : '#f4f4f5';
        } else if (preset === 'modern') {
          polygon.style.fill = 'url(#modern-dec-grad)';
          polygon.style.stroke = '#22d3ee';
          polygon.style.strokeWidth = '2px';
          polygon.setAttribute('filter', 'url(#visio-shadow)');
          if (text) (text as SVGElement).style.fill = '#e0f2fe';
        } else if (preset === 'custom') {
          polygon.style.fill = custom.decisionFill;
          polygon.style.stroke = custom.decisionStroke;
          polygon.style.strokeWidth = '2px';
          polygon.setAttribute('filter', 'url(#visio-shadow)');
          if (text) (text as SVGElement).style.fill = custom.textColor;
        } else {
          // Corporate (Visio)
          polygon.style.fill = 'url(#visio-decision-grad)';
          polygon.style.stroke = '#f59e0b';
          polygon.style.strokeWidth = '2px';
          polygon.setAttribute('filter', 'url(#visio-shadow)');
          if (text) (text as SVGElement).style.fill = '#ffffff';
        }
      } else if (circle) {
        circle.style.fill = preset === 'custom' ? custom.startEndFill : 'url(#visio-start-grad)';
        circle.style.stroke = preset === 'custom' ? custom.startEndStroke : '#10b981';
        circle.setAttribute('filter', 'url(#visio-shadow)');
        if (text) (text as SVGElement).style.fill = '#ffffff';
      }
    });

    // Style edge paths and arrows
    const paths = svg.querySelectorAll('.flowchart-link, path.link');
    paths.forEach((p) => {
      let arrowColor = '#64748b';
      if (preset === 'custom') {
        arrowColor = custom.arrowColor;
      } else if (preset === 'minimalist') {
        arrowColor = isLight ? '#71717a' : '#a1a1aa';
      } else if (preset === 'modern') {
        arrowColor = '#818cf8';
      } else {
        // Corporate
        arrowColor = isLight ? '#4f46e5' : '#38bdf8';
      }

      (p as SVGElement).style.stroke = arrowColor;
      (p as SVGElement).style.strokeWidth = '1.8px';
    });
  }

  /**
   * Sequence Diagrams -> Parameterized by Style Preset
   */
  private static enhanceSequence(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    preset: DiagramStylePreset,
    custom: CustomDiagramColors
  ): void {
    const textColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';
    let accentColor = isLight ? '#4f46e5' : isSepia ? '#9a4316' : '#6366f1';
    let borderColor = isLight ? '#e4e4e7' : isSepia ? '#ded5c2' : '#27272a';

    if (preset === 'custom') {
      accentColor = custom.processStroke;
    } else if (preset === 'minimalist') {
      accentColor = isLight ? '#71717a' : '#a1a1aa';
    } else if (preset === 'modern') {
      accentColor = '#818cf8';
    }

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
      ml.style.stroke = preset === 'custom' ? custom.arrowColor : accentColor;
      ml.style.strokeWidth = '1.75px';
    });

    const arrowheads = svg.querySelectorAll<SVGPathElement>('#arrowhead path, #crosshead path');
    arrowheads.forEach((ah) => {
      const col = preset === 'custom' ? custom.arrowColor : accentColor;
      ah.style.fill = col;
      ah.style.stroke = col;
    });

    // 4. Actor boxes & Lifelines
    const actors = svg.querySelectorAll<SVGGElement>('.actor');
    actors.forEach((act) => {
      const rect = act.querySelector('rect');
      const text = act.querySelector('text');
      if (rect) {
        if (preset === 'minimalist') {
          rect.style.fill = isLight ? '#ffffff' : '#18181b';
          rect.style.stroke = isLight ? '#e4e4e7' : '#3f3f46';
          rect.style.strokeWidth = '1.5px';
          rect.removeAttribute('filter');
          if (text) text.style.fill = textColor;
        } else if (preset === 'custom') {
          rect.style.fill = custom.processFill;
          rect.style.stroke = custom.processStroke;
          rect.style.strokeWidth = '1.5px';
          rect.setAttribute('filter', 'url(#visio-shadow)');
          if (text) text.style.fill = custom.textColor;
        } else {
          rect.style.fill = accentColor;
          rect.style.stroke = isLight ? '#4338ca' : '#818cf8';
          rect.style.strokeWidth = '1.5px';
          rect.setAttribute('rx', '8');
          rect.setAttribute('ry', '8');
          rect.setAttribute('filter', 'url(#visio-shadow)');
          if (text) text.style.fill = '#ffffff';
        }
      }
      if (text) {
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
  private static enhanceMindmap(
    svg: SVGSVGElement,
    isLight: boolean,
    _isSepia: boolean,
    preset: DiagramStylePreset
  ): void {
    const mindmapNodes = svg.querySelectorAll('.mindmap-node');
    const branchColors = preset === 'minimalist'
      ? [
          { fill: isLight ? '#f4f4f5' : '#18181b', stroke: isLight ? '#d4d4d8' : '#3f3f46' },
          { fill: isLight ? '#f4f4f5' : '#18181b', stroke: isLight ? '#d4d4d8' : '#3f3f46' },
        ]
      : [
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
        (text as SVGElement).style.fill = preset === 'minimalist'
          ? (isLight ? '#18181b' : '#f4f4f5')
          : '#ffffff';
        (text as SVGElement).style.fontWeight = '600';
        (text as SVGElement).style.fontSize = '12px';
      }

      if (circle) {
        circle.style.fill = preset === 'minimalist'
          ? (isLight ? '#ffffff' : '#18181b')
          : 'url(#obsidian-root-grad)';
        circle.style.stroke = preset === 'minimalist' ? (isLight ? '#e4e4e7' : '#3f3f46') : '#818cf8';
        circle.style.strokeWidth = '3px';
        if (preset !== 'minimalist') {
          circle.setAttribute('filter', 'url(#obsidian-glow)');
        }
      } else if (rect) {
        const palette = branchColors[colorIndex % branchColors.length];
        colorIndex++;

        rect.setAttribute('rx', '14');
        rect.setAttribute('ry', '14');
        rect.style.fill = palette.fill;
        rect.style.stroke = palette.stroke;
        rect.style.strokeWidth = '2px';
        if (preset !== 'minimalist') {
          rect.setAttribute('filter', 'url(#visio-shadow)');
        }
      }
    });

    const lines = svg.querySelectorAll('path.mindmap-edge');
    lines.forEach((line) => {
      (line as SVGElement).style.stroke = preset === 'minimalist'
        ? (isLight ? '#71717a' : '#a1a1aa')
        : '#818cf8';
      (line as SVGElement).style.strokeWidth = '2.5px';
      (line as SVGElement).style.opacity = '0.85';
    });
  }

  /**
   * Gantt -> Microsoft Project Executive Timeline
   */
  private static enhanceGantt(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    preset: DiagramStylePreset
  ): void {
    const textColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';
    const mutedColor = isLight ? '#71717a' : isSepia ? '#786b59' : '#a1a1aa';
    const gridColor = isLight ? '#e4e4e7' : isSepia ? '#ded5c2' : '#27272a';

    const title = svg.querySelector('.titleText');
    if (title) {
      (title as SVGElement).style.fill = textColor;
      (title as SVGElement).style.fontWeight = '700';
      (title as SVGElement).style.fontSize = '16px';
    }

    const taskTexts = svg.querySelectorAll('.taskText, .taskTextOutsideRight');
    taskTexts.forEach((t) => {
      (t as SVGElement).style.fill = '#ffffff';
      (t as SVGElement).style.fontWeight = '600';
      (t as SVGElement).style.fontSize = '12px';
      (t as SVGElement).style.textShadow = '0 1px 3px rgba(0,0,0,0.85)';
    });

    const tasks = svg.querySelectorAll('rect.task');
    tasks.forEach((t) => {
      t.setAttribute('rx', '6');
      t.setAttribute('ry', '6');
      if (preset !== 'minimalist') {
        t.setAttribute('filter', 'url(#visio-shadow)');
      }
    });

    const dateTicks = svg.querySelectorAll('.tick text');
    dateTicks.forEach((dt) => {
      (dt as SVGElement).style.fill = mutedColor;
      (dt as SVGElement).style.fontWeight = '500';
      (dt as SVGElement).style.fontSize = '11px';
    });

    const gridLines = svg.querySelectorAll('.grid .tick line');
    gridLines.forEach((gl) => {
      (gl as SVGElement).style.stroke = gridColor;
      (gl as SVGElement).style.strokeDasharray = '4 4';
    });

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
  private static enhanceGitGraph(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    _preset: DiagramStylePreset,
    _custom: CustomDiagramColors
  ): void {
    const textColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';

    const commitLabelBkgs = svg.querySelectorAll('.commit-label-bkg');
    commitLabelBkgs.forEach((bkg) => {
      (bkg as SVGElement).style.display = 'none';
      (bkg as SVGElement).style.opacity = '0';
    });

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

      // Anti-collision staggering: alternate vertical offsets
      const currentDy = parseFloat(label.getAttribute('dy') || '0');
      const offset = (idx % 2 === 1) ? 14 : -6;
      label.setAttribute('dy', `${currentDy + offset}px`);
    });

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
