import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Copy, Check, Maximize2, Move } from 'lucide-react';
import { useCanvasPanZoom } from '../hooks/useCanvasPanZoom';
import { useI18n } from '../hooks/useI18n';

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgHtml: string;
  rawCode: string;
}

export const DiagramModal: React.FC<DiagramModalProps> = ({
  isOpen,
  onClose,
  svgHtml,
  rawCode,
}) => {
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const {
    containerRef,
    transform,
    isDragging,
    zoomIn,
    zoomOut,
    reset,
    fitToScreen,
    handlers,
  } = useCanvasPanZoom({
    initialScale: 1.1,
    minScale: 0.25,
    maxScale: 6.0,
  });

  // Reset viewport state when opening modal
  useEffect(() => {
    if (isOpen) {
      reset();
      setActiveTab('preview');
    }
  }, [isOpen, reset]);

  // Keyboard shortcut Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-studio-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200">
      {/* Top Modal Controls Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/60 text-xs font-mono text-white/80" dir="ltr">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span className="font-bold text-sm tracking-wide text-white font-sans">{t.studioModal.title}</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 ml-4 font-sans text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                activeTab === 'preview' ? 'bg-theme-accent text-white shadow-xs' : 'text-white/60 hover:text-white'
              }`}
            >
              {t.studioModal.previewTab}
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                activeTab === 'code' ? 'bg-theme-accent text-white shadow-xs' : 'text-white/60 hover:text-white'
              }`}
            >
              {t.studioModal.codeTab}
            </button>
          </div>

          {activeTab === 'preview' && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-white/70 font-mono ml-2">
              {Math.round(transform.scale * 100)}%
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {activeTab === 'preview' && (
            <>
              <button
                onClick={zoomIn}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
                title={t.studioModal.zoomIn}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={zoomOut}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
                title={t.studioModal.zoomOut}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={fitToScreen}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
                title={locale === 'ar' ? 'ملاءمة للشاشة' : 'Fit to Screen'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={reset}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
                title={t.studioModal.reset}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-white/15 mx-1"></div>
            </>
          )}

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer text-xs"
            title={locale === 'ar' ? 'نسخ كود المخطط' : 'Copy Diagram Source Code'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? (locale === 'ar' ? 'تم النسخ!' : 'Copied!') : (locale === 'ar' ? 'نسخ الكود' : 'Copy Code')}</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer text-xs shadow-sm"
            title={t.studioModal.exportSvg}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.studioModal.exportSvg}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors ml-2 cursor-pointer"
            title={t.studioModal.closeTooltip}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeTab === 'preview' ? (
        <div
          ref={containerRef}
          {...handlers}
          className={`flex-1 overflow-hidden relative flex items-center justify-center ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            }}
            className="pointer-events-auto select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />

          {/* Floating Pan/Zoom HUD */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white/70 text-xs shadow-lg">
            <Move className="w-3.5 h-3.5 text-white/50" />
            <span>{locale === 'ar' ? 'اسحب للتحريك • عجلة الفأرة للتكبير عند المؤشر • نقر مزدوج للضبط' : 'Drag to pan • Mouse wheel to zoom at cursor • Double-click to reset'}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6 flex justify-center bg-black/80 font-mono text-xs">
          <div className="max-w-4xl w-full bg-theme-surface border border-theme-border rounded-xl p-5 overflow-auto text-theme-text select-text" dir="ltr">
            <pre className="m-0 p-0 overflow-x-auto leading-relaxed">
              <code>{rawCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Bottom Footer Hint */}
      <div className="px-6 py-2 border-t border-white/10 bg-black/70 text-[11px] text-white/50 flex items-center justify-between select-none font-sans">
        <span>{locale === 'ar' ? 'استوديو عرض المخططات المعمارية عالي الدقة' : 'High-Resolution Diagram Focus Studio'}</span>
        <span>{locale === 'ar' ? 'اضغط Esc للإغلاق' : 'Press Esc to exit'}</span>
      </div>
    </div>
  );
};
