import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Copy, Check, Maximize } from 'lucide-react';

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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset viewport state when opening modal
  useEffect(() => {
    if (isOpen) {
      setScale(1.1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

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

  // Mouse wheel smooth zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.3), 6));
  };

  // Mouse drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200">
      {/* Top Modal Controls Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40 text-xs font-mono text-white/80" dir="ltr">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
            <span className="font-bold text-sm tracking-wide text-white">استوديو المخططات التفاعلي (Diagram Focus Studio)</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-white/70">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.min(s * 1.2, 6))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
            title="تكبير (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setScale((s) => Math.max(s * 0.8, 0.3))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
            title="تصغير (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
            title="إعادة ضبط الموضع والحجم (Reset View)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/15 mx-1"></div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer text-xs"
            title="نسخ كود Mermaid الأصلي"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer text-xs shadow-sm"
            title="تصدير SVG عالي الدقة"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير SVG</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors ml-2 cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Pan/Zoom Interactive Workspace with subtle blueprint dot grid */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="pointer-events-auto select-none"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </div>

      {/* Bottom Hint Footer */}
      <div className="px-6 py-2.5 border-t border-white/10 bg-black/50 text-[11px] text-white/50 flex items-center justify-between select-none">
        <span className="flex items-center gap-1.5">
          <Maximize className="w-3.5 h-3.5 text-white/40" />
          اسحب بالفأرة للتحريك (Pan) • عجلة الفأرة للتكبير والتصغير (Zoom)
        </span>
        <span>اضغط <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">Esc</kbd> للعودة إلى المستند</span>
      </div>
    </div>
  );
};
