import React, { useState, useEffect } from 'react';
import { Annotation, HighlightColor, HIGHLIGHT_PALETTE } from '../../../core/types/annotation';
import { Trash2, Check, X, Copy, StickyNote } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface AnnotationPopoverProps {
  annotation: Annotation | null;
  position: { top: number; left: number } | null;
  onUpdate: (id: string, updates: Partial<Pick<Annotation, 'color' | 'note'>>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const AnnotationPopover: React.FC<AnnotationPopoverProps> = ({
  annotation,
  position,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const { t } = useI18n();
  const [noteText, setNoteText] = useState(annotation?.note || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNoteText(annotation?.note || '');
  }, [annotation]);

  if (!annotation || !position) return null;

  const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'purple'];

  const handleSaveNote = () => {
    onUpdate(annotation.id, { note: noteText });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(annotation.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 800);
  };

  return (
    <div
      style={{
        top: `${Math.max(10, position.top + 28)}px`,
        left: `${Math.min(window.innerWidth - 320, Math.max(10, position.left - 150))}px`,
      }}
      className="fixed z-50 w-72 rounded-xl bg-theme-surface border border-theme-border shadow-2xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 select-none text-theme-text"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-theme-border/60">
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-4 h-4 text-theme-accent" />
          <span className="text-xs font-semibold tracking-wide">
            {annotation.note ? t.annotations.editNote : t.annotations.addNote}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors cursor-pointer"
            title={t.annotations.copyText}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDelete(annotation.id)}
            className="p-1 rounded-md text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title={t.annotations.deleteHighlight}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Color Palette Switcher */}
      <div className="flex items-center gap-2 px-1">
        {colors.map((color) => {
          const meta = HIGHLIGHT_PALETTE[color];
          const isSelected = annotation.color === color;
          return (
            <button
              key={color}
              onClick={() => onUpdate(annotation.id, { color })}
              className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                isSelected ? 'ring-2 ring-theme-accent ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: meta.hex }}
              title={t.annotations.colors[color]}
            />
          );
        })}
      </div>

      {/* Note Textarea */}
      <div className="flex flex-col gap-1.5">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={t.annotations.addNote + '...'}
          rows={3}
          className="w-full text-xs p-2 rounded-lg bg-theme-bg border border-theme-border text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-accent resize-none leading-relaxed"
          autoFocus
        />
        <div className="flex items-center justify-end gap-1.5 pt-1">
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-theme-muted hover:bg-theme-bg transition-colors cursor-pointer"
          >
            {t.annotations.cancel}
          </button>
          <button
            onClick={handleSaveNote}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-theme-accent text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            {t.annotations.saveNote}
          </button>
        </div>
      </div>
    </div>
  );
};
