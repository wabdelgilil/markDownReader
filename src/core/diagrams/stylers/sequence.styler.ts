import { DiagramStylePreset, CustomDiagramColors } from '../../../services/diagram-theme.service';

/**
 * High-Fidelity Sequence Diagram Styler
 * Ensures crisp contrast across Light, Dark, Sepia, and Terminal reading themes
 * with full preset adaptation (Corporate, Minimalist, Modern, Custom).
 */
export class SequenceStyler {
  public static apply(
    svg: SVGSVGElement,
    isLight: boolean,
    isSepia: boolean,
    preset: DiagramStylePreset,
    custom: CustomDiagramColors
  ): void {
    const textColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';
    let accentColor = isLight ? '#4f46e5' : isSepia ? '#9a4316' : '#6366f1';
    const borderColor = isLight ? '#d4d4d8' : isSepia ? '#d5cbba' : '#3f3f46';
    const lifelineColor = isLight ? '#a1a1aa' : isSepia ? '#a89d89' : '#52525b';

    if (preset === 'custom') {
      accentColor = custom.processStroke;
    } else if (preset === 'minimalist') {
      accentColor = isLight ? '#3f3f46' : '#d4d4d8';
    } else if (preset === 'modern') {
      accentColor = '#818cf8';
    }

    // 1. Message texts between lifelines (Target both text and tspan for guaranteed contrast)
    const messageTexts = svg.querySelectorAll<SVGElement>('.messageText, .messageText tspan, text.messageText');
    messageTexts.forEach((msg) => {
      msg.style.fill = textColor;
      msg.style.color = textColor;
      msg.style.fontFamily = 'Readex Pro, system-ui, sans-serif';
      msg.style.fontWeight = '600';
      msg.style.fontSize = '13px';
    });

    // 2. Sequence autonumber circles and number digits
    const seqNumbers = svg.querySelectorAll<SVGTextElement>('.sequenceNumber, text.sequenceNumber, .sequenceNumber tspan');
    seqNumbers.forEach((sn) => {
      sn.style.fill = '#ffffff';
      sn.style.fontWeight = '700';
      sn.style.fontSize = '11px';
      sn.style.fontFamily = 'Readex Pro, system-ui, sans-serif';
    });

    // Autonumber marker badge background circle in SVG defs
    const seqMarkers = svg.querySelectorAll<SVGElement>('marker[id$="-sequencenumber"] circle, marker[id$="-sequencenumber"]');
    seqMarkers.forEach((sm) => {
      sm.style.fill = accentColor;
      sm.setAttribute('fill', accentColor);
    });

    // 3. Message lines & Arrowheads
    const messageLines = svg.querySelectorAll<SVGElement>('.messageLine0, .messageLine1, line[data-et="message"], path[data-et="message"]');
    messageLines.forEach((ml) => {
      const col = preset === 'custom' ? custom.arrowColor : accentColor;
      ml.style.stroke = col;
      ml.style.strokeWidth = '2px';
      ml.setAttribute('stroke', col);
    });

    // Arrow markers in SVG defs
    const arrowheads = svg.querySelectorAll<SVGPathElement>(
      '#arrowhead path, #crosshead path, marker[id$="-arrowhead"] path, marker[id$="-crosshead"] path, marker[id$="-filled-head"] path'
    );
    arrowheads.forEach((ah) => {
      const col = preset === 'custom' ? custom.arrowColor : accentColor;
      ah.style.fill = col;
      ah.style.stroke = col;
      ah.setAttribute('fill', col);
      ah.setAttribute('stroke', col);
    });

    // 4. Actor boxes & Lifelines
    const actors = svg.querySelectorAll<SVGGElement>('.actor, g.actor');
    actors.forEach((act) => {
      const rect = act.querySelector('rect');
      const text = act.querySelector('text');
      if (rect) {
        if (preset === 'minimalist') {
          rect.style.fill = isLight ? '#ffffff' : '#18181b';
          rect.style.stroke = isLight ? '#d4d4d8' : '#3f3f46';
          rect.style.strokeWidth = '1.5px';
          rect.removeAttribute('filter');
          if (text) (text as SVGElement).style.fill = textColor;
        } else if (preset === 'custom') {
          rect.style.fill = custom.processFill;
          rect.style.stroke = custom.processStroke;
          rect.style.strokeWidth = '1.75px';
          rect.setAttribute('filter', 'url(#visio-shadow)');
          if (text) (text as SVGElement).style.fill = custom.textColor;
        } else if (preset === 'modern') {
          rect.style.fill = '#4f46e5';
          rect.style.stroke = '#818cf8';
          rect.style.strokeWidth = '1.75px';
          rect.setAttribute('rx', '8');
          rect.setAttribute('ry', '8');
          rect.setAttribute('filter', 'url(#visio-shadow)');
          if (text) (text as SVGElement).style.fill = '#ffffff';
        } else {
          // Corporate Visio
          rect.style.fill = accentColor;
          rect.style.stroke = isLight ? '#4338ca' : '#818cf8';
          rect.style.strokeWidth = '1.75px';
          rect.setAttribute('rx', '8');
          rect.setAttribute('ry', '8');
          rect.setAttribute('filter', 'url(#visio-shadow)');
          if (text) (text as SVGElement).style.fill = '#ffffff';
        }
      }
      if (text) {
        (text as SVGElement).style.fontWeight = '600';
        (text as SVGElement).style.fontSize = '13px';
        (text as SVGElement).style.fontFamily = 'Readex Pro, system-ui, sans-serif';
      }
    });

    // Lifeline vertical dashed lines
    const actorLines = svg.querySelectorAll<SVGLineElement>('.actor-line, line.actor-line');
    actorLines.forEach((al) => {
      al.style.stroke = lifelineColor;
      al.style.strokeWidth = '1.5px';
      al.style.strokeDasharray = '5, 5';
      al.setAttribute('stroke', lifelineColor);
    });

    // 5. Actor man (stick figure)
    const actorManTexts = svg.querySelectorAll<SVGTextElement>('.actor-man text');
    actorManTexts.forEach((amt) => {
      amt.style.fill = textColor;
      amt.style.fontWeight = '600';
      amt.style.fontFamily = 'Readex Pro, system-ui, sans-serif';
    });
    const actorManFigures = svg.querySelectorAll<SVGElement>('.actor-man circle, .actor-man line');
    actorManFigures.forEach((amf) => {
      amf.style.stroke = accentColor;
      amf.style.strokeWidth = '2px';
      amf.setAttribute('stroke', accentColor);
    });

    // 6. Notes & Label Boxes
    const notes = svg.querySelectorAll<SVGRectElement>('.note, rect.note');
    notes.forEach((note) => {
      note.style.fill = isLight ? '#f4f4f5' : isSepia ? '#f0ead9' : '#18181b';
      note.style.stroke = borderColor;
      note.style.strokeWidth = '1.5px';
      note.setAttribute('rx', '6');
    });

    const noteTexts = svg.querySelectorAll<SVGTextElement>('.noteText, .noteText tspan, text.noteText');
    noteTexts.forEach((nt) => {
      nt.style.fill = textColor;
      nt.style.fontWeight = '500';
      nt.style.fontSize = '12px';
      nt.style.fontFamily = 'Readex Pro, system-ui, sans-serif';
    });
  }
}
