/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenMode, CanvasConfig, SavedProject } from './types';
import { HomeScreen } from './components/HomeScreen';
import { CreateScreen } from './components/CreateScreen';
import { EditorScreen } from './components/EditorScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('home');
  const [activeProject, setActiveProject] = useState<SavedProject | null>(null);

  // Canvas configuration from CreateScreen
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    verticalSize: 40,
    horizontalSize: 40,
    fileFormat: 'png',
    isGenki: false,
    creationType: 'image',
    videoConfig: {
      duration: 5,
      fps: 30,
      motionStyle: 'aurora',
      speed: 1,
      format: 'mp4',
      aspectPreset: '9:16',
    },
  });

  // Navigation direction for reverse-playback transitions
  const [navDirection, setNavDirection] = useState<'forward' | 'backward'>('forward');

  // Theme state: 'system' | 'light' | 'dark'
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  // Update theme according to system preference or user manual selection
  useEffect(() => {
    const root = document.documentElement;

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    };

    if (themeMode === 'system') {
      applySystemTheme();
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applySystemTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      root.setAttribute('data-theme', themeMode);
    }
  }, [themeMode]);

  // Sync with browser history for system back gesture / back button
  useEffect(() => {
    // Push initial history state
    window.history.replaceState({ screen: 'home' }, '');

    const handlePopState = (event: PopStateEvent) => {
      const stateScreen = event.state?.screen || 'home';
      setNavDirection('backward');
      setCurrentScreen(stateScreen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((screen: ScreenMode, direction: 'forward' | 'backward' = 'forward') => {
    setNavDirection(direction);
    setCurrentScreen(screen);
    window.history.pushState({ screen }, '');
  }, []);

  const handleNavigateCreate = (creationType: 'image' | 'video' = 'image') => {
    setActiveProject(null);
    setCanvasConfig((prev) => ({
      ...prev,
      creationType,
      fileFormat: creationType === 'video' ? 'mp4' : (prev.fileFormat === 'mp4' || prev.fileFormat === 'webm' || prev.fileFormat === 'gif' ? 'png' : prev.fileFormat),
      aspectRatio: creationType === 'video' ? '9:16' : (prev.aspectRatio || 'custom'),
      videoConfig: prev.videoConfig || {
        duration: 5,
        fps: 30,
        motionStyle: 'aurora',
        speed: 1,
        format: 'mp4',
        aspectPreset: '9:16',
      },
    }));
    navigateTo('create', 'forward');
  };

  const handleNavigateHomeFromCreate = () => {
    navigateTo('home', 'backward');
  };

  const handleNavigateEditorFromCreate = () => {
    navigateTo('editor', 'forward');
  };

  const handleNavigateHomeFromEditor = () => {
    navigateTo('home', 'backward');
  };

  const handleOpenProject = (project: SavedProject) => {
    setActiveProject(project);
    setCanvasConfig(project.snapshot.canvasConfig);
    navigateTo('editor', 'forward');
  };

  // M3 Expressive standard motion variants (smooth, non-bouncy)
  const screenVariants = {
    initial: (dir: 'forward' | 'backward') => ({
      opacity: 0,
      scale: dir === 'forward' ? 0.98 : 1.02,
    }),
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.2, 0.0, 0, 1.0], // M3 standard easing
      },
    },
    exit: (dir: 'forward' | 'backward') => ({
      opacity: 0,
      scale: dir === 'forward' ? 1.02 : 0.98,
      transition: {
        duration: 0.2,
        ease: [0.2, 0.0, 0, 1.0],
      },
    }),
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[var(--md-sys-color-surface)]">
      <AnimatePresence mode="wait" custom={navDirection}>
        {currentScreen === 'home' && (
          <motion.div
            key="home"
            custom={navDirection}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            <HomeScreen
              onNavigateCreate={handleNavigateCreate}
              onOpenProject={handleOpenProject}
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
            />
          </motion.div>
        )}

        {currentScreen === 'create' && (
          <motion.div
            key="create"
            custom={navDirection}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            <CreateScreen
              canvasConfig={canvasConfig}
              onCanvasConfigChange={setCanvasConfig}
              onNavigateHome={handleNavigateHomeFromCreate}
              onNavigateEditor={handleNavigateEditorFromCreate}
            />
          </motion.div>
        )}

        {currentScreen === 'editor' && (
          <motion.div
            key="editor"
            custom={navDirection}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
          >
            <EditorScreen
              canvasConfig={canvasConfig}
              onNavigateHome={handleNavigateHomeFromEditor}
              initialProject={activeProject}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
