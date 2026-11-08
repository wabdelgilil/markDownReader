import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';
import { CustomDiagramColors, DEFAULT_CUSTOM_COLORS } from '../../../services/diagram-theme.service';

interface CustomColorPickersProps {
  customColors: CustomDiagramColors;
  onChange: (colors: CustomDiagramColors) => void;
}

export const CustomColorPickers: React.FC<CustomColorPickersProps> = ({
  customColors,
  onChange,
}) => {
  const handleResetDefaults = () => {
    onChange({ ...DEFAULT_CUSTOM_COLORS });
  };

  const fields: { key: keyof CustomDiagramColors; label: string }[] = [
    { key: 'processFill', label: 'خلفية بلوك العملية' },
    { key: 'processStroke', label: 'إطار بلوك العملية' },
    { key: 'startEndFill', label: 'خلفية البداية والنهاية' },
    { key: 'startEndStroke', label: 'إطار البداية والنهاية' },
    { key: 'decisionFill', label: 'خلفية معين القرار' },
    { key: 'decisionStroke', label: 'إطار معين القرار' },
    { key: 'arrowColor', label: 'لون الأسهم وخطوط الربط' },
    { key: 'textColor', label: 'لون النصوص داخل البلوكات' },
  ];

  return (
    <div className="p-4 rounded-xl border border-theme-border bg-theme-bg/80 space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-theme-border pb-2.5">
        <span className="font-semibold text-xs text-theme-text flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>محرر الألوان المخصص</span>
        </span>
        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1 text-[11px] text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
          title="استعادة القيم الافتراضية"
        >
          <RotateCcw className="w-3 h-3" />
          <span>استعادة الافتراضي</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
            <span className="text-theme-muted">{label}:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColors[key]}
                onChange={(e) => onChange({ ...customColors, [key]: e.target.value })}
                className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
              />
              <span className="font-mono text-[11px] text-theme-text">{customColors[key]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
