export interface TextGradientPreset {
  id: string;
  name: string;
  css: string;
  colors: string[];
}

export const TEXT_GRADIENT_PRESETS: TextGradientPreset[] = [
  {
    id: 'gold',
    name: '高級ゴールド (Gold)',
    css: 'linear-gradient(135deg, #FFE066 0%, #F59E0B 40%, #FEF08A 70%, #D97706 100%)',
    colors: ['#FFE066', '#F59E0B', '#FEF08A', '#D97706'],
  },
  {
    id: 'silver',
    name: 'プラチナシルバー (Silver)',
    css: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 50%, #F8FAFC 80%, #64748B 100%)',
    colors: ['#F1F5F9', '#94A3B8', '#F8FAFC', '#64748B'],
  },
  {
    id: 'sunset',
    name: 'サンセット (Sunset)',
    css: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFA07A 100%)',
    colors: ['#FF6B6B', '#FF8E53', '#FFA07A'],
  },
  {
    id: 'rainbow',
    name: 'レインボー (Rainbow)',
    css: 'linear-gradient(135deg, #FF0080 0%, #7928CA 35%, #0070F3 70%, #00DFD8 100%)',
    colors: ['#FF0080', '#7928CA', '#0070F3', '#00DFD8'],
  },
  {
    id: 'neon',
    name: 'ネオンシアン (Neon)',
    css: 'linear-gradient(135deg, #00F5D4 0%, #00BBF9 50%, #7000FF 100%)',
    colors: ['#00F5D4', '#00BBF9', '#7000FF'],
  },
  {
    id: 'cherry',
    name: '桜グラデ (Sakura)',
    css: 'linear-gradient(135deg, #FFAAA6 0%, #FF8B94 50%, #FFD3B6 100%)',
    colors: ['#FFAAA6', '#FF8B94', '#FFD3B6'],
  },
];

export interface PresetBadge {
  id: string;
  label: string;
  type: 'badge' | 'star' | 'ribbon' | 'tag' | 'circle';
  fillColor: string;
  textColor: string;
  borderColor?: string;
}

export const PRESET_BADGES: PresetBadge[] = [
  { id: 'b1', label: 'NEW!', type: 'badge', fillColor: '#EF4444', textColor: '#FFFFFF' },
  { id: 'b2', label: 'SALE', type: 'badge', fillColor: '#DC2626', textColor: '#FFFFFF', borderColor: '#FEF08A' },
  { id: 'b3', label: '注目', type: 'tag', fillColor: '#F59E0B', textColor: '#FFFFFF' },
  { id: 'b4', label: 'おすすめ', type: 'ribbon', fillColor: '#059669', textColor: '#FFFFFF' },
  { id: 'b5', label: '限定', type: 'circle', fillColor: '#7C3AED', textColor: '#FFFFFF' },
  { id: 'b6', label: '50% OFF', type: 'badge', fillColor: '#E11D48', textColor: '#FEF08A', borderColor: '#FFFFFF' },
  { id: 'b7', label: '人気No.1', type: 'ribbon', fillColor: '#D97706', textColor: '#FFFFFF' },
  { id: 'b8', label: '★PICK UP', type: 'tag', fillColor: '#2563EB', textColor: '#FFFFFF' },
  { id: 'b9', label: '大好評', type: 'circle', fillColor: '#EA580C', textColor: '#FFFFFF' },
  { id: 'b10', label: 'OFFICIAL', type: 'badge', fillColor: '#0F172A', textColor: '#38BDF8', borderColor: '#38BDF8' },
];

export interface PresetImageSticker {
  id: string;
  name: string;
  category: 'sparkle' | 'frame' | 'motif' | 'stamp';
  svgDataUri: string;
}

// Crisp Vector Decorative SVG Stickers (sparkles, crowns, ribbons, Japanese stamps, leaves)
export const PRESET_STICKERS: PresetImageSticker[] = [
  {
    id: 'st-sparkle-1',
    name: 'キラキラ星 (Gold)',
    category: 'sparkle',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" fill="%23F59E0B" stroke="%23FFF" stroke-width="3"/></svg>`,
  },
  {
    id: 'st-sparkle-2',
    name: '四光スター (White)',
    category: 'sparkle',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,0 60,40 100,50 60,60 50,100 40,60 0,50 40,40" fill="%23FFFFFF"/><circle cx="50" cy="50" r="12" fill="%23FEF08A"/></svg>`,
  },
  {
    id: 'st-crown',
    name: '王冠 (Crown)',
    category: 'motif',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M10,65 L90,65 L85,25 L65,45 L50,15 L35,45 L15,25 Z" fill="%23F59E0B" stroke="%23B45309" stroke-width="4"/><circle cx="15" cy="22" r="5" fill="%23EF4444"/><circle cx="50" cy="12" r="6" fill="%23EF4444"/><circle cx="85" cy="22" r="5" fill="%23EF4444"/><rect x="15" y="65" width="70" height="8" rx="4" fill="%23D97706"/></svg>`,
  },
  {
    id: 'st-heart',
    name: 'ハート (Heart)',
    category: 'motif',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 90"><path d="M50,80 C20,60 5,40 5,25 C5,10 20,5 35,5 C43,5 50,15 50,15 C50,15 57,5 65,5 C80,5 95,10 95,25 C95,40 80,60 50,80 Z" fill="%23EF4444" stroke="%23FFFFFF" stroke-width="3"/></svg>`,
  },
  {
    id: 'st-ribbon',
    name: 'リボン (Red)',
    category: 'motif',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><polygon points="10,15 45,30 10,45 25,30" fill="%23DC2626"/><polygon points="90,15 55,30 90,45 75,30" fill="%23DC2626"/><circle cx="50" cy="30" r="14" fill="%23EF4444" stroke="%23FEE2E2" stroke-width="3"/></svg>`,
  },
  {
    id: 'st-hanko',
    name: '合格・丸印 (Hanko)',
    category: 'stamp',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="%23DC2626" stroke-width="6"/><circle cx="50" cy="50" r="38" fill="none" stroke="%23DC2626" stroke-width="2"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="900" fill="%23DC2626" text-anchor="middle">合格</text></svg>`,
  },
  {
    id: 'st-leaf',
    name: '月桂冠・ローレル (Laurel)',
    category: 'motif',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M15,65 C10,40 25,20 45,15 C40,25 35,45 28,62 Z" fill="%23F59E0B"/><path d="M85,65 C90,40 75,20 55,15 C60,25 65,45 72,62 Z" fill="%23F59E0B"/><circle cx="50" cy="65" r="6" fill="%23D97706"/></svg>`,
  },
  {
    id: 'st-flower',
    name: '桜の花 (Sakura)',
    category: 'motif',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,50 Q45,20 50,10 Q55,20 50,50 Q20,45 10,50 Q20,55 50,50 Q45,80 50,90 Q55,80 50,50 Q80,45 90,50 Q80,55 50,50" fill="%23FDA4AF" stroke="%23F43F5E" stroke-width="3"/><circle cx="50" cy="50" r="8" fill="%23FDE047"/></svg>`,
  },
];
