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

    const textColor = isTerminal ? '#00ff66' : isLight ? '#18181b' : isSepia ? '#2c2217' : '#f4f4f5';
    const lineColor = isTerminal ? '#00aa44' : isLight ? '#71717a' : isSepia ? '#786b59' : '#a1a1aa';

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: 'Readex Pro, system-ui, sans-serif',
      suppressErrorRendering: true,
      themeVariables: {
        darkMode: isDark,
        background: 'transparent',
        primaryColor: isLight ? '#4f46e5' : isSepia ? '#9a4316' : '#6366f1',
        primaryTextColor: '#ffffff', // For inside colored shapes/buttons
        textColor: textColor,        // For floating labels, notes, message lines
        lineColor: lineColor,
        secondaryColor: '#0d9488',
        tertiaryColor: '#d97706',

        // Sequence Diagram specific variables
        actorTextColor: '#ffffff',
        actorLineColor: isLight ? '#e4e4e7' : isSepia ? '#ded5c2' : '#27272a',
        signalColor: textColor,
        signalTextColor: textColor,
        labelBoxBkgColor: isLight ? '#ffffff' : isSepia ? '#f0ead9' : '#18181b',
        labelBoxBorderColor: isLight ? '#e4e4e7' : isSepia ? '#ded5c2' : '#27272a',
        labelTextColor: textColor,
        loopTextColor: textColor,
        noteTextColor: textColor,

        // Git Graph styling
        git0: '#6366f1',
        git1: '#0d9488',
        git2: '#d97706',
        git3: '#7c3aed',
        git4: '#e11d48',
        gitBranchLabel0: '#4f46e5',
        gitBranchLabel1: '#0f766e',
        gitBranchLabel2: '#b45309',
        gitBranchLabel3: '#6d28d9',
        gitBranchLabel4: '#be123c',
        tagLabelColor: '#ffffff',
        tagLabelBackground: '#4f46e5',
        tagLabelBorder: '#4338ca',
        commitLabelColor: textColor,
        commitLabelBackground: 'transparent',

        // Gantt Chart styling
        sectionBkgColor: isLight ? '#f4f4f5' : isSepia ? '#f0ead9' : '#121215',
        altSectionBkgColor: isLight ? '#ffffff' : isSepia ? '#f7f3e9' : '#09090b',
        taskBkgColor: isLight ? '#4f46e5' : isSepia ? '#9a4316' : '#6366f1',
        taskBorderColor: isLight ? '#4338ca' : isSepia ? '#7c3412' : '#818cf8',
        taskTextColor: '#ffffff',
        taskTextOutsideColor: textColor,
        activeTaskBkgColor: '#0d9488',
        activeTaskBorderColor: '#14b8a6',
        activeTaskTextColor: '#ffffff',
        doneTaskBkgColor: '#71717a',
        doneTaskBorderColor: '#a1a1aa',
        doneTaskTextColor: '#f4f4f5',
        critBkgColor: '#e11d48',
        critBorderColor: '#fb7185',
        todayLineColor: '#e11d48',
        gridColor: isLight ? '#e4e4e7' : isSepia ? '#ded5c2' : '#27272a',
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
