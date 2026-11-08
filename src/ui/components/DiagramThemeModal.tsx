import React, { useState } from 'react';
import { X, Check, Palette } from 'lucide-react';
import {
  DiagramThemeService,
  DiagramStylePreset,
  CustomDiagramColors,
} from '../../services/diagram-theme.service';
import { PresetSelectorGrid } from './diagram-theme/PresetSelectorGrid';
import { CustomColorPickers } from './diagram-theme/CustomColorPickers';
import { LiveMiniPreview } from './diagram-theme/LiveMiniPreview';

interface DiagramThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChanged: () => void;
}

export const DiagramThemeModal: React.FC<DiagramThemeModalProps> = ({
  isOpen,
  onClose,
  onThemeChanged,
}) => {
  const [activePreset, setActivePreset] = useState<DiagramStylePreset>(
    DiagramThemeService.getStylePreset()
  );
  const [customColors, setCustomColors] = useState<CustomDiagramColors>(
    DiagramThemeService.getCustomColors()
  );

  if (!isOpen) return null;

  const handleApply = () => {
    DiagramThemeService.setStylePreset(activePreset);
    if (activePreset === 'custom') {
      DiagramThemeService.setCustomColors(customColors);
    }
    onThemeChanged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-theme-surface border border-theme-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-bg/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-theme-accent/15 text-theme-accent flex items-center justify-center border border-theme-accent/30">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-text">تخصيص هوية ألوان المخططات</h3>
              <p className="text-[11px] text-theme-muted">اختر النمط المفضل أو صمم باليت الألوان الخاص بك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-text p-1.5 rounded-lg hover:bg-theme-border/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <PresetSelectorGrid activePreset={activePreset} onSelectPreset={setActivePreset} />

          {activePreset === 'custom' && (
            <CustomColorPickers customColors={customColors} onChange={setCustomColors} />
          )}

          <LiveMiniPreview activePreset={activePreset} customColors={customColors} />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-theme-border bg-theme-bg/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-theme-accent text-white hover:bg-theme-accent-hover text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>حفظ وتطبيق فوراً</span>
          </button>
        </div>
      </div>
    </div>
  );
};
