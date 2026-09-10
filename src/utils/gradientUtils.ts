import type { CSSProperties } from 'react';
import {
  GradientState,
  GradientType,
  TextLayer,
  ColorStop,
  ImageLayer,
  ShapeStampLayer,
  CanvasConfig,
  VideoMotionStyle,
} from '../types';
import { TEXT_GRADIENT_PRESETS } from './designAssets';

export const VIDEO_MOTION_PRESETS = [
  { id: 'aurora', label: 'オーロラウェーブ', icon: 'auto_awesome', description: '色彩が波のように揺らめく' },
  { id: 'pulse', label: 'グラデーションパルス', icon: 'favorite', description: '中心から脈打つように広がる' },
  { id: 'colorCycle', label: 'カラーサイクル', icon: 'palette', description: '色が滑らかにスペクトル変化' },
  { id: 'neonFlow', label: 'ネオンフロー', icon: 'water', description: '光の流れが左右にシフト' },
  { id: 'drift', label: 'スロードリフト', icon: 'navigation', description: '角度がゆっくり360度回転' },
  { id: 'zoomGlow', label: 'ズーム＆グロー', icon: 'flare', description: '輝きが拡縮して発光' },
] as const;

export function getVideoMotionStyle(
  motionStyle: VideoMotionStyle = 'aurora',
  speed = 1,
  isPlaying = true,
  easing: string = 'ease-in-out'
): CSSProperties {
  if (!isPlaying) return {};
  const baseDuration = 8 / (speed || 1);
  const ease = easing || 'ease-in-out';
  switch (motionStyle) {
    case 'aurora':
      return {
        animation: `gradeco-aurora ${baseDuration}s ${ease} infinite alternate`,
      };
    case 'pulse':
      return {
        animation: `gradeco-pulse ${baseDuration * 0.75}s ${ease} infinite`,
      };
    case 'colorCycle':
      return {
        animation: `gradeco-color-cycle ${baseDuration * 1.2}s ${ease} infinite`,
      };
    case 'neonFlow':
      return {
        backgroundSize: '200% 200%',
        animation: `gradeco-neon-flow ${baseDuration}s ${ease} infinite`,
      };
    case 'drift':
      return {
        animation: `gradeco-drift ${baseDuration * 1.5}s ${ease} infinite`,
      };
    case 'zoomGlow':
      return {
        animation: `gradeco-zoom-glow ${baseDuration * 0.8}s ${ease} infinite alternate`,
      };
    default:
      return {};
  }
}

export function getEffectiveStops(gradient: GradientState): ColorStop[] {
  if (gradient.stops && gradient.stops.length >= 2) {
    return [...gradient.stops].sort((a, b) => a.position - b.position);
  }

  // Fallback from legacy/simple state
  const stop1 = Math.round(gradient.slider1);
  const stop2 = Math.round(gradient.slider2);

  if (gradient.type === 'three-color') {
    const mid = Math.round((stop1 + stop2) / 2);
    return [
      { id: '1', color: gradient.color1, position: stop1 },
      { id: '2', color: gradient.color2, position: mid },
      { id: '3', color: gradient.color3 || '#89F8C7', position: stop2 },
    ];
  }

  return [
    { id: '1', color: gradient.color1, position: stop1 },
    { id: '2', color: gradient.color2, position: stop2 },
  ];
}

export function getGradientCss(gradient: GradientState): string {
  const { type, color1, color2, color3, slider1, slider2, bgOffset, angle } = gradient;
  const stops = getEffectiveStops(gradient);
  const deg = angle !== undefined ? angle : 135;

  const stopsCss = stops.map((s) => `${s.color} ${Math.round(s.position)}%`).join(', ');

  switch (type) {
    case 'single':
      return color1;

    case 'linear-left':
      return `linear-gradient(90deg, ${stopsCss})`;

    case 'linear-right':
      return `linear-gradient(270deg, ${stopsCss})`;

    case 'linear-diagonal':
    case 'linear-custom':
      return `linear-gradient(${deg}deg, ${stopsCss})`;

    case 'linear-top':
      return `linear-gradient(180deg, ${stopsCss})`;

    case 'three-color': {
      const c3 = color3 || '#89F8C7';
      const s1 = Math.round(slider1);
      const s2 = Math.round(slider2);
      const mid = Math.round((s1 + s2) / 2);
      return `linear-gradient(${deg}deg, ${color1} ${s1}%, ${color2} ${mid}%, ${c3} ${s2}%)`;
    }

    case 'radial': {
      const cx = 50 + (bgOffset?.x || 0) * 0.15;
      const cy = 50 + (bgOffset?.y || 0) * 0.15;
      return `radial-gradient(circle at ${cx}% ${cy}%, ${stopsCss})`;
    }

    case 'conic': {
      const cDeg = angle !== undefined ? angle : Math.round((slider1 / 100) * 360);
      const conicStops = stops.map((s) => `${s.color} ${Math.round((s.position / 100) * 360)}deg`).join(', ');
      return `conic-gradient(from ${cDeg}deg at 50% 50%, ${conicStops})`;
    }

    case 'repeating-linear': {
      return `repeating-linear-gradient(${deg}deg, ${stopsCss}, ${stops[0].color} ${Math.round(stops[stops.length - 1].position + 25)}%)`;
    }

    case 'repeating-radial': {
      return `repeating-radial-gradient(circle at 50% 50%, ${stopsCss}, ${stops[0].color} ${Math.round(stops[stops.length - 1].position + 20)}%)`;
    }

    case 'mesh-aurora': {
      const c1 = stops[0]?.color || color1;
      const c2 = stops[1]?.color || color2;
      const c3 = stops[2]?.color || color3 || '#89F8C7';
      const c4 = stops[3]?.color || '#FF6B6B';
      return `radial-gradient(at 0% 0%, ${c1} 0px, transparent 50%),
              radial-gradient(at 100% 0%, ${c2} 0px, transparent 50%),
              radial-gradient(at 100% 100%, ${c3} 0px, transparent 50%),
              radial-gradient(at 0% 100%, ${c4} 0px, transparent 50%),
              ${c1}`;
    }

    default:
      return color1;
  }
}

export function getCssFilterString(filters?: GradientState['filters']): string {
  if (!filters) return 'none';
  const parts: string[] = [];
  if (filters.brightness !== undefined && filters.brightness !== 100) {
    parts.push(`brightness(${filters.brightness}%)`);
  }
  if (filters.contrast !== undefined && filters.contrast !== 100) {
    parts.push(`contrast(${filters.contrast}%)`);
  }
  if (filters.saturation !== undefined && filters.saturation !== 100) {
    parts.push(`saturate(${filters.saturation}%)`);
  }
  if (filters.hueRotate !== undefined && filters.hueRotate !== 0) {
    parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  }
  if (filters.blur !== undefined && filters.blur > 0) {
    parts.push(`blur(${filters.blur}px)`);
  }
  return parts.length > 0 ? parts.join(' ') : 'none';
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSvgString(
  width: number,
  height: number,
  sourceWidth: number,
  sourceHeight: number,
  gradient: GradientState,
  textLayers: TextLayer[],
  imageLayers: ImageLayer[] = [],
  shapeLayers: ShapeStampLayer[] = [],
  canvasConfig?: CanvasConfig
): string {
  const { type, color1, color2, color3, bgOffset, angle, filters } = gradient;
  const stops = getEffectiveStops(gradient);
  const deg = angle !== undefined ? angle : 135;

  const scaleX = width / Math.max(1, sourceWidth);
  const scaleY = height / Math.max(1, sourceHeight);

  let defs = '';
  let fillAttr = '';

  const stopsSvg = stops
    .map((s) => `<stop offset="${Math.round(s.position)}%" stop-color="${s.color}" />`)
    .join('\n        ');

  if (type === 'single') {
    fillAttr = color1;
  } else if (type === 'linear-left') {
    defs += `
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        ${stopsSvg}
      </linearGradient>
    `;
    fillAttr = 'url(#grad)';
  } else if (type === 'linear-right') {
    defs += `
      <linearGradient id="grad" x1="100%" y1="0%" x2="0%" y2="0%">
        ${stopsSvg}
      </linearGradient>
    `;
    fillAttr = 'url(#grad)';
  } else if (type === 'linear-top') {
    defs += `
      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
        ${stopsSvg}
      </linearGradient>
    `;
    fillAttr = 'url(#grad)';
  } else if (type === 'linear-diagonal' || type === 'linear-custom' || type === 'repeating-linear') {
    const rad = deg * (Math.PI / 180);
    const x1 = Math.round(50 - Math.cos(rad) * 50);
    const y1 = Math.round(50 - Math.sin(rad) * 50);
    const x2 = Math.round(50 + Math.cos(rad) * 50);
    const y2 = Math.round(50 + Math.sin(rad) * 50);
    defs += `
      <linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        ${stopsSvg}
      </linearGradient>
    `;
    fillAttr = 'url(#grad)';
  } else if (type === 'radial' || type === 'repeating-radial') {
    const cxPct = Math.round(50 + (bgOffset?.x || 0) * 0.15);
    const cyPct = Math.round(50 + (bgOffset?.y || 0) * 0.15);
    defs += `
      <radialGradient id="grad" cx="${cxPct}%" cy="${cyPct}%" r="70%" fx="${cxPct}%" fy="${cyPct}%">
        ${stopsSvg}
      </radialGradient>
    `;
    fillAttr = 'url(#grad)';
  } else {
    // Fallback linear
    defs += `
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        ${stopsSvg}
      </linearGradient>
    `;
    fillAttr = 'url(#grad)';
  }

  // Shadow filter
  defs += `
    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  `;

  // Grain/Noise texture in SVG if enabled
  let noiseOverlay = '';
  if (filters?.noise && filters.noise > 0) {
    const opacity = (filters.noise / 100) * 0.35;
    defs += `
      <filter id="noise-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    `;
    noiseOverlay = `<rect width="100%" height="100%" rx="28" filter="url(#noise-filter)" opacity="${opacity.toFixed(2)}" style="mix-blend-mode: overlay;" />`;
  }

  // Images in SVG
  const imageElements = imageLayers
    .map((img) => {
      const x = Math.round(img.x * scaleX);
      const y = Math.round(img.y * scaleY);
      const w = Math.round(img.width * scaleX);
      const h = Math.round(img.height * scaleY);
      const rot = img.rotation || 0;
      const op = (img.opacity ?? 100) / 100;
      return `<g transform="translate(${x}, ${y}) rotate(${rot})" opacity="${op}">
        <image href="${img.src}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" />
      </g>`;
    })
    .join('\n  ');

  // Shapes & Badges in SVG
  const shapeElements = shapeLayers
    .map((s) => {
      const x = Math.round(s.x * scaleX);
      const y = Math.round(s.y * scaleY);
      const w = Math.round(s.width * scaleX);
      const h = Math.round(s.height * scaleY);
      const rot = s.rotation || 0;
      const op = (s.opacity ?? 100) / 100;
      const bColor = s.borderColor || 'none';
      const bWidth = s.borderWidth ? s.borderWidth * scaleX : 0;
      const textElem = s.text
        ? `<text x="0" y="0" fill="${s.textColor || '#fff'}" font-family="sans-serif" font-weight="900" font-size="${Math.round(18 * scaleX)}px" text-anchor="middle" dominant-baseline="central">${escapeXml(s.text)}</text>`
        : '';

      return `<g transform="translate(${x}, ${y}) rotate(${rot})" opacity="${op}">
        <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.round(12 * scaleX)}" fill="${s.fillColor}" stroke="${bColor}" stroke-width="${bWidth}" />
        ${textElem}
      </g>`;
    })
    .join('\n  ');

  const textElements = textLayers
    .map((t) => {
      const x = Math.round(t.x * scaleX);
      const y = Math.round(t.y * scaleY);
      const fontSize = Math.max(10, Math.round(t.fontSize * scaleX));
      const weight = t.fontWeight || '700';
      const shadowAttr = t.hasShadow !== false ? ' filter="url(#drop-shadow)"' : '';
      const rot = t.rotation ? ` rotate(${t.rotation})` : '';
      const strokeAttr =
        t.strokeColor && t.strokeWidth && t.strokeWidth > 0
          ? ` stroke="${t.strokeColor}" stroke-width="${Math.round(t.strokeWidth * 2 * scaleX)}" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill"`
          : '';

      return `<g transform="translate(${x}, ${y})${rot}">
        <text x="0" y="0" fill="${t.color}" font-family="'${t.fontFamily}', sans-serif" font-size="${fontSize}px" font-weight="${weight}" text-anchor="middle" dominant-baseline="central"${shadowAttr}${strokeAttr}>${escapeXml(t.text)}</text>
      </g>`;
    })
    .join('\n  ');

  // Canvas Frame Border if enabled
  let frameBorder = '';
  if (canvasConfig?.frameBorderWidth && canvasConfig.frameBorderWidth > 0) {
    const bw = Math.round(canvasConfig.frameBorderWidth * scaleX);
    const bColor = canvasConfig.frameBorderColor || '#FFFFFF';
    const bRadius = canvasConfig.frameBorderRadius ? Math.round(canvasConfig.frameBorderRadius * scaleX) : 24;
    frameBorder = `<rect x="${bw / 2}" y="${bw / 2}" width="${width - bw}" height="${height - bw}" rx="${bRadius}" fill="none" stroke="${bColor}" stroke-width="${bw}" />`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${defs}
  </defs>
  <rect width="100%" height="100%" rx="28" fill="${fillAttr}" />
  ${noiseOverlay}
  ${imageElements}
  ${shapeElements}
  ${textElements}
  ${frameBorder}
</svg>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawVerticalText(
  ctx: CanvasRenderingContext2D,
  text: string,
  startX: number,
  startY: number,
  fontSize: number,
  isStroke: boolean
) {
  const chars = Array.from(text);
  const totalHeight = chars.length * fontSize * 1.1;
  let currentY = startY - totalHeight / 2 + fontSize / 2;

  for (const char of chars) {
    if (isStroke) {
      ctx.strokeText(char, startX, currentY);
    } else {
      ctx.fillText(char, startX, currentY);
    }
    currentY += fontSize * 1.1;
  }
}

export async function exportCanvasImage(
  width: number,
  height: number,
  sourceWidth: number,
  sourceHeight: number,
  gradient: GradientState,
  textLayers: TextLayer[],
  format: 'png' | 'jpg' | 'svg',
  filename = 'gradeco-design',
  imageLayers: ImageLayer[] = [],
  shapeLayers: ShapeStampLayer[] = [],
  canvasConfig?: CanvasConfig
): Promise<void> {
  if (format === 'svg') {
    const svgStr = generateSvgString(
      width,
      height,
      sourceWidth,
      sourceHeight,
      gradient,
      textLayers,
      imageLayers,
      shapeLayers,
      canvasConfig
    );
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${filename}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return;
  }

  // Determine target dimensions (Honors custom resolution if specified)
  const targetW = canvasConfig?.customWidth && canvasConfig.customWidth > 0 ? canvasConfig.customWidth : width;
  const targetH = canvasConfig?.customHeight && canvasConfig.customHeight > 0 ? canvasConfig.customHeight : height;
  width = targetW;
  height = targetH;

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scaleX = width / Math.max(1, sourceWidth);
  const scaleY = height / Math.max(1, sourceHeight);

  const { type, color1, color2, color3, bgOffset, angle, filters } = gradient;
  const stops = getEffectiveStops(gradient);
  const deg = angle !== undefined ? angle : 135;

  // Apply CSS filters if needed
  if (filters) {
    const filterParts: string[] = [];
    if (filters.brightness !== undefined && filters.brightness !== 100) filterParts.push(`brightness(${filters.brightness}%)`);
    if (filters.contrast !== undefined && filters.contrast !== 100) filterParts.push(`contrast(${filters.contrast}%)`);
    if (filters.saturation !== undefined && filters.saturation !== 100) filterParts.push(`saturate(${filters.saturation}%)`);
    if (filters.hueRotate !== undefined && filters.hueRotate !== 0) filterParts.push(`hue-rotate(${filters.hueRotate}deg)`);
    if (filters.blur !== undefined && filters.blur > 0) filterParts.push(`blur(${filters.blur * scaleX}px)`);
    if (filterParts.length > 0) {
      ctx.filter = filterParts.join(' ');
    }
  }

  // Draw background
  if (type === 'single') {
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'linear-left') {
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'linear-right') {
    const grad = ctx.createLinearGradient(width, 0, 0, 0);
    stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'linear-top') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'radial') {
    const cx = width / 2 + (bgOffset?.x || 0) * 0.15 * (width / 100);
    const cy = height / 2 + (bgOffset?.y || 0) * 0.15 * (height / 100);
    const radius = Math.max(width, height) * 0.7;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'conic') {
    try {
      const cDeg = angle !== undefined ? angle : 0;
      const rad = (cDeg * Math.PI) / 180;
      const grad = ctx.createConicGradient(rad, width / 2, height / 2);
      stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.position / 100)), s.color));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } catch {
      ctx.fillStyle = color1;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (type === 'mesh-aurora') {
    ctx.fillStyle = stops[0]?.color || color1;
    ctx.fillRect(0, 0, width, height);

    const rad1 = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.8);
    rad1.addColorStop(0, stops[1]?.color || color2);
    rad1.addColorStop(1, 'transparent');
    ctx.fillStyle = rad1;
    ctx.fillRect(0, 0, width, height);

    const rad2 = ctx.createRadialGradient(width, height, 0, width, height, width * 0.8);
    rad2.addColorStop(0, stops[2]?.color || color3 || '#89F8C7');
    rad2.addColorStop(1, 'transparent');
    ctx.fillStyle = rad2;
    ctx.fillRect(0, 0, width, height);
  } else {
    const rad = deg * (Math.PI / 180);
    const halfDiag = Math.sqrt(width * width + height * height) / 2;
    const x1 = width / 2 - Math.cos(rad) * halfDiag;
    const y1 = height / 2 - Math.sin(rad) * halfDiag;
    const x2 = width / 2 + Math.cos(rad) * halfDiag;
    const y2 = height / 2 + Math.sin(rad) * halfDiag;
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Reset filter for layers
  ctx.filter = 'none';

  // Add noise if enabled
  if (filters?.noise && filters.noise > 0) {
    applyNoiseToCanvas(ctx, width, height, (filters.noise / 100) * 0.45, filters.noiseType);
  }

  // 1. Draw Image Layers
  for (const imgLayer of imageLayers) {
    try {
      const img = await loadImage(imgLayer.src);
      const posX = imgLayer.x * scaleX;
      const posY = imgLayer.y * scaleY;
      const w = imgLayer.width * scaleX;
      const h = imgLayer.height * scaleY;
      const rotRad = ((imgLayer.rotation || 0) * Math.PI) / 180;
      const opacity = (imgLayer.opacity ?? 100) / 100;
      const radius = (imgLayer.borderRadius || 0) * scaleX;

      ctx.save();
      ctx.translate(posX, posY);
      if (rotRad !== 0) ctx.rotate(rotRad);
      ctx.globalAlpha = opacity;

      if (imgLayer.hasShadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10 * scaleX;
        ctx.shadowOffsetY = 4 * scaleX;
      }

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-w / 2, -h / 2, w, h, radius);
      } else {
        ctx.rect(-w / 2, -h / 2, w, h);
      }
      ctx.clip();
      ctx.drawImage(img, -w / 2, -h / 2, w, h);

      if (imgLayer.borderWidth && imgLayer.borderWidth > 0 && imgLayer.borderColor) {
        ctx.strokeStyle = imgLayer.borderColor;
        ctx.lineWidth = imgLayer.borderWidth * scaleX;
        ctx.stroke();
      }

      ctx.restore();
    } catch (err) {
      console.warn('Failed to load image for export', err);
    }
  }

  // 2. Draw Shape & Badge Layers
  for (const s of shapeLayers) {
    const posX = s.x * scaleX;
    const posY = s.y * scaleY;
    const w = s.width * scaleX;
    const h = s.height * scaleY;
    const rotRad = ((s.rotation || 0) * Math.PI) / 180;

    ctx.save();
    ctx.translate(posX, posY);
    if (rotRad !== 0) ctx.rotate(rotRad);
    ctx.globalAlpha = (s.opacity ?? 100) / 100;

    if (s.hasShadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8 * scaleX;
      ctx.shadowOffsetY = 3 * scaleX;
    }

    ctx.fillStyle = s.fillColor;
    ctx.beginPath();
    if (s.type === 'circle') {
      ctx.arc(0, 0, Math.min(w, h) / 2, 0, Math.PI * 2);
    } else if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-w / 2, -h / 2, w, h, Math.round(12 * scaleX));
    } else {
      ctx.rect(-w / 2, -h / 2, w, h);
    }
    ctx.fill();

    if (s.borderWidth && s.borderColor) {
      ctx.strokeStyle = s.borderColor;
      ctx.lineWidth = s.borderWidth * scaleX;
      ctx.stroke();
    }

    if (s.text) {
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = s.textColor || '#FFFFFF';
      ctx.font = `900 ${Math.round(16 * scaleX)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.text, 0, 0);
    }

    ctx.restore();
  }

  // 3. Draw Enhanced Text Layers (Supports up to 260px+, strokes, gradient fill, badges, vertical writing)
  for (const t of textLayers) {
    const posX = t.x * scaleX;
    const posY = t.y * scaleY;
    const fontSize = Math.max(10, Math.round(t.fontSize * scaleX));
    const weight = t.fontWeight || '700';
    const rotRad = ((t.rotation || 0) * Math.PI) / 180;
    const opacity = (t.opacity ?? 100) / 100;

    ctx.save();
    ctx.translate(posX, posY);
    if (rotRad !== 0) ctx.rotate(rotRad);
    ctx.globalAlpha = opacity;

    ctx.font = `${weight} ${fontSize}px "${t.fontFamily}", sans-serif`;
    ctx.textAlign = (t.textAlign as CanvasTextAlign) || 'center';
    ctx.textBaseline = 'middle';

    // Background Badge / 座布団
    if (t.backgroundColor) {
      const textMetrics = ctx.measureText(t.text);
      const pad = (t.backgroundPadding ?? 8) * scaleX;
      const bRad = (t.backgroundRadius ?? 8) * scaleX;
      const bw = textMetrics.width + pad * 2;
      const bh = fontSize * 1.3 + pad * 2;

      ctx.save();
      ctx.fillStyle = t.backgroundColor;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bRad);
      } else {
        ctx.rect(-bw / 2, -bh / 2, bw, bh);
      }
      ctx.fill();
      ctx.restore();
    }

    // Shadow
    if (t.hasShadow !== false) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = Math.round(8 * scaleX);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.round(3 * scaleX);
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // Text Fill Color or Gradient Fill
    let fill: string | CanvasGradient = t.color;
    if (t.gradientFill) {
      const preset = TEXT_GRADIENT_PRESETS.find((p) => p.id === t.gradientFill);
      const grad = ctx.createLinearGradient(-fontSize * 2, -fontSize, fontSize * 2, fontSize);
      if (preset) {
        preset.colors.forEach((col, idx) =>
          grad.addColorStop(idx / (preset.colors.length - 1), col)
        );
      } else {
        grad.addColorStop(0, '#FFE066');
        grad.addColorStop(1, '#F59E0B');
      }
      fill = grad;
    }

    // Stroke / 縁取り (袋文字)
    if (t.strokeColor && t.strokeWidth && t.strokeWidth > 0) {
      ctx.save();
      ctx.strokeStyle = t.strokeColor;
      ctx.lineWidth = t.strokeWidth * 2 * scaleX;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      if (t.isVertical) {
        drawVerticalText(ctx, t.text, 0, 0, fontSize, true);
      } else {
        ctx.strokeText(t.text, 0, 0);
      }
      ctx.restore();
    }

    // Inner Fill
    ctx.fillStyle = fill;
    if (t.isVertical) {
      drawVerticalText(ctx, t.text, 0, 0, fontSize, false);
    } else {
      ctx.fillText(t.text, 0, 0);
    }

    ctx.restore();
  }

  // 4. Draw Canvas Frame Border if configured
  if (canvasConfig?.frameBorderWidth && canvasConfig.frameBorderWidth > 0) {
    const bw = Math.round(canvasConfig.frameBorderWidth * scaleX);
    const bColor = canvasConfig.frameBorderColor || '#FFFFFF';
    const bRadius = canvasConfig.frameBorderRadius ? Math.round(canvasConfig.frameBorderRadius * scaleX) : 24;

    ctx.save();
    ctx.strokeStyle = bColor;
    ctx.lineWidth = bw;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bw / 2, bw / 2, width - bw, height - bw, bRadius);
    } else {
      ctx.rect(bw / 2, bw / 2, width - bw, height - bw);
    }
    ctx.stroke();
    ctx.restore();
  }

  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const dataUrl = canvas.toDataURL(mimeType, 0.95);
  triggerDownload(dataUrl, `${filename}.${format}`);
}

function applyNoiseToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity: number,
  noiseType: 'fine' | 'medium' | 'rough' | 'paper' = 'medium'
) {
  const size = noiseType === 'fine' ? 64 : noiseType === 'rough' ? 256 : 128;
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = size;
  noiseCanvas.height = size;
  const nCtx = noiseCanvas.getContext('2d');
  if (!nCtx) return;

  const imgData = nCtx.createImageData(size, size);
  const buffer = new Uint32Array(imgData.data.buffer);
  for (let i = 0; i < buffer.length; i++) {
    let val = (Math.random() * 255) | 0;
    if (noiseType === 'rough') {
      val = val > 128 ? Math.min(255, val + 50) : Math.max(0, val - 50);
    } else if (noiseType === 'paper') {
      val = (((Math.random() + Math.random()) * 0.5) * 255) | 0;
    }
    buffer[i] = (255 << 24) | (val << 16) | (val << 8) | val;
  }
  nCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(noiseCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
