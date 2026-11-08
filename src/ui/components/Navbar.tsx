import React from 'react';
import { 
  FileText, 
  Plus, 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  Terminal, 
  Presentation, 
  Activity, 
  Download,
  FolderOpen
} from 'lucide-react';
import { ReadingTheme } from '../../core/types';
import { documentStore } from '../../services/document.store';
import { webAdapter } from '../../adapters/web.adapter';

interface NavbarProps {
  currentTheme: ReadingTheme;
  onThemeChange: (theme: ReadingTheme) => void;
  onTogglePresentation: () => void;
  onToggleDiagnostics: () => void;
  onExportHtml: () => void;
  hasOpenTabs: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  onThemeChange,
  onTogglePresentation,
  onToggleDiagnostics,
  onExportHtml,
  hasOpenTabs,
}) => {
  const tabs = documentStore.getTabs();
  const activeTab = documentStore.getActiveTab();

  const handleOpenFile = async () => {
    const file = await webAdapter.openFile();
    if (file) {
      documentStore.openTab(file.name, file.path, file.content);
    }
  };

  const themeOptions: { id: ReadingTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'فاتح', icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', label: 'داكن', icon: <Moon className="w-4 h-4" /> },
    { id: 'sepia', label: 'ورقي', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'terminal', label: 'طرفية', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <header className="flex flex-col border-b border-theme-border bg-theme-surface select-none sticky top-0 z-40">
      {/* Top Main Bar */}
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-theme-accent/15 text-theme-accent flex items-center justify-center font-bold text-lg border border-theme-accent/30">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide text-theme-text flex items-center gap-1.5">
              MarkDownReader
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-theme-accent/10 text-theme-accent font-mono">v1.0</span>
            </span>
            <span className="text-[11px] text-theme-muted hidden sm:inline">محطة قراءة وتوثيق تقنية متطورة</span>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Open File Button */}
          <button
            onClick={handleOpenFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors"
            title="فتح ملف جديد (Ctrl+O)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-theme-accent" />
            <span className="hidden md:inline">فتح ملف</span>
          </button>

          {hasOpenTabs && (
            <>
              {/* Presentation Mode */}
              <button
                onClick={onTogglePresentation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors"
                title="عرض تقديمي (Slide Deck)"
              >
                <Presentation className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">عرض شرائح</span>
              </button>

              {/* Health Diagnostics */}
              <button
                onClick={onToggleDiagnostics}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors"
                title="فاحص صحة المستند"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">صحة المستند</span>
              </button>

              {/* Single File Export */}
              <button
                onClick={onExportHtml}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors"
                title="تصدير ملف HTML مستقل بذاته"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">تصدير HTML</span>
              </button>
            </>
          )}

          {/* Theme Selector Menu */}
          <div className="flex items-center rounded-lg p-0.5 bg-theme-bg border border-theme-border mr-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onThemeChange(opt.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  currentTheme === opt.id
                    ? 'bg-theme-accent text-white shadow-sm'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
                title={opt.label}
              >
                {opt.icon}
                <span className="hidden lg:inline text-[11px]">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Tab Navigation Strip */}
      <div className="flex items-center overflow-x-auto bg-theme-bg/60 border-t border-theme-border/50 px-2 pt-1 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab?.id === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => documentStore.setActiveTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer border-t border-x transition-colors max-w-[200px] shrink-0 ${
                isActive
                  ? 'bg-theme-surface border-theme-border text-theme-text font-semibold border-b-transparent shadow-sm'
                  : 'bg-transparent border-transparent text-theme-muted hover:bg-theme-surface/50 hover:text-theme-text'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-theme-accent' : 'text-theme-muted'}`} />
              <span className="truncate">{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  documentStore.closeTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-theme-border/80 p-0.5 rounded transition-opacity"
                title="إغلاق التبويب"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Plus Tab Button */}
        <button
          onClick={handleOpenFile}
          className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface/60 transition-colors ml-1"
          title="فتح تبويب جديد"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
