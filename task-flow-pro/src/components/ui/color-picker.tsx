import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Palette, Sparkles } from 'lucide-react';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  className?: string;
  showCustom?: boolean;
  compact?: boolean;
}

// Современная палитра 2025 года с градиентами и природными оттенками
const MODERN_COLORS = [
  // Основные цвета с градиентами
  { value: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Lavender' },
  { value: '#f093fb', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Sunset' },
  { value: '#4facfe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Ocean' },
  { value: '#43e97b', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Mint' },
  { value: '#fa709a', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Peach' },
  { value: '#a8edea', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: 'Pastel' },
  { value: '#d299c2', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', name: 'Rose' },
  { value: '#ff9a9e', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)', name: 'Coral' },
  
  // Природные оттенки 2025
  { value: '#8B4513', gradient: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)', name: 'Mocha' }, // Pantone 2025
  { value: '#228B22', gradient: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)', name: 'Forest' },
  { value: '#4682B4', gradient: 'linear-gradient(135deg, #4682B4 0%, #87CEEB 100%)', name: 'Steel' },
  { value: '#CD853F', gradient: 'linear-gradient(135deg, #CD853F 0%, #DEB887 100%)', name: 'Sandy' },
  
  // Неоновые акценты
  { value: '#FF1493', gradient: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)', name: 'Neon Pink' },
  { value: '#00CED1', gradient: 'linear-gradient(135deg, #00CED1 0%, #40E0D0 100%)', name: 'Neon Cyan' },
  { value: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFFF00 100%)', name: 'Neon Gold' },
  { value: '#FF4500', gradient: 'linear-gradient(135deg, #FF4500 0%, #FF6347 100%)', name: 'Neon Orange' },
];

export function ColorPicker({ 
  value = '#667eea', 
  onChange, 
  className,
  showCustom = true,
  compact = false 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const selectedColor = MODERN_COLORS.find(c => c.value === value) || MODERN_COLORS[0];

  const handleColorSelect = (color: string) => {
    onChange(color);
    if (!compact) setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="flex space-x-1">
          {MODERN_COLORS.slice(0, 6).map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => handleColorSelect(color.value)}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-125 hover:shadow-lg",
                "relative overflow-hidden group",
                value === color.value 
                  ? "border-gray-900 dark:border-gray-100 shadow-lg scale-110" 
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
              )}
              style={{ 
                background: color.gradient,
                boxShadow: value === color.value ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
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
        
        {showCustom && (
          <div className="relative">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 transition-colors opacity-0 absolute inset-0"
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 transition-colors relative"
              style={{ backgroundColor: customColor }}
            >
              <Palette className="h-3 w-3 text-white absolute inset-0 m-auto drop-shadow-sm" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Триггер кнопка */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700",
          "hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200",
          "bg-white dark:bg-gray-900 hover:shadow-sm"
        )}
      >
        <div 
          className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-700"
          style={{ 
            background: selectedColor.gradient,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
        <span className="text-sm font-medium">{selectedColor.name}</span>
        <Sparkles className="h-4 w-4 text-gray-400" />
      </button>

      {/* Выпадающая панель */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Выберите цвет</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Сетка цветов */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {MODERN_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleColorSelect(color.value)}
                className={cn(
                  "relative w-12 h-12 rounded-xl border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg",
                  "group overflow-hidden",
                  value === color.value 
                    ? "border-gray-900 dark:border-gray-100 shadow-lg scale-105" 
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                )}
                style={{ 
                  background: color.gradient,
                  boxShadow: value === color.value ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
                }}
                title={color.name}
              >
                {value === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white drop-shadow-sm" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>

          {/* Кастомный цвет */}
          {showCustom && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 transition-colors opacity-0 absolute inset-0"
                />
                <div 
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-gray-400 transition-colors relative"
                  style={{ backgroundColor: customColor }}
                >
                  <Palette className="h-5 w-5 text-white absolute inset-0 m-auto drop-shadow-sm" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Кастомный цвет
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {customColor.toUpperCase()}
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
