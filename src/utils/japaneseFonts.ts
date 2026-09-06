export interface JapaneseFont {
  id: string;
  name: string;
  family: string;
  category: 'gothic' | 'mincho' | 'round' | 'pop' | 'brush' | 'display' | 'retro';
  categoryLabel: string;
  weights: number[];
  sample: string;
}

export const JAPANESE_FONTS: JapaneseFont[] = [
  // --- ゴシック体 (Gothic) ---
  { id: 'noto-sans-jp', name: 'Noto Sans JP', family: 'Noto Sans JP', category: 'gothic', categoryLabel: 'ゴシック', weights: [400, 500, 700, 900], sample: '美しい日本語グラデーション' },
  { id: 'zen-kaku-gothic', name: 'Zen Kaku Gothic New', family: 'Zen Kaku Gothic New', category: 'gothic', categoryLabel: 'ゴシック', weights: [400, 500, 700, 900], sample: '洗練されたモダン角ゴシック' },
  { id: 'm-plus-1p', name: 'M PLUS 1p', family: 'M PLUS 1p', category: 'gothic', categoryLabel: 'ゴシック', weights: [400, 500, 700, 800, 900], sample: '日常を彩る定番ゴシック' },
  { id: 'm-plus-1', name: 'M PLUS 1', family: 'M PLUS 1', category: 'gothic', categoryLabel: 'ゴシック', weights: [400, 600, 800], sample: 'コンテンポラリーデザイン' },
  { id: 'm-plus-2', name: 'M PLUS 2', family: 'M PLUS 2', category: 'gothic', categoryLabel: 'ゴシック', weights: [400, 600, 800], sample: '力強く読みやすいフォルム' },
  { id: 'biz-udpgothic', name: 'BIZ UDPゴシック', family: 'BIZ UDPGothic', category: 'gothic', categoryLabel: 'ゴシック', weights: [400, 700], sample: 'ユニバーサルデザイン角ゴ' },
  { id: 'biz-udgothic', name: 'BIZ UDゴシック (等幅)', family: 'BIZ UDGothic', category: 'gothic', categoryLabel: 'ゴシック', weights: [400, 700], sample: '等幅ビジネスゴシック' },
  { id: 'kosugi', name: '小杉ゴシック (Kosugi)', family: 'Kosugi', category: 'gothic', categoryLabel: 'ゴシック', weights: [400], sample: 'シャープで直線的なライン' },
  { id: 'sawarabi-gothic', name: 'さわらびゴシック', family: 'Sawarabi Gothic', category: 'gothic', categoryLabel: 'ゴシック', weights: [400], sample: '親しみやすい軽快な文字' },
  { id: 'ibm-plex-sans-jp', name: 'IBM Plex Sans JP', family: 'IBM Plex Sans JP', category: 'gothic', categoryLabel: 'ゴシック', weights: [400, 600, 700], sample: '理知的でテックな美学' },

  // --- 明朝体 (Mincho) ---
  { id: 'noto-serif-jp', name: 'Noto Serif JP', family: 'Noto Serif JP', category: 'mincho', categoryLabel: '明朝', weights: [400, 600, 700, 900], sample: '伝統美薫る正統派明朝' },
  { id: 'shippori-mincho', name: 'しっぽり明朝', family: 'Shippori Mincho', category: 'mincho', categoryLabel: '明朝', weights: [400, 500, 600, 700, 800], sample: '流麗で美しい伝統の墨溜まり' },
  { id: 'shippori-mincho-b1', name: 'しっぽり明朝 B1', family: 'Shippori Mincho B1', category: 'mincho', categoryLabel: '明朝', weights: [400, 600, 800], sample: '上品で詩情あふれる佇まい' },
  { id: 'zen-old-mincho', name: 'Zen オールド明朝', family: 'Zen Old Mincho', category: 'mincho', categoryLabel: '明朝', weights: [400, 600, 700, 900], sample: '懐かしさを感じる古典明朝' },
  { id: 'kaisei-decol', name: '解星 デコール (Decol)', family: 'Kaisei Decol', category: 'mincho', categoryLabel: '明朝', weights: [400, 700], sample: '先端が丸く可憐な装飾明朝' },
  { id: 'kaisei-tokumin', name: '解星 特割明朝', family: 'Kaisei Tokumin', category: 'mincho', categoryLabel: '明朝', weights: [400, 700, 800], sample: '力強いウロコと線の強弱' },
  { id: 'kaisei-harunoumi', name: '解星 春の海', family: 'Kaisei HarunoUmi', category: 'mincho', categoryLabel: '明朝', weights: [400, 700], sample: '春の波のように柔らかな風情' },
  { id: 'kaisei-opti', name: '解星 オプティ', family: 'Kaisei Opti', category: 'mincho', categoryLabel: '明朝', weights: [400, 700], sample: '幾何学的な均整美の明朝' },
  { id: 'biz-udpmincho', name: 'BIZ UDP明朝', family: 'BIZ UDPMincho', category: 'mincho', categoryLabel: '明朝', weights: [400, 700], sample: '読みやすさ重視のUD明朝' },
  { id: 'biz-udmincho', name: 'BIZ UD明朝 (等幅)', family: 'BIZ UDMincho', category: 'mincho', categoryLabel: '明朝', weights: [400, 700], sample: '整然と並ぶ等幅明朝' },
  { id: 'hina-mincho', name: 'ひな明朝 (Hina Mincho)', family: 'Hina Mincho', category: 'mincho', categoryLabel: '明朝', weights: [400], sample: '小さく可憐な筆致の雛明朝' },
  { id: 'sawarabi-mincho', name: 'さわらび明朝', family: 'Sawarabi Mincho', category: 'mincho', categoryLabel: '明朝', weights: [400], sample: '軽やかで素朴な風合い' },

  // --- 丸ゴシック (Round) ---
  { id: 'zen-maru-gothic', name: 'Zen 丸ゴシック', family: 'Zen Maru Gothic', category: 'round', categoryLabel: '丸ゴシック', weights: [400, 500, 700, 900], sample: '優しくまろやかな曲線' },
  { id: 'm-plus-rounded-1c', name: 'M PLUS Rounded 1c', family: 'M PLUS Rounded 1c', category: 'round', categoryLabel: '丸ゴシック', weights: [400, 500, 700, 800, 900], sample: 'モダンで愛らしい丸ゴシック' },
  { id: 'kiwi-maru', name: 'キウイ丸 (Kiwi Maru)', family: 'Kiwi Maru', category: 'round', categoryLabel: '丸ゴシック', weights: [300, 400, 500], sample: '手書きニュアンスの丸文字' },
  { id: 'kosugi-maru', name: '小杉丸ゴシック (Kosugi Maru)', family: 'Kosugi Maru', category: 'round', categoryLabel: '丸ゴシック', weights: [400], sample: '看板や標識にも映える丸み' },
  { id: 'zen-antique-soft', name: 'Zen アンティーク Soft', family: 'Zen Antique Soft', category: 'round', categoryLabel: '丸ゴシック', weights: [400], sample: 'レトロな角丸のアンティーク' },

  // --- ポップ・手書き (Pop & Handwritten) ---
  { id: 'hachi-maru-pop', name: '八二ポップ (Hachi Maru Pop)', family: 'Hachi Maru Pop', category: 'pop', categoryLabel: 'ポップ', weights: [400], sample: '80年代風の可愛い丸文字' },
  { id: 'mochiy-pop-one', name: 'モチイ・ポップ (Mochiy Pop)', family: 'Mochiy Pop One', category: 'pop', categoryLabel: 'ポップ', weights: [400], sample: 'お餅のようにもっちり太い' },
  { id: 'mochiy-pop-p-one', name: 'モチイ・ポップ P', family: 'Mochiy Pop P One', category: 'pop', categoryLabel: 'ポップ', weights: [400], sample: '弾むようなプロポーショナル' },
  { id: 'potta-one', name: 'ポッタ (Potta One)', family: 'Potta One', category: 'pop', categoryLabel: 'ポップ', weights: [400], sample: 'ぽてっと愛らしい手書き文字' },
  { id: 'darumadrop-one', name: 'ダルマドロップ (Darumadrop)', family: 'Darumadrop One', category: 'pop', categoryLabel: 'ポップ', weights: [400], sample: '転がるダルマのような愛嬌' },
  { id: 'cherry-bomb-one', name: 'チェリーボム (Cherry Bomb)', family: 'Cherry Bomb One', category: 'pop', categoryLabel: 'ポップ', weights: [400], sample: '弾けるフルーツキャンディ' },
  { id: 'yusei-magic', name: '油性マジック (Yusei Magic)', family: 'Yusei Magic', category: 'pop', categoryLabel: 'ポップ', weights: [400], sample: 'サインペンで書いたような勢い' },

  // --- 筆文字・伝統 (Brush & Traditional) ---
  { id: 'yuji-boku', name: '游築 墨 (Yuji Boku)', family: 'Yuji Boku', category: 'brush', categoryLabel: '筆文字', weights: [400], sample: '深く濃密な毛筆の味わい' },
  { id: 'yuji-mai', name: '游築 舞 (Yuji Mai)', family: 'Yuji Mai', category: 'brush', categoryLabel: '筆文字', weights: [400], sample: '風に舞うような軽妙な筆致' },
  { id: 'yuji-syuku', name: '游築 宿 (Yuji Syuku)', family: 'Yuji Syuku', category: 'brush', categoryLabel: '筆文字', weights: [400], sample: '端正で落ち着きのある筆書' },
  { id: 'klee-one', name: 'クレー (Klee One)', family: 'Klee One', category: 'brush', categoryLabel: '筆文字', weights: [400, 600], sample: '硬筆・ペン習字の端正さ' },
  { id: 'zen-antique', name: 'Zen アンティーク', family: 'Zen Antique', category: 'brush', categoryLabel: '筆文字', weights: [400], sample: '古書のような奥深い風情' },

  // --- ディスプレイ・個性的 (Display & Decorative) ---
  { id: 'dela-gothic-one', name: 'デラ・ゴシック (Dela Gothic)', family: 'Dela Gothic One', category: 'display', categoryLabel: 'ディスプレイ', weights: [400], sample: '圧倒的迫力の超極太インパクト' },
  { id: 'reggae-one', name: 'レゲエ (Reggae One)', family: 'Reggae One', category: 'display', categoryLabel: 'ディスプレイ', weights: [400], sample: 'リズムに乗る尖ったデザイン' },
  { id: 'rocknroll-one', name: 'ロックンロール (RocknRoll)', family: 'RocknRoll One', category: 'display', categoryLabel: 'ディスプレイ', weights: [400], sample: '躍動感あふれるロック文字' },
  { id: 'rampart-one', name: 'ランパート (Rampart One)', family: 'Rampart One', category: 'display', categoryLabel: 'ディスプレイ', weights: [400], sample: '影付きの立体ブロック文字' },
  { id: 'train-one', name: 'トレイン (Train One)', family: 'Train One', category: 'display', categoryLabel: 'ディスプレイ', weights: [400], sample: '二重線のスタイリッシュライン' },
  { id: 'stick', name: 'スティック (Stick)', family: 'Stick', category: 'display', categoryLabel: 'ディスプレイ', weights: [400], sample: '棒線で組まれた未来的幾何学' },
  { id: 'shippori-antique', name: 'しっぽりアンティーク', family: 'Shippori Antique', category: 'display', categoryLabel: 'ディスプレイ', weights: [400], sample: '築地体風のレトロ見出し' },
  { id: 'shippori-antique-b1', name: 'しっぽりアンティーク B1', family: 'Shippori Antique B1', category: 'display', categoryLabel: 'ディスプレイ', weights: [400], sample: 'レトロな墨溜まり付き見出し' },

  // --- レトロ・ドット (Retro & Pixel) ---
  { id: 'dot-gothic-16', name: 'DotGothic16 (ドット)', family: 'DotGothic16', category: 'retro', categoryLabel: 'レトロ', weights: [400], sample: '8bitゲームのドットフォント' },

  // --- 英字・アクセント用 (Standard & Accent) ---
  { id: 'roboto', name: 'Roboto (欧文標準)', family: 'Roboto', category: 'gothic', categoryLabel: '標準欧文', weights: [400, 700, 900], sample: 'Material 3 Expressive' },
  { id: 'bungee', name: 'Bungee (極太欧文)', family: 'Bungee', category: 'display', categoryLabel: '極太英字', weights: [400], sample: 'BOLD DISPLAY TYPE' },
  { id: 'playfair-display', name: 'Playfair (優雅セリフ)', family: 'Playfair Display', category: 'mincho', categoryLabel: '優雅セリフ', weights: [400, 700, 900], sample: 'Luxury Typography' },
  { id: 'righteous', name: 'Righteous (レトロ近未来)', family: 'Righteous', category: 'display', categoryLabel: 'レトロ近未来', weights: [400], sample: 'MODERN RETRO' },
];

const loadedFonts = new Set<string>();

/**
 * Dynamically injects Google Fonts link into the head for the requested family.
 */
export function loadGoogleFont(family: string) {
  if (typeof document === 'undefined') return;
  if (loadedFonts.has(family)) return;
  loadedFonts.add(family);

  // Common fallbacks already in index.html
  if (family === 'Roboto' || family === 'Noto Sans JP' || family === 'sans-serif' || family === 'serif') {
    return;
  }

  const encodedFamily = family.replace(/\s+/g, '+');
  const linkId = `gfont-${family.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;700;900&display=swap`;
  document.head.appendChild(link);
}
