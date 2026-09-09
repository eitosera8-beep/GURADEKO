import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette } from 'lucide-react';
import { NavigationRail } from './NavigationRail';
import { M3Button } from './M3Button';
import { M3Icon } from './M3Icon';
import { M3Dialog } from './M3Dialog';
import { ShareOnXDialog } from './ShareOnXDialog';
import { GradecoLogo } from './GradecoLogo';
import { RenameProjectDialog } from './RenameProjectDialog';
import { DeveloperTab } from './DeveloperTab';
import { DeveloperAvatar } from './DeveloperAvatar';
import { NavigationTab, SavedProject, AppSettings } from '../types';
import {
  getAllProjects,
  deleteProject,
  toggleFavorite,
  clearAllProjects,
  updateProjectName,
  exportAllProjectsJson,
  importProjectsJson,
} from '../services/db';
import {
  getAppSettings,
  saveAppSettings,
  resetAppSettings,
  subscribeToSettingsChange,
} from '../services/settings';
import { getGradientCss } from '../utils/gradientUtils';

interface HomeScreenProps {
  onNavigateCreate: (type?: 'image' | 'video') => void;
  onOpenProject: (project: SavedProject) => void;
  themeMode: 'system' | 'light' | 'dark';
  onThemeModeChange: (mode: 'system' | 'light' | 'dark') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateCreate,
  onOpenProject,
  themeMode,
  onThemeModeChange,
}) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [projectFilterMode, setProjectFilterMode] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(() => getAppSettings());

  // Dialog states for deleting, renaming & sharing
  const [projectToDelete, setProjectToDelete] = useState<SavedProject | null>(null);
  const [projectToRename, setProjectToRename] = useState<SavedProject | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false);
  const [showShareOnXDialog, setShowShareOnXDialog] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const items = await getAllProjects();
      setProjects(items);
    } catch (err) {
      console.error('Failed to load projects from IndexedDB', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const triggerDeleteSingle = (proj: SavedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(proj);
  };

  const confirmDeleteSingle = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      setMessage(`「${projectToDelete.name}」を削除しました`);
      setTimeout(() => setMessage(null), 3000);
      loadProjects();
    } catch (e) {
      console.error(e);
      setMessage('削除に失敗しました');
    } finally {
      setProjectToDelete(null);
    }
  };

  const confirmClearAll = async () => {
    try {
      await clearAllProjects();
      setMessage('すべての最近のデザインを消去しました');
      setTimeout(() => setMessage(null), 3000);
      loadProjects();
    } catch (e) {
      console.error(e);
      setMessage('消去に失敗しました');
    } finally {
      setShowClearAllDialog(false);
    }
  };

  const handleToggleFav = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(id);
    loadProjects();
  };

  // Rename handlers
  const triggerRename = (proj: SavedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToRename(proj);
  };

  const confirmRename = async (newName: string) => {
    if (!projectToRename) return;
    try {
      const updated = await updateProjectName(projectToRename.id, newName);
      if (updated) {
        setMessage(`作品名を「${updated.name}」に変更しました`);
        setProjects((prev) =>
          prev.map((p) =>
            p.id === updated.id ? { ...p, name: updated.name, updatedAt: updated.updatedAt } : p
          )
        );
      }
    } catch (e) {
      console.error(e);
      setMessage('作品名の変更に失敗しました');
    } finally {
      setTimeout(() => setMessage(null), 2500);
      setProjectToRename(null);
    }
  };

  // Export JSON Backup
  const handleExportJson = async () => {
    try {
      const jsonStr = await exportAllProjectsJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gradeco-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('バックアップJSONファイルを書き出しました');
    } catch (e) {
      console.error(e);
      setMessage('バックアップの書き出しに失敗しました');
    } finally {
      setTimeout(() => setMessage(null), 2500);
    }
  };

  // Import JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        if (!content) return;
        const count = await importProjectsJson(content);
        setMessage(`${count}件の作品データを復元しました`);
        loadProjects();
      } catch (err: any) {
        console.error(err);
        setMessage(err?.message || 'データの復元に失敗しました');
      } finally {
        setTimeout(() => setMessage(null), 3000);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Update a single app setting
  const handleUpdateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = saveAppSettings({ [key]: value });
    setAppSettings(next);
    if (key === 'themeMode') {
      onThemeModeChange(value as 'system' | 'light' | 'dark');
    }
  };

  // Reset all app settings to defaults
  const handleConfirmResetSettings = () => {
    const reset = resetAppSettings();
    setAppSettings(reset);
    onThemeModeChange(reset.themeMode);
    setShowResetSettingsDialog(false);
    setMessage('設定を初期状態にリセットしました');
    setTimeout(() => setMessage(null), 2500);
  };

  // Subscribe to external settings changes
  useEffect(() => {
    return subscribeToSettingsChange((updated) => {
      setAppSettings(updated);
    });
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'favorite' && !p.isFavorite) return false;
    if (!searchQuery.trim()) return true;
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.snapshot.gradient.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex w-full h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] overflow-hidden">
      {/* 4-Item Navigation Rail at Left */}
      <NavigationRail currentTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area to the right of the Rail (or above the Bottom Bar on mobile) */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative pb-24 md:pb-6">
        {/* Toast Notification Banner */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)] shadow-lg text-xs sm:text-sm font-medium flex items-center gap-2 max-w-[90vw] truncate"
            >
              <M3Icon name="check_circle" size={18} className="text-[var(--md-sys-color-inverse-primary)] shrink-0" />
              <span className="truncate">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Single Project Confirmation Dialog */}
        <M3Dialog
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          title="デザインを削除しますか？"
          icon="delete"
          isDestructive
          confirmLabel="削除する"
          cancelLabel="キャンセル"
          onConfirm={confirmDeleteSingle}
        >
          <p>
            「<strong>{projectToDelete?.name}</strong>」を削除します。
            <br />
            この操作を行うと復元することはできません。
          </p>
        </M3Dialog>

        {/* Clear All Projects Confirmation Dialog */}
        <M3Dialog
          isOpen={showClearAllDialog}
          onClose={() => setShowClearAllDialog(false)}
          title="すべての最近のデザインを消去しますか？"
          icon="delete_sweep"
          isDestructive
          confirmLabel="すべて消去"
          cancelLabel="キャンセル"
          onConfirm={confirmClearAll}
        >
          <p>
            保存されている <strong>{projects.length} 件</strong> のデザイン履歴をすべて消去します。
            <br />
            この操作は元に戻せません。本当に実行しますか？
          </p>
        </M3Dialog>

        {/* Tab 1: ホーム (Home) */}
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
            {/* Center Area: Brand Header, Extended FAB with "新規作成", and Description */}
            <div className="flex flex-col items-center justify-center my-auto text-center w-full">
              {/* Tasteful Brand Display */}
              <motion.div
                id="brand-header"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center select-none mb-6 sm:mb-7 mt-2 sm:mt-0"
              >
                <div className="flex items-center gap-3.5">
                  <GradecoLogo size={46} badgeClassName="shadow-md" />
                  <h1
                    id="brand-title"
                    className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.035em] text-[var(--md-sys-color-on-surface)]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Gradeco
                  </h1>
                </div>
              </motion.div>

              {/* Dual Create Action: Image and Video */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-col sm:flex-row items-stretch justify-center gap-3.5 w-full max-w-2xl mb-4 sm:mb-6 px-2"
              >
                {/* 1. 画像作成ボタン */}
                <button
                  type="button"
                  id="btn-create-image"
                  onClick={() => onNavigateCreate('image')}
                  className="flex-1 p-4 rounded-[22px] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border-2 border-blue-200 dark:border-blue-900/60 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all duration-200 text-left flex items-center gap-3.5 cursor-pointer group active:scale-[0.98]"
                >
                  <div className="w-13 h-13 rounded-[18px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <M3Icon name="image" size={26} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[17px] font-extrabold text-[var(--md-sys-color-on-surface)] leading-snug">
                        静止画を作成
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        画像
                      </span>
                    </div>
                    <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] block leading-tight mt-1">
                      SNS投稿・サムネイル・Webバナー<br />
                      <span className="font-mono text-[11px] opacity-80">PNG / JPG / SVG 保存</span>
                    </span>
                  </div>
                  <M3Icon name="arrow_forward" size={20} className="text-[var(--md-sys-color-outline)] group-hover:text-blue-600 transition-colors shrink-0" />
                </button>

                {/* 2. 動画作成ボタン (新機能) */}
                <button
                  type="button"
                  id="btn-create-video"
                  onClick={() => onNavigateCreate('video')}
                  className="flex-1 p-4 rounded-[22px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:shadow-lg hover:brightness-105 transition-all duration-200 text-left flex items-center gap-3.5 cursor-pointer group active:scale-[0.98] border-2 border-purple-400/40"
                >
                  <div className="w-13 h-13 rounded-[18px] bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <M3Icon name="videocam" size={26} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[17px] font-extrabold text-white leading-snug">
                        動画を作成
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 uppercase tracking-wide">
                        動く背景
                      </span>
                    </div>
                    <span className="text-[12px] text-white/90 block leading-tight mt-1">
                      TikTok・リール・Shorts向け動画<br />
                      <span className="font-mono text-[11px] opacity-85">MP4 / WebM / GIF 出力</span>
                    </span>
                  </div>
                  <M3Icon name="arrow_forward" size={20} className="text-white/80 group-hover:text-white transition-colors shrink-0" />
                </button>
              </motion.div>

              <p className="text-[var(--md-sys-color-on-surface-variant)] text-[13px] sm:text-[14px] max-w-md mb-6 sm:mb-8 px-2">
                直感的な操作で美しいグラデーション・タイポグラフィの画像とモーション動画を制作。高画質形式で即座にエクスポートできます。
              </p>

              {/* Projects List or Empty State */}
              {projects.length > 0 ? (
                <div className="w-full max-w-4xl text-left mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[var(--md-sys-color-outline-variant)]/30 pb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-[18px] sm:text-[20px] font-bold text-[var(--md-sys-color-on-surface)]">
                        最近のデザイン
                      </h2>
                      <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium">
                        {projects.length} 件
                      </span>
                    </div>

                    {/* Mode Filter Pills: すべて / 静止画 / 動画 */}
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs">
                      {[
                        { id: 'all' as const, label: 'すべて', count: projects.length, icon: 'grid_view' },
                        {
                          id: 'image' as const,
                          label: '静止画',
                          count: projects.filter((p) => p.snapshot.canvasConfig.creationType !== 'video').length,
                          icon: 'image',
                        },
                        {
                          id: 'video' as const,
                          label: '動画',
                          count: projects.filter((p) => p.snapshot.canvasConfig.creationType === 'video').length,
                          icon: 'videocam',
                        },
                      ].map((filterTab) => (
                        <button
                          key={filterTab.id}
                          type="button"
                          onClick={() => setProjectFilterMode(filterTab.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                            projectFilterMode === filterTab.id
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                              : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <M3Icon name={filterTab.icon} size={14} />
                          <span>{filterTab.label}</span>
                          <span className="text-[10px] opacity-80">({filterTab.count})</span>
                        </button>
                      ))}
                    </div>

                    {/* Clear All Recent Designs Button */}
                    <button
                      type="button"
                      onClick={() => setShowClearAllDialog(true)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/40 transition-colors cursor-pointer"
                      title="最近のデザインをすべて削除"
                    >
                      <M3Icon name="delete_sweep" size={18} />
                      <span>すべて消去</span>
                    </button>
                  </div>

                  {projects.filter((p) => {
                    if (projectFilterMode === 'image') return p.snapshot.canvasConfig.creationType !== 'video';
                    if (projectFilterMode === 'video') return p.snapshot.canvasConfig.creationType === 'video';
                    return true;
                  }).length === 0 ? (
                    <div className="p-8 rounded-[20px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-center my-4">
                      <M3Icon name={projectFilterMode === 'video' ? 'videocam' : 'image'} size={36} className="text-[var(--md-sys-color-outline)] mb-2 mx-auto" />
                      <p className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">
                        {projectFilterMode === 'video' ? '保存された動画デザインはありません' : '保存された静止画デザインはありません'}
                      </p>
                      <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
                        上のボタンから新しい{projectFilterMode === 'video' ? '動画' : '画像'}を作成してみましょう。
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                      {projects
                        .filter((p) => {
                          if (projectFilterMode === 'image') return p.snapshot.canvasConfig.creationType !== 'video';
                          if (projectFilterMode === 'video') return p.snapshot.canvasConfig.creationType === 'video';
                          return true;
                        })
                        .slice(0, 9)
                        .map((proj) => {
                          const isProjVideo = proj.snapshot.canvasConfig.creationType === 'video';
                          return (
                            <div
                              key={proj.id}
                              onClick={() => onOpenProject(proj)}
                              className="group relative rounded-[18px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40 overflow-hidden cursor-pointer hover:shadow-md hover:border-[var(--md-sys-color-primary)]/40 transition-all duration-200"
                            >
                              <div
                                className="h-32 w-full relative flex items-center justify-center p-3 overflow-hidden"
                                style={{ background: getGradientCss(proj.snapshot.gradient) }}
                              >
                                {proj.snapshot.textLayers.length > 0 && (
                                  <span
                                    className="font-bold drop-shadow-md truncate max-w-[90%] text-center"
                                    style={{
                                      color: proj.snapshot.textLayers[0].color,
                                      fontFamily: proj.snapshot.textLayers[0].fontFamily,
                                      fontSize: '15px',
                                    }}
                                  >
                                    {proj.snapshot.textLayers[0].text}
                                  </span>
                                )}

                                {/* Mode Badge: Video vs Image */}
                                {isProjVideo ? (
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                    <M3Icon name="videocam" size={12} />
                                    <span>動画 ({proj.snapshot.canvasConfig.videoConfig?.duration || 5}s)</span>
                                  </span>
                                ) : (
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                    <M3Icon name="image" size={12} />
                                    <span>静止画 ({proj.snapshot.canvasConfig.fileFormat.toUpperCase()})</span>
                                  </span>
                                )}

                                {/* Favorite action */}
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleFav(proj.id, e)}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--md-sys-color-surface)]/85 text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface)] shadow-sm transition-transform hover:scale-110"
                                  title={proj.isFavorite ? 'お気に入り解除' : 'お気に入りに追加'}
                                >
                                  <M3Icon name="favorite" filled={proj.isFavorite} size={18} />
                                </button>
                              </div>

                              <div className="p-3.5 flex items-center justify-between">
                                <div className="min-w-0 flex-1 pr-2">
                                  <p className="text-[14px] font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                                    {proj.name}
                                  </p>
                                  <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                                    {new Date(proj.updatedAt).toLocaleDateString('ja-JP', {
                                      month: 'numeric',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0">
                                  {/* Rename Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => triggerRename(proj, e)}
                                    className="p-1.5 rounded-full text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
                                    title="作品名を変更"
                                  >
                                    <M3Icon name="edit" size={17} />
                                  </button>
                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => triggerDeleteSingle(proj, e)}
                                    className="p-1.5 rounded-full text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] transition-colors cursor-pointer"
                                    title="このデザインを削除"
                                  >
                                    <M3Icon name="delete" size={17} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-[20px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-center max-w-md">
                  <M3Icon name="palette" size={40} className="text-[var(--md-sys-color-outline)] mb-3 mx-auto" />
                  <p className="text-[15px] font-medium text-[var(--md-sys-color-on-surface)] mb-1">
                    保存されたグラデーションはまだありません
                  </p>
                  <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
                    「新規作成」ボタンからキャンバスサイズを設定し、オリジナルのグラデーションを作りましょう。
                  </p>
                </div>
              )}

              {/* Home Screen Bottom X Share Section */}
              <div className="mt-8 mb-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]/20 w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    𝕏
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)] block leading-snug">
                      GradecoをX（Twitter）でシェア
                    </span>
                    <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
                      グラデーション＆動く背景ジェネレーターをフォロワーに共有
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowShareOnXDialog(true)}
                  className="px-4 py-2 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition active:scale-95 shrink-0"
                  title="X（旧Twitter）で共有"
                >
                  <span className="font-bold text-[13px] leading-none">𝕏</span>
                  <span>Xで共有する</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 検索 (Search) */}
        {activeTab === 'search' && (
          <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
            <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--md-sys-color-on-surface)] mb-4 sm:mb-6">
              保存した作品を検索
            </h1>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="作品名やグラデーションの種類で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[52px] sm:h-[56px] pl-12 pr-4 rounded-[12px] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/50 outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] placeholder-[var(--md-sys-color-on-surface-variant)] text-[14px] sm:text-[15px]"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name="search" size={22} />
              </span>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onOpenProject(proj)}
                    className="group rounded-[18px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                  >
                    <div
                      className="h-32 w-full relative flex items-center justify-center p-3"
                      style={{ background: getGradientCss(proj.snapshot.gradient) }}
                    >
                      {proj.snapshot.textLayers.length > 0 && (
                        <span
                          className="font-bold drop-shadow-sm truncate max-w-[90%] text-center"
                          style={{
                            color: proj.snapshot.textLayers[0].color,
                            fontFamily: proj.snapshot.textLayers[0].fontFamily,
                          }}
                        >
                          {proj.snapshot.textLayers[0].text}
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-[15px] font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                          {proj.name}
                        </p>
                        <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                          形式: {proj.snapshot.canvasConfig.fileFormat.toUpperCase()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => triggerDeleteSingle(proj, e)}
                        className="p-2 rounded-full text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] transition-colors"
                        title="削除"
                      >
                        <M3Icon name="delete" size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name="search_off" size={48} className="mx-auto mb-2 opacity-60" />
                <p className="text-[15px]">一致する作品が見つかりませんでした</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 保存 (Favorites) */}
        {activeTab === 'favorite' && (
          <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
            <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--md-sys-color-on-surface)] mb-4 sm:mb-6 flex items-center gap-2">
              <M3Icon name="favorite" filled size={26} className="text-[var(--md-sys-color-primary)]" />
              お気に入り保存一覧
            </h1>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => onOpenProject(proj)}
                    className="group rounded-[18px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                  >
                    <div
                      className="h-32 w-full relative flex items-center justify-center p-3"
                      style={{ background: getGradientCss(proj.snapshot.gradient) }}
                    >
                      {proj.snapshot.textLayers.length > 0 && (
                        <span
                          className="font-bold drop-shadow-sm truncate max-w-[90%] text-center"
                          style={{
                            color: proj.snapshot.textLayers[0].color,
                            fontFamily: proj.snapshot.textLayers[0].fontFamily,
                          }}
                        >
                          {proj.snapshot.textLayers[0].text}
                        </span>
                      )}
                    </div>
                    <div className="p-3.5 flex items-center justify-between">
                      <p className="text-[14px] font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                        {proj.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => triggerRename(proj, e)}
                          className="text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] p-1.5 rounded-full transition-colors cursor-pointer"
                          title="作品名を変更"
                        >
                          <M3Icon name="edit" size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleFav(proj.id, e)}
                          className="text-[var(--md-sys-color-primary)] p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
                          title="お気に入り解除"
                        >
                          <M3Icon name="favorite" filled size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => triggerDeleteSingle(proj, e)}
                          className="text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] p-1.5 rounded-full transition-colors cursor-pointer"
                          title="削除"
                        >
                          <M3Icon name="delete" size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name="favorite_border" size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-[15px]">お気に入りに登録されたグラデーションはありません</p>
                <p className="text-[13px] mt-1">作品のハートアイコンをタップしてお気に入りに追加できます。</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: 設定 (Settings) */}
        {activeTab === 'settings' && (
          <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full pb-20">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--md-sys-color-on-surface)]">
                  設定
                </h1>
                <p className="text-[13px] sm:text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
                  エディタの動作、書き出し品質、テーマ、データバックアップを管理できます。
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* 1. 外観・テーマ */}
              <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <M3Icon name="palette" size={20} className="text-[var(--md-sys-color-primary)]" />
                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[var(--md-sys-color-on-surface)]">
                    外観・テーマ
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                      カラーテーマ
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['system', 'light', 'dark'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleUpdateSetting('themeMode', mode)}
                          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-medium border cursor-pointer transition-all text-center ${
                            appSettings.themeMode === mode
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                          }`}
                        >
                          {mode === 'system' ? 'システム' : mode === 'light' ? 'ライト' : 'ダーク'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                      UI表示の密度
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['comfortable', 'compact'] as const).map((density) => (
                        <button
                          key={density}
                          type="button"
                          onClick={() => handleUpdateSetting('uiDensity', density)}
                          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-medium border cursor-pointer transition-all text-center ${
                            appSettings.uiDensity === density
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                          }`}
                        >
                          {density === 'comfortable' ? 'ゆったり (標準)' : 'コンパクト (高密度)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 保存・書き出し初期設定 */}
              <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <M3Icon name="download" size={20} className="text-[var(--md-sys-color-primary)]" />
                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[var(--md-sys-color-on-surface)]">
                    保存・書き出し設定
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                      既定の画像形式
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['png', 'jpg', 'webp', 'svg'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => handleUpdateSetting('defaultExportFormat', fmt)}
                          className={`py-1.5 px-2 rounded-xl text-xs sm:text-sm font-medium uppercase border cursor-pointer transition-all text-center ${
                            appSettings.defaultExportFormat === fmt
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                      書き出し解像度 (画像スケール)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([1, 2, 3] as const).map((scale) => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => handleUpdateSetting('defaultExportScale', scale)}
                          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-medium border cursor-pointer transition-all text-center ${
                            appSettings.defaultExportScale === scale
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                          }`}
                        >
                          {scale === 1 ? '1x (標準)' : scale === 2 ? '2x (高解像度・推奨)' : '3x (超高精細)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                      ファイル名の命名形式
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'name-only', label: '作品名のみ', sample: '作品名.png' },
                        { id: 'name-date', label: '作品名＋日付', sample: '作品名_20260908.png' },
                        { id: 'gradeco-prefix', label: 'Gradeco_作品名', sample: 'Gradeco_作品名.png' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleUpdateSetting('fileNamePattern', item.id as any)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-medium border cursor-pointer transition-all text-left flex flex-col justify-center ${
                            appSettings.fileNamePattern === item.id
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                          }`}
                        >
                          <span className="font-semibold">{item.label}</span>
                          <span className="text-[10px] opacity-80 truncate font-mono mt-0.5">{item.sample}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                      既定の動画形式
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['mp4', 'webm', 'gif'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => handleUpdateSetting('defaultVideoFormat', fmt)}
                          className={`py-1.5 px-2 rounded-xl text-xs sm:text-sm font-medium uppercase border cursor-pointer transition-all text-center ${
                            appSettings.defaultVideoFormat === fmt
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. エディタ操作・アシスタント */}
              <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <M3Icon name="tune" size={20} className="text-[var(--md-sys-color-primary)]" />
                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[var(--md-sys-color-on-surface)]">
                    エディタ操作・アシスタント
                  </h2>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20">
                    <div>
                      <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)] block">
                        補助グリッド線の初期表示
                      </span>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">
                        キャンバス起動時にグリッドガイドをあらかじめ表示します
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateSetting('showGridByDefault', !appSettings.showGridByDefault)}
                      className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative p-0.5 shrink-0 ${
                        appSettings.showGridByDefault
                          ? 'bg-[var(--md-sys-color-primary)]'
                          : 'bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white transition-transform ${
                          appSettings.showGridByDefault ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20">
                    <div>
                      <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)] block">
                        整列スナップガイド (吸着)
                      </span>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">
                        テキストや画像レイヤーをキャンバス中央に吸着させます
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateSetting('enableSnapAssist', !appSettings.enableSnapAssist)}
                      className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative p-0.5 shrink-0 ${
                        appSettings.enableSnapAssist
                          ? 'bg-[var(--md-sys-color-primary)]'
                          : 'bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white transition-transform ${
                          appSettings.enableSnapAssist ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                      取り消し (Undo) 履歴の保持件数
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([20, 50, 100] as const).map((limit) => (
                        <button
                          key={limit}
                          type="button"
                          onClick={() => handleUpdateSetting('undoHistoryLimit', limit)}
                          className={`py-1.5 px-3 rounded-xl text-xs sm:text-sm font-medium border cursor-pointer transition-all text-center ${
                            appSettings.undoHistoryLimit === limit
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                          }`}
                        >
                          {limit} 件
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)] block mb-2">
                      カラーコード形式
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['hex', 'rgb', 'hsl'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => handleUpdateSetting('colorFormat', fmt)}
                          className={`py-1.5 px-3 rounded-xl text-xs sm:text-sm font-medium uppercase border cursor-pointer transition-all text-center ${
                            appSettings.colorFormat === fmt
                              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent shadow-xs'
                              : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. データ管理・バックアップ */}
              <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <M3Icon name="folder_zip" size={20} className="text-[var(--md-sys-color-primary)]" />
                    <h2 className="text-[16px] sm:text-[17px] font-semibold text-[var(--md-sys-color-on-surface)]">
                      データ管理・バックアップ
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                    保存作品: {projects.length} 件
                  </span>
                </div>

                <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] mb-4 leading-relaxed">
                  作成したグラデーション作品はブラウザ内部（IndexedDB）に安全に保存されています。別の端末へ移行したい場合やバックアップとしてJSONファイルを書き出し・復元できます。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    disabled={projects.length === 0}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] text-sm font-semibold text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <M3Icon name="file_download" size={18} className="text-[var(--md-sys-color-primary)]" />
                    <span>全作品をJSON保存</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] text-sm font-semibold text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer">
                    <M3Icon name="file_upload" size={18} className="text-[var(--md-sys-color-primary)]" />
                    <span>JSONから復元</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)]/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowResetSettingsDialog(true)}
                    className="text-xs text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] underline cursor-pointer py-1"
                  >
                    設定を初期状態にリセット
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowClearAllDialog(true)}
                    disabled={projects.length === 0}
                    className="text-xs text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    保存データをすべて消去
                  </button>
                </div>
              </div>

              {/* 5. グラデコ (Gradeco) について */}
              <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <GradecoLogo size={22} />
                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[var(--md-sys-color-on-surface)]">
                    グラデコ (Gradeco) について
                  </h2>
                </div>
                <p className="text-[13px] sm:text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mb-3">
                  Google Material 3 Expressive ガイドラインに基づいた Blue トーンの配色、Roboto フォント、滑らかなモーションを採用したモダンなグラデーション＆動く背景デザインツールです。
                </p>
                <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-[var(--md-sys-color-outline)] pt-2 border-t border-[var(--md-sys-color-outline-variant)]/20">
                  <span>バージョン: 1.3.0 (保存名指定・設定拡張版)</span>
                  <span>オフライン・PWA対応</span>
                </div>
              </div>

              {/* 6. 開発者情報リンク */}
              <div className="rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <DeveloperAvatar size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] sm:text-[15px] font-semibold text-[var(--md-sys-color-on-surface)]">
                          開発者：野生のわに
                        </span>
                        <span className="text-xs font-mono text-[var(--md-sys-color-primary)]">
                          @Yaseino_Wani
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                        気ままにサイト作ってます • Xで活動中
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('developer')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] transition cursor-pointer shrink-0"
                  >
                    <span>開発者ページ</span>
                    <M3Icon name="arrow_forward" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: 開発者 (Developer) */}
        {activeTab === 'developer' && (
          <DeveloperTab onShareOnX={() => setShowShareOnXDialog(true)} />
        )}
      </main>

      {/* Rename Project Dialog */}
      <RenameProjectDialog
        isOpen={!!projectToRename}
        onClose={() => setProjectToRename(null)}
        currentName={projectToRename?.name || ''}
        onRename={confirmRename}
      />

      {/* Delete Single Project Confirmation Dialog */}
      <M3Dialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="デザインの削除"
      >
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-4">
          「{projectToDelete?.name}」を削除してもよろしいですか？この操作は取り消せません。
        </p>
        <div className="flex justify-end gap-2">
          <M3Button variant="text" onClick={() => setProjectToDelete(null)}>
            キャンセル
          </M3Button>
          <M3Button variant="filled" onClick={confirmDeleteSingle}>
            削除する
          </M3Button>
        </div>
      </M3Dialog>

      {/* Clear All Projects Confirmation Dialog */}
      <M3Dialog
        isOpen={showClearAllDialog}
        onClose={() => setShowClearAllDialog(false)}
        title="保存データの完全消去"
      >
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-4">
          保存されているすべてのデザイン（全{projects.length}件）を消去してもよろしいですか？この操作は取り消せません。
        </p>
        <div className="flex justify-end gap-2">
          <M3Button variant="text" onClick={() => setShowClearAllDialog(false)}>
            キャンセル
          </M3Button>
          <M3Button variant="filled" onClick={confirmClearAll}>
            すべて消去
          </M3Button>
        </div>
      </M3Dialog>

      {/* Reset Settings Confirmation Dialog */}
      <M3Dialog
        isOpen={showResetSettingsDialog}
        onClose={() => setShowResetSettingsDialog(false)}
        title="設定のリセット"
      >
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-4">
          すべてのエディタ設定や保存初期設定をデフォルト値に戻しますか？保存された作品データは消去されません。
        </p>
        <div className="flex justify-end gap-2">
          <M3Button variant="text" onClick={() => setShowResetSettingsDialog(false)}>
            キャンセル
          </M3Button>
          <M3Button variant="filled" onClick={handleConfirmResetSettings}>
            リセットする
          </M3Button>
        </div>
      </M3Dialog>

      {/* Share on X Dialog for Home Screen */}
      <ShareOnXDialog
        isOpen={showShareOnXDialog}
        onClose={() => setShowShareOnXDialog(false)}
      />
    </div>
  );
};
