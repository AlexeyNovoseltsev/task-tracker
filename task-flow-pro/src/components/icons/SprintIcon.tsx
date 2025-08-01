import React from 'react';

interface SprintIconProps {
  className?: string;
  size?: number;
}

export const SprintIcon: React.FC<SprintIconProps> = ({ 
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
      {/* Календарь - основная часть */}
      {/* Верхняя часть календаря с кольцами */}
      <rect
        x="4"
        y="3"
        width="16"
        height="4"
        rx="1"
        fill="#ff6b35"
        stroke="#e55a2b"
        strokeWidth="0.5"
      />
      
      {/* Серебристые кольца */}
      <circle
        cx="7"
        cy="5"
        r="0.8"
        fill="#c0c0c0"
        stroke="#a0a0a0"
        strokeWidth="0.3"
      />
      <circle
        cx="12"
        cy="5"
        r="0.8"
        fill="#c0c0c0"
        stroke="#a0a0a0"
        strokeWidth="0.3"
      />
      <circle
        cx="17"
        cy="5"
        r="0.8"
        fill="#c0c0c0"
        stroke="#a0a0a0"
        strokeWidth="0.3"
      />
      
      {/* Основная часть календаря */}
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="1"
        fill="#f5f5dc"
        stroke="#d4d4b0"
        strokeWidth="0.5"
      />
      
      {/* Сетка календаря */}
      <rect
        x="5"
        y="8"
        width="14"
        height="10"
        fill="none"
        stroke="#d4d4b0"
        strokeWidth="0.3"
      />
      
      {/* Горизонтальные линии сетки */}
      <line x1="5" y1="9.5" x2="19" y2="9.5" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="5" y1="11" x2="19" y2="11" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="5" y1="12.5" x2="19" y2="12.5" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="5" y1="14" x2="19" y2="14" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="5" y1="15.5" x2="19" y2="15.5" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="5" y1="17" x2="19" y2="17" stroke="#d4d4b0" strokeWidth="0.3" />
      
      {/* Вертикальные линии сетки */}
      <line x1="7.5" y1="8" x2="7.5" y2="18" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="10" y1="8" x2="10" y2="18" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="12.5" y1="8" x2="12.5" y2="18" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="15" y1="8" x2="15" y2="18" stroke="#d4d4b0" strokeWidth="0.3" />
      <line x1="17.5" y1="8" x2="17.5" y2="18" stroke="#d4d4b0" strokeWidth="0.3" />
      
      {/* Выделенные ячейки (светло-голубые) */}
      <rect x="5.5" y="8.5" width="1.5" height="1" fill="#87ceeb" opacity="0.7" />
      <rect x="8" y="8.5" width="1.5" height="1" fill="#87ceeb" opacity="0.7" />
      <rect x="10.5" y="8.5" width="1.5" height="1" fill="#87ceeb" opacity="0.7" />
      <rect x="13" y="8.5" width="1.5" height="1" fill="#87ceeb" opacity="0.7" />
      <rect x="15.5" y="8.5" width="1.5" height="1" fill="#87ceeb" opacity="0.7" />
      <rect x="18" y="8.5" width="1.5" height="1" fill="#87ceeb" opacity="0.7" />
      
      {/* Оранжевая полоса события */}
      <rect x="13" y="16.5" width="3" height="0.8" fill="#ff6b35" />
      
      {/* Часы - справа внизу */}
      {/* Ободок часов */}
      <circle
        cx="18"
        cy="16"
        r="2.5"
        fill="#f5f5dc"
        stroke="#a0a0a0"
        strokeWidth="0.5"
      />
      
      {/* Циферблат */}
      <circle
        cx="18"
        cy="16"
        r="2"
        fill="#f5f5dc"
        stroke="#d4d4b0"
        strokeWidth="0.3"
      />
      
      {/* Метки часов */}
      <line x1="18" y1="14.2" x2="18" y2="14.6" stroke="#000" strokeWidth="0.4" />
      <line x1="19.8" y1="16" x2="19.4" y2="16" stroke="#000" strokeWidth="0.4" />
      <line x1="18" y1="17.8" x2="18" y2="17.4" stroke="#000" strokeWidth="0.4" />
      <line x1="16.2" y1="16" x2="16.6" y2="16" stroke="#000" strokeWidth="0.4" />
      
      {/* Стрелки часов (10:10) */}
      <line
        x1="18"
        y1="16"
        x2="18"
        y2="14.5"
        stroke="#000"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="16"
        x2="19.2"
        y2="16.8"
        stroke="#000"
        strokeWidth="0.4"
        strokeLinecap="round"
      />
      
      {/* Центральная точка часов */}
      <circle
        cx="18"
        cy="16"
        r="0.2"
        fill="#000"
      />
      
      {/* Тени для 3D эффекта */}
      <rect
        x="4.5"
        y="7.5"
        width="15"
        height="11"
        rx="0.5"
        fill="none"
        stroke="#000"
        strokeWidth="0.1"
        opacity="0.1"
      />
    </svg>
  );
};

export default SprintIcon; 