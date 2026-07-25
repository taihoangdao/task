// components/TaskForm.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CreateTaskInput, Priority, RecurringType } from '@/types/task'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date
  onSubmit: (task: CreateTaskInput) => Promise<void>
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Thấp', color: 'bg-green-500' },
  { value: 'medium', label: 'Trung bình', color: 'bg-yellow-500' },
  { value: 'high', label: 'Cao', color: 'bg-red-500' },
]

const recurringOptions: { value: RecurringType; label: string }[] = [
  { value: null, label: 'Không lặp lại' },
  { value: 'daily', label: 'Hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần' },
  { value: 'monthly', label: 'Hàng tháng' },
]

const colorOptions = [
  '#4A6CF7',
  '#FF6B6B',
  '#F9A825',
  '#26A69A',
  '#9C27B0',
  '#FF9800',
  '#00BCD4',
  '#E91E63',
]

export function TaskForm({ open, onOpenChange, date, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    date: format(date, 'yyyy-MM-dd'),
    priority: 'medium',
    color: '#4A6CF7',
    is_recurring: false,
    recurring_type: null,
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof CreateTaskInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề task')
      return
    }

    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
    setFormData({
      title: '',
      description: '',
      date: format(date, 'yyyy-MM-dd'),
      priority: 'medium',
      color: '#4A6CF7',
      is_recurring: false,
      recurring_type: null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white shadow-lg border border-gray-200 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">➕ Thêm công việc mới</DialogTitle>
          <DialogDescription>
            Điền thông tin công việc bạn muốn thêm
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Tiêu đề *</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề công việc..."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              placeholder="Mô tả chi tiết (tùy chọn)..."
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start_time">Bắt đầu</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time || ''}
                onChange={(e) => handleChange('start_time', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end_time">Kết thúc</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time || ''}
                onChange={(e) => handleChange('end_time', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Độ ưu tiên</Label>
            <div className="flex gap-2 mt-1">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('priority', option.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.priority === option.value
                      ? 'ring-2 ring-offset-2 ring-gray-400 font-medium'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${option.color} mr-1`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Màu sắc</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Lặp lại</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {recurringOptions.map((option) => (
                <button
                  key={option.value || 'none'}
                  type="button"
                  onClick={() => {
                    handleChange('is_recurring', option.value !== null)
                    handleChange('recurring_type', option.value)
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    (formData.is_recurring ? formData.recurring_type === option.value : option.value === null)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Đang tạo...' : 'Tạo công việc'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}