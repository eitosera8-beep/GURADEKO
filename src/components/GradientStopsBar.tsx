import React, { useState, useRef } from 'react';
import { ColorStop } from '../types';
import { M3Icon } from './M3Icon';

interface GradientStopsBarProps {
  stops: ColorStop[];
  onChangeStops: (stops: ColorStop[]) => void;
  disabled?: boolean;
}

export const GradientStopsBar: React.FC<GradientStopsBarProps> = ({
  stops,
  onChangeStops,
  disabled = false,
}) => {
  const [selectedStopId, setSelectedStopId] = useState<string>(stops[0]?.id || '1');
  const barRef = useRef<HTMLDivElement>(null);

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const selectedStop = stops.find((s) => s.id === selectedStopId) || sortedStops[0] || stops[0];

  const stopsGradientCss = `linear-gradient(90deg, ${sortedStops
    .map((s) => `${s.color} ${Math.round(s.position)}%`)
    .join(', ')})`;

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !barRef.current) return;
    if ((e.target as HTMLElement).closest('[data-stop-handle]')) return;

    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const position = Math.round(Math.max(0, Math.min(100, (clickX / rect.width) * 100)));

    // Generate random pleasant color or interpolate
    const newId = `stop-${Date.now()}`;
    const newColor = selectedStop ? selectedStop.color : '#4285F4';
    const newStop: ColorStop = { id: newId, color: newColor, position };

    const newStops = [...stops, newStop];
    onChangeStops(newStops);
    setSelectedStopId(newId);
  };

  const updateStop = (id: string, updates: Partial<ColorStop>) => {
    const newStops = stops.map((s) => (s.id === id ? { ...s, ...updates } : s));
    onChangeStops(newStops);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return; // Maintain minimum 2 stops
    const newStops = stops.filter((s) => s.id !== id);
    onChangeStops(newStops);
    if (selectedStopId === id) {
      setSelectedStopId(newStops[0].id);
    }
  };

  const addStop = () => {
    if (stops.length >= 8) return;
    const newId = `stop-${Date.now()}`;
    // Position between stops or at 50%
    const newPos = Math.round(Math.min(95, (selectedStop ? selectedStop.position + 15 : 50)));
    const randomColors = ['#FF5E7E', '#89F8C7', '#4285F4', '#FFD166', '#06D6A0', '#118AB2'];
    const newColor = randomColors[stops.length % randomColors.length];
    const newStops = [...stops, { id: newId, color: newColor, position: newPos }];
    onChangeStops(newStops);
    setSelectedStopId(newId);
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
          <M3Icon name="linear_scale" size={16} className="text-[var(--md-sys-color-primary)]" />
          カラーストップ ({stops.length}色)
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={addStop}
            disabled={disabled || stops.length >= 8}
            className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] hover:opacity-90 disabled:opacity-50 transition cursor-pointer flex items-center gap-0.5"
            title="カラーを追加"
          >
            <M3Icon name="add" size={14} /> カラー追加
          </button>
        </div>
      </div>

      {/* Visual Bar with Handles */}
      <div className="relative pt-2 pb-5">
        <div
          ref={barRef}
          onClick={handleBarClick}
          className="w-full h-5 rounded-full shadow-inner border border-[var(--md-sys-color-outline-variant)]/50 cursor-crosshair relative"
          style={{ background: stopsGradientCss }}
          title="クリックしてストップを追加"
        >
          {/* Stop markers */}
          {stops.map((stop) => {
            const isSelected = stop.id === selectedStop?.id;
            return (
              <div
                key={stop.id}
                data-stop-handle="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStopId(stop.id);
                }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10 group"
                style={{ left: `${stop.position}%` }}
              >
                <div
                  className={`w-4 h-6 rounded-[5px] border-2 shadow-md transition-transform ${
                    isSelected
                      ? 'scale-125 border-[var(--md-sys-color-primary)] ring-2 ring-white ring-offset-1'
                      : 'border-white hover:scale-110'
                  }`}
                  style={{ backgroundColor: stop.color }}
                />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono opacity-80 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none">
                  {Math.round(stop.position)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stop Inspector */}
      {selectedStop && (
        <div className="p-2.5 rounded-[14px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="color"
                value={selectedStop.color}
                onChange={(e) => updateStop(selectedStop.id, { color: e.target.value })}
                className="w-7 h-7 rounded-full border border-[var(--md-sys-color-outline-variant)] cursor-pointer p-0 bg-transparent"
              />
            </div>
            <input
              type="text"
              value={selectedStop.color}
              onChange={(e) => updateStop(selectedStop.id, { color: e.target.value })}
              className="w-18 h-7 px-1.5 rounded-[8px] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono uppercase text-[var(--md-sys-color-on-surface)]"
            />
          </div>

          {/* Position slider */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] shrink-0">位置</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(selectedStop.position)}
              onChange={(e) => updateStop(selectedStop.id, { position: Number(e.target.value) })}
              className="flex-1 h-1.5 accent-[var(--md-sys-color-primary)] cursor-pointer"
            />
            <span className="w-8 text-[10px] font-mono text-right text-[var(--md-sys-color-on-surface)]">
              {Math.round(selectedStop.position)}%
            </span>
          </div>

          {/* Delete button if >2 stops */}
          {stops.length > 2 && (
            <button
              type="button"
              onClick={() => removeStop(selectedStop.id)}
              className="p-1 rounded-full text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] transition cursor-pointer"
              title="このカラーを削除"
            >
              <M3Icon name="delete" size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
