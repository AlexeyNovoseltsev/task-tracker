import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  Database,
  Monitor,
  Moon,
  Sun,
  Search,
  Save,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  Check,
  Languages,
  Volume2,
  VolumeX,
  Clock,
  FileText,
  Key,
  Eye,
  EyeOff,
  Trash2,
  LogOut
} from "lucide-react";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();
  
  // Settings state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  const [settings, setSettings] = useState({
    // Общие настройки
    language: "ru",
    timezone: "Europe/Moscow",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "24h",
    
    // Уведомления
    pushNotifications: true,
    emailNotifications: true,
    soundEnabled: true,
    taskReminders: true,
    projectUpdates: true,
    mentionNotifications: true,
    
    // Конфиденциальность
    profileVisibility: "team",
    activityTracking: true,
    dataCollection: false,
    
    // Внешний вид
    theme: "system",
    compactMode: false,
    showAvatars: true,
    animationsEnabled: true,
    
    // Производительность
    autoSave: true,
    autoBackup: true,
    cacheSize: "100MB",
    syncInterval: "5min",
    
    // Импорт/Экспорт
    autoExportBackups: false,
    exportFormat: "json",
    includeAttachments: true
  });

  // Categories for navigation
  const categories = [
    { id: "general", name: "Общие", icon: Settings },
    { id: "profile", name: "Профиль", icon: User },
    { id: "notifications", name: "Уведомления", icon: Bell },
    { id: "privacy", name: "Конфиденциальность", icon: Shield },
    { id: "appearance", name: "Внешний вид", icon: Palette },
    { id: "performance", name: "Производительность", icon: Monitor },
    { id: "data", name: "Данные", icon: Database },
    { id: "help", name: "Справка", icon: HelpCircle }
  ];

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    success("Настройка обновлена");
  };

  const resetToDefaults = () => {
    if (window.confirm("Сбросить все настройки к значениям по умолчанию?")) {
      setSettings({
        language: "ru",
        timezone: "Europe/Moscow",
        dateFormat: "DD.MM.YYYY",
        timeFormat: "24h",
        pushNotifications: true,
        emailNotifications: true,
        soundEnabled: true,
        taskReminders: true,
        projectUpdates: true,
        mentionNotifications: true,
        profileVisibility: "team",
        activityTracking: true,
        dataCollection: false,
        theme: "system",
        compactMode: false,
        showAvatars: true,
        animationsEnabled: true,
        autoSave: true,
        autoBackup: true,
        cacheSize: "100MB",
        syncInterval: "5min",
        autoExportBackups: false,
        exportFormat: "json",
        includeAttachments: true
      });
      success("Настройки сброшены к значениям по умолчанию");
    }
  };

  const exportSettings = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success("Настройки экспортированы");
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          success("Настройки импортированы");
        } catch (err) {
          error("Ошибка при импорте настроек");
        }
      };
      reader.readAsText(file);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Региональные настройки
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Язык интерфейса</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Часовой пояс</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            >
              <option value="Europe/Moscow">Москва (GMT+3)</option>
              <option value="Europe/London">Лондон (GMT+0)</option>
              <option value="America/New_York">Нью-Йорк (GMT-5)</option>
              <option value="Asia/Tokyo">Токио (GMT+9)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Формат даты</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
              >
                <option value="DD.MM.YYYY">ДД.ММ.ГГГГ</option>
                <option value="MM/DD/YYYY">ММ/ДД/ГГГГ</option>
                <option value="YYYY-MM-DD">ГГГГ-ММ-ДД</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Формат времени</label>
              <select
                value={settings.timeFormat}
                onChange={(e) => updateSetting('timeFormat', e.target.value)}
                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
              >
                <option value="24h">24-часовой</option>
                <option value="12h">12-часовой</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Настройки уведомлений
        </h3>
        
        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.pushNotifications}
            onChange={(checked) => updateSetting('pushNotifications', checked)}
            label="Push-уведомления"
            description="Получать уведомления на рабочем столе"
          />
          
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={(checked) => updateSetting('emailNotifications', checked)}
            label="Email-уведомления"
            description="Получать уведомления на электронную почту"
          />
          
          <ToggleSwitch
            checked={settings.soundEnabled}
            onChange={(checked) => updateSetting('soundEnabled', checked)}
            label="Звуковые уведомления"
            description="Воспроизводить звуки при получении уведомлений"
          />
          
          <hr className="my-4" />
          
          <h4 className="font-medium">Типы уведомлений</h4>
          
          <ToggleSwitch
            checked={settings.taskReminders}
            onChange={(checked) => updateSetting('taskReminders', checked)}
            label="Напоминания о задачах"
            description="Уведомления о приближающихся дедлайнах"
          />
          
          <ToggleSwitch
            checked={settings.projectUpdates}
            onChange={(checked) => updateSetting('projectUpdates', checked)}
            label="Обновления проектов"
            description="Уведомления об изменениях в проектах"
          />
          
          <ToggleSwitch
            checked={settings.mentionNotifications}
            onChange={(checked) => updateSetting('mentionNotifications', checked)}
            label="Упоминания"
            description="Уведомления когда вас упоминают в комментариях"
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Конфиденциальность и безопасность
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Видимость профиля</label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => updateSetting('profileVisibility', e.target.value)}
              className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            >
              <option value="public">Публичный</option>
              <option value="team">Только команда</option>
              <option value="private">Приватный</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              Кто может видеть информацию вашего профиля
            </p>
          </div>
          
          <ToggleSwitch
            checked={settings.activityTracking}
            onChange={(checked) => updateSetting('activityTracking', checked)}
            label="Отслеживание активности"
            description="Позволить отслеживать время работы для аналитики"
          />
          
          <ToggleSwitch
            checked={settings.dataCollection}
            onChange={(checked) => updateSetting('dataCollection', checked)}
            label="Сбор данных для улучшения продукта"
            description="Отправлять анонимные данные использования"
          />
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Безопасность аккаунта
        </h3>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Key className="h-4 w-4 mr-2" />
            Изменить пароль
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Shield className="h-4 w-4 mr-2" />
            Настроить двухфакторную аутентификацию
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Журнал активности
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Внешний вид
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Тема оформления</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: 'Светлая', icon: Sun },
                { value: 'dark', label: 'Темная', icon: Moon },
                { value: 'system', label: 'Системная', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('theme', value)}
                  className={`p-3 border rounded-md flex flex-col items-center gap-2 transition-colors ${
                    settings.theme === value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-input hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <ToggleSwitch
            checked={settings.compactMode}
            onChange={(checked) => updateSetting('compactMode', checked)}
            label="Компактный режим"
            description="Уменьшить отступы и размеры элементов"
          />
          
          <ToggleSwitch
            checked={settings.showAvatars}
            onChange={(checked) => updateSetting('showAvatars', checked)}
            label="Показывать аватары"
            description="Отображать фотографии пользователей"
          />
          
          <ToggleSwitch
            checked={settings.animationsEnabled}
            onChange={(checked) => updateSetting('animationsEnabled', checked)}
            label="Анимации"
            description="Включить анимации переходов и эффектов"
          />
        </div>
      </div>
    </div>
  );

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Производительность
        </h3>
        
        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.autoSave}
            onChange={(checked) => updateSetting('autoSave', checked)}
            label="Автосохранение"
            description="Автоматически сохранять изменения"
          />
          
          <ToggleSwitch
            checked={settings.autoBackup}
            onChange={(checked) => updateSetting('autoBackup', checked)}
            label="Автоматическое резервное копирование"
            description="Создавать резервные копии данных"
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Размер кэша</label>
            <select
              value={settings.cacheSize}
              onChange={(e) => updateSetting('cacheSize', e.target.value)}
              className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            >
              <option value="50MB">50 МБ</option>
              <option value="100MB">100 МБ</option>
              <option value="200MB">200 МБ</option>
              <option value="500MB">500 МБ</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Интервал синхронизации</label>
            <select
              value={settings.syncInterval}
              onChange={(e) => updateSetting('syncInterval', e.target.value)}
              className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            >
              <option value="1min">1 минута</option>
              <option value="5min">5 минут</option>
              <option value="15min">15 минут</option>
              <option value="30min">30 минут</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Управление данными
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={exportSettings} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Экспорт настроек
            </Button>
            
            <div className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
                id="import-settings"
              />
              <Button
                onClick={() => document.getElementById('import-settings')?.click()}
                variant="outline"
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                Импорт настроек
              </Button>
            </div>
          </div>
          
          <ToggleSwitch
            checked={settings.autoExportBackups}
            onChange={(checked) => updateSetting('autoExportBackups', checked)}
            label="Автоматический экспорт резервных копий"
            description="Еженедельно создавать резервные копии"
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Формат экспорта</label>
            <select
              value={settings.exportFormat}
              onChange={(e) => updateSetting('exportFormat', e.target.value)}
              className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-ring"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
            </select>
          </div>
          
          <ToggleSwitch
            checked={settings.includeAttachments}
            onChange={(checked) => updateSetting('includeAttachments', checked)}
            label="Включать вложения в экспорт"
            description="Экспортировать файлы и изображения"
          />
        </div>
      </div>
      
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold mb-4 text-red-900 dark:text-red-100 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Опасная зона
        </h3>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Очистить кэш
          </Button>
          
          <Button 
            onClick={resetToDefaults}
            variant="outline" 
            className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Сбросить настройки
          </Button>
          
          <Button variant="outline" className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />
            Удалить аккаунт
          </Button>
        </div>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Справка и поддержка
        </h3>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Руководство пользователя
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Часто задаваемые вопросы
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Связаться с поддержкой
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Диагностика системы
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">О приложении</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>Версия: 1.0.0</div>
          <div>Последнее обновление: 15 января 2025</div>
          <div>© 2025 TaskFlow Pro</div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case "general": return renderGeneralSettings();
      case "profile": return renderGeneralSettings(); // Можно добавить отдельную страницу профиля
      case "notifications": return renderNotificationSettings();
      case "privacy": return renderPrivacySettings();
      case "appearance": return renderAppearanceSettings();
      case "performance": return renderPerformanceSettings();
      case "data": return renderDataSettings();
      case "help": return renderHelpSettings();
      default: return renderGeneralSettings();
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <div className="w-80 border-r bg-card/50 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Настройки</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск настроек..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        
        {/* Navigation Categories */}
        <nav className="flex-1 px-4 pb-4">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Footer Actions */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button 
              onClick={resetToDefaults}
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Сброс
            </Button>
            <Button 
              onClick={exportSettings}
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 