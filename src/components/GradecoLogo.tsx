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
        className={`relative flex items-center justify-center shrink-0 rounded-[24%] overflow-hidden shadow-xs transition-transform hover:scale-105 active:scale-95 ${badgeClassName}`}
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
            {/* Elegant, calm modern gradient: Deep Indigo -> Violet -> Soft Rose */}
            <linearGradient id="logoGradecoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>

            {/* Subtle bevel highlight for clean tactile feel */}
            <linearGradient id="logoBevel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Clean Rounded Squircle Canvas */}
          <rect x="32" y="32" width="448" height="448" rx="116" fill="url(#logoGradecoGrad)" />
          <rect x="32" y="32" width="448" height="448" rx="116" fill="none" stroke="url(#logoBevel)" strokeWidth="4" />

          {/* Crisp, Minimalist Geometric "G" Monogram in pure white */}
          <path
            d="M 345 176 A 120 120 0 1 0 376 256 L 256 256"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="50"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
