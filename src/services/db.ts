import { SavedProject } from '../types';

const DB_NAME = 'Gradeco_DB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const PREFS_STORE = 'preferences';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('isFavorite', 'isFavorite', { unique: false });
      }
      if (!db.objectStoreNames.contains(PREFS_STORE)) {
        db.createObjectStore(PREFS_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllProjects(): Promise<SavedProject[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const items: SavedProject[] = request.result || [];
      // Sort newest first
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: SavedProject): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(project);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllProjects(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function toggleFavorite(id: string): Promise<SavedProject | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const proj = getReq.result as SavedProject;
      if (!proj) {
        resolve(null);
        return;
      }
      proj.isFavorite = !proj.isFavorite;
      proj.updatedAt = Date.now();
      const putReq = store.put(proj);
      putReq.onsuccess = () => resolve(proj);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function updateProjectName(id: string, newName: string): Promise<SavedProject | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const proj = getReq.result as SavedProject;
      if (!proj) {
        resolve(null);
        return;
      }
      proj.name = newName.trim() || '名称未設定';
      proj.updatedAt = Date.now();
      const putReq = store.put(proj);
      putReq.onsuccess = () => resolve(proj);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function exportAllProjectsJson(): Promise<string> {
  const projects = await getAllProjects();
  return JSON.stringify({
    app: 'Gradeco',
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    projects,
  }, null, 2);
}

export async function importProjectsJson(jsonStr: string): Promise<number> {
  const parsed = JSON.parse(jsonStr);
  const projects: SavedProject[] = Array.isArray(parsed) ? parsed : (parsed.projects || []);
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('有効なプロジェクトデータが見つかりませんでした');
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let count = 0;

    for (const proj of projects) {
      if (proj && proj.snapshot && proj.snapshot.gradient) {
        // Ensure unique ID or preserve
        const item: SavedProject = {
          ...proj,
          id: proj.id || `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          updatedAt: Date.now(),
        };
        store.put(item);
        count++;
      }
    }

    tx.oncomplete = () => resolve(count);
    tx.onerror = () => reject(tx.error);
  });
}
