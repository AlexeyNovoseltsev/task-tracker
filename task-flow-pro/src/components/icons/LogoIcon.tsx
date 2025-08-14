import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ 
  className = "", 
  size = 24
}) => {
  return (
    <div className={`${className}`}>
      {/* Логотип */}
      <div className="flex-shrink-0">
        <img 
          src="/logo/logo.png" 
          alt="TaskFlow Pro Logo" 
          width={size} 
          height={size}
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default LogoIcon; 