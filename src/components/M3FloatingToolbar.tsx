import React from 'react';
import { motion } from 'motion/react';
import { M3Icon } from './M3Icon';

interface ToolbarItem {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface M3FloatingToolbarProps {
  items: ToolbarItem[];
  variant?: 'standard' | 'vibrant';
  className?: string;
}

export const M3FloatingToolbar: React.FC<M3FloatingToolbarProps> = ({
  items,
  variant = 'standard',
  className = '',
}) => {
  const bgClass =
    variant === 'vibrant'
      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
      : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]';

  return (
    <div
      className={`h-[36px] sm:h-[40px] px-1 sm:px-1.5 rounded-full shadow-2xs sm:shadow-xs flex items-center justify-center gap-0.5 border border-[var(--md-sys-color-outline-variant)]/30 ${bgClass} ${className}`}
    >
      {items.map((item, idx) => (
        <motion.button
          key={idx}
          type="button"
          whileHover={{ scale: item.disabled ? 1 : 1.08 }}
          whileTap={{ scale: item.disabled ? 1 : 0.94 }}
          onClick={item.onClick}
          disabled={item.disabled}
          title={item.label}
          aria-label={item.label}
          className={`w-[28px] sm:w-[32px] h-[28px] sm:h-[32px] rounded-full flex items-center justify-center cursor-pointer transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-30 disabled:cursor-not-allowed ${
            item.disabled
              ? ''
              : 'hover:bg-[var(--md-sys-color-surface-container-high)]/60 active:bg-[var(--md-sys-color-secondary-container)]'
          }`}
        >
          <M3Icon name={item.icon} size={18} />
        </motion.button>
      ))}
    </div>
  );
};
