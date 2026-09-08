import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { M3Icon } from './M3Icon';

export interface DesignShareContext {
  mode: 'image' | 'video';
  width: number;
  height: number;
  gradientType?: string;
  colors: string[];
  angle?: number;
  textTitle?: string;
  motionStyle?: string;
}

interface ShareOnXDialogProps {
  isOpen: boolean;
  onClose: () => void;
  designContext?: DesignShareContext;
  onDownloadMedia?: () => void;
}

type TemplateType = 'recommended' | 'palette' | 'simple';

export const ShareOnXDialog: React.FC<ShareOnXDialogProps> = ({
  isOpen,
  onClose,
  designContext,
  onDownloadMedia,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('recommended');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate text options based on context
  const getTemplateText = (type: TemplateType): string => {
    const isEditor = !!designContext;
    const appUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

    if (isEditor && designContext) {
      const isVid = designContext.mode === 'video';
      const dimensions = `${designContext.width * 2}×${designContext.height * 2}px`;
      const colorsList = (designContext.colors || []).join(' → ');
      const colorsComma = (designContext.colors || []).join(', ');
      const title = designContext.textTitle ? `【テキスト】「${designContext.textTitle}」\n` : '';
      
      const motionNames: Record<string, string> = {
        aurora: 'オーロラウェーブ',
        pulse: 'パルス・鼓動',
        colorCycle: 'カラーサイクル',
        drift: '流体ドリフト',
      };
      const motionName = designContext.motionStyle ? motionNames[designContext.motionStyle] || designContext.motionStyle : '';
      const motionLine = isVid && motionName ? `【モーション】${motionName}\n` : '';

      switch (type) {
        case 'recommended':
          return `グラデーション＆動く背景ツール「Gradeco」で素敵な${isVid ? '動画背景' : 'グラデーション画像'}を作成しました！🎨✨\n\n【解像度】${dimensions}\n【配色】${colorsList || 'カスタムカラー'}\n${title}${motionLine}\nブラウザだけで高解像度PNG/SVGやループ動画(MP4/GIF)が手軽に作れるのでおすすめ！👇\n#グラデーション #Webデザイン #Gradeco #デザインツール`;

        case 'palette':
          return `【グラデーション配色レシピ】🎨\nGradecoで作成したカラーパレットスペックです。\n\n・スタイル: ${designContext.gradientType || '線形'} (${designContext.angle ?? 135}°)\n・カラー: ${colorsComma || 'カスタム'}\n・サイズ: ${dimensions}\n\n#カラーパレット #配色 #グラデーション #デザイン #Gradeco`;

        case 'simple':
          return `Gradecoで${isVid ? '動くグラデーション動画' : 'グラデーション背景'}を作成しました！🎨✨\n#グラデーション #Webデザイン #Gradeco`;
      }
    } else {
      // Home screen templates
      switch (type) {
        case 'recommended':
          return `グラデーション画像やTikTok・リール向け動く背景動画がブラウザだけで作れるWebツール「Gradeco（グラデコ）」が超便利！🎨✨\n\n✅ PNG / JPG / SVG 静止画高解像度出力\n✅ MP4 / WebM / GIF ループ動画出力\n✅ 和文フォント・タイポグラフィ合成対応\n✅ 直感的なカラーパレット調整\n\nおしゃれなWebバナーやSNS背景が手軽に作れます👇\n#グラデーション #Webデザイン #デザインツール #Gradeco`;

        case 'palette':
          return `Webデザインやサムネイル制作に便利なグラデーション＆動く背景ジェネレーター「Gradeco」🎨✨\n配色の微調整からタイポグラフィの配置までブラウザ上で直感的に完結します！\n#Webデザイン #UIデザイン #配色 #Gradeco`;

        case 'simple':
          return `ブラウザで手軽に美しいグラデーションや動く背景動画が作れる「Gradeco」試してみて！🎨✨\n#グラデーション #Webデザイン #Gradeco`;
      }
    }
  };

  // Update text when template or dialog open status changes
  useEffect(() => {
    if (isOpen) {
      setCustomText(getTemplateText(selectedTemplate));
      setCopied(false);
    }
  }, [isOpen, selectedTemplate, designContext]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(customText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handlePostToX = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(customText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  };

  const charCount = customText.length;
  const isOverLimit = charCount > 280;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="relative w-full max-w-lg rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] p-5 sm:p-6 shadow-2xl border border-[var(--md-sys-color-outline-variant)]/40 flex flex-col z-10 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline-variant)]/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm sm:text-base shadow-xs shrink-0">
                  𝕏
                </div>
                <div>
                  <h2 className="text-[17px] sm:text-[19px] font-bold text-[var(--md-sys-color-on-surface)] leading-snug">
                    X（旧Twitter）で共有
                  </h2>
                  <p className="text-[11px] sm:text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                    共有用の投稿テキストを選択・編集してポストできます
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition cursor-pointer"
                title="閉じる"
              >
                <M3Icon name="close" size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
              {/* Template Selectors */}
              <div>
                <label className="text-[12px] font-bold text-[var(--md-sys-color-on-surface)] block mb-1.5">
                  投稿文のテンプレート
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'recommended' as const, label: '🌟 おすすめ紹介文' },
                    { id: 'palette' as const, label: '🎨 配色スペック' },
                    { id: 'simple' as const, label: '⚡ シンプル' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        setCustomText(getTemplateText(tpl.id));
                      }}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                        selectedTemplate === tpl.id
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                          : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Post Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-bold text-[var(--md-sys-color-on-surface)]">
                    投稿テキスト（編集可能）
                  </label>
                  <span
                    className={`text-[11px] font-mono font-medium ${
                      isOverLimit ? 'text-red-500 font-bold' : 'text-[var(--md-sys-color-outline)]'
                    }`}
                  >
                    {charCount} / 280 文字
                  </span>
                </div>

                <div className="relative rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/50 focus-within:border-[var(--md-sys-color-primary)] p-3 transition-colors shadow-2xs">
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows={6}
                    className="w-full bg-transparent text-[13px] sm:text-[14px] leading-relaxed text-[var(--md-sys-color-on-surface)] outline-none resize-none placeholder-[var(--md-sys-color-outline)] font-sans"
                    placeholder="Xに投稿するメッセージを入力..."
                  />

                  {/* Textarea Bottom Action: Copy text */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]/20 mt-1">
                    <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                      <M3Icon name="edit_note" size={14} />
                      <span>直接編集して微調整できます</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-on-primary-container)] transition flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <M3Icon name={copied ? 'check' : 'content_copy'} size={14} className={copied ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                      <span>{copied ? 'コピー完了！' : '文をコピー'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Media Attachment Reminder Box */}
              <div className="p-3 rounded-[16px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                <M3Icon name="info" size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">画像・動画を添付してポストする場合</p>
                  <p className="text-[11px] opacity-90 leading-normal mt-0.5">
                    Xの仕様上、ブラウザから画像を直接自動添付することはできません。保存した画像または動画ファイルを、Xの投稿画面でドラッグ＆ドロップまたはファイル選択で添付してください。
                  </p>
                  {onDownloadMedia && (
                    <button
                      type="button"
                      onClick={onDownloadMedia}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                    >
                      <M3Icon name="download" size={14} />
                      <span>今すぐファイルをダウンロード</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="pt-3.5 border-t border-[var(--md-sys-color-outline-variant)]/30 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition cursor-pointer"
              >
                キャンセル
              </button>

              <button
                type="button"
                onClick={handlePostToX}
                className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <span className="font-bold text-[15px] leading-none">𝕏</span>
                <span>Xでポストする</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
