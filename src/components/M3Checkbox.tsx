import React from 'react';
import { motion } from 'motion/react';
import { M3Icon } from './M3Icon';

interface M3CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
  id?: string;
}

export const M3Checkbox: React.FC<M3CheckboxProps> = ({
  checked,
  onChange,
  label,
  className = '',
  id,
}) => {
  return (
    <label
      id={id}
      className={`inline-flex items-center gap-3 cursor-pointer select-none group py-2 ${className}`}
    >
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={`w-[18px] h-[18px] rounded-[2px] flex items-center justify-center transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
          checked
            ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
            : 'border-2 border-[var(--md-sys-color-outline)] bg-transparent hover:border-[var(--md-sys-color-on-surface)]'
        }`}
      >
        {checked && (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <M3Icon name="check" size={14} className="font-bold" />
          </motion.span>
        )}
      </div>

      <span
        onClick={() => onChange(!checked)}
        className="text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-on-surface-variant)] transition-colors"
      >
        {label}
      </span>
    </label>
  );
};
