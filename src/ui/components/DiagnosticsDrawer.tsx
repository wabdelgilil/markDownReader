import React from 'react';
import { DocumentStats, DocumentDiagnosticIssue } from '../../core/types';
import { X, AlertCircle, AlertTriangle, Info, Clock, Type, Compass, CheckCircle2 } from 'lucide-react';

interface DiagnosticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DocumentStats;
  diagnostics: DocumentDiagnosticIssue[];
}

export const DiagnosticsDrawer: React.FC<DiagnosticsDrawerProps> = ({
  isOpen,
  onClose,
  stats,
  diagnostics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-theme-surface border-r border-theme-border flex flex-col h-full shadow-2xl p-5 select-none overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-theme-border">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-theme-accent" />
            <h3 className="font-bold text-sm text-theme-text">لوحة فحص المستند والإحصائيات</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-theme-bg text-theme-muted hover:text-theme-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quantitative Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-xl bg-theme-bg border border-theme-border flex flex-col gap-1">
            <span className="text-[11px] text-theme-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              وقت القراءة التقديري
            </span>
            <span className="text-lg font-bold text-theme-text font-mono">
              {stats.readingTimeMinutes} <span className="text-xs font-normal text-theme-muted">دقيقة</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-theme-bg border border-theme-border flex flex-col gap-1">
            <span className="text-[11px] text-theme-muted flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-400" />
              إجمالي الكلمات
            </span>
            <span className="text-lg font-bold text-theme-text font-mono">
              {stats.totalWords.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-theme-bg border border-theme-border flex flex-col gap-1">
            <span className="text-[11px] text-theme-muted">كلمات عربية</span>
            <span className="text-base font-semibold text-theme-text font-mono">
              {stats.arabicWords.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-theme-bg border border-theme-border flex flex-col gap-1">
            <span className="text-[11px] text-theme-muted">كلمات إنجليزية</span>
            <span className="text-base font-semibold text-theme-text font-mono">
              {stats.englishWords.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Structural Breakdown */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-theme-bg/60 border border-theme-border/60 text-xs text-theme-muted mb-4 font-mono">
          <span>العناوين: <strong className="text-theme-text">{stats.headingsCount}</strong></span>
          <span>المخططات: <strong className="text-theme-text">{stats.diagramsCount}</strong></span>
          <span>المعادلات: <strong className="text-theme-text">{stats.mathBlocksCount}</strong></span>
        </div>

        {/* Health Diagnostics Issues */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-theme-text">تقرير الفحص الفني</span>
            <span className="text-[11px] text-theme-muted">
              {diagnostics.length === 0 ? 'مستند سليم 100%' : `${diagnostics.length} ملاحظات`}
            </span>
          </div>

          {diagnostics.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 gap-2 text-center my-auto">
              <CheckCircle2 className="w-8 h-8" />
              <span className="font-semibold text-xs">لا توجد أخطاء في الروابط أو التنسيقات!</span>
              <span className="text-[11px] text-emerald-400/80">المعادلات، المخططات، والروابط الداخلية تعمل بشكل ممتاز.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
              {diagnostics.map((diag, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    diag.severity === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : diag.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}
                >
                  {diag.severity === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  ) : diag.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{diag.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
