import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Download, 
  Bell, 
  Keyboard,
  Info,
  Trash2
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { ExportImport } from '@/components/settings/ExportImport';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast, clearAllToasts } = useToast();
  const { projects, tasks, sprints, users } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleClearData = () => {
    const confirmed = confirm(
      'Are you sure you want to clear all data? This will permanently delete all projects, tasks, sprints, and users. This action cannot be undone.'
    );
    
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const testNotifications = () => {
    toast.success('Success notification test');
    toast.error('Error notification test');
    toast.warning('Warning notification test');
    toast.info('Info notification test');
  };

  const getTotalDataSize = () => {
    const totalItems = projects.length + tasks.length + sprints.length + users.length;
    return totalItems;
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your TaskFlow Pro preferences and settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                </div>

                {/* Application Info */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Application</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Version</label>
                        <p className="mt-1 text-sm text-gray-900">1.0.0</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Build</label>
                        <p className="mt-1 text-sm text-gray-900">Development</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Overview */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Data Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                      <p className="text-sm text-gray-600">Projects</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                      <p className="text-sm text-gray-600">Tasks</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{sprints.length}</p>
                      <p className="text-sm text-gray-600">Sprints</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                      <p className="text-sm text-gray-600">Users</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
                </div>

                {/* Theme Settings */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Theme
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', preview: 'bg-white border-2' },
                          { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-2' },
                          { value: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-gray-900 border-2' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value as any)}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              theme === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-full h-8 rounded mb-2 ${option.preview}`} />
                            <p className="text-sm font-medium">{option.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                </div>

                {/* Notification Settings */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Task Updates</h4>
                        <p className="text-sm text-gray-500">Get notified when tasks are created or updated</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Sprint Changes</h4>
                        <p className="text-sm text-gray-500">Get notified about sprint status changes</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">System Messages</h4>
                        <p className="text-sm text-gray-500">Show important system notifications</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <Button onClick={testNotifications} variant="outline">
                      Test Notifications
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {activeTab === 'keyboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h2>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Available Shortcuts</h3>
                  <div className="space-y-4">
                    {[
                      { action: 'Save Task/Sprint', shortcut: 'Ctrl + Enter' },
                      { action: 'Close Modal', shortcut: 'Escape' },
                      { action: 'Clear Notifications', shortcut: 'Escape' },
                      { action: 'Toggle Theme', shortcut: 'Ctrl + Shift + T' },
                      { action: 'Quick Search', shortcut: 'Ctrl + K' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-900">{item.action}</span>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                          {item.shortcut}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Data Management */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
                </div>

                {/* Export/Import */}
                <ExportImport />

                {/* Clear Data */}
                <div className="border border-red-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Clear All Data</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Permanently delete all projects, tasks, sprints, and settings. This action cannot be undone.
                      </p>
                      
                      <Button
                        onClick={handleClearData}
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Clear All Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About TaskFlow Pro</h2>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">TaskFlow Pro</h3>
                    <p className="text-lg text-gray-600 mb-4">Modern Task Management</p>
                    <p className="text-sm text-gray-500 mb-6">Version 1.0.0 - Development Build</p>
                    
                    <div className="space-y-4 text-sm text-gray-600 text-left max-w-2xl mx-auto">
                      <p>
                        <strong>TaskFlow Pro</strong> is a modern, feature-rich task management application designed 
                        specifically for Product Managers and development teams working with Agile methodologies.
                      </p>
                      
                      <h4 className="font-semibold text-gray-900 mt-6 mb-2">Key Features:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Kanban boards with drag & drop functionality</li>
                        <li>Sprint planning and management</li>
                        <li>Product backlog prioritization</li>
                        <li>Advanced analytics and reporting</li>
                        <li>Burndown charts and velocity tracking</li>
                        <li>Dark/Light theme support</li>
                        <li>Data export and import</li>
                        <li>Keyboard shortcuts</li>
                        <li>Responsive design</li>
                      </ul>
                      
                      <h4 className="font-semibold text-gray-900 mt-6 mb-2">Technology Stack:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>React 18 + TypeScript</li>
                        <li>Tailwind CSS + Radix UI</li>
                        <li>Zustand State Management</li>
                        <li>DnD Kit for Drag & Drop</li>
                        <li>Recharts for Analytics</li>
                        <li>Tauri Framework (Desktop)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 