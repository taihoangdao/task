// components/TaskCard.tsx
'use client'

import { Task } from '@/types/task'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onToggleComplete: (id: number, completed: boolean) => void
  onClick?: () => void
}

const priorityColors = {
  high: 'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-yellow-500',
  low: 'border-l-4 border-l-green-500',
}

export function TaskCard({ task, onToggleComplete, onClick }: TaskCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return ''
    return time.slice(0, 5)
  }

  const getTimeDisplay = () => {
    if (task.start_time && task.end_time) {
      return `${formatTime(task.start_time)} - ${formatTime(task.end_time)}`
    }
    if (task.start_time) {
      return `${formatTime(task.start_time)}`
    }
    if (task.duration) {
      return `${task.duration} phút`
    }
    return ''
  }

  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow-sm p-4 mb-3 transition-all hover:shadow-md cursor-pointer',
        priorityColors[task.priority],
        task.is_completed && 'opacity-60'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* 👉 CHECKBOX LỚN HƠN */}
        <Checkbox 
          checked={task.is_completed}
          onCheckedChange={(checked) => {
            onToggleComplete(task.id, checked as boolean)
          }}
          className="mt-1 h-6 w-6 border-2" // 👈 Thêm h-6 w-6 border-2
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              'font-medium text-gray-900',
              task.is_completed && 'line-through text-gray-400'
            )}>
              {task.title}
            </h3>
            {task.is_recurring && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
                🔄 {task.recurring_type}
              </span>
            )}
          </div>
          
          {task.description && (
            <p className={cn(
              'text-sm text-gray-500 mt-0.5',
              task.is_completed && 'text-gray-400'
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            {task.start_time && (
              <span className="flex items-center gap-1">
                🕐 {getTimeDisplay()}
              </span>
            )}
            {task.duration && !task.start_time && (
              <span className="flex items-center gap-1">
                ⏱ {task.duration} phút
              </span>
            )}
            {task.color && (
              <span 
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: task.color }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}