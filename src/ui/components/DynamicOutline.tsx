import React, { useState, useEffect, useRef } from 'react';
import { DocumentHeading } from '../../core/types';
import { ListTree, ChevronLeft, ChevronRight, Search, X, PanelLeftClose } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface DynamicOutlineProps {
  headings: DocumentHeading[];
  activeHeadingId?: string;
  onSelectHeading: (id: string) => void;
  onClose?: () => void;
}

export const DynamicOutline: React.FC<DynamicOutlineProps> = ({
  headings,
  activeHeadingId,
  onSelectHeading,
  onClose,
}) => {
  const { t, locale } = useI18n();
  const [filterText, setFilterText] = useState('');
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll: Keeps the active heading item visible in the TOC sidebar
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
      <aside className={`w-72 ${locale === 'ar' ? 'border-l' : 'border-r'} border-theme-border bg-theme-surface/50 p-4 flex flex-col text-xs text-theme-muted shrink-0 h-full animate-in fade-in duration-150`}>
        <div className="flex items-center justify-between font-semibold text-theme-text mb-3">
          <div className="flex items-center gap-1.5">
            <ListTree className="w-4 h-4 text-theme-accent" />
            <span>{t.outline.title}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-border/60 transition-colors cursor-pointer"
              title={t.outline.collapse}
            >
              <PanelLeftClose className={`w-3.5 h-3.5 ${locale === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        <div className="py-8 text-center opacity-60">{t.outline.emptyText}</div>
      </aside>
    );
  }

  return (
    <aside className={`w-72 ${locale === 'ar' ? 'border-l' : 'border-r'} border-theme-border bg-theme-surface/60 backdrop-blur-xs flex flex-col shrink-0 select-none h-full z-10 animate-in fade-in duration-150`}>
      {/* Header with Title, Count, and Collapse Action */}
      <div className="p-3 border-b border-theme-border/60 bg-theme-bg/40">
        <div className="flex items-center justify-between font-semibold text-xs text-theme-text mb-2.5">
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-theme-accent" />
            <span>{t.outline.title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-theme-surface text-theme-muted border border-theme-border/60 font-mono">
              {headings.length}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-border/60 transition-colors cursor-pointer"
              title={t.outline.collapse}
            >
              <PanelLeftClose className={`w-3.5 h-3.5 ${locale === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Quick Search Filter */}
        <div className="relative flex items-center">
          <Search className={`w-3.5 h-3.5 absolute ${locale === 'ar' ? 'right-2.5' : 'left-2.5'} text-theme-muted pointer-events-none`} />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={t.outline.searchPlaceholder}
            className={`w-full bg-theme-bg text-theme-text text-xs ${locale === 'ar' ? 'pr-8 pl-7' : 'pl-8 pr-7'} py-1.5 rounded-lg border border-theme-border focus:border-theme-accent focus:outline-hidden transition-colors`}
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className={`absolute ${locale === 'ar' ? 'left-2' : 'right-2'} text-theme-muted hover:text-theme-text p-0.5 rounded cursor-pointer`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Headings Tree View */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filteredHeadings.map((heading) => {
          const isActive = activeHeadingId === heading.id;
          const indent = (heading.level - 1) * 12;

          return (
            <button
              key={heading.id}
              ref={isActive ? activeItemRef : null}
              onClick={() => onSelectHeading(heading.id)}
              style={{
                [locale === 'ar' ? 'paddingRight' : 'paddingLeft']: `${indent + 8}px`,
              }}
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs text-start transition-all cursor-pointer ${
                isActive
                  ? 'bg-theme-accent/15 text-theme-accent font-semibold border-r-2 border-theme-accent'
                  : 'text-theme-muted hover:text-theme-text hover:bg-theme-bg/60 font-normal'
              }`}
            >
              <span className="truncate flex-1">{heading.text}</span>
              {isActive && (
                locale === 'ar' ? <ChevronLeft className="w-3.5 h-3.5 shrink-0 text-theme-accent" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-theme-accent" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
