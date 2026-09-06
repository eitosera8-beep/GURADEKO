import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { M3Icon } from './M3Icon';
import { JAPANESE_FONTS, JapaneseFont, loadGoogleFont } from '../utils/japaneseFonts';

interface FontPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFont: string;
  previewText?: string;
  onSelectFont: (font: JapaneseFont) => void;
}

export const FontPickerModal: React.FC<FontPickerModalProps> = ({
  isOpen,
  onClose,
  currentFont,
  previewText = '美しい日本語グラデーション',
  onSelectFont,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'すべて (50+)' },
    { id: 'gothic', label: 'ゴシック体' },
    { id: 'mincho', label: '明朝体' },
    { id: 'round', label: '丸ゴシック' },
    { id: 'pop', label: 'ポップ・手書き' },
    { id: 'brush', label: '筆文字・伝統' },
    { id: 'display', label: 'ディスプレイ' },
    { id: 'retro', label: 'レトロ・ドット' },
  ];

  const filteredFonts = useMemo(() => {
    return JAPANESE_FONTS.filter((font) => {
      const matchCategory = selectedCategory === 'all' || font.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        font.name.toLowerCase().includes(search.toLowerCase()) ||
        font.family.toLowerCase().includes(search.toLowerCase()) ||
        font.categoryLabel.includes(search);
      return matchCategory && matchSearch;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[85vh] rounded-[24px] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] p-5 shadow-2xl border border-[var(--md-sys-color-outline-variant)]/40 flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline-variant)]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
                <M3Icon name="font_download" size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                  日本語フォント選択 (50種類以上)
                </h2>
                <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
                  Google Fonts の豊富なオープンソース和文フォントから選択できます
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
            >
              <M3Icon name="close" size={20} />
            </button>
          </div>

          {/* Search bar & Category filters */}
          <div className="py-3 flex flex-col gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="フォント名・カテゴリで検索 (例: しっぽり, デラ, ゴシック)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-[12px] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/60 text-[13px] outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] placeholder-[var(--md-sys-color-on-surface-variant)]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name="search" size={18} />
              </span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-on-surface)]"
                >
                  <M3Icon name="clear" size={16} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                      : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fonts Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-h-[320px] max-h-[480px]">
            {filteredFonts.map((font) => {
              const isSelected = currentFont === font.family;
              // Preload on render
              loadGoogleFont(font.family);

              return (
                <div
                  key={font.id}
                  onClick={() => {
                    loadGoogleFont(font.family);
                    onSelectFont(font);
                    onClose();
                  }}
                  className={`p-3 rounded-[14px] border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--md-sys-color-primary-container)]/30 border-[var(--md-sys-color-primary)] shadow-xs ring-1 ring-[var(--md-sys-color-primary)]'
                      : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)]/40 hover:border-[var(--md-sys-color-primary)]/60 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)] truncate">
                      {font.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] shrink-0 font-medium">
                      {font.categoryLabel}
                    </span>
                  </div>

                  {/* Font Sample Text preview */}
                  <div
                    className="text-[17px] leading-relaxed py-1.5 px-2 rounded-[8px] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] truncate"
                    style={{ fontFamily: `"${font.family}", sans-serif` }}
                  >
                    {previewText.trim() || font.sample}
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    <span className="font-mono text-[10px] opacity-75">{font.family}</span>
                    {isSelected && (
                      <span className="text-[var(--md-sys-color-primary)] font-bold flex items-center gap-0.5">
                        <M3Icon name="check" size={14} /> 選択中
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredFonts.length === 0 && (
              <div className="col-span-2 py-12 text-center text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name="font_download_off" size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">一致するフォントが見つかりませんでした</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2 text-xs text-[var(--md-sys-color-primary)] underline cursor-pointer"
                >
                  すべてのフォントを表示
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)]/30 mt-3 flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
            <span>表示中: {filteredFonts.length} / {JAPANESE_FONTS.length} フォント</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-medium transition-colors"
            >
              閉じる
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
