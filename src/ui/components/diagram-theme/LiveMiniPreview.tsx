import React from 'react';
import { DiagramStylePreset, CustomDiagramColors } from '../../../services/diagram-theme.service';

interface LiveMiniPreviewProps {
  activePreset: DiagramStylePreset;
  customColors: CustomDiagramColors;
}

export const LiveMiniPreview: React.FC<LiveMiniPreviewProps> = ({
  activePreset,
  customColors,
}) => {
  const startFill =
    activePreset === 'custom'
      ? customColors.startEndFill
      : activePreset === 'minimalist'
      ? '#27272a'
      : activePreset === 'modern'
      ? '#4f46e5'
      : '#059669';

  const startStroke =
    activePreset === 'custom'
      ? customColors.startEndStroke
      : activePreset === 'minimalist'
      ? '#52525b'
      : activePreset === 'modern'
      ? '#818cf8'
      : '#10b981';

  const procFill =
    activePreset === 'custom'
      ? customColors.processFill
      : activePreset === 'minimalist'
      ? '#18181b'
      : activePreset === 'modern'
      ? '#1e1838'
      : '#1e3a8a';

  const procStroke =
    activePreset === 'custom'
      ? customColors.processStroke
      : activePreset === 'minimalist'
      ? '#3f3f46'
      : activePreset === 'modern'
      ? '#a78bfa'
      : '#3b82f6';

  const arrowCol =
    activePreset === 'custom'
      ? customColors.arrowColor
      : activePreset === 'minimalist'
      ? '#71717a'
      : activePreset === 'modern'
      ? '#818cf8'
      : '#38bdf8';

  const textColor = activePreset === 'custom' ? customColors.textColor : '#ffffff';

  return (
    <div className="rounded-xl border border-theme-border bg-theme-bg p-4 flex flex-col items-center select-none">
      <span className="text-[10px] text-theme-muted font-mono mb-2 uppercase tracking-wider">
        معاينة حية للمخطط بالنمط المختار ({activePreset})
      </span>
      <div className="w-full max-w-sm flex justify-center" dir="ltr">
        <svg className="w-full h-20" viewBox="0 0 320 70" fill="none">
          <defs>
            <marker id="mini-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill={arrowCol} />
            </marker>
          </defs>

          {/* Start Node */}
          <rect x="15" y="18" width="80" height="32" rx="16" fill={startFill} stroke={startStroke} strokeWidth="1.75" />
          <text x="55" y="38" fill={textColor} fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
            البداية
          </text>

          {/* Arrow 1 */}
          <path d="M 96 34 L 128 34" stroke={arrowCol} strokeWidth="2" markerEnd="url(#mini-arr)" />

          {/* Process Node */}
          <rect x="132" y="16" width="90" height="36" rx="8" fill={procFill} stroke={procStroke} strokeWidth="1.75" />
          <text x="177" y="38" fill={textColor} fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
            العملية
          </text>

          {/* Arrow 2 */}
          <path d="M 223 34 L 255 34" stroke={arrowCol} strokeWidth="2" markerEnd="url(#mini-arr)" />

          {/* End Node */}
          <rect x="258" y="18" width="50" height="32" rx="8" fill={startFill} stroke={startStroke} strokeWidth="1.75" />
          <text x="283" y="38" fill={textColor} fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
            تم
          </text>
        </svg>
      </div>
    </div>
  );
};
