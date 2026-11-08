import { DiagramStylePreset } from '../../../services/diagram-theme.service';

/**
 * Gantt Chart Styler
 * Renders executive timeline bars, gridlines, and date markers with high contrast.
 */
export class GanttStyler {
  public static apply(
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
      (title as SVGElement).style.fontFamily = 'Readex Pro, system-ui, sans-serif';
    }

    const taskTexts = svg.querySelectorAll('.taskText, .taskTextOutsideRight');
    taskTexts.forEach((t) => {
      (t as SVGElement).style.fill = '#ffffff';
      (t as SVGElement).style.fontWeight = '600';
      (t as SVGElement).style.fontSize = '12px';
      (t as SVGElement).style.textShadow = '0 1px 3px rgba(0,0,0,0.85)';
      (t as SVGElement).style.fontFamily = 'Readex Pro, system-ui, sans-serif';
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
      (dt as SVGElement).style.fontFamily = 'Readex Pro, system-ui, sans-serif';
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
}
