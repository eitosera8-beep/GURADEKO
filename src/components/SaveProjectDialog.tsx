import React, { useState, useEffect } from 'react';
import { M3Dialog } from './M3Dialog';
import { M3Button } from './M3Button';
import { M3Icon } from './M3Icon';
import { GradientState, TextLayer } from '../types';

interface SaveProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  isExistingProject: boolean;
  isFavorite: boolean;
  gradient?: GradientState;
  textLayers?: TextLayer[];
  onSave: (name: string, asNew: boolean, isFavorite: boolean) => void;
}

export const SaveProjectDialog: React.FC<SaveProjectDialogProps> = ({
  isOpen,
  onClose,
  currentName,
  isExistingProject,
  isFavorite: initialFavorite,
  gradient,
  textLayers = [],
  onSave,
}) => {
  const [name, setName] = useState(currentName || '');
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [isFav, setIsFav] = useState(initialFavorite || false);

  useEffect(() => {
    if (isOpen) {
      // If currentName is empty or a generic default, suggest a nice name
      if (!currentName || currentName.startsWith('グラデコ ')) {
        const suggested = generateSuggestedName(gradient, textLayers);
        setName(suggested);
      } else {
        setName(currentName);
      }
      setSaveAsNew(false);
      setIsFav(initialFavorite || false);
    }
  }, [isOpen, currentName, initialFavorite, gradient, textLayers]);

  // Generate pleasant creative title based on current design
  const generateSuggestedName = (grad?: GradientState, texts?: TextLayer[]): string => {
    // If there's text in the first text layer, use it as inspiration
    if (texts && texts.length > 0 && texts[0].text.trim()) {
      const clean = texts[0].text.trim().slice(0, 16);
      return `${clean} (グラデーション)`;
    }

    const timeStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

    if (grad) {
      if (grad.type === 'mesh-aurora') return `オーロラメッシュ ${timeStr}`;
      if (grad.type === 'radial') return `ラジアル発光 ${timeStr}`;
      if (grad.type === 'conic') return `コニックサークル ${timeStr}`;
    }

    return `マイグラデーション ${timeStr}`;
  };

  const handleApplySuggestion = () => {
    setName(generateSuggestedName(gradient, textLayers));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim() || '名称未設定の作品';
    onSave(finalName, saveAsNew, isFav);
    onClose();
  };

  return (
    <M3Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="プロジェクトの保存"
      icon="bookmark"
      actions={
        <>
          <M3Button variant="text" onClick={onClose}>
            キャンセル
          </M3Button>
          <M3Button
            variant="filled"
            onClick={() => handleSubmit()}
            className="!rounded-full px-5"
          >
            <M3Icon name="save" size={18} className="mr-1.5" />
            {isExistingProject && !saveAsNew ? '上書き保存' : '保存する'}
          </M3Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
              <span>作品名・プロジェクト名</span>
              <span className="text-[10px] text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-1.5 py-0.2 rounded-sm">
                必須
              </span>
            </label>
            <button
              type="button"
              onClick={handleApplySuggestion}
              className="text-[11px] text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              title="デザインからおすすめの名前を生成"
            >
              <M3Icon name="auto_awesome" size={13} />
              自動提案
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: サンセットオーロラ、サムネイル用背景"
              maxLength={60}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-[14px] text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none transition-all placeholder:text-[var(--md-sys-color-on-surface-variant)]/50"
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
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1.5">
            ※ この名前は画像や動画のダウンロードファイル名（{name ? `${name}.png` : '作品名.png'}）にも自動で使われます。
          </p>
        </div>

        {/* Existing project options */}
        {isExistingProject && (
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40 space-y-2">
            <label className="text-[12px] font-semibold text-[var(--md-sys-color-on-surface)] block mb-1">
              保存方法の選択
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaveAsNew(false)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  !saveAsNew
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)] font-bold'
                    : 'bg-transparent text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]'
                }`}
              >
                <M3Icon name={!saveAsNew ? 'radio_button_checked' : 'radio_button_unchecked'} size={16} />
                <span>現在の作品に上書き</span>
              </button>

              <button
                type="button"
                onClick={() => setSaveAsNew(true)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  saveAsNew
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)] font-bold'
                    : 'bg-transparent text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]'
                }`}
              >
                <M3Icon name={saveAsNew ? 'radio_button_checked' : 'radio_button_unchecked'} size={16} />
                <span>別名で新規保存</span>
              </button>
            </div>
          </div>
        )}

        {/* Favorite toggle */}
        <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer select-none transition-colors">
          <input
            type="checkbox"
            checked={isFav}
            onChange={(e) => setIsFav(e.target.checked)}
            className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] accent-[var(--md-sys-color-primary)] cursor-pointer"
          />
          <div className="flex items-center gap-1.5 text-xs text-[var(--md-sys-color-on-surface)]">
            <M3Icon
              name="favorite"
              size={16}
              filled={isFav}
              className={isFav ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-outline)]'}
            />
            <span>お気に入りに追加する</span>
          </div>
        </label>
      </form>
    </M3Dialog>
  );
};
