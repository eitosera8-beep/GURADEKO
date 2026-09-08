import React, { useState, useEffect } from 'react';
import { M3Dialog } from './M3Dialog';
import { M3Button } from './M3Button';
import { M3Icon } from './M3Icon';

interface RenameProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
}

export const RenameProjectDialog: React.FC<RenameProjectDialogProps> = ({
  isOpen,
  onClose,
  currentName,
  onRename,
}) => {
  const [name, setName] = useState(currentName || '');

  useEffect(() => {
    if (isOpen) {
      setName(currentName || '');
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim();
    if (finalName && finalName !== currentName) {
      onRename(finalName);
    }
    onClose();
  };

  return (
    <M3Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="作品名の変更"
      icon="edit"
      actions={
        <>
          <M3Button variant="text" onClick={onClose}>
            キャンセル
          </M3Button>
          <M3Button
            variant="filled"
            onClick={() => handleSubmit()}
            disabled={!name.trim() || name.trim() === currentName}
            className="!rounded-full px-5"
          >
            変更する
          </M3Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div>
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] block mb-1.5">
            新しい作品名
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="作品名を入力"
              maxLength={60}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[14px] text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none transition-all"
            />
            {name && (
              <button
                type="button"
                onClick={() => setName('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
              >
                <M3Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>
      </form>
    </M3Dialog>
  );
};
