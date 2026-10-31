import React from 'react';
import { ShubhpratikLogoEmblem } from './ShubhpratikLogoEmblem';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const pixelSizes = {
    sm: 32,
    md: 46,
    lg: 64,
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <ShubhpratikLogoEmblem size={pixelSizes[size]} />

      <div className="flex flex-col">
        <div className={`font-cinzel font-bold tracking-wider text-cream-gradient ${titleSizes[size]} leading-tight`}>
          SHUBHPRATIK
        </div>
        {showSubtitle && (
          <div className="text-[10px] tracking-[0.22em] text-[#D8B4FE]/80 font-medium uppercase leading-none mt-0.5">
            FRAGRANCES
          </div>
        )}
      </div>
    </div>
  );
};
