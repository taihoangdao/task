// components/TaskList.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers'
import { Task } from '@/types/task'
import { SwipeableTaskCard } from './SwipeableTaskCard'
import { updateTaskPositions } from '@/lib/taskService'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (id: number, completed: boolean) => void
  onTaskClick: (task: Task) => void
  onDelete: (id: number) => void
  onDeleteGroup: (groupId: string) => void
  onTasksReordered?: (tasks: Task[]) => void
}

export function TaskList({
  tasks,
  onToggleComplete,
  onTaskClick,
  onDelete,
  onDeleteGroup,
  onTasksReordered,
}: TaskListProps) {
  const [items, setItems] = useState(tasks)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setItems(tasks)
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event

    if (!over) return

    const activeId = active.id as number
    const overId = over.id as number

    if (activeId !== overId) {
      const oldIndex = items.findIndex((item) => item.id === activeId)
      const newIndex = items.findIndex((item) => item.id === overId)

      const newItems = arrayMove(items, oldIndex, newIndex)
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index,
      }))

      setItems(updatedItems)

      if (onTasksReordered) {
        onTasksReordered(updatedItems)
      }

      const positionUpdates = updatedItems.map((item) => ({
        id: item.id,
        position: item.position,
      }))

      await updateTaskPositions(positionUpdates)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-gray-600 font-medium">Chưa có công việc nào</h3>
        <p className="text-gray-400 text-sm mt-1">Bắt đầu thêm công việc mới nhé!</p>
      </div>
    )
  }

  const groupedTasks = items.reduce((groups, task) => {
    const key = task.start_time ? task.start_time.slice(0, 2) : 'other'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(task)
    return groups
  }, {} as Record<string, Task[]>)

  const sortedGroups = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'other') return 1
    if (b === 'other') return -1
    return parseInt(a) - parseInt(b)
  })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <div
        className={`space-y-6 transition-opacity ${
          isDragging ? 'opacity-80' : 'opacity-100'
        }`}
      >
        {sortedGroups.map((hour) => (
          <div key={hour}>
            {hour !== 'other' && (
              <div className="flex items-center gap-3 mb-2 text-sm text-gray-400">
                <span className="font-medium text-gray-500">{hour}:00</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}
            <SortableContext
              items={groupedTasks[hour].map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {groupedTasks[hour].map((task) => (
                  <SwipeableTaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onTaskClick={onTaskClick}
                    onDelete={onDelete}
                    onDeleteGroup={onDeleteGroup}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  )
}