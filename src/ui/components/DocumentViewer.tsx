import React, { useEffect, useRef } from 'react';
import { ParsedDocument, ReadingTheme } from '../../core/types';
import { DiagramEngine } from '../../core/diagrams/mermaid';
import { FileQuestion, FolderOpen, BookOpen } from 'lucide-react';
import { documentStore } from '../../services/document.store';
import { webAdapter } from '../../adapters/web.adapter';
import { useI18n } from '../hooks/useI18n';

interface DocumentViewerProps {
  document: ParsedDocument | null;
  diagrams: Map<string, string>;
  theme?: ReadingTheme;
  diagramStyleVersion?: number;
  onLoadSample: () => void;
  onFocusDiagram?: (svgHtml: string, rawCode: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  diagrams,
  theme,
  diagramStyleVersion,
  onLoadSample,
  onFocusDiagram,
}) => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger Mermaid SVG rendering whenever the document, diagrams, theme, or diagram style change
  useEffect(() => {
    if (containerRef.current && diagrams.size > 0) {
      DiagramEngine.renderDiagrams(containerRef.current, diagrams);
    }
  }, [document?.html, diagrams, theme, diagramStyleVersion]);

  // Enable smooth mouse drag-to-pan on all inline diagram targets
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;
    let activeTarget: HTMLElement | null = null;

    const onMouseDown = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.mermaid-target') as HTMLElement;
      if (!target || (e.target as HTMLElement).closest('.diagram-action-btn')) return;
      isDown = true;
      activeTarget = target;
      target.style.cursor = 'grabbing';
      startX = e.pageX - target.offsetLeft;
      startY = e.pageY - target.offsetTop;
      scrollLeft = target.scrollLeft;
      scrollTop = target.scrollTop;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown || !activeTarget) return;
      e.preventDefault();
      const x = e.pageX - activeTarget.offsetLeft;
      const y = e.pageY - activeTarget.offsetTop;
      const walkX = (x - startX) * 1.2;
      const walkY = (y - startY) * 1.2;
      activeTarget.scrollLeft = scrollLeft - walkX;
      activeTarget.scrollTop = scrollTop - walkY;
    };

    const onMouseUp = () => {
      if (activeTarget) {
        activeTarget.style.cursor = 'grab';
      }
      isDown = false;
      activeTarget = null;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [document?.html]);

  // Handle Diagram Zoom, SVG Export, and Notion Code Copy Buttons via event delegation
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Check for Code Copy Button
    const copyBtn = (e.target as HTMLElement).closest('.copy-code-btn') as HTMLElement;
    if (copyBtn) {
      const encodedCode = copyBtn.getAttribute('data-code');
      if (encodedCode) {
        const rawCode = decodeURIComponent(encodedCode);
        navigator.clipboard.writeText(rawCode).then(() => {
          const btnText = copyBtn.querySelector('.btn-text');
          if (btnText) {
            const originalText = btnText.textContent;
            btnText.textContent = 'تم النسخ! ✓';
            copyBtn.classList.add('text-emerald-400', 'border-emerald-500/50');
            setTimeout(() => {
              btnText.textContent = originalText;
              copyBtn.classList.remove('text-emerald-400', 'border-emerald-500/50');
            }, 2000);
          }
        });
      }
      return;
    }

    // 2. Check for Diagram Zoom & Export Buttons
    const target = (e.target as HTMLElement).closest('.diagram-action-btn') as HTMLElement;
    if (!target) return;

    const action = target.getAttribute('data-action');
    const container = target.closest('.mermaid-diagram-container');
    const svgTarget = container?.querySelector('.mermaid-target svg') as SVGElement;
    if (!svgTarget) return;

    if (action === 'focus-modal') {
      const encodedRaw = container?.getAttribute('data-diagram-code') || '';
      const rawCode = decodeURIComponent(encodedRaw);
      onFocusDiagram?.(svgTarget.outerHTML, rawCode);
      return;
    }

    const currentScale = parseFloat(svgTarget.getAttribute('data-scale') || '1');

    if (action === 'zoom-in') {
      const nextScale = Math.min(currentScale + 0.2, 3);
      svgTarget.style.transform = `scale(${nextScale})`;
      svgTarget.style.transformOrigin = 'center top';
      svgTarget.setAttribute('data-scale', nextScale.toString());
    } else if (action === 'zoom-out') {
      const nextScale = Math.max(currentScale - 0.2, 0.5);
      svgTarget.style.transform = `scale(${nextScale})`;
      svgTarget.style.transformOrigin = 'center top';
      svgTarget.setAttribute('data-scale', nextScale.toString());
    } else if (action === 'reset') {
      svgTarget.style.transform = 'scale(1)';
      svgTarget.setAttribute('data-scale', '1');
    } else if (action === 'export-svg') {
      const svgData = new XMLSerializer().serializeToString(svgTarget);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `diagram-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-theme-surface border border-theme-border flex items-center justify-center text-theme-accent mb-4 shadow-sm">
          <FileQuestion className="w-8 h-8 opacity-80" />
        </div>
        <h2 className="text-xl font-bold text-theme-text mb-2">{t.viewer.emptyTitle}</h2>
        <p className="text-sm text-theme-muted max-w-md mb-6 leading-relaxed">
          {t.viewer.emptySubtitle}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const file = await webAdapter.openFile();
              if (file) {
                documentStore.openTab(file.name, file.path, file.content);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-accent text-white hover:bg-theme-accent-hover font-medium text-xs transition-colors shadow-sm cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>{t.viewer.openFileBtn}</span>
          </button>
          <button
            onClick={onLoadSample}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-surface border border-theme-border hover:bg-theme-border/60 text-theme-text font-medium text-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-theme-accent" />
            <span>{t.viewer.loadSampleBtn}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      id="document-scroll-container"
      className="flex-1 h-full overflow-y-auto px-6 py-8 flex justify-center"
    >
      <article
        ref={containerRef}
        onClick={handleContainerClick}
        className="max-w-4xl w-full text-theme-text leading-relaxed font-sans text-sm md:text-base space-y-4"
        dangerouslySetInnerHTML={{ __html: document.html }}
      />
    </main>
  );
};
