import React, { useState } from 'react';
import { motion } from 'motion/react';
import { M3Icon } from './M3Icon';
import { GradecoLogo } from './GradecoLogo';
import { DeveloperAvatar } from './DeveloperAvatar';

interface DeveloperTabProps {
  onShareOnX?: () => void;
}

export const DeveloperTab: React.FC<DeveloperTabProps> = ({ onShareOnX }) => {
  const [copied, setCopied] = useState(false);

  const developerHandle = '@Yaseino_Wani';
  const developerUrl = 'https://x.com/Yaseino_Wani';

  const handleCopyHandle = async () => {
    try {
      await navigator.clipboard.writeText(developerHandle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
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
        {/* Main Profile Card */}
        <div className="rounded-[24px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 overflow-hidden shadow-xs">
          {/* Visual Header Banner */}
          <div className="h-28 sm:h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 relative overflow-hidden flex items-end p-4">
            {/* Subtle decorative mesh overlay */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-10 w-36 h-36 rounded-full bg-cyan-300/20 blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-2 text-white/90 text-xs font-semibold px-3 py-1 rounded-full bg-black/25 backdrop-blur-md">
              <span>Creator Profile</span>
            </div>
          </div>

          {/* Profile Body */}
          <div className="p-5 sm:p-6 pt-0 relative">
            {/* Avatar Row */}
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
              <div className="relative">
                {/* 管理者アイコン: 背景白・ワニ */}
                <DeveloperAvatar size="lg" showBadge />
              </div>

              {/* Follow / View on X Main Button */}
              <a
                href={developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition font-bold text-xs sm:text-sm shadow-sm cursor-pointer active:scale-95"
              >
                <span className="font-bold text-sm sm:text-base leading-none">𝕏</span>
                <span>X で見る</span>
                <M3Icon name="open_in_new" size={15} />
              </a>
            </div>

            {/* Profile Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[19px] sm:text-[22px] font-bold text-[var(--md-sys-color-on-surface)]">
                  野生のわに
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
                  <M3Icon name={copied ? 'check' : 'content_copy'} size={13} className={copied ? 'text-emerald-500' : ''} />
                  <span>{copied ? 'コピー済み！' : 'IDコピー'}</span>
                </button>
              </div>
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
                  @Yaseino_Wani
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
                <span>@Yaseino_Wani をフォロー</span>
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

        {/* Development Philosophy / About Gradeco */}
        <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <GradecoLogo size={22} />
            <h3 className="text-[16px] sm:text-[17px] font-semibold text-[var(--md-sys-color-on-surface)]">
              グラデコ（Gradeco）について
            </h3>
          </div>

          <p className="text-[13px] sm:text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mb-3">
            Gradeco は「誰でも直感的にプロクオリティのグラデーション画像＆動く背景ループ動画が作れる」をコンセプトに開発されたWebアプリです。
          </p>

          <p className="text-[13px] sm:text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            SNSアイコン、バナー、サムネイル、Webサイトの背景動画など、日々のクリエイティブ制作にぜひお役立てください！
          </p>
        </div>

        {/* Contact & Feedback Invitation */}
        <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <M3Icon name="forum" size={20} className="text-[var(--md-sys-color-primary)]" />
            <h3 className="text-[16px] sm:text-[17px] font-semibold text-[var(--md-sys-color-on-surface)]">
              ご意見・ご要望・バグ報告
            </h3>
          </div>

          <p className="text-[13px] sm:text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mb-4">
            「こんな配色のテンプレートがほしい」「書き出し形式を増やしてほしい」「操作で分かりにくい箇所がある」など、お気づきの点がございましたらお気軽に X（@Yaseino_Wani）のDMやリプライまでお知らせください。
          </p>

          {onShareOnX && (
            <button
              type="button"
              onClick={onShareOnX}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 transition text-xs sm:text-sm font-semibold cursor-pointer active:scale-95 shadow-xs"
            >
              <span className="font-bold text-sm">𝕏</span>
              <span>Gradeco をXでシェアする</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
