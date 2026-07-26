'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteAllButtonProps {
  onDeleteAll: () => Promise<void>
  taskCount: number
}

export function DeleteAllButton({ onDeleteAll, taskCount }: DeleteAllButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDeleteAll = async () => {
    setIsLoading(true)
    try {
      await onDeleteAll()
      setOpen(false)
    } catch (error) {
      console.error('Lỗi khi xóa tất cả:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (taskCount === 0) return null

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1 text-xs">
          <Trash2 className="h-3.5 w-3.5" />
          Xóa tất cả ({taskCount})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này sẽ xóa <strong>tất cả {taskCount} công việc</strong> hiện có.
            Dữ liệu sẽ không thể khôi phục được.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAll}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Đang xóa...' : 'Xóa tất cả'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}