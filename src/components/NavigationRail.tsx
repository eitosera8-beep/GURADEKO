import React from 'react';
import { motion } from 'motion/react';
import { M3Icon } from './M3Icon';
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
];

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentTab,
  onTabChange,
  className = '',
}) => {
  return (
    <aside
      className={`w-[80px] h-full bg-[var(--md-sys-color-surface-container)] flex flex-col items-center py-6 border-r border-[var(--md-sys-color-outline-variant)]/20 select-none z-20 shrink-0 ${className}`}
      aria-label="ナビゲーションレール"
    >
      <div className="flex flex-col items-center gap-6 w-full mt-2">
        {NAV_ITEMS.map((item) => {
          const isSelected = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onTabChange(item.tab)}
              className="flex flex-col items-center group cursor-pointer w-full py-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded-[12px]"
            >
              {/* 56dp x 32dp pill indicator for selected item */}
              <div className="relative w-[56px] h-[32px] flex items-center justify-center">
                {isSelected && (
                  <motion.div
                    layoutId="railIndicator"
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
  );
};
