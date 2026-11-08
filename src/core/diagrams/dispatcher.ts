import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import { Chart, registerables } from 'chart.js';
import mermaid from 'mermaid';
import { DiagramStyler } from './styler';

// Register Chart.js components
Chart.register(...registerables);

const transformer = new Transformer();

export type DiagramEngineType = 'markmap' | 'chartjs' | 'gantt' | 'mermaid';

export interface DiagramClassification {
  type: DiagramEngineType;
  badge: string;
  accentColor: string;
}

/**
 * Multi-Engine Diagram Dispatcher
 * Routes diagram declarations to specialized rendering libraries:
 * - 'mindmap' -> Markmap (D3 interactive folding tree)
 * - 'pie' / 'chart' -> Chart.js (Interactive analytical charts)
 * - 'flowchart' / 'sequence' / 'gitGraph' -> Mermaid with Enterprise SVG post-processing
 */
export class DiagramDispatcher {
  /**
   * Classifies diagram source code to select the target renderer.
   */
  public static classify(code: string): DiagramClassification {
    const trimmed = code.trim().toLowerCase();

    if (trimmed.startsWith('mindmap')) {
      return {
        type: 'markmap',
        badge: 'Mindmap (Interactive)',
        accentColor: '#8b5cf6',
      };
    }

    if (trimmed.startsWith('pie')) {
      return {
        type: 'chartjs',
        badge: 'Analytics Chart',
        accentColor: '#3b82f6',
      };
    }

    if (trimmed.startsWith('gantt')) {
      return {
        type: 'mermaid',
        badge: 'Gantt Timeline',
        accentColor: '#10b981',
      };
    }

    if (trimmed.startsWith('gitgraph')) {
      return {
        type: 'mermaid',
        badge: 'Git History Tree',
        accentColor: '#06b6d4',
      };
    }

    return {
      type: 'mermaid',
      badge: 'Architecture Flowchart',
      accentColor: '#3b82f6',
    };
  }

  /**
   * Renders a diagram into target container using its dedicated native library.
   */
  public static async render(
    container: HTMLElement,
    id: string,
    code: string
  ): Promise<void> {
    const classification = this.classify(code);

    try {
      if (classification.type === 'markmap') {
        await this.renderMarkmap(container, code);
      } else if (classification.type === 'chartjs') {
        this.renderChartJs(container, code);
      } else {
        await this.renderMermaid(container, id, code);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error rendering diagram';
      container.innerHTML = `<div class="p-4 text-xs text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/30 font-mono" dir="ltr">
        <div class="font-bold mb-1">Diagram Engine Error:</div>
        <div>${errorMsg}</div>
      </div>`;
    }
  }

  /**
   * Specialized Renderer 1: Markmap (Obsidian Interactive Foldable Mindmap)
   */
  private static async renderMarkmap(container: HTMLElement, code: string): Promise<void> {
    // Convert mermaid mindmap indented lines into markdown heading hierarchy
    const lines = code.trim().split('\n').slice(1); // skip 'mindmap'
    const markdownLines: string[] = [];

    for (const rawLine of lines) {
      if (!rawLine.trim()) continue;
      const indentMatch = rawLine.match(/^\s*/);
      const indent = indentMatch ? indentMatch[0].length : 0;
      let text = rawLine.trim();

      // Clean mermaid shape syntax like root((Title)) or node["Title"] or node(Title)
      text = text.replace(/^[a-zA-Z0-9_\-]+\s*[\(\[\{]+(.*?)[\)\]\}]+$/, '$1');
      text = text.replace(/^root\s*[\(\[\{]+(.*?)[\)\]\}]+$/, '$1');

      const level = Math.max(1, Math.min(6, Math.floor(indent / 2) + 1));
      markdownLines.push(`${'#'.repeat(level)} ${text}`);
    }

    const markdownText = markdownLines.join('\n') || '# الخريطة الذهنية';
    const { root } = transformer.transform(markdownText);

    container.innerHTML = `
      <div class="relative w-full h-[420px] bg-theme-bg/50 rounded-xl overflow-hidden" dir="ltr" style="direction: ltr !important;">
        <div class="absolute top-2 left-2 z-10 text-[10px] text-white/50 bg-black/40 px-2 py-1 rounded backdrop-blur-xs select-none">
          انقر على الدوائر للطي والفرد • اسحب بالفأرة للتحريك • عجلة الفأرة للتكبير
        </div>
        <svg class="w-full h-full cursor-grab active:cursor-grabbing select-none markmap" id="markmap-target-${Date.now()}"></svg>
      </div>
    `;

    const svgElement = container.querySelector('svg') as SVGSVGElement;
    if (svgElement && root) {
      const mm = Markmap.create(svgElement, {
        autoFit: true,
        duration: 300,
        color: (node) => {
          const colors = ['#818cf8', '#34d399', '#a78bfa', '#fbbf24', '#22d3ee', '#fb7185'];
          return colors[(node.state.depth || 0) % colors.length];
        },
      }, root);

      // Store markmap instance on element for zoom buttons
      (svgElement as unknown as { __markmapInstance: unknown }).__markmapInstance = mm;
    }
  }

  /**
   * Specialized Renderer 2: Chart.js (Interactive Modern Analytical Charts)
   */
  private static renderChartJs(container: HTMLElement, code: string): void {
    // Parse Mermaid pie syntax:
    // pie title Stack
    //   "TypeScript" : 60
    //   "Rust" : 40
    const lines = code.trim().split('\n');
    let title = 'مخطط البيانات التحليلي';
    const labels: string[] = [];
    const values: number[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('pie')) {
        const titleMatch = trimmed.match(/title\s+(.*)$/i);
        if (titleMatch) title = titleMatch[1];
        continue;
      }

      const match = trimmed.match(/^["']?(.*?)["']?\s*:\s*([0-9.]+)/);
      if (match) {
        labels.push(match[1]);
        values.push(parseFloat(match[2]));
      }
    }

    const currentTheme = (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme')
      : 'dark') || 'dark';
    const isLight = currentTheme === 'light';
    const isSepia = currentTheme === 'sepia';
    const legendColor = isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';
    const tooltipBg = isLight ? '#18181b' : isSepia ? '#211c18' : '#09090b';

    container.innerHTML = `
      <div class="w-full max-w-lg mx-auto p-4 flex flex-col items-center justify-center select-none" dir="ltr" style="direction: ltr !important;">
        <h4 class="font-bold text-sm text-theme-text mb-4 text-center">${title}</h4>
        <div class="relative w-full max-h-[300px] flex justify-center">
          <canvas class="max-h-[280px]"></canvas>
        </div>
      </div>
    `;

    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              '#4f46e5', // Iris Indigo
              '#0d9488', // Teal
              '#d97706', // Amber
              '#7c3aed', // Violet
              '#0284c7', // Sky
              '#e11d48', // Rose
            ],
            borderColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: legendColor,
              font: { family: 'Readex Pro, sans-serif', size: 12 },
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: tooltipBg,
            titleFont: { family: 'Readex Pro, sans-serif' },
            bodyFont: { family: 'Readex Pro, sans-serif' },
            padding: 10,
            cornerRadius: 8,
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    });
  }

  /**
   * Specialized Renderer 3: Mermaid Engine with Visio / Enterprise Post-Processing
   */
  private static async renderMermaid(container: HTMLElement, id: string, code: string): Promise<void> {
    const renderId = `render-${id}-${Date.now()}`;
    const { svg } = await mermaid.render(renderId, code);
    container.innerHTML = svg;

    const svgElement = container.querySelector('svg');
    if (svgElement) {
      svgElement.style.maxWidth = '100%';
      svgElement.style.height = 'auto';
      svgElement.setAttribute('font-family', 'Readex Pro, system-ui, sans-serif');

      // Apply Visio & MS Project styling
      DiagramStyler.enhanceSvg(svgElement);
    }
  }
}
