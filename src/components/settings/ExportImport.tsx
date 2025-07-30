import { useState, useRef } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';

interface ExportData {
  version: string;
  exportDate: string;
  projects: any[];
  tasks: any[];
  sprints: any[];
  users: any[];
}

export function ExportImport() {
  const { projects, tasks, sprints, users, addProject, addTask, addSprint, addUser } = useAppStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      const exportData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        projects,
        tasks,
        sprints,
        users,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully! Check your downloads folder.', {
        duration: 6000,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const fileContent = await file.text();
      const importData: ExportData = JSON.parse(fileContent);

      // Validate import data structure
      if (!importData.version || !importData.projects || !importData.tasks) {
        throw new Error('Invalid export file format');
      }

      // Import projects
      let importedCount = 0;
      
      if (importData.projects?.length > 0) {
        importData.projects.forEach(project => {
          // Generate new ID to avoid conflicts
          const newProject = {
            ...project,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(),
          };
          addProject(newProject);
          importedCount++;
        });
      }

      // Import tasks
      if (importData.tasks?.length > 0) {
        importData.tasks.forEach(task => {
          const newTask = {
            ...task,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          };
          addTask(newTask);
          importedCount++;
        });
      }

      // Import sprints
      if (importData.sprints?.length > 0) {
        importData.sprints.forEach(sprint => {
          const newSprint = {
            ...sprint,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(sprint.createdAt),
            updatedAt: new Date(sprint.updatedAt),
            startDate: new Date(sprint.startDate),
            endDate: new Date(sprint.endDate),
          };
          addSprint(newSprint);
          importedCount++;
        });
      }

      // Import users
      if (importData.users?.length > 0) {
        importData.users.forEach(user => {
          const newUser = {
            ...user,
            id: Math.random().toString(36).substr(2, 9),
          };
          addUser(newUser);
          importedCount++;
        });
      }

      toast.success(`Successfully imported ${importedCount} items from ${file.name}`, {
        duration: 6000,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const getTotalItems = () => {
    return projects.length + tasks.length + sprints.length + users.length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Export & Import</h2>
        <p className="text-sm text-gray-600">
          Backup your data or import from another TaskFlow Pro instance
        </p>
      </div>

      {/* Export Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Export Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download all your projects, tasks, sprints, and settings as a JSON file.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-gray-900">{projects.length}</p>
                  <p className="text-gray-600">Projects</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{tasks.length}</p>
                  <p className="text-gray-600">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{sprints.length}</p>
                  <p className="text-gray-600">Sprints</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{users.length}</p>
                  <p className="text-gray-600">Users</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={exportData}
              disabled={isExporting || getTotalItems() === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
            </Button>
            
            {getTotalItems() === 0 && (
              <p className="text-sm text-yellow-600 mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                No data to export. Create some projects and tasks first.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Import Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a JSON export file to restore your data or merge with existing data.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Imported data will be merged with existing data</li>
                    <li>New IDs will be generated to avoid conflicts</li>
                    <li>Only JSON files from TaskFlow Pro exports are supported</li>
                    <li>Large files may take some time to process</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
            
            <Button
              onClick={handleImportClick}
              disabled={isImporting}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{isImporting ? 'Importing...' : 'Choose File to Import'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* File Format Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Export File Format</p>
            <p className="text-xs">
              TaskFlow Pro exports data in JSON format including version info, timestamps, 
              and all your project data. Files are compatible across different TaskFlow Pro instances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 