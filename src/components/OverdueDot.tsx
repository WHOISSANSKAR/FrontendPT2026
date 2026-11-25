import React from 'react';

interface OverdueDotProps {
  title: string;
  onLightBg?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const OverdueDot: React.FC<OverdueDotProps> = ({
  title,
  onLightBg = true,
  className = '',
  onClick,
}) => {
  const dotVisual = (
    <>
      <span
        className={`pointer-events-none absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${
          onLightBg ? 'bg-rose-400' : 'bg-rose-200'
        }`}
      />
      <span
        className={`pointer-events-none relative inline-flex h-2 w-2 rounded-full ${
          onLightBg
            ? 'bg-rose-600 ring-1 ring-white'
            : 'bg-rose-500 ring-1 ring-white'
        }`}
      />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        title={title}
        aria-label={title}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
        className={`relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full hover:scale-125 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-transform cursor-pointer ${className}`}
      >
        {dotVisual}
      </button>
    );
  }

  return (
    <span
      title={title}
      aria-label={title}
      className={`pointer-events-none relative inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full ${className}`}
    >
      {dotVisual}
    </span>
  );
};