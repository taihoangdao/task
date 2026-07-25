// app/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { format, isToday, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/TaskList'
import { TaskForm } from '@/components/TaskForm'
import { EditTaskForm } from '@/components/EditTaskForm'
import { 
  getTasksByDate, 
  toggleTaskCompletion, 
  createTask, 
  updateTask, 
  deleteTask 
} from '@/lib/taskService'
import { Task, CreateTaskInput } from '@/types/task'

export default function Home() {
  // ========== STATES ==========
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState<boolean>(true)
  const [formOpen, setFormOpen] = useState<boolean>(false)
  const [editFormOpen, setEditFormOpen] = useState<boolean>(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [mounted, setMounted] = useState<boolean>(false)

  // ========== MOUNTED ==========
  useEffect(() => {
    setMounted(true)
  }, [])

  // ========== FETCH TASKS ==========
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const data = await getTasksByDate(dateStr)
      setTasks(data)
    } catch (error) {
      console.error('Lỗi khi lấy tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // ========== HANDLERS ==========
  
  const handleToggleComplete = useCallback(async (id: number, completed: boolean) => {
    try {
      const updated = await toggleTaskCompletion(id, completed)
      if (updated) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === id ? updated : task
          )
        )
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái task:', error)
    }
  }, [])

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task)
    setEditFormOpen(true)
  }, [])

  const handleUpdateTask = useCallback(async (id: number, data: Partial<CreateTaskInput>) => {
    try {
      const updated = await updateTask({ id, ...data })
      if (updated) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật task:', error)
    }
  }, [fetchTasks])

  const handleDeleteTask = useCallback(async (id: number) => {
    try {
      const success = await deleteTask(id)
      if (success) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Lỗi khi xóa task:', error)
    }
  }, [fetchTasks])

  const handleCreateTask = useCallback(async (taskData: CreateTaskInput) => {
    try {
      const newTask = await createTask({
        ...taskData,
        date: format(selectedDate, 'yyyy-MM-dd')
      })
      if (newTask) {
        await fetchTasks()
      }
    } catch (error) {
      console.error('Lỗi khi tạo task:', error)
    }
  }, [selectedDate, fetchTasks])

  // ========== DATE NAVIGATION ==========
  const changeDate = useCallback((days: number) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() + days)
      return newDate
    })
  }, [])

  const goToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  // ========== FORMAT HELPERS ==========
  const formatDateDisplay = useCallback((date: Date) => {
    if (isToday(date)) {
      return 'Hôm nay'
    }
    return format(date, "EEEE, dd/MM/yyyy", { locale: vi })
  }, [])

  // ========== STATS ==========
  const completedTasks = tasks.filter(t => t.is_completed).length
  const pendingTasks = tasks.length - completedTasks
  const isSelectedDateToday = isToday(selectedDate)

  // ========== RENDER ==========
  // Tránh hydration error
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Timeline
              </h1>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate(-1)}
                className="h-8 w-8 md:h-9 md:w-9 p-0"
                aria-label="Ngày trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant={isSelectedDateToday ? "default" : "outline"}
                size="sm"
                onClick={goToToday}
                className="text-xs md:text-sm"
              >
                Hôm nay
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate(1)}
                className="h-8 w-8 md:h-9 md:w-9 p-0"
                aria-label="Ngày sau"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-base md:text-lg font-medium text-gray-700 capitalize">
              {formatDateDisplay(selectedDate)}
            </h2>
            
            <Button 
              size="sm" 
              className="gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Thêm task</span>
              <span className="sm:hidden">Thêm</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Đang tải công việc...</p>
          </div>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onTaskClick={handleTaskClick}
            />
            
            {/* ===== STATS ===== */}
            <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-700">
                    {tasks.length}
                  </div>
                  <div className="text-xs text-gray-500">Tổng công việc</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {completedTasks}
                  </div>
                  <div className="text-xs text-gray-500">Đã hoàn thành</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {pendingTasks}
                  </div>
                  <div className="text-xs text-gray-500">Chưa hoàn thành</div>
                </div>
              </div>
              
              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(completedTasks / tasks.length) * 100}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ===== MODALS ===== */}
      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        date={selectedDate}
        onSubmit={handleCreateTask}
      />

      <EditTaskForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        task={selectedTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}