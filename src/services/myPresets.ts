/**
 * myPresets.ts
 * Manages user-saved custom gradient presets in localStorage.
 */

import { CustomGradientPreset, GradientState } from '../types';

const STORAGE_KEY = 'gradeco_my_presets';

export function getMyPresets(): CustomGradientPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read custom presets from localStorage', err);
    return [];
  }
}

export function saveMyPreset(name: string, gradient: GradientState): CustomGradientPreset {
  const existing = getMyPresets();
  const newPreset: CustomGradientPreset = {
    id: `custom-preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'マイグラデーション',
    createdAt: Date.now(),
    gradient: JSON.parse(JSON.stringify(gradient)),
  };

  const updated = [newPreset, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save custom preset to localStorage', err);
  }
  return newPreset;
}

export function deleteMyPreset(id: string): CustomGradientPreset[] {
  const existing = getMyPresets();
  const updated = existing.filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to delete custom preset', err);
  }
  return updated;
}
