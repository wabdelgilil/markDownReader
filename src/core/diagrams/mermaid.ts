import mermaid from 'mermaid';

/**
 * Interactive Diagram Engine powered by Mermaid.js
 */
export class DiagramEngine {
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Readex Pro, system-ui, sans-serif',
      suppressErrorRendering: true,
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
      },
    });

    this.initialized = true;
  }

  /**
   * Pre-processes Markdown content to extract ```mermaid blocks into interactive placeholders.
   */
  public static extractPlaceholders(content: string): {
    content: string;
    diagrams: Map<string, string>;
  } {
    const diagrams = new Map<string, string>();
    let index = 0;

    const transformed = content.replace(/```mermaid([\s\S]*?)```/g, (_match, code) => {
      const id = `mermaid-canvas-${index++}`;
      const cleanCode = code.trim();
      diagrams.set(id, cleanCode);
      return `<div class="mermaid-diagram-container my-6 p-4 rounded-xl bg-theme-surface border border-theme-border shadow-sm overflow-hidden" data-diagram-id="${id}" data-diagram-code="${encodeURIComponent(cleanCode)}">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-theme-border/60 text-xs text-theme-muted">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-medium">Mermaid Diagram</span>
          </div>
          <div class="flex items-center gap-1.5" dir="ltr">
            <button class="diagram-action-btn px-2 py-1 rounded hover:bg-theme-bg border border-theme-border/50 transition-colors" data-action="zoom-in" title="تكبير">+</button>
            <button class="diagram-action-btn px-2 py-1 rounded hover:bg-theme-bg border border-theme-border/50 transition-colors" data-action="zoom-out" title="تصغير">-</button>
            <button class="diagram-action-btn px-2 py-1 rounded hover:bg-theme-bg border border-theme-border/50 transition-colors" data-action="reset" title="إعادة ضبط">↺</button>
            <button class="diagram-action-btn px-2 py-1 rounded hover:bg-theme-bg border border-theme-border/50 transition-colors text-theme-accent" data-action="export-svg" title="تصدير SVG">SVG</button>
          </div>
        </div>
        <div id="${id}" class="mermaid-target flex justify-center items-center min-h-[120px] overflow-auto">
          <div class="animate-pulse text-xs text-theme-muted py-6">جاري رسم المخطط...</div>
        </div>
      </div>`;
    });

    return { content: transformed, diagrams };
  }

  /**
   * Client-side rendering of all diagram placeholders inside a container element.
   */
  public static async renderDiagrams(
    container: HTMLElement,
    diagrams: Map<string, string>
  ): Promise<void> {
    this.initialize();

    for (const [id, code] of diagrams.entries()) {
      const target = container.querySelector(`#${id}`);
      if (!target) continue;

      try {
        const renderId = `render-${id}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, code);
        target.innerHTML = svg;

        // Inject Arabic SVG font styles to guarantee smooth Arabic ligatures
        const svgElement = target.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          svgElement.setAttribute('font-family', 'Readex Pro, system-ui, sans-serif');
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error rendering diagram';
        target.innerHTML = `<div class="p-3 text-xs text-rose-400 bg-rose-500/10 rounded border border-rose-500/30 font-mono" dir="ltr">
          <div class="font-bold mb-1">Diagram Render Error:</div>
          <div>${errorMsg}</div>
        </div>`;
      }
    }
  }
}
