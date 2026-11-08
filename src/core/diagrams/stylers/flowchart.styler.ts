import { DiagramStylePreset, CustomDiagramColors } from '../../../services/diagram-theme.service';

/**
 * Flowchart Diagram Styler
 * Applies styling for corporate (Visio), minimalist (Notion), modern (Obsidian), and custom presets.
 */
export class FlowchartStyler {
  public static apply(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    preset: DiagramStylePreset,
    custom: CustomDiagramColors
  ): void {
    this.enhance(svg, isLight, isSepia, preset, custom);
  }

  public static enhance(
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
          this.styleStadium(rect, text as SVGElement | null, isLight, preset, custom);
        } else {
          this.styleProcessBox(rect, text as SVGElement | null, isLight, isSepia, preset, custom);
        }
      } else if (polygon) {
        this.styleDecisionDiamond(polygon, text as SVGElement | null, isLight, preset, custom);
      } else if (circle) {
        circle.style.fill = preset === 'custom' ? custom.startEndFill : 'url(#visio-start-grad)';
        circle.style.stroke = preset === 'custom' ? custom.startEndStroke : '#10b981';
        circle.setAttribute('filter', 'url(#visio-shadow)');
        if (text) (text as SVGElement).style.fill = '#ffffff';
      }
    });

    this.styleConnectors(svg, isLight, preset, custom);
  }

  private static styleStadium(
    rect: SVGRectElement,
    text: SVGElement | null,
    isLight: boolean,
    preset: DiagramStylePreset,
    custom: CustomDiagramColors
  ): void {
    if (preset === 'minimalist') {
      rect.style.fill = isLight ? '#f4f4f5' : '#18181b';
      rect.style.stroke = isLight ? '#d4d4d8' : '#3f3f46';
      rect.style.strokeWidth = '1.5px';
      rect.removeAttribute('filter');
      if (text) text.style.fill = isLight ? '#18181b' : '#f4f4f5';
    } else if (preset === 'modern') {
      rect.style.fill = '#4f46e5';
      rect.style.stroke = '#818cf8';
      rect.style.strokeWidth = '2px';
      rect.setAttribute('filter', 'url(#obsidian-glow)');
      if (text) text.style.fill = '#ffffff';
    } else if (preset === 'custom') {
      rect.style.fill = custom.startEndFill;
      rect.style.stroke = custom.startEndStroke;
      rect.style.strokeWidth = '2px';
      rect.setAttribute('filter', 'url(#visio-shadow)');
      if (text) text.style.fill = custom.textColor;
    } else {
      rect.style.fill = 'url(#visio-start-grad)';
      rect.style.stroke = '#10b981';
      rect.style.strokeWidth = '1.75px';
      rect.setAttribute('filter', 'url(#visio-shadow)');
      if (text) text.style.fill = '#ffffff';
    }
  }

  private static styleProcessBox(
    rect: SVGRectElement,
    text: SVGElement | null,
    isLight: boolean,
    isSepia: boolean,
    preset: DiagramStylePreset,
    custom: CustomDiagramColors
  ): void {
    rect.setAttribute('rx', '10');
    rect.setAttribute('ry', '10');

    if (preset === 'minimalist') {
      rect.style.fill = isLight ? '#ffffff' : '#18181b';
      rect.style.stroke = isLight ? '#e4e4e7' : '#27272a';
      rect.style.strokeWidth = '1.5px';
      rect.removeAttribute('filter');
      if (text) text.style.fill = isLight ? '#18181b' : '#f4f4f5';
    } else if (preset === 'modern') {
      rect.style.fill = 'url(#modern-proc-grad)';
      rect.style.stroke = '#a78bfa';
      rect.style.strokeWidth = '1.75px';
      rect.setAttribute('filter', 'url(#visio-shadow)');
      if (text) text.style.fill = '#f5f3ff';
    } else if (preset === 'custom') {
      rect.style.fill = custom.processFill;
      rect.style.stroke = custom.processStroke;
      rect.style.strokeWidth = '1.75px';
      rect.setAttribute('filter', 'url(#visio-shadow)');
      if (text) text.style.fill = custom.textColor;
    } else {
      rect.style.fill = isLight ? '#ffffff' : isSepia ? '#f0ead9' : 'url(#visio-proc-corp)';
      rect.style.stroke = isLight ? '#4f46e5' : isSepia ? '#9a4316' : '#3b82f6';
      rect.style.strokeWidth = '1.75px';
      rect.setAttribute('filter', 'url(#visio-shadow)');
      if (text) text.style.fill = isLight ? '#18181b' : isSepia ? '#2c2217' : '#ffffff';
    }
  }

  private static styleDecisionDiamond(
    polygon: SVGPolygonElement,
    text: SVGElement | null,
    isLight: boolean,
    preset: DiagramStylePreset,
    custom: CustomDiagramColors
  ): void {
    if (preset === 'minimalist') {
      polygon.style.fill = isLight ? '#f4f4f5' : '#18181b';
      polygon.style.stroke = isLight ? '#d4d4d8' : '#3f3f46';
      polygon.style.strokeWidth = '1.5px';
      polygon.removeAttribute('filter');
      if (text) text.style.fill = isLight ? '#18181b' : '#f4f4f5';
    } else if (preset === 'modern') {
      polygon.style.fill = 'url(#modern-dec-grad)';
      polygon.style.stroke = '#22d3ee';
      polygon.style.strokeWidth = '2px';
      polygon.setAttribute('filter', 'url(#visio-shadow)');
      if (text) text.style.fill = '#e0f2fe';
    } else if (preset === 'custom') {
      polygon.style.fill = custom.decisionFill;
      polygon.style.stroke = custom.decisionStroke;
      polygon.style.strokeWidth = '2px';
      polygon.setAttribute('filter', 'url(#visio-shadow)');
      if (text) text.style.fill = custom.textColor;
    } else {
      polygon.style.fill = 'url(#visio-decision-grad)';
      polygon.style.stroke = '#f59e0b';
      polygon.style.strokeWidth = '2px';
      polygon.setAttribute('filter', 'url(#visio-shadow)');
      if (text) text.style.fill = '#ffffff';
    }
  }

  private static styleConnectors(
    svg: SVGSVGElement,
    isLight: boolean,
    preset: DiagramStylePreset,
    custom: CustomDiagramColors
  ): void {
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
        arrowColor = isLight ? '#4f46e5' : '#38bdf8';
      }

      (p as SVGElement).style.stroke = arrowColor;
      (p as SVGElement).style.strokeWidth = '1.8px';
    });
  }
}
