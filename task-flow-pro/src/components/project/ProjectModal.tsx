import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { useToast } from "@/hooks/useToast";
import { X, Folder, Palette, Key } from "lucide-react";
import type { Project } from "@/types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  key: string;
  color: string;
}

const projectColors = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
];

export function ProjectModal({ isOpen, onClose, projectId }: ProjectModalProps) {
  const { projects, addProject, updateProject, setSelectedProject } = useAppStore();
  const { success, error } = useToast();
  
  const existingProject = projectId ? projects.find(p => p.id === projectId) : null;
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: "",
      description: "",
      key: "",
      color: projectColors[0],
    }
  });

  useEffect(() => {
    if (existingProject) {
      reset({
        name: existingProject.name,
        description: existingProject.description || "",
        key: existingProject.key,
        color: existingProject.color,
      });
    } else {
      reset({
        name: "",
        description: "",
        key: "",
        color: projectColors[Math.floor(Math.random() * projectColors.length)],
      });
    }
  }, [existingProject, reset, isOpen]);

  // Auto-generate project key from name
  useEffect(() => {
    const name = watch("name");
    if (name && !existingProject) {
      const key = name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .split(" ")
        .map(word => word.slice(0, 3))
        .join("")
        .slice(0, 6);
      setValue("key", key);
    }
  }, [watch("name"), setValue, existingProject]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Check for duplicate project key
      const existingKeyProject = projects.find(p => 
        p.key.toLowerCase() === data.key.toLowerCase() && p.id !== projectId
      );
      
      if (existingKeyProject) {
        error("Project key already exists. Please choose a different key.");
        return;
      }

      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        key: data.key.toUpperCase().trim(),
        color: data.color,
      };

      if (projectId) {
        updateProject(projectId, projectData);
        success("✅ Project updated successfully!");
      } else {
        addProject(projectData);
        // Auto-select the new project
        setTimeout(() => {
          const newProject = projects.find(p => p.key === projectData.key);
          if (newProject) {
            setSelectedProject(newProject.id);
          }
        }, 100);
        success("🎉 Project created successfully!");
      }
      
      onClose();
    } catch (err) {
      error("Failed to save project. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(onSubmit)();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modalIn"
        onKeyDown={handleKeyDown}
      >
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: watch("color") || projectColors[0] }}
            >
              <Folder className="h-3 w-3 text-white" />
            </div>
            <h2 className="text-xl font-semibold">
              {projectId ? "Edit Project" : "Create New Project"}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { 
                required: "Project name is required",
                minLength: { value: 3, message: "Name must be at least 3 characters" },
                maxLength: { value: 50, message: "Name must be less than 50 characters" }
              })}
              className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter project name..."
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Project Key */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
              <Key className="h-4 w-4" />
              <span>Project Key <span className="text-red-500">*</span></span>
            </label>
            <input
              {...register("key", { 
                required: "Project key is required",
                pattern: {
                  value: /^[A-Z0-9]{2,6}$/,
                  message: "Key must be 2-6 uppercase letters/numbers"
                }
              })}
              className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              placeholder="PROJ"
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.key && (
              <p className="text-red-500 text-sm mt-1">{errors.key.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Unique identifier for tasks (e.g., PROJ-123)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register("description")}
              className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
              placeholder="Describe your project..."
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
              <Palette className="h-4 w-4" />
              <span>Project Color</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {projectColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                    watch("color") === color 
                      ? "border-gray-900 dark:border-gray-100 shadow-lg" 
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {watch("color") === color && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {watch("name") && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-3">Preview:</h4>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: watch("color") }}
                >
                  <Folder className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold">{watch("name")}</h5>
                  <p className="text-sm text-muted-foreground">
                    {watch("key") && `${watch("key")} •`} 
                    {watch("description") || "No description"}
                  </p>
                </div>
              </div>
              {watch("key") && (
                <div className="mt-3 p-2 bg-background rounded border">
                  <p className="text-xs text-muted-foreground mb-1">Sample task keys:</p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                      {watch("key")}-1
                    </span>
                    <span className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                      {watch("key")}-42
                    </span>
                    <span className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                      {watch("key")}-123
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              💡 Tip: Use Ctrl+Enter to save quickly
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Saving..." : (projectId ? "Update Project" : "Create Project")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}