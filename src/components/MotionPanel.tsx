import React from 'react';
import { M3Icon } from './M3Icon';
import { M3Dropdown } from './M3Dropdown';
import { CanvasConfig, VideoMotionStyle, VideoFormat } from '../types';
import { VIDEO_MOTION_PRESETS } from '../utils/gradientUtils';

interface MotionPanelProps {
  canvasConfig: CanvasConfig;
  onUpdateCanvasConfig: (updates: Partial<CanvasConfig>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExportVideo: (format?: 'mp4' | 'webm' | 'gif') => void;
  isExporting: boolean;
}

export const MotionPanel: React.FC<MotionPanelProps> = ({
  canvasConfig,
  onUpdateCanvasConfig,
  isPlaying,
  onTogglePlay,
  onExportVideo,
  isExporting,
}) => {
  const videoConfig = canvasConfig.videoConfig || {
    duration: 5,
    fps: 30,
    motionStyle: 'aurora' as VideoMotionStyle,
    speed: 1,
    easing: 'ease-in-out' as const,
    format: 'mp4' as VideoFormat,
    aspectPreset: '9:16' as const,
  };

  const handleUpdateVideo = (updates: Partial<typeof videoConfig>) => {
    onUpdateCanvasConfig({
      creationType: 'video',
      videoConfig: {
        ...videoConfig,
        ...updates,
      },
    });
  };

  const easingOptions = [
    { id: 'ease-in-out', label: '滑らか (Ease In-Out)' },
    { id: 'linear', label: '等速 (Linear)' },
    { id: 'ease-out', label: '減速 (Ease Out)' },
    { id: 'ease-in', label: '加速 (Ease In)' },
  ];

  return (
    <div className="flex flex-col gap-3.5 text-xs">
      {/* Motion Playback Control Header */}
      <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
            title={isPlaying ? '一時停止' : '再生'}
          >
            <M3Icon name={isPlaying ? 'pause' : 'play_arrow'} size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[var(--md-sys-color-on-surface)]">
                {isPlaying ? 'モーション再生中' : '一時停止中'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">
                Live
              </span>
            </div>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
              {videoConfig.duration}秒ループ • {videoConfig.fps}fps
            </span>
          </div>
        </div>

        <span className="font-mono text-[11px] font-bold text-[var(--md-sys-color-primary)]">
          {videoConfig.speed || 1}x 速
        </span>
      </div>

      {/* Speed Slider & Fine Controls */}
      <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">
            アニメーション再生速度
          </span>
          <div className="flex items-center gap-1">
            {[0.5, 1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleUpdateVideo({ speed: s })}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                  (videoConfig.speed || 1) === s
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                    : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
        <input
          type="range"
          min="0.25"
          max="3.0"
          step="0.1"
          value={videoConfig.speed || 1}
          onChange={(e) => handleUpdateVideo({ speed: Number(e.target.value) })}
          className="w-full accent-[var(--md-sys-color-primary)] cursor-pointer h-1.5"
        />
      </div>

      {/* Easing Curves (加減速) */}
      <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
        <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] block mb-1.5">
          イージング・加減速カーブ
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {easingOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleUpdateVideo({ easing: opt.id as any })}
              className={`p-2 rounded-xl text-left border cursor-pointer transition ${
                (videoConfig.easing || 'ease-in-out') === opt.id
                  ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] font-bold'
                  : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/30 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <div className="text-[10px] truncate">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Motion Styles Grid */}
      <div>
        <span className="font-bold text-[var(--md-sys-color-on-surface)] block mb-1.5">
          モーションスタイル
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {VIDEO_MOTION_PRESETS.map((preset) => {
            const isSelected = videoConfig.motionStyle === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleUpdateVideo({ motionStyle: preset.id })}
                className={`p-2 rounded-[12px] border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary-container)] shadow-2xs'
                    : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)]/40 hover:border-[var(--md-sys-color-primary)]/50 text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <M3Icon
                  name={preset.icon}
                  size={18}
                  className={isSelected ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-outline)]'}
                />
                <div className="min-w-0">
                  <span className="font-bold text-[11px] block truncate leading-tight">
                    {preset.label}
                  </span>
                  <span className="text-[9px] opacity-75 block truncate leading-tight mt-0.5">
                    {preset.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Duration */}
      <div>
        <span className="font-bold text-[var(--md-sys-color-on-surface)] block mb-1.5">
          動画の長さ (秒数)
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { s: 3, label: '3秒' },
            { s: 5, label: '5秒 (推奨)' },
            { s: 10, label: '10秒' },
            { s: 15, label: '15秒' },
          ].map((item) => (
            <button
              key={item.s}
              type="button"
              onClick={() => handleUpdateVideo({ duration: item.s })}
              className={`py-1.5 px-1 rounded-[10px] text-center border transition-all cursor-pointer ${
                videoConfig.duration === item.s
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] font-bold shadow-2xs'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]/40 hover:border-[var(--md-sys-color-primary)]/50 font-medium'
              }`}
            >
              <span className="text-[10px] block truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Video Aspect Ratio Presets */}
      <div>
        <span className="font-bold text-[var(--md-sys-color-on-surface)] block mb-1.5">
          動画アスペクト比
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: '9:16', label: '9:16 縦型', h: 30, v: 55 },
            { id: '16:9', label: '16:9 横型', h: 60, v: 34 },
            { id: '1:1', label: '1:1 正方形', h: 44, v: 44 },
            { id: '4:5', label: '4:5 フィード', h: 38, v: 48 },
          ].map((ratio) => (
            <button
              key={ratio.id}
              type="button"
              onClick={() => {
                onUpdateCanvasConfig({
                  aspectRatio: ratio.id as any,
                  horizontalSize: ratio.h,
                  verticalSize: ratio.v,
                  videoConfig: {
                    ...videoConfig,
                    aspectPreset: ratio.id as any,
                  },
                });
              }}
              className={`py-1.5 px-1 rounded-[10px] text-center border transition-all cursor-pointer ${
                videoConfig.aspectPreset === ratio.id || canvasConfig.aspectRatio === ratio.id
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] font-bold shadow-2xs'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]/40 hover:border-[var(--md-sys-color-primary)]/50 font-medium'
              }`}
            >
              <span className="text-[10px] block truncate">{ratio.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Export Format Dropdown */}
      <div>
        <M3Dropdown
          id="dropdown-motion-export-format"
          label="書き出し形式"
          leadingIcon="file_download"
          variant="outlined"
          selectedValue={videoConfig.format || 'mp4'}
          onSelect={(val) => handleUpdateVideo({ format: val as VideoFormat })}
          options={[
            { label: 'MP4 (高画質動画 / SNS推奨)', value: 'mp4' },
            { label: 'WebM (Web軽量動画形式)', value: 'webm' },
            { label: 'GIF (アニメーション画像)', value: 'gif' },
          ]}
        />
      </div>

      {/* Primary Export Button */}
      <button
        type="button"
        onClick={() => onExportVideo(videoConfig.format)}
        disabled={isExporting}
        className="w-full py-2.5 px-4 rounded-[14px] bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[#6750A4] text-white font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-1"
      >
        <M3Icon name={isExporting ? 'hourglass_top' : 'movie'} size={18} />
        <span>{isExporting ? '動画をエンコード中...' : `動画を出力 (${(videoConfig.format || 'mp4').toUpperCase()})`}</span>
      </button>
    </div>
  );
};
