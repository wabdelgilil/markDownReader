import { DiagramThemeService } from '../../services/diagram-theme.service';
import {
  DefsManager,
  FlowchartStyler,
  SequenceStyler,
  GitGraphStyler,
  MindmapStyler,
  GanttStyler,
} from './stylers';

/**
 * High-Fidelity SVG Diagram Styler Facade
 * Orchestrates domain-specific stylers across reading themes and aesthetic presets.
 */
export class DiagramStyler {
  /**
   * Enhances an SVG element in-place with the active preset aesthetics and theme colors.
   */
  public static enhanceSvg(svg: SVGSVGElement): void {
    const currentTheme = (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme')
      : 'dark') || 'dark';

    const isLight = currentTheme === 'light';
    const isSepia = currentTheme === 'sepia';
    const stylePreset = DiagramThemeService.getStylePreset();
    const customColors = DiagramThemeService.getCustomColors();

    // 1. Inject SVG Defs (Gradients, Dropshadows, and Markers)
    DefsManager.apply(svg, isLight, isSepia, stylePreset, customColors);

    // 2. Enforce strict LTR layout on the SVG
    svg.style.direction = 'ltr';
    svg.setAttribute('dir', 'ltr');

    // 3. Dispatch to specialized styler based on diagram signature
    if (svg.classList.contains('gitGraph') || svg.querySelector('.commit') || svg.querySelector('.branch-label')) {
      GitGraphStyler.apply(svg, isLight, isSepia, stylePreset, customColors);
    } else if (svg.querySelector('.mindmap-node') || svg.classList.contains('mindmap')) {
      MindmapStyler.apply(svg, isLight, isSepia, stylePreset);
    } else if (svg.querySelector('.task') || svg.classList.contains('gantt')) {
      GanttStyler.apply(svg, isLight, isSepia, stylePreset);
    } else if (svg.querySelector('.messageText') || svg.querySelector('.actor') || svg.classList.contains('sequenceDiagram')) {
      SequenceStyler.apply(svg, isLight, isSepia, stylePreset, customColors);
    } else {
      FlowchartStyler.apply(svg, isLight, isSepia, stylePreset, customColors);
    }
  }
}
