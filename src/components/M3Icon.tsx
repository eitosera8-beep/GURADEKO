import React from 'react';

interface M3IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

export const M3Icon: React.FC<M3IconProps> = ({
  name,
  filled = false,
  size = 24,
  className = '',
}) => {
  return (
    <span
      className={`material-symbols-rounded select-none ${filled ? 'filled' : ''} ${className}`}
      style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
