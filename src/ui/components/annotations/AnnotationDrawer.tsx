import React, { useState } from 'react';
import { Annotation, HighlightColor, HIGHLIGHT_PALETTE } from '../../../core/types/annotation';
import { annotationStore } from '../../../services/annotation.store';
import { useI18n } from '../../hooks/useI18n';
import {
  X,
  Search,
  Download,
  Copy,
  Trash2,
  StickyNote,
  Highlighter,
  Check,
  ExternalLink,
} from 'lucide-react';

interface AnnotationDrawerProps {
  isOpen: boolean;
  docId: string;
  docTitle?: string;
  annotations: Annotation[];
  onClose: () => void;
  onNavigateTo: (id: string) => void;
  onOpenEdit: (annotation: Annotation) => void;
}

export const AnnotationDrawer: React.FC<AnnotationDrawerProps> = ({
  isOpen,
  docId,
  docTitle,
  annotations,
  onClose,
  onNavigateTo,
  onOpenEdit,
}) => {
  const { t, isRtl } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<HighlightColor | 'all'>('all');
  const [copiedReport, setCopiedReport] = useState(false);

  if (!isOpen) return null;

  // Filter annotations based on search and color selection
  const filtered = annotations.filter((ann) => {
    const matchesColor = selectedColor === 'all' || ann.color === selectedColor;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      ann.text.toLowerCase().includes(query) ||
      (ann.note && ann.note.toLowerCase().includes(query));
    return matchesColor && matchesQuery;
  });

  const handleExportMarkdown = () => {
    const content = annotationStore.exportToMarkdown(docId, docTitle);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle || 'document'}_annotations.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const content = annotationStore.exportToMarkdown(docId, docTitle);
    navigator.clipboard.writeText(content);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 1200);
  };

  const handleClearAll = () => {
    if (window.confirm(t.annotations.clearAllConfirm)) {
      annotationStore.clearDocumentAnnotations(docId);
    }
  };

  const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'purple'];

  return (
    <aside
      className={`fixed top-0 bottom-0 z-50 w-80 md:w-96 bg-theme-surface border-theme-border shadow-2xl flex flex-col transition-all duration-300 animate-in ${
        isRtl
          ? 'left-0 border-r slide-in-from-left'
          : 'right-0 border-l slide-in-from-right'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-theme-accent/15 text-theme-accent">
            <Highlighter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-theme-text flex items-center gap-1.5">
              <span>{t.annotations.drawerTitle}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-theme-accent/20 text-theme-accent">
                {annotations.length}
              </span>
            </h2>
            <p className="text-[11px] text-theme-muted truncate max-w-[200px]">
              {docTitle || t.annotations.drawerSubtitle}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors cursor-pointer"
          title={t.annotations.cancel}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Tools & Filters */}
      <div className="p-3 border-b border-theme-border/60 flex flex-col gap-2.5 bg-theme-bg/40">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute top-2.5 start-2.5 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.annotations.searchPlaceholder}
            className="w-full text-xs ps-8 pe-3 py-1.5 rounded-lg bg-theme-surface border border-theme-border text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-accent"
          />
        </div>

        {/* Color Palette Filters & Actions Bar */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedColor('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                selectedColor === 'all'
                  ? 'bg-theme-accent text-white border-transparent'
                  : 'bg-theme-surface text-theme-muted border-theme-border hover:text-theme-text'
              }`}
            >
              {t.annotations.filterAll}
            </button>
            {colors.map((c) => {
              const meta = HIGHLIGHT_PALETTE[c];
              return (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-4 h-4 rounded-full transition-all cursor-pointer border ${
                    selectedColor === c ? 'ring-2 ring-theme-accent ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: meta.hex }}
                  title={t.annotations.colors[c]}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyReport}
              disabled={annotations.length === 0}
              className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface disabled:opacity-40 transition-colors cursor-pointer"
              title={copiedReport ? t.annotations.copied : t.annotations.exportClipboard}
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleExportMarkdown}
              disabled={annotations.length === 0}
              className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface disabled:opacity-40 transition-colors cursor-pointer"
              title={t.annotations.exportMarkdown}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClearAll}
              disabled={annotations.length === 0}
              className="p-1 rounded-md text-theme-muted hover:text-rose-500 hover:bg-theme-surface disabled:opacity-40 transition-colors cursor-pointer"
              title={t.annotations.clearAll}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4">
            <Highlighter className="w-8 h-8 text-theme-muted/50 mb-2 stroke-1" />
            <p className="text-xs font-semibold text-theme-text">{t.annotations.emptyText}</p>
            <p className="text-[11px] text-theme-muted mt-1 leading-relaxed max-w-[220px]">
              {t.annotations.emptySubtitle}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const meta = HIGHLIGHT_PALETTE[item.color];
            return (
              <div
                key={item.id}
                className="group relative p-2.5 rounded-xl bg-theme-bg/60 hover:bg-theme-bg border border-theme-border/70 hover:border-theme-accent/40 transition-all flex flex-col gap-1.5"
              >
                {/* Quote header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: meta.hex }}
                    />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-theme-muted">
                      {t.annotations.colors[item.color]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onNavigateTo(item.id)}
                      className="p-1 rounded hover:bg-theme-surface text-theme-muted hover:text-theme-accent cursor-pointer"
                      title="Scroll to text"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onOpenEdit(item)}
                      className="p-1 rounded hover:bg-theme-surface text-theme-muted hover:text-theme-text cursor-pointer"
                      title={t.annotations.editNote}
                    >
                      <StickyNote className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => annotationStore.deleteAnnotation(item.id)}
                      className="p-1 rounded hover:bg-rose-500/10 text-theme-muted hover:text-rose-500 cursor-pointer"
                      title={t.annotations.deleteHighlight}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Highlighted text snippet */}
                <p
                  onClick={() => onNavigateTo(item.id)}
                  className="text-xs text-theme-text leading-relaxed font-medium line-clamp-3 cursor-pointer hover:text-theme-accent transition-colors"
                >
                  "{item.text}"
                </p>

                {/* Attached Note */}
                {item.note && (
                  <div
                    onClick={() => onOpenEdit(item)}
                    className="mt-1 p-2 rounded-lg bg-theme-surface border border-theme-border/60 text-xs text-theme-text flex items-start gap-1.5 cursor-pointer hover:border-theme-accent/40"
                  >
                    <StickyNote className="w-3.5 h-3.5 text-theme-accent shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed break-words flex-1">{item.note}</p>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-[10px] text-theme-muted pt-1 border-t border-theme-border/30 flex items-center justify-between">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
