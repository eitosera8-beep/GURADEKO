import React, { useState } from 'react';
import { M3Dialog } from './M3Dialog';
import { M3Button } from './M3Button';
import { M3Icon } from './M3Icon';

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryRandomColor?: () => void;
  onOpenPresets?: () => void;
  onAddSampleText?: () => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({
  isOpen,
  onClose,
  onTryRandomColor,
  onOpenPresets,
  onAddSampleText,
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'layout' | 'faq'>('flow');
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gradeco_hide_beginner_guide') === 'true';
    } catch {
      return false;
    }
  });

  const handleClose = () => {
    try {
      if (dontShowAgain) {
        localStorage.setItem('gradeco_hide_beginner_guide', 'true');
      } else {
        localStorage.removeItem('gradeco_hide_beginner_guide');
      }
    } catch {
      // ignore localstorage errors
    }
    onClose();
  };

  return (
    <M3Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="🔰 はじめてのグラデコ使い方ガイド"
      icon="lightbulb"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-3.5 max-h-[75vh] overflow-y-auto pr-1 text-[var(--md-sys-color-on-surface)]">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'flow'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs font-bold'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <M3Icon name="play_arrow" size={16} />
            <span>3ステップで作る</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'layout'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs font-bold'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <M3Icon name="dashboard" size={16} />
            <span>画面の見方・機能</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs font-bold'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <M3Icon name="help_outline" size={16} />
            <span>よくある質問・ワザ</span>
          </button>
        </div>

        {/* TAB 1: 3 Steps */}
        {activeTab === 'flow' && (
          <div className="flex flex-col gap-3 text-xs leading-relaxed">
            <div className="p-2.5 rounded-[14px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
              <span className="font-bold text-[13px] text-[var(--md-sys-color-primary)] block mb-0.5">
                グラデコへようこそ！
              </span>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                専門知識がなくても、直感的に美しいグラデーションやSNS用画像・動画が作成できます。
              </p>
            </div>

            {/* Step 1 */}
            <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <h4 className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)]">
                  色・グラデーションを選ぶ
                </h4>
              </div>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] pl-8">
                「どう色を合わせたらいいかわからない」という時は、<strong>「おまかせ調色🎲」</strong>を押すだけでプロ級の配色が瞬時に生成されます。<strong>「プリセット」</strong>から好みのスタイルをワンタップで選ぶこともできます。
              </p>
              <div className="pl-8 flex flex-wrap gap-2 pt-1">
                {onTryRandomColor && (
                  <button
                    type="button"
                    onClick={() => {
                      onTryRandomColor();
                      handleClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-surface)] border border-blue-400/40 text-blue-600 dark:text-blue-400 text-[11px] font-bold hover:bg-blue-500/10 transition cursor-pointer flex items-center gap-1"
                  >
                    <M3Icon name="casino" size={14} />
                    <span>🎲 おまかせ調色を試す</span>
                  </button>
                )}
                {onOpenPresets && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPresets();
                      handleClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] text-[11px] font-semibold hover:border-[var(--md-sys-color-primary)] transition cursor-pointer flex items-center gap-1"
                  >
                    <M3Icon name="palette" size={14} />
                    <span>🎨 プリセット一覧を見る</span>
                  </button>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <h4 className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)]">
                  文字や素材を追加・配置する
                </h4>
              </div>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] pl-8">
                左メニューの<strong>「文字」</strong>タブからタイトルを追加したり、<strong>「素材」</strong>タブから星やハートなどの図形スタンプを重ねられます。追加した要素は<strong>画面上で直接ドラッグして移動</strong>、四隅の丸で拡大縮小できます。
              </p>
              <div className="pl-8 flex flex-wrap gap-2 pt-1">
                {onAddSampleText && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddSampleText();
                      handleClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-surface)] border border-purple-400/40 text-purple-600 dark:text-purple-400 text-[11px] font-bold hover:bg-purple-500/10 transition cursor-pointer flex items-center gap-1"
                  >
                    <M3Icon name="title" size={14} />
                    <span>✍️ 文字を追加してみる</span>
                  </button>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <h4 className="text-[13px] font-bold text-[var(--md-sys-color-on-surface)]">
                  画像や動画をダウンロード！
                </h4>
              </div>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] pl-8">
                右上の<strong>「画像保存」</strong>または<strong>「動画出力」</strong>ボタンを押すだけで、高画質な画像（PNG/JPG/SVG）や動画（MP4/WebM/GIF）として即座にお使いの端末に保存されます。Webサイト制作用にCSSコードをコピーすることも可能です。
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Layout & Tools Overview */}
        {activeTab === 'layout' && (
          <div className="flex flex-col gap-3 text-xs leading-relaxed">
            {/* Screen layout guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-[14px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
                <span className="font-bold text-[12px] text-[var(--md-sys-color-primary)] flex items-center gap-1 mb-1">
                  <M3Icon name="tune" size={16} />
                  <span>👈 左側: 設定パネル（編集）</span>
                </span>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mb-2">
                  グラデーションの色、文字、素材、サイズなどを細かく調整するエリアです。
                </p>
                <div className="space-y-1 text-[11px]">
                  <div><strong>🎨 配色:</strong> 線形・円形・メッシュ等の種類と基本色</div>
                  <div><strong>🌈 ストップ:</strong> 色の境界線をスライドして混ざり方を調整</div>
                  <div><strong>✍️ 文字:</strong> 50種類以上の日本語フォント・影・縁取り</div>
                  <div><strong>🖼️ 素材:</strong> 図形スタンプや手持ち画像の合成</div>
                  <div><strong>🎬 動画:</strong> TikTok/Shorts向けの動くオーロラ動画</div>
                  <div><strong>📐 枠・効果:</strong> XやInstagramサイズ、エモいノイズ質感</div>
                </div>
              </div>

              <div className="p-3 rounded-[14px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
                <span className="font-bold text-[12px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                  <M3Icon name="visibility" size={16} />
                  <span>👉 右側: プレビュー画面</span>
                </span>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mb-2">
                  作成中の画像がリアルタイムに表示されます。直接触って操作できます。
                </p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-1">
                    <span className="font-bold text-amber-500">・背景ドラッグ:</span>
                    <span>グラデーションの光の中心を自由にスライド移動</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold text-blue-500">・文字や素材のタップ:</span>
                    <span>枠が表示され、ドラッグで移動、四隅の丸で拡大縮小、上の丸で回転</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold text-purple-500">・ツールバー:</span>
                    <span>画面下部のバーで拡大縮小（ズーム）やガイド線表示を切り替え</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Toolbar explanation */}
            <div className="p-3 rounded-[14px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
              <span className="font-bold text-[12px] text-[var(--md-sys-color-on-surface)] flex items-center gap-1 mb-1">
                <M3Icon name="web" size={16} />
                <span>☝️ 画面上部のツールバー</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-2">
                <div className="p-2 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20">
                  <span className="font-bold text-[var(--md-sys-color-on-surface)] block">💾 保存</span>
                  作品をブラウザに保存し、後からいつでも再編集
                </div>
                <div className="p-2 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20">
                  <span className="font-bold text-[var(--md-sys-color-on-surface)] block">↩️ 元に戻す</span>
                  間違えてもワンタップまたは Ctrl+Z で取り消し
                </div>
                <div className="p-2 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20">
                  <span className="font-bold text-[var(--md-sys-color-on-surface)] block">💻 コード出力</span>
                  CSSやTailwind用のコードをコピー
                </div>
                <div className="p-2 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/20">
                  <span className="font-bold text-[var(--md-sys-color-on-surface)] block">📥 ダウンロード</span>
                  画像（PNG/JPG/SVG）や動画（MP4/GIF）を保存
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FAQ & Tips */}
        {activeTab === 'faq' && (
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="p-2.5 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
              <h5 className="font-bold text-[12px] text-[var(--md-sys-color-primary)] mb-1">
                Q. スマホの壁紙やSNSのヘッダーサイズに合わせたい
              </h5>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-normal">
                左メニューの「枠・効果」タブを開くと、「キャンバスサイズ」から「X ヘッダー (1500×500)」「Instagram 正方形」「スマホ壁紙 (9:16)」「Full HD (1920×1080)」などのプリセットを1クリックで選べます。自由なピクセル入力も可能です。
              </p>
            </div>

            <div className="p-2.5 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
              <h5 className="font-bold text-[12px] text-[var(--md-sys-color-primary)] mb-1">
                Q. 動くグラデーション動画を作るには？
              </h5>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-normal">
                エディター上部の「📷 静止画 / 🎥 動画」切り替えボタンを「🎥 動画」に切り替えると、「動画」タブが現れます。「オーロラ」「呼吸」「流体」「ネオン」などのモーションを選んで再生ボタンを押すだけで、MP4やGIF形式の動画が書き出せます。
              </p>
            </div>

            <div className="p-2.5 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
              <h5 className="font-bold text-[12px] text-[var(--md-sys-color-primary)] mb-1">
                Q. お気に入りの配色を次回も使いたい
              </h5>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-normal">
                「配色」タブの「マイ保存」ボタンを押すと、現在のグラデーションに名前を付けてマイプリセットに登録できます。次回以降は「プリセット」ダイアログの「★ マイプリセット」からいつでも呼び出せます。
              </p>
            </div>

            <div className="p-2.5 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
              <h5 className="font-bold text-[12px] text-[var(--md-sys-color-primary)] mb-1">
                Q. 好きな写真から色を抜き出してグラデーションにしたい
              </h5>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-normal">
                「画像抽出」ボタンを押してお手持ちの写真や画像ファイルを選択すると、写真内の主要カラーをAI風に自動抽出し、滑らかなグラデーションとして展開します。
              </p>
            </div>

            <div className="p-2.5 rounded-[12px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/30">
              <h5 className="font-bold text-[12px] text-[var(--md-sys-color-primary)] mb-1">
                Q. 操作をやり直したい・元に戻したい
              </h5>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-normal">
                上部ツールバーの「元に戻す（↩️）」ボタン、またはキーボードの <kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/50 font-mono text-[10px]">Ctrl + Z</kbd>（Macは <kbd className="px-1 py-0.5 rounded bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]/50 font-mono text-[10px]">Cmd + Z</kbd>）で何度でも過去の状態に戻せます。
              </p>
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)]/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <label className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded accent-[var(--md-sys-color-primary)] w-4 h-4 cursor-pointer"
            />
            <span>次回から起動時に自動表示しない</span>
          </label>

          <M3Button variant="filled" onClick={handleClose}>
            エディターを始める
          </M3Button>
        </div>
      </div>
    </M3Dialog>
  );
};
