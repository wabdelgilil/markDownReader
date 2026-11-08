import { DiagramStylePreset, CustomDiagramColors } from '../../../services/diagram-theme.service';

/**
 * SVG Definitions Manager
 * Injects reusable filters, gradients, and markers adapted to the active theme and diagram style preset.
 */
export class DefsManager {
  public static apply(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    preset: DiagramStylePreset,
    customColors: CustomDiagramColors
  ): void {
    this.injectDefs(svg, isLight, isSepia, preset, customColors);
  }

  public static injectDefs(
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
}
