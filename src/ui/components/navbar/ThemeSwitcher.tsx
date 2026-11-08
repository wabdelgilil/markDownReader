import React from 'react';
import { Sun, Moon, BookOpen, Code2 } from 'lucide-react';
import { ReadingTheme } from '../../../core/types';
import { TranslationDictionary } from '../../../services/i18n';

interface ThemeSwitcherProps {
  currentTheme: ReadingTheme;
  onThemeChange: (theme: ReadingTheme) => void;
  t: TranslationDictionary;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
  t,
}) => {
  const themeOptions: { id: ReadingTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: t.navbar.themes.light, icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', label: t.navbar.themes.dark, icon: <Moon className="w-4 h-4" /> },
    { id: 'sepia', label: t.navbar.themes.sepia, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'editor', label: t.navbar.themes.editor, icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center rounded-lg p-0.5 bg-theme-bg border border-theme-border">
      {themeOptions.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onThemeChange(opt.id)}
          className={`flex items-center justify-center p-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            currentTheme === opt.id
              ? 'bg-theme-surface text-theme-accent shadow-xs border border-theme-border/80 font-semibold'
              : 'text-theme-muted hover:text-theme-text'
          }`}
          title={opt.label}
          aria-label={opt.label}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
};
