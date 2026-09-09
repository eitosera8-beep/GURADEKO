import React, { useState } from 'react';

const waniAvatarImg = '/wani_avatar.jpg';

interface DeveloperAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const DeveloperAvatar: React.FC<DeveloperAvatarProps> = ({
  size = 'lg',
  className = '',
  showBadge = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl',
  }[size];

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Avatar frame with pure white background as requested */}
      <div
        className={`${sizeClasses} bg-white overflow-hidden shadow-md border-2 sm:border-3 border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center relative p-0.5 sm:p-1`}
        title="管理者アイコン: 野生のわに"
      >
        {!imgError ? (
          <img
            src={waniAvatarImg}
            alt="野生のわに (開発者アイコン)"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain rounded-xl bg-white"
          />
        ) : (
          /* High-fidelity SVG recreation of the uploaded crocodile */
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full bg-white"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect width="200" height="200" fill="#FFFFFF" />

            {/* Back spikes */}
            <path
              d="M130 115 L140 100 L148 116 L158 102 L166 117 L176 104 L184 118"
              fill="#2E6B34"
              stroke="#221814"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Subtle shadow offset layer */}
            <path
              d="M32 92 C18 90 12 95 12 105 C12 115 18 120 40 126 C70 134 100 138 150 138 C180 138 190 130 190 120 C190 110 160 100 135 90 C125 70 110 60 95 62 C85 62 78 68 74 76 C70 70 60 66 52 70 C42 75 38 84 32 92 Z"
              fill="#5B8748"
              opacity="0.3"
            />

            {/* Main Green Body */}
            <path
              d="M20 95 C14 97 10 101 10 107 C10 113 15 117 32 121 C62 128 92 133 145 133 C175 133 186 126 186 118 C186 109 156 101 130 92 C122 72 108 62 94 64 C84 65 77 71 73 78 C69 72 59 68 51 72 C41 77 36 86 30 94 Z"
              fill="#82B262"
              stroke="#221814"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Mouth Open Cutout */}
            <path
              d="M16 105 L96 107 L24 116 Z"
              fill="#221814"
            />

            {/* Upper Teeth */}
            <path
              d="M26 105 L30 110 L34 105 L38 110 L42 105 L46 110 L50 105 L54 110 L58 105"
              fill="#FFFFFF"
              stroke="#221814"
              strokeWidth="3"
            />

            {/* Lower Teeth */}
            <path
              d="M28 115 L32 111 L36 115 L40 111 L44 115 L48 111 L52 115"
              fill="#FFFFFF"
              stroke="#221814"
              strokeWidth="3"
            />

            {/* Eyes */}
            <ellipse cx="64" cy="74" rx="4" ry="6" fill="#221814" />
            <ellipse cx="98" cy="74" rx="4" ry="6" fill="#221814" />

            {/* Little Feet */}
            <path
              d="M80 133 C78 142 74 148 70 148 C66 148 64 142 66 133"
              fill="#82B262"
              stroke="#221814"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M130 133 C128 142 124 148 120 148 C116 148 114 142 116 133"
              fill="#82B262"
              stroke="#221814"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Active Indicator Badge */}
      {showBadge && (
        <div
          className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs"
          title="Xでアクティブ"
        />
      )}
    </div>
  );
};
