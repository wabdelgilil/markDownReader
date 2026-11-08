import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Maximize2 } from 'lucide-react';
import { MarkdownPipeline } from '../../core/parser/markdown';
import { DiagramEngine } from '../../core/diagrams/mermaid';

interface PresentationViewProps {
  rawMarkdown: string;
  onClose: () => void;
}

export const PresentationView: React.FC<PresentationViewProps> = ({ rawMarkdown, onClose }) => {
  // Split raw markdown into slides using horizontal rule '---'
  const rawSlides = rawMarkdown
    .split(/\r?\n---\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentRaw = rawSlides[currentSlideIndex] || 'نهاية العرض التقديمي';
  const { document: parsedSlide, diagrams } = MarkdownPipeline.parse(currentRaw);

  const nextSlide = () => {
    if (currentSlideIndex < rawSlides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation for presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, rawSlides.length]);

  // Re-render Mermaid diagrams for the active slide
  useEffect(() => {
    const slideContainer = document.getElementById('presentation-slide-content');
    if (slideContainer && diagrams.size > 0) {
      DiagramEngine.renderDiagrams(slideContainer, diagrams);
    }
  }, [currentSlideIndex, diagrams]);

  return (
    <div className="fixed inset-0 z-50 bg-theme-bg flex flex-col justify-between p-8 select-none animate-in fade-in">
      {/* Top Slide Control Bar */}
      <div className="flex items-center justify-between text-xs text-theme-muted border-b border-theme-border/50 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-theme-accent animate-pulse"></span>
          <span className="font-semibold text-theme-text text-sm">وضع العرض التقديمي (Slide Deck)</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm">
            الشريحة <strong className="text-theme-accent">{currentSlideIndex + 1}</strong> من {rawSlides.length}
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-surface hover:bg-theme-border text-theme-text border border-theme-border transition-colors"
          >
            <X className="w-4 h-4" />
            <span>إنهاء العرض (Esc)</span>
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div className="flex-1 flex items-center justify-center py-6 px-4 max-w-4xl mx-auto w-full overflow-y-auto">
        <div
          id="presentation-slide-content"
          className="w-full text-lg leading-relaxed text-theme-text transition-all"
          dangerouslySetInnerHTML={{ __html: parsedSlide.html }}
        />
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="flex items-center justify-between pt-4 border-t border-theme-border/50 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                document.documentElement.requestFullscreen();
              }
            }}
            className="p-2 rounded-lg bg-theme-surface border border-theme-border hover:bg-theme-border text-theme-text transition-colors"
            title="ملء الشاشة"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-theme-surface border border-theme-border hover:bg-theme-border text-theme-text disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابقة</span>
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === rawSlides.length - 1}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-theme-accent text-white hover:bg-theme-accent-hover disabled:opacity-40 transition-colors font-medium shadow-sm"
          >
            <span>التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
