import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { M3Button } from './M3Button';
import { M3Icon } from './M3Icon';

interface M3DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isDestructive?: boolean;
  maxWidth?: string;
}

export const M3Dialog: React.FC<M3DialogProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  confirmLabel = '確定',
  cancelLabel = 'キャンセル',
  onConfirm,
  isDestructive = false,
  maxWidth = 'max-w-md',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Scrim backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2, ease: [0.2, 0.0, 0, 1.0] }}
            className={`relative w-full ${maxWidth} rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] p-6 shadow-xl border border-[var(--md-sys-color-outline-variant)]/40 flex flex-col z-10`}
          >
            {icon && (
              <div
                className={`mb-4 flex items-center justify-center w-10 h-10 rounded-full ${
                  isDestructive
                    ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)]'
                    : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]'
                }`}
              >
                <M3Icon name={icon} size={22} />
              </div>
            )}

            <h2 className="text-[22px] font-bold tracking-tight text-[var(--md-sys-color-on-surface)] mb-3">
              {title}
            </h2>

            <div className="text-[14px] leading-relaxed text-[var(--md-sys-color-on-surface-variant)] mb-6 overflow-y-auto max-h-[60vh]">
              {children}
            </div>

            <div className="flex items-center justify-end gap-2 mt-auto">
              <M3Button variant="text" onClick={onClose}>
                {cancelLabel}
              </M3Button>
              {onConfirm && (
                <M3Button
                  variant={isDestructive ? 'tonal' : 'filled'}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={
                    isDestructive
                      ? '!bg-[var(--md-sys-color-error)] !text-[var(--md-sys-color-on-error)] hover:opacity-90'
                      : ''
                  }
                >
                  {confirmLabel}
                </M3Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
