import React from 'react';

interface InProgressIconProps {
  className?: string;
  size?: number;
}

export const InProgressIcon: React.FC<InProgressIconProps> = ({ 
  className = "", 
  size = 24 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Оригинальная 3D шестеренка с тенями и объемом */}
      
      {/* Тень шестеренки */}
      <ellipse
        cx="12"
        cy="20"
        rx="6"
        ry="1.5"
        fill="#000000"
        opacity="0.2"
      />
      
      {/* Основная шестеренка */}
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="#ff6b35"
        stroke="#e55a2b"
        strokeWidth="0.8"
      />
      
      {/* Зубцы шестеренки */}
      <rect x="11.5" y="2" width="1" height="3" fill="#ff6b35" rx="0.5" />
      <rect x="11.5" y="19" width="1" height="3" fill="#ff6b35" rx="0.5" />
      <rect x="2" y="11.5" width="3" height="1" fill="#ff6b35" rx="0.5" />
      <rect x="19" y="11.5" width="3" height="1" fill="#ff6b35" rx="0.5" />
      
      {/* Диагональные зубцы */}
      <rect x="6.5" y="6.5" width="1" height="3" fill="#ff6b35" rx="0.5" transform="rotate(45 7 8)" />
      <rect x="16.5" y="6.5" width="1" height="3" fill="#ff6b35" rx="0.5" transform="rotate(-45 17 8)" />
      <rect x="6.5" y="14.5" width="1" height="3" fill="#ff6b35" rx="0.5" transform="rotate(-45 7 16)" />
      <rect x="16.5" y="14.5" width="1" height="3" fill="#ff6b35" rx="0.5" transform="rotate(45 17 16)" />
      
      {/* Центральное отверстие */}
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="#ff8c42"
        stroke="#ff6b35"
        strokeWidth="0.5"
      />
      
      {/* Центральная ось */}
      <circle
        cx="12"
        cy="12"
        r="1"
        fill="#ff9800"
        stroke="#f57c00"
        strokeWidth="0.3"
      />
      
      {/* Точки активности */}
      <circle cx="12" cy="6" r="0.8" fill="#fff" />
      <circle cx="18" cy="12" r="0.8" fill="#fff" />
      <circle cx="12" cy="18" r="0.8" fill="#fff" />
      <circle cx="6" cy="12" r="0.8" fill="#fff" />
      
      {/* Блики для 3D эффекта */}
      <circle
        cx="11"
        cy="11"
        r="6"
        fill="none"
        stroke="#fff"
        strokeWidth="0.4"
        opacity="0.3"
      />
      
      {/* Дополнительные тени для объема */}
      <circle
        cx="12.5"
        cy="12.5"
        r="8"
        fill="none"
        stroke="#000000"
        strokeWidth="0.1"
        opacity="0.1"
      />
    </svg>
  );
};

export default InProgressIcon; 