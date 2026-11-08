import React from 'react';
import { Layers, Sliders, Sparkles, Palette } from 'lucide-react';
import { DiagramStylePreset } from '../../../services/diagram-theme.service';

interface PresetSelectorGridProps {
  activePreset: DiagramStylePreset;
  onSelectPreset: (preset: DiagramStylePreset) => void;
}

export const PresetSelectorGrid: React.FC<PresetSelectorGridProps> = ({
  activePreset,
  onSelectPreset,
}) => {
  const presets: {
    id: DiagramStylePreset;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'corporate',
      title: 'المؤسسي (Visio / Lucidchart)',
      subtitle: 'ألوان هندسية معتمدة مع تدرجات وظلال احترافية',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      badge: 'الافتراضي',
    },
    {
      id: 'minimalist',
      title: 'الهادئ الموحد (Notion / Linear)',
      subtitle: 'خلفيات رمادية حيادية متجانسة تماماً مع المستند بدون تشتيت',
      icon: <Sliders className="w-5 h-5 text-slate-400" />,
    },
    {
      id: 'modern',
      title: 'العصري الفاخر (Obsidian / Raycast)',
      subtitle: 'بطاقات عائمة بحواف مستديرة وتوهج نيون مستقبلي',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'custom',
      title: 'نمط مخصص (Custom Palette)',
      subtitle: 'اختر الألوان الخاصة بك للبلوكات والأسهم والنصوص بحرية تامة',
      icon: <Palette className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {presets.map((preset) => {
        const isSelected = activePreset === preset.id;
        return (
          <div
            key={preset.id}
            onClick={() => onSelectPreset(preset.id)}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              isSelected
                ? 'border-theme-accent bg-theme-accent/10 shadow-xs'
                : 'border-theme-border hover:border-theme-border/80 bg-theme-bg/50 hover:bg-theme-bg'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-theme-surface border border-theme-border">
                {preset.icon}
              </div>
              {preset.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-theme-accent/20 text-theme-accent font-semibold border border-theme-accent/30 font-mono">
                  {preset.badge}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-xs text-theme-text mb-1">{preset.title}</h4>
              <p className="text-[11px] text-theme-muted leading-relaxed">{preset.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
