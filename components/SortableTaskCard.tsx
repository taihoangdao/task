// components/SortableTaskCard.tsx
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types/task'
import { TaskCard } from './TaskCard'

interface SortableTaskCardProps {
  task: Task
  onToggleComplete: (id: number, completed: boolean) => void
  onClick?: () => void
  disabled?: boolean // Thêm prop để vô hiệu hóa drag khi vuốt
}

export function SortableTaskCard({
  task,
  onToggleComplete,
  onClick,
  disabled = false,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onToggleComplete={onToggleComplete}
        onClick={onClick}
      />
    </div>
  )
}