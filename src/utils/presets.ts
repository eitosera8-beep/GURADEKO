import { GradientState, GradientType } from '../types';

export interface GradientPreset {
  id: string;
  name: string;
  category: 'vivid' | 'pastel' | 'dark' | 'nature';
  type: GradientType;
  color1: string;
  color2: string;
  color3?: string;
  slider1: number;
  slider2: number;
  angle?: number;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'preset-sunset',
    name: 'トワイライト・サンセット',
    category: 'vivid',
    type: 'linear-diagonal',
    color1: '#FF512F',
    color2: '#DD2476',
    slider1: 15,
    slider2: 90,
    angle: 135,
  },
  {
    id: 'preset-ocean',
    name: 'ディープ・オーシャン',
    category: 'nature',
    type: 'linear-left',
    color1: '#0052D4',
    color2: '#4364F7',
    color3: '#6FB1FC',
    slider1: 10,
    slider2: 95,
  },
  {
    id: 'preset-aurora',
    name: 'エメラルド・オーロラ',
    category: 'nature',
    type: 'three-color',
    color1: '#00B09B',
    color2: '#96C93D',
    color3: '#10B981',
    slider1: 10,
    slider2: 90,
    angle: 120,
  },
  {
    id: 'preset-cyberpunk',
    name: 'ネオン・サイバーパンク',
    category: 'vivid',
    type: 'linear-diagonal',
    color1: '#F107A3',
    color2: '#7B2CBF',
    slider1: 20,
    slider2: 85,
    angle: 145,
  },
  {
    id: 'preset-pastel-dream',
    name: 'パステル・ドリーム',
    category: 'pastel',
    type: 'three-color',
    color1: '#A8EDEA',
    color2: '#FED6E3',
    color3: '#D4CBE5',
    slider1: 15,
    slider2: 85,
  },
  {
    id: 'preset-cosmic',
    name: 'コズミック・パープル',
    category: 'dark',
    type: 'radial',
    color1: '#8A2387',
    color2: '#190A2E',
    slider1: 25,
    slider2: 85,
  },
  {
    id: 'preset-citrus',
    name: 'サンシャイン・シトラス',
    category: 'vivid',
    type: 'linear-diagonal',
    color1: '#F9D423',
    color2: '#FF4E50',
    slider1: 20,
    slider2: 80,
    angle: 45,
  },
  {
    id: 'preset-mint',
    name: 'フレッシュ・ミント',
    category: 'nature',
    type: 'linear-top',
    color1: '#A1FFCE',
    color2: '#FAFFD1',
    slider1: 10,
    slider2: 90,
  },
  {
    id: 'preset-midnight',
    name: 'ミッドナイト・ベルベット',
    category: 'dark',
    type: 'linear-diagonal',
    color1: '#0F2027',
    color2: '#203A43',
    color3: '#2C5364',
    slider1: 10,
    slider2: 95,
    angle: 160,
  },
  {
    id: 'preset-sakura',
    name: 'サクラ・ブロッサム',
    category: 'pastel',
    type: 'linear-left',
    color1: '#FFAFBD',
    color2: '#C9FFBF',
    slider1: 20,
    slider2: 80,
  },
  {
    id: 'preset-m3-expressive',
    name: 'Material 3 ブルー',
    category: 'vivid',
    type: 'linear-diagonal',
    color1: '#0B57D0',
    color2: '#A8C7FA',
    color3: '#D3E3FD',
    slider1: 20,
    slider2: 90,
    angle: 135,
  },
  {
    id: 'preset-monochrome',
    name: 'ミニマル・スレート',
    category: 'dark',
    type: 'linear-left',
    color1: '#1E293B',
    color2: '#475569',
    slider1: 15,
    slider2: 85,
  },
];

// Generate harmonious random gradient
export function generateRandomGradient(): Partial<GradientState> {
  const hues = [
    [210, 260], // Blue-Purple
    [330, 20],  // Pink-Orange
    [160, 200], // Teal-Blue
    [40, 360],  // Gold-Red
    [280, 340], // Purple-Magenta
    [130, 180], // Green-Cyan
  ];
  const pair = hues[Math.floor(Math.random() * hues.length)];
  const c1 = `hsl(${pair[0]}, 85%, 55%)`;
  const c2 = `hsl(${pair[1]}, 80%, 45%)`;
  const types: GradientType[] = ['linear-diagonal', 'linear-left', 'radial', 'conic', 'three-color'];
  const type = types[Math.floor(Math.random() * types.length)];

  return {
    type,
    color1: hslToHex(pair[0], 85, 55),
    color2: hslToHex(pair[1], 80, 45),
    color3: hslToHex((pair[0] + 40) % 360, 75, 60),
    slider1: Math.floor(Math.random() * 25) + 15,
    slider2: Math.floor(Math.random() * 25) + 70,
    angle: Math.floor(Math.random() * 8) * 45,
  };
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
