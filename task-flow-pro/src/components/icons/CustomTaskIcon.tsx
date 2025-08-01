import React from 'react';

interface CustomTaskIconProps {
  className?: string;
  size?: number;
}

export const CustomTaskIcon: React.FC<CustomTaskIconProps> = ({ 
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
      {/* Оригинальная 3D клипборд с тенями и объемом */}
      
      {/* Тень клипборда */}
      <ellipse
        cx="12"
        cy="22"
        rx="6"
        ry="1.5"
        fill="#000000"
        opacity="0.2"
      />
      
      {/* Основная доска клипборда */}
      <rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="1.5"
        fill="#8d6e63"
        stroke="#6d4c41"
        strokeWidth="0.8"
      />
      
      {/* Бумага на клипборде */}
      <rect
        x="6.5"
        y="4.5"
        width="11"
        height="15"
        rx="1"
        fill="#fff"
        stroke="#e0e0e0"
        strokeWidth="0.4"
      />
      
      {/* Зажим клипборда */}
      <rect
        x="8"
        y="2"
        width="8"
        height="3"
        rx="0.5"
        fill="#6d4c41"
        stroke="#4e342e"
        strokeWidth="0.4"
      />
      
      {/* Чек-лист на бумаге */}
      <rect x="8" y="6" width="8" height="0.4" fill="#333" rx="0.2" />
      <rect x="8" y="7.5" width="6" height="0.4" fill="#333" rx="0.2" />
      <rect x="8" y="9" width="7" height="0.4" fill="#333" rx="0.2" />
      <rect x="8" y="10.5" width="5" height="0.4" fill="#333" rx="0.2" />
      <rect x="8" y="12" width="6" height="0.4" fill="#333" rx="0.2" />
      
      {/* Галочки на пунктах */}
      <path
        d="M8.5 6.2 L9.2 6.9 L11.5 4.6"
        stroke="#4caf50"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8.5 7.7 L9.2 8.4 L10.8 6.8"
        stroke="#4caf50"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8.5 9.2 L9.2 9.9 L11.8 7.3"
        stroke="#4caf50"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Карандаш */}
      <rect
        x="16"
        y="8"
        width="1"
        height="6"
        rx="0.5"
        fill="#ffc107"
        stroke="#ff8f00"
        strokeWidth="0.3"
        transform="rotate(45 16.5 11)"
      />
      
      {/* Наконечник карандаша */}
      <polygon
        points="16.5,8 17,7.5 17.5,8"
        fill="#ff9800"
        stroke="#f57c00"
        strokeWidth="0.2"
      />
      
      {/* Блики для 3D эффекта */}
      <rect
        x="6.5"
        y="4.5"
        width="11"
        height="2"
        rx="1"
        fill="none"
        stroke="#fff"
        strokeWidth="0.4"
        opacity="0.4"
      />
      
      {/* Дополнительные тени для объема */}
      <rect
        x="6.5"
        y="4.5"
        width="11"
        height="15"
        rx="1"
        fill="none"
        stroke="#000000"
        strokeWidth="0.1"
        opacity="0.1"
      />
    </svg>
  );
};

export default CustomTaskIcon; 