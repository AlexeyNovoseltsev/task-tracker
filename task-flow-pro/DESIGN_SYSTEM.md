# Дизайн-система TaskFlow Pro

## Обзор

Дизайн-система TaskFlow Pro обеспечивает единообразный пользовательский интерфейс во всех компонентах приложения. Она включает в себя унифицированные компоненты, константы и принципы дизайна.

## Основные принципы

### 1. Консистентность
- Единообразные отступы, цвета и типографика
- Переиспользуемые компоненты
- Стандартизированные паттерны взаимодействия

### 2. Доступность
- Поддержка клавиатурной навигации
- Контрастные цвета
- Семантическая разметка

### 3. Адаптивность
- Мобильный-first подход
- Гибкие сетки
- Адаптивные компоненты

## Компоненты

### Унифицированные компоненты

#### PageHeader
Заголовок страницы с иконкой, описанием и действиями.

```tsx
import { PageHeader } from '@/components/ui/page-header';

<PageHeader
  title="Задачи"
  description="Управление задачами проекта"
  icon={CheckSquare}
  actions={<Button>Создать задачу</Button>}
/>
```

#### EmptyState
Состояние пустого списка или отсутствия данных.

```tsx
import { EmptyState } from '@/components/ui/empty-state';

<EmptyState
  icon={Calendar}
  title="Нет задач"
  description="Создайте первую задачу для начала работы"
  action={{
    label: "Создать задачу",
    onClick: handleCreateTask,
    variant: "default"
  }}
/>
```

#### TaskCard
Карточка задачи с различными вариантами отображения.

```tsx
import { TaskCard } from '@/components/ui/task-card';

<TaskCard
  task={task}
  project={project}
  variant="compact" // 'default' | 'compact' | 'calendar'
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

#### StatsCard
Карточка для отображения статистики.

```tsx
import { StatsCard } from '@/components/ui/stats-card';

<StatsCard
  title="Всего задач"
  value="42"
  description="В этом месяце"
  icon={CheckSquare}
  trend={{ value: 12, isPositive: true }}
/>
```

#### FilterBar
Панель фильтров с активными фильтрами.

```tsx
import { FilterBar } from '@/components/ui/filter-bar';

<FilterBar
  filters={[
    { key: 'status', label: 'Все', value: 'all' },
    { key: 'status', label: 'Активные', value: 'active' },
    { key: 'status', label: 'Завершенные', value: 'completed' }
  ]}
  activeFilters={activeFilters}
  onFilterChange={handleFilterChange}
  onClearFilters={handleClearFilters}
/>
```

## Цветовая палитра

### Основные цвета
- **Primary**: Синий (#0ea5e9) - основной цвет бренда
- **Success**: Зеленый (#22c55e) - успешные действия
- **Warning**: Желтый (#f59e0b) - предупреждения
- **Error**: Красный (#ef4444) - ошибки

### Семантические цвета
- **Background**: Фон приложения
- **Foreground**: Основной текст
- **Muted**: Вторичный текст
- **Border**: Границы элементов
- **Accent**: Акцентные элементы

## Типографика

### Размеры шрифтов
- **xs**: 12px - мелкий текст
- **sm**: 14px - подписи
- **base**: 16px - основной текст
- **lg**: 18px - заголовки
- **xl**: 20px - крупные заголовки
- **2xl**: 24px - очень крупные заголовки

### Начертания
- **normal**: 400 - обычный текст
- **medium**: 500 - полужирный
- **semibold**: 600 - полужирный
- **bold**: 700 - жирный

## Отступы и размеры

### Базовые отступы
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Радиусы скругления
- **sm**: 2px
- **md**: 6px
- **lg**: 8px
- **xl**: 12px
- **2xl**: 16px
- **full**: 9999px

## Анимации

### Длительности
- **fast**: 150ms - быстрые переходы
- **normal**: 200ms - стандартные переходы
- **slow**: 300ms - медленные переходы

### Функции плавности
- **ease**: Стандартная кривая
- **easeIn**: Ускорение в начале
- **easeOut**: Замедление в конце
- **easeInOut**: Ускорение и замедление

## Статусы и приоритеты

### Статусы задач
- **todo**: К выполнению (серый)
- **in_progress**: В работе (синий)
- **completed**: Завершено (зеленый)
- **blocked**: Заблокировано (красный)

### Приоритеты задач
- **low**: Низкий (зеленый)
- **medium**: Средний (желтый)
- **high**: Высокий (красный)

## Использование в проекте

### Импорт компонентов
```tsx
import { 
  PageHeader, 
  EmptyState, 
  TaskCard, 
  StatsCard, 
  FilterBar 
} from '@/components/ui';
```

### Импорт констант
```tsx
import { 
  COLORS, 
  SPACING, 
  TASK_STATUSES, 
  TASK_PRIORITIES 
} from '@/lib/design-system';
```

## Рекомендации

### 1. Используйте унифицированные компоненты
Вместо создания новых компонентов используйте существующие из дизайн-системы.

### 2. Следуйте принципам доступности
- Используйте семантические HTML теги
- Обеспечивайте контрастность цветов
- Поддерживайте клавиатурную навигацию

### 3. Придерживайтесь консистентности
- Используйте стандартные отступы
- Применяйте единообразные цвета
- Следуйте паттернам взаимодействия

### 4. Тестируйте на разных устройствах
- Проверяйте адаптивность
- Тестируйте на мобильных устройствах
- Убеждайтесь в корректности отображения

## Расширение дизайн-системы

При добавлении новых компонентов:

1. Создайте компонент в `src/components/ui/`
2. Добавьте экспорт в `src/components/ui/index.ts`
3. Обновите документацию
4. Добавьте тесты
5. Проверьте доступность

## Полезные ссылки

- [Figma Design System](https://www.figma.com/design/lnaGsy9koiNSANhHSAGyIK/To-Do-Dashboard--Community-)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
