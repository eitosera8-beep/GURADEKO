export type ScreenMode = 'home' | 'create' | 'editor';

export type NavigationTab = 'home' | 'search' | 'favorite' | 'settings';

export type ExportFormat = 'png' | 'jpg' | 'svg';

export type GradientType =
  | 'single'
  | 'linear-left'
  | 'linear-right'
  | 'linear-diagonal'
  | 'linear-top'
  | 'linear-custom'
  | 'radial'
  | 'conic'
  | 'three-color'
  | 'repeating-linear'
  | 'repeating-radial'
  | 'mesh-aurora';

export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0 - 100 (%)
}

export interface GradientFilterConfig {
  brightness: number;  // 50 - 150 (%) default 100
  contrast: number;    // 50 - 150 (%) default 100
  saturation: number;  // 0 - 200 (%) default 100
  hueRotate: number;   // 0 - 360 (deg) default 0
  noise: number;       // 0 - 100 (%) default 0 (grain texture)
  blur: number;        // 0 - 20 (px) default 0
}

export interface TextLayer {
  id: string;
  text: string;
  fontFamily: string; // 'Roboto' | 'Noto Sans JP' | ...
  fontLabel: string;  // display name
  fontSize: number;   // In px (10 - 260)
  color: string;
  fontWeight?: '400' | '700' | '900';
  hasShadow?: boolean;
  x: number;          // Position inside the canvas box
  y: number;

  // Enhanced typography features:
  strokeColor?: string;     // 袋文字・縁取り色
  strokeWidth?: number;     // 縁取りの太さ (0 - 20px)
  gradientFill?: string;    // グラデーション文字 ('gold' | 'silver' | 'sunset' | 'rainbow' | 'cyber' | css)
  backgroundColor?: string; // 文字座布団・背景帯色
  backgroundPadding?: number; // 背景座布団パディング (0 - 30px)
  backgroundRadius?: number;  // 背景座布団角丸 (0 - 30px)
  letterSpacing?: number;   // 文字間隔 (-5 - 30px)
  lineHeight?: number;      // 行間 (0.8 - 2.5)
  isVertical?: boolean;     // 縦書き (writing-mode: vertical-rl)
  rotation?: number;        // 回転 (-180 - 180 deg)
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;         // 不透明度 (0 - 100 %)
  zIndex?: number;
}

export interface ImageLayer {
  id: string;
  src: string;          // base64 data URL or preset URL
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;    // -180 - 180 deg
  opacity?: number;     // 0 - 100 (%)
  borderRadius?: number;// 0 - 100 px
  borderWidth?: number; // 0 - 20 px
  borderColor?: string;
  hasShadow?: boolean;
  aspectRatio?: number;
  zIndex?: number;
}

export interface ShapeStampLayer {
  id: string;
  type: 'badge' | 'star' | 'heart' | 'ribbon' | 'tag' | 'rect' | 'circle';
  text?: string;        // 'NEW!', 'SALE', '注目', etc.
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  rotation?: number;
  opacity?: number;
  hasShadow?: boolean;
  zIndex?: number;
}

export interface CanvasConfig {
  verticalSize: number;   // 0 - 100 (%) default 40
  horizontalSize: number; // 0 - 100 (%) default 40
  fileFormat: ExportFormat;
  isGenki: boolean;       // '元気ですか？'

  // Canvas Frame & Aspect Ratio
  aspectRatio?: '16:9' | '1:1' | '9:16' | '4:3' | 'custom';
  frameBorderWidth?: number; // 枠線の太さ (0 - 24px)
  frameBorderColor?: string; // 枠線の色
  frameBorderRadius?: number;// 枠線の角丸
}

export interface GradientState {
  type: GradientType;
  color1: string;
  color2: string;
  color3?: string;
  useColor3?: boolean;
  slider1: number;       // 0 - 100 (%) default 40
  slider2: number;       // 0 - 100 (%) default 40
  sizeSlider: number;    // 0 - 100 (%) default 40
  angle?: number;        // 0 - 360 deg
  bgOffset: { x: number; y: number };
  stops?: ColorStop[];
  filters?: GradientFilterConfig;
  isAnimated?: boolean;
}

export interface EditorSnapshot {
  gradient: GradientState;
  textLayers: TextLayer[];
  imageLayers?: ImageLayer[];
  shapeLayers?: ShapeStampLayer[];
  canvasConfig: CanvasConfig;
}

export interface SavedProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  snapshot: EditorSnapshot;
}


