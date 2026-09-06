import React from 'react';
import { motion } from 'motion/react';
import { M3Button } from './M3Button';
import { M3Slider } from './M3Slider';
import { M3Dropdown } from './M3Dropdown';
import { M3Checkbox } from './M3Checkbox';
import { CanvasConfig, ExportFormat } from '../types';

interface CreateScreenProps {
  canvasConfig: CanvasConfig;
  onCanvasConfigChange: (config: CanvasConfig) => void;
  onNavigateHome: () => void;
  onNavigateEditor: () => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({
  canvasConfig,
  onCanvasConfigChange,
  onNavigateHome,
  onNavigateEditor,
}) => {
  const { verticalSize, horizontalSize, fileFormat, isGenki } = canvasConfig;

  const handleVerticalChange = (val: number) => {
    onCanvasConfigChange({ ...canvasConfig, verticalSize: val });
  };

  const handleHorizontalChange = (val: number) => {
    onCanvasConfigChange({ ...canvasConfig, horizontalSize: val });
  };

  const handleFormatSelect = (val: string) => {
    onCanvasConfigChange({ ...canvasConfig, fileFormat: val as ExportFormat });
  };

  const handleGenkiChange = (checked: boolean) => {
    onCanvasConfigChange({ ...canvasConfig, isGenki: checked });
  };

  // 412x220 container inner proportional box
  // "ボックスは、左の設定メニューの縦サイズ・横サイズの値に大きさが比例するようにする 例えると縦サイズのスライダーの値が40％なら縦の大きさを40にする。"
  // We compute proportional size relative to max bounds (360x170)
  const previewWidth = Math.max(30, Math.round((horizontalSize / 100) * 360));
  const previewHeight = Math.max(20, Math.round((verticalSize / 100) * 170));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center p-6 overflow-auto"
    >
      <div className="flex flex-row items-center justify-center gap-6 min-w-max mx-auto my-auto">
        {/* Leftmost: 「戻る」のトーナルボタン（arrow_back アイコン付き）（幅 136dp） */}
        <div className="shrink-0">
          <M3Button
            id="btn-create-back"
            variant="tonal"
            icon="arrow_back"
            width={136}
            onClick={onNavigateHome}
          >
            戻る
          </M3Button>
        </div>

        {/* 792×688dp box (background primaryContainer, rounded top 18dp, bottom 28dp) */}
        <div
          id="preview-canvas-outer-box"
          style={{ width: '792px', height: '688px' }}
          className="relative bg-[var(--md-sys-color-primary-container)] rounded-t-[18px] rounded-b-[28px] shadow-sm flex items-center justify-center shrink-0 border border-[var(--md-sys-color-outline-variant)]/20"
        >
          {/* Centered 412×220dp box (background surface, rounded top 28dp, bottom 28dp) */}
          <div
            id="preview-canvas-middle-box"
            style={{ width: '412px', height: '220px' }}
            className="relative bg-[var(--md-sys-color-surface)] rounded-t-[28px] rounded-b-[28px] shadow-md flex flex-col items-center justify-center p-4 border border-[var(--md-sys-color-outline-variant)]/30 overflow-hidden"
          >
            {/* Proportional canvas box representing vertical/horizontal size sliders */}
            <div
              className="rounded-[12px] bg-[var(--md-sys-color-primary)] flex flex-col items-center justify-center text-[var(--md-sys-color-on-primary)] shadow-sm transition-all duration-150"
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
              }}
            >
              <span className="text-[13px] font-bold tracking-tight">
                {horizontalSize}% × {verticalSize}%
              </span>
              <span className="text-[10px] opacity-80 mt-0.5">
                {Math.round(horizontalSize * 19.2)} × {Math.round(verticalSize * 10.8)} px
              </span>
            </div>

            <span className="absolute bottom-2 text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
              サイズプレビュー（比率: 横 {horizontalSize}% / 縦 {verticalSize}%）
            </span>
          </div>
        </div>

        {/* Configuration Controls Column */}
        <div className="flex flex-col gap-4 shrink-0 w-[360px]">
          {/* 360×228dp box (background surfaceContainerHigh, rounded top 28dp, bottom 28dp) */}
          <div
            id="size-controls-box"
            style={{ width: '360px', height: '228px' }}
            className="bg-[var(--md-sys-color-surface-container-high)] rounded-t-[28px] rounded-b-[28px] p-5 flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)]/30 shadow-sm"
          >
            {/* 縦サイズ */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[22px] font-bold leading-tight text-[var(--md-sys-color-on-surface)]">
                  縦サイズ
                </span>
                <span className="text-[14px] font-semibold text-[var(--md-sys-color-primary)]">
                  {verticalSize}%
                </span>
              </div>
              <M3Slider
                value={verticalSize}
                onChange={handleVerticalChange}
                ariaLabel="縦サイズスライダー"
              />
            </div>

            {/* 横サイズ */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[22px] font-bold leading-tight text-[var(--md-sys-color-on-surface)]">
                  横サイズ
                </span>
                <span className="text-[14px] font-semibold text-[var(--md-sys-color-primary)]">
                  {horizontalSize}%
                </span>
              </div>
              <M3Slider
                value={horizontalSize}
                onChange={handleHorizontalChange}
                ariaLabel="横サイズスライダー"
              />
            </div>
          </div>

          {/* Label "ファイル形式" filled dropdown (options: png, jpg, svg) with leading folder icon */}
          <div className="w-full">
            <M3Dropdown
              id="dropdown-file-format"
              label="ファイル形式"
              leadingIcon="folder"
              variant="filled"
              placeholder="ファイル形式を選択"
              selectedValue={fileFormat}
              onSelect={handleFormatSelect}
              options={[
                { label: 'PNG (高画質・透過対応)', value: 'png' },
                { label: 'JPG (標準写真形式)', value: 'jpg' },
                { label: 'SVG (ベクター画像)', value: 'svg' },
              ]}
            />
          </div>

          {/* "元気ですか？" checkbox (initial unchecked) */}
          <div className="w-full">
            <M3Checkbox
              id="checkbox-genki"
              checked={isGenki}
              onChange={handleGenkiChange}
              label="元気ですか？"
            />
          </div>

          {/* "確定" filled button (check icon) */}
          <div className="w-full mt-1">
            <M3Button
              id="btn-create-confirm"
              variant="filled"
              icon="check"
              className="w-full"
              onClick={onNavigateEditor}
            >
              確定
            </M3Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
