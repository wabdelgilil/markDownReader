import React from 'react';
import { DocumentHeading } from '../../core/types';
import { ListTree, ChevronLeft } from 'lucide-react';

interface DynamicOutlineProps {
  headings: DocumentHeading[];
  activeHeadingId?: string;
  onSelectHeading: (id: string) => void;
}

export const DynamicOutline: React.FC<DynamicOutlineProps> = ({
  headings,
  activeHeadingId,
  onSelectHeading,
}) => {
  if (headings.length === 0) {
    return (
      <aside className="w-64 border-l border-theme-border bg-theme-surface/50 p-4 hidden lg:flex flex-col text-xs text-theme-muted">
        <div className="flex items-center gap-1.5 font-semibold text-theme-text mb-3">
          <ListTree className="w-4 h-4 text-theme-accent" />
          <span>فهرس المستند</span>
        </div>
        <div className="py-8 text-center opacity-60">لا توجد عناوين في هذا المستند.</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-l border-theme-border bg-theme-surface/40 p-3 hidden lg:flex flex-col shrink-0 select-none overflow-y-auto">
      <div className="flex items-center justify-between font-semibold text-xs text-theme-text mb-3 pb-2 border-b border-theme-border/60">
        <div className="flex items-center gap-1.5">
          <ListTree className="w-4 h-4 text-theme-accent" />
          <span>فهرس المحتويات</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-theme-bg text-theme-muted border border-theme-border/50">
          {headings.length}
        </span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {headings.map((heading) => {
          const isActive = activeHeadingId === heading.id;
          const indentClass = 
            heading.level === 1 ? 'pr-1 font-semibold text-theme-text' :
            heading.level === 2 ? 'pr-3 text-theme-text/90' :
            heading.level === 3 ? 'pr-5 text-theme-muted' : 'pr-7 text-theme-muted/80 text-[11px]';

          return (
            <button
              key={heading.id}
              onClick={() => onSelectHeading(heading.id)}
              className={`flex items-center justify-between text-right py-1.5 px-2 rounded-md transition-colors text-xs truncate ${indentClass} ${
                isActive
                  ? 'bg-theme-accent/15 text-theme-accent font-medium'
                  : 'hover:bg-theme-bg hover:text-theme-text'
              }`}
              title={heading.text}
            >
              <span className="truncate">{heading.text}</span>
              {isActive && <ChevronLeft className="w-3.5 h-3.5 shrink-0 text-theme-accent mr-1" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
