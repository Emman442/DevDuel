import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 3D Isometric Cube in Solid Orange (#FF5A1F) with subtle shading on faces */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Top face */}
        <path
          d="M12 2L21 7.2L12 12.4L3 7.2L12 2Z"
          fill="#FF7442"
        />
        {/* Left face */}
        <path
          d="M3 7.2L12 12.4V22L3 16.8V7.2Z"
          fill="#FF5A1F"
        />
        {/* Right face */}
        <path
          d="M12 12.4L21 7.2V16.8L12 22V12.4Z"
          fill="#E64A12"
        />
      </svg>

      <span className="font-extrabold tracking-tight text-[#121212] font-sans text-lg md:text-xl">
        DevDuel
      </span>
    </div>
  );
};
