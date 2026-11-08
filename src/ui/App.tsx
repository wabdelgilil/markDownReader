import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DynamicOutline } from './components/DynamicOutline';
import { DocumentViewer } from './components/DocumentViewer';
import { DiagnosticsDrawer } from './components/DiagnosticsDrawer';
import { PresentationView } from './components/PresentationView';
import { DiagramModal } from './components/DiagramModal';
import { ThemeService } from '../services/theme.service';
import { documentStore } from '../services/document.store';
import { HtmlExporterService } from '../services/exporter.service';
import { SAMPLE_MARKDOWN } from '../core/sample';
import { ReadingTheme } from '../core/types';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ReadingTheme>('dark');
  const [activeTab, setActiveTab] = useState(documentStore.getActiveTab());
  const [showPresentation, setShowPresentation] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | undefined>();
  const [focusedDiagram, setFocusedDiagram] = useState<{ svgHtml: string; rawCode: string } | null>(null);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = ThemeService.initialize();
    setTheme(initialTheme);
  }, []);

  // Subscribe to document store changes
  useEffect(() => {
    const unsubscribe = documentStore.subscribe(() => {
      setActiveTab(documentStore.getActiveTab());
    });
    return unsubscribe;
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
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

  const handleExportHtml = () => {
    if (activeTab?.parsed) {
      HtmlExporterService.exportSingleFileHtml(
        activeTab.parsed,
        theme,
        documentStore.getActiveDiagrams()
      );
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
    <div className={`h-screen max-h-screen overflow-hidden flex flex-col bg-theme-bg text-theme-text ${theme === 'terminal' ? 'terminal-scanline' : ''}`}>
      {/* Top Navbar with Multi-Tab Strip */}
      <Navbar
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        onTogglePresentation={() => setShowPresentation(true)}
        onToggleDiagnostics={() => setShowDiagnostics((prev) => !prev)}
        onExportHtml={handleExportHtml}
        hasOpenTabs={activeTab !== null}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Table of Contents (Outline) */}
        {activeTab?.parsed && (
          <DynamicOutline
            headings={activeTab.parsed.headings}
            activeHeadingId={activeHeadingId}
            onSelectHeading={handleSelectHeading}
          />
        )}

        {/* Central Markdown Render View */}
        <DocumentViewer
          document={activeTab?.parsed || null}
          diagrams={documentStore.getActiveDiagrams()}
          onLoadSample={handleLoadSample}
          onFocusDiagram={(svgHtml, rawCode) => setFocusedDiagram({ svgHtml, rawCode })}
        />
      </div>

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
