import mermaid from 'mermaid';
import { DiagramDispatcher } from './dispatcher';

/**
 * Universal Diagram Engine with Intelligent Multi-Engine Dispatcher
 * Automatically detects whether to use Markmap (Obsidian), Chart.js, or Mermaid with Visio enhancements.
 */
export class DiagramEngine {
  public static initialize(): void {
    const currentTheme = (typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme')
      : 'dark') || 'dark';

    const isLight = currentTheme === 'light';
    const isSepia = currentTheme === 'sepia';
    const isTerminal = currentTheme === 'terminal';
    const isDark = !isLight && !isSepia;

    const textColor = isTerminal ? '#00ff66' : isLight ? '#0f172a' : isSepia ? '#433422' : '#f8fafc';
    const lineColor = isTerminal ? '#00aa44' : isLight ? '#475569' : isSepia ? '#7d6b53' : '#94a3b8';

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: 'Readex Pro, system-ui, sans-serif',
      suppressErrorRendering: true,
      themeVariables: {
        darkMode: isDark,
        background: 'transparent',
        primaryColor: isLight ? '#2563eb' : isSepia ? '#92400e' : '#3b82f6',
        primaryTextColor: '#ffffff', // For inside colored shapes/buttons
        textColor: textColor,        // For floating labels, notes, message lines
        lineColor: lineColor,
        secondaryColor: '#8b5cf6',
        tertiaryColor: '#10b981',

        // Sequence Diagram specific variables
        actorTextColor: '#ffffff',
        actorLineColor: isLight ? '#cbd5e1' : '#334155',
        signalColor: textColor,
        signalTextColor: textColor,
        labelBoxBkgColor: isLight ? '#f1f5f9' : '#1e293b',
        labelBoxBorderColor: isLight ? '#cbd5e1' : '#475569',
        labelTextColor: textColor,
        loopTextColor: textColor,
        noteTextColor: textColor,

        // Git Graph styling
        git0: '#38bdf8',
        git1: '#a855f7',
        git2: '#10b981',
        git3: '#f59e0b',
        git4: '#f43f5e',
        gitBranchLabel0: '#0284c7',
        gitBranchLabel1: '#7c3aed',
        gitBranchLabel2: '#059669',
        gitBranchLabel3: '#d97706',
        gitBranchLabel4: '#e11d48',
        tagLabelColor: '#ffffff',
        tagLabelBackground: '#6366f1',
        tagLabelBorder: '#4f46e5',
        commitLabelColor: textColor,
        commitLabelBackground: 'transparent',

        // Gantt Chart styling
        sectionBkgColor: isLight ? '#f1f5f9' : '#1e293b40',
        altSectionBkgColor: isLight ? '#ffffff' : '#0f172a40',
        taskBkgColor: '#2563eb',
        taskBorderColor: '#3b82f6',
        taskTextColor: '#ffffff',
        taskTextOutsideColor: textColor,
        activeTaskBkgColor: '#059669',
        activeTaskBorderColor: '#10b981',
        activeTaskTextColor: '#ffffff',
        doneTaskBkgColor: '#475569',
        doneTaskBorderColor: '#64748b',
        doneTaskTextColor: '#f8fafc',
        critBkgColor: '#e11d48',
        critBorderColor: '#f43f5e',
        todayLineColor: '#ef4444',
        gridColor: isLight ? '#e2e8f0' : '#334155',
        titleColor: textColor,
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
      },
      sequence: {
        showSequenceNumbers: true,
        actorMargin: 50,
      },
      gitGraph: {
        showCommitLabel: true,
        showBranches: true,
        rotateCommitLabel: true,
      },
    });
  }

  /**
   * Pre-processes Markdown content to extract diagram blocks into interactive placeholders.
   */
  public static extractPlaceholders(content: string): {
    content: string;
    diagrams: Map<string, string>;
  } {
    const diagrams = new Map<string, string>();
    let index = 0;

    const transformed = content.replace(/```(mermaid|markmap|chart)([\s\S]*?)```/g, (_match, _lang, code) => {
      const id = `diagram-canvas-${index++}`;
      const cleanCode = code.trim();
      diagrams.set(id, cleanCode);

      // Intelligent classification
      const classification = DiagramDispatcher.classify(cleanCode);

      return `<div class="mermaid-diagram-container my-6 p-4 rounded-2xl bg-theme-surface border border-theme-border shadow-md overflow-hidden select-none" data-diagram-id="${id}" data-diagram-code="${encodeURIComponent(cleanCode)}">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-theme-border/60 text-xs text-theme-muted" dir="ltr">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${classification.accentColor}; box-shadow: 0 0 8px ${classification.accentColor}80;"></span>
            <span class="font-semibold text-theme-text font-mono">${classification.badge}</span>
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
          <div class="animate-pulse text-xs text-theme-muted py-6">جاري تشغيل المحرك المتخصص للمخطط...</div>
        </div>
      </div>`;
    });

    return { content: transformed, diagrams };
  }

  /**
   * Client-side rendering of all diagram placeholders using their specialized native engines.
   */
  public static async renderDiagrams(
    container: HTMLElement,
    diagrams: Map<string, string>
  ): Promise<void> {
    this.initialize();

    for (const [id, code] of diagrams.entries()) {
      const target = container.querySelector(`#${id}`) as HTMLElement;
      if (!target) continue;
      await DiagramDispatcher.render(target, id, code);
    }
  }
}
