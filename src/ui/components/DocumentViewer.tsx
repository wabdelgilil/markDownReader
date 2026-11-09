import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ParsedDocument, ReadingTheme } from '../../core/types';
import { Annotation, HighlightColor } from '../../core/types/annotation';
import { DiagramEngine } from '../../core/diagrams/mermaid';
import { DomHighlighter } from '../../services/highlighter.dom';
import { annotationStore } from '../../services/annotation.store';
import { HighlightToolbar } from './annotations/HighlightToolbar';
import { AnnotationPopover } from './annotations/AnnotationPopover';
import { FileQuestion, FolderOpen, BookOpen } from 'lucide-react';
import { documentStore } from '../../services/document.store';
import { webAdapter } from '../../adapters/web.adapter';
import { useI18n } from '../hooks/useI18n';

interface DocumentViewerProps {
  document: ParsedDocument | null;
  docId?: string;
  annotations?: Annotation[];
  diagrams: Map<string, string>;
  theme?: ReadingTheme;
  diagramStyleVersion?: number;
  onLoadSample: () => void;
  onFocusDiagram?: (svgHtml: string, rawCode: string) => void;
  externalEditAnnotation?: Annotation | null;
  onClearExternalEdit?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  docId = '',
  annotations = [],
  diagrams,
  theme,
  diagramStyleVersion,
  onLoadSample,
  onFocusDiagram,
  externalEditAnnotation,
  onClearExternalEdit,
}) => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  // Floating Selection Toolbar State
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  // Inline Mark Popover State
  const [popoverAnn, setPopoverAnn] = useState<Annotation | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  // Trigger Mermaid SVG rendering whenever the document, diagrams, theme, or diagram style change
  useEffect(() => {
    if (containerRef.current && diagrams.size > 0) {
      DiagramEngine.renderDiagrams(containerRef.current, diagrams);
    }
  }, [document?.html, diagrams, theme, diagramStyleVersion]);

  // Apply In-DOM Highlights whenever HTML or annotations change
  useEffect(() => {
    if (containerRef.current && document) {
      DomHighlighter.apply(containerRef.current, annotations);
    }
  }, [document?.html, annotations]);

  // Handle External Edit requests triggered from Drawer
  useEffect(() => {
    if (externalEditAnnotation && containerRef.current) {
      DomHighlighter.scrollToAnnotation(containerRef.current, externalEditAnnotation.id);
      const mark = containerRef.current.querySelector(
        `mark[data-annotation-id="${externalEditAnnotation.id}"]`
      ) as HTMLElement;
      if (mark) {
        const rect = mark.getBoundingClientRect();
        setPopoverAnn(externalEditAnnotation);
        setPopoverPos({ top: rect.bottom, left: rect.left + rect.width / 2 });
      }
      onClearExternalEdit?.();
    }
  }, [externalEditAnnotation, onClearExternalEdit]);

  // Handle Mouse Selection for Floating Toolbar
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setToolbarPos(null);
      setSelectedText('');
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) {
      setToolbarPos(null);
      setSelectedText('');
      return;
    }

    // Ensure selection originated inside markdown container
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (containerRef.current?.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        setToolbarPos({
          top: rect.top,
          left: rect.left + rect.width / 2,
        });
        setSelectedText(text);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // Apply new highlight from floating toolbar
  const handleApplyHighlight = (color: HighlightColor, openNote?: boolean) => {
    if (!document || !docId || !selectedText) return;

    const newAnn = annotationStore.addAnnotation(docId, selectedText, color);
    window.getSelection()?.removeAllRanges();
    setToolbarPos(null);
    setSelectedText('');

    if (openNote) {
      setTimeout(() => {
        if (!containerRef.current) return;
        const mark = containerRef.current.querySelector(
          `mark[data-annotation-id="${newAnn.id}"]`
        ) as HTMLElement;
        if (mark) {
          const rect = mark.getBoundingClientRect();
          setPopoverAnn(newAnn);
          setPopoverPos({ top: rect.bottom, left: rect.left + rect.width / 2 });
        }
      }, 50);
    }
  };

  // Enable smooth mouse drag-to-pan on inline diagrams
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

  // Event Delegation for Code Copy, Diagram Actions, and Mark Clicks
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Check for Highlight Mark Click
    const mark = (e.target as HTMLElement).closest('mark.mdfull-highlight') as HTMLElement;
    if (mark) {
      const annId = mark.getAttribute('data-annotation-id');
      if (annId) {
        const found = annotations.find((a) => a.id === annId);
        if (found) {
          const rect = mark.getBoundingClientRect();
          setPopoverAnn(found);
          setPopoverPos({ top: rect.bottom, left: rect.left + rect.width / 2 });
          return;
        }
      }
    }

    // 2. Check for Code Copy Button
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

    // 3. Check for Diagram Zoom & Export Buttons
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
      return;
    }

    // 4. Check for Internal Anchor Link Click (#slug)
    const anchorLink = (e.target as HTMLElement).closest('a[data-internal-anchor], a[href^="#"]') as HTMLAnchorElement;
    if (anchorLink) {
      const targetSlug = anchorLink.getAttribute('data-internal-anchor') ||
                         anchorLink.getAttribute('href')?.replace(/^#/, '');
      if (targetSlug) {
        e.preventDefault();
        const decoded = decodeURIComponent(targetSlug);
        const container = containerRef.current;
        let targetEl: HTMLElement | null = null;
        if (container) {
          try {
            targetEl =
              container.querySelector(`[id="${CSS.escape(targetSlug)}"]`) ||
              (container.querySelector(`[id="${CSS.escape(decoded)}"]`) as HTMLElement);
          } catch {
            targetEl = window.document.getElementById(targetSlug) || window.document.getElementById(decoded);
          }
        }
        if (!targetEl) {
          targetEl = window.document.getElementById(targetSlug) || window.document.getElementById(decoded);
        }

        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Flash visual landing glow
          targetEl.classList.add('ring-2', 'ring-theme-accent', 'ring-offset-4', 'ring-offset-theme-bg', 'rounded-lg');
          setTimeout(() => {
            targetEl?.classList.remove('ring-2', 'ring-theme-accent', 'ring-offset-4', 'ring-offset-theme-bg', 'rounded-lg');
          }, 1500);

          try {
            window.history.pushState(null, '', '#' + targetSlug);
          } catch {
            // Ignore in sandboxed contexts
          }
        }
        return;
      }
    }

    // 5. Check for Workspace Markdown File Link Click (.md)
    const workspaceLink = (e.target as HTMLElement).closest('a[data-workspace-link]') as HTMLAnchorElement;
    if (workspaceLink) {
      e.preventDefault();
      const rawPath = workspaceLink.getAttribute('data-workspace-link');
      if (rawPath) {
        const cleanPath = rawPath.replace(/^\.\//, '');
        const fileName = cleanPath.split('/').pop() || cleanPath;

        // Check if tab is already open
        const existingTab = documentStore.getTabs().find((t) => t.path?.includes(cleanPath) || t.name === fileName);
        if (existingTab) {
          documentStore.setActiveTab(existingTab.id);
        } else {
          documentStore.openTab(fileName, cleanPath, `# ${fileName}\n\nملف مرتبط في مساحة العمل: \`${cleanPath}\`\n\n> يمكنك استعراض الملفات المحلية أو فتح المستند المطلوب مباشرة من شجرة المجلدات.`);
        }
      }
      return;
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
      className="flex-1 h-full overflow-y-auto px-6 py-8 flex justify-center relative"
    >
      <article
        ref={containerRef}
        onClick={handleContainerClick}
        className="max-w-4xl w-full text-theme-text leading-relaxed font-sans text-sm md:text-base space-y-4"
        dangerouslySetInnerHTML={{ __html: document.html }}
      />

      {/* Floating Selection Toolbar */}
      <HighlightToolbar
        position={toolbarPos}
        selectedText={selectedText}
        onApplyHighlight={handleApplyHighlight}
        onClose={() => {
          setToolbarPos(null);
          setSelectedText('');
        }}
      />

      {/* Inline Mark Annotation Popover */}
      <AnnotationPopover
        annotation={popoverAnn}
        position={popoverPos}
        onUpdate={(id, updates) => {
          annotationStore.updateAnnotation(id, updates);
          setPopoverAnn(null);
          setPopoverPos(null);
        }}
        onDelete={(id) => {
          annotationStore.deleteAnnotation(id);
          setPopoverAnn(null);
          setPopoverPos(null);
        }}
        onClose={() => {
          setPopoverAnn(null);
          setPopoverPos(null);
        }}
      />
    </main>
  );
};
