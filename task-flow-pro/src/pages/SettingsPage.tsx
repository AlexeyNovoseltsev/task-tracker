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
import { useState } from "react";

import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { useAppStore } from "@/store";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();
  const { settings, updateSettings, resetSettings } = useAppStore();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

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

  const handleUpdateSetting = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
    success("Настройка обновлена");
  };

  const handleResetSettings = () => {
    resetSettings();
    success("Настройки сброшены к значениям по умолчанию");
    setIsResetConfirmOpen(false);
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
            <Select value={settings.language} onValueChange={(value) => handleUpdateSetting('language', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Часовой пояс</label>
            <Select value={settings.timezone} onValueChange={(value) => handleUpdateSetting('timezone', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Moscow">Москва (GMT+3)</SelectItem>
                <SelectItem value="Europe/London">Лондон (GMT+0)</SelectItem>
                <SelectItem value="America/New_York">Нью-Йорк (GMT-5)</SelectItem>
                <SelectItem value="Asia/Tokyo">Токио (GMT+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Формат даты</label>
              <Select value={settings.dateFormat} onValueChange={(value) => handleUpdateSetting('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD.MM.YYYY">ДД.ММ.ГГГГ</SelectItem>
                  <SelectItem value="MM/DD/YYYY">ММ/ДД/ГГГГ</SelectItem>
                  <SelectItem value="YYYY-MM-DD">ГГГГ-ММ-ДД</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Формат времени</label>
              <Select value={settings.timeFormat} onValueChange={(value) => handleUpdateSetting('timeFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24-часовой</SelectItem>
                  <SelectItem value="12h">12-часовой</SelectItem>
                </SelectContent>
              </Select>
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
          <SettingsToggle
            checked={settings.pushNotifications}
            onChange={(checked) => handleUpdateSetting('pushNotifications', checked)}
            label="Push-уведомления"
            description="Получать уведомления на рабочем столе"
          />
          
          <SettingsToggle
            checked={settings.emailNotifications}
            onChange={(checked) => handleUpdateSetting('emailNotifications', checked)}
            label="Email-уведомления"
            description="Получать уведомления на электронную почту"
          />
          
          <SettingsToggle
            checked={settings.soundEnabled}
            onChange={(checked) => handleUpdateSetting('soundEnabled', checked)}
            label="Звуковые уведомления"
            description="Воспроизводить звуки при получении уведомлений"
          />
          
          <hr className="my-4" />
          
          <h4 className="font-medium">Типы уведомлений</h4>
          
          <SettingsToggle
            checked={settings.taskReminders}
            onChange={(checked) => handleUpdateSetting('taskReminders', checked)}
            label="Напоминания о задачах"
            description="Уведомления о приближающихся дедлайнах"
          />
          
          <SettingsToggle
            checked={settings.projectUpdates}
            onChange={(checked) => handleUpdateSetting('projectUpdates', checked)}
            label="Обновления проектов"
            description="Уведомления об изменениях в проектах"
          />
          
          <SettingsToggle
            checked={settings.mentionNotifications}
            onChange={(checked) => handleUpdateSetting('mentionNotifications', checked)}
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
            <Select value={settings.profileVisibility} onValueChange={(value) => handleUpdateSetting('profileVisibility', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Публичный</SelectItem>
                <SelectItem value="team">Только команда</SelectItem>
                <SelectItem value="private">Приватный</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Кто может видеть информацию вашего профиля
            </p>
          </div>
          
          <SettingsToggle
            checked={settings.activityTracking}
            onChange={(checked) => handleUpdateSetting('activityTracking', checked)}
            label="Отслеживание активности"
            description="Позволить отслеживать время работы для аналитики"
          />
          
          <SettingsToggle
            checked={settings.dataCollection}
            onChange={(checked) => handleUpdateSetting('dataCollection', checked)}
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
          Настройки интерфейса
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
                  onClick={() => handleUpdateSetting('theme', value)}
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
          
          <SettingsToggle
            checked={settings.showStoryPoints}
            onChange={(checked) => handleUpdateSetting('showStoryPoints', checked)}
            label="Показывать Story Points"
            description="Отображать story points в задачах и аналитике"
          />
          
          <SettingsToggle
            checked={settings.compactMode}
            onChange={(checked) => handleUpdateSetting('compactMode', checked)}
            label="Компактный режим"
            description="Уменьшить отступы и размеры элементов"
          />
          
          <SettingsToggle
            checked={settings.showAvatars}
            onChange={(checked) => handleUpdateSetting('showAvatars', checked)}
            label="Показывать аватары"
            description="Отображать фотографии пользователей"
          />
          
          <SettingsToggle
            checked={settings.animationsEnabled}
            onChange={(checked) => handleUpdateSetting('animationsEnabled', checked)}
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
          <SettingsToggle
            checked={settings.autoSave}
            onChange={(checked) => handleUpdateSetting('autoSave', checked)}
            label="Автосохранение"
            description="Автоматически сохранять изменения"
          />
          
          <SettingsToggle
            checked={settings.autoBackup}
            onChange={(checked) => handleUpdateSetting('autoBackup', checked)}
            label="Автоматическое резервное копирование"
            description="Создавать резервные копии данных"
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Размер кэша</label>
            <Select value={settings.cacheSize} onValueChange={(value) => handleUpdateSetting('cacheSize', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50MB">50 МБ</SelectItem>
                <SelectItem value="100MB">100 МБ</SelectItem>
                <SelectItem value="200MB">200 МБ</SelectItem>
                <SelectItem value="500MB">500 МБ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Интервал синхронизации</label>
            <Select value={settings.syncInterval} onValueChange={(value) => handleUpdateSetting('syncInterval', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1min">1 минута</SelectItem>
                <SelectItem value="5min">5 минут</SelectItem>
                <SelectItem value="15min">15 минут</SelectItem>
                <SelectItem value="30min">30 минут</SelectItem>
              </SelectContent>
            </Select>
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
          
          <SettingsToggle
            checked={settings.autoExportBackups}
            onChange={(checked) => handleUpdateSetting('autoExportBackups', checked)}
            label="Автоматический экспорт резервных копий"
            description="Еженедельно создавать резервные копии"
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Формат экспорта</label>
            <Select value={settings.exportFormat} onValueChange={(value) => handleUpdateSetting('exportFormat', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <SettingsToggle
            checked={settings.includeAttachments}
            onChange={(checked) => handleUpdateSetting('includeAttachments', checked)}
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
            onClick={() => setIsResetConfirmOpen(true)}
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
              onClick={() => setIsResetConfirmOpen(true)}
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

      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetSettings}
        title="Сбросить все настройки?"
        description="Это действие нельзя отменить. Все ваши настройки будут сброшены к значениям по умолчанию."
        confirmText="Да, сбросить"
      />
    </div>
  );
}

const SettingsToggle = ({ checked, onChange, label, description }: {
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
    <ToggleSwitch
      checked={checked}
      onCheckedChange={onChange}
    />
  </div>
);