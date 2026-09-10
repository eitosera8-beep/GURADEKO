import React from 'react';
import { M3Icon } from './M3Icon';

interface CanvasViewportToolbarProps {
  zoomScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenCodeExport?: () => void;
  onTriggerColorExtract?: () => void;
  onOpenHelpGuide?: () => void;
}

export const CanvasViewportToolbar: React.FC<CanvasViewportToolbarProps> = ({
  zoomScale,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  showGuides,
  onToggleGuides,
  isFullscreen,
  onToggleFullscreen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenCodeExport,
  onTriggerColorExtract,
  onOpenHelpGuide,
}) => {
  return (
    <div className="flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)]/90 backdrop-blur-md border border-[var(--md-sys-color-outline-variant)]/40 shadow-sm text-xs text-[var(--md-sys-color-on-surface)] select-none max-w-full overflow-x-auto">
      {/* Undo / Redo group */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
          title="元に戻す (Ctrl+Z)"
        >
          <M3Icon name="undo" size={16} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
          title="やり直し (Ctrl+Y)"
        >
          <M3Icon name="redo" size={16} />
        </button>
      </div>

      <div className="w-[1px] h-3.5 bg-[var(--md-sys-color-outline-variant)]/50" />

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onZoomOut}
          className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center cursor-pointer transition"
          title="縮小"
        >
          <M3Icon name="remove" size={14} />
        </button>
        <button
          type="button"
          onClick={onZoomReset}
          className="px-1.5 py-0.5 rounded-[6px] hover:bg-[var(--md-sys-color-surface-container-high)] font-mono text-[11px] font-bold text-[var(--md-sys-color-primary)] cursor-pointer transition"
          title="100%に戻す"
        >
          {Math.round(zoomScale * 100)}%
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          className="w-6 h-6 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center cursor-pointer transition"
          title="拡大"
        >
          <M3Icon name="add" size={14} />
        </button>
        <button
          type="button"
          onClick={onZoomFit}
          className="px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/40 cursor-pointer transition"
          title="画面全体に収まるようにフィット"
        >
          フィット
        </button>
      </div>

      <div className="w-[1px] h-3.5 bg-[var(--md-sys-color-outline-variant)]/50" />

      {/* Guide lines toggle */}
      <button
        type="button"
        onClick={onToggleGuides}
        className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
          showGuides
            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] font-bold'
            : 'hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
        }`}
        title="中央ガイド線を表示/非表示"
      >
        <M3Icon name="grid_4x4" size={14} />
        <span>ガイド</span>
      </button>

      {/* Optional Color Extractor Trigger */}
      {onTriggerColorExtract && (
        <button
          type="button"
          onClick={onTriggerColorExtract}
          className="px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-primary)] transition cursor-pointer"
          title="画像からカラーパレットを自動抽出"
        >
          <M3Icon name="colorize" size={14} />
          <span className="hidden sm:inline">画像から抽出</span>
        </button>
      )}

      {/* Optional Code Export Trigger */}
      {onOpenCodeExport && (
        <button
          type="button"
          onClick={onOpenCodeExport}
          className="px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-primary)] transition cursor-pointer"
          title="CSS / Tailwind / React コード出力"
        >
          <M3Icon name="code" size={14} />
          <span className="hidden sm:inline">コード出力</span>
        </button>
      )}

      {/* Beginner Guide Trigger */}
      {onOpenHelpGuide && (
        <button
          type="button"
          onClick={onOpenHelpGuide}
          className="px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/50 hover:bg-[var(--md-sys-color-primary-container)] transition cursor-pointer"
          title="初めての方向け使い方ガイド"
        >
          <M3Icon name="lightbulb" size={14} />
          <span className="hidden sm:inline">ガイド</span>
        </button>
      )}

      <div className="w-[1px] h-3.5 bg-[var(--md-sys-color-outline-variant)]/50" />

      {/* Fullscreen / Focus Preview toggle */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        className={`p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-primary)] transition cursor-pointer ${
          isFullscreen ? 'text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]' : ''
        }`}
        title={isFullscreen ? '通常表示に戻す' : '全画面プレビュー'}
      >
        <M3Icon name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'} size={16} />
      </button>
    </div>
  );
};
