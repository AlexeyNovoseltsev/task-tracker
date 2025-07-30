import { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { useAppStore } from '@/store';
import { useToast } from '@/hooks/useToast';
import { Sprint } from '@/types';
import { Button } from '@/components/ui/button';
import { SprintCard } from '@/components/sprint/SprintCard';
import { SprintModal } from '@/components/sprint/SprintModal';

export function SprintsPage() {
  const { sprints, selectedProjectId, updateSprint } = useAppStore();
  const { toast } = useToast();
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'active' | 'completed'>('all');

  // Filter sprints for selected project
  const projectSprints = selectedProjectId 
    ? sprints.filter(sprint => sprint.projectId === selectedProjectId)
    : sprints;

  // Apply filters
  const filteredSprints = projectSprints.filter(sprint => {
    const matchesSearch = sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sprint.goal && sprint.goal.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group sprints by status
  const sprintsByStatus = {
    active: filteredSprints.filter(s => s.status === 'active'),
    planned: filteredSprints.filter(s => s.status === 'planned'),
    completed: filteredSprints.filter(s => s.status === 'completed'),
  };

  const handleCreateSprint = () => {
    if (!selectedProjectId) {
      toast.warning('Please select a project first to create a sprint');
      return;
    }
    setEditingSprint(null);
    setIsSprintModalOpen(true);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsSprintModalOpen(true);
  };

  const handleStartSprint = (sprintId: string) => {
    try {
      const sprint = sprints.find(s => s.id === sprintId);
      if (!sprint) return;

      // Check if there's already an active sprint
      const activeSprints = projectSprints.filter(s => s.status === 'active');
      if (activeSprints.length > 0) {
        toast.warning('Only one sprint can be active at a time. Please complete the current active sprint first.', {
          duration: 6000,
        });
        return;
      }

      updateSprint(sprintId, { status: 'active' });
      toast.sprintStarted(sprint.name);
    } catch (error) {
      console.error('Error starting sprint:', error);
      toast.error('Failed to start sprint');
    }
  };

  const handleCompleteSprint = (sprintId: string) => {
    try {
      const sprint = sprints.find(s => s.id === sprintId);
      if (!sprint) return;

      updateSprint(sprintId, { status: 'completed' });
      toast.sprintCompleted(sprint.name);
    } catch (error) {
      console.error('Error completing sprint:', error);
      toast.error('Failed to complete sprint');
    }
  };

  const getStatusCount = (status: string) => {
    return sprintsByStatus[status as keyof typeof sprintsByStatus]?.length || 0;
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600 max-w-md">
            Please select a project from the sidebar to manage sprints.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sprint Management</h1>
          <p className="text-muted-foreground mt-1">
            Plan, track, and manage your project sprints
          </p>
        </div>
        <Button onClick={handleCreateSprint} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Sprint</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sprints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Sprints ({filteredSprints.length})</option>
          <option value="active">Active ({getStatusCount('active')})</option>
          <option value="planned">Planned ({getStatusCount('planned')})</option>
          <option value="completed">Completed ({getStatusCount('completed')})</option>
        </select>
      </div>

      {/* Sprint Sections */}
      {filteredSprints.length > 0 ? (
        <div className="space-y-8">
          {/* Active Sprints */}
          {sprintsByStatus.active.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                Active Sprints ({sprintsByStatus.active.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sprintsByStatus.active.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={handleEditSprint}
                    onComplete={handleCompleteSprint}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Planned Sprints */}
          {sprintsByStatus.planned.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
                Planned Sprints ({sprintsByStatus.planned.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sprintsByStatus.planned.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={handleEditSprint}
                    onStart={handleStartSprint}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Completed Sprints */}
          {sprintsByStatus.completed.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                Completed Sprints ({sprintsByStatus.completed.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sprintsByStatus.completed.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={handleEditSprint}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No Matching Sprints' : 'No Sprints Yet'}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters to find the sprints you\'re looking for.'
              : 'Get started by creating your first sprint to organize and track your project work.'
            }
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <Button onClick={handleCreateSprint} size="lg" className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create Your First Sprint</span>
            </Button>
          )}
        </div>
      )}

      {/* Sprint Modal */}
      <SprintModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        sprint={editingSprint}
      />
    </div>
  );
} 