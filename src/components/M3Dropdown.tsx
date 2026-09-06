import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { M3Icon } from './M3Icon';

export interface DropdownOption {
  label: string;
  value: string;
}

interface M3DropdownProps {
  label: string;
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  variant?: 'filled' | 'outlined';
  leadingIcon?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const M3Dropdown: React.FC<M3DropdownProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  variant = 'filled',
  leadingIcon,
  placeholder = '選択してください',
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isFilled = variant === 'filled';

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative w-full select-none ${className}`}
    >
      {/* Field container (56dp height) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[56px] px-4 rounded-[8px] flex items-center justify-between text-left cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
          isFilled
            ? 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border-b-2 border-[var(--md-sys-color-on-surface-variant)]'
            : 'bg-transparent text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline)]'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {leadingIcon && (
            <M3Icon
              name={leadingIcon}
              size={22}
              className="text-[var(--md-sys-color-on-surface-variant)] shrink-0"
            />
          )}
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="text-[11px] font-medium leading-none text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider mb-0.5">
              {label}
            </span>
            <span className="text-[15px] font-normal truncate leading-tight">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-[var(--md-sys-color-on-surface-variant)]"
        >
          <M3Icon name="arrow_drop_down" size={24} />
        </motion.div>
      </button>

      {/* Exposed Dropdown Menu: surfaceContainer, 4dp radius, 48dp item height */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-[100%] z-50 mt-1 max-h-60 overflow-y-auto rounded-[4px] bg-[var(--md-sys-color-surface-container)] shadow-lg border border-[var(--md-sys-color-outline-variant)]/40 py-1"
          >
            {options.map((option) => {
              const isSelected = option.value === selectedValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full h-[48px] px-4 flex items-center text-left text-[14px] cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                      : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
