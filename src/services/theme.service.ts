import { ReadingTheme } from '../core/types';

export class ThemeService {
  private static readonly STORAGE_KEY = 'md_reader_theme';

  public static getTheme(): ReadingTheme {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ReadingTheme;
    if (saved && ['light', 'dark', 'sepia', 'terminal'].includes(saved)) {
      return saved;
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
