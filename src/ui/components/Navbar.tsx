import React, { useState, useEffect } from 'react';
import { 
  FolderOpen,
  Palette,
  Globe,
  Maximize,
  Minimize,
  Presentation,
  Activity,
  FolderTree,
  ListTree
} from 'lucide-react';
import { ReadingTheme } from '../../core/types';
import { documentStore } from '../../services/document.store';
import { webAdapter } from '../../adapters/web.adapter';
import { useI18n } from '../hooks/useI18n';
import { FullscreenService } from '../../services/fullscreen.service';
import { ExportFormat } from '../../services/exporters';
import { ExportDropdown } from './navbar/ExportDropdown';
import { ThemeSwitcher } from './navbar/ThemeSwitcher';
import { TabStrip } from './navbar/TabStrip';

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

  const tabs = documentStore.getTabs();
  const activeTab = documentStore.getActiveTab();

  useEffect(() => {
    return FullscreenService.subscribe((active) => {
      setIsFullscreen(active);
    });
  }, []);

  const handleOpenFile = async () => {
    const file = await webAdapter.openFile();
    if (file) {
      documentStore.openTab(file.name, file.path, file.content);
    }
  };

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
              <ExportDropdown
                locale={locale}
                onExportFormat={onExportFormat}
              />
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
          <ThemeSwitcher
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
            t={t}
          />
        </div>
      </div>

      {/* Multi-Tab Navigation Strip */}
      <TabStrip
        tabs={tabs}
        activeTabId={activeTab?.id}
        locale={locale}
        openFileTooltip={t.navbar.openFileTooltip}
        onSelectTab={(id) => documentStore.setActiveTab(id)}
        onCloseTab={(id) => documentStore.closeTab(id)}
        onOpenFile={handleOpenFile}
      />
    </header>
  );
};
