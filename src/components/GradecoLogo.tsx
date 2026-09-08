import React from 'react';

interface GradecoLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  textColor?: string;
  badgeClassName?: string;
}

export const GradecoLogo: React.FC<GradecoLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  textColor,
  badgeClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Gradeco Sleek App Icon Symbol */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-[28%] overflow-hidden shadow-sm transition-transform hover:scale-105 active:scale-95 ${badgeClassName}`}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        title="グラデコ (Gradeco)"
      >
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          className="w-full h-full block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B0F19" />
              <stop offset="50%" stopColor="#141527" />
              <stop offset="100%" stopColor="#241434" />
            </linearGradient>

            <linearGradient id="logoRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="logoGGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="30%" stopColor="#4FACFE" />
              <stop offset="65%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            <linearGradient id="logoGGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="45%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>

            <linearGradient id="logoSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>

            <filter id="logoAmbientGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="35" />
            </filter>
          </defs>

          {/* Squircle Base */}
          <rect x="20" y="20" width="472" height="472" rx="118" fill="url(#logoBgGrad)" />
          
          {/* Outer Rim Highlight */}
          <rect x="20" y="20" width="472" height="472" rx="118" fill="none" stroke="url(#logoRimGrad)" strokeWidth="6" />

          {/* Colorful ambient glow */}
          <ellipse cx="256" cy="256" rx="130" ry="120" fill="url(#logoGGrad1)" opacity="0.4" filter="url(#logoAmbientGlow)" />
          <ellipse cx="290" cy="270" rx="90" ry="80" fill="url(#logoGGrad2)" opacity="0.32" filter="url(#logoAmbientGlow)" />

          {/* Dynamic Gradeco Monogram "G" */}
          <path
            d="M 364 260 C 364 330 316 376 256 376 C 182 376 132 322 132 248 C 132 174 184 120 260 120 C 310 120 348 148 362 186"
            fill="none"
            stroke="url(#logoGGrad1)"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 252 260 L 364 260"
            fill="none"
            stroke="url(#logoGGrad2)"
            strokeWidth="48"
            strokeLinecap="round"
          />

          {/* Sparkle Prism Star */}
          <g transform="translate(366, 126)">
            <path
              d="M 0 -22 C 0 -6 6 0 22 0 C 6 0 0 6 0 22 C 0 6 -6 0 -22 0 C -6 0 0 -6 0 -22 Z"
              fill="url(#logoSparkleGrad)"
            />
          </g>

          {/* Core light dot */}
          <circle cx="210" cy="226" r="12" fill="#00F2FE" opacity="0.9" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className="font-black tracking-tight text-base sm:text-lg leading-tight"
            style={{ color: textColor || 'var(--md-sys-color-on-surface)' }}
          >
            Gradeco
          </span>
          <span className="text-[10px] tracking-wider text-[var(--md-sys-color-on-surface-variant)] opacity-80 leading-none">
            グラデコ
          </span>
        </div>
      )}
    </div>
  );
};
