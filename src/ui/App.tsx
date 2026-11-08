import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DynamicOutline } from './components/DynamicOutline';
import { DocumentViewer } from './components/DocumentViewer';
import { DiagnosticsDrawer } from './components/DiagnosticsDrawer';
import { PresentationView } from './components/PresentationView';
import { DiagramModal } from './components/DiagramModal';
import { DiagramThemeModal } from './components/DiagramThemeModal';
import { WorkspaceTree } from './components/WorkspaceTree';
import { FileDropOverlay } from './components/FileDropOverlay';
import { ThemeService } from '../services/theme.service';
import { I18nService } from '../services/i18n.service';
import { FullscreenService } from '../services/fullscreen.service';
import { documentStore } from '../services/document.store';
import { ExportDispatcher, ExportFormat } from '../services/exporters';
import { SAMPLE_MARKDOWN } from '../core/sample';
import { ReadingTheme } from '../core/types';
import { ListTree } from 'lucide-react';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ReadingTheme>('dark');
  const [activeTab, setActiveTab] = useState(documentStore.getActiveTab());
  const [showPresentation, setShowPresentation] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showDiagramThemes, setShowDiagramThemes] = useState(false);
  const [showWorkspaceTree, setShowWorkspaceTree] = useState(false);
  const [showOutline, setShowOutline] = useState<boolean>(() => {
    try {
      return localStorage.getItem('markdown_reader_show_outline') !== 'false';
    } catch {
      return true;
    }
  });
  const [diagramStyleVersion, setDiagramStyleVersion] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string | undefined>();
  const [focusedDiagram, setFocusedDiagram] = useState<{ svgHtml: string; rawCode: string } | null>(null);

  // Initialize theme and language on mount
  useEffect(() => {
    const initialTheme = ThemeService.initialize();
    setTheme(initialTheme);
    I18nService.initialize();
  }, []);

  // Subscribe to document store changes
  useEffect(() => {
    const unsubscribe = documentStore.subscribe(() => {
      setActiveTab(documentStore.getActiveTab());
    });
    return unsubscribe;
  }, []);

  const handleToggleOutline = () => {
    setShowOutline((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('markdown_reader_show_outline', String(next));
      } catch {
        // Fallback for isolated storage contexts
      }
      return next;
    });
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        FullscreenService.toggleFullscreen();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'b' || (e.shiftKey && e.key.toLowerCase() === 'o'))) {
        e.preventDefault();
        handleToggleOutline();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTab) {
          documentStore.closeTab(activeTab.id);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (activeTab) {
          setShowPresentation((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Smart Scrollspy: Automatically tracks active heading as user scrolls
  useEffect(() => {
    if (!activeTab?.parsed) return;

    const scrollContainer = document.getElementById('document-scroll-container');
    if (!scrollContainer) return;

    const headingElements = scrollContainer.querySelectorAll('h1, h2, h3, h4');
    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      {
        root: scrollContainer,
        rootMargin: '-10% 0px -75% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab?.id, activeTab?.parsed]);

  const handleThemeChange = (newTheme: ReadingTheme) => {
    setTheme(newTheme);
    ThemeService.setTheme(newTheme);
  };

  const handleLoadSample = () => {
    documentStore.openTab('دليل_المحطة_التقني.md', 'sample://guide.md', SAMPLE_MARKDOWN);
  };

  const handleExportFormat = (format: ExportFormat) => {
    if (activeTab?.parsed) {
      ExportDispatcher.export(format, activeTab.parsed, {
        filename: activeTab.name,
        theme,
        locale: I18nService.getLocale(),
        diagrams: documentStore.getActiveDiagrams(),
      });
    }
  };

  const handleSelectHeading = (id: string) => {
    setActiveHeadingId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-theme-bg text-theme-text">
      {/* Top Navbar with Multi-Tab Strip */}
      <Navbar
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        onTogglePresentation={() => setShowPresentation(true)}
        onToggleDiagnostics={() => setShowDiagnostics((prev) => !prev)}
        onExportFormat={handleExportFormat}
        onOpenDiagramThemes={() => setShowDiagramThemes(true)}
        onToggleWorkspace={() => setShowWorkspaceTree((prev) => !prev)}
        onToggleOutline={handleToggleOutline}
        hasOpenTabs={activeTab !== null}
        hasOpenWorkspace={showWorkspaceTree}
        hasOpenOutline={showOutline}
        headingsCount={activeTab?.parsed?.headings.length}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Workspace Directory Tree Explorer */}
        {showWorkspaceTree && (
          <WorkspaceTree onClose={() => setShowWorkspaceTree(false)} />
        )}

        {/* Dynamic Table of Contents (Outline) */}
        {showOutline && activeTab?.parsed && (
          <DynamicOutline
            headings={activeTab.parsed.headings}
            activeHeadingId={activeHeadingId}
            onSelectHeading={handleSelectHeading}
            onClose={() => setShowOutline(false)}
          />
        )}

        {/* Floating Quick-Expand Edge Trigger */}
        {!showOutline && activeTab?.parsed && activeTab.parsed.headings.length > 0 && (
          <button
            onClick={handleToggleOutline}
            className={`absolute top-3 ${I18nService.getLocale() === 'ar' ? 'right-3' : 'left-3'} z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-theme-surface/90 hover:bg-theme-surface border border-theme-border shadow-md backdrop-blur-xs text-xs font-medium text-theme-text hover:text-theme-accent transition-all cursor-pointer`}
            title={`${I18nService.getLocale() === 'ar' ? 'إظهار فهرس المحتويات' : 'Show Table of Contents'} (Ctrl+B)`}
          >
            <ListTree className="w-3.5 h-3.5 text-theme-accent" />
            <span className="hidden sm:inline text-[11px]">{I18nService.getLocale() === 'ar' ? 'الفهرس' : 'Outline'}</span>
            <span className="text-[10px] px-1 rounded bg-theme-bg text-theme-muted font-mono border border-theme-border/60">
              {activeTab.parsed.headings.length}
            </span>
          </button>
        )}

        {/* Central Markdown Render View */}
        <DocumentViewer
          document={activeTab?.parsed || null}
          diagrams={documentStore.getActiveDiagrams()}
          theme={theme}
          diagramStyleVersion={diagramStyleVersion}
          onLoadSample={handleLoadSample}
          onFocusDiagram={(svgHtml, rawCode) => setFocusedDiagram({ svgHtml, rawCode })}
        />
      </div>

      {/* Global Drag-and-Drop Dropzone Overlay */}
      <FileDropOverlay />

      {/* Diagram Theming & Custom Palette Modal */}
      <DiagramThemeModal
        isOpen={showDiagramThemes}
        onClose={() => setShowDiagramThemes(false)}
        onThemeChanged={() => setDiagramStyleVersion((v) => v + 1)}
      />

      {/* Fullscreen Interactive Diagram Studio Modal */}
      {focusedDiagram && (
        <DiagramModal
          isOpen={true}
          onClose={() => setFocusedDiagram(null)}
          svgHtml={focusedDiagram.svgHtml}
          rawCode={focusedDiagram.rawCode}
        />
      )}

      {/* Health Inspector Drawer */}
      {activeTab?.parsed && (
        <DiagnosticsDrawer
          isOpen={showDiagnostics}
          onClose={() => setShowDiagnostics(false)}
          stats={activeTab.parsed.stats}
          diagnostics={activeTab.parsed.diagnostics}
        />
      )}

      {/* Instant Presentation Slide Deck */}
      {showPresentation && activeTab && (
        <PresentationView
          rawMarkdown={activeTab.content}
          onClose={() => setShowPresentation(false)}
        />
      )}
    </div>
  );
};
