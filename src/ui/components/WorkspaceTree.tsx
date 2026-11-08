import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  X, 
  FolderPlus,
  Search
} from 'lucide-react';
import { WorkspaceService, WorkspaceFileNode } from '../../services/workspace.service';
import { documentStore } from '../../services/document.store';
import { useI18n } from '../hooks/useI18n';

interface TreeNodeProps {
  node: WorkspaceFileNode;
  activePath?: string;
  onSelectFile: (node: WorkspaceFileNode) => void;
  level?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  activePath,
  onSelectFile,
  level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.isDirectory) {
    return (
      <div className="select-none">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={{ paddingInlineStart: `${level * 12 + 6}px` }}
          className="w-full flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs text-theme-muted hover:text-theme-text hover:bg-theme-bg/60 transition-colors text-start cursor-pointer"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className="truncate font-medium">{node.name}</span>
        </button>

        {isOpen && node.children && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                activePath={activePath}
                onSelectFile={onSelectFile}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = activePath === node.path;

  return (
    <button
      onClick={() => onSelectFile(node)}
      style={{ paddingInlineStart: `${level * 12 + 20}px` }}
      className={`w-full flex items-center gap-2 py-1 px-2 rounded-lg text-xs text-start transition-all cursor-pointer ${
        isActive
          ? 'bg-theme-accent/15 text-theme-accent font-semibold border-inline-start-2 border-theme-accent shadow-xs'
          : 'text-theme-muted hover:text-theme-text hover:bg-theme-bg/60 font-normal'
      }`}
    >
      <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-theme-accent' : 'opacity-60'}`} />
      <span className="truncate">{node.name}</span>
    </button>
  );
};

interface WorkspaceTreeProps {
  onClose?: () => void;
}

export const WorkspaceTree: React.FC<WorkspaceTreeProps> = ({ onClose }) => {
  const { locale } = useI18n();
  const [root, setRoot] = useState<WorkspaceFileNode | null>(WorkspaceService.getRoot());
  const [filterQuery, setFilterQuery] = useState('');
  const activeTab = documentStore.getActiveTab();

  React.useEffect(() => {
    return WorkspaceService.subscribe((newRoot) => {
      setRoot(newRoot);
    });
  }, []);

  const handleOpenFolder = async () => {
    await WorkspaceService.openDirectory();
  };

  const handleSelectFile = (node: WorkspaceFileNode) => {
    if (node.content !== undefined) {
      documentStore.openTab(node.name, node.path, node.content);
    }
  };

  if (!root) {
    return (
      <aside className={`w-64 ${locale === 'ar' ? 'border-l' : 'border-r'} border-theme-border bg-theme-surface/50 p-4 hidden md:flex flex-col text-xs text-theme-muted shrink-0 h-full select-none`}>
        <div className="flex items-center justify-between font-semibold text-theme-text mb-3">
          <div className="flex items-center gap-1.5">
            <Folder className="w-4 h-4 text-theme-accent" />
            <span>{locale === 'ar' ? 'مجلد العمل' : 'Workspace'}</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-theme-bg text-theme-muted hover:text-theme-text">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="py-8 text-center flex flex-col items-center gap-3 my-auto">
          <div className="p-3 rounded-xl bg-theme-bg border border-theme-border text-theme-muted">
            <FolderPlus className="w-6 h-6 text-theme-accent" />
          </div>
          <p className="text-[11px] text-theme-muted max-w-[180px] leading-relaxed">
            {locale === 'ar' ? 'افتح مجلداً محلياً لاستعراض وتصفح كافة ملفات التوثيق كشجرة هرمية' : 'Open a local folder to browse your documentation hierarchy'}
          </p>
          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-accent text-white text-xs font-semibold hover:bg-theme-accent-hover transition-colors cursor-pointer shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'اختيار مجلد' : 'Open Folder'}</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`w-64 ${locale === 'ar' ? 'border-l' : 'border-r'} border-theme-border bg-theme-surface/70 backdrop-blur-xs hidden md:flex flex-col shrink-0 select-none h-full z-10`}>
      {/* Workspace Header */}
      <div className="p-3 border-b border-theme-border/60 bg-theme-bg/40">
        <div className="flex items-center justify-between font-semibold text-xs text-theme-text mb-2">
          <div className="flex items-center gap-1.5 truncate">
            <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{root.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenFolder}
              className="p-1 rounded hover:bg-theme-surface text-theme-muted hover:text-theme-text cursor-pointer"
              title={locale === 'ar' ? 'تغيير المجلد' : 'Change Folder'}
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => WorkspaceService.setRoot(null)}
              className="p-1 rounded hover:bg-theme-surface text-theme-muted hover:text-theme-text cursor-pointer"
              title={locale === 'ar' ? 'إغلاق المجلد' : 'Close Workspace'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative flex items-center">
          <Search className={`w-3.5 h-3.5 absolute ${locale === 'ar' ? 'right-2.5' : 'left-2.5'} text-theme-muted pointer-events-none`} />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={locale === 'ar' ? 'تصفية الملفات...' : 'Filter files...'}
            className={`w-full bg-theme-bg text-theme-text text-[11px] ${locale === 'ar' ? 'pr-7 pl-6' : 'pl-7 pr-6'} py-1 rounded-md border border-theme-border focus:border-theme-accent focus:outline-hidden transition-colors`}
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className={`absolute ${locale === 'ar' ? 'left-1.5' : 'right-1.5'} text-theme-muted hover:text-theme-text`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Workspace Directory Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <TreeNode
          node={root}
          activePath={activeTab?.path}
          onSelectFile={handleSelectFile}
        />
      </div>
    </aside>
  );
};
