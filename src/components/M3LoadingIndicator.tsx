import React from 'react';
import { motion } from 'motion/react';

interface M3LoadingIndicatorProps {
  size?: number;
  withContainer?: boolean;
  className?: string;
}

export const M3LoadingIndicator: React.FC<M3LoadingIndicatorProps> = ({
  size = 36,
  withContainer = false,
  className = '',
}) => {
  const content = (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="読み込み中"
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        animate={{
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
        }}
        className="text-[var(--md-sys-color-primary)]"
      >
        <motion.path
          d="M 24,6 C 33.9,6 42,14.1 42,24 C 42,33.9 33.9,42 24,42 C 14.1,42 6,33.9 6,24 C 6,14.1 14.1,6 24,6 Z"
          animate={{
            d: [
              // Circle
              'M 24,6 C 33.9,6 42,14.1 42,24 C 42,33.9 33.9,42 24,42 C 14.1,42 6,33.9 6,24 C 6,14.1 14.1,6 24,6 Z',
              // Rounded morph 1 (clover/squircle)
              'M 24,4 C 36,4 44,12 44,24 C 44,36 36,44 24,44 C 12,44 4,36 4,24 C 4,12 12,4 24,4 Z',
              // 4-corner flower
              'M 24,8 C 30,8 40,16 40,24 C 40,32 30,40 24,40 C 18,40 8,32 8,24 C 8,16 18,8 24,8 Z',
              // Back to circle
              'M 24,6 C 33.9,6 42,14.1 42,24 C 42,33.9 33.9,42 24,42 C 14.1,42 6,33.9 6,24 C 6,14.1 14.1,6 24,6 Z',
            ],
            strokeWidth: [4, 5, 4.5, 4],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.4,
            ease: 'easeInOut',
          }}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray="90 30"
        />
      </motion.svg>
    </div>
  );

  if (withContainer) {
    const containerSize = size + 16;
    return (
      <div
        style={{ width: `${containerSize}px`, height: `${containerSize}px` }}
        className="rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center shrink-0 shadow-sm"
      >
        {content}
      </div>
    );
  }

  return content;
};
