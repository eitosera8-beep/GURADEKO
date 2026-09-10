import React, { useState } from 'react';
import { M3Icon } from './M3Icon';

interface DeveloperTabProps {
  onShareOnX?: () => void;
}

export const DeveloperTab: React.FC<DeveloperTabProps> = () => {
  const [copied, setCopied] = useState(false);

  const developerName = '野生のわに';
  const developerHandle = '@Yaseino_Wani';
  const developerUrl = 'https://x.com/Yaseino_Wani';

  const handleCopyHandle = async () => {
    try {
      await navigator.clipboard.writeText(developerHandle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendFeedback = () => {
    const text = encodeURIComponent(
      `@Yaseino_Wani Gradeco（グラデコ）を使ってみました！🎨\n【感想・要望】\n\n#Gradeco #グラデーション`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--md-sys-color-on-surface)]">
          開発者
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
          グラデコ（Gradeco）の開発・運営者情報です。
        </p>
      </div>

      <div className="space-y-5">
        {/* Main Profile Card (固定・閲覧専用) */}
        <div className="rounded-[24px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 overflow-hidden shadow-xs">
          {/* Visual Header Banner */}
          <div className="h-28 sm:h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 relative overflow-hidden flex items-end p-4">
            {/* Subtle decorative mesh overlay */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-10 w-36 h-36 rounded-full bg-cyan-300/20 blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-white/90 text-xs font-semibold px-3 py-1 rounded-full bg-black/25 backdrop-blur-md">
                <span>Creator Profile</span>
              </div>
            </div>
          </div>

          {/* Profile Body (アイコンなし・クリーンなレイアウト) */}
          <div className="p-5 sm:p-6 pt-5 relative">
            {/* Header: Name & Follow on X button */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[19px] sm:text-[22px] font-bold text-[var(--md-sys-color-on-surface)]">
                    {developerName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                    Gradeco 開発者
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={developerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] sm:text-[14px] font-mono font-medium text-[var(--md-sys-color-primary)] hover:underline"
                  >
                    {developerHandle}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyHandle}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
                    title="XアカウントIDをコピー"
                  >
                    <M3Icon
                      name={copied ? 'check' : 'content_copy'}
                      size={13}
                      className={copied ? 'text-emerald-500' : ''}
                    />
                    <span>{copied ? 'コピー済み！' : 'IDコピー'}</span>
                  </button>
                </div>
              </div>

              {/* Follow / View on X Main Button */}
              <a
                href={developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition font-bold text-xs sm:text-sm shadow-sm cursor-pointer active:scale-95 shrink-0"
              >
                <span className="font-bold text-sm sm:text-base leading-none">𝕏</span>
                <span>X で見る</span>
                <M3Icon name="open_in_new" size={15} />
              </a>
            </div>

            {/* Bio Text */}
            <div className="p-4 sm:p-5 rounded-[18px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20 mb-5 space-y-1.5">
              <p className="text-[14px] sm:text-[15px] font-medium text-[var(--md-sys-color-on-surface)] leading-relaxed">
                気ままにサイト作ってます
              </p>
              <p className="text-[13px] sm:text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                X で野生のわにで活動しています（
                <a
                  href={developerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[var(--md-sys-color-primary)] font-semibold hover:underline"
                >
                  {developerHandle}
                </a>
                ）
              </p>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/40 hover:bg-[var(--md-sys-color-surface-container-high)] transition text-xs sm:text-sm font-semibold text-[var(--md-sys-color-on-surface)] cursor-pointer"
              >
                <span className="font-bold text-sm">𝕏</span>
                <span>{developerHandle} をフォロー</span>
                <M3Icon name="arrow_forward" size={16} className="text-[var(--md-sys-color-outline)]" />
              </a>

              <button
                type="button"
                onClick={handleSendFeedback}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/40 hover:bg-[var(--md-sys-color-surface-container-high)] transition text-xs sm:text-sm font-semibold text-[var(--md-sys-color-on-surface)] cursor-pointer"
              >
                <M3Icon name="chat" size={17} className="text-[var(--md-sys-color-primary)]" />
                <span>感想・要望を送る</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
