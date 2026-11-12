import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface FoodhomeLogoProps {
  variant?: 'dark' | 'light';
  className?: string;
  height?: number;
  width?: number;
  placement?: 'header' | 'footer' | 'preview';
}

export const FoodhomeLogo: React.FC<FoodhomeLogoProps> = ({
  variant = 'dark',
  className = '',
  height,
  width,
  placement
}) => {
  const { state } = useApp();
  const [imageError, setImageError] = useState(false);
  const logoSrc = state.content.logoUrl || '/assets/aistudio/image_c9ceb519.png';

  // Determine width based on placement if not directly passed
  const effectiveWidth = width || (
    placement === 'header'
      ? (state.content.headerLogoWidth || 160)
      : placement === 'footer'
        ? (state.content.footerLogoWidth || 140)
        : undefined
  );

  // Default height fallback if neither height nor width is provided
  const effectiveHeight = height || (!effectiveWidth ? (variant === 'light' ? 36 : 42) : undefined);

  // If the user's uploaded image loads, display it
  if (!imageError) {
    return (
      <div className={`flex items-center gap-2 select-none bg-transparent ${className}`}>
        <img
          src={logoSrc}
          alt="FOOD HOME 푸드홈"
          style={{
            width: effectiveWidth ? `${effectiveWidth}px` : undefined,
            height: effectiveHeight ? `${effectiveHeight}px` : 'auto',
            maxWidth: '100%'
          }}
          className={`object-contain bg-transparent transition-all duration-150 ${variant === 'light' ? 'brightness-110 drop-shadow-sm' : ''}`}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Graceful vector fallback matching Image 5 (House outline + FOOD HOME in slate/steel-blue)
  const vectorDim = (effectiveHeight || (variant === 'light' ? 36 : 42)) * 0.9;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="flex items-center justify-center">
        <svg
          width={vectorDim}
          height={vectorDim}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* House outline in elegant metallic silver-grey */}
          <path
            d="M24 6L6 20V42H42V20L24 6Z"
            stroke={variant === 'light' ? '#E2E8F0' : '#8A9BA8'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle chimney */}
          <path
            d="M33 13V9H38V17"
            stroke={variant === 'light' ? '#E2E8F0' : '#8A9BA8'}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col justify-center leading-tight">
        <span
          className={`font-black tracking-wider text-base sm:text-lg ${
            variant === 'light' ? 'text-white' : 'text-[#3E6580]'
          }`}
          style={{ letterSpacing: '0.08em' }}
        >
          FOOD HOME
        </span>
        <span
          className={`text-[9px] font-semibold tracking-widest ${
            variant === 'light' ? 'text-stone-300' : 'text-stone-500'
          }`}
        >
          푸드홈 안심먹거리
        </span>
      </div>
    </div>
  );
};
