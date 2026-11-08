import mermaid from 'mermaid';

/**
 * Interactive Diagram Engine powered by Mermaid.js
 * Configured with high-contrast Obsidian & Modern palettes for Mindmaps, GitGraphs, and Gantt charts.
 */
export class DiagramEngine {
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: 'Readex Pro, system-ui, sans-serif',
      suppressErrorRendering: true,
      themeVariables: {
        darkMode: true,
        background: 'transparent',
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#60a5fa',
        lineColor: '#64748b',
        secondaryColor: '#8b5cf6',
        tertiaryColor: '#10b981',

        // Git Graph styling (Obsidian / GitHub palette)
        git0: '#38bdf8', // main branch: Bright Sky
        git1: '#a855f7', // develop branch: Purple
        git2: '#10b981', // feature branch: Emerald
        git3: '#f59e0b', // release branch: Amber
        git4: '#f43f5e', // hotfix branch: Rose
        gitBranchLabel0: '#0284c7',
        gitBranchLabel1: '#7c3aed',
        gitBranchLabel2: '#059669',
        gitBranchLabel3: '#d97706',
        gitBranchLabel4: '#e11d48',
        tagLabelColor: '#ffffff',
        tagLabelBackground: '#6366f1',
        tagLabelBorder: '#4f46e5',
        commitLabelColor: '#f1f5f9',
        commitLabelBackground: 'transparent',

        // Mindmap (Obsidian organic palette)
        mindmapNode0: '#6366f1', // Central root
        mindmapNode1: '#10b981', // Emerald branch
        mindmapNode2: '#8b5cf6', // Purple branch
        mindmapNode3: '#f59e0b', // Amber branch
        mindmapNode4: '#06b6d4', // Cyan branch
        mindmapNode5: '#ec4899', // Pink branch
        mindmapTextColor: '#ffffff',

        // Gantt Chart (Crisp, High-Contrast Executive styling)
        sectionBkgColor: '#1e293b40',
        altSectionBkgColor: '#0f172a40',
        taskBkgColor: '#2563eb',
        taskBorderColor: '#3b82f6',
        taskTextColor: '#ffffff',
        taskTextOutsideColor: '#f8fafc',
        activeTaskBkgColor: '#059669',
        activeTaskBorderColor: '#10b981',
        activeTaskTextColor: '#ffffff',
        doneTaskBkgColor: '#475569',
        doneTaskBorderColor: '#64748b',
        doneTaskTextColor: '#cbd5e1',
        critBkgColor: '#e11d48',
        critBorderColor: '#f43f5e',
        todayLineColor: '#ef4444',
        gridColor: '#334155',
        titleColor: '#f8fafc',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
      },
      gitGraph: {
        showCommitLabel: true,
        showBranches: true,
        rotateCommitLabel: false,
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
      return `<div class="mermaid-diagram-container my-6 p-4 rounded-2xl bg-theme-surface border border-theme-border shadow-md overflow-hidden select-none" data-diagram-id="${id}" data-diagram-code="${encodeURIComponent(cleanCode)}">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-theme-border/60 text-xs text-theme-muted" dir="ltr">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50"></span>
            <span class="font-semibold text-theme-text font-mono">Mermaid Studio</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button class="diagram-action-btn px-2.5 py-1 rounded-lg hover:bg-theme-bg border border-theme-border/60 text-purple-400 hover:text-purple-300 font-semibold transition-colors text-xs cursor-pointer flex items-center gap-1" data-action="focus-modal" title="فتح في استوديو تفاعلي منفصل بملء الشاشة">
              <span>⛶</span>
              <span class="hidden sm:inline">تكبير وتفاعل</span>
            </button>
            <button class="diagram-action-btn px-2.5 py-1 rounded-lg hover:bg-theme-bg border border-theme-border/60 text-theme-text transition-colors font-mono cursor-pointer" data-action="zoom-in" title="تكبير">+</button>
            <button class="diagram-action-btn px-2.5 py-1 rounded-lg hover:bg-theme-bg border border-theme-border/60 text-theme-text transition-colors font-mono cursor-pointer" data-action="zoom-out" title="تصغير">-</button>
            <button class="diagram-action-btn px-2.5 py-1 rounded-lg hover:bg-theme-bg border border-theme-border/60 text-theme-text transition-colors font-mono cursor-pointer" data-action="reset" title="إعادة ضبط">↺</button>
            <button class="diagram-action-btn px-2.5 py-1 rounded-lg hover:bg-theme-bg border border-theme-border/60 text-theme-accent font-semibold transition-colors font-mono cursor-pointer" data-action="export-svg" title="تصدير SVG">SVG</button>
          </div>
        </div>
        <div id="${id}" class="mermaid-target flex justify-center items-center min-h-[140px] overflow-auto" dir="ltr" style="direction: ltr !important;">
          <div class="animate-pulse text-xs text-theme-muted py-6">جاري رسم المخطط التفاعلي...</div>
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

        const svgElement = target.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.direction = 'ltr';
          svgElement.setAttribute('dir', 'ltr');
          svgElement.setAttribute('font-family', 'Readex Pro, system-ui, sans-serif');

          // Clean up Git Graph commit labels (remove obstructive grey boxes)
          const commitLabelBkgs = svgElement.querySelectorAll('.commit-label-bkg');
          commitLabelBkgs.forEach((bkg) => {
            (bkg as HTMLElement).style.display = 'none';
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error rendering diagram';
        target.innerHTML = `<div class="p-3 text-xs text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/30 font-mono" dir="ltr">
          <div class="font-bold mb-1">Diagram Render Error:</div>
          <div>${errorMsg}</div>
        </div>`;
      }
    }
  }
}
