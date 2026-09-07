import React, { useState } from 'react';
import { motion } from 'motion/react';
import { M3Button } from './M3Button';
import { M3Slider } from './M3Slider';
import { M3Dropdown } from './M3Dropdown';
import { M3Checkbox } from './M3Checkbox';
import { M3Icon } from './M3Icon';
import { CanvasConfig, CreationType, ExportFormat, VideoFormat, VideoMotionStyle } from '../types';
import { VIDEO_MOTION_PRESETS, getVideoMotionStyle } from '../utils/gradientUtils';

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
  const creationType: CreationType = canvasConfig.creationType || 'image';
  const videoConfig = canvasConfig.videoConfig || {
    duration: 5,
    fps: 30,
    motionStyle: 'aurora' as VideoMotionStyle,
    speed: 1,
    format: 'mp4' as VideoFormat,
    aspectPreset: '9:16' as const,
  };

  const [isPlayingMotion, setIsPlayingMotion] = useState(true);

  const handleVerticalChange = (val: number) => {
    onCanvasConfigChange({ ...canvasConfig, verticalSize: val });
  };

  const handleHorizontalChange = (val: number) => {
    onCanvasConfigChange({ ...canvasConfig, horizontalSize: val });
  };

  const handleFormatSelect = (val: string) => {
    onCanvasConfigChange({
      ...canvasConfig,
      fileFormat: val as ExportFormat,
      videoConfig: canvasConfig.videoConfig
        ? { ...canvasConfig.videoConfig, format: val as VideoFormat }
        : undefined,
    });
  };

  const handleGenkiChange = (checked: boolean) => {
    onCanvasConfigChange({ ...canvasConfig, isGenki: checked });
  };

  const handleVideoAspectPreset = (preset: '9:16' | '16:9' | '1:1' | '4:5') => {
    let hSize = 40;
    let vSize = 40;
    if (preset === '9:16') {
      hSize = 30;
      vSize = 55;
    } else if (preset === '16:9') {
      hSize = 60;
      vSize = 34;
    } else if (preset === '1:1') {
      hSize = 44;
      vSize = 44;
    } else if (preset === '4:5') {
      hSize = 38;
      vSize = 48;
    }

    onCanvasConfigChange({
      ...canvasConfig,
      horizontalSize: hSize,
      verticalSize: vSize,
      aspectRatio: preset,
      videoConfig: {
        ...videoConfig,
        aspectPreset: preset,
      },
    });
  };

  const handleMotionStyleSelect = (val: string) => {
    onCanvasConfigChange({
      ...canvasConfig,
      videoConfig: {
        ...videoConfig,
        motionStyle: val as VideoMotionStyle,
      },
    });
  };

  const handleDurationSelect = (seconds: number) => {
    onCanvasConfigChange({
      ...canvasConfig,
      videoConfig: {
        ...videoConfig,
        duration: seconds,
      },
    });
  };

  // Proportional box size relative to preview bounds
  const previewWidthPercent = Math.max(15, Math.min(100, horizontalSize));
  const previewHeightPercent = Math.max(15, Math.min(100, verticalSize));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col items-center justify-start lg:justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Mobile Top App Bar (visible on < lg) */}
      <div className="w-full max-w-[420px] flex lg:hidden items-center justify-between mb-3 pt-1">
        <M3Button
          id="btn-create-back-mobile"
          variant="tonal"
          icon="arrow_back"
          onClick={onNavigateHome}
          className="h-10 px-3 text-sm"
        >
          戻る
        </M3Button>
        <div className="text-center">
          <h2 className="text-[16px] font-bold text-[var(--md-sys-color-on-surface)] leading-tight">
            {creationType === 'video' ? '動画の新規作成' : '静止画の新規作成'}
          </h2>
          <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
            {creationType === 'video' ? 'モーション動画モード' : 'グラフィック静止画モード'}
          </span>
        </div>
        <div className="w-10" />
      </div>

      {/* Desktop Mode Title Header */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-[1200px] mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center text-white shadow-2xs ${
            creationType === 'video' ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-blue-600'
          }`}>
            <M3Icon name={creationType === 'video' ? 'videocam' : 'image'} size={20} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-[var(--md-sys-color-on-surface)] leading-none">
              {creationType === 'video' ? '動画の新規作成 (モーション動画)' : '静止画の新規作成 (グラフィック)'}
            </h1>
            <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
              {creationType === 'video'
                ? '比率・秒数・動きのスタイルを設定して、SNS向け動画やアニメーションを作成します'
                : 'キャンバスサイズや保存形式を設定して、美しい静止画グラデーションを作成します'}
            </p>
          </div>
        </div>

        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
          creationType === 'video'
            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
        }`}>
          {creationType === 'video' ? '動画制作モード選択中' : '静止画制作モード選択中'}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-[420px] lg:max-w-none lg:min-w-max mx-auto my-auto">
        {/* Desktop Leftmost: 「戻る」ボタン */}
        <div className="hidden lg:block shrink-0">
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

        {/* 792×688dp box (desktop) / responsive adaptive box (mobile) */}
        <div
          id="preview-canvas-outer-box"
          className="relative bg-[var(--md-sys-color-primary-container)] rounded-t-[18px] rounded-b-[28px] shadow-sm flex flex-col items-center justify-center shrink-0 border border-[var(--md-sys-color-outline-variant)]/20 w-full h-[280px] sm:h-[340px] lg:w-[792px] lg:h-[688px] p-4 sm:p-8"
        >
          {/* Top Preview Status Tag */}
          <div className="absolute top-3 left-4 sm:top-5 sm:left-6 flex items-center gap-2">
            <span className="text-[11px] sm:text-[12px] font-bold px-2.5 py-1 rounded-full bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-2xs flex items-center gap-1.5">
              <M3Icon name={creationType === 'video' ? 'videocam' : 'image'} size={14} className="text-[var(--md-sys-color-primary)]" />
              <span>{creationType === 'video' ? '動画プレビュー' : '画像プレビュー'}</span>
            </span>
            {creationType === 'video' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{videoConfig.duration}秒 / {videoConfig.fps}fps</span>
              </span>
            )}
          </div>

          {/* Centered middle box */}
          <div
            id="preview-canvas-middle-box"
            className="relative bg-[var(--md-sys-color-surface)] rounded-[24px] sm:rounded-[32px] shadow-md flex flex-col items-center justify-center p-4 sm:p-6 border border-[var(--md-sys-color-outline-variant)]/30 overflow-hidden w-full max-w-[380px] sm:max-w-[500px] h-[220px] sm:h-[270px] lg:w-[560px] lg:h-[380px]"
          >
            {/* Proportional canvas box representing size / motion */}
            <div
              className={`rounded-[14px] flex flex-col items-center justify-center text-white shadow-sm transition-all duration-200 relative overflow-hidden select-none ${
                creationType === 'video'
                  ? 'bg-gradient-to-tr from-[#0B57D0] via-[#89F8C7] to-[#FF6B6B]'
                  : 'bg-[var(--md-sys-color-primary)]'
              }`}
              style={{
                width: `${previewWidthPercent}%`,
                height: `${previewHeightPercent}%`,
                maxWidth: '92%',
                maxHeight: '80%',
                ...(creationType === 'video'
                  ? getVideoMotionStyle(videoConfig.motionStyle, 1, isPlayingMotion)
                  : {}),
              }}
            >
              {creationType === 'video' ? (
                <div className="flex flex-col items-center justify-center text-center p-3 z-10 drop-shadow-md">
                  <span className="text-[13px] sm:text-[15px] font-extrabold tracking-tight">
                    {videoConfig.aspectPreset || '9:16'}
                  </span>
                  <span className="text-[11px] sm:text-[12px] opacity-90 font-medium">
                    {videoConfig.duration}s • {videoConfig.motionStyle}
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-[13px] sm:text-[16px] font-bold tracking-tight">
                    {horizontalSize}% × {verticalSize}%
                  </span>
                  <span className="text-[11px] sm:text-[12px] opacity-80 mt-0.5">
                    {Math.round(horizontalSize * 19.2)} × {Math.round(verticalSize * 10.8)} px
                  </span>
                </>
              )}
            </div>

            {/* Play/Pause Motion Preview button for Video */}
            {creationType === 'video' && (
              <button
                type="button"
                onClick={() => setIsPlayingMotion(!isPlayingMotion)}
                className="absolute bottom-2.5 right-3 p-1.5 rounded-full bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 text-[11px] px-2.5 font-medium"
                title={isPlayingMotion ? '一時停止' : '再生'}
              >
                <M3Icon name={isPlayingMotion ? 'pause' : 'play_arrow'} size={15} />
                <span>{isPlayingMotion ? '一時停止' : '再生'}</span>
              </button>
            )}

            <span className="absolute bottom-2 sm:bottom-3 left-4 text-[10px] sm:text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] text-center">
              {creationType === 'video'
                ? `動画比率: ${videoConfig.aspectPreset || '9:16'} (${Math.round(horizontalSize * 19.2)}×${Math.round(verticalSize * 10.8)}px)`
                : `サイズ比率: 横 ${horizontalSize}% / 縦 ${verticalSize}%`}
            </span>
          </div>
        </div>

        {/* Configuration Controls Column */}
        <div className="flex flex-col gap-3.5 sm:gap-4 shrink-0 w-full lg:w-[360px] pb-6 lg:pb-0">
          {/* VIDEO CONTROLS */}
          {creationType === 'video' ? (
            <div
              id="video-controls-box"
              className="w-full lg:w-[360px] min-h-[228px] bg-[var(--md-sys-color-surface-container-high)] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)]/30 shadow-sm gap-3"
            >
              {/* Aspect Preset Chips */}
              <div>
                <span className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)] block mb-1.5">
                  動画アスペクト比
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: '9:16', label: '9:16', sub: 'ショート/リール' },
                    { id: '16:9', label: '16:9', sub: 'YouTube/横長' },
                    { id: '1:1', label: '1:1', sub: 'スクエア' },
                    { id: '4:5', label: '4:5', sub: 'フィード' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleVideoAspectPreset(p.id as any)}
                      className={`p-1.5 rounded-[10px] text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        videoConfig.aspectPreset === p.id
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] shadow-xs'
                          : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]/40 hover:border-[var(--md-sys-color-primary)]/50'
                      }`}
                    >
                      <span className="text-[12px] font-bold leading-none">{p.label}</span>
                      <span className="text-[9px] opacity-80 leading-none mt-0.5 truncate max-w-full">
                        {p.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Duration selection */}
              <div>
                <span className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)] block mb-1.5">
                  動画の長さ (秒数)
                </span>
                <div className="flex items-center gap-2">
                  {[3, 5, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleDurationSelect(sec)}
                      className={`flex-1 py-1.5 rounded-[10px] text-[12px] font-bold border transition-all cursor-pointer ${
                        videoConfig.duration === sec
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] shadow-xs'
                          : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]/40 hover:border-[var(--md-sys-color-primary)]/50'
                      }`}
                    >
                      {sec} 秒
                    </button>
                  ))}
                </div>
              </div>

              {/* Motion Style Dropdown */}
              <div>
                <M3Dropdown
                  id="dropdown-motion-style"
                  label="動きのスタイル"
                  leadingIcon="auto_awesome"
                  variant="filled"
                  placeholder="モーションスタイルを選択"
                  selectedValue={videoConfig.motionStyle}
                  onSelect={handleMotionStyleSelect}
                  options={VIDEO_MOTION_PRESETS.map((p) => ({
                    label: `${p.label} (${p.description})`,
                    value: p.id,
                  }))}
                />
              </div>

              {/* Video Format Dropdown */}
              <div>
                <M3Dropdown
                  id="dropdown-video-format"
                  label="動画フォーマット"
                  leadingIcon="movie"
                  variant="filled"
                  placeholder="動画形式を選択"
                  selectedValue={fileFormat}
                  onSelect={handleFormatSelect}
                  options={[
                    { label: 'MP4 (高画質動画 / 各種SNS推奨)', value: 'mp4' },
                    { label: 'WebM (Web軽量動画形式)', value: 'webm' },
                    { label: 'GIF (アニメーション画像)', value: 'gif' },
                  ]}
                />
              </div>
            </div>
          ) : (
            /* IMAGE CONTROLS (Intuitive Size & Preset Controls) */
            <>
              <div
                id="size-controls-box"
                className="w-full lg:w-[360px] min-h-[228px] bg-[var(--md-sys-color-surface-container-high)] rounded-t-[24px] sm:rounded-t-[28px] rounded-b-[24px] sm:rounded-b-[28px] p-4 sm:p-5 flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)]/30 shadow-sm"
              >
                {/* おすすめ画像サイズプリセット */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface)]">
                      おすすめサイズ (ワンタップ設定)
                    </span>
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                      自由調整は下スライダー
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[
                      { label: '正方形 1:1', sub: 'SNS/アイコン', w: 40, h: 40 },
                      { label: '横長 16:9', sub: 'YouTube/PC', w: 54, h: 30 },
                      { label: '縦長 9:16', sub: 'スマホ全画面', w: 30, h: 54 },
                      { label: '標準 4:3', sub: '写真/カード', w: 44, h: 33 },
                    ].map((preset) => {
                      const isSelected = horizontalSize === preset.w && verticalSize === preset.h;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            onCanvasConfigChange({
                              ...canvasConfig,
                              horizontalSize: preset.w,
                              verticalSize: preset.h,
                            });
                          }}
                          className={`p-1.5 rounded-[10px] text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]/40 hover:border-[var(--md-sys-color-primary)]/50'
                          }`}
                        >
                          <span className="text-[11px] font-bold leading-none">{preset.label}</span>
                          <span className="text-[8.5px] opacity-80 leading-none mt-0.5 truncate max-w-full">
                            {preset.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 縦サイズ スライダー */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[15px] sm:text-[17px] font-bold leading-tight text-[var(--md-sys-color-on-surface)]">
                      縦の高さ
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">
                        約{Math.round(verticalSize * 10.8 * 2)}px
                      </span>
                      <span className="font-bold text-[var(--md-sys-color-primary)]">
                        {verticalSize}%
                      </span>
                    </div>
                  </div>
                  <M3Slider
                    value={verticalSize}
                    onChange={handleVerticalChange}
                    ariaLabel="縦サイズスライダー"
                  />
                </div>

                {/* 横サイズ スライダー */}
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[15px] sm:text-[17px] font-bold leading-tight text-[var(--md-sys-color-on-surface)]">
                      横の幅
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">
                        約{Math.round(horizontalSize * 19.2 * 2)}px
                      </span>
                      <span className="font-bold text-[var(--md-sys-color-primary)]">
                        {horizontalSize}%
                      </span>
                    </div>
                  </div>
                  <M3Slider
                    value={horizontalSize}
                    onChange={handleHorizontalChange}
                    ariaLabel="横サイズスライダー"
                  />
                </div>

                {/* 出力解像度表示 */}
                <div className="mt-2 pt-1.5 border-t border-[var(--md-sys-color-outline-variant)]/20 flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  <span>仕上がり目安 (2x HD):</span>
                  <span className="font-mono font-bold text-[var(--md-sys-color-primary)]">
                    {Math.round(horizontalSize * 19.2 * 2)} × {Math.round(verticalSize * 10.8 * 2)} px
                  </span>
                </div>
              </div>

              {/* Label "ファイル形式" filled dropdown */}
              <div className="w-full">
                <M3Dropdown
                  id="dropdown-file-format"
                  label="保存ファイル形式"
                  leadingIcon="folder"
                  variant="filled"
                  placeholder="ファイル形式を選択"
                  selectedValue={fileFormat}
                  onSelect={handleFormatSelect}
                  options={[
                    { label: 'PNG (高画質・背景透過対応・推奨)', value: 'png' },
                    { label: 'JPG (軽量・写真向け標準形式)', value: 'jpg' },
                    { label: 'SVG (拡大してもボケないベクター形式)', value: 'svg' },
                  ]}
                />
              </div>

              {/* "元気ですか？" checkbox */}
              <div className="w-full">
                <M3Checkbox
                  id="checkbox-genki"
                  checked={isGenki}
                  onChange={handleGenkiChange}
                  label="元気ですか？"
                />
              </div>
            </>
          )}

          {/* "確定" filled button */}
          <div className="w-full mt-1">
            <M3Button
              id="btn-create-confirm"
              variant="filled"
              icon="check"
              className="w-full py-3.5 sm:py-3 text-[15px] sm:text-[16px] font-semibold"
              onClick={onNavigateEditor}
            >
              {creationType === 'video' ? '動画エディタを開く' : '画像エディタを開く'}
            </M3Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
