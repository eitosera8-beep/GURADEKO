import { EditorBackup, SavedProject, ScreenMode } from '../types';

export const BACKUP_STORAGE_KEY = 'gradeco_active_backup_v1';
export const LAST_SCREEN_KEY = 'gradeco_last_screen';
export const BACKUP_UPDATED_EVENT = 'gradeco_backup_updated';

/**
 * Saves the current editor state to localStorage as an auto-backup
 */
export function saveEditorBackup(
  data: Omit<EditorBackup, 'version' | 'timestamp'> & { timestamp?: number }
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const backup: EditorBackup = {
      version: 1,
      timestamp: data.timestamp || Date.now(),
      projectId: data.projectId,
      projectName: data.projectName,
      isFavorite: data.isFavorite,
      snapshot: data.snapshot,
    };

    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup));

    // Dispatch event so any open UI updates
    window.dispatchEvent(new CustomEvent(BACKUP_UPDATED_EVENT, { detail: backup }));
    return true;
  } catch (error) {
    console.warn('Failed to auto-backup to localStorage:', error);
    // If QuotaExceededError, attempt to save without heavy imageLayers if present
    try {
      if (data.snapshot.imageLayers && data.snapshot.imageLayers.length > 0) {
        const lighterSnapshot = {
          ...data.snapshot,
          // Truncate or omit data URIs exceeding 500kb if quota exceeded
          imageLayers: data.snapshot.imageLayers.map((img) => ({
            ...img,
            src: img.src.length > 100000 ? '' : img.src,
          })),
        };
        const lighterBackup: EditorBackup = {
          version: 1,
          timestamp: Date.now(),
          projectId: data.projectId,
          projectName: data.projectName,
          isFavorite: data.isFavorite,
          snapshot: lighterSnapshot,
        };
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(lighterBackup));
        window.dispatchEvent(new CustomEvent(BACKUP_UPDATED_EVENT, { detail: lighterBackup }));
        return true;
      }
    } catch {}
    return false;
  }
}

/**
 * Retrieves the auto-backup from localStorage
 */
export function getEditorBackup(): EditorBackup | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return null;

    const backup = JSON.parse(raw) as EditorBackup;
    if (
      backup &&
      backup.snapshot &&
      backup.snapshot.gradient &&
      backup.snapshot.canvasConfig
    ) {
      return backup;
    }
    return null;
  } catch (error) {
    console.error('Failed to parse editor backup from localStorage:', error);
    return null;
  }
}

/**
 * Clears the auto-backup from localStorage
 */
export function clearEditorBackup(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(BACKUP_UPDATED_EVENT, { detail: null }));
  } catch (error) {
    console.warn('Failed to clear editor backup:', error);
  }
}

/**
 * Checks if a valid auto-backup exists in localStorage
 */
export function hasValidEditorBackup(): boolean {
  return getEditorBackup() !== null;
}

/**
 * Converts an EditorBackup into a SavedProject object for opening/rendering
 */
export function backupToSavedProject(backup: EditorBackup): SavedProject {
  return {
    id: backup.projectId || `backup-${backup.timestamp}`,
    name: backup.projectName || '自動バックアップの作品',
    createdAt: backup.timestamp,
    updatedAt: backup.timestamp,
    isFavorite: backup.isFavorite,
    snapshot: backup.snapshot,
  };
}

/**
 * Format relative backup time in Japanese
 */
export function formatBackupTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 5) return 'たった今';
  if (diffSec < 60) return `${diffSec}秒前`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}時間前`;

  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Gets the last screen the user was on
 */
export function getLastScreen(): ScreenMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = localStorage.getItem(LAST_SCREEN_KEY);
    if (s === 'home' || s === 'create' || s === 'editor') {
      return s;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sets the last screen the user was on
 */
export function setLastScreen(screen: ScreenMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SCREEN_KEY, screen);
  } catch {}
}
