import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';

interface CompactColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  className?: string;
  showCustom?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Оптимизированная палитра для компактного отображения
const COMPACT_COLORS = [
  { value: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Lavender' },
  { value: '#f093fb', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Sunset' },
  { value: '#4facfe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Ocean' },
  { value: '#43e97b', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Mint' },
  { value: '#fa709a', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Peach' },
  { value: '#8B4513', gradient: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)', name: 'Mocha' },
  { value: '#FF1493', gradient: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)', name: 'Neon Pink' },
  { value: '#00CED1', gradient: 'linear-gradient(135deg, #00CED1 0%, #40E0D0 100%)', name: 'Neon Cyan' },
];

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8'
};

export function CompactColorPicker({ 
  value = '#667eea', 
  onChange, 
  className,
  showCustom = true,
  size = 'md'
}: CompactColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const selectedColor = COMPACT_COLORS.find(c => c.value === value) || COMPACT_COLORS[0];

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Триггер кнопка */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative overflow-hidden rounded-full border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg",
          "group cursor-pointer",
          sizeClasses[size],
          value === selectedColor.value 
            ? "border-gray-900 dark:border-gray-100 shadow-md" 
            : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
        )}
        style={{ 
          background: selectedColor.gradient,
          boxShadow: value === selectedColor.value ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
        }}
        title={selectedColor.name}
      >
        {value === selectedColor.value && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className={cn(
              "text-white drop-shadow-sm",
              size === 'sm' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </button>

      {/* Выпадающая панель */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold">Цвет</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Сетка цветов */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {COMPACT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleColorSelect(color.value)}
                className={cn(
                  "relative w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-md",
                  "group overflow-hidden",
                  value === color.value 
                    ? "border-gray-900 dark:border-gray-100 shadow-md scale-105" 
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                )}
                style={{ 
                  background: color.gradient,
                  boxShadow: value === color.value ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                }}
                title={color.name}
              >
                {value === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white drop-shadow-sm" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>

          {/* Кастомный цвет */}
          {showCustom && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 transition-colors opacity-0 absolute inset-0"
                />
                <div 
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 transition-colors relative"
                  style={{ backgroundColor: customColor }}
                >
                  <Palette className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Свой
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay для закрытия */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
