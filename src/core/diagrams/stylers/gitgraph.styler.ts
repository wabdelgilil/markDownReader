import { DiagramStylePreset, CustomDiagramColors } from '../../../services/diagram-theme.service';

/**
 * Git Graph Styler with Dynamic Anti-Collision Geometry
 * Eliminates overlapping commit labels on horizontal Git trees through
 * angled rotation (-35deg), alternating vertical tiers, and crisp typography.
 */
export class GitGraphStyler {
  public static apply(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    _preset: DiagramStylePreset,
    _custom: CustomDiagramColors
  ): void {
    const textColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';

    // 1. Hide default opaque rectangular backgrounds that clip lines
    const commitLabelBkgs = svg.querySelectorAll('.commit-label-bkg, rect.commit-label-bkg');
    commitLabelBkgs.forEach((bkg) => {
      (bkg as SVGElement).style.display = 'none';
      (bkg as SVGElement).style.opacity = '0';
      bkg.setAttribute('fill', 'transparent');
    });

    // 2. Query all commit label text elements (Mermaid generates <text class="commit-label">)
    const commitLabels = svg.querySelectorAll<SVGTextElement>('text.commit-label, .commit-label');
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

      const x = parseFloat(label.getAttribute('x') || '0');
      const y = parseFloat(label.getAttribute('y') || '0');

      // Alternating 2-phase vertical tier to prevent horizontal overlap:
      // Even commits stay near baseline, odd commits offset downward
      const verticalOffset = (idx % 2 === 1) ? 22 : 0;
      const targetY = y + verticalOffset;
      label.setAttribute('y', targetY.toString());

      // Rotate -35 degrees around anchor point to provide clean clearance for long messages
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('transform', `rotate(-35, ${x}, ${targetY})`);
    });

    // 3. Branch label badges (e.g. main, develop, feature)
    const branchLabels = svg.querySelectorAll('.branch-label, g.branch-label');
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
        (text as SVGElement).style.fontFamily = 'Readex Pro, system-ui, sans-serif';
      }
    });

    // 4. Commit dots (circles)
    const commitDots = svg.querySelectorAll<SVGCircleElement>('.commit-bullets circle, circle.commit');
    commitDots.forEach((dot) => {
      dot.setAttribute('r', '7');
      dot.style.strokeWidth = '2px';
      dot.style.stroke = isLight ? '#ffffff' : '#18181b';
      dot.setAttribute('filter', 'url(#visio-shadow)');
    });
  }
}
