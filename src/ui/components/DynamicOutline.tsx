import React, { useState, useEffect, useRef } from 'react';
import { DocumentHeading } from '../../core/types';
import { ListTree, ChevronLeft, Search, X } from 'lucide-react';

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
  const [filterText, setFilterText] = useState('');
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Smart Auto-Scroll: Keeps the active heading item centered/visible in the TOC sidebar
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeHeadingId]);

  const filteredHeadings = filterText.trim()
    ? headings.filter((h) => h.text.toLowerCase().includes(filterText.toLowerCase()))
    : headings;

  if (headings.length === 0) {
    return (
      <aside className="w-72 border-l border-theme-border bg-theme-surface/50 p-4 hidden lg:flex flex-col text-xs text-theme-muted shrink-0 h-full">
        <div className="flex items-center gap-1.5 font-semibold text-theme-text mb-3">
          <ListTree className="w-4 h-4 text-theme-accent" />
          <span>فهرس المستند</span>
        </div>
        <div className="py-8 text-center opacity-60">لا توجد عناوين في هذا المستند.</div>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-l border-theme-border bg-theme-surface/60 backdrop-blur-xs hidden lg:flex flex-col shrink-0 select-none h-full z-10">
      {/* Header with Title and Count */}
      <div className="p-3 border-b border-theme-border/60 bg-theme-bg/40">
        <div className="flex items-center justify-between font-semibold text-xs text-theme-text mb-2.5">
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-theme-accent" />
            <span>فهرس المحتويات الذكي</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-theme-surface text-theme-muted border border-theme-border/60 font-mono">
            {headings.length}
          </span>
        </div>

        {/* Quick Search Filter */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute right-2.5 text-theme-muted pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="بحث في الفهرس..."
            className="w-full bg-theme-bg text-theme-text text-xs pr-8 pl-7 py-1.5 rounded-lg border border-theme-border focus:border-theme-accent focus:outline-hidden transition-colors"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute left-2 text-theme-muted hover:text-theme-text p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Independent Scrollable Outline List */}
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5 space-y-0.5">
        {filteredHeadings.map((heading) => {
          const isActive = activeHeadingId === heading.id;
          const indentClass =
            heading.level === 1 ? 'pr-2 font-bold text-theme-text' :
            heading.level === 2 ? 'pr-4 font-semibold text-theme-text/90' :
            heading.level === 3 ? 'pr-6 text-theme-muted' : 'pr-8 text-theme-muted/80 text-[11px]';

          return (
            <button
              key={heading.id}
              ref={isActive ? activeItemRef : null}
              onClick={() => onSelectHeading(heading.id)}
              className={`flex items-center justify-between text-right py-1.5 px-2.5 rounded-lg transition-all text-xs truncate group cursor-pointer ${indentClass} ${
                isActive
                  ? 'bg-theme-accent/12 text-theme-accent font-semibold border-r-2 border-theme-accent'
                  : 'hover:bg-theme-bg/80 hover:text-theme-text text-theme-muted'
              }`}
              title={heading.text}
            >
              <span className="truncate">{heading.text}</span>
              {isActive && (
                <ChevronLeft className="w-3.5 h-3.5 shrink-0 text-theme-accent mr-1" />
              )}
            </button>
          );
        })}

        {filteredHeadings.length === 0 && (
          <div className="py-6 text-center text-xs text-theme-muted">
            لا توجد عناوين مطابقة للبحث
          </div>
        )}
      </nav>
    </aside>
  );
};
