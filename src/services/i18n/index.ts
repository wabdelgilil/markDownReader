import { AppLocale, TranslationDictionary } from './types';
import { ar } from './locales/ar';
import { en } from './locales/en';

export * from './types';

const translations: Record<AppLocale, TranslationDictionary> = {
  ar,
  en,
};

export class I18nService {
  private static readonly STORAGE_KEY = 'md_reader_locale';
  private static currentLocale: AppLocale = 'ar';
  private static listeners: Set<(locale: AppLocale) => void> = new Set();

  public static initialize(): AppLocale {
    const saved = localStorage.getItem(this.STORAGE_KEY) as AppLocale;
    const locale: AppLocale = saved === 'en' || saved === 'ar' ? saved : 'ar';
    this.setLocale(locale);
    return locale;
  }

  public static getLocale(): AppLocale {
    return this.currentLocale;
  }

  public static setLocale(locale: AppLocale): void {
    this.currentLocale = locale;
    localStorage.setItem(this.STORAGE_KEY, locale);

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale);
      document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    }

    this.listeners.forEach((listener) => listener(locale));
  }

  public static toggleLocale(): AppLocale {
    const nextLocale: AppLocale = this.currentLocale === 'ar' ? 'en' : 'ar';
    this.setLocale(nextLocale);
    return nextLocale;
  }

  public static t(): TranslationDictionary {
    return translations[this.currentLocale];
  }

  public static subscribe(listener: (locale: AppLocale) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
