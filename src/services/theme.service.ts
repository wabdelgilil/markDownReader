import { ReadingTheme } from '../core/types';

export class ThemeService {
  private static readonly STORAGE_KEY = 'md_reader_theme';

  public static getTheme(): ReadingTheme {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'terminal' || saved === 'editor') {
      return 'editor';
    }
    if (saved && ['light', 'dark', 'sepia', 'editor'].includes(saved)) {
      return saved as ReadingTheme;
    }
    return 'dark'; // Default theme
  }

  public static setTheme(theme: ReadingTheme): void {
    localStorage.setItem(this.STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  public static initialize(): ReadingTheme {
    const theme = this.getTheme();
    this.setTheme(theme);
    return theme;
  }
}
