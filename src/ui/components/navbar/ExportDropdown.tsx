import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Printer, 
  FileType, 
  FileCode 
} from 'lucide-react';
import { ExportFormat } from '../../../services/exporters';
import { AppLocale } from '../../../services/i18n';

interface ExportDropdownProps {
  locale: AppLocale;
  onExportFormat: (format: ExportFormat) => void;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({ locale, onExportFormat }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportOptions: { id: ExportFormat; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'html',
      title: locale === 'ar' ? 'ملف HTML مدمج' : 'Standalone HTML',
      subtitle: locale === 'ar' ? 'ملف مستقل يعمل بدون إنترنت' : 'Self-contained offline bundle',
      icon: <Download className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'pdf',
      title: locale === 'ar' ? 'مستند PDF فائق الدقة' : 'Print-Ready Vector PDF',
      subtitle: locale === 'ar' ? 'رسوم متجهة، تنسيق A4 وترقيم صفحات' : 'Scalable vectors, A4 pagination & math',
      icon: <Printer className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'docx',
      title: locale === 'ar' ? 'مستند Word أصلي (DOCX)' : 'Native Microsoft Word (DOCX)',
      subtitle: locale === 'ar' ? 'معادلات OMML ومخططات أشكال وورد قابلة للتعديل' : 'Native OMML equations & editable Word shapes',
      icon: <FileType className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'markdown',
      title: locale === 'ar' ? 'ملف Markdown مصدري' : 'Raw Markdown (.md)',
      subtitle: locale === 'ar' ? 'النص الأصلي للمستند' : 'Plain text source file',
      icon: <FileCode className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-bg hover:bg-theme-border/60 text-theme-text border border-theme-border transition-colors cursor-pointer"
        title={locale === 'ar' ? 'تصدير المستند بصيغ متعددة' : 'Export document in various formats'}
      >
        <Download className="w-3.5 h-3.5 text-blue-400" />
        <span className="hidden md:inline">{locale === 'ar' ? 'تصدير' : 'Export'}</span>
      </button>

      {showMenu && (
        <div className={`absolute top-full mt-1.5 ${locale === 'ar' ? 'left-0' : 'right-0'} w-64 bg-theme-surface border border-theme-border rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100`}>
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-theme-muted border-b border-theme-border/60 mb-1">
            {locale === 'ar' ? 'صيغ التصدير المتاحة' : 'Available Export Formats'}
          </div>
          {exportOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setShowMenu(false);
                onExportFormat(opt.id);
              }}
              className="w-full flex items-start gap-2.5 px-3 py-2 text-start hover:bg-theme-bg text-theme-text transition-colors cursor-pointer"
            >
              <div className="mt-0.5 p-1 rounded bg-theme-bg border border-theme-border/60">
                {opt.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">{opt.title}</span>
                <span className="text-[10px] text-theme-muted">{opt.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
