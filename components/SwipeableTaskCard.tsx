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
}

export function SwipeableTaskCard({
  task,
  onToggleComplete,
  onTaskClick,
  onDelete,
}: SwipeableTaskCardProps) {
  const [offset, setOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      // Chỉ cho phép vuốt sang trái (deltaX < 0)
      if (eventData.deltaX < 0) {
        const newOffset = Math.max(eventData.deltaX, -160) // Giới hạn tối đa 160px
        setOffset(newOffset)
        setIsSwiping(true)
        setShowDelete(newOffset < -50)
      } else {
        // Vuốt sang phải -> reset
        setOffset(0)
        setIsSwiping(false)
        setShowDelete(false)
      }
    },
    onSwiped: (eventData) => {
      if (eventData.deltaX < -80) {
        // Vuốt đủ xa -> giữ nguyên nút xóa
        setOffset(-160)
        setShowDelete(true)
      } else {
        setOffset(0)
        setShowDelete(false)
      }
      setIsSwiping(false)
    },
    trackMouse: true, // Hỗ trợ chuột trên desktop
    preventScrollOnSwipe: true,
    delta: 10,
  })

  const handleDelete = () => {
    onDelete(task.id)
    // Reset sau khi xóa
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
        className="absolute right-0 top-0 bottom-0 w-16 bg-red-500 flex items-center justify-center rounded-r-lg transition-opacity duration-200"
        style={{ opacity: showDelete ? 1 : 0 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-red-600"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
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
          touchAction: 'pan-y', // Cho phép cuộn dọc
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