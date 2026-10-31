import React from 'react';

interface LogoEmblemProps {
  className?: string;
  size?: number | string;
}

export const ShubhpratikLogoEmblem: React.FC<LogoEmblemProps> = ({
  className = '',
  size = 140,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden shrink-0 bg-[#FAF7EE] flex items-center justify-center ${className}`}
    >
      <img
        src="/shubhpratik-logo.jpeg"
        alt="Shubhpratik Scentstik Manufacturing Company logo"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
};
