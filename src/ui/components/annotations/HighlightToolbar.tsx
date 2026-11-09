import React from 'react';
import { HighlightColor, HIGHLIGHT_PALETTE } from '../../../core/types/annotation';
import { MessageSquarePlus, Copy, Check } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface HighlightToolbarProps {
  position: { top: number; left: number } | null;
  selectedText: string;
  onApplyHighlight: (color: HighlightColor, openNote?: boolean) => void;
  onClose: () => void;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  position,
  selectedText,
  onApplyHighlight,
  onClose,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  if (!position || !selectedText.trim()) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(selectedText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 800);
  };

  const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'purple'];

  return (
    <div
      style={{
        top: `${Math.max(10, position.top)}px`,
        left: `${Math.max(10, position.left)}px`,
      }}
      className="fixed -translate-x-1/2 -translate-y-full mb-2 z-50 flex items-center gap-1 p-1.5 rounded-xl bg-theme-surface/95 backdrop-blur-md border border-theme-border shadow-xl select-none animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Color Swatches */}
      <div className="flex items-center gap-1.5 px-1 border-r border-theme-border/60">
        {colors.map((color) => {
          const meta = HIGHLIGHT_PALETTE[color];
          return (
            <button
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                onApplyHighlight(color, false);
              }}
              className="w-5 h-5 rounded-full transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-theme-accent cursor-pointer border border-black/15 shadow-xs"
              style={{ backgroundColor: meta.hex }}
              title={t.annotations.colors[color]}
            />
          );
        })}
      </div>

      {/* Add Note Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onApplyHighlight('yellow', true);
        }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-theme-text hover:bg-theme-bg transition-colors cursor-pointer"
        title={t.annotations.addNote}
      >
        <MessageSquarePlus className="w-3.5 h-3.5 text-theme-accent" />
        <span className="hidden sm:inline">{t.annotations.addNote}</span>
      </button>

      {/* Copy Text Button */}
      <button
        onClick={handleCopy}
        className="p-1 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors cursor-pointer"
        title={copied ? t.annotations.copied : t.annotations.copyText}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
