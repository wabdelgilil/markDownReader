export type DiagramStylePreset = 'corporate' | 'minimalist' | 'modern' | 'custom';

export interface CustomDiagramColors {
  processFill: string;
  processStroke: string;
  startEndFill: string;
  startEndStroke: string;
  decisionFill: string;
  decisionStroke: string;
  arrowColor: string;
  textColor: string;
}

export const DEFAULT_CUSTOM_COLORS: CustomDiagramColors = {
  processFill: '#1e3a8a',
  processStroke: '#3b82f6',
  startEndFill: '#059669',
  startEndStroke: '#10b981',
  decisionFill: '#b45309',
  decisionStroke: '#f59e0b',
  arrowColor: '#38bdf8',
  textColor: '#ffffff',
};

/**
 * Diagram Theming Service
 * Manages active diagram style preset and custom user color overrides.
 */
export class DiagramThemeService {
  private static readonly STYLE_STORAGE_KEY = 'md_reader_diagram_style';
  private static readonly CUSTOM_COLORS_STORAGE_KEY = 'md_reader_custom_diagram_colors';
  private static listeners: Array<() => void> = [];

  public static getStylePreset(): DiagramStylePreset {
    if (typeof localStorage === 'undefined') return 'corporate';
    const saved = localStorage.getItem(this.STYLE_STORAGE_KEY) as DiagramStylePreset;
    if (saved && ['corporate', 'minimalist', 'modern', 'custom'].includes(saved)) {
      return saved;
    }
    return 'corporate'; // Default style requested by user
  }

  public static setStylePreset(style: DiagramStylePreset): void {
    localStorage.setItem(this.STYLE_STORAGE_KEY, style);
    this.notify();
  }

  public static getCustomColors(): CustomDiagramColors {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_CUSTOM_COLORS };
    try {
      const saved = localStorage.getItem(this.CUSTOM_COLORS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CUSTOM_COLORS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback on parse error
    }
    return { ...DEFAULT_CUSTOM_COLORS };
  }

  public static setCustomColors(colors: CustomDiagramColors): void {
    localStorage.setItem(this.CUSTOM_COLORS_STORAGE_KEY, JSON.stringify(colors));
    this.notify();
  }

  public static subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying diagram theme listener:', err);
      }
    });
  }
}
