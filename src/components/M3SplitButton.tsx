import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { M3Icon } from './M3Icon';

interface SplitMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  description?: string;
}

interface M3SplitButtonProps {
  label: string;
  icon?: string;
  onMainAction: () => void;
  menuItems: SplitMenuItem[];
  className?: string;
}

export const M3SplitButton: React.FC<M3SplitButtonProps> = ({
  label,
  icon = 'download',
  onMainAction,
  menuItems,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className={`relative inline-flex items-center select-none ${className}`}>
      {/* Connected 2-segment button group with 2dp gap */}
      <div className="inline-flex items-center gap-[2px]">
        {/* Main action segment */}
        <motion.button
          type="button"
          whileHover={{ opacity: 0.95 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMainAction}
          className={`h-[34px] sm:h-[38px] pl-3 sm:pl-4 pr-2 sm:pr-3 flex items-center gap-1.5 sm:gap-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-[12px] sm:text-[13px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--md-sys-color-primary)] transition-all whitespace-nowrap ${
            isOpen ? 'rounded-full' : 'rounded-l-full rounded-r-[6px]'
          }`}
        >
          {icon && <M3Icon name={icon} size={16} className="shrink-0" />}
          <span>{label}</span>
        </motion.button>

        {/* Arrow segment */}
        <motion.button
          type="button"
          whileHover={{ opacity: 0.95 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`h-[34px] sm:h-[38px] px-1.5 sm:px-2 flex items-center justify-center bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--md-sys-color-primary)] transition-all ${
            isOpen ? 'rounded-full' : 'rounded-r-full rounded-l-[6px]'
          }`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <M3Icon name="arrow_drop_down" size={18} />
          </motion.div>
        </motion.button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-[100%] z-50 mt-2 w-64 max-w-[90vw] rounded-[14px] bg-[var(--md-sys-color-surface-container)] shadow-xl border border-[var(--md-sys-color-outline-variant)]/40 py-2"
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
              >
                {item.icon && (
                  <M3Icon
                    name={item.icon}
                    size={20}
                    className="text-[var(--md-sys-color-primary)] shrink-0"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)] leading-tight">
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] leading-tight mt-0.5">
                      {item.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
