import { useState, useEffect } from 'react';
import { I18nService, AppLocale, TranslationDictionary } from '../../services/i18n.service';

export function useI18n(): {
  locale: AppLocale;
  isRtl: boolean;
  t: TranslationDictionary;
  toggleLocale: () => void;
  setLocale: (locale: AppLocale) => void;
} {
  const [locale, setLocaleState] = useState<AppLocale>(I18nService.getLocale());

  useEffect(() => {
    return I18nService.subscribe((newLocale) => {
      setLocaleState(newLocale);
    });
  }, []);

  return {
    locale,
    isRtl: locale === 'ar',
    t: I18nService.t(),
    toggleLocale: () => I18nService.toggleLocale(),
    setLocale: (newLocale: AppLocale) => I18nService.setLocale(newLocale),
  };
}
