import React, { useState } from 'react';
import { ColorPicker, CompactColorPicker } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ColorPickerDemo() {
  const [selectedColor, setSelectedColor] = useState('#667eea');
  const [compactColor, setCompactColor] = useState('#f093fb');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎨 Современный выбор цвета 2025</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Новые компоненты с градиентами, природными оттенками и неоновыми акцентами
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Полный ColorPicker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎨</span>
              <span>Полный ColorPicker</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Выберите цвет карточки</label>
              <ColorPicker
                value={selectedColor}
                onChange={setSelectedColor}
                className="w-full"
              />
            </div>
            
            <div className="p-4 rounded-lg border" style={{ backgroundColor: selectedColor }}>
              <h3 className="font-medium text-white mb-2">Предпросмотр карточки</h3>
              <p className="text-white/80 text-sm">
                Это как будет выглядеть ваша карточка с выбранным цветом
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CompactColorPicker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Компактный ColorPicker</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Размеры:</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">SM:</span>
                  <CompactColorPicker
                    value={compactColor}
                    onChange={setCompactColor}
                    size="sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">MD:</span>
                  <CompactColorPicker
                    value={compactColor}
                    onChange={setCompactColor}
                    size="md"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">LG:</span>
                  <CompactColorPicker
                    value={compactColor}
                    onChange={setCompactColor}
                    size="lg"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border" style={{ backgroundColor: compactColor }}>
              <h3 className="font-medium text-white mb-2">Компактный предпросмотр</h3>
              <p className="text-white/80 text-sm">
                Идеально для карточек и компактных интерфейсов
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Особенности дизайна */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Особенности дизайна 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">🎨 Градиенты</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Современные градиенты создают глубину и визуальный интерес
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">🌿 Природные оттенки</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Цвета вдохновленные природой для гармоничного интерфейса
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">⚡ Неоновые акценты</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Яркие неоновые цвета для динамичных элементов
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Цветовая палитра */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 Доступные цвета</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { name: 'Lavender', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
              { name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
              { name: 'Ocean', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
              { name: 'Mint', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
              { name: 'Peach', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
              { name: 'Mocha', gradient: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)' },
              { name: 'Neon Pink', gradient: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)' },
              { name: 'Neon Cyan', gradient: 'linear-gradient(135deg, #00CED1 0%, #40E0D0 100%)' },
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-2 shadow-md"
                  style={{ background: color.gradient }}
                />
                <p className="text-xs font-medium">{color.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
