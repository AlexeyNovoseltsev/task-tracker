import { useState } from "react";
import { Task, User, Comment, Activity, Attachment, TaskLink, TimeEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { useToast } from "@/hooks/useToast";
import {
  X,
  Edit,
  Calendar,
  Clock,
  User as UserIcon,
  Flag,
  Tag,
  MessageSquare,
  Activity as ActivityIcon,
  Paperclip,
  Link,
  Timer,
  Play,
  Pause,
  Plus,
  MoreHorizontal,
  CheckSquare,
  AlertCircle,
  Star,
  Users,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Archive,
  Move,
  FileText,
  Image,
  File,
  ExternalLink
} from "lucide-react";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  const { users, updateTask, projects, deleteTask } = useAppStore();
  const { success, error } = useToast();
  
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity' | 'attachments' | 'links' | 'time'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [timeDescription, setTimeDescription] = useState("");
  const [timeHours, setTimeHours] = useState("");

  if (!isOpen || !task) return null;

  const project = projects.find(p => p.id === task.projectId);
  const assignee = users.find(u => u.id === task.assigneeId);
  const reporter = users.find(u => u.id === task.reporterId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20';
      default: return 'border-gray-300 bg-gray-50 text-gray-700 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'in-review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const tabs = [
    { id: 'details', label: 'Детали', icon: FileText },
    { id: 'comments', label: 'Комментарии', icon: MessageSquare },
    { id: 'activity', label: 'Активность', icon: ActivityIcon },
    { id: 'attachments', label: 'Вложения', icon: Paperclip },
    { id: 'links', label: 'Связи', icon: Link },
    { id: 'time', label: 'Время', icon: Timer }
  ];

  const handleStartTracking = () => {
    setIsTracking(true);
    success("⏱️ Отслеживание времени запущено");
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    success("⏹️ Отслеживание времени остановлено");
  };

  const handleLogTime = () => {
    if (!timeHours || !timeDescription) {
      error("Заполните описание и количество часов");
      return;
    }
    
    // Here we would normally save time entry to store
    success(`🕐 Зарегистрировано ${timeHours} ч: ${timeDescription}`);
    setTimeDescription("");
    setTimeHours("");
  };

  const handleWatchTask = () => {
    // Here we would normally add/remove watcher
    success("👁️ Вы подписались на уведомления по задаче");
  };

  const mockComments: Comment[] = [
    {
      id: '1',
      content: 'Начал работу над этой задачей. Изучаю требования.',
      taskId: task.id,
      authorId: 'user1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      content: 'Возникли вопросы по UX. Нужно уточнить у дизайнера.',
      taskId: task.id,
      authorId: 'user2',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  const mockActivity: Activity[] = [
    {
      id: '1',
      type: 'created',
      description: 'создал задачу',
      taskId: task.id,
      userId: 'user1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'assigned',
      description: 'назначил исполнителем Александра Петрова',
      taskId: task.id,
      userId: 'user1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'status_changed',
      description: 'изменил статус с "К выполнению" на "В работе"',
      taskId: task.id,
      userId: 'user2',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  const mockAttachments: Attachment[] = [
    {
      id: '1',
      name: 'design-mockup.figma',
      size: 2048576,
      type: 'application/figma',
      url: '#',
      taskId: task.id,
      uploadedBy: 'user1',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'requirements.pdf',
      size: 512000,
      type: 'application/pdf',
      url: '#',
      taskId: task.id,
      uploadedBy: 'user2',
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)} border`}>
              <Flag className="h-3 w-3 inline mr-1" />
              {task.priority === 'urgent' ? 'Критический' : 
               task.priority === 'high' ? 'Высокий' :
               task.priority === 'medium' ? 'Средний' : 'Низкий'}
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status === 'todo' ? 'К выполнению' :
               task.status === 'in-progress' ? 'В работе' :
               task.status === 'in-review' ? 'На проверке' : 'Готово'}
            </div>
            <span className="text-sm text-muted-foreground">
              {project?.key}-{task.id.slice(-4).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWatchTask}
            >
              <Eye className="h-4 w-4 mr-1" />
              Следить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Редактировать
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Title */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {task.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Создано {formatDate(task.createdAt)}</span>
                <span>•</span>
                <span>Обновлено {formatDate(task.updatedAt)}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-auto">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Описание</h3>
                    <div className="prose dark:prose-invert max-w-none">
                      {task.description || (
                        <p className="text-muted-foreground italic">
                          Описание отсутствует
                        </p>
                      )}
                    </div>
                  </div>

                  {task.labels.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Метки</h3>
                      <div className="flex flex-wrap gap-2">
                        {task.labels.map((label, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                          >
                            <Tag className="h-3 w-3 inline mr-1" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* New Comment */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Добавить комментарий..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <Button size="sm">
                        Отправить
                      </Button>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-4">
                    {mockComments.map((comment) => {
                      const author = users.find(u => u.id === comment.authorId);
                      return (
                        <div key={comment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {author?.name || 'Неизвестный пользователь'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100">
                            {comment.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {mockActivity.map((activity) => {
                    const user = users.find(u => u.id === activity.userId);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <ActivityIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">
                              {user?.name || 'Неизвестный пользователь'}
                            </span>
                            {' '}
                            <span className="text-muted-foreground">
                              {activity.description}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-2">
                      Перетащите файлы сюда или нажмите для выбора
                    </p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Выбрать файлы
                    </Button>
                  </div>

                  {/* Attachments List */}
                  <div className="space-y-3">
                    {mockAttachments.map((attachment) => {
                      const uploader = users.find(u => u.id === attachment.uploadedBy);
                      return (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(attachment.type)}
                            <div>
                              <p className="font-medium">{attachment.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(attachment.size)} • 
                                Загрузил {uploader?.name} • 
                                {formatDate(attachment.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Связанные задачи</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Связать задачу
                    </Button>
                  </div>
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <Link className="h-8 w-8 mx-auto mb-2" />
                    <p>Нет связанных задач</p>
                  </div>
                </div>
              )}

              {activeTab === 'time' && (
                <div className="space-y-6">
                  {/* Time Tracking Controls */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Отслеживание времени</h3>
                      {isTracking ? (
                        <Button onClick={handleStopTracking} variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-2" />
                          Остановить
                        </Button>
                      ) : (
                        <Button onClick={handleStartTracking} size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Запустить
                        </Button>
                      )}
                    </div>
                    
                    {isTracking && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-500">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600 font-medium">
                            Время отслеживается: 00:42:15
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Log Time */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Зарегистрировать время</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Описание работы
                        </label>
                        <input
                          type="text"
                          value={timeDescription}
                          onChange={(e) => setTimeDescription(e.target.value)}
                          placeholder="Что было сделано..."
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Часы
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={timeHours}
                            onChange={(e) => setTimeHours(e.target.value)}
                            placeholder="2.5"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleLogTime} className="w-full">
                            Зарегистрировать
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-primary">
                        {task.estimatedHours || 0}ч
                      </div>
                      <div className="text-sm text-muted-foreground">Оценка</div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border text-center">
                      <div className="text-2xl font-bold text-primary">
                        {task.loggedHours || 0}ч
                      </div>
                      <div className="text-sm text-muted-foreground">Затрачено</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-6">
              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Исполнитель
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">
                    {assignee?.name || 'Не назначен'}
                  </span>
                </div>
              </div>

              {/* Reporter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Автор
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">
                    {reporter?.name || 'Неизвестно'}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Дата выполнения
                </label>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {task.dueDate ? formatDate(task.dueDate) : 'Не установлена'}
                  </span>
                </div>
              </div>

              {/* Story Points */}
              {task.storyPoints && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Story Points
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {task.storyPoints}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Проект
                </label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project?.color }}
                  />
                  <span className="font-medium">{project?.name}</span>
                </div>
              </div>

              {/* Watchers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Наблюдатели
                </label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {task.watchers?.length || 0} человек
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Copy className="h-4 w-4 mr-2" />
                    Дублировать
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Move className="h-4 w-4 mr-2" />
                    Переместить
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Archive className="h-4 w-4 mr-2" />
                    Архивировать
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}