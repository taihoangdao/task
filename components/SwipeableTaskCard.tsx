// components/SwipeableTaskCard.tsx
'use client'

import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Trash2 } from 'lucide-react'
import { Task } from '@/types/task'
import { SortableTaskCard } from './SortableTaskCard'
import { Button } from './ui/button'

interface SwipeableTaskCardProps {
  task: Task
  onToggleComplete: (id: number, completed: boolean) => void
  onTaskClick: (task: Task) => void
  onDelete: (id: number) => void
  onDeleteGroup: (groupId: string) => void
}

export function SwipeableTaskCard({
  task,
  onToggleComplete,
  onTaskClick,
  onDelete,
  onDeleteGroup,
}: SwipeableTaskCardProps) {
  const [offset, setOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  // Kích thước nút xóa (khoảng 60px)
  const DELETE_BUTTON_WIDTH = 60

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Chỉ cho phép vuốt sang trái (deltaX < 0)
      if (eventData.deltaX < 0) {
        // Giới hạn tối đa bằng chiều rộng nút xóa
        const newOffset = Math.max(eventData.deltaX, -DELETE_BUTTON_WIDTH)
        setOffset(newOffset)
        setIsSwiping(true)
        // Hiện nút xóa khi vuốt hơn 30px
        setShowDelete(newOffset < -30)
      } else {
        // Vuốt sang phải -> reset
        setOffset(0)
        setIsSwiping(false)
        setShowDelete(false)
      }
    },
    onSwiped: (eventData) => {
      if (eventData.deltaX < -40) {
        // Vuốt đủ xa -> giữ nguyên nút xóa
        setOffset(-DELETE_BUTTON_WIDTH)
        setShowDelete(true)
      } else {
        setOffset(0)
        setShowDelete(false)
      }
      setIsSwiping(false)
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 10,
  })

  const handleDeleteClick = () => {
    if (task.recurring_group_id) {
      onDeleteGroup(task.recurring_group_id)
    } else {
      onDelete(task.id)
    }
    setOffset(0)
    setShowDelete(false)
  }

  const handleCancelDelete = () => {
    setOffset(0)
    setShowDelete(false)
  }

  return (
    <div className="relative overflow-hidden rounded-lg mb-3">
      {/* Nút xóa ẩn bên phải */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center rounded-r-lg transition-opacity duration-200"
        style={{
          width: DELETE_BUTTON_WIDTH,
          backgroundColor: '#EF4444',
          opacity: showDelete ? 1 : 0,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-red-600 h-8 w-8"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Task card có thể dịch chuyển */}
      <div
        {...handlers}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          touchAction: 'pan-y',
        }}
        className="relative z-10 touch-pan-y"
      >
        <SortableTaskCard
          task={task}
          onToggleComplete={onToggleComplete}
          onClick={() => onTaskClick(task)}
          disabled={isSwiping || showDelete}
        />
      </div>
    </div>
  )
}