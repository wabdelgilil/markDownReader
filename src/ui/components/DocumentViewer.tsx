import React, { useEffect, useRef } from 'react';
import { ParsedDocument, ReadingTheme } from '../../core/types';
import { DiagramEngine } from '../../core/diagrams/mermaid';
import { FileQuestion, FolderOpen, Sparkles } from 'lucide-react';
import { documentStore } from '../../services/document.store';
import { webAdapter } from '../../adapters/web.adapter';

interface DocumentViewerProps {
  document: ParsedDocument | null;
  diagrams: Map<string, string>;
  theme?: ReadingTheme;
  onLoadSample: () => void;
  onFocusDiagram?: (svgHtml: string, rawCode: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  diagrams,
  theme,
  onLoadSample,
  onFocusDiagram,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger Mermaid SVG rendering whenever the document, diagrams, or theme change
  useEffect(() => {
    if (containerRef.current && diagrams.size > 0) {
      DiagramEngine.renderDiagrams(containerRef.current, diagrams);
    }
  }, [document?.html, diagrams, theme]);

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
        <h2 className="text-xl font-bold text-theme-text mb-2">لا يوجد مستند مفتوح حالياً</h2>
        <p className="text-sm text-theme-muted max-w-md mb-6 leading-relaxed">
          قم بفتح أي ملف ماركداون من جهازك للاستمتاع بالقراءة المتقدمة، دعم المعادلات الرياضية، المخططات التفاعلية، والتوجيه الذكي للغة العربية.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const file = await webAdapter.openFile();
              if (file) {
                documentStore.openTab(file.name, file.path, file.content);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-accent text-white hover:bg-theme-accent-hover font-medium text-xs transition-colors shadow-sm"
          >
            <FolderOpen className="w-4 h-4" />
            <span>فتح ملف من الجهاز</span>
          </button>
          <button
            onClick={onLoadSample}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-surface border border-theme-border hover:bg-theme-border/60 text-theme-text font-medium text-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>عرض المستند التجريبي الشامل</span>
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
