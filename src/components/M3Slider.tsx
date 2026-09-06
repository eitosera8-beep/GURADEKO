import React, { useRef, useCallback, useState, useEffect } from 'react';

interface M3SliderProps {
  value: number; // 0 to 100
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  ariaLabel?: string;
}

export const M3Slider: React.FC<M3SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  ariaLabel = 'スライダー',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clamp value
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const ratio = Math.min(Math.max(relativeX / rect.width, 0), 1);
      const rawVal = min + ratio * (max - min);
      const steppedVal = Math.round(rawVal / step) * step;
      const clampedVal = Math.min(max, Math.max(min, steppedVal));
      onChange(clampedVal);
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture release fallback
      }
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          onChange(Math.min(max, value + step));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          onChange(Math.max(min, value - step));
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-[44px] flex items-center cursor-pointer select-none touch-none outline-none group ${className}`}
    >
      {/* 16dp Track Container */}
      <div className="relative w-full h-[16px] rounded-[8px] overflow-hidden flex">
        {/* Left track: primary */}
        <div
          className="h-full bg-[var(--md-sys-color-primary)] transition-[width] duration-75"
          style={{ width: `${percentage}%` }}
        />
        {/* Right track: secondaryContainer */}
        <div
          className="h-full bg-[var(--md-sys-color-secondary-container)] flex-1"
        />
      </div>

      {/* M3 Expressive Handle: Width 4dp, Height 44dp */}
      <div
        className="absolute top-0 w-[4px] h-[44px] rounded-[2px] bg-[var(--md-sys-color-on-surface)] shadow-sm pointer-events-none transition-[left] duration-75"
        style={{
          left: `calc(${percentage}% - 2px)`,
          backgroundColor: 'var(--md-sys-color-primary)',
          boxShadow: '0 0 0 1px var(--md-sys-color-surface), 0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  );
};
