import { DiagramStylePreset } from '../../../services/diagram-theme.service';

/**
 * Mindmap Styler
 * Applies Obsidian & Linear organic hierarchy styling to mindmap nodes and connections.
 */
export class MindmapStyler {
  public static apply(
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
          { fill: '#4f46e5', stroke: '#818cf8' },
          { fill: '#0d9488', stroke: '#2dd4bf' },
          { fill: '#d97706', stroke: '#fbbf24' },
          { fill: '#7c3aed', stroke: '#c084fc' },
          { fill: '#0284c7', stroke: '#38bdf8' },
          { fill: '#e11d48', stroke: '#fb7185' },
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
        (text as SVGElement).style.fontFamily = 'Readex Pro, system-ui, sans-serif';
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
}
