import React from 'react';

interface CustomFolderIconProps {
  className?: string;
  size?: number;
}

export const CustomFolderIcon: React.FC<CustomFolderIconProps> = ({ 
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
      {/* Оригинальная 3D папка с тенями и объемом */}
      
      {/* Тень папки */}
      <ellipse
        cx="12"
        cy="20"
        rx="8"
        ry="2"
        fill="#000000"
        opacity="0.2"
      />
      
      {/* Задняя часть папки (основание) */}
      <rect
        x="4"
        y="8"
        width="16"
        height="12"
        rx="2"
        fill="#ffd54f"
        stroke="#ffb300"
        strokeWidth="0.8"
      />
      
      {/* Передняя крышка папки с 3D эффектом */}
      <path
        d="M4 6 L20 6 L20 10 L4 10 Z"
        fill="#ffeb3b"
        stroke="#ffb300"
        strokeWidth="0.8"
      />
      
      {/* Складка папки для объема */}
      <rect
        x="4"
        y="9.5"
        width="16"
        height="1"
        fill="#ffb300"
        opacity="0.6"
      />
      
      {/* Иконка на папке */}
      <rect
        x="8"
        y="7.2"
        width="2.5"
        height="1.8"
        rx="0.4"
        fill="#ff9800"
        stroke="#f57c00"
        strokeWidth="0.4"
      />
      
      {/* Документы внутри */}
      <rect
        x="6"
        y="10.5"
        width="12"
        height="8"
        rx="1"
        fill="#fff"
        stroke="#e0e0e0"
        strokeWidth="0.4"
      />
      
      {/* Линии на документах */}
      <rect x="7.5" y="12" width="7" height="0.4" fill="#ccc" rx="0.2" />
      <rect x="7.5" y="13" width="5" height="0.4" fill="#ccc" rx="0.2" />
      <rect x="7.5" y="14" width="6" height="0.4" fill="#ccc" rx="0.2" />
      <rect x="7.5" y="15" width="4" height="0.4" fill="#ccc" rx="0.2" />
      
      {/* Блики для 3D эффекта */}
      <rect
        x="4.5"
        y="6.5"
        width="15"
        height="3"
        rx="1.5"
        fill="none"
        stroke="#fff"
        strokeWidth="0.4"
        opacity="0.4"
      />
      
      {/* Дополнительные тени для объема */}
      <rect
        x="4.5"
        y="8.5"
        width="15"
        height="11"
        rx="1.5"
        fill="none"
        stroke="#000000"
        strokeWidth="0.1"
        opacity="0.1"
      />
    </svg>
  );
};

export default CustomFolderIcon; 