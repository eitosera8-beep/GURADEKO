import React from 'react';
import { TextLayer } from '../types';
import { M3Icon } from './M3Icon';
import { M3Dropdown } from './M3Dropdown';
import { JAPANESE_FONTS, JapaneseFont } from '../utils/japaneseFonts';
import { TEXT_GRADIENT_PRESETS } from '../utils/designAssets';

interface TextPropertiesPanelProps {
  textLayers: TextLayer[];
  selectedTextLayer: TextLayer | null;
  onAddText: () => void;
  onSelectText: (id: string) => void;
  onUpdateText: (id: string, updates: Partial<TextLayer>) => void;
  onDeleteText: (id: string) => void;
  onDuplicateText: (layer: TextLayer) => void;
  onOpenFontPicker: () => void;
}

export const TextPropertiesPanel: React.FC<TextPropertiesPanelProps> = ({
  textLayers,
  selectedTextLayer,
  onAddText,
  onSelectText,
  onUpdateText,
  onDeleteText,
  onDuplicateText,
  onOpenFontPicker,
}) => {
  const quickFonts = [
    { value: 'Noto Sans JP', label: 'Noto Sans JP (ゴシック)' },
    { value: 'Noto Serif JP', label: 'Noto Serif JP (明朝)' },
    { value: 'M PLUS 1p', label: 'M PLUS 1p (モダン)' },
    { value: 'Yuji Boku', label: '遊字 墨 (毛筆筆文字)' },
    { value: 'Dela Gothic One', label: 'Dela Gothic (極太見出し)' },
    { value: 'Potta One', label: 'Potta One (ポップ看板)' },
    { value: 'Zen Maru Gothic', label: 'Zen 丸ゴシック (親しみ丸)' },
    { value: 'Hachi Maru Pop', label: '8丸ポップ (手書き風)' },
  ];

  const quickSizes = [24, 48, 72, 100, 150, 220];

  return (
    <div className="flex flex-col gap-3">
      {/* Top Add Text Button */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onAddText}
          className="flex-1 py-2 px-3 rounded-[12px] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition cursor-pointer shadow-xs"
        >
          <M3Icon name="add" size={16} />
          <span>文字を追加</span>
        </button>

        {selectedTextLayer && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDuplicateText(selectedTextLayer)}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-[8px] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] transition cursor-pointer"
              title="レイヤーを複製"
            >
              <M3Icon name="content_copy" size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteText(selectedTextLayer.id)}
              className="w-8 h-8 shrink-0 flex items-center justify-center rounded-[8px] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] hover:opacity-90 transition cursor-pointer"
              title="削除"
            >
              <M3Icon name="delete" size={16} />
            </button>
          </div>
        )}
      </div>

      {selectedTextLayer ? (
        <div className="flex flex-col gap-3 p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 text-xs">
          {/* Text Input Content */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] mb-1">
              テキスト内容
            </label>
            <input
              type="text"
              value={selectedTextLayer.text}
              onChange={(e) => onUpdateText(selectedTextLayer.id, { text: e.target.value })}
              className="w-full h-8 px-2.5 rounded-[8px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] font-medium"
              placeholder="文字を入力..."
            />
          </div>

          {/* Font Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)]">
                和文フォント (50+種類)
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenFontPicker}
              className="w-full py-1.5 px-2.5 rounded-[10px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] font-bold flex items-center justify-between hover:bg-[var(--md-sys-color-primary-container)]/20 transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 truncate">
                <M3Icon name="font_download" size={16} />
                <span className="truncate">
                  {selectedTextLayer.fontLabel || selectedTextLayer.fontFamily}
                </span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] shrink-0">
                フォント変更
              </span>
            </button>

            {/* Quick font dropdown */}
            <div className="mt-1">
              <M3Dropdown
                id="quick-font-dropdown"
                label="定番フォント選択"
                variant="outlined"
                options={quickFonts}
                selectedValue={selectedTextLayer.fontFamily}
                onSelect={(fam) => {
                  const found = JAPANESE_FONTS.find((f) => f.family === fam);
                  if (found) {
                    onUpdateText(selectedTextLayer.id, {
                      fontFamily: found.family,
                      fontLabel: found.name,
                    });
                  }
                }}
              />
            </div>
          </div>

          {/* Font Size (Expanded up to 260px+) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)]">
                文字サイズ
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={selectedTextLayer.fontSize}
                  onChange={(e) =>
                    onUpdateText(selectedTextLayer.id, {
                      fontSize: Math.max(10, Math.min(300, Number(e.target.value) || 24)),
                    })
                  }
                  className="w-14 h-6 px-1.5 text-right font-mono font-bold rounded bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-primary)]"
                />
                <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">px</span>
              </div>
            </div>

            {/* Range Slider 10 - 260px */}
            <input
              type="range"
              min="10"
              max="260"
              value={selectedTextLayer.fontSize}
              onChange={(e) =>
                onUpdateText(selectedTextLayer.id, { fontSize: Number(e.target.value) })
              }
              className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5 bg-[var(--md-sys-color-surface)] rounded-lg"
            />

            {/* Quick Size Preset Buttons */}
            <div className="flex items-center justify-between gap-1 mt-1.5">
              {quickSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onUpdateText(selectedTextLayer.id, { fontSize: sz })}
                  className={`flex-1 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    selectedTextLayer.fontSize === sz
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                      : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color & Gradient Fill */}
          <div className="border-t border-[var(--md-sys-color-outline-variant)]/30 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)]">
                文字色・グラデーション文字
              </span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="color"
                  value={selectedTextLayer.color}
                  onChange={(e) =>
                    onUpdateText(selectedTextLayer.id, {
                      color: e.target.value,
                      gradientFill: undefined,
                    })
                  }
                  className="w-5 h-5 rounded-full border border-black/10 cursor-pointer p-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                  {selectedTextLayer.color}
                </span>
              </label>
            </div>

            {/* Gradient Fill Presets for Text */}
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => onUpdateText(selectedTextLayer.id, { gradientFill: undefined })}
                className={`py-1 px-1.5 rounded-[6px] text-[10px] text-center border cursor-pointer ${
                  !selectedTextLayer.gradientFill
                    ? 'border-[var(--md-sys-color-primary)] font-bold bg-[var(--md-sys-color-primary-container)]/30 text-[var(--md-sys-color-primary)]'
                    : 'border-[var(--md-sys-color-outline-variant)]/40 text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface)]'
                }`}
              >
                単色
              </button>
              {TEXT_GRADIENT_PRESETS.map((gp) => (
                <button
                  key={gp.id}
                  type="button"
                  onClick={() => onUpdateText(selectedTextLayer.id, { gradientFill: gp.id })}
                  className={`py-1 px-1.5 rounded-[6px] text-[10px] text-center border truncate cursor-pointer transition ${
                    selectedTextLayer.gradientFill === gp.id
                      ? 'border-[var(--md-sys-color-primary)] ring-1 ring-[var(--md-sys-color-primary)] font-bold text-black'
                      : 'border-[var(--md-sys-color-outline-variant)]/40 text-[var(--md-sys-color-on-surface)]'
                  }`}
                  style={{
                    background: gp.css,
                  }}
                  title={gp.name}
                >
                  <span className="bg-white/80 px-1 py-0.5 rounded text-[9px] font-bold">
                    {gp.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stroke / 袋文字 (Text Outline) */}
          <div className="border-t border-[var(--md-sys-color-outline-variant)]/30 pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)]">
                  袋文字・縁取り (Stroke)
                </span>
                <span className="text-[10px] text-[var(--md-sys-color-primary)] font-mono font-bold">
                  {selectedTextLayer.strokeWidth || 0}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* ON / OFF Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const isCurrentlyOn = Boolean(selectedTextLayer.strokeWidth && selectedTextLayer.strokeWidth > 0);
                    onUpdateText(selectedTextLayer.id, {
                      strokeWidth: isCurrentlyOn ? 0 : 4,
                      strokeColor: selectedTextLayer.strokeColor || '#000000',
                    });
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                    selectedTextLayer.strokeWidth && selectedTextLayer.strokeWidth > 0
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                      : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
                  }`}
                >
                  {selectedTextLayer.strokeWidth && selectedTextLayer.strokeWidth > 0 ? 'ON' : 'OFF'}
                </button>

                {/* Stroke color picker */}
                <label className="flex items-center gap-1 cursor-pointer" title="縁取り色を選択">
                  <input
                    type="color"
                    value={selectedTextLayer.strokeColor || '#000000'}
                    onChange={(e) => {
                      const newCol = e.target.value;
                      onUpdateText(selectedTextLayer.id, {
                        strokeColor: newCol,
                        // Auto-enable stroke with 4px if currently 0
                        strokeWidth:
                          selectedTextLayer.strokeWidth && selectedTextLayer.strokeWidth > 0
                            ? selectedTextLayer.strokeWidth
                            : 4,
                      });
                    }}
                    className="w-5 h-5 rounded-full border border-black/10 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                    {selectedTextLayer.strokeColor || '#000000'}
                  </span>
                </label>
              </div>
            </div>

            {/* Slider and direct numeric input */}
            <div className="flex items-center gap-2 mb-1.5">
              <input
                type="range"
                min="0"
                max="24"
                value={selectedTextLayer.strokeWidth || 0}
                onChange={(e) =>
                  onUpdateText(selectedTextLayer.id, {
                    strokeWidth: Number(e.target.value),
                    strokeColor: selectedTextLayer.strokeColor || '#000000',
                  })
                }
                className="flex-1 accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5 bg-[var(--md-sys-color-surface)] rounded-lg"
              />
              <div className="flex items-center gap-0.5">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={selectedTextLayer.strokeWidth || 0}
                  onChange={(e) =>
                    onUpdateText(selectedTextLayer.id, {
                      strokeWidth: Math.max(0, Math.min(40, Number(e.target.value) || 0)),
                      strokeColor: selectedTextLayer.strokeColor || '#000000',
                    })
                  }
                  className="w-11 h-6 px-1 text-center font-mono font-bold rounded bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-primary)]"
                />
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">px</span>
              </div>
            </div>

            {/* Quick Thickness Presets */}
            <div className="flex items-center justify-between gap-1 mb-1.5">
              {[
                { label: 'なし', val: 0 },
                { label: '細 2px', val: 2 },
                { label: '中 4px', val: 4 },
                { label: '太 8px', val: 8 },
                { label: '極太 14px', val: 14 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() =>
                    onUpdateText(selectedTextLayer.id, {
                      strokeWidth: p.val,
                      strokeColor: selectedTextLayer.strokeColor || '#000000',
                    })
                  }
                  className={`flex-1 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    (selectedTextLayer.strokeWidth || 0) === p.val
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold shadow-2xs'
                      : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/40'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Contrast Color Presets */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]/20">
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">おすすめ色:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { col: '#000000', title: '黒 (最定番)' },
                  { col: '#FFFFFF', title: '白 (ダーク背景用)' },
                  { col: '#1E3A8A', title: '紺色' },
                  { col: '#DC2626', title: '赤 (YouTubeサムネ風)' },
                  { col: '#F59E0B', title: 'オレンジ' },
                  { col: '#FACC15', title: '黄色' },
                ].map((item) => (
                  <button
                    key={item.col}
                    type="button"
                    onClick={() =>
                      onUpdateText(selectedTextLayer.id, {
                        strokeColor: item.col,
                        strokeWidth:
                          selectedTextLayer.strokeWidth && selectedTextLayer.strokeWidth > 0
                            ? selectedTextLayer.strokeWidth
                            : 4,
                      })
                    }
                    className={`w-5 h-5 rounded-full border cursor-pointer hover:scale-115 transition shadow-2xs ${
                      selectedTextLayer.strokeColor === item.col
                        ? 'ring-2 ring-[var(--md-sys-color-primary)] ring-offset-1'
                        : 'border-black/20'
                    }`}
                    style={{ backgroundColor: item.col }}
                    title={item.title}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Text Background Badge / 座布団 */}
          <div className="border-t border-[var(--md-sys-color-outline-variant)]/30 pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)]">
                文字背景帯・座布団
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateText(selectedTextLayer.id, {
                    backgroundColor: selectedTextLayer.backgroundColor
                      ? undefined
                      : 'rgba(0, 0, 0, 0.6)',
                  })
                }
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                  selectedTextLayer.backgroundColor
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                    : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
                }`}
              >
                {selectedTextLayer.backgroundColor ? 'ON' : 'OFF'}
              </button>
            </div>

            {selectedTextLayer.backgroundColor && (
              <div className="flex flex-col gap-2 p-2 rounded-[10px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">帯色</span>
                  <div className="flex items-center gap-1">
                    {[
                      'rgba(0,0,0,0.65)',
                      '#FFFFFF',
                      '#EF4444',
                      '#F59E0B',
                      '#2563EB',
                      '#059669',
                    ].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateText(selectedTextLayer.id, { backgroundColor: c })}
                        className="w-4 h-4 rounded-full border border-black/20 cursor-pointer hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">余白(Padding)</span>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={selectedTextLayer.backgroundPadding ?? 8}
                    onChange={(e) =>
                      onUpdateText(selectedTextLayer.id, {
                        backgroundPadding: Number(e.target.value),
                      })
                    }
                    className="w-24 accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
                  />
                  <span className="font-mono text-[var(--md-sys-color-primary)]">
                    {selectedTextLayer.backgroundPadding ?? 8}px
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Typography Controls: Weight, Shadow, Vertical Writing, Rotation */}
          <div className="border-t border-[var(--md-sys-color-outline-variant)]/30 pt-2 flex flex-wrap items-center justify-between gap-1.5">
            {/* Weight */}
            <div className="flex items-center rounded-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/40 p-0.5">
              {(['400', '700', '900'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onUpdateText(selectedTextLayer.id, { fontWeight: w })}
                  className={`px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer ${
                    (selectedTextLayer.fontWeight || '700') === w
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                      : 'text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {w === '400' ? '標準' : w === '700' ? '太字' : '極太'}
                </button>
              ))}
            </div>

            {/* Japanese Vertical Writing (縦書き) Toggle */}
            <button
              type="button"
              onClick={() =>
                onUpdateText(selectedTextLayer.id, { isVertical: !selectedTextLayer.isVertical })
              }
              className={`px-2 py-1 rounded-[8px] text-[10px] font-medium flex items-center gap-1 transition cursor-pointer ${
                selectedTextLayer.isVertical
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                  : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/40'
              }`}
              title="縦書き切替"
            >
              <M3Icon name="format_textdirection_vertical" size={13} />
              <span>縦書き</span>
            </button>

            {/* Shadow Toggle */}
            <button
              type="button"
              onClick={() =>
                onUpdateText(selectedTextLayer.id, {
                  hasShadow: selectedTextLayer.hasShadow === false,
                })
              }
              className={`px-2 py-1 rounded-[8px] text-[10px] font-medium flex items-center gap-0.5 transition cursor-pointer ${
                selectedTextLayer.hasShadow !== false
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] font-bold'
                  : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/40'
              }`}
            >
              <M3Icon name="shadow" size={13} /> 影
            </button>
          </div>

          {/* Letter Spacing & Rotation */}
          <div className="border-t border-[var(--md-sys-color-outline-variant)]/30 pt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">文字間隔</span>
                <span className="font-mono text-[var(--md-sys-color-primary)]">
                  {selectedTextLayer.letterSpacing || 0}px
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="24"
                value={selectedTextLayer.letterSpacing || 0}
                onChange={(e) =>
                  onUpdateText(selectedTextLayer.id, { letterSpacing: Number(e.target.value) })
                }
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">回転</span>
                <span className="font-mono text-[var(--md-sys-color-primary)]">
                  {selectedTextLayer.rotation || 0}°
                </span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedTextLayer.rotation || 0}
                onChange={(e) =>
                  onUpdateText(selectedTextLayer.id, { rotation: Number(e.target.value) })
                }
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] text-xs border border-[var(--md-sys-color-outline-variant)]/30">
          {textLayers.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-2">
              <M3Icon name="format_size" size={28} className="text-[var(--md-sys-color-primary)]/60" />
              <p className="font-bold text-[var(--md-sys-color-on-surface)]">テキストがありません</p>
              <p className="text-[11px]">「文字を追加」を押して、和文フォントや袋文字、座布団をデザインしましょう</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="font-bold text-[var(--md-sys-color-on-surface)] mb-1">テキストレイヤー一覧</p>
              {textLayers.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelectText(l.id)}
                  className="w-full text-left p-2 rounded-[8px] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs truncate border border-[var(--md-sys-color-outline-variant)]/30 cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate font-medium">{l.text}</span>
                  <span className="text-[10px] font-mono text-[var(--md-sys-color-primary)]">
                    {l.fontSize}px
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
