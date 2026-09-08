import React, { useRef } from 'react';
import { M3Icon } from './M3Icon';

interface CanvasTransformBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  isSelected: boolean;
  boxWidth: number;
  boxHeight: number;
  zoomScale?: number;
  type: 'text' | 'image' | 'shape';
  fontSize?: number;
  onResize?: (newWidth: number, newHeight: number, newFontSize?: number) => void;
  onRotate?: (newRotation: number) => void;
  onAlignHorizontalCenter?: () => void;
  onAlignVerticalCenter?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onQuickSizeChange?: (delta: number) => void;
  onEditInline?: () => void;
  children: React.ReactNode;
}

export const CanvasTransformBox: React.FC<CanvasTransformBoxProps> = ({
  x,
  y,
  width,
  height,
  rotation = 0,
  isSelected,
  boxWidth,
  boxHeight,
  zoomScale = 1,
  type,
  fontSize,
  onResize,
  onRotate,
  onAlignHorizontalCenter,
  onAlignVerticalCenter,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
  onQuickSizeChange,
  onEditInline,
  children,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);

  // Corner resize handling
  const handleCornerPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    corner: 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onResize) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startWidth = width;
    const startHeight = height;
    const startFontSize = fontSize || 32;
    const safeZoom = zoomScale || 1;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const dx = (moveEv.clientX - startClientX) / safeZoom;
      const dy = (moveEv.clientY - startClientY) / safeZoom;

      let scaleFactor = 1;
      if (corner === 'se') {
        scaleFactor = Math.max(0.2, (startWidth + dx) / startWidth);
      } else if (corner === 'nw') {
        scaleFactor = Math.max(0.2, (startWidth - dx) / startWidth);
      } else if (corner === 'ne') {
        scaleFactor = Math.max(0.2, (startWidth + dx) / startWidth);
      } else if (corner === 'sw') {
        scaleFactor = Math.max(0.2, (startWidth - dx) / startWidth);
      }

      if (type === 'text') {
        const newFontSize = Math.round(Math.max(12, Math.min(260, startFontSize * scaleFactor)));
        onResize(startWidth * scaleFactor, startHeight * scaleFactor, newFontSize);
      } else {
        const newW = Math.round(Math.max(30, Math.min(boxWidth, startWidth * scaleFactor)));
        const newH = Math.round(Math.max(30, Math.min(boxHeight, startHeight * scaleFactor)));
        onResize(newW, newH);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Rotation handling
  const handleRotatePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onRotate) return;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      if (!boxRef.current) return;
      const rect = boxRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radians = Math.atan2(moveEv.clientY - centerY, moveEv.clientX - centerX);
      let degrees = Math.round(radians * (180 / Math.PI)) + 90;
      if (degrees > 180) degrees -= 360;
      if (degrees < -180) degrees += 360;

      // Snap to 0, 45, 90, 180 within 4 degrees
      if (Math.abs(degrees) < 4) degrees = 0;
      if (Math.abs(degrees - 90) < 4) degrees = 90;
      if (Math.abs(degrees + 90) < 4) degrees = -90;
      if (Math.abs(Math.abs(degrees) - 180) < 4) degrees = 180;

      onRotate(degrees);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      ref={boxRef}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
      className={`absolute select-none z-20 ${
        isSelected ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Target Content */}
      <div className="pointer-events-auto">{children}</div>

      {/* When Selected: Interactive Bounding Box & Handles */}
      {isSelected && (
        <>
          {/* Active selection outline */}
          <div className="absolute -inset-1.5 border-2 border-[var(--md-sys-color-primary)] rounded-[6px] pointer-events-none shadow-xs" />

          {/* Floating Quick Action Toolbar (Above Element) */}
          <div
            data-transform-handle="true"
            onPointerDown={(e) => e.stopPropagation()}
            style={{ transform: `rotate(${-rotation}deg)` }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[var(--md-sys-color-surface-container-highest)]/95 backdrop-blur-md px-2 py-1 rounded-full shadow-lg border border-[var(--md-sys-color-outline-variant)]/60 flex items-center gap-1 z-40 text-xs whitespace-nowrap pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Quick Size Decrease */}
            {onQuickSizeChange && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickSizeChange(-1);
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center cursor-pointer transition"
                title={type === 'text' ? '文字サイズ縮小' : 'サイズ縮小'}
              >
                <M3Icon name="remove" size={14} />
              </button>
            )}

            {/* Current Size Label */}
            {type === 'text' && fontSize && (
              <span className="text-[10px] font-mono px-1 font-bold text-[var(--md-sys-color-primary)]">
                {fontSize}px
              </span>
            )}

            {/* Quick Size Increase */}
            {onQuickSizeChange && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickSizeChange(1);
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center cursor-pointer transition"
                title={type === 'text' ? '文字サイズ拡大' : 'サイズ拡大'}
              >
                <M3Icon name="add" size={14} />
              </button>
            )}

            <div className="w-[1px] h-4 bg-[var(--md-sys-color-outline-variant)]/50 mx-0.5" />

            {/* Align Horizontal Center */}
            {onAlignHorizontalCenter && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onAlignHorizontalCenter();
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center cursor-pointer transition"
                title="水平中央に配置"
              >
                <M3Icon name="align_horizontal_center" size={14} />
              </button>
            )}

            {/* Align Vertical Center */}
            {onAlignVerticalCenter && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onAlignVerticalCenter();
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center cursor-pointer transition"
                title="垂直中央に配置"
              >
                <M3Icon name="align_vertical_center" size={14} />
              </button>
            )}

            <div className="w-[1px] h-4 bg-[var(--md-sys-color-outline-variant)]/50 mx-0.5" />

            {/* Bring Forward / Send Backward */}
            {onBringForward && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onBringForward();
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center cursor-pointer transition"
                title="前面へ"
              >
                <M3Icon name="flip_to_front" size={14} />
              </button>
            )}
            {onSendBackward && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onSendBackward();
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center cursor-pointer transition"
                title="背面へ"
              >
                <M3Icon name="flip_to_back" size={14} />
              </button>
            )}

            {/* Edit Inline (for text) */}
            {type === 'text' && onEditInline && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditInline();
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] flex items-center justify-center cursor-pointer transition"
                title="文字を編集"
              >
                <M3Icon name="edit" size={14} />
              </button>
            )}

            {/* Duplicate */}
            {onDuplicate && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center cursor-pointer transition"
                title="複製 (Ctrl+D)"
              >
                <M3Icon name="content_copy" size={14} />
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] flex items-center justify-center cursor-pointer transition"
                title="削除 (Del / Backspace)"
              >
                <M3Icon name="delete" size={14} />
              </button>
            )}
          </div>

          {/* 4 Corner Resize Handles */}
          {/* Top-Left NW */}
          <div
            data-transform-handle="true"
            onPointerDown={(e) => handleCornerPointerDown(e, 'nw')}
            className="absolute -top-2.5 -left-2.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--md-sys-color-primary)] shadow-sm cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform"
            title="サイズ変更 (左上)"
          />
          {/* Top-Right NE */}
          <div
            data-transform-handle="true"
            onPointerDown={(e) => handleCornerPointerDown(e, 'ne')}
            className="absolute -top-2.5 -right-2.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--md-sys-color-primary)] shadow-sm cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform"
            title="サイズ変更 (右上)"
          />
          {/* Bottom-Right SE */}
          <div
            data-transform-handle="true"
            onPointerDown={(e) => handleCornerPointerDown(e, 'se')}
            className="absolute -bottom-2.5 -right-2.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--md-sys-color-primary)] shadow-sm cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform"
            title="サイズ変更 (右下)"
          />
          {/* Bottom-Left SW */}
          <div
            data-transform-handle="true"
            onPointerDown={(e) => handleCornerPointerDown(e, 'sw')}
            className="absolute -bottom-2.5 -left-2.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--md-sys-color-primary)] shadow-sm cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform"
            title="サイズ変更 (左下)"
          />

          {/* Rotation Handle (Stems upward) */}
          <div
            data-transform-handle="true"
            className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
          >
            <div
              data-transform-handle="true"
              onPointerDown={handleRotatePointerDown}
              className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--md-sys-color-primary)] shadow-sm cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
              title="ドラッグして回転"
            />
            <div className="w-[1.5px] h-3 bg-[var(--md-sys-color-primary)] pointer-events-none" />
          </div>
        </>
      )}
    </div>
  );
};
