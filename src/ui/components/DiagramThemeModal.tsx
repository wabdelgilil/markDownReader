import React, { useState } from 'react';
import { X, Check, RotateCcw, Palette, Layers, Sparkles, Sliders } from 'lucide-react';
import {
  DiagramThemeService,
  DiagramStylePreset,
  CustomDiagramColors,
  DEFAULT_CUSTOM_COLORS,
} from '../../services/diagram-theme.service';

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

  const handleApply = () => {
    DiagramThemeService.setStylePreset(activePreset);
    if (activePreset === 'custom') {
      DiagramThemeService.setCustomColors(customColors);
    }
    onThemeChanged();
    onClose();
  };

  const handleResetDefaults = () => {
    setCustomColors({ ...DEFAULT_CUSTOM_COLORS });
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
            className="text-theme-muted hover:text-theme-text p-1.5 rounded-lg hover:bg-theme-border/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setActivePreset(preset.id)}
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

          {/* Custom Palette Editor (Visible when 'custom' is active) */}
          {activePreset === 'custom' && (
            <div className="p-4 rounded-xl border border-theme-border bg-theme-bg/80 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-theme-border pb-2.5">
                <span className="font-semibold text-xs text-theme-text flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>محرر الألوان المخصص</span>
                </span>
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1 text-[11px] text-theme-muted hover:text-theme-text transition-colors"
                  title="استعادة القيم الافتراضية"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>استعادة الافتراضي</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Process Fill & Stroke */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
                  <span className="text-theme-muted">خلفية بلوك العملية:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.processFill}
                      onChange={(e) => setCustomColors({ ...customColors, processFill: e.target.value })}
                      className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-theme-text">{customColors.processFill}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
                  <span className="text-theme-muted">إطار بلوك العملية:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.processStroke}
                      onChange={(e) => setCustomColors({ ...customColors, processStroke: e.target.value })}
                      className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-theme-text">{customColors.processStroke}</span>
                  </div>
                </div>

                {/* Start / End Fill & Stroke */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
                  <span className="text-theme-muted">خلفية البداية والنهاية:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.startEndFill}
                      onChange={(e) => setCustomColors({ ...customColors, startEndFill: e.target.value })}
                      className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-theme-text">{customColors.startEndFill}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
                  <span className="text-theme-muted">إطار البداية والنهاية:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.startEndStroke}
                      onChange={(e) => setCustomColors({ ...customColors, startEndStroke: e.target.value })}
                      className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-theme-text">{customColors.startEndStroke}</span>
                  </div>
                </div>

                {/* Decision Diamond */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
                  <span className="text-theme-muted">خلفية معين القرار:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.decisionFill}
                      onChange={(e) => setCustomColors({ ...customColors, decisionFill: e.target.value })}
                      className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-theme-text">{customColors.decisionFill}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
                  <span className="text-theme-muted">إطار معين القرار:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.decisionStroke}
                      onChange={(e) => setCustomColors({ ...customColors, decisionStroke: e.target.value })}
                      className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-theme-text">{customColors.decisionStroke}</span>
                  </div>
                </div>

                {/* Arrows and Text */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
                  <span className="text-theme-muted">لون الأسهم وخطوط الربط:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.arrowColor}
                      onChange={(e) => setCustomColors({ ...customColors, arrowColor: e.target.value })}
                      className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-theme-text">{customColors.arrowColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-theme-surface border border-theme-border">
                  <span className="text-theme-muted">لون النصوص داخل البلوكات:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.textColor}
                      onChange={(e) => setCustomColors({ ...customColors, textColor: e.target.value })}
                      className="w-7 h-7 rounded border border-theme-border cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-theme-text">{customColors.textColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Mini Preview Canvas */}
          <div className="rounded-xl border border-theme-border bg-theme-bg p-4 flex flex-col items-center">
            <span className="text-[10px] text-theme-muted font-mono mb-2 uppercase tracking-wider">
              معاينة حية للمخطط بالنمط المختار ({activePreset})
            </span>
            <div className="w-full max-w-sm flex justify-center" dir="ltr">
              <svg className="w-full h-24" viewBox="0 0 320 80" fill="none">
                {/* Start Node */}
                <rect
                  x="10"
                  y="24"
                  width="85"
                  height="32"
                  rx="16"
                  fill={
                    activePreset === 'custom'
                      ? customColors.startEndFill
                      : activePreset === 'minimalist'
                      ? '#27272a'
                      : activePreset === 'modern'
                      ? '#4f46e5'
                      : '#059669'
                  }
                  stroke={
                    activePreset === 'custom'
                      ? customColors.startEndStroke
                      : activePreset === 'minimalist'
                      ? '#52525b'
                      : activePreset === 'modern'
                      ? '#818cf8'
                      : '#10b981'
                  }
                  strokeWidth="1.75"
                />
                <text
                  x="52"
                  y="44"
                  fill={activePreset === 'custom' ? customColors.textColor : '#ffffff'}
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  🚀 البداية
                </text>

                {/* Arrow 1 */}
                <path
                  d="M 96 40 L 125 40"
                  stroke={
                    activePreset === 'custom'
                      ? customColors.arrowColor
                      : activePreset === 'minimalist'
                      ? '#71717a'
                      : activePreset === 'modern'
                      ? '#818cf8'
                      : '#38bdf8'
                  }
                  strokeWidth="2"
                  markerEnd="url(#mini-arr)"
                />

                {/* Process Node */}
                <rect
                  x="130"
                  y="22"
                  width="95"
                  height="36"
                  rx="8"
                  fill={
                    activePreset === 'custom'
                      ? customColors.processFill
                      : activePreset === 'minimalist'
                      ? '#18181b'
                      : activePreset === 'modern'
                      ? '#1e1838'
                      : '#1e3a8a'
                  }
                  stroke={
                    activePreset === 'custom'
                      ? customColors.processStroke
                      : activePreset === 'minimalist'
                      ? '#3f3f46'
                      : activePreset === 'modern'
                      ? '#a78bfa'
                      : '#3b82f6'
                  }
                  strokeWidth="1.75"
                />
                <text
                  x="177"
                  y="44"
                  fill={activePreset === 'custom' ? customColors.textColor : '#ffffff'}
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  العملية
                </text>

                {/* Arrow 2 */}
                <path
                  d="M 226 40 L 255 40"
                  stroke={
                    activePreset === 'custom'
                      ? customColors.arrowColor
                      : activePreset === 'minimalist'
                      ? '#71717a'
                      : activePreset === 'modern'
                      ? '#22d3ee'
                      : '#f59e0b'
                  }
                  strokeWidth="2"
                  markerEnd="url(#mini-arr)"
                />

                {/* Decision / End */}
                <rect
                  x="260"
                  y="24"
                  width="50"
                  height="32"
                  rx="8"
                  fill={
                    activePreset === 'custom'
                      ? customColors.decisionFill
                      : activePreset === 'minimalist'
                      ? '#27272a'
                      : activePreset === 'modern'
                      ? '#0c1d2e'
                      : '#b45309'
                  }
                  stroke={
                    activePreset === 'custom'
                      ? customColors.decisionStroke
                      : activePreset === 'minimalist'
                      ? '#52525b'
                      : activePreset === 'modern'
                      ? '#22d3ee'
                      : '#f59e0b'
                  }
                  strokeWidth="1.75"
                />
                <text
                  x="285"
                  y="44"
                  fill={activePreset === 'custom' ? customColors.textColor : '#ffffff'}
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  ✅ تم
                </text>

                <defs>
                  <marker id="mini-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path
                      d="M 0 0 L 6 3 L 0 6 z"
                      fill={
                        activePreset === 'custom'
                          ? customColors.arrowColor
                          : activePreset === 'minimalist'
                          ? '#71717a'
                          : activePreset === 'modern'
                          ? '#818cf8'
                          : '#38bdf8'
                      }
                    />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-theme-border bg-theme-bg/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-theme-muted hover:text-theme-text transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-theme-accent text-white hover:bg-theme-accent-hover text-xs font-semibold shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>حفظ وتطبيق فوراً</span>
          </button>
        </div>
      </div>
    </div>
  );
};
