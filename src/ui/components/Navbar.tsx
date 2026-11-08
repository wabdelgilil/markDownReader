import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  Code2, 
  Presentation, 
  Activity, 
  Download,
  FolderOpen,
  Palette,
  Globe,
  Maximize,
  Minimize,
  FileCode,
  FileType,
  Printer,
  FolderTree,
  ListTree
} from 'lucide-react';
import { ReadingTheme } from '../../core/types';
import { documentStore } from '../../services/document.store';
import { webAdapter } from '../../adapters/web.adapter';
import { useI18n } from '../hooks/useI18n';
import { FullscreenService } from '../../services/fullscreen.service';
import { ExportFormat } from '../../services/exporters';

interface NavbarProps {
  currentTheme: ReadingTheme;
  onThemeChange: (theme: ReadingTheme) => void;
  onTogglePresentation: () => void;
  onToggleDiagnostics: () => void;
  onExportFormat: (format: ExportFormat) => void;
  onOpenDiagramThemes: () => void;
  onToggleWorkspace?: () => void;
  onToggleOutline?: () => void;
  hasOpenTabs: boolean;
  hasOpenWorkspace?: boolean;
  hasOpenOutline?: boolean;
  headingsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  onThemeChange,
  onTogglePresentation,
  onToggleDiagnostics,
  onExportFormat,
  onOpenDiagramThemes,
  onToggleWorkspace,
  onToggleOutline,
  hasOpenTabs,
  hasOpenWorkspace,
  hasOpenOutline,
  headingsCount,
}) => {
  const { t, locale, toggleLocale } = useI18n();
  const [isFullscreen, setIsFullscreen] = useState(FullscreenService.isFullscreen());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const tabs = documentStore.getTabs();
  const activeTab = documentStore.getActiveTab();

  useEffect(() => {
    return FullscreenService.subscribe((active) => {
      setIsFullscreen(active);
    });
  }, []);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenFile = async () => {
    const file = await webAdapter.openFile();
    if (file) {
      documentStore.openTab(file.name, file.path, file.content);
    }
  };

  const themeOptions: { id: ReadingTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: t.navbar.themes.light, icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', label: t.navbar.themes.dark, icon: <Moon className="w-4 h-4" /> },
    { id: 'sepia', label: t.navbar.themes.sepia, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'editor', label: t.navbar.themes.editor, icon: <Code2 className="w-4 h-4" /> },
  ];

  const exportOptions: { id: ExportFormat; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'html',
      title: locale === 'ar' ? 'ملف HTML مدمج' : 'Standalone HTML',
      subtitle: locale === 'ar' ? 'ملف مستقل يعمل بدون إنترنت' : 'Self-contained offline bundle',
      icon: <Download className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'pdf',
      title: locale === 'ar' ? 'مستند PDF فائق الدقة' : 'Print-Ready Vector PDF',
      subtitle: locale === 'ar' ? 'رسوم متجهة، تنسيق A4 وترقيم صفحات' : 'Scalable vectors, A4 pagination & math',
      icon: <Printer className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'docx',
      title: locale === 'ar' ? 'مستند Word أصلي (DOCX)' : 'Native Microsoft Word (DOCX)',
      subtitle: locale === 'ar' ? 'معادلات OMML ومخططات أشكال وورد قابلة للتعديل' : 'Native OMML equations & editable Word shapes',
      icon: <FileType className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'markdown',
      title: locale === 'ar' ? 'ملف Markdown مصدري' : 'Raw Markdown (.md)',
      subtitle: locale === 'ar' ? 'النص الأصلي للمستند' : 'Plain text source file',
      icon: <FileCode className="w-4 h-4 text-emerald-400" />,
    },
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
            <span className="font-bold text-sm tracking-wide text-theme-text">
              {t.brand.title}
            </span>
            <span className="text-[11px] text-theme-muted hidden sm:inline">{t.brand.tagline}</span>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Open File Button */}
          <button
            onClick={handleOpenFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors cursor-pointer"
            title={t.navbar.openFileTooltip}
          >
            <FolderOpen className="w-3.5 h-3.5 text-theme-accent" />
            <span className="hidden md:inline">{t.navbar.openFile}</span>
          </button>

          {/* Workspace Folder Tree Button */}
          <button
            onClick={onToggleWorkspace}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              hasOpenWorkspace
                ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/40 font-semibold'
                : 'bg-theme-bg hover:bg-theme-border/60 text-theme-text border-theme-border'
            }`}
            title={locale === 'ar' ? 'استعراض شجرة المجلدات ومساحة العمل' : 'Workspace Folder Tree Explorer'}
          >
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{locale === 'ar' ? 'المجلد' : 'Folder'}</span>
          </button>

          {/* Table of Contents (Outline) Toggle Button */}
          {hasOpenTabs && (
            <button
              onClick={onToggleOutline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                hasOpenOutline
                  ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/40 font-semibold'
                  : 'bg-theme-bg hover:bg-theme-border/60 text-theme-text border-theme-border'
              }`}
              title={`${hasOpenOutline ? t.outline.collapse : t.outline.expand} (Ctrl+B)`}
            >
              <ListTree className="w-3.5 h-3.5 text-theme-accent" />
              <span className="hidden md:inline">{t.outline.title}</span>
              {headingsCount !== undefined && headingsCount > 0 && (
                <span className="text-[10px] px-1 rounded bg-theme-surface text-theme-muted font-mono border border-theme-border/60">
                  {headingsCount}
                </span>
              )}
            </button>
          )}

          {hasOpenTabs && (
            <>
              {/* Fullscreen Reading Mode Toggle */}
              <button
                onClick={() => FullscreenService.toggleFullscreen()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isFullscreen
                    ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/40 font-semibold'
                    : 'bg-theme-bg hover:bg-theme-border/60 text-theme-text border-theme-border'
                }`}
                title={isFullscreen ? (locale === 'ar' ? 'إنهاء ملء الشاشة (F11)' : 'Exit Fullscreen (F11)') : (locale === 'ar' ? 'ملء الشاشة للقراءة (F11)' : 'Fullscreen Reading Mode (F11)')}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">
                  {isFullscreen ? (locale === 'ar' ? 'إنهاء الشاشة' : 'Exit Fullscreen') : (locale === 'ar' ? 'ملء الشاشة' : 'Fullscreen')}
                </span>
              </button>

              {/* Presentation Mode */}
              <button
                onClick={onTogglePresentation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors cursor-pointer"
                title={t.navbar.slideDeckTooltip}
              >
                <Presentation className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">{t.navbar.slideDeck}</span>
              </button>

              {/* Health Diagnostics */}
              <button
                onClick={onToggleDiagnostics}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors cursor-pointer"
                title={t.navbar.diagnosticsTooltip}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">{t.navbar.diagnostics}</span>
              </button>

              {/* Multi-Format Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors cursor-pointer"
                  title={locale === 'ar' ? 'تصدير المستند بصيغ متعددة' : 'Export document in various formats'}
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden md:inline">{locale === 'ar' ? 'تصدير' : 'Export'}</span>
                </button>

                {showExportMenu && (
                  <div className={`absolute top-full mt-1.5 ${locale === 'ar' ? 'left-0' : 'right-0'} w-64 bg-theme-surface border border-theme-border rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100`}>
                    <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-theme-muted border-b border-theme-border/60 mb-1">
                      {locale === 'ar' ? 'صيغ التصدير المتاحة' : 'Available Export Formats'}
                    </div>
                    {exportOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setShowExportMenu(false);
                          onExportFormat(opt.id);
                        }}
                        className="w-full flex items-start gap-2.5 px-3 py-2 text-start hover:bg-theme-bg text-theme-text transition-colors cursor-pointer"
                      >
                        <div className="mt-0.5 p-1 rounded bg-theme-bg border border-theme-border/60">
                          {opt.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{opt.title}</span>
                          <span className="text-[10px] text-theme-muted">{opt.subtitle}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Diagram Theming Customizer Button */}
          <button
            onClick={onOpenDiagramThemes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors cursor-pointer"
            title={t.navbar.diagramThemesTooltip}
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{t.navbar.diagramThemes}</span>
          </button>

          {/* Language Switcher Pill */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors cursor-pointer"
            title={locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-theme-accent" />
            <span className="font-mono text-[11px]">{t.navbar.languageToggle}</span>
          </button>

          {/* Theme Selector Menu */}
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
                className="opacity-0 group-hover:opacity-100 hover:bg-theme-border/80 p-0.5 rounded transition-opacity cursor-pointer"
                title={locale === 'ar' ? 'إغلاق التبويب' : 'Close Tab'}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Plus Tab Button */}
        <button
          onClick={handleOpenFile}
          className="p-1 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-surface/60 transition-colors ml-1 cursor-pointer"
          title={t.navbar.openFileTooltip}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
