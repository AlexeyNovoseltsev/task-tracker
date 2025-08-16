import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Sparkles, CheckSquare, Clock, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskCard } from "@/components/ui/task-card";
import { CalendarStats } from "@/components/ui/calendar-stats";
import { TaskModal } from "@/components/task/TaskModal";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

// Функция для форматирования месяца в именительном падеже
const formatMonthNominative = (date: Date) => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${year}`;
};

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  
  const { tasks, projects } = useAppStore();

  // Статистика календаря
  const calendarStats = useMemo(() => {
    const currentMonthTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.getMonth() === currentMonth.getMonth() && 
             taskDate.getFullYear() === currentMonth.getFullYear();
    });

    return {
      total: currentMonthTasks.length,
      completed: currentMonthTasks.filter(task => task.status === 'completed').length,
      inProgress: currentMonthTasks.filter(task => task.status === 'in_progress').length,
      overdue: currentMonthTasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate < new Date() && task.status !== 'completed';
      }).length
    };
  }, [tasks, currentMonth]);

  // Получаем дни месяца
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Получаем задачи для выбранной даты
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const isSameDate = isSameDay(taskDate, selectedDate);
      const matchesProject = filterProject === "all" || task.projectId === filterProject;
      
      return isSameDate && matchesProject;
    });
  }, [tasks, selectedDate, filterProject]);

  // Получаем задачи для каждого дня месяца
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const isSameDate = isSameDay(taskDate, date);
      const matchesProject = filterProject === "all" || task.projectId === filterProject;
      
      return isSameDate && matchesProject;
    });
  };

  // Навигация по месяцам
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handleCreateTask = () => {
    setEditingTaskId(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTaskId(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    const confirmed = window.confirm('Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.');
    if (confirmed) {
      const { deleteTask } = useAppStore.getState();
      deleteTask(taskId);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 max-w-full">
        {/* Заголовок */}
        <PageHeader
        title="Календарь"
        description="Планирование и управление задачами"
        icon={Calendar}
                 actions={
           <div className="flex items-center gap-2">
              <Button onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Создать задачу
              </Button>
             <Button 
               onClick={goToToday} 
               variant="outline"
               className="bg-white border-gray-200 hover:bg-gray-50"
             >
               Сегодня
             </Button>
           </div>
         }
      />

                           {/* Статистика календаря */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <CalendarStats
           title="Всего задач"
           value={calendarStats.total}
           description="В этом месяце"
           icon={CheckSquare}
           color="blue"
         />
         <CalendarStats
           title="Завершено"
           value={calendarStats.completed}
           description="Успешно выполнено"
           icon={CheckSquare}
           color="green"
         />
         <CalendarStats
           title="В работе"
           value={calendarStats.inProgress}
           description="Активные задачи"
           icon={Clock}
           color="orange"
         />
         <CalendarStats
           title="Просрочено"
           value={calendarStats.overdue}
           description="Требуют внимания"
           icon={AlertTriangle}
           color="red"
         />
       </div>

             <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  {/* Основной календарь */}
          <div className="xl:col-span-3">
           <Card className="border border-gray-200 shadow-sm">
             <CardHeader className="bg-white border-b border-gray-200">
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                   <Calendar className="h-5 w-5 text-gray-600" />
                   {formatMonthNominative(currentMonth)}
                 </CardTitle>
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={goToPreviousMonth}
                     className="bg-white border-gray-200 hover:bg-gray-50"
                   >
                     <ChevronLeft className="h-4 w-4" />
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={goToNextMonth}
                     className="bg-white border-gray-200 hover:bg-gray-50"
                   >
                     <ChevronRight className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
             </CardHeader>
            <CardContent className="p-6">
                             {/* Дни недели */}
               <div className="grid grid-cols-7 gap-1 mb-2">
                 {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, index) => (
                   <div
                     key={day}
                     className="h-10 flex items-center justify-center text-sm font-medium text-gray-600"
                   >
                     {day}
                   </div>
                 ))}
               </div>

                             {/* Календарная сетка */}
               <div className="grid grid-cols-7 gap-1">
                 {daysInMonth.map((day, index) => {
                   const dayTasks = getTasksForDay(day);
                   const isSelected = selectedDate && isSameDay(day, selectedDate);
                   const isCurrentDay = isToday(day);
                   
                   return (
                     <div
                       key={index}
                       className={cn(
                         "h-24 border border-gray-200 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:bg-gray-50",
                         isSelected && "bg-blue-50 border-blue-300",
                         isCurrentDay && "bg-blue-50 border-blue-200"
                       )}
                       onClick={() => setSelectedDate(day)}
                     >
                       <div className="flex items-center justify-between mb-1">
                         <span
                           className={cn(
                             "text-sm font-medium",
                             isCurrentDay && "text-blue-600",
                             isSelected && "text-blue-700"
                           )}
                         >
                           {format(day, "d")}
                         </span>
                         {dayTasks.length > 0 && (
                           <Badge variant="secondary" className="text-xs px-1 py-0">
                             {dayTasks.length}
                           </Badge>
                         )}
                       </div>
                       
                                                {/* Задачи дня */}
                         <div className="space-y-1">
                                                       {dayTasks.slice(0, 2).map(task => (
                              <div
                                key={task.id}
                                className="text-xs p-1 rounded truncate text-white font-medium cursor-pointer hover:opacity-80 transition-opacity"
                                style={{
                                  backgroundColor: task.color || '#3b82f6',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task.id);
                                }}
                                title={`Кликните для просмотра: ${task.title}`}
                              >
                                {task.title}
                              </div>
                            ))}
                           {dayTasks.length > 2 && (
                             <div className="text-xs text-gray-500">
                               +{dayTasks.length - 2} ещё
                             </div>
                           )}
                         </div>
                     </div>
                   );
                 })}
               </div>
            </CardContent>
          </Card>
        </div>

                 {/* Боковая панель */}
         <div className="space-y-4">
           {/* Фильтры */}
           <Card className="border border-gray-200 shadow-sm">
             <CardHeader className="bg-white border-b border-gray-200">
               <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                 <Filter className="h-4 w-4 text-gray-600" />
                 Фильтры
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 p-4">
               <div>
                 <label className="text-sm font-medium mb-2 block text-gray-700">Проект</label>
                 <Select value={filterProject} onValueChange={setFilterProject}>
                   <SelectTrigger className="bg-white border-gray-200 hover:border-gray-300">
                     <SelectValue placeholder="Все проекты" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Все проекты</SelectItem>
                     {projects.map(project => (
                       <SelectItem key={project.id} value={project.id}>
                         {project.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </CardContent>
           </Card>

                     {/* Задачи выбранного дня */}
           <Card className="border border-gray-200 shadow-sm">
             <CardHeader className="bg-white border-b border-gray-200">
               <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                 <Calendar className="h-4 w-4 text-gray-600" />
                 {selectedDate ? (
                   <>
                     {format(selectedDate, "d MMMM", { locale: ru })}
                     {isToday(selectedDate) && (
                       <Badge variant="default" className="text-xs">
                         Сегодня
                       </Badge>
                     )}
                   </>
                 ) : (
                   "Выберите дату"
                 )}
               </CardTitle>
             </CardHeader>
                        <CardContent className="p-6">
              {selectedDate ? (
                <div className="space-y-3">
                  {tasksForSelectedDate.length === 0 ? (
                                         <EmptyState
                       icon={Calendar}
                       title="Нет задач на этот день"
                       description="Создайте новую задачу или выберите другую дату"
                       action={{
                         label: "Добавить задачу",
                         onClick: handleCreateTask,
                         variant: "outline"
                       }}
                     />
                  ) : (
                    <>
                      {tasksForSelectedDate.map(task => {
                        const project = projects.find(p => p.id === task.projectId);
                        return (
                                                     <TaskCard
                             key={task.id}
                             task={task}
                             project={project}
                             variant="compact"
                             onEdit={() => handleEditTask(task.id)}
                             onDelete={handleDeleteTask}
                           />
                        );
                      })}
                                             <Button 
                         size="sm" 
                         className="w-full"
                         onClick={handleCreateTask}
                       >
                         <Plus className="h-4 w-4 mr-1" />
                         Добавить задачу
                       </Button>
                    </>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="Выберите дату"
                  description="Выберите дату для просмотра задач"
                />
              )}
                         </CardContent>
           </Card>
         </div>
       </div>
       
       {/* Модальное окно создания/редактирования задачи */}
       <TaskModal
         isOpen={isTaskModalOpen}
         onClose={handleCloseTaskModal}
         taskId={editingTaskId}
       />
     </div>
   );
 }
