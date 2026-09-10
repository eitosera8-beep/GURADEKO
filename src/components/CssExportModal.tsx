import React, { useState } from 'react';
import { M3Dialog } from './M3Dialog';
import { M3Icon } from './M3Icon';
import { GradientState } from '../types';
import { getGradientCss, getCssFilterString, getEffectiveStops } from '../utils/gradientUtils';

interface CssExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradient: GradientState;
}

export const CssExportModal: React.FC<CssExportModalProps> = ({
  isOpen,
  onClose,
  gradient,
}) => {
  const [activeTab, setActiveTab] = useState<'css' | 'tailwind' | 'react' | 'colors'>('css');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const gradientCss = getGradientCss(gradient);
  const filterCss = getCssFilterString(gradient.filters);
  const blendMode = gradient.filters?.blendMode || 'normal';
  const stops = getEffectiveStops(gradient);

  // Vanilla CSS
  const vanillaCssSnippet = [
    `/* Gradeco 生成グラデーション */`,
    `background: ${gradientCss};`,
    filterCss !== 'none' ? `filter: ${filterCss};` : '',
    blendMode !== 'normal' ? `mix-blend-mode: ${blendMode};` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Tailwind CSS Arbitrary class
  const tailwindSnippet = `<div className="w-full h-64 rounded-2xl bg-[${gradientCss.replace(/\s+/g, '_')}]" />`;

  // Tailwind config snippet
  const tailwindConfigSnippet = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'gradeco-gradient': '${gradientCss}',
      },
    },
  },
};`;

  // React inline style
  const reactSnippet = `// React JSX style
<div
  style={{
    background: '${gradientCss}',${filterCss !== 'none' ? `\n    filter: '${filterCss}',` : ''}${blendMode !== 'normal' ? `\n    mixBlendMode: '${blendMode}',` : ''}
  }}
/>`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <M3Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="コード出力 (CSS / Tailwind)"
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Live Mini Preview Bar */}
        <div
          className="h-14 w-full rounded-[14px] border border-black/10 shadow-xs relative overflow-hidden flex items-center justify-end px-3"
          style={{
            background: gradientCss,
            filter: filterCss !== 'none' ? filterCss : undefined,
          }}
        >
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-xs font-semibold">
            {gradient.type}
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center p-1 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs">
          {[
            { id: 'css', label: 'CSS', icon: 'code' },
            { id: 'tailwind', label: 'Tailwind CSS', icon: 'auto_awesome' },
            { id: 'react', label: 'React / JSX', icon: 'terminal' },
            { id: 'colors', label: 'カラー一覧', icon: 'palette' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-full font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <M3Icon name={tab.icon} size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB: CSS */}
        {activeTab === 'css' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">
              <span>CSS ルール</span>
              <button
                type="button"
                onClick={() => copyToClipboard(vanillaCssSnippet, 'css')}
                className="px-2.5 py-1 rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:opacity-90 transition font-bold flex items-center gap-1 cursor-pointer"
              >
                <M3Icon name={copiedKey === 'css' ? 'check' : 'content_copy'} size={13} />
                <span>{copiedKey === 'css' ? 'コピー完了！' : 'CSSをコピー'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              <code>{vanillaCssSnippet}</code>
            </pre>
          </div>
        )}

        {/* TAB: Tailwind */}
        {activeTab === 'tailwind' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--md-sys-color-on-surface)] mb-1">
                <span>クラス指定 (任意値記法)</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tailwindSnippet, 'tw-class')}
                  className="px-2.5 py-1 rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:opacity-90 transition font-bold flex items-center gap-1 cursor-pointer"
                >
                  <M3Icon name={copiedKey === 'tw-class' ? 'check' : 'content_copy'} size={13} />
                  <span>{copiedKey === 'tw-class' ? 'コピー完了！' : 'コピー'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                <code>{tailwindSnippet}</code>
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--md-sys-color-on-surface)] mb-1">
                <span>tailwind.config.js テーマ登録</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tailwindConfigSnippet, 'tw-config')}
                  className="px-2.5 py-1 rounded-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:opacity-90 transition font-bold flex items-center gap-1 cursor-pointer"
                >
                  <M3Icon name={copiedKey === 'tw-config' ? 'check' : 'content_copy'} size={13} />
                  <span>{copiedKey === 'tw-config' ? 'コピー完了！' : '設定コードをコピー'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                <code>{tailwindConfigSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB: React */}
        {activeTab === 'react' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">
              <span>React インラインスタイル</span>
              <button
                type="button"
                onClick={() => copyToClipboard(reactSnippet, 'react')}
                className="px-2.5 py-1 rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:opacity-90 transition font-bold flex items-center gap-1 cursor-pointer"
              >
                <M3Icon name={copiedKey === 'react' ? 'check' : 'content_copy'} size={13} />
                <span>{copiedKey === 'react' ? 'コピー完了！' : 'JSXをコピー'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
              <code>{reactSnippet}</code>
            </pre>
          </div>
        )}

        {/* TAB: Color Palette */}
        {activeTab === 'colors' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] block">
              使用カラーパレット ({stops.length}色)
            </span>
            <div className="grid grid-cols-1 gap-2">
              {stops.map((stop, idx) => (
                <div
                  key={stop.id || idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg border border-black/10 shadow-2xs shrink-0"
                      style={{ backgroundColor: stop.color }}
                    />
                    <div>
                      <span className="font-mono font-bold text-[12px] text-[var(--md-sys-color-on-surface)] block">
                        {stop.color.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                        位置: {Math.round(stop.position)}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(stop.color.toUpperCase(), `color-${idx}`)}
                    className="px-2.5 py-1 rounded-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:text-[var(--md-sys-color-primary)] transition font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                  >
                    <M3Icon name={copiedKey === `color-${idx}` ? 'check' : 'content_copy'} size={12} />
                    <span>{copiedKey === `color-${idx}` ? '済' : 'HEXコピー'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex justify-end pt-2 border-t border-[var(--md-sys-color-outline-variant)]/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-semibold hover:bg-[var(--md-sys-color-surface-container-highest)] transition cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </M3Dialog>
  );
};
