import React, { useRef } from 'react';
import { ImageLayer, ShapeStampLayer } from '../types';
import { M3Icon } from './M3Icon';
import { PRESET_STICKERS, PRESET_BADGES } from '../utils/designAssets';

interface ImagePropertiesPanelProps {
  imageLayers: ImageLayer[];
  shapeLayers: ShapeStampLayer[];
  selectedImageId: string | null;
  selectedShapeId: string | null;
  onUploadImage: (file: File) => void;
  onAddPresetSticker: (sticker: typeof PRESET_STICKERS[0]) => void;
  onAddPresetBadge: (badge: typeof PRESET_BADGES[0]) => void;
  onSelectImage: (id: string) => void;
  onSelectShape: (id: string) => void;
  onUpdateImage: (id: string, updates: Partial<ImageLayer>) => void;
  onUpdateShape: (id: string, updates: Partial<ShapeStampLayer>) => void;
  onDeleteImage: (id: string) => void;
  onDeleteShape: (id: string) => void;
  onDuplicateImage: (layer: ImageLayer) => void;
  onDuplicateShape?: (layer: ShapeStampLayer) => void;
}

export const ImagePropertiesPanel: React.FC<ImagePropertiesPanelProps> = ({
  imageLayers,
  shapeLayers,
  selectedImageId,
  selectedShapeId,
  onUploadImage,
  onAddPresetSticker,
  onAddPresetBadge,
  onSelectImage,
  onSelectShape,
  onUpdateImage,
  onUpdateShape,
  onDeleteImage,
  onDeleteShape,
  onDuplicateImage,
  onDuplicateShape,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedImage = imageLayers.find((img) => img.id === selectedImageId) || null;
  const selectedShape = shapeLayers.find((s) => s.id === selectedShapeId) || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUploadImage(file);
    }
  };

  const quickImageSizes = [64, 120, 180, 260, 360];

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Box (Drag & Drop + Click) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] rounded-[16px] p-3 text-center cursor-pointer bg-[var(--md-sys-color-surface-container-low)] transition flex flex-col items-center justify-center gap-1.5 hover:bg-[var(--md-sys-color-primary-container)]/15"
      >
        <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
          <M3Icon name="add_photo_alternate" size={20} />
        </div>
        <div>
          <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block">
            画像を挿入・アップロード
          </span>
          <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
            クリックまたは画像をここにドラッグ＆ドロップ (PNG/JPG/SVG/WebP)
          </span>
        </div>
      </div>

      {/* Preset Badges & Stamps (和文見出しバッジ・セール・合格印) */}
      <div>
        <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] mb-1.5 block">
          ワンタップ飾りバッジ (スタンプ)
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESET_BADGES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onAddPresetBadge(b)}
              className="py-1 px-1 rounded-[8px] text-[11px] font-black text-center shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer truncate"
              style={{
                backgroundColor: b.fillColor,
                color: b.textColor,
                border: b.borderColor ? `1.5px solid ${b.borderColor}` : 'none',
              }}
              title={b.label}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Decorative Stickers & Motifs (Crown, Star, Heart, Ribbon, Sakura) */}
      <div>
        <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] mb-1.5 block">
          装飾ステッカー・アイコン
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {PRESET_STICKERS.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onAddPresetSticker(st)}
              className="p-1.5 rounded-[10px] bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 flex flex-col items-center justify-center gap-1 cursor-pointer transition hover:scale-105"
              title={st.name}
            >
              <img src={st.svgDataUri} alt={st.name} className="w-6 h-6 object-contain" />
              <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] truncate w-full text-center">
                {st.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Image Controls */}
      {selectedImage ? (
        <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1">
              <M3Icon name="image" size={14} className="text-[var(--md-sys-color-primary)]" />
              <span>選択中の画像設定</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDuplicateImage(selectedImage)}
                className="p-1 rounded bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)] cursor-pointer"
                title="複製"
              >
                <M3Icon name="content_copy" size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteImage(selectedImage.id)}
                className="p-1 rounded bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] hover:opacity-90 cursor-pointer"
                title="削除"
              >
                <M3Icon name="delete" size={14} />
              </button>
            </div>
          </div>

          {/* Size (Width) Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">横幅サイズ</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="20"
                  max="600"
                  value={Math.round(selectedImage.width)}
                  onChange={(e) => {
                    const newW = Number(e.target.value) || 60;
                    const aspect = selectedImage.width / (selectedImage.height || 1);
                    onUpdateImage(selectedImage.id, {
                      width: newW,
                      height: Math.round(newW / aspect),
                    });
                  }}
                  className="w-14 h-5 px-1 text-right font-mono font-bold rounded bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-primary)]"
                />
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">px</span>
              </div>
            </div>

            <input
              type="range"
              min="30"
              max="500"
              value={Math.round(selectedImage.width)}
              onChange={(e) => {
                const newW = Number(e.target.value);
                const aspect = selectedImage.width / (selectedImage.height || 1);
                onUpdateImage(selectedImage.id, {
                  width: newW,
                  height: Math.round(newW / aspect),
                });
              }}
              className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
            />

            {/* Quick Size Presets */}
            <div className="flex items-center justify-between gap-1 mt-1">
              {quickImageSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    const aspect = selectedImage.width / (selectedImage.height || 1);
                    onUpdateImage(selectedImage.id, {
                      width: sz,
                      height: Math.round(sz / aspect),
                    });
                  }}
                  className="flex-1 py-0.5 rounded text-[9px] bg-[var(--md-sys-color-surface)] hover:text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline-variant)]/40 cursor-pointer"
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>

          {/* Opacity & Rotation */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">不透明度</span>
                <span className="font-mono text-[var(--md-sys-color-primary)]">
                  {selectedImage.opacity ?? 100}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={selectedImage.opacity ?? 100}
                onChange={(e) =>
                  onUpdateImage(selectedImage.id, { opacity: Number(e.target.value) })
                }
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">回転</span>
                <span className="font-mono text-[var(--md-sys-color-primary)]">
                  {selectedImage.rotation || 0}°
                </span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedImage.rotation || 0}
                onChange={(e) =>
                  onUpdateImage(selectedImage.id, { rotation: Number(e.target.value) })
                }
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
              />
            </div>
          </div>

          {/* Corner Radius & Border Frame */}
          <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-[var(--md-sys-color-outline-variant)]/30 pt-2">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">角丸 (Radius)</span>
                <span className="font-mono text-[var(--md-sys-color-primary)]">
                  {selectedImage.borderRadius || 0}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedImage.borderRadius || 0}
                onChange={(e) =>
                  onUpdateImage(selectedImage.id, { borderRadius: Number(e.target.value) })
                }
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">枠線太さ</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="color"
                    value={selectedImage.borderColor || '#FFFFFF'}
                    onChange={(e) =>
                      onUpdateImage(selectedImage.id, { borderColor: e.target.value })
                    }
                    className="w-4 h-4 rounded-full border border-black/10 cursor-pointer p-0 bg-transparent"
                  />
                  <span className="font-mono text-[var(--md-sys-color-primary)]">
                    {selectedImage.borderWidth || 0}px
                  </span>
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                value={selectedImage.borderWidth || 0}
                onChange={(e) =>
                  onUpdateImage(selectedImage.id, {
                    borderWidth: Number(e.target.value),
                    borderColor: selectedImage.borderColor || '#FFFFFF',
                  })
                }
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
              />
            </div>
          </div>

          {/* Shadow toggle */}
          <div className="flex items-center justify-between border-t border-[var(--md-sys-color-outline-variant)]/30 pt-2">
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
              ドロップシャドウ
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateImage(selectedImage.id, { hasShadow: !selectedImage.hasShadow })
              }
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                selectedImage.hasShadow
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                  : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
              }`}
            >
              {selectedImage.hasShadow ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      ) : selectedShape ? (
        /* Selected Shape / Stamp Controls */
        <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">
              バッジ・スタンプ設定
            </span>
            <div className="flex items-center gap-1">
              {onDuplicateShape && (
                <button
                  type="button"
                  onClick={() => onDuplicateShape(selectedShape)}
                  className="p-1 rounded bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)] cursor-pointer"
                  title="複製"
                >
                  <M3Icon name="content_copy" size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDeleteShape(selectedShape.id)}
                className="p-1 rounded bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] hover:opacity-90 cursor-pointer"
                title="削除"
              >
                <M3Icon name="delete" size={14} />
              </button>
            </div>
          </div>

          {/* Stamp Text */}
          {selectedShape.text !== undefined && (
            <div>
              <label className="block text-[10px] text-[var(--md-sys-color-on-surface-variant)] mb-0.5">
                バッジ内テキスト
              </label>
              <input
                type="text"
                value={selectedShape.text}
                onChange={(e) => onUpdateShape(selectedShape.id, { text: e.target.value })}
                className="w-full h-7 px-2 rounded bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-bold text-[var(--md-sys-color-on-surface)]"
              />
            </div>
          )}

          {/* Fill Color */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">背景色</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="color"
                value={selectedShape.fillColor}
                onChange={(e) => onUpdateShape(selectedShape.id, { fillColor: e.target.value })}
                className="w-5 h-5 rounded-full border border-black/10 cursor-pointer p-0 bg-transparent"
              />
              <span className="font-mono text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                {selectedShape.fillColor}
              </span>
            </label>
          </div>

          {/* Size & Rotation */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block mb-0.5">サイズ</span>
              <input
                type="range"
                min="40"
                max="300"
                value={selectedShape.width}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdateShape(selectedShape.id, { width: val, height: Math.round(val * 0.45) });
                }}
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
              />
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)] block mb-0.5">回転</span>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedShape.rotation || 0}
                onChange={(e) => onUpdateShape(selectedShape.id, { rotation: Number(e.target.value) })}
                className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Image / Stamp Layer List */
        (imageLayers.length > 0 || shapeLayers.length > 0) && (
          <div className="p-2.5 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs">
            <span className="font-bold text-[11px] text-[var(--md-sys-color-on-surface)] block mb-1">
              配置済み画像・スタンプ ({imageLayers.length + shapeLayers.length})
            </span>
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
              {imageLayers.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => onSelectImage(img.id)}
                  className="p-1.5 rounded-[6px] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-between cursor-pointer border border-[var(--md-sys-color-outline-variant)]/20"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <img src={img.src} alt="" className="w-5 h-5 rounded object-cover" />
                    <span className="truncate text-[11px]">{img.name || '画像レイヤー'}</span>
                  </div>
                  <span className="text-[10px] text-[var(--md-sys-color-primary)] font-mono">
                    {Math.round(img.width)}px
                  </span>
                </button>
              ))}

              {shapeLayers.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectShape(s.id)}
                  className="p-1.5 rounded-[6px] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-between cursor-pointer border border-[var(--md-sys-color-outline-variant)]/20"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: s.fillColor }}
                    />
                    <span className="truncate text-[11px]">{s.text || 'バッジ'}</span>
                  </div>
                  <span className="text-[10px] text-[var(--md-sys-color-primary)] font-mono">
                    {Math.round(s.width)}px
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};
