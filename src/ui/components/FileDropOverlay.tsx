import React, { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { documentStore } from '../../services/document.store';
import { useI18n } from '../hooks/useI18n';

export const FileDropOverlay: React.FC = () => {
  const { locale } = useI18n();
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDragOver(true);
      }
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDragOver(false);
        dragCounter = 0;
      }
    };

    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragOver(false);

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
          const ext = file.name.toLowerCase();
          if (ext.endsWith('.md') || ext.endsWith('.markdown') || ext.endsWith('.txt')) {
            const content = await file.text();
            documentStore.openTab(file.name, file.name, content);
          }
        }
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  if (!isDragOver) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-8 select-none pointer-events-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg p-10 rounded-3xl border-2 border-dashed border-theme-accent bg-theme-surface/90 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-theme-accent/20 text-theme-accent flex items-center justify-center mb-4 animate-bounce">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-theme-text mb-1.5">
          {locale === 'ar' ? 'أفلت ملفات Markdown هنا' : 'Drop Markdown Files Here'}
        </h3>
        <p className="text-xs text-theme-muted max-w-xs">
          {locale === 'ar' ? 'سيتم فتح المستندات تلقائياً في تبويبات منفصلة' : 'Documents will open automatically in dedicated tabs'}
        </p>
      </div>
    </div>
  );
};
