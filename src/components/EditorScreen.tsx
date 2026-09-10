import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { M3LoadingIndicator } from './M3LoadingIndicator';
import { M3FloatingToolbar } from './M3FloatingToolbar';
import { M3SplitButton } from './M3SplitButton';
import { M3Dropdown } from './M3Dropdown';
import { M3Slider } from './M3Slider';
import { M3Button } from './M3Button';
import { M3Icon } from './M3Icon';
import { M3Dialog } from './M3Dialog';
import {
  CanvasConfig,
  GradientState,
  GradientType,
  TextLayer,
  ImageLayer,
  ShapeStampLayer,
  EditorSnapshot,
  SavedProject,
  ColorStop,
  GradientFilterConfig,
  VideoFormat,
  VideoMotionStyle,
  CustomGradientPreset,
} from '../types';
import {
  getGradientCss,
  exportCanvasImage,
  getCssFilterString,
  getEffectiveStops,
  VIDEO_MOTION_PRESETS,
  getVideoMotionStyle,
} from '../utils/gradientUtils';
import { recordCanvasAnimation, downloadBlob } from '../utils/videoExport';
import { GRADIENT_PRESETS, generateRandomGradient, GradientPreset } from '../utils/presets';
import { saveProject } from '../services/db';
import { GradientStopsBar } from './GradientStopsBar';
import { FontPickerModal } from './FontPickerModal';
import { JAPANESE_FONTS, JapaneseFont, loadGoogleFont } from '../utils/japaneseFonts';
import { TextPropertiesPanel } from './TextPropertiesPanel';
import { ImagePropertiesPanel } from './ImagePropertiesPanel';
import { CanvasFramePanel } from './CanvasFramePanel';
import { MotionPanel } from './MotionPanel';
import { CanvasTransformBox } from './CanvasTransformBox';
import { CanvasViewportToolbar } from './CanvasViewportToolbar';
import { PRESET_STICKERS, PRESET_BADGES, TEXT_GRADIENT_PRESETS } from '../utils/designAssets';
import { ShareOnXDialog } from './ShareOnXDialog';
import { GradecoLogo } from './GradecoLogo';
import { SaveProjectDialog } from './SaveProjectDialog';
import { getAppSettings, formatExportFileName } from '../services/settings';
import { CssExportModal } from './CssExportModal';
import { extractColorsFromImage } from '../utils/colorExtractor';
import { getMyPresets, saveMyPreset, deleteMyPreset } from '../services/myPresets';
import { BeginnerGuideModal } from './BeginnerGuideModal';
import { saveEditorBackup, formatBackupTime } from '../services/backup';

interface EditorScreenProps {
  canvasConfig: CanvasConfig;
  onNavigateHome: () => void;
  initialProject?: SavedProject | null;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  canvasConfig: initialCanvasConfig,
  onNavigateHome,
  initialProject,
}) => {
  // Canvas Configuration (Aspect ratio, Frame border, sizes)
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(() => {
    return initialProject?.snapshot?.canvasConfig || initialCanvasConfig;
  });

  // Active Sidebar Tab: 'gradient' | 'stops' | 'motion' | 'text' | 'image' | 'canvas'
  const [activeTab, setActiveTab] = useState<'gradient' | 'stops' | 'motion' | 'text' | 'image' | 'canvas'>(() => {
    return initialCanvasConfig?.creationType === 'video' ? 'motion' : 'gradient';
  });

  // Video playback & export state
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoExportProgress, setVideoExportProgress] = useState(0);
  const [showShareOnXDialog, setShowShareOnXDialog] = useState(false);

  // Core Gradient State
  const [gradient, setGradient] = useState<GradientState>(() => {
    if (initialProject?.snapshot?.gradient) {
      return initialProject.snapshot.gradient;
    }
    return {
      type: 'linear-diagonal',
      color1: '#0B57D0',
      color2: '#A8C7FA',
      color3: '#89F8C7',
      useColor3: false,
      slider1: 0,
      slider2: 100,
      sizeSlider: 40,
      angle: 135,
      bgOffset: { x: 0, y: 0 },
      stops: [
        { id: '1', color: '#0B57D0', position: 0 },
        { id: '2', color: '#A8C7FA', position: 50 },
        { id: '3', color: '#D3E3FD', position: 100 },
      ],
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hueRotate: 0,
        noise: 0,
        blur: 0,
      },
      isAnimated: false,
    };
  });

  // Text Layers
  const [textLayers, setTextLayers] = useState<TextLayer[]>(() => {
    if (initialProject?.snapshot?.textLayers) {
      return initialProject.snapshot.textLayers;
    }
    return [];
  });

  // Image Layers
  const [imageLayers, setImageLayers] = useState<ImageLayer[]>(() => {
    return initialProject?.snapshot?.imageLayers || [];
  });

  // Shape / Stamp Badge Layers
  const [shapeLayers, setShapeLayers] = useState<ShapeStampLayer[]>(() => {
    return initialProject?.snapshot?.shapeLayers || [];
  });

  // Selected Layer IDs
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  // In-canvas inline text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Presets Dialog State
  const [showPresetsDialog, setShowPresetsDialog] = useState(false);
  const [presetCategory, setPresetCategory] = useState<'all' | 'my' | 'vivid' | 'pastel' | 'dark' | 'nature'>('all');
  const [myPresets, setMyPresets] = useState<CustomGradientPreset[]>(() => getMyPresets());
  const [customPresetName, setCustomPresetName] = useState<string>('');

  // CSS / Tailwind Export Modal State
  const [showCssExportModal, setShowCssExportModal] = useState(false);

  // Color Extractor State & Ref
  const [isExtractingColor, setIsExtractingColor] = useState(false);
  const colorFileInputRef = useRef<HTMLInputElement>(null);

  // Font Picker Modal State
  const [showFontPicker, setShowFontPicker] = useState(false);

  // Help Guide Dialog State
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false);

  // History for Undo / Redo
  const [past, setPast] = useState<EditorSnapshot[]>([]);
  const [future, setFuture] = useState<EditorSnapshot[]>([]);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Project Identity State (User can freely name & rename projects)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialProject?.id || null);
  const [projectName, setProjectName] = useState<string>(() => {
    return initialProject?.name || '名称未設定のグラデーション';
  });
  const [isFavorite, setIsFavorite] = useState<boolean>(initialProject?.isFavorite || false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);

  // Background Dragging State
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // View scale / zoom for compact screens (80% / 90% / 100%)
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showGuides, setShowGuides] = useState<boolean>(() => {
    return getAppSettings().showGridByDefault ?? true;
  });
  const [activeGuideX, setActiveGuideX] = useState<number | null>(null);
  const [activeGuideY, setActiveGuideY] = useState<number | null>(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);
  // Mobile mode toggle: 'canvas' (preview) vs 'settings' (adjust panel)
  const [mobileViewMode, setMobileViewMode] = useState<'canvas' | 'settings'>('canvas');
  // Navigation Tabs Orientation: 'vertical' (rail on left) vs 'horizontal' (top pill bar)
  const [tabsOrientation, setTabsOrientation] = useState<'vertical' | 'horizontal'>('vertical');

  const canvasBoxRef = useRef<HTMLDivElement>(null);

  // Proportional box size inside right scrollable container:
  // Dynamically adapts if custom dimensions (e.g. 1920x1080, 1080x1920, 1500x500) are configured
  let boxWidth = Math.round(576 * (canvasConfig.horizontalSize / 40));
  let boxHeight = Math.round(416 * (canvasConfig.verticalSize / 40));

  if (
    canvasConfig.customWidth &&
    canvasConfig.customHeight &&
    canvasConfig.customWidth > 0 &&
    canvasConfig.customHeight > 0
  ) {
    const ratio = canvasConfig.customWidth / canvasConfig.customHeight;
    const maxAreaW = 560;
    const maxAreaH = 440;
    if (ratio >= maxAreaW / maxAreaH) {
      boxWidth = maxAreaW;
      boxHeight = Math.max(90, Math.round(maxAreaW / ratio));
    } else {
      boxHeight = maxAreaH;
      boxWidth = Math.max(90, Math.round(maxAreaH * ratio));
    }
  }

  // Zoom Fit Calculation - fits canvas perfectly inside container with zero scroll
  const handleZoomFit = useCallback((silent: boolean = false) => {
    if (canvasBoxRef.current) {
      const parent = canvasBoxRef.current.parentElement;
      if (parent) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const padding = isMobile ? 16 : 32;
        const availW = Math.max(100, parent.clientWidth - padding);
        const availH = Math.max(100, parent.clientHeight - padding);
        const scaleX = availW / boxWidth;
        const scaleY = availH / boxHeight;
        const fit = Math.min(1.0, Math.max(0.15, Math.min(scaleX, scaleY)));
        const roundedFit = Math.round(fit * 100) / 100;
        setZoomScale(roundedFit);
        if (!silent) {
          setToastMessage(`画面にフィット (${Math.round(roundedFit * 100)}%)`);
          setTimeout(() => setToastMessage(null), 1200);
        }
        return roundedFit;
      }
    }
    setZoomScale(0.85);
  }, [boxWidth, boxHeight]);

  // Auto-fit canvas on all screens on mount and when resizing window/canvas
  useEffect(() => {
    const timer = setTimeout(() => {
      handleZoomFit(true);
    }, 100);
    const handleResize = () => {
      handleZoomFit(true);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleZoomFit]);

  // Initialize stops if missing
  useEffect(() => {
    if (!gradient.stops || gradient.stops.length < 2) {
      const initialStops = getEffectiveStops(gradient);
      setGradient((prev) => ({ ...prev, stops: initialStops }));
    }
  }, []);

  // First-time beginner welcome modal
  useEffect(() => {
    try {
      const hideGuide = localStorage.getItem('gradeco_hide_beginner_guide');
      const alreadyWelcomed = sessionStorage.getItem('gradeco_welcomed');
      if (hideGuide !== 'true' && alreadyWelcomed !== 'true') {
        sessionStorage.setItem('gradeco_welcomed', 'true');
        const timer = setTimeout(() => {
          setShowBeginnerGuide(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Preload fonts used by current text layers
  useEffect(() => {
    textLayers.forEach((l) => {
      loadGoogleFont(l.fontFamily);
    });
  }, [textLayers]);

  // ==========================================
  // Auto-backup to LocalStorage Engine
  // ==========================================
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<number>(Date.now());

  // Ref holding the latest state for synchronous flush on reload/close
  const latestBackupDataRef = useRef({
    projectId: currentProjectId,
    projectName,
    isFavorite,
    snapshot: {
      gradient,
      textLayers,
      imageLayers,
      shapeLayers,
      canvasConfig,
    },
  });

  // Keep latestBackupDataRef in sync with all editor states
  useEffect(() => {
    latestBackupDataRef.current = {
      projectId: currentProjectId,
      projectName,
      isFavorite,
      snapshot: {
        gradient,
        textLayers,
        imageLayers,
        shapeLayers,
        canvasConfig,
      },
    };
  }, [currentProjectId, projectName, isFavorite, gradient, textLayers, imageLayers, shapeLayers, canvasConfig]);

  // Debounced auto-save effect whenever editor state changes
  const hasMountedAutoSaveRef = useRef(false);
  useEffect(() => {
    if (!hasMountedAutoSaveRef.current) {
      hasMountedAutoSaveRef.current = true;
      // Backup initial state immediately
      saveEditorBackup(latestBackupDataRef.current);
      return;
    }

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      const success = saveEditorBackup(latestBackupDataRef.current);
      if (success) {
        setAutoSaveStatus('saved');
        setLastAutoSaveTime(Date.now());
      } else {
        setAutoSaveStatus('error');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [gradient, textLayers, imageLayers, shapeLayers, canvasConfig, projectName, isFavorite, currentProjectId]);

  // Synchronously flush backup to localStorage on page reload or close (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveEditorBackup(latestBackupDataRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveEditorBackup(latestBackupDataRef.current);
    };
  }, []);

  // Show notice toast when an auto-backup is restored on mount
  useEffect(() => {
    if (initialProject?.id && initialProject.id.startsWith('backup-')) {
      setToastMessage(`「${initialProject.name}」の作業内容を自動復元しました`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  }, []);

  // Push current state to undo history
  const pushHistory = useCallback(() => {
    setPast((prev) => [
      ...prev.slice(-30),
      {
        gradient: JSON.parse(JSON.stringify(gradient)),
        textLayers: JSON.parse(JSON.stringify(textLayers)),
        imageLayers: JSON.parse(JSON.stringify(imageLayers)),
        shapeLayers: JSON.parse(JSON.stringify(shapeLayers)),
        canvasConfig: { ...canvasConfig },
      },
    ]);
    setFuture([]);
  }, [gradient, textLayers, imageLayers, shapeLayers, canvasConfig]);

  // Undo
  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [
      {
        gradient: JSON.parse(JSON.stringify(gradient)),
        textLayers: JSON.parse(JSON.stringify(textLayers)),
        imageLayers: JSON.parse(JSON.stringify(imageLayers)),
        shapeLayers: JSON.parse(JSON.stringify(shapeLayers)),
        canvasConfig: { ...canvasConfig },
      },
      ...prev,
    ]);
    setGradient(previous.gradient);
    setTextLayers(previous.textLayers || []);
    setImageLayers(previous.imageLayers || []);
    setShapeLayers(previous.shapeLayers || []);
    if (previous.canvasConfig) setCanvasConfig(previous.canvasConfig);
    setToastMessage('元に戻しました (Undo)');
    setTimeout(() => setToastMessage(null), 1800);
  }, [past, gradient, textLayers, imageLayers, shapeLayers, canvasConfig]);

  // Redo
  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [
      ...prev,
      {
        gradient: JSON.parse(JSON.stringify(gradient)),
        textLayers: JSON.parse(JSON.stringify(textLayers)),
        imageLayers: JSON.parse(JSON.stringify(imageLayers)),
        shapeLayers: JSON.parse(JSON.stringify(shapeLayers)),
        canvasConfig: { ...canvasConfig },
      },
    ]);
    setGradient(next.gradient);
    setTextLayers(next.textLayers || []);
    setImageLayers(next.imageLayers || []);
    setShapeLayers(next.shapeLayers || []);
    if (next.canvasConfig) setCanvasConfig(next.canvasConfig);
    setToastMessage('やり直しました (Redo)');
    setTimeout(() => setToastMessage(null), 1800);
  }, [future, gradient, textLayers, imageLayers, shapeLayers, canvasConfig]);

  // Determine active creation mode
  const isVideo = canvasConfig.creationType === 'video';

  // Toggle between Still Image and Video mode
  const handleToggleCreationType = (targetType: 'image' | 'video') => {
    pushHistory();
    if (targetType === 'video') {
      setCanvasConfig((prev) => ({
        ...prev,
        creationType: 'video',
        fileFormat: 'mp4',
        videoConfig: prev.videoConfig || {
          duration: 5,
          fps: 30,
          motionStyle: 'aurora',
          speed: 1,
          format: 'mp4',
          aspectPreset: '9:16',
        },
      }));
      setActiveTab('motion');
      setToastMessage('動画モードに切り替えました');
    } else {
      setCanvasConfig((prev) => ({
        ...prev,
        creationType: 'image',
        fileFormat:
          prev.fileFormat === 'mp4' || prev.fileFormat === 'webm' || prev.fileFormat === 'gif'
            ? 'png'
            : prev.fileFormat,
      }));
      setActiveTab('gradient');
      setToastMessage('静止画モードに切り替えました');
    }
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Keyboard shortcut listener (Ctrl+Z, Ctrl+Y, Ctrl+D, Delete, Escape, Arrow nudges)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate shortcut (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedTextId) {
          handleDuplicateText();
        } else if (selectedImageId) {
          handleDuplicateImage();
        } else if (selectedShapeId) {
          handleDuplicateShape();
        }
        return;
      }

      // Skip text-destructive and arrow shortcuts if actively typing in input
      if (isInput || editingTextId) return;

      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedTextId(null);
        setSelectedImageId(null);
        setSelectedShapeId(null);
        setEditingTextId(null);
        setShowPresetsDialog(false);
        setShowFontPicker(false);
        return;
      }

      // Delete / Backspace to remove selected layer
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextId) {
          e.preventDefault();
          handleDeleteText(selectedTextId);
        } else if (selectedImageId) {
          e.preventDefault();
          handleDeleteImage(selectedImageId);
        } else if (selectedShapeId) {
          e.preventDefault();
          handleDeleteShape(selectedShapeId);
        }
        return;
      }

      // Arrow keys to nudge layer position
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedTextId || selectedImageId || selectedShapeId) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

          if (selectedTextId) {
            setTextLayers((prev) =>
              prev.map((t) => (t.id === selectedTextId ? { ...t, x: t.x + dx, y: t.y + dy } : t))
            );
          } else if (selectedImageId) {
            setImageLayers((prev) =>
              prev.map((img) => (img.id === selectedImageId ? { ...img, x: img.x + dx, y: img.y + dy } : img))
            );
          } else if (selectedShapeId) {
            setShapeLayers((prev) =>
              prev.map((s) => (s.id === selectedShapeId ? { ...s, x: s.x + dx, y: s.y + dy } : s))
            );
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    selectedTextId,
    selectedImageId,
    selectedShapeId,
    editingTextId,
    textLayers,
    imageLayers,
    shapeLayers,
    pushHistory,
    boxWidth,
    boxHeight,
  ]);

  // Gradient options: Expanded to full modern gradient freedom
  const gradientOptions = [
    { label: '線形（斜め・自由角度）', value: 'linear-diagonal' },
    { label: '線形（左から 90°）', value: 'linear-left' },
    { label: '線形（右から 270°）', value: 'linear-right' },
    { label: '線形（上から 180°）', value: 'linear-top' },
    { label: '円形（ラジアル）', value: 'radial' },
    { label: '円錐形（コニック）', value: 'conic' },
    { label: 'メッシュ・オーロラ発光', value: 'mesh-aurora' },
    { label: '反復線形（ストライプ）', value: 'repeating-linear' },
    { label: '反復円形（年輪・レコード風）', value: 'repeating-radial' },
    { label: '3色リニア', value: 'three-color' },
    { label: '単色', value: 'single' },
  ];

  const currentGradientOption =
    gradientOptions.find((opt) => opt.value === gradient.type) || gradientOptions[0];

  const handleGradientTypeChange = (val: string) => {
    pushHistory();
    setGradient((prev) => ({
      ...prev,
      type: val as GradientType,
    }));
  };

  // Color Stops change
  const handleStopsChange = (newStops: ColorStop[]) => {
    pushHistory();
    setGradient((prev) => ({
      ...prev,
      stops: newStops,
      color1: newStops[0]?.color || prev.color1,
      color2: newStops[newStops.length - 1]?.color || prev.color2,
      color3: newStops[1]?.color || prev.color3,
    }));
  };

  // Color Harmonies Generator
  const generateHarmony = (type: 'comp' | 'anal' | 'triad' | 'pastel' | 'cyber') => {
    pushHistory();
    const baseColor = gradient.stops?.[0]?.color || gradient.color1;
    let newColors: string[] = [];

    if (type === 'comp') {
      // Complementary
      newColors = [baseColor, '#FFFFFF', '#0B57D0'];
    } else if (type === 'anal') {
      // Analogous
      newColors = ['#00C9FF', '#92FE9D', '#0B57D0'];
    } else if (type === 'triad') {
      // Triadic
      newColors = ['#FF6B6B', '#4ECDC4', '#FFE66D'];
    } else if (type === 'pastel') {
      // Soft Pastel
      newColors = ['#A1C4FD', '#C2E9FB', '#FBC2EB'];
    } else if (type === 'cyber') {
      // Cyberpunk Neon
      newColors = ['#FF007F', '#7928CA', '#00DFD8'];
    }

    const newStops: ColorStop[] = newColors.map((col, idx) => ({
      id: `stop-${Date.now()}-${idx}`,
      color: col,
      position: Math.round((idx / (newColors.length - 1)) * 100),
    }));

    handleStopsChange(newStops);
    setToastMessage('ハーモニーパレットを生成しました');
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Filter change helper
  const updateFilter = (key: keyof GradientFilterConfig, val: number) => {
    setGradient((prev) => ({
      ...prev,
      filters: {
        ...(prev.filters || {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          hueRotate: 0,
          noise: 0,
          blur: 0,
        }),
        [key]: val,
      },
    }));
  };

  // Swap Colors
  const handleSwapColors = () => {
    pushHistory();
    if (gradient.stops && gradient.stops.length >= 2) {
      const reversed = [...gradient.stops].reverse().map((s, idx, arr) => ({
        ...s,
        position: Math.round((idx / (arr.length - 1)) * 100),
      }));
      setGradient((prev) => ({
        ...prev,
        stops: reversed,
        color1: reversed[0].color,
        color2: reversed[reversed.length - 1].color,
      }));
    } else {
      setGradient((prev) => ({
        ...prev,
        color1: prev.color2,
        color2: prev.color1,
      }));
    }
    setToastMessage('カラーを反転しました');
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Random Gradient Generator
  const handleRandomGradient = () => {
    pushHistory();
    const randomized = generateRandomGradient();
    const newStops: ColorStop[] = [
      { id: '1', color: randomized.color1, position: 0 },
      { id: '2', color: randomized.color2, position: 100 },
    ];
    if (randomized.color3) {
      newStops.splice(1, 0, { id: '3', color: randomized.color3, position: 50 });
    }
    setGradient((prev) => ({
      ...prev,
      ...randomized,
      stops: newStops,
    }));
    setToastMessage('ランダムグラデーションを生成しました');
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Apply Preset
  const handleApplyPreset = (preset: GradientPreset) => {
    pushHistory();
    const newStops: ColorStop[] = [
      { id: '1', color: preset.color1, position: preset.slider1 },
      { id: '2', color: preset.color2, position: preset.slider2 },
    ];
    if (preset.color3) {
      newStops.splice(1, 0, { id: '3', color: preset.color3, position: 50 });
    }
    setGradient((prev) => ({
      ...prev,
      type: preset.type,
      color1: preset.color1,
      color2: preset.color2,
      color3: preset.color3 || prev.color3,
      slider1: preset.slider1,
      slider2: preset.slider2,
      angle: preset.angle ?? prev.angle ?? 135,
      stops: newStops,
    }));
    setShowPresetsDialog(false);
    setToastMessage(`「${preset.name}」を適用しました`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Apply Custom Saved Preset
  const handleApplyMyPreset = (preset: CustomGradientPreset) => {
    pushHistory();
    const g = preset.gradient;
    setGradient((prev) => ({
      ...prev,
      ...g,
      stops:
        g.stops && g.stops.length >= 2
          ? g.stops
          : [
              { id: '1', color: g.color1, position: g.slider1 },
              { id: '2', color: g.color2, position: g.slider2 },
            ],
    }));
    setShowPresetsDialog(false);
    setToastMessage(`マイプリセット「${preset.name}」を適用しました`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Save current gradient to My Presets
  const handleSaveCurrentAsPreset = () => {
    const name = customPresetName.trim() || `マイプリセット ${myPresets.length + 1}`;
    const saved = saveMyPreset(name, gradient);
    setMyPresets(getMyPresets());
    setCustomPresetName('');
    setToastMessage(`「${saved.name}」を保存しました`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Delete from My Presets
  const handleDeleteMyPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteMyPreset(id);
    setMyPresets(updated);
    setToastMessage('マイプリセットを削除しました');
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Trigger file input for color extraction
  const handleTriggerColorExtraction = () => {
    colorFileInputRef.current?.click();
  };

  // Extract color palette from user-uploaded image
  const handleColorImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtractingColor(true);
    setToastMessage('画像から主要カラーを解析・抽出中...');
    try {
      const colors = await extractColorsFromImage(file, 4);
      if (colors.length >= 2) {
        pushHistory();
        const step = Math.floor(100 / (colors.length - 1));
        const newStops: ColorStop[] = colors.map((c, i) => ({
          id: `extracted-${Date.now()}-${i}`,
          color: c,
          position: i === colors.length - 1 ? 100 : i * step,
        }));
        setGradient((prev) => ({
          ...prev,
          color1: colors[0],
          color2: colors[1],
          color3: colors[2] || prev.color3,
          stops: newStops,
        }));
        setToastMessage(`画像から${colors.length}色のパレットを抽出・適用しました！`);
      } else {
        setToastMessage('画像から十分な色を抽出できませんでした');
      }
    } catch (err) {
      console.error(err);
      setToastMessage('画像からのカラー抽出でエラーが発生しました');
    } finally {
      setIsExtractingColor(false);
      if (colorFileInputRef.current) colorFileInputRef.current.value = '';
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // Add text layer at center
  const handleAddText = () => {
    pushHistory();
    const newId = `text-${Date.now()}`;
    const newLayer: TextLayer = {
      id: newId,
      text: 'グラデコ テキスト',
      fontFamily: 'Noto Sans JP',
      fontLabel: 'Noto Sans JP',
      fontSize: Math.round(20 + (gradient.sizeSlider / 100) * 36),
      color: '#FFFFFF',
      fontWeight: '700',
      hasShadow: true,
      x: Math.round(boxWidth / 2),
      y: Math.round(boxHeight / 2),
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedTextId(newId);
    setActiveTab('text');
    setToastMessage('テキストを追加しました');
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Duplicate text layer
  const handleDuplicateText = (targetLayer?: TextLayer) => {
    let target = targetLayer;
    if (!target || typeof target !== 'object' || !('text' in target) || !('id' in target)) {
      target = textLayers.find((t) => t.id === selectedTextId);
    }
    if (!target || !target.id) return;

    pushHistory();
    const newId = `text-${Date.now()}`;
    const clone: TextLayer = {
      ...target,
      id: newId,
      text: typeof target.text === 'string' ? target.text : 'テキスト',
      fontFamily: target.fontFamily || 'Noto Sans JP',
      fontLabel: target.fontLabel || 'Noto Sans JP',
      fontSize: typeof target.fontSize === 'number' ? target.fontSize : 32,
      fontWeight: target.fontWeight || '700',
      color: target.color || '#FFFFFF',
      x: Math.min(boxWidth - 40, (target.x ?? 100) + 20),
      y: Math.min(boxHeight - 40, (target.y ?? 100) + 20),
    };
    setTextLayers((prev) => [...prev, clone]);
    setSelectedTextId(newId);
    setSelectedImageId(null);
    setSelectedShapeId(null);
    setToastMessage('テキストを複製しました');
    setTimeout(() => setToastMessage(null), 1500);
  };

  // Center active text layer
  const handleCenterText = () => {
    if (!selectedTextId) return;
    pushHistory();
    setTextLayers((layers) =>
      layers.map((t) =>
        t.id === selectedTextId
          ? { ...t, x: Math.round(boxWidth / 2), y: Math.round(boxHeight / 2) }
          : t
      )
    );
    setToastMessage('中央に配置しました');
    setTimeout(() => setToastMessage(null), 1500);
  };

  // Update text layer
  const handleUpdateText = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers((layers) => layers.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Delete text layer
  const handleDeleteText = (idToDelete: string) => {
    pushHistory();
    setTextLayers((layers) => layers.filter((t) => t.id !== idToDelete));
    if (selectedTextId === idToDelete) {
      setSelectedTextId(null);
    }
  };

  // Image & Shape layer methods
  const handleUpdateImage = (id: string, updates: Partial<ImageLayer>) => {
    setImageLayers((layers) => layers.map((img) => (img.id === id ? { ...img, ...updates } : img)));
  };

  const handleDeleteImage = (idToDelete: string) => {
    pushHistory();
    setImageLayers((layers) => layers.filter((img) => img.id !== idToDelete));
    if (selectedImageId === idToDelete) {
      setSelectedImageId(null);
    }
  };

  const handleDuplicateImage = (targetLayer?: ImageLayer) => {
    let target = targetLayer;
    if (!target || typeof target !== 'object' || !('src' in target) || !('id' in target)) {
      target = imageLayers.find((img) => img.id === selectedImageId);
    }
    if (!target || !target.id) return;

    pushHistory();
    const newId = `img-${Date.now()}`;
    const clone: ImageLayer = {
      ...target,
      id: newId,
      x: Math.min(boxWidth - 40, (target.x ?? 100) + 20),
      y: Math.min(boxHeight - 40, (target.y ?? 100) + 20),
    };
    setImageLayers((prev) => [...prev, clone]);
    setSelectedImageId(newId);
    setSelectedTextId(null);
    setSelectedShapeId(null);
    setToastMessage('画像を複製しました');
    setTimeout(() => setToastMessage(null), 1500);
  };

  const handleDuplicateShape = (targetLayer?: ShapeStampLayer) => {
    let target = targetLayer;
    if (!target || typeof target !== 'object' || !('fillColor' in target) || !('id' in target)) {
      target = shapeLayers.find((s) => s.id === selectedShapeId);
    }
    if (!target || !target.id) return;

    pushHistory();
    const newId = `shape-${Date.now()}`;
    const clone: ShapeStampLayer = {
      ...target,
      id: newId,
      x: Math.min(boxWidth - 40, (target.x ?? 100) + 20),
      y: Math.min(boxHeight - 40, (target.y ?? 100) + 20),
    };
    setShapeLayers((prev) => [...prev, clone]);
    setSelectedShapeId(newId);
    setSelectedTextId(null);
    setSelectedImageId(null);
    setToastMessage('バッジを複製しました');
    setTimeout(() => setToastMessage(null), 1500);
  };

  const handleUpdateShape = (id: string, updates: Partial<ShapeStampLayer>) => {
    setShapeLayers((layers) => layers.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteShape = (idToDelete: string) => {
    pushHistory();
    setShapeLayers((layers) => layers.filter((s) => s.id !== idToDelete));
    if (selectedShapeId === idToDelete) {
      setSelectedShapeId(null);
    }
  };

  // Alignment helpers
  const handleAlignHorizontalCenter = () => {
    pushHistory();
    const centerX = Math.round(boxWidth / 2);
    if (selectedTextId) {
      setTextLayers((prev) => prev.map((t) => (t.id === selectedTextId ? { ...t, x: centerX } : t)));
    } else if (selectedImageId) {
      setImageLayers((prev) => prev.map((img) => (img.id === selectedImageId ? { ...img, x: centerX } : img)));
    } else if (selectedShapeId) {
      setShapeLayers((prev) => prev.map((s) => (s.id === selectedShapeId ? { ...s, x: centerX } : s)));
    }
    setToastMessage('水平中央に揃えました');
    setTimeout(() => setToastMessage(null), 1200);
  };

  const handleAlignVerticalCenter = () => {
    pushHistory();
    const centerY = Math.round(boxHeight / 2);
    if (selectedTextId) {
      setTextLayers((prev) => prev.map((t) => (t.id === selectedTextId ? { ...t, y: centerY } : t)));
    } else if (selectedImageId) {
      setImageLayers((prev) => prev.map((img) => (img.id === selectedImageId ? { ...img, y: centerY } : img)));
    } else if (selectedShapeId) {
      setShapeLayers((prev) => prev.map((s) => (s.id === selectedShapeId ? { ...s, y: centerY } : s)));
    }
    setToastMessage('垂直中央に揃えました');
    setTimeout(() => setToastMessage(null), 1200);
  };

  // Layer ordering
  const handleBringForward = () => {
    pushHistory();
    if (selectedTextId) {
      setTextLayers((prev) => {
        const idx = prev.findIndex((t) => t.id === selectedTextId);
        if (idx < 0 || idx === prev.length - 1) return prev;
        const copy = [...prev];
        const temp = copy[idx];
        copy[idx] = copy[idx + 1];
        copy[idx + 1] = temp;
        return copy;
      });
    } else if (selectedImageId) {
      setImageLayers((prev) => {
        const idx = prev.findIndex((img) => img.id === selectedImageId);
        if (idx < 0 || idx === prev.length - 1) return prev;
        const copy = [...prev];
        const temp = copy[idx];
        copy[idx] = copy[idx + 1];
        copy[idx + 1] = temp;
        return copy;
      });
    } else if (selectedShapeId) {
      setShapeLayers((prev) => {
        const idx = prev.findIndex((s) => s.id === selectedShapeId);
        if (idx < 0 || idx === prev.length - 1) return prev;
        const copy = [...prev];
        const temp = copy[idx];
        copy[idx] = copy[idx + 1];
        copy[idx + 1] = temp;
        return copy;
      });
    }
    setToastMessage('前面へ移動しました');
    setTimeout(() => setToastMessage(null), 1000);
  };

  const handleSendBackward = () => {
    pushHistory();
    if (selectedTextId) {
      setTextLayers((prev) => {
        const idx = prev.findIndex((t) => t.id === selectedTextId);
        if (idx <= 0) return prev;
        const copy = [...prev];
        const temp = copy[idx];
        copy[idx] = copy[idx - 1];
        copy[idx - 1] = temp;
        return copy;
      });
    } else if (selectedImageId) {
      setImageLayers((prev) => {
        const idx = prev.findIndex((img) => img.id === selectedImageId);
        if (idx <= 0) return prev;
        const copy = [...prev];
        const temp = copy[idx];
        copy[idx] = copy[idx - 1];
        copy[idx - 1] = temp;
        return copy;
      });
    } else if (selectedShapeId) {
      setShapeLayers((prev) => {
        const idx = prev.findIndex((s) => s.id === selectedShapeId);
        if (idx <= 0) return prev;
        const copy = [...prev];
        const temp = copy[idx];
        copy[idx] = copy[idx - 1];
        copy[idx - 1] = temp;
        return copy;
      });
    }
    setToastMessage('背面へ移動しました');
    setTimeout(() => setToastMessage(null), 1000);
  };

  // Quick size change (+/-)
  const handleQuickSizeChange = (delta: number) => {
    pushHistory();
    if (selectedTextId) {
      setTextLayers((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTextId) return t;
          const newSize = Math.max(12, Math.min(260, t.fontSize + delta * 6));
          return { ...t, fontSize: newSize };
        })
      );
    } else if (selectedImageId) {
      setImageLayers((prev) =>
        prev.map((img) => {
          if (img.id !== selectedImageId) return img;
          const factor = delta > 0 ? 1.15 : 0.85;
          return {
            ...img,
            width: Math.round(Math.max(20, Math.min(boxWidth, img.width * factor))),
            height: Math.round(Math.max(20, Math.min(boxHeight, img.height * factor))),
          };
        })
      );
    } else if (selectedShapeId) {
      setShapeLayers((prev) =>
        prev.map((s) => {
          if (s.id !== selectedShapeId) return s;
          const factor = delta > 0 ? 1.15 : 0.85;
          return {
            ...s,
            width: Math.round(Math.max(20, Math.min(boxWidth, s.width * factor))),
            height: Math.round(Math.max(20, Math.min(boxHeight, s.height * factor))),
          };
        })
      );
    }
  };

  const selectedTextLayer = textLayers.find((t) => t.id === selectedTextId) || null;

  // Select Japanese font from modal
  const handleSelectFont = (font: JapaneseFont) => {
    loadGoogleFont(font.family);
    if (selectedTextId) {
      setTextLayers((layers) =>
        layers.map((t) =>
          t.id === selectedTextId ? { ...t, fontFamily: font.family, fontLabel: font.name } : t
        )
      );
      setToastMessage(`フォント「${font.name}」を適用しました`);
    } else if (textLayers.length > 0) {
      const targetId = textLayers[textLayers.length - 1].id;
      setTextLayers((layers) =>
        layers.map((t) =>
          t.id === targetId ? { ...t, fontFamily: font.family, fontLabel: font.name } : t
        )
      );
    }
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Quick font select
  const quickFonts = [
    { label: 'Noto Sans JP (標準)', value: 'Noto Sans JP' },
    { label: 'しっぽり明朝 (流麗)', value: 'Shippori Mincho' },
    { label: 'Zen 丸ゴシック (親しみ)', value: 'Zen Maru Gothic' },
    { label: 'デラ・ゴシック (超極太)', value: 'Dela Gothic One' },
    { label: '解星 デコール (可憐)', value: 'Kaisei Decol' },
    { label: '八二ポップ (可愛い)', value: 'Hachi Maru Pop' },
    { label: '游築 墨 (毛筆)', value: 'Yuji Boku' },
    { label: 'DotGothic16 (レトロ)', value: 'DotGothic16' },
  ];

  // Size slider adjusts font size of active text layer or gradient size
  const handleSizeSliderChange = (val: number) => {
    setGradient((prev) => ({ ...prev, sizeSlider: val }));
    if (selectedTextId) {
      const calcSize = Math.round(14 + (val / 100) * 64);
      setTextLayers((layers) =>
        layers.map((t) => (t.id === selectedTextId ? { ...t, fontSize: calcSize } : t))
      );
    }
  };

  // Open Save Dialog to let user pick name & options
  const handleOpenSaveDialog = () => {
    setShowSaveDialog(true);
  };

  // Perform project save with user-chosen name and options
  const handlePerformSave = async (chosenName: string, asNew: boolean, isFav: boolean) => {
    const settings = getAppSettings();
    try {
      const targetId = (!asNew && currentProjectId) ? currentProjectId : `proj-${Date.now()}`;
      const proj: SavedProject = {
        id: targetId,
        name: chosenName,
        createdAt: (!asNew && initialProject?.createdAt) || Date.now(),
        updatedAt: Date.now(),
        isFavorite: isFav,
        snapshot: {
          gradient,
          textLayers,
          imageLayers,
          shapeLayers,
          canvasConfig,
        },
      };
      await saveProject(proj);
      setCurrentProjectId(targetId);
      setProjectName(chosenName);
      setIsFavorite(isFav);
      saveEditorBackup({
        projectId: targetId,
        projectName: chosenName,
        isFavorite: isFav,
        snapshot: proj.snapshot,
      });
      setAutoSaveStatus('saved');
      setLastAutoSaveTime(Date.now());
      setToastMessage(`「${chosenName}」を保存しました`);
    } catch (e) {
      setToastMessage('保存に失敗しました');
    } finally {
      setTimeout(() => setToastMessage(null), settings.toastDurationMs || 2500);
    }
  };

  // Download Action using custom project name and export scale settings
  const handleDownload = async (formatOverride?: 'png' | 'jpg' | 'svg') => {
    const settings = getAppSettings();
    const format = formatOverride || canvasConfig.fileFormat || (settings.defaultExportFormat as any) || 'png';
    const scale = settings.defaultExportScale || 2;
    const exportWidth = boxWidth * scale;
    const exportHeight = boxHeight * scale;

    const baseName = formatExportFileName(projectName, format, settings.fileNamePattern).replace(/\.[^/.]+$/, '');

    try {
      await exportCanvasImage(
        exportWidth,
        exportHeight,
        boxWidth,
        boxHeight,
        gradient,
        textLayers,
        format,
        baseName,
        imageLayers,
        shapeLayers,
        canvasConfig
      );
      setToastMessage(`${format.toUpperCase()} (${baseName}.${format}) をダウンロードしました`);
    } catch (err) {
      console.error(err);
      setToastMessage('ダウンロード処理でエラーが発生しました');
    } finally {
      setTimeout(() => setToastMessage(null), settings.toastDurationMs || 2500);
    }
  };

  // Video Export Action
  const handleExportVideo = async (formatOverride?: 'mp4' | 'webm' | 'gif') => {
    const format = formatOverride || canvasConfig.videoConfig?.format || 'mp4';
    const duration = canvasConfig.videoConfig?.duration || 5;
    const fps = canvasConfig.videoConfig?.fps || 30;
    const motionStyle = canvasConfig.videoConfig?.motionStyle || 'aurora';
    const speed = canvasConfig.videoConfig?.speed || 1;

    setIsExportingVideo(true);
    setVideoExportProgress(0);

    try {
      const recCanvas = document.createElement('canvas');
      const exportW = boxWidth * 2;
      const exportH = boxHeight * 2;
      recCanvas.width = exportW;
      recCanvas.height = exportH;
      const ctx = recCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      const stops = getEffectiveStops(gradient);

      const renderFrame = (progress: number) => {
        let dynamicAngle = gradient.angle ?? 135;
        let dynamicHue = 0;
        let scalePulse = 1;

        if (motionStyle === 'aurora') {
          dynamicHue = Math.sin(progress * 2 * Math.PI) * 45;
          dynamicAngle += Math.cos(progress * 2 * Math.PI) * 20;
        } else if (motionStyle === 'pulse') {
          scalePulse = 1 + Math.sin(progress * 2 * Math.PI) * 0.05;
        } else if (motionStyle === 'colorCycle') {
          dynamicHue = progress * 360;
        } else if (motionStyle === 'drift') {
          dynamicAngle += progress * 360;
        } else if (motionStyle === 'neonFlow') {
          dynamicHue = Math.sin(progress * Math.PI) * 30;
        } else if (motionStyle === 'zoomGlow') {
          scalePulse = 1 + Math.sin(progress * 2 * Math.PI) * 0.08;
        }

        ctx.save();
        ctx.clearRect(0, 0, exportW, exportH);

        const filterParts: string[] = [];
        if (dynamicHue !== 0) {
          filterParts.push(`hue-rotate(${dynamicHue}deg)`);
        }
        if (gradient.filters?.brightness && gradient.filters.brightness !== 100) filterParts.push(`brightness(${gradient.filters.brightness}%)`);
        if (gradient.filters?.contrast && gradient.filters.contrast !== 100) filterParts.push(`contrast(${gradient.filters.contrast}%)`);
        if (gradient.filters?.saturation && gradient.filters.saturation !== 100) filterParts.push(`saturate(${gradient.filters.saturation}%)`);
        ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';

        const rad = (dynamicAngle * Math.PI) / 180;
        const halfDiag = (Math.sqrt(exportW * exportW + exportH * exportH) / 2) * scalePulse;
        const cx = exportW / 2;
        const cy = exportH / 2;
        const x1 = cx - Math.cos(rad) * halfDiag;
        const y1 = cy - Math.sin(rad) * halfDiag;
        const x2 = cx + Math.cos(rad) * halfDiag;
        const y2 = cy + Math.sin(rad) * halfDiag;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.position / 100)), s.color));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, exportW, exportH);

        ctx.filter = 'none';

        if (canvasConfig.frameBorderWidth && canvasConfig.frameBorderWidth > 0) {
          ctx.strokeStyle = canvasConfig.frameBorderColor || '#FFFFFF';
          ctx.lineWidth = canvasConfig.frameBorderWidth * 2;
          ctx.strokeRect(0, 0, exportW, exportH);
        }

        const scaleX = exportW / boxWidth;
        const scaleY = exportH / boxHeight;
        for (const t of textLayers) {
          ctx.save();
          ctx.translate(t.x * scaleX, t.y * scaleY);
          if (t.rotation) ctx.rotate((t.rotation * Math.PI) / 180);
          ctx.font = `${t.fontWeight || '700'} ${t.fontSize * scaleX}px '${t.fontFamily || 'Noto Sans JP'}', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (t.hasShadow !== false) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 8 * scaleX;
            ctx.shadowOffsetY = 3 * scaleY;
          }

          // Draw Stroke (袋文字外枠) if configured
          if (t.strokeColor && t.strokeWidth && t.strokeWidth > 0) {
            ctx.save();
            ctx.strokeStyle = t.strokeColor;
            ctx.lineWidth = t.strokeWidth * 2 * scaleX;
            ctx.lineJoin = 'round';
            ctx.miterLimit = 2;
            ctx.strokeText(t.text, 0, 0);
            ctx.restore();
          }

          ctx.fillStyle = t.color || '#FFFFFF';
          ctx.fillText(t.text, 0, 0);
          ctx.restore();
        }

        ctx.restore();
      };

      const result = await recordCanvasAnimation(recCanvas, {
        durationSeconds: duration,
        fps,
        format,
        width: exportW,
        height: exportH,
        renderFrame,
        onProgress: (p) => setVideoExportProgress(p),
      });

      const settings = getAppSettings();
      const videoFileName = formatExportFileName(projectName, result.extension, settings.fileNamePattern);
      downloadBlob(result.blob, videoFileName);
      setToastMessage(`動画 (${videoFileName}) を書き出しました`);
    } catch (err) {
      console.error(err);
      setToastMessage('動画の書き出しに失敗しました');
    } finally {
      setIsExportingVideo(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleCopyCss = () => {
    const css = `background: ${getGradientCss(gradient)};${
      gradient.filters?.noise ? ' /* Noise filter enabled */' : ''
    }`;
    navigator.clipboard.writeText(css);
    setToastMessage('CSSコードをクリップボードにコピーしました');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyTailwind = () => {
    const css = getGradientCss(gradient).replace(/\s+/g, '_');
    const tailwind = `bg-[${css}]`;
    navigator.clipboard.writeText(tailwind);
    setToastMessage('Tailwind CSS クラスをコピーしました');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Share on X (formerly Twitter)
  const handleShareOnX = () => {
    setShowShareOnXDialog(true);
  };

  // Image Upload handler
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (!result) return;
      const img = new Image();
      img.onload = () => {
        pushHistory();
        const naturalW = img.naturalWidth || 200;
        const naturalH = img.naturalHeight || 200;
        const targetW = Math.min(200, Math.round(boxWidth * 0.45));
        const targetH = Math.round((targetW / naturalW) * naturalH);
        const newId = `img-${Date.now()}`;
        const newLayer: ImageLayer = {
          id: newId,
          src: result,
          name: file.name,
          x: Math.round(boxWidth / 2),
          y: Math.round(boxHeight / 2),
          width: targetW,
          height: targetH,
          opacity: 100,
          borderRadius: 8,
          hasShadow: true,
        };
        setImageLayers((prev) => [...prev, newLayer]);
        setSelectedImageId(newId);
        setSelectedTextId(null);
        setSelectedShapeId(null);
        setActiveTab('image');
        setToastMessage('画像を挿入しました');
        setTimeout(() => setToastMessage(null), 1800);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Preset Sticker handler
  const handleAddPresetSticker = (sticker: typeof PRESET_STICKERS[0]) => {
    pushHistory();
    const newId = `sticker-${Date.now()}`;
    const offset = (imageLayers.length % 5) * 15;
    const newLayer: ImageLayer = {
      id: newId,
      src: sticker.svgDataUri,
      name: sticker.name,
      x: Math.round(boxWidth / 2 + offset),
      y: Math.round(boxHeight / 2 + offset),
      width: 90,
      height: 90,
      opacity: 100,
      hasShadow: true,
    };
    setImageLayers((prev) => [...prev, newLayer]);
    setSelectedImageId(newId);
    setSelectedTextId(null);
    setSelectedShapeId(null);
    setActiveTab('image');
    setToastMessage(`「${sticker.name}」を追加しました`);
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Preset Badge handler
  const handleAddPresetBadge = (badge: typeof PRESET_BADGES[0]) => {
    pushHistory();
    const newId = `badge-${Date.now()}`;
    const offset = (shapeLayers.length % 5) * 15;
    const newLayer: ShapeStampLayer = {
      id: newId,
      type: badge.type,
      text: badge.label,
      x: Math.round(boxWidth / 2 + offset),
      y: Math.round(boxHeight / 2 + offset),
      width: 100,
      height: 44,
      fillColor: badge.fillColor,
      textColor: badge.textColor,
      borderColor: badge.borderColor,
      borderWidth: badge.borderColor ? 2 : 0,
      hasShadow: true,
    };
    setShapeLayers((prev) => [...prev, newLayer]);
    setSelectedShapeId(newId);
    setSelectedTextId(null);
    setSelectedImageId(null);
    setActiveTab('image');
    setToastMessage(`「${badge.label}」を追加しました`);
    setTimeout(() => setToastMessage(null), 1800);
  };

  // DRAGGING TEXT: Completely twitch-free, isolated pointer tracking with smart snapping!
  const handleTextLayerPointerDown = (e: React.PointerEvent<HTMLDivElement>, layer: TextLayer) => {
    e.stopPropagation();

    // Double-click / double-tap detection
    if (e.detail === 2) {
      e.preventDefault();
      setEditingTextId(layer.id);
      return;
    }

    e.preventDefault();
    setSelectedTextId(layer.id);
    setSelectedImageId(null);
    setSelectedShapeId(null);
    setIsDraggingBg(false);
    setActiveTab('text');

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startLayerX = layer.x;
    const startLayerY = layer.y;
    let hasMoved = false;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const safeZoom = zoomScale || 1;
      const dx = (moveEv.clientX - startClientX) / safeZoom;
      const dy = (moveEv.clientY - startClientY) / safeZoom;

      if (Math.hypot(dx, dy) > 2) {
        hasMoved = true;
      }

      let newX = Math.round(Math.max(10, Math.min(boxWidth - 10, startLayerX + dx)));
      let newY = Math.round(Math.max(10, Math.min(boxHeight - 10, startLayerY + dy)));

      if (showGuides) {
        const snapThreshold = 8;
        const centerX = Math.round(boxWidth / 2);
        const centerY = Math.round(boxHeight / 2);
        if (Math.abs(newX - centerX) <= snapThreshold) {
          newX = centerX;
          setActiveGuideX(centerX);
        } else {
          setActiveGuideX(null);
        }
        if (Math.abs(newY - centerY) <= snapThreshold) {
          newY = centerY;
          setActiveGuideY(centerY);
        } else {
          setActiveGuideY(null);
        }
      }

      setTextLayers((prev) =>
        prev.map((t) => (t.id === layer.id ? { ...t, x: newX, y: newY } : t))
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setActiveGuideX(null);
      setActiveGuideY(null);
      if (hasMoved) {
        pushHistory();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // DRAGGING IMAGE
  const handleImageLayerPointerDown = (e: React.PointerEvent<HTMLDivElement>, layer: ImageLayer) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImageId(layer.id);
    setSelectedTextId(null);
    setSelectedShapeId(null);
    setIsDraggingBg(false);
    setActiveTab('image');

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startLayerX = layer.x;
    const startLayerY = layer.y;
    let hasMoved = false;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const safeZoom = zoomScale || 1;
      const dx = (moveEv.clientX - startClientX) / safeZoom;
      const dy = (moveEv.clientY - startClientY) / safeZoom;

      if (Math.hypot(dx, dy) > 2) {
        hasMoved = true;
      }

      let newX = Math.round(Math.max(10, Math.min(boxWidth - 10, startLayerX + dx)));
      let newY = Math.round(Math.max(10, Math.min(boxHeight - 10, startLayerY + dy)));

      if (showGuides) {
        const snapThreshold = 8;
        const centerX = Math.round(boxWidth / 2);
        const centerY = Math.round(boxHeight / 2);
        if (Math.abs(newX - centerX) <= snapThreshold) {
          newX = centerX;
          setActiveGuideX(centerX);
        } else {
          setActiveGuideX(null);
        }
        if (Math.abs(newY - centerY) <= snapThreshold) {
          newY = centerY;
          setActiveGuideY(centerY);
        } else {
          setActiveGuideY(null);
        }
      }

      setImageLayers((prev) =>
        prev.map((img) => (img.id === layer.id ? { ...img, x: newX, y: newY } : img))
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setActiveGuideX(null);
      setActiveGuideY(null);
      if (hasMoved) {
        pushHistory();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // DRAGGING SHAPE/BADGE
  const handleShapeLayerPointerDown = (e: React.PointerEvent<HTMLDivElement>, layer: ShapeStampLayer) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedShapeId(layer.id);
    setSelectedTextId(null);
    setSelectedImageId(null);
    setIsDraggingBg(false);
    setActiveTab('image');

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startLayerX = layer.x;
    const startLayerY = layer.y;
    let hasMoved = false;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const safeZoom = zoomScale || 1;
      const dx = (moveEv.clientX - startClientX) / safeZoom;
      const dy = (moveEv.clientY - startClientY) / safeZoom;

      if (Math.hypot(dx, dy) > 2) {
        hasMoved = true;
      }

      let newX = Math.round(Math.max(10, Math.min(boxWidth - 10, startLayerX + dx)));
      let newY = Math.round(Math.max(10, Math.min(boxHeight - 10, startLayerY + dy)));

      if (showGuides) {
        const snapThreshold = 8;
        const centerX = Math.round(boxWidth / 2);
        const centerY = Math.round(boxHeight / 2);
        if (Math.abs(newX - centerX) <= snapThreshold) {
          newX = centerX;
          setActiveGuideX(centerX);
        } else {
          setActiveGuideX(null);
        }
        if (Math.abs(newY - centerY) <= snapThreshold) {
          newY = centerY;
          setActiveGuideY(centerY);
        } else {
          setActiveGuideY(null);
        }
      }

      setShapeLayers((prev) =>
        prev.map((s) => (s.id === layer.id ? { ...s, x: newX, y: newY } : s))
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setActiveGuideX(null);
      setActiveGuideY(null);
      if (hasMoved) {
        pushHistory();
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Canvas background drag (only when clicking directly on canvas empty area)
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).closest('[data-canvas-layer]') ||
      (e.target as HTMLElement).closest('[data-transform-handle]')
    ) {
      return;
    }
    // Deselect layer on empty background click
    setSelectedTextId(null);
    setSelectedImageId(null);
    setSelectedShapeId(null);
    setEditingTextId(null);

    setIsDraggingBg(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingBg) return;
    const safeZoom = zoomScale || 1;
    const deltaX = (e.clientX - dragStart.x) / safeZoom;
    const deltaY = (e.clientY - dragStart.y) / safeZoom;
    setGradient((prev) => ({
      ...prev,
      bgOffset: {
        x: prev.bgOffset.x + deltaX,
        y: prev.bgOffset.y + deltaY,
      },
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasPointerUp = () => {
    if (isDraggingBg) {
      pushHistory();
      setIsDraggingBg(false);
    }
  };

  const isSingleColor = gradient.type === 'single';
  const showAngleControls =
    gradient.type === 'linear-diagonal' ||
    gradient.type === 'conic' ||
    gradient.type === 'repeating-linear';

  const filteredPresets = GRADIENT_PRESETS.filter((p) => {
    if (presetCategory === 'all') return true;
    return p.category === presetCategory;
  });

  const effectiveStops = getEffectiveStops(gradient);
  const cssFilters = getCssFilterString(gradient.filters);

  return (
    <div className="w-full h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col overflow-hidden select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)] shadow-lg text-xs font-medium flex items-center gap-2"
          >
            <M3Icon name="info" size={16} className="text-[var(--md-sys-color-inverse-primary)]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Picker Dialog */}
      <M3Dialog
        isOpen={showPresetsDialog}
        onClose={() => setShowPresetsDialog(false)}
        title="グラデーションプリセット"
        icon="palette"
        cancelLabel="閉じる"
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
            プロが調色した洗練されたグラデーションスタイルをワンタップで適用できます。
          </p>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'すべて' },
              { id: 'my', label: `★ マイプリセット (${myPresets.length})` },
              { id: 'vivid', label: '鮮やか (Vivid)' },
              { id: 'pastel', label: 'パステル (Pastel)' },
              { id: 'nature', label: '自然 (Nature)' },
              { id: 'dark', label: 'ダーク (Dark)' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setPresetCategory(cat.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  presetCategory === cat.id
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                    : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Save to My Presets bar when in My Presets tab */}
          {presetCategory === 'my' && (
            <div className="flex items-center gap-2 p-2.5 rounded-[14px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40">
              <input
                type="text"
                value={customPresetName}
                onChange={(e) => setCustomPresetName(e.target.value)}
                placeholder="現在の配色を名前を付けて保存..."
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/50 focus:outline-none focus:border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface)]"
              />
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                className="px-3 py-1.5 rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold hover:brightness-105 active:scale-95 transition cursor-pointer shrink-0 flex items-center gap-1"
              >
                <M3Icon name="bookmark_add" size={14} />
                <span>保存</span>
              </button>
            </div>
          )}

          {presetCategory === 'my' ? (
            myPresets.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                保存されたマイプリセットはありません。<br />
                上の入力欄から現在の配色をお気に入りプリセットとして保存できます。
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {myPresets.map((preset) => {
                  const bgCss = getGradientCss({
                    ...preset.gradient,
                    sizeSlider: 40,
                    bgOffset: { x: 0, y: 0 },
                  });
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyMyPreset(preset)}
                      className="flex flex-col text-left rounded-[14px] overflow-hidden border border-[var(--md-sys-color-outline-variant)]/40 bg-[var(--md-sys-color-surface-container)] hover:border-[var(--md-sys-color-primary)] hover:shadow-md transition-all group cursor-pointer p-1 relative"
                    >
                      <div
                        className="h-18 w-full rounded-[10px] mb-1.5 shadow-2xs group-hover:scale-[1.02] transition-transform relative"
                        style={{ background: bgCss }}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDeleteMyPreset(preset.id, e)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition cursor-pointer opacity-0 group-hover:opacity-100"
                          title="削除"
                        >
                          <M3Icon name="delete" size={13} />
                        </button>
                      </div>
                      <div className="px-1.5 pb-1 flex items-center justify-between">
                        <p className="text-[12px] font-bold text-[var(--md-sys-color-on-surface)] truncate">
                          {preset.name}
                        </p>
                        <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] shrink-0">
                          {preset.gradient.stops?.length || 2}色
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const bgCss = getGradientCss({
                  type: preset.type,
                  color1: preset.color1,
                  color2: preset.color2,
                  color3: preset.color3,
                  slider1: preset.slider1,
                  slider2: preset.slider2,
                  sizeSlider: 40,
                  angle: preset.angle,
                  bgOffset: { x: 0, y: 0 },
                });
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="flex flex-col text-left rounded-[14px] overflow-hidden border border-[var(--md-sys-color-outline-variant)]/40 bg-[var(--md-sys-color-surface-container)] hover:border-[var(--md-sys-color-primary)] hover:shadow-md transition-all group cursor-pointer p-1"
                  >
                    <div
                      className="h-18 w-full rounded-[10px] mb-1.5 shadow-2xs group-hover:scale-[1.02] transition-transform"
                      style={{ background: bgCss }}
                    />
                    <div className="px-1.5 pb-1">
                      <p className="text-[12px] font-bold text-[var(--md-sys-color-on-surface)] truncate">
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] capitalize">
                        {preset.category}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </M3Dialog>

      {/* Hidden file input for Color Extraction from images */}
      <input
        type="file"
        ref={colorFileInputRef}
        onChange={handleColorImageSelected}
        accept="image/*"
        className="hidden"
      />

      {/* CSS / Tailwind / React Code Export Modal */}
      <CssExportModal
        isOpen={showCssExportModal}
        onClose={() => setShowCssExportModal(false)}
        gradient={gradient}
        canvasConfig={canvasConfig}
      />

      {/* 50+ Japanese Font Picker Modal */}
      <FontPickerModal
        isOpen={showFontPicker}
        onClose={() => setShowFontPicker(false)}
        currentFont={selectedTextLayer?.fontFamily || 'Noto Sans JP'}
        previewText={selectedTextLayer?.text || '美しい日本語グラデーション'}
        onSelectFont={handleSelectFont}
      />

      {/* Beginner Guide Modal */}
      <BeginnerGuideModal
        isOpen={showBeginnerGuide || showHelpDialog}
        onClose={() => {
          setShowBeginnerGuide(false);
          setShowHelpDialog(false);
        }}
        onTryRandomColor={handleRandomGradient}
        onOpenPresets={() => setShowPresetsDialog(true)}
        onAddSampleText={handleAddText}
      />

      {/* Video Export Progress Dialog */}
      <M3Dialog
        isOpen={isExportingVideo}
        onClose={() => {}}
        title="動画を書き出し中"
      >
        <div className="flex flex-col items-center justify-center p-4 gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)]">
            <M3Icon name="movie" size={30} />
          </div>
          <div className="w-full">
            <h4 className="text-[15px] font-bold text-[var(--md-sys-color-on-surface)] mb-1">
              動画フレームをレンダリングしています
            </h4>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-3">
              {canvasConfig.videoConfig?.duration || 5}秒間のアニメーションを{(canvasConfig.videoConfig?.format || 'mp4').toUpperCase()}形式でエンコード中...
            </p>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--md-sys-color-primary)] transition-all duration-150 rounded-full"
                style={{ width: `${Math.round(videoExportProgress * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[var(--md-sys-color-primary)] mt-1.5 block">
              {Math.round(videoExportProgress * 100)}% 完了
            </span>
          </div>
        </div>
      </M3Dialog>

      {/* Save Project Dialog */}
      <SaveProjectDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        currentName={projectName}
        isExistingProject={!!currentProjectId}
        isFavorite={isFavorite}
        gradient={gradient}
        textLayers={textLayers}
        onSave={handlePerformSave}
      />

      {/* COMPACT HEADER: Responsive sleek layout */}
      <header className="w-full h-[46px] sm:h-[50px] px-3 sm:px-4 py-1 flex items-center justify-between shrink-0 z-30 border-b border-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface)]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              saveEditorBackup(latestBackupDataRef.current);
              onNavigateHome();
            }}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 outline-none rounded-xl p-0.5 shrink-0"
            title="ホームに戻る"
          >
            <GradecoLogo size={28} />
          </button>
          <div className="shrink-0 hidden xs:block">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[15px] sm:text-[17px] font-black tracking-tight text-[var(--md-sys-color-on-surface)] leading-none">
                グラデコ
              </h1>
            </div>
            <span className="hidden sm:inline text-[9px] text-[var(--md-sys-color-on-surface-variant)] font-medium">
              {isVideo ? 'Motion Video Studio' : 'Static Graphic Studio'}
            </span>
          </div>

          {/* Project Title Badge - User can click to rename and save */}
          <div className="h-4 w-px bg-[var(--md-sys-color-outline-variant)]/40 hidden sm:block shrink-0" />
          <button
            type="button"
            onClick={handleOpenSaveDialog}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--md-sys-color-surface-container)]/80 hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 hover:border-[var(--md-sys-color-primary)]/50 transition-all text-left max-w-[130px] sm:max-w-[200px] md:max-w-[280px] cursor-pointer"
            title="作品名を変更・保存する"
          >
            <span className="text-[12px] sm:text-[13px] font-semibold text-[var(--md-sys-color-on-surface)] truncate">
              {projectName}
            </span>
            <M3Icon
              name="edit"
              size={13}
              className="text-[var(--md-sys-color-outline)] group-hover:text-[var(--md-sys-color-primary)] shrink-0 transition-colors"
            />
          </button>

          {/* Auto-backup status indicator */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all"
            title={`ローカル自動バックアップ: 変更があるたびに安全に保存されています (${formatBackupTime(lastAutoSaveTime)})`}
          >
            {autoSaveStatus === 'saving' ? (
              <div className="flex items-center gap-1.5 text-[var(--md-sys-color-primary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] animate-ping shrink-0" />
                <span className="hidden md:inline text-[11px] font-medium">自動保存中...</span>
              </div>
            ) : autoSaveStatus === 'saved' ? (
              <div className="flex items-center gap-1 text-[var(--md-sys-color-on-surface-variant)]">
                <M3Icon name="cloud_done" size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="hidden md:inline text-[11px]">自動保存済</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[var(--md-sys-color-error)]">
                <M3Icon name="cloud_off" size={14} className="shrink-0" />
                <span className="hidden md:inline text-[11px]">保存容量注意</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2">
          <M3FloatingToolbar
            variant="standard"
            items={[
              {
                icon: 'save',
                label: '保存',
                onClick: handleOpenSaveDialog,
              },
              {
                icon: 'code',
                label: 'コード出力',
                onClick: () => setShowCssExportModal(true),
              },
              {
                icon: 'undo',
                label: '元に戻す (Ctrl+Z)',
                disabled: past.length === 0,
                onClick: handleUndo,
              },
              {
                icon: 'redo',
                label: 'やり直す (Ctrl+Y)',
                disabled: future.length === 0,
                onClick: handleRedo,
              },
              {
                icon: 'lightbulb',
                label: '🔰 ガイド',
                onClick: () => setShowBeginnerGuide(true),
              },
              {
                icon: 'home',
                label: 'ホーム',
                onClick: onNavigateHome,
              },
            ]}
          />

          {/* Quick Zoom toggle for compact screens */}
          <div className="hidden md:flex items-center bg-[var(--md-sys-color-surface-container)] rounded-full px-1.5 py-0.5 border border-[var(--md-sys-color-outline-variant)]/40 text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => (prev === 1 ? 0.85 : 1))}
              className="px-1.5 py-0.5 rounded-full hover:text-[var(--md-sys-color-primary)] font-mono font-medium cursor-pointer"
              title="表示倍率切替"
            >
              {Math.round(zoomScale * 100)}%
            </button>
          </div>
        </div>

        {/* Download & Export Split Button */}
        <div className="flex items-center gap-1 sm:gap-2">
          <M3SplitButton
            label={
              isVideo
                ? `動画出力 (${(canvasConfig.videoConfig?.format || 'mp4').toUpperCase()})`
                : `画像保存 (${canvasConfig.fileFormat.toUpperCase()})`
            }
            icon={isVideo ? 'movie' : 'download'}
            onMainAction={() => {
              if (isVideo) {
                handleExportVideo();
              } else {
                handleDownload();
              }
            }}
            menuItems={
              isVideo
                ? [
                    {
                      label: 'MP4 形式で動画出力',
                      icon: 'movie',
                      description: '高品質動画 (Reels/Shorts/TikTok対応)',
                      onClick: () => handleExportVideo('mp4'),
                    },
                    {
                      label: 'WebM 形式で動画出力',
                      icon: 'video_file',
                      description: '軽量Web動画形式',
                      onClick: () => handleExportVideo('webm'),
                    },
                    {
                      label: 'GIF アニメーションで出力',
                      icon: 'gif',
                      description: 'ループアニメーション画像',
                      onClick: () => handleExportVideo('gif'),
                    },
                    {
                      label: '現在のフレームをPNG画像で保存',
                      icon: 'image',
                      description: '動画の現在フレームを高精細画像化',
                      onClick: () => handleDownload('png'),
                    },
                    {
                      label: 'コード出力 (CSS / Tailwind / React)',
                      icon: 'terminal',
                      description: 'モーダルでコード全体を確認・コピー',
                      onClick: () => setShowCssExportModal(true),
                    },
                    {
                      label: 'CSSコードをコピー',
                      icon: 'content_copy',
                      description: 'background CSSをクリップボードへ',
                      onClick: handleCopyCss,
                    },
                    {
                      label: 'Tailwind クラスをコピー',
                      icon: 'code',
                      description: 'bg-[...] 形式でコピー',
                      onClick: handleCopyTailwind,
                    },
                    {
                      label: 'X（旧Twitter）で共有',
                      icon: 'share',
                      description: 'デザインと配色スペックをXに投稿',
                      onClick: handleShareOnX,
                    },
                    {
                      label: '静止画モードに切り替える',
                      icon: 'image',
                      description: '動きを解除して画像エディタへ',
                      onClick: () => handleToggleCreationType('image'),
                    },
                  ]
                : [
                    {
                      label: 'X（旧Twitter）で共有',
                      icon: 'share',
                      description: 'デザインと配色スペックをXに投稿',
                      onClick: handleShareOnX,
                    },
                    {
                      label: 'PNG 形式で保存',
                      icon: 'image',
                      description: '高精細ラスター形式 (2x HD)',
                      onClick: () => handleDownload('png'),
                    },
                    {
                      label: 'JPG 形式で保存',
                      icon: 'photo',
                      description: '標準Web画像形式',
                      onClick: () => handleDownload('jpg'),
                    },
                    {
                      label: 'SVG 形式で保存',
                      icon: 'draw',
                      description: 'ベクター形式（和文フォント対応）',
                      onClick: () => handleDownload('svg'),
                    },
                    {
                      label: 'コード出力 (CSS / Tailwind / React)',
                      icon: 'terminal',
                      description: 'モーダルでコード全体を確認・コピー',
                      onClick: () => setShowCssExportModal(true),
                    },
                    {
                      label: 'CSSコードをコピー',
                      icon: 'content_copy',
                      description: 'background CSSをクリップボードへ',
                      onClick: handleCopyCss,
                    },
                    {
                      label: 'Tailwind クラスをコピー',
                      icon: 'code',
                      description: 'bg-[...] 形式でコピー',
                      onClick: handleCopyTailwind,
                    },
                    {
                      label: '動画モードに切り替える',
                      icon: 'videocam',
                      description: '動きをつけて動画として制作',
                      onClick: () => handleToggleCreationType('video'),
                    },
                  ]
            }
          />
        </div>
      </header>

      {/* Mobile Mode Switcher (< lg) */}
      <div className="flex lg:hidden items-center justify-center w-full px-3 py-1 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)]/20 shrink-0">
        <div className="flex items-center p-0.5 bg-[var(--md-sys-color-surface-container)] rounded-full border border-[var(--md-sys-color-outline-variant)]/30 w-full max-w-[280px] shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setMobileViewMode('canvas');
              setTimeout(handleZoomFit, 100);
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              mobileViewMode === 'canvas'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <M3Icon name="visibility" size={14} />
            <span>プレビュー</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileViewMode('settings')}
            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              mobileViewMode === 'settings'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <M3Icon name="tune" size={14} />
            <span>調整パネル</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 min-h-0 w-full p-2 sm:p-3 overflow-hidden flex items-stretch justify-center">
        <div
          className={`flex flex-col lg:flex-row items-stretch justify-center gap-3 w-full h-full ${
            isFullscreenPreview ? 'max-w-5xl' : 'max-w-[1400px]'
          } mx-auto min-h-0 transition-all`}
        >
          {/* Left Controls Box: Fixed header + scrollable panel body + fixed bottom */}
          {!isFullscreenPreview && (() => {
            const tabsList = isVideo
              ? [
                  { id: 'motion', label: '動画', badge: '', icon: 'movie' },
                  { id: 'gradient', label: '配色', badge: '', icon: 'gradient' },
                  { id: 'stops', label: 'ストップ', badge: `${gradient.stops?.length || 0}`, icon: 'palette' },
                  { id: 'text', label: '文字', badge: textLayers.length > 0 ? `${textLayers.length}` : '', icon: 'title' },
                  { id: 'image', label: '素材', badge: (imageLayers.length + shapeLayers.length) > 0 ? `${imageLayers.length + shapeLayers.length}` : '', icon: 'image' },
                  { id: 'canvas', label: '枠・効果', badge: '', icon: 'crop_free' },
                ]
              : [
                  { id: 'gradient', label: '配色', badge: '', icon: 'gradient' },
                  { id: 'stops', label: 'ストップ', badge: `${gradient.stops?.length || 0}`, icon: 'palette' },
                  { id: 'text', label: '文字', badge: textLayers.length > 0 ? `${textLayers.length}` : '', icon: 'title' },
                  { id: 'image', label: '素材', badge: (imageLayers.length + shapeLayers.length) > 0 ? `${imageLayers.length + shapeLayers.length}` : '', icon: 'image' },
                  { id: 'canvas', label: '枠・効果', badge: '', icon: 'crop_free' },
                ];

            return (
              <div
                id="editor-controls-box"
                className={`${
                  mobileViewMode === 'canvas' ? 'hidden lg:flex' : 'flex'
                } ${
                  tabsOrientation === 'vertical'
                    ? 'w-full sm:w-[410px] lg:w-[430px] xl:w-[450px] flex-row gap-2.5 p-2.5 sm:p-3'
                    : 'w-full sm:w-[380px] lg:w-[390px] xl:w-[410px] flex-col justify-between p-3 sm:p-3.5'
                } h-full max-h-full bg-[var(--md-sys-color-surface-container)] rounded-[20px] sm:rounded-[24px] shadow-xs border border-[var(--md-sys-color-outline-variant)]/30 shrink-0 min-h-0 overflow-hidden`}
              >
                {/* 縦型ナビゲーションレイル (Vertical Tabs Rail) */}
                {tabsOrientation === 'vertical' && (
                  <div
                    id="editor-tabs-rail"
                    className="w-[66px] sm:w-[72px] shrink-0 h-full flex flex-col justify-between py-1 px-1 bg-[var(--md-sys-color-surface-container-low)] rounded-[18px] border border-[var(--md-sys-color-outline-variant)]/20 min-h-0"
                  >
                    {/* Vertical tabs list */}
                    <div className="flex flex-col items-center gap-1.5 w-full overflow-y-auto overflow-x-hidden py-0.5 min-h-0">
                      {tabsList.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full py-2.5 px-1 rounded-[14px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative select-none ${
                              isActive
                                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs font-bold'
                                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                            }`}
                            title={`${tab.label}${tab.badge ? ` (${tab.badge})` : ''}`}
                          >
                            <div className="relative flex items-center justify-center">
                              <M3Icon name={tab.icon} size={20} />
                              {tab.badge ? (
                                <span
                                  className={`absolute -top-1 -right-2.5 text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center leading-none ${
                                    isActive
                                      ? 'bg-white text-[var(--md-sys-color-primary)]'
                                      : 'bg-[var(--md-sys-color-primary)] text-white'
                                  }`}
                                >
                                  {tab.badge}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[10px] leading-tight text-center font-medium tracking-tight">
                              {tab.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bottom Orientation Toggle Button */}
                    <div className="shrink-0 flex flex-col items-center gap-1 pt-1.5 border-t border-[var(--md-sys-color-outline-variant)]/20 w-full">
                      <button
                        type="button"
                        onClick={() => setTabsOrientation('horizontal')}
                        className="p-1.5 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer transition flex items-center justify-center"
                        title="横型タブバーに切り替え"
                      >
                        <M3Icon name="view_agenda" size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Right Panel / Content Area Wrapper */}
                <div className="flex-1 min-w-0 h-full flex flex-col justify-between overflow-hidden">
                  {/* Top Header */}
                  <div className="shrink-0 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[15px] sm:text-[16px] font-bold text-[var(--md-sys-color-on-surface)] truncate">
                          デザイン設定
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowBeginnerGuide(true)}
                          className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] hover:brightness-105 flex items-center gap-0.5 cursor-pointer transition shadow-2xs shrink-0"
                          title="初めての方向け使い方ガイド"
                        >
                          <M3Icon name="lightbulb" size={13} />
                          <span>🔰 ガイド</span>
                        </button>
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={handleRandomGradient}
                          className="px-2 py-1 rounded-full text-xs font-semibold text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)]/30 flex items-center gap-1 cursor-pointer transition"
                          title="ランダム生成"
                        >
                          <M3Icon name="casino" size={15} />
                          <span className="hidden sm:inline">おまかせ調色</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPresetsDialog(true)}
                          className="p-1.5 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer"
                          title="プリセット一覧"
                        >
                          <M3Icon name="palette" size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Navigation Tabs (Only in horizontal mode) */}
                    {tabsOrientation === 'horizontal' && (
                      <div className="flex items-center p-0.5 rounded-full bg-[var(--md-sys-color-surface-container-low)] text-[11px] font-medium overflow-x-auto border border-[var(--md-sys-color-outline-variant)]/20 gap-0.5">
                        {tabsList.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-1 px-1 rounded-full flex items-center justify-center gap-0.5 transition-all cursor-pointer whitespace-nowrap ${
                              activeTab === tab.id
                                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs font-bold'
                                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                            }`}
                          >
                            <M3Icon name={tab.icon} size={13} />
                            <span className="truncate">
                              {tab.label}
                              {tab.badge ? ` (${tab.badge})` : ''}
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTabsOrientation('vertical')}
                          className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] shrink-0 cursor-pointer"
                          title="縦型ナビゲーションレイルに配置"
                        >
                          <M3Icon name="view_column" size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Scrollable Tab Body (Only this section scrolls if needed) */}
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5">
                {/* TAB 1: Gradient Types & Core Settings */}
                {activeTab === 'gradient' && (
                  <div className="flex flex-col gap-2.5">
                    {/* Quick Utilities: Color Extract, My Presets, Code Export */}
                    <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-[14px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
                      <button
                        type="button"
                        onClick={handleTriggerColorExtraction}
                        disabled={isExtractingColor}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-[10px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 hover:border-[var(--md-sys-color-primary)] text-[11px] font-semibold text-[var(--md-sys-color-on-surface)] transition cursor-pointer disabled:opacity-50"
                        title="画像からカラーパレットを抽出"
                      >
                        <M3Icon name="colorize" size={13} className="text-[var(--md-sys-color-primary)]" />
                        <span className="truncate">{isExtractingColor ? '抽出中' : '画像抽出'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPresetCategory('my');
                          setShowPresetsDialog(true);
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-[10px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 hover:border-[var(--md-sys-color-primary)] text-[11px] font-semibold text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
                        title="マイプリセット一覧・保存"
                      >
                        <M3Icon name="bookmark" size={13} className="text-amber-500" />
                        <span className="truncate">マイ保存</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCssExportModal(true)}
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-[10px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/30 hover:border-[var(--md-sys-color-primary)] text-[11px] font-semibold text-[var(--md-sys-color-on-surface)] transition cursor-pointer"
                        title="CSS/Tailwind/React コード出力"
                      >
                        <M3Icon name="code" size={13} className="text-emerald-500" />
                        <span className="truncate">コード出力</span>
                      </button>
                    </div>

                    {/* 1-Click Popular Gradient Presets */}
                    <div className="p-2 rounded-[14px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/20">
                      <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">
                        <span className="flex items-center gap-1">
                          <M3Icon name="palette" size={13} className="text-[var(--md-sys-color-primary)]" />
                          人気配色 (1タップ適用)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPresetsDialog(true)}
                          className="text-[10px] text-[var(--md-sys-color-primary)] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          すべて見る
                          <M3Icon name="chevron_right" size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {GRADIENT_PRESETS.slice(0, 8).map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleApplyPreset(p)}
                            className="h-7 rounded-[8px] border border-black/15 shadow-2xs hover:scale-105 active:scale-95 transition-transform cursor-pointer relative overflow-hidden group"
                            title={p.name}
                            style={{
                              background: getGradientCss({
                                type: p.type,
                                color1: p.color1,
                                color2: p.color2,
                                color3: p.color3,
                                slider1: p.slider1,
                                slider2: p.slider2,
                                sizeSlider: 100,
                                bgOffset: { x: 0, y: 0 },
                                angle: p.angle ?? 135,
                              }),
                            }}
                          >
                            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold transition-opacity px-0.5 text-center leading-tight">
                              {p.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <M3Dropdown
                      id="dropdown-gradient-type"
                      label="グラデーションの種類"
                      variant="outlined"
                      options={gradientOptions}
                      selectedValue={currentGradientOption.value}
                      onSelect={handleGradientTypeChange}
                    />

                  {/* Angle Wheel / Degree Input for Angle-based Gradients */}
                  {showAngleControls && (
                    <div className="p-2.5 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
                      <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface)] font-medium mb-1.5">
                        <span className="flex items-center gap-1">
                          <M3Icon name="screen_rotation" size={14} className="text-[var(--md-sys-color-primary)]" />
                          角度 (Angle)
                        </span>
                        <span className="font-mono text-[var(--md-sys-color-primary)] font-bold">
                          {gradient.angle ?? 135}°
                        </span>
                      </div>

                      <M3Slider
                        value={Math.round(((gradient.angle ?? 135) / 360) * 100)}
                        onChange={(val) => {
                          const deg = Math.round((val / 100) * 360);
                          setGradient((prev) => ({ ...prev, angle: deg }));
                        }}
                        ariaLabel="角度調整スライダー"
                      />

                      {/* Quick angle preset chips */}
                      <div className="flex items-center justify-between gap-1 mt-2 text-[10px]">
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => {
                              pushHistory();
                              setGradient((prev) => ({ ...prev, angle: deg }));
                            }}
                            className={`px-1.5 py-0.5 rounded-[6px] transition cursor-pointer ${
                              (gradient.angle ?? 135) === deg
                                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold'
                                : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                            }`}
                          >
                            {deg}°
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Color Swatches & Invert */}
                  <div className="p-2.5 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
                        ベースカラー
                      </span>
                      <div className="flex items-center gap-1.5">
                        <label className="flex items-center gap-1 cursor-pointer bg-[var(--md-sys-color-surface)] px-2 py-0.5 rounded-full border border-[var(--md-sys-color-outline-variant)]/40 text-xs">
                          <span className="text-[10px] font-bold">1</span>
                          <input
                            type="color"
                            value={effectiveStops[0]?.color || gradient.color1}
                            onChange={(e) => {
                              const newStops = [...effectiveStops];
                              newStops[0] = { ...newStops[0], color: e.target.value };
                              handleStopsChange(newStops);
                            }}
                            className="w-5 h-5 rounded-full border border-black/10 cursor-pointer p-0 bg-transparent"
                          />
                        </label>

                        {!isSingleColor && (
                          <button
                            type="button"
                            onClick={handleSwapColors}
                            className="p-1 rounded-full text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface)] transition cursor-pointer"
                            title="カラー反転"
                          >
                            <M3Icon name="swap_horiz" size={16} />
                          </button>
                        )}

                        {!isSingleColor && (
                          <label className="flex items-center gap-1 cursor-pointer bg-[var(--md-sys-color-surface)] px-2 py-0.5 rounded-full border border-[var(--md-sys-color-outline-variant)]/40 text-xs">
                            <span className="text-[10px] font-bold">2</span>
                            <input
                              type="color"
                              value={effectiveStops[effectiveStops.length - 1]?.color || gradient.color2}
                              onChange={(e) => {
                                const newStops = [...effectiveStops];
                                newStops[newStops.length - 1] = {
                                  ...newStops[newStops.length - 1],
                                  color: e.target.value,
                                };
                                handleStopsChange(newStops);
                              }}
                              className="w-5 h-5 rounded-full border border-black/10 cursor-pointer p-0 bg-transparent"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Quick Swatches */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {[
                        { c1: '#0B57D0', c2: '#D3E3FD', c3: '#A8C7FA' },
                        { c1: '#FF512F', c2: '#DD2476', c3: '#FFA07A' },
                        { c1: '#00B09B', c2: '#96C93D', c3: '#10B981' },
                        { c1: '#8A2387', c2: '#E94057', c3: '#F27121' },
                        { c1: '#7F00FF', c2: '#E100FF', c3: '#00FFFF' },
                        { c1: '#1A2980', c2: '#26D0CE', c3: '#92FE9D' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            pushHistory();
                            const newStops: ColorStop[] = [
                              { id: '1', color: preset.c1, position: 0 },
                              { id: '2', color: preset.c3, position: 50 },
                              { id: '3', color: preset.c2, position: 100 },
                            ];
                            handleStopsChange(newStops);
                          }}
                          className="w-6 h-6 rounded-full border border-black/10 hover:scale-115 transition-transform cursor-pointer shadow-2xs shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})`,
                          }}
                          title="カラーパレット"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Stop positions */}
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="flex justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] mb-0.5">
                        <span>開始位置 (Stop 1)</span>
                        <span>{gradient.slider1}%</span>
                      </div>
                      <M3Slider
                        value={gradient.slider1}
                        onChange={(val) => setGradient((prev) => ({ ...prev, slider1: val }))}
                        ariaLabel="開始位置スライダー"
                      />
                    </div>

                    {!isSingleColor && (
                      <div>
                        <div className="flex justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] mb-0.5">
                          <span>終了位置 (Stop 2)</span>
                          <span>{gradient.slider2}%</span>
                        </div>
                        <M3Slider
                          value={gradient.slider2}
                          onChange={(val) => setGradient((prev) => ({ ...prev, slider2: val }))}
                          ariaLabel="終了位置スライダー"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Multi-Stop Color Bar & Harmonies */}
              {activeTab === 'stops' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between -mt-1">
                    <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                      色の分岐点（ストップ）を追加・編集
                    </p>
                    <button
                      type="button"
                      onClick={handleTriggerColorExtraction}
                      disabled={isExtractingColor}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <M3Icon name="colorize" size={13} />
                      <span>{isExtractingColor ? '抽出中...' : '画像から色抽出'}</span>
                    </button>
                  </div>
                  <GradientStopsBar
                    stops={effectiveStops}
                    onChangeStops={handleStopsChange}
                    disabled={isSingleColor}
                  />

                  {/* Harmony generator buttons */}
                  <div className="p-2.5 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)] block mb-1.5">
                      自動調色・カラーハーモニー
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => generateHarmony('comp')}
                        className="px-2.5 py-1.5 rounded-[10px] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 font-medium transition cursor-pointer"
                      >
                        補色 (Complementary)
                      </button>
                      <button
                        type="button"
                        onClick={() => generateHarmony('anal')}
                        className="px-2.5 py-1.5 rounded-[10px] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 font-medium transition cursor-pointer"
                      >
                        類似色 (Analogous)
                      </button>
                      <button
                        type="button"
                        onClick={() => generateHarmony('triad')}
                        className="px-2.5 py-1.5 rounded-[10px] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 font-medium transition cursor-pointer"
                      >
                        トライアド (Triadic)
                      </button>
                      <button
                        type="button"
                        onClick={() => generateHarmony('pastel')}
                        className="px-2.5 py-1.5 rounded-[10px] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 font-medium transition cursor-pointer"
                      >
                        パステル (Pastel)
                      </button>
                      <button
                        type="button"
                        onClick={() => generateHarmony('cyber')}
                        className="col-span-2 px-2.5 py-1.5 rounded-[10px] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/30 font-medium transition cursor-pointer text-center"
                      >
                        サイバーパンク (Cyberpunk)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Text Layers & Comprehensive Typography Editing */}
              {activeTab === 'text' && (
                <TextPropertiesPanel
                  textLayers={textLayers}
                  selectedTextLayer={selectedTextLayer}
                  onAddText={handleAddText}
                  onSelectText={(id) => {
                    setSelectedTextId(id);
                    setSelectedImageId(null);
                    setSelectedShapeId(null);
                  }}
                  onUpdateText={handleUpdateText}
                  onDeleteText={handleDeleteText}
                  onDuplicateText={handleDuplicateText}
                  onOpenFontPicker={() => setShowFontPicker(true)}
                />
              )}

              {/* TAB 4: Image Layers, Preset Stickers & Badges */}
              {activeTab === 'image' && (
                <ImagePropertiesPanel
                  imageLayers={imageLayers}
                  shapeLayers={shapeLayers}
                  selectedImageId={selectedImageId}
                  selectedShapeId={selectedShapeId}
                  onUploadImage={handleUploadImage}
                  onAddPresetSticker={handleAddPresetSticker}
                  onAddPresetBadge={handleAddPresetBadge}
                  onSelectImage={(id) => {
                    setSelectedImageId(id);
                    setSelectedTextId(null);
                    setSelectedShapeId(null);
                  }}
                  onSelectShape={(id) => {
                    setSelectedShapeId(id);
                    setSelectedTextId(null);
                    setSelectedImageId(null);
                  }}
                  onUpdateImage={handleUpdateImage}
                  onUpdateShape={handleUpdateShape}
                  onDeleteImage={handleDeleteImage}
                  onDeleteShape={handleDeleteShape}
                  onDuplicateImage={handleDuplicateImage}
                  onDuplicateShape={handleDuplicateShape}
                />
              )}

              {/* TAB: Motion & Video Controls */}
              {activeTab === 'motion' && (
                <MotionPanel
                  canvasConfig={canvasConfig}
                  onUpdateCanvasConfig={(updates) => setCanvasConfig((prev) => ({ ...prev, ...updates }))}
                  isPlaying={isPlayingVideo}
                  onTogglePlay={() => setIsPlayingVideo((prev) => !prev)}
                  onExportVideo={handleExportVideo}
                  isExporting={isExportingVideo}
                />
              )}

              {/* TAB 5: Canvas Frame Border, Aspect Ratio & Visual Filters */}
              {activeTab === 'canvas' && (
                <CanvasFramePanel
                  canvasConfig={canvasConfig}
                  filters={gradient.filters || {}}
                  onUpdateCanvasConfig={(updates) => setCanvasConfig((prev) => ({ ...prev, ...updates }))}
                  onUpdateFilter={(key, val) => updateFilter(key, val)}
                />
              )}
            </div>

            {/* Bottom Size Slider: Controls Font Size or Gradient Scale */}
            <div className="shrink-0 pt-2 border-t border-[var(--md-sys-color-outline-variant)]/30">
              <div className="flex justify-between items-center text-xs text-[var(--md-sys-color-on-surface)] mb-1">
                <span className="font-bold">
                  {selectedTextLayer ? '文字サイズ調整' : '全体スケール'}
                </span>
                <span className="font-mono text-[var(--md-sys-color-primary)]">
                  {selectedTextLayer ? `${selectedTextLayer.fontSize}px` : `${gradient.sizeSlider}%`}
                </span>
              </div>
              <M3Slider
                value={gradient.sizeSlider}
                onChange={handleSizeSliderChange}
                ariaLabel="サイズ調整スライダー"
              />
            </div>

            {/* Mobile Quick Preview and Share Buttons in Controls Box */}
            <div className="pt-2 mt-1 border-t border-[var(--md-sys-color-outline-variant)]/20 lg:hidden shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileViewMode('canvas');
                  setTimeout(() => handleZoomFit(true), 100);
                }}
                className="flex-1 py-2 px-3 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <M3Icon name="visibility" size={16} />
                <span>キャンバスへ</span>
              </button>
              <button
                type="button"
                onClick={handleShareOnX}
                className="py-2 px-3.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition"
                title="X（旧Twitter）で共有"
              >
                <span className="font-bold text-[13px] leading-none">𝕏</span>
                <span>Xで共有</span>
              </button>
            </div>
          </div>
        </div>
      );
    })()}

          {/* Right Column: Viewport Control Toolbar + Canvas Box */}
          <div
            className={`${
              mobileViewMode === 'settings' ? 'hidden lg:flex' : 'flex'
            } flex-1 min-w-0 h-full flex flex-col items-center gap-2 w-full min-h-0`}
          >
            {/* Viewport Control Bar */}
            <div className="shrink-0 w-full flex justify-center">
              <CanvasViewportToolbar
                zoomScale={zoomScale}
                onZoomIn={() => setZoomScale((z) => Math.min(2.0, Math.round((z + 0.1) * 10) / 10))}
                onZoomOut={() => setZoomScale((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
                onZoomReset={() => setZoomScale(1)}
                onZoomFit={() => handleZoomFit(false)}
                showGuides={showGuides}
                onToggleGuides={() => setShowGuides((prev) => !prev)}
                isFullscreen={isFullscreenPreview}
                onToggleFullscreen={() => setIsFullscreenPreview((prev) => !prev)}
                canUndo={past.length > 0}
                canRedo={future.length > 0}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onOpenCodeExport={() => setShowCssExportModal(true)}
                onTriggerColorExtract={handleTriggerColorExtraction}
                onOpenHelpGuide={() => setShowBeginnerGuide(true)}
              />
            </div>

            {/* Right Canvas Box: Responsive flexbox container, fits without page scroll */}
            <div
              id="editor-canvas-outer-box"
              className="flex-1 min-h-0 w-full bg-[var(--md-sys-color-surfaceContainerHigh)] rounded-[20px] sm:rounded-[24px] p-2 sm:p-4 shadow-xs border border-[var(--md-sys-color-outline-variant)]/30 flex items-center justify-center relative overflow-hidden transition-all"
            >
              {/* Proportional canvas box: 576×416dp base, scaled */}
              <div
                ref={canvasBoxRef}
                id="editor-canvas-box"
                style={{
                  width: `${boxWidth}px`,
                  height: `${boxHeight}px`,
                  background: getGradientCss(gradient),
                  filter: cssFilters,
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'center center',
                  mixBlendMode:
                    gradient.filters?.blendMode && gradient.filters.blendMode !== 'normal'
                      ? (gradient.filters.blendMode as any)
                      : undefined,
                  ...(isVideo
                    ? getVideoMotionStyle(
                        canvasConfig.videoConfig?.motionStyle || 'aurora',
                        canvasConfig.videoConfig?.speed || 1,
                        isPlayingVideo,
                        canvasConfig.videoConfig?.easing || 'ease-in-out'
                      )
                    : {}),
                }}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                className={`relative rounded-[24px] shadow-lg overflow-hidden shrink-0 cursor-grab active:cursor-grabbing select-none border border-black/10 transition-shadow duration-200 ${
                  gradient.isAnimated ? 'animate-pulse' : ''
                }`}
              >
                {/* Noise Grain SVG Texture Overlay */}
                {gradient.filters?.noise && gradient.filters.noise > 0 && (() => {
                  const noiseType = gradient.filters?.noiseType || 'medium';
                  const baseFreq =
                    noiseType === 'fine'
                      ? '1.2'
                      : noiseType === 'rough'
                      ? '0.45'
                      : noiseType === 'paper'
                      ? '0.65'
                      : '0.85';
                  const octaves = noiseType === 'paper' ? '4' : '3';
                  const opacity =
                    (gradient.filters.noise / 100) * (noiseType === 'rough' ? 0.5 : 0.4);
                  return (
                    <div
                      className="absolute inset-0 pointer-events-none mix-blend-overlay z-0"
                      style={{
                        opacity,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${baseFreq}' numOctaves='${octaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                      }}
                    />
                  );
                })()}

                {/* Frame Border if configured */}
                {canvasConfig.frameBorderWidth && canvasConfig.frameBorderWidth > 0 ? (
                  <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      border: `${canvasConfig.frameBorderWidth}px solid ${canvasConfig.frameBorderColor || '#FFFFFF'}`,
                      borderRadius: `${canvasConfig.frameBorderRadius ?? 24}px`,
                      boxSizing: 'border-box',
                    }}
                  />
                ) : null}

                {/* Interactive Alignment Guides */}
                {showGuides && activeGuideX !== null && (
                  <div
                    style={{ left: `${activeGuideX}px` }}
                    className="absolute top-0 bottom-0 w-[1.5px] bg-cyan-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  >
                    <span className="absolute top-2 -left-4 bg-cyan-500 text-black font-bold text-[9px] px-1 rounded shadow-xs">
                      中央
                    </span>
                  </div>
                )}
                {showGuides && activeGuideY !== null && (
                  <div
                    style={{ top: `${activeGuideY}px` }}
                    className="absolute left-0 right-0 h-[1.5px] bg-cyan-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  >
                    <span className="absolute left-2 -top-3.5 bg-cyan-500 text-black font-bold text-[9px] px-1 rounded shadow-xs">
                      中央
                    </span>
                  </div>
                )}

                {/* Guidance watermark / interactive helper when no layers are added */}
                {textLayers.length === 0 && imageLayers.length === 0 && shapeLayers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center z-1">
                    <div className="pointer-events-auto max-w-sm px-4 py-3 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-xl flex flex-col items-center gap-2 transition-all select-none">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white/95">
                        <M3Icon name="touch_app" size={16} className="text-cyan-300" />
                        <span>背景ドラッグで光の位置を直感調整</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-normal">
                        文字やスタンプを乗せたり、おまかせ調色でアレンジしてみよう！
                      </p>
                      <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
                        <button
                          type="button"
                          onClick={handleAddText}
                          className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/35 text-white text-[11px] font-bold border border-white/30 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <M3Icon name="title" size={13} />
                          <span>文字を追加</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRandomGradient}
                          className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/35 text-white text-[11px] font-bold border border-white/30 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <M3Icon name="casino" size={13} />
                          <span>おまかせ調色</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBeginnerGuide(true)}
                          className="px-2.5 py-1 rounded-full bg-amber-400/30 hover:bg-amber-400/45 text-amber-200 text-[11px] font-bold border border-amber-300/40 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <M3Icon name="lightbulb" size={13} />
                          <span>使い方ガイド</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Layers */}
                {imageLayers.map((layer) => {
                  const isSelected = layer.id === selectedImageId;
                  return (
                    <CanvasTransformBox
                      key={layer.id}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      height={layer.height}
                      rotation={layer.rotation || 0}
                      isSelected={isSelected}
                      boxWidth={boxWidth}
                      boxHeight={boxHeight}
                      zoomScale={zoomScale}
                      type="image"
                      onResize={(newW, newH) => {
                        setImageLayers((prev) =>
                          prev.map((img) => (img.id === layer.id ? { ...img, width: newW, height: newH } : img))
                        );
                      }}
                      onRotate={(newRot) => {
                        setImageLayers((prev) =>
                          prev.map((img) => (img.id === layer.id ? { ...img, rotation: newRot } : img))
                        );
                      }}
                      onAlignHorizontalCenter={handleAlignHorizontalCenter}
                      onAlignVerticalCenter={handleAlignVerticalCenter}
                      onBringForward={handleBringForward}
                      onSendBackward={handleSendBackward}
                      onDuplicate={() => handleDuplicateImage(layer)}
                      onDelete={() => handleDeleteImage(layer.id)}
                      onQuickSizeChange={(delta) => handleQuickSizeChange(delta)}
                    >
                      <div
                        data-canvas-layer="true"
                        onPointerDown={(e) => handleImageLayerPointerDown(e, layer)}
                        style={{
                          width: `${layer.width}px`,
                          height: `${layer.height}px`,
                          opacity: (layer.opacity ?? 100) / 100,
                          borderRadius: `${layer.borderRadius ?? 0}px`,
                          border: layer.borderWidth ? `${layer.borderWidth}px solid ${layer.borderColor || '#FFFFFF'}` : 'none',
                          boxShadow: layer.hasShadow !== false ? '0 6px 18px rgba(0,0,0,0.35)' : 'none',
                        }}
                        className={`cursor-move select-none touch-none overflow-hidden ${
                          isSelected ? '' : 'hover:ring-1 hover:ring-white/50'
                        }`}
                      >
                        <img
                          src={layer.src}
                          alt={layer.name || 'Image layer'}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </div>
                    </CanvasTransformBox>
                  );
                })}

                {/* Shape / Badge Layers */}
                {shapeLayers.map((layer) => {
                  const isSelected = layer.id === selectedShapeId;
                  return (
                    <CanvasTransformBox
                      key={layer.id}
                      x={layer.x}
                      y={layer.y}
                      width={layer.width}
                      height={layer.height}
                      rotation={layer.rotation || 0}
                      isSelected={isSelected}
                      boxWidth={boxWidth}
                      boxHeight={boxHeight}
                      zoomScale={zoomScale}
                      type="shape"
                      onResize={(newW, newH) => {
                        setShapeLayers((prev) =>
                          prev.map((s) => (s.id === layer.id ? { ...s, width: newW, height: newH } : s))
                        );
                      }}
                      onRotate={(newRot) => {
                        setShapeLayers((prev) =>
                          prev.map((s) => (s.id === layer.id ? { ...s, rotation: newRot } : s))
                        );
                      }}
                      onAlignHorizontalCenter={handleAlignHorizontalCenter}
                      onAlignVerticalCenter={handleAlignVerticalCenter}
                      onBringForward={handleBringForward}
                      onSendBackward={handleSendBackward}
                      onDuplicate={() => handleDuplicateShape(layer)}
                      onDelete={() => handleDeleteShape(layer.id)}
                      onQuickSizeChange={(delta) => handleQuickSizeChange(delta)}
                    >
                      <div
                        data-canvas-layer="true"
                        onPointerDown={(e) => handleShapeLayerPointerDown(e, layer)}
                        style={{
                          width: `${layer.width}px`,
                          height: `${layer.height}px`,
                          backgroundColor: layer.fillColor,
                          color: layer.textColor || '#FFFFFF',
                          borderColor: layer.borderColor || 'transparent',
                          borderWidth: `${layer.borderWidth || 0}px`,
                          borderStyle: layer.borderWidth ? 'solid' : 'none',
                          borderRadius: layer.type === 'circle' ? '9999px' : '9999px',
                          boxShadow: layer.hasShadow !== false ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                          opacity: (layer.opacity ?? 100) / 100,
                        }}
                        className={`cursor-move select-none touch-none flex items-center justify-center font-bold text-xs px-3 tracking-wider ${
                          isSelected ? '' : 'hover:ring-1 hover:ring-white/50'
                        }`}
                      >
                        <span className="pointer-events-none truncate">{layer.text || 'BADGE'}</span>
                      </div>
                    </CanvasTransformBox>
                  );
                })}

                {/* Text Layers */}
                {textLayers.map((layer) => {
                  const isSelected = layer.id === selectedTextId;
                  const isEditing = editingTextId === layer.id;
                  const shadowStyle =
                    layer.hasShadow !== false
                      ? '0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)'
                      : 'none';

                  const gradPreset = layer.gradientFill
                    ? TEXT_GRADIENT_PRESETS.find((p) => p.id === layer.gradientFill)
                    : null;
                  const isGradientText = !!gradPreset;

                  const textVal = layer.text || '';
                  const textLen = Math.max(1, textVal.length);
                  const layerFontSize = typeof layer.fontSize === 'number' ? layer.fontSize : 32;
                  const approxW = layer.isVertical
                    ? Math.max(34, Math.round(layerFontSize * 1.3))
                    : Math.max(50, Math.round(layerFontSize * (textLen * 0.72 + 0.5)));
                  const approxH = layer.isVertical
                    ? Math.max(50, Math.round(layerFontSize * (textLen * 0.72 + 0.5)))
                    : Math.max(30, Math.round(layerFontSize * 1.3));

                  return (
                    <CanvasTransformBox
                      key={layer.id}
                      x={layer.x}
                      y={layer.y}
                      width={approxW}
                      height={approxH}
                      rotation={layer.rotation || 0}
                      isSelected={isSelected}
                      boxWidth={boxWidth}
                      boxHeight={boxHeight}
                      zoomScale={zoomScale}
                      type="text"
                      fontSize={layerFontSize}
                      onResize={(_w, _h, newFontSize) => {
                        if (newFontSize) {
                          setTextLayers((prev) =>
                            prev.map((t) => (t.id === layer.id ? { ...t, fontSize: newFontSize } : t))
                          );
                        }
                      }}
                      onRotate={(newRot) => {
                        setTextLayers((prev) =>
                          prev.map((t) => (t.id === layer.id ? { ...t, rotation: newRot } : t))
                        );
                      }}
                      onAlignHorizontalCenter={handleAlignHorizontalCenter}
                      onAlignVerticalCenter={handleAlignVerticalCenter}
                      onBringForward={handleBringForward}
                      onSendBackward={handleSendBackward}
                      onDuplicate={() => handleDuplicateText(layer)}
                      onDelete={() => handleDeleteText(layer.id)}
                      onQuickSizeChange={(delta) => handleQuickSizeChange(delta)}
                      onEditInline={() => setEditingTextId(layer.id)}
                    >
                      <div
                        data-canvas-layer="true"
                        onPointerDown={(e) => {
                          if (isEditing) {
                            e.stopPropagation();
                            return;
                          }
                          handleTextLayerPointerDown(e, layer);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingTextId(layer.id);
                        }}
                        style={{
                          backgroundColor: layer.backgroundColor || 'transparent',
                          padding: layer.backgroundColor ? `${layer.backgroundPadding ?? 8}px` : undefined,
                          borderRadius: layer.backgroundColor ? `${layer.backgroundRadius ?? 8}px` : undefined,
                          writingMode: layer.isVertical ? 'vertical-rl' : 'horizontal-tb',
                          letterSpacing: `${layer.letterSpacing || 0}px`,
                          opacity: (layer.opacity ?? 100) / 100,
                        }}
                        className={`cursor-move select-none transition-shadow touch-none ${
                          isSelected ? '' : 'hover:bg-black/10 rounded-[6px]'
                        }`}
                      >
                        {isEditing ? (
                          <div
                            onPointerDown={(e) => e.stopPropagation()}
                            className="relative flex items-center gap-1.5 z-30"
                          >
                            <input
                              type="text"
                              autoFocus
                              value={layer.text ?? ''}
                              onPointerDown={(e) => e.stopPropagation()}
                              onBlur={() => setEditingTextId(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setEditingTextId(null);
                                  pushHistory();
                                }
                                if (e.key === 'Escape') {
                                  setEditingTextId(null);
                                }
                              }}
                              onChange={(e) => {
                                const newTxt = e.target.value;
                                setTextLayers((layers) =>
                                  layers.map((t) => (t.id === layer.id ? { ...t, text: newTxt } : t))
                                );
                              }}
                              className="px-2.5 py-1 rounded-[8px] bg-black/90 text-white font-bold text-center border-2 border-[var(--md-sys-color-primary)] shadow-2xl outline-none"
                              style={{
                                fontFamily: `"${layer.fontFamily || 'Noto Sans JP'}", sans-serif`,
                                fontSize: `${Math.max(16, layerFontSize)}px`,
                                minWidth: `${Math.max(100, approxW)}px`,
                              }}
                            />
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTextId(null);
                                pushHistory();
                              }}
                              className="p-1 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md hover:scale-110 active:scale-95 transition cursor-pointer"
                              title="文字を確定"
                            >
                              <M3Icon name="check" size={16} />
                            </button>
                          </div>
                        ) : (
                          (() => {
                            const hasStroke = Boolean(layer.strokeWidth && layer.strokeWidth > 0);
                            const strokeW = layer.strokeWidth || 0;
                            const strokeC = layer.strokeColor || '#000000';

                            return (
                              <span
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTextId(layer.id);
                                }}
                                style={{
                                  fontFamily: `"${layer.fontFamily || 'Noto Sans JP'}", sans-serif`,
                                  fontSize: `${layer.fontSize || 32}px`,
                                  fontWeight: layer.fontWeight || '700',
                                  lineHeight: 1.25,
                                }}
                                className="relative inline-block cursor-move select-none"
                              >
                                {/* Outer Stroke Layer (袋文字外枠 - 文字本体を侵食せず外側に綺麗に展開) */}
                                {hasStroke && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute inset-0 select-none pointer-events-none"
                                    style={{
                                      WebkitTextStroke: `${strokeW * 2}px ${strokeC}`,
                                      color: strokeC,
                                      WebkitTextFillColor: strokeC,
                                      paintOrder: 'stroke fill',
                                      lineHeight: 1.25,
                                      textShadow: shadowStyle !== 'none' ? shadowStyle : undefined,
                                    }}
                                  >
                                    <div className="whitespace-nowrap tracking-tight select-none">
                                      {layer.text || 'テキスト'}
                                    </div>
                                  </span>
                                )}

                                {/* Foreground Fill Layer (文字本体 - グラデーション・単色とも純粋なフォント形状を維持) */}
                                <span
                                  className="relative inline-block select-none"
                                  style={{
                                    zIndex: 1,
                                    color: isGradientText ? 'transparent' : (layer.color || '#FFFFFF'),
                                    backgroundImage: isGradientText ? gradPreset!.css : undefined,
                                    WebkitBackgroundClip: isGradientText ? 'text' : undefined,
                                    backgroundClip: isGradientText ? 'text' : undefined,
                                    WebkitTextFillColor: isGradientText ? 'transparent' : undefined,
                                    textShadow: !hasStroke && shadowStyle !== 'none' ? shadowStyle : undefined,
                                    lineHeight: 1.25,
                                  }}
                                >
                                  <div className="whitespace-nowrap tracking-tight select-none">
                                    {layer.text || 'テキスト'}
                                  </div>
                                </span>
                              </span>
                            );
                          })()
                        )}
                      </div>
                    </CanvasTransformBox>
                  );
                })}
              </div>
            </div>

            {/* Motion Video Playback & Quick Bar (Only for Video Mode) */}
            {isVideo ? (
              <div className="w-full max-w-[680px] p-2.5 sm:p-3 rounded-[20px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                    className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
                    title={isPlayingVideo ? '一時停止' : '再生'}
                  >
                    <M3Icon name={isPlayingVideo ? 'pause' : 'play_arrow'} size={20} />
                  </button>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface)]">
                        {isPlayingVideo ? '動画再生中' : '一時停止中'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold">
                        {canvasConfig.videoConfig?.aspectPreset || '9:16'} • {canvasConfig.videoConfig?.duration || 5}秒
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                      {VIDEO_MOTION_PRESETS.find((p) => p.id === canvasConfig.videoConfig?.motionStyle)?.label || 'オーロラウェーブ'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {VIDEO_MOTION_PRESETS.slice(0, 4).map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        pushHistory();
                        setCanvasConfig((prev) => ({
                          ...prev,
                          videoConfig: {
                            ...(prev.videoConfig || { duration: 5, fps: 30, format: 'mp4', speed: 1, aspectPreset: '9:16', motionStyle: 'aurora' }),
                            motionStyle: style.id,
                          },
                        }));
                      }}
                      className={`px-2 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        canvasConfig.videoConfig?.motionStyle === style.id
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                          : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleExportVideo()}
                    disabled={isExportingVideo}
                    className="px-3.5 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-[12px] font-bold hover:brightness-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <M3Icon name="download" size={16} />
                    <span>動画書き出し</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareOnX}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="X（旧Twitter）で共有"
                  >
                    <span className="font-bold text-[13px] leading-none">𝕏</span>
                    <span>Xで共有</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Still Image Quick Status & Dimension Bar (Only for Image Mode) */
              <div className="w-full max-w-[680px] px-3.5 py-2 rounded-[18px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 flex items-center justify-between text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-bold text-[var(--md-sys-color-on-surface)] text-[12px]">
                    静止画モード
                  </span>
                  <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                    {boxWidth * 2} × {boxHeight * 2} px (2x 高解像度)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono uppercase px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300/60">
                    {canvasConfig.fileFormat}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleCreationType('video')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    <M3Icon name="videocam" size={14} />
                    <span>動画モードに切替</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareOnX}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                    title="X（旧Twitter）で共有"
                  >
                    <span className="font-bold text-[13px] leading-none">𝕏</span>
                    <span>Xで共有</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Bottom Quick Actions */}
            <div className="flex lg:hidden items-center justify-center gap-2 w-full max-w-sm mt-1 px-1">
              <button
                type="button"
                onClick={() => setMobileViewMode('settings')}
                className="flex-1 py-2.5 px-3 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-98 transition-transform"
              >
                <M3Icon name="tune" size={16} />
                <span>デザイン調整</span>
              </button>

              <button
                type="button"
                onClick={handleShareOnX}
                className="py-2.5 px-3.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-98 transition-transform shadow-sm shrink-0"
                title="X（旧Twitter）で共有"
              >
                <span className="font-bold text-sm leading-none">𝕏</span>
                <span>Xで共有</span>
              </button>

              {selectedTextLayer && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('text');
                    setMobileViewMode('settings');
                  }}
                  className="py-2.5 px-3 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold flex items-center gap-1 cursor-pointer active:scale-98 transition-transform shrink-0"
                >
                  <M3Icon name="title" size={16} />
                  <span>文字設定</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Share on X Dialog */}
      <ShareOnXDialog
        isOpen={showShareOnXDialog}
        onClose={() => setShowShareOnXDialog(false)}
        designContext={{
          mode: isVideo ? 'video' : 'image',
          width: boxWidth,
          height: boxHeight,
          gradientType: gradient.type,
          colors: (gradient.stops || []).map((s) => s.color),
          angle: gradient.angle,
          textTitle: textLayers[0]?.text,
          motionStyle: canvasConfig.videoConfig?.motionStyle,
        }}
        onDownloadMedia={() => {
          if (isVideo) {
            handleExportVideo();
          } else {
            handleDownload();
          }
        }}
      />
    </div>
  );
};
