import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { M3Icon } from './M3Icon';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'extendedFab';

interface M3ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  icon?: string;
  iconFilled?: boolean;
  children?: React.ReactNode;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const M3Button: React.FC<M3ButtonProps> = ({
  variant = 'filled',
  icon,
  iconFilled = false,
  children,
  width,
  height,
  className = '',
  disabled = false,
  ...rest
}) => {
  let bgClass = '';
  let textClass = '';
  let borderClass = '';
  let radiusClass = 'rounded-full'; // Default pill for M3 buttons as instructed
  let heightClass = 'h-[56px]';
  let paddingClass = 'px-6';

  if (variant === 'filled') {
    bgClass = 'bg-[var(--md-sys-color-primary)] hover:opacity-95 active:opacity-90';
    textClass = 'text-[var(--md-sys-color-on-primary)] font-semibold';
  } else if (variant === 'tonal') {
    bgClass = 'bg-[var(--md-sys-color-secondary-container)] hover:opacity-90 active:opacity-85';
    textClass = 'text-[var(--md-sys-color-on-secondary-container)] font-semibold';
  } else if (variant === 'outlined') {
    bgClass = 'bg-transparent hover:bg-[var(--md-sys-color-surface-container-high)]/40';
    borderClass = 'border border-[var(--md-sys-color-outline)]';
    textClass = 'text-[var(--md-sys-color-on-surface)] font-medium';
  } else if (variant === 'text') {
    bgClass = 'bg-transparent hover:bg-[var(--md-sys-color-surface-container-high)]/30';
    textClass = 'text-[var(--md-sys-color-primary)] font-medium';
  } else if (variant === 'extendedFab') {
    // "拡張 FAB: 高さ 56dp、角丸 16dp、左にアイコン・右にラベル。"
    bgClass = 'bg-[var(--md-sys-color-secondary-container)] hover:shadow-md';
    textClass = 'text-[var(--md-sys-color-on-secondary-container)] font-semibold tracking-wide';
    radiusClass = 'rounded-[16px] shadow-sm';
    paddingClass = 'px-6';
  }

  const customStyle: React.CSSProperties = {};
  if (width) customStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height) customStyle.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      disabled={disabled}
      style={customStyle}
      className={`relative inline-flex items-center justify-center gap-3 select-none cursor-pointer transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] disabled:opacity-40 disabled:cursor-not-allowed ${heightClass} ${paddingClass} ${radiusClass} ${bgClass} ${textClass} ${borderClass} ${className}`}
      {...rest}
    >
      {icon && (
        <M3Icon
          name={icon}
          filled={iconFilled}
          size={22}
          className="shrink-0"
        />
      )}
      {children && (
        <span className="text-[15px] font-medium leading-none whitespace-nowrap">
          {children}
        </span>
      )}
    </motion.button>
  );
};
