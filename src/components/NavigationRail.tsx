import React from 'react';
import { motion } from 'motion/react';
import { M3Icon } from './M3Icon';
import { GradecoLogo } from './GradecoLogo';
import { NavigationTab } from '../types';

interface NavigationRailProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  className?: string;
}

interface NavItemConfig {
  tab: NavigationTab;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { tab: 'home', icon: 'home', label: 'ホーム' },
  { tab: 'search', icon: 'search', label: '検索' },
  { tab: 'favorite', icon: 'favorite', label: '保存' },
  { tab: 'settings', icon: 'settings', label: '設定' },
  { tab: 'developer', icon: 'person', label: '開発者' },
];

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentTab,
  onTabChange,
  className = '',
}) => {
  return (
    <>
      {/* Desktop / Tablet: Side Navigation Rail */}
      <aside
        className={`hidden md:flex w-[80px] h-full bg-[var(--md-sys-color-surface-container)] flex-col items-center py-5 border-r border-[var(--md-sys-color-outline-variant)]/20 select-none z-20 shrink-0 ${className}`}
        aria-label="ナビゲーションレール"
      >
        {/* Brand App Logo at top of rail */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className="mb-5 p-1 rounded-2xl cursor-pointer transition-transform hover:scale-110 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          title="Gradeco ホームへ"
        >
          <GradecoLogo size={38} />
        </button>

        <div className="flex flex-col items-center gap-4 sm:gap-5 w-full">
          {NAV_ITEMS.map((item) => {
            const isSelected = currentTab === item.tab;
            return (
              <button
                key={`desktop-${item.tab}`}
                type="button"
                onClick={() => onTabChange(item.tab)}
                className="flex flex-col items-center group cursor-pointer w-full py-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded-[12px]"
              >
                {/* 56dp x 32dp pill indicator for selected item */}
                <div className="relative w-[56px] h-[32px] flex items-center justify-center">
                  {isSelected && (
                    <motion.div
                      layoutId="railIndicatorDesktop"
                      className="absolute inset-0 rounded-full bg-[var(--md-sys-color-secondary-container)]"
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    />
                  )}
                  <span
                    className={`relative z-10 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'text-[var(--md-sys-color-on-secondary-container)]'
                        : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]'
                    }`}
                  >
                    <M3Icon name={item.icon} filled={isSelected} size={24} />
                  </span>
                </div>

                {/* labelMedium */}
                <span
                  className={`text-[12px] font-medium leading-4 mt-1 tracking-tight transition-colors ${
                    isSelected
                      ? 'text-[var(--md-sys-color-on-surface)] font-semibold'
                      : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile: Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)]/30 flex items-center justify-around px-1 sm:px-2 z-40 select-none shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
        aria-label="ボトムナビゲーションバー"
      >
        {NAV_ITEMS.map((item) => {
          const isSelected = currentTab === item.tab;
          return (
            <button
              key={`mobile-${item.tab}`}
              type="button"
              onClick={() => onTabChange(item.tab)}
              className="flex-1 flex flex-col items-center justify-center h-full py-1 outline-none cursor-pointer group"
            >
              <div className="relative w-[50px] sm:w-[58px] h-[32px] flex items-center justify-center">
                {isSelected && (
                  <motion.div
                    layoutId="railIndicatorMobile"
                    className="absolute inset-0 rounded-full bg-[var(--md-sys-color-secondary-container)]"
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'text-[var(--md-sys-color-on-secondary-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  <M3Icon name={item.icon} filled={isSelected} size={22} />
                </span>
              </div>
              <span
                className={`text-[11px] font-medium leading-tight mt-0.5 tracking-tight transition-colors ${
                  isSelected
                    ? 'text-[var(--md-sys-color-on-surface)] font-bold'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
