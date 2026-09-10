import React from 'react';
import { CanvasConfig, GradientFilterConfig } from '../types';
import { M3Icon } from './M3Icon';

interface CanvasFramePanelProps {
  canvasConfig: CanvasConfig;
  filters: GradientFilterConfig;
  onUpdateCanvasConfig: (updates: Partial<CanvasConfig>) => void;
  onUpdateFilter: (key: keyof GradientFilterConfig, val: any) => void;
}

export const CanvasFramePanel: React.FC<CanvasFramePanelProps> = ({
  canvasConfig,
  filters,
  onUpdateCanvasConfig,
  onUpdateFilter,
}) => {
  const resolutionPresets = [
    { label: 'Full HD (1920×1080)', w: 1920, h: 1080, aspect: '16:9' as const, hSize: 40, vSize: 40 },
    { label: '4K UHD (3840×2160)', w: 3840, h: 2160, aspect: '16:9' as const, hSize: 40, vSize: 40 },
    { label: 'スマホ壁紙 (1080×1920)', w: 1080, h: 1920, aspect: '9:16' as const, hSize: 26, vSize: 52 },
    { label: '正方形 SNS (1080×1080)', w: 1080, h: 1080, aspect: '1:1' as const, hSize: 36, vSize: 48 },
    { label: '𝕏 ヘッダー (1500×500)', w: 1500, h: 500, aspect: 'custom' as const, hSize: 48, vSize: 28 },
    { label: '𝕏 ポスト (1200×675)', w: 1200, h: 675, aspect: '16:9' as const, hSize: 40, vSize: 40 },
    { label: 'アイコン (512×512)', w: 512, h: 512, aspect: '1:1' as const, hSize: 36, vSize: 48 },
  ];

  const currentW = canvasConfig.customWidth || 1920;
  const currentH = canvasConfig.customHeight || 1080;
  const isLocked = canvasConfig.lockAspectRatio !== false;

  const handleApplyPreset = (preset: (typeof resolutionPresets)[0]) => {
    onUpdateCanvasConfig({
      aspectRatio: preset.aspect,
      customWidth: preset.w,
      customHeight: preset.h,
      resolutionPreset: preset.label,
      horizontalSize: preset.hSize,
      verticalSize: preset.vSize,
    });
  };

  const handleWidthChange = (val: number) => {
    const safeW = Math.max(100, Math.min(7680, val));
    if (isLocked) {
      const ratio = currentH / currentW;
      const newH = Math.round(safeW * ratio);
      onUpdateCanvasConfig({ customWidth: safeW, customHeight: newH });
    } else {
      onUpdateCanvasConfig({ customWidth: safeW });
    }
  };

  const handleHeightChange = (val: number) => {
    const safeH = Math.max(100, Math.min(7680, val));
    if (isLocked) {
      const ratio = currentW / currentH;
      const newW = Math.round(safeH * ratio);
      onUpdateCanvasConfig({ customWidth: newW, customHeight: safeH });
    } else {
      onUpdateCanvasConfig({ customHeight: safeH });
    }
  };

  const blendModes = [
    { id: 'normal', label: '通常 (Normal)' },
    { id: 'multiply', label: '乗算 (Multiply)' },
    { id: 'screen', label: 'スクリーン (Screen)' },
    { id: 'overlay', label: 'オーバーレイ (Overlay)' },
    { id: 'soft-light', label: 'ソフトライト (Soft Light)' },
    { id: 'hard-light', label: 'ハードライト (Hard Light)' },
    { id: 'color-dodge', label: '覆い焼き (Dodge)' },
    { id: 'difference', label: '差の絶対値 (Diff)' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Resolution & Custom Dimensions (自由なpx指定) */}
      <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1">
            <M3Icon name="aspect_ratio" size={14} className="text-[var(--md-sys-color-primary)]" />
            <span>解像度・自由なサイズ指定 (px)</span>
          </span>
          <span className="text-[10px] font-mono text-[var(--md-sys-color-primary)] font-bold">
            {currentW} × {currentH} px
          </span>
        </div>

        {/* Popular Resolution Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {resolutionPresets.map((preset) => {
            const isSelected =
              canvasConfig.customWidth === preset.w && canvasConfig.customHeight === preset.h;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2 rounded-[10px] text-left border cursor-pointer transition ${
                  isSelected
                    ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] font-bold'
                    : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <div className="text-[11px] truncate leading-tight">{preset.label}</div>
                <div className="text-[9px] opacity-75 font-mono mt-0.5">
                  {preset.w} × {preset.h}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Width & Height Input Row */}
        <div className="p-2 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] font-medium">幅 (W)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="100"
                max="7680"
                step="10"
                value={currentW}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full bg-[var(--md-sys-color-surface-container)] rounded-md px-2 py-1 text-xs font-mono font-bold text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 focus:border-[var(--md-sys-color-primary)] outline-none"
              />
              <span className="text-[10px] text-[var(--md-sys-color-outline)]">px</span>
            </div>
          </div>

          {/* Aspect Ratio Lock Toggle */}
          <button
            type="button"
            onClick={() => onUpdateCanvasConfig({ lockAspectRatio: !isLocked })}
            className={`p-1.5 rounded-lg border mt-2 transition cursor-pointer ${
              isLocked
                ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]/40'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-outline)] border-transparent'
            }`}
            title={isLocked ? '縦横比固定 ON' : '縦横比固定 OFF (自由変形)'}
          >
            <M3Icon name={isLocked ? 'link' : 'link_off'} size={15} />
          </button>

          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] font-medium">高さ (H)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="100"
                max="7680"
                step="10"
                value={currentH}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full bg-[var(--md-sys-color-surface-container)] rounded-md px-2 py-1 text-xs font-mono font-bold text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 focus:border-[var(--md-sys-color-primary)] outline-none"
              />
              <span className="text-[10px] text-[var(--md-sys-color-outline)]">px</span>
            </div>
          </div>
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

      {/* Blend Mode & Grain Effects */}
      <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs flex flex-col gap-2.5">
        <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1">
          <M3Icon name="tune" size={14} className="text-[var(--md-sys-color-primary)]" />
          <span>質感・グレイン & 描画モード</span>
        </span>

        {/* Blend Mode Selection */}
        <div>
          <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-medium mb-1 block">
            描画ブレンドモード (Blend Mode)
          </span>
          <div className="grid grid-cols-2 gap-1">
            {blendModes.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onUpdateFilter('blendMode', b.id)}
                className={`py-1 px-2 rounded-lg text-left text-[10px] border transition cursor-pointer truncate ${
                  (filters.blendMode || 'normal') === b.id
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold border-[var(--md-sys-color-primary)]'
                    : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Noise / Film Grain Intensity */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">
              フィルム粒子ノイズ (Film Grain)
            </span>
            <span className="font-mono text-[var(--md-sys-color-primary)] font-bold">
              {filters.noise || 0}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="70"
            value={filters.noise || 0}
            onChange={(e) => onUpdateFilter('noise', Number(e.target.value))}
            className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
          />

          {/* Noise Type Chips */}
          <div className="flex items-center gap-1 mt-1.5">
            {[
              { id: 'fine', label: '微細 (Fine)' },
              { id: 'medium', label: '標準 (Medium)' },
              { id: 'rough', label: '粗め (Rough)' },
              { id: 'paper', label: '和紙 (Paper)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdateFilter('noiseType', t.id)}
                className={`flex-1 py-0.5 px-1 rounded-md text-[9px] font-medium border text-center transition cursor-pointer ${
                  (filters.noiseType || 'medium') === t.id
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]/40 font-bold'
                    : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
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
