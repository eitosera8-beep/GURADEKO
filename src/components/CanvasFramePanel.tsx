import React from 'react';
import { CanvasConfig, GradientFilterConfig } from '../types';
import { M3Icon } from './M3Icon';

interface CanvasFramePanelProps {
  canvasConfig: CanvasConfig;
  filters: GradientFilterConfig;
  onUpdateCanvasConfig: (updates: Partial<CanvasConfig>) => void;
  onUpdateFilter: (key: keyof GradientFilterConfig, val: number) => void;
}

export const CanvasFramePanel: React.FC<CanvasFramePanelProps> = ({
  canvasConfig,
  filters,
  onUpdateCanvasConfig,
  onUpdateFilter,
}) => {
  const aspectRatios = [
    { label: '16:9 (横長/動画)', hSize: 40, vSize: 40, aspect: '16:9' as const },
    { label: '1:1 (正方形/SNS)', hSize: 36, vSize: 48, aspect: '1:1' as const },
    { label: '9:16 (縦長/ストーリー)', hSize: 26, vSize: 52, aspect: '9:16' as const },
    { label: '4:3 (標準バナー)', hSize: 40, vSize: 46, aspect: '4:3' as const },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Aspect Ratio Presets */}
      <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs">
        <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] mb-2 block">
          キャンバス縦横比・比率プリセット
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {aspectRatios.map((ar) => (
            <button
              key={ar.label}
              type="button"
              onClick={() =>
                onUpdateCanvasConfig({
                  aspectRatio: ar.aspect,
                  horizontalSize: ar.hSize,
                  verticalSize: ar.vSize,
                })
              }
              className={`p-2 rounded-[10px] text-left border cursor-pointer transition ${
                canvasConfig.aspectRatio === ar.aspect
                  ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] font-bold'
                  : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <div className="text-[11px] truncate">{ar.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Border (額縁・飾り枠線) */}
      <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1">
            <M3Icon name="crop_free" size={14} className="text-[var(--md-sys-color-primary)]" />
            <span>飾り額縁・外枠ボーダー</span>
          </span>
          <div className="flex items-center gap-1">
            <label className="cursor-pointer flex items-center">
              <input
                type="color"
                value={canvasConfig.frameBorderColor || '#FFFFFF'}
                onChange={(e) => onUpdateCanvasConfig({ frameBorderColor: e.target.value })}
                className="w-4 h-4 rounded-full border border-black/10 cursor-pointer p-0 bg-transparent"
              />
            </label>
            <span className="text-[10px] font-mono text-[var(--md-sys-color-primary)]">
              {canvasConfig.frameBorderWidth || 0}px
            </span>
          </div>
        </div>

        {/* Border Width */}
        <div>
          <div className="flex items-center justify-between mb-0.5 text-[10px]">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">枠線の太さ</span>
            <div className="flex items-center gap-1">
              {[0, 4, 8, 16].map((bw) => (
                <button
                  key={bw}
                  type="button"
                  onClick={() => onUpdateCanvasConfig({ frameBorderWidth: bw })}
                  className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer ${
                    (canvasConfig.frameBorderWidth || 0) === bw
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                      : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {bw === 0 ? 'なし' : `${bw}px`}
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            value={canvasConfig.frameBorderWidth || 0}
            onChange={(e) => onUpdateCanvasConfig({ frameBorderWidth: Number(e.target.value) })}
            className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
          />
        </div>

        {/* Border Radius */}
        <div>
          <div className="flex items-center justify-between mb-0.5 text-[10px]">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">枠線の角丸</span>
            <span className="font-mono text-[var(--md-sys-color-primary)]">
              {canvasConfig.frameBorderRadius ?? 24}px
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={canvasConfig.frameBorderRadius ?? 24}
            onChange={(e) => onUpdateCanvasConfig({ frameBorderRadius: Number(e.target.value) })}
            className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
          />
        </div>
      </div>

      {/* Canvas Effects & Filters */}
      <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs flex flex-col gap-2.5">
        <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1">
          <M3Icon name="tune" size={14} className="text-[var(--md-sys-color-primary)]" />
          <span>フィルター・質感エフェクト</span>
        </span>

        {/* Noise / Film Grain */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">
              ノイズ・粒子テクスチャ (Noise Grain)
            </span>
            <span className="font-mono text-[var(--md-sys-color-primary)]">
              {filters.noise || 0}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={filters.noise || 0}
            onChange={(e) => onUpdateFilter('noise', Number(e.target.value))}
            className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">明度 (Brightness)</span>
            <span className="font-mono text-[var(--md-sys-color-primary)]">{filters.brightness}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="160"
            value={filters.brightness}
            onChange={(e) => onUpdateFilter('brightness', Number(e.target.value))}
            className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">コントラスト</span>
            <span className="font-mono text-[var(--md-sys-color-primary)]">{filters.contrast}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="160"
            value={filters.contrast}
            onChange={(e) => onUpdateFilter('contrast', Number(e.target.value))}
            className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
          />
        </div>

        {/* Blur */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">背景ぼかし (Blur)</span>
            <span className="font-mono text-[var(--md-sys-color-primary)]">{filters.blur || 0}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={filters.blur || 0}
            onChange={(e) => onUpdateFilter('blur', Number(e.target.value))}
            className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
          />
        </div>
      </div>
    </div>
  );
};
