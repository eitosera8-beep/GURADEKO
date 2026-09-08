import { AppSettings } from '../types';

const SETTINGS_STORAGE_KEY = 'gradeco_user_settings';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  themeMode: 'system',
  uiDensity: 'comfortable',
  defaultExportFormat: 'png',
  defaultExportScale: 2, // Default 2x for crisp Retina output
  fileNamePattern: 'name-only',
  defaultVideoFormat: 'mp4',
  showGridByDefault: false,
  enableSnapAssist: true,
  undoHistoryLimit: 50,
  toastDurationMs: 2500,
  colorFormat: 'hex',
};

// Event emitter target for cross-component settings synchronization
const settingsEventTarget = new EventTarget();

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_APP_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to parse settings from localStorage', e);
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function saveAppSettings(updates: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const next = { ...current, ...updates };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    settingsEventTarget.dispatchEvent(new CustomEvent('settings-change', { detail: next }));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
  return next;
}

export function resetAppSettings(): AppSettings {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
    settingsEventTarget.dispatchEvent(new CustomEvent('settings-change', { detail: DEFAULT_APP_SETTINGS }));
  } catch (e) {
    console.error('Failed to reset settings', e);
  }
  return { ...DEFAULT_APP_SETTINGS };
}

export function subscribeToSettingsChange(callback: (settings: AppSettings) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<AppSettings>;
    callback(customEvent.detail);
  };
  settingsEventTarget.addEventListener('settings-change', handler);
  return () => {
    settingsEventTarget.removeEventListener('settings-change', handler);
  };
}

/**
 * Format a filename based on project name, extension, and pattern setting
 */
export function formatExportFileName(
  projectName: string,
  extension: string,
  pattern: 'name-only' | 'name-date' | 'gradeco-prefix' = 'name-only'
): string {
  // Sanitize project name for filesystem
  const safeName = (projectName || 'グラデーション')
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '_')
    .slice(0, 60);

  const cleanExt = extension.replace(/^\./, '');

  if (pattern === 'gradeco-prefix') {
    return `Gradeco_${safeName}.${cleanExt}`;
  }

  if (pattern === 'name-date') {
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `${safeName}_${dateStr}.${cleanExt}`;
  }

  return `${safeName}.${cleanExt}`;
}
