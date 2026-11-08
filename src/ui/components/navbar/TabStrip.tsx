import React from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { DocumentTab } from '../../../core/types';
import { AppLocale } from '../../../services/i18n';

interface TabStripProps {
  tabs: DocumentTab[];
  activeTabId?: string;
  locale: AppLocale;
  openFileTooltip: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onOpenFile: () => void;
}

export const TabStrip: React.FC<TabStripProps> = ({
  tabs,
  activeTabId,
  locale,
  openFileTooltip,
  onSelectTab,
  onCloseTab,
  onOpenFile,
}) => {
  return (
    <div className="flex items-center overflow-x-auto bg-theme-bg/60 border-t border-theme-border/50 px-2 pt-1 gap-1">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer border-t border-x transition-colors max-w-[200px] shrink-0 ${
              isActive
                ? 'bg-theme-surface border-theme-border text-theme-text font-semibold border-b-transparent shadow-sm'
                : 'bg-transparent border-transparent text-theme-muted hover:bg-theme-surface/50 hover:text-theme-text'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-theme-accent' : 'text-theme-muted'}`} />
            <span className="truncate">{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:bg-theme-border/80 p-0.5 rounded transition-opacity cursor-pointer"
              title={locale === 'ar' ? 'إغلاق التبويب' : 'Close Tab'}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      {/* Plus Tab Button */}
      <button
        onClick={onOpenFile}
        className="p-1 rounded-lg text-theme-muted hover:text-theme-text hover:bg-theme-surface/60 transition-colors ml-1 cursor-pointer"
        title={openFileTooltip}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
