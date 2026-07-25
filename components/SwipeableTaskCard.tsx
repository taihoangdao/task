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

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (eventData.deltaX < 0) {
        const newOffset = Math.max(eventData.deltaX, -160)
        setOffset(newOffset)
        setIsSwiping(true)
        setShowDelete(newOffset < -50)
      } else {
        setOffset(0)
        setIsSwiping(false)
        setShowDelete(false)
      }
    },
    onSwiped: (eventData) => {
      if (eventData.deltaX < -80) {
        setOffset(-160)
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
    // Kiểm tra nếu task thuộc nhóm lặp lại
    if (task.recurring_group_id) {
      // Hỏi người dùng có muốn xóa toàn bộ nhóm không
      if (confirm('Task này thuộc chuỗi lặp lại. Bạn có muốn xóa tất cả các task trong chuỗi này không?')) {
        // Xóa cả nhóm
        onDeleteGroup(task.recurring_group_id)
      } else {
        // Chỉ xóa task hiện tại
        onDelete(task.id)
      }
    } else {
      // Task thường, xóa bình thường
      onDelete(task.id)
    }
    setOffset(0)
    setShowDelete(false)
  }

  return (
    <div className="relative overflow-hidden rounded-lg mb-3">
      <div
        className="absolute right-0 top-0 bottom-0 w-16 bg-red-500 flex items-center justify-center rounded-r-lg transition-opacity duration-200"
        style={{ opacity: showDelete ? 1 : 0 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-red-600"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

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