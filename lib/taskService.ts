// lib/taskService.ts
import { supabase } from './supabaseClient'
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'

// ============================================================
// 1. GET TASKS
// ============================================================

/**
 * Lấy tasks theo ngày cụ thể
 * @param date - Ngày cần lấy (format: 'yyyy-MM-dd')
 * @returns Danh sách tasks
 */
export async function getTasksByDate(date: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', date)
      .order('position', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('❌ Lỗi khi lấy tasks theo ngày:', error)
      return []
    }

    return data as Task[]
  } catch (error) {
    console.error('❌ Lỗi không xác định khi lấy tasks:', error)
    return []
  }
}

/**
 * Lấy tasks trong khoảng thời gian
 * @param startDate - Ngày bắt đầu (format: 'yyyy-MM-dd')
 * @param endDate - Ngày kết thúc (format: 'yyyy-MM-dd')
 * @returns Danh sách tasks
 */
export async function getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('position', { ascending: true })

    if (error) {
      console.error('❌ Lỗi khi lấy tasks theo khoảng thời gian:', error)
      return []
    }

    return data as Task[]
  } catch (error) {
    console.error('❌ Lỗi không xác định khi lấy tasks:', error)
    return []
  }
}

/**
 * Lấy tất cả tasks (không giới hạn ngày)
 * @returns Danh sách tất cả tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('date', { ascending: false })
      .order('position', { ascending: true })

    if (error) {
      console.error('❌ Lỗi khi lấy tất cả tasks:', error)
      return []
    }

    return data as Task[]
  } catch (error) {
    console.error('❌ Lỗi không xác định khi lấy tất cả tasks:', error)
    return []
  }
}

/**
 * Lấy task theo ID
 * @param id - ID của task
 * @returns Task hoặc null nếu không tìm thấy
 */
export async function getTaskById(id: number): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`❌ Lỗi khi lấy task ID ${id}:`, error)
      return null
    }

    return data as Task
  } catch (error) {
    console.error(`❌ Lỗi không xác định khi lấy task ID ${id}:`, error)
    return null
  }
}

// ============================================================
// 2. CREATE TASK
// ============================================================

/**
 * Tạo task mới
 * @param task - Dữ liệu task cần tạo
 * @returns Task vừa tạo hoặc null nếu thất bại
 */
export async function createTask(task: CreateTaskInput): Promise<Task | null> {
  try {
    // Lấy position tiếp theo cho ngày đó
    const nextPosition = await getNextPosition(task.date)

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        position: nextPosition,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Lỗi khi tạo task:', error)
      return null
    }

    console.log('✅ Tạo task thành công:', data)
    return data as Task
  } catch (error) {
    console.error('❌ Lỗi không xác định khi tạo task:', error)
    return null
  }
}

/**
 * Tạo nhiều task cùng lúc (bulk create)
 * @param tasks - Mảng dữ liệu tasks cần tạo
 * @returns Mảng tasks vừa tạo hoặc [] nếu thất bại
 */
export async function createMultipleTasks(tasks: CreateTaskInput[]): Promise<Task[]> {
  try {
    const tasksWithPosition = await Promise.all(
      tasks.map(async (task, index) => ({
        ...task,
        position: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    )

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksWithPosition)
      .select()

    if (error) {
      console.error('❌ Lỗi khi tạo nhiều tasks:', error)
      return []
    }

    console.log(`✅ Tạo ${data.length} tasks thành công`)
    return data as Task[]
  } catch (error) {
    console.error('❌ Lỗi không xác định khi tạo nhiều tasks:', error)
    return []
  }
}

// ============================================================
// 3. UPDATE TASK
// ============================================================

/**
 * Cập nhật task
 * @param updateData - Dữ liệu cần cập nhật (bao gồm id)
 * @returns Task đã cập nhật hoặc null nếu thất bại
 */
export async function updateTask(updateData: UpdateTaskInput): Promise<Task | null> {
  try {
    const { id, ...updates } = updateData

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`❌ Lỗi khi cập nhật task ID ${id}:`, error)
      return null
    }

    console.log(`✅ Cập nhật task ID ${id} thành công`)
    return data as Task
  } catch (error) {
    console.error(`❌ Lỗi không xác định khi cập nhật task:`, error)
    return null
  }
}

/**
 * Cập nhật vị trí của nhiều task (sau khi drag & drop)
 * @param tasks - Mảng các task với id và position mới
 * @returns true nếu thành công, false nếu thất bại
 */
export async function updateTaskPositions(tasks: { id: number; position: number }[]): Promise<boolean> {
  try {
    if (tasks.length === 0) return true

    const updates = tasks.map(({ id, position }) => ({
      id,
      position,
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('tasks')
      .upsert(updates, { onConflict: 'id' })

    if (error) {
      console.error('❌ Lỗi khi cập nhật vị trí tasks:', error)
      return false
    }

    console.log(`✅ Cập nhật vị trí cho ${tasks.length} tasks thành công`)
    return true
  } catch (error) {
    console.error('❌ Lỗi không xác định khi cập nhật vị trí:', error)
    return false
  }
}

/**
 * Đánh dấu hoàn thành / bỏ hoàn thành task
 * @param id - ID của task
 * @param isCompleted - true: hoàn thành, false: bỏ hoàn thành
 * @returns Task đã cập nhật hoặc null nếu thất bại
 */
export async function toggleTaskCompletion(id: number, isCompleted: boolean): Promise<Task | null> {
  return await updateTask({
    id,
    is_completed: isCompleted
  })
}

// ============================================================
// 4. DELETE TASK
// ============================================================

/**
 * Xóa task theo ID
 * @param id - ID của task cần xóa
 * @returns true nếu thành công, false nếu thất bại
 */
export async function deleteTask(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`❌ Lỗi khi xóa task ID ${id}:`, error)
      return false
    }

    console.log(`✅ Xóa task ID ${id} thành công`)
    return true
  } catch (error) {
    console.error(`❌ Lỗi không xác định khi xóa task:`, error)
    return false
  }
}

/**
 * Xóa tất cả tasks trong một ngày
 * @param date - Ngày cần xóa (format: 'yyyy-MM-dd')
 * @returns Số lượng task đã xóa, hoặc -1 nếu thất bại
 */
export async function deleteTasksByDate(date: string): Promise<number> {
  try {
    const { data, error, count } = await supabase
      .from('tasks')
      .delete()
      .eq('date', date)
      .select('id', { count: 'exact' })

    if (error) {
      console.error(`❌ Lỗi khi xóa tasks ngày ${date}:`, error)
      return -1
    }

    console.log(`✅ Xóa ${count} tasks ngày ${date} thành công`)
    return count || 0
  } catch (error) {
    console.error(`❌ Lỗi không xác định khi xóa tasks theo ngày:`, error)
    return -1
  }
}

/**
 * Xóa tất cả tasks (cẩn thận khi dùng)
 * @returns Số lượng task đã xóa, hoặc -1 nếu thất bại
 */
export async function deleteAllTasks(): Promise<number> {
  try {
    const { data, error, count } = await supabase
      .from('tasks')
      .delete()
      .neq('id', 0) // Xóa tất cả
      .select('id', { count: 'exact' })

    if (error) {
      console.error('❌ Lỗi khi xóa tất cả tasks:', error)
      return -1
    }

    console.log(`✅ Xóa ${count} tasks thành công`)
    return count || 0
  } catch (error) {
    console.error('❌ Lỗi không xác định khi xóa tất cả tasks:', error)
    return -1
  }
}

// ============================================================
// 5. HELPER FUNCTIONS
// ============================================================

/**
 * Lấy vị trí tiếp theo cho task mới trong một ngày
 * @param date - Ngày cần lấy vị trí (format: 'yyyy-MM-dd')
 * @returns Vị trí tiếp theo (số nguyên)
 */
async function getNextPosition(date: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('position')
      .eq('date', date)
      .order('position', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ Lỗi khi lấy vị trí tiếp theo:', error)
      return 0
    }

    if (data.length === 0) {
      return 0
    }

    return data[0].position + 1
  } catch (error) {
    console.error('❌ Lỗi không xác định khi lấy vị trí tiếp theo:', error)
    return 0
  }
}

/**
 * Kiểm tra task có tồn tại không
 * @param id - ID của task
 * @returns true nếu tồn tại, false nếu không
 */
export async function taskExists(id: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .single()

    if (error) {
      return false
    }

    return data !== null
  } catch (error) {
    return false
  }
}

/**
 * Đếm số lượng tasks trong một ngày
 * @param date - Ngày cần đếm (format: 'yyyy-MM-dd')
 * @returns Số lượng tasks
 */
export async function countTasksByDate(date: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('date', date)

    if (error) {
      console.error(`❌ Lỗi khi đếm tasks ngày ${date}:`, error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error(`❌ Lỗi không xác định khi đếm tasks:`, error)
    return 0
  }
}

/**
 * Đếm số lượng tasks đã hoàn thành trong một ngày
 * @param date - Ngày cần đếm (format: 'yyyy-MM-dd')
 * @returns Số lượng tasks đã hoàn thành
 */
export async function countCompletedTasksByDate(date: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('date', date)
      .eq('is_completed', true)

    if (error) {
      console.error(`❌ Lỗi khi đếm tasks hoàn thành ngày ${date}:`, error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error(`❌ Lỗi không xác định khi đếm tasks hoàn thành:`, error)
    return 0
  }
}

// ============================================================
// 6. RECURRING TASKS
// ============================================================

/**
 * Tạo các task lặp lại cho một khoảng thời gian
 * @param task - Task gốc có recurring
 * @param startDate - Ngày bắt đầu tạo
 * @param endDate - Ngày kết thúc tạo
 * @returns Mảng tasks đã tạo
 */
export async function generateRecurringTasks(
  task: Task,
  startDate: string,
  endDate: string
): Promise<Task[]> {
  try {
    if (!task.is_recurring || !task.recurring_type) {
      return []
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const tasks: CreateTaskInput[] = []
    let currentDate = new Date(start)

    while (currentDate <= end) {
      const dateStr = formatDate(currentDate)
      
      // Kiểm tra xem task đã tồn tại chưa
      const existing = await getTasksByDate(dateStr)
      const exists = existing.some(t => 
        t.title === task.title && 
        t.start_time === task.start_time &&
        t.is_recurring === false
      )

      if (!exists) {
        tasks.push({
          title: task.title,
          description: task.description || '',
          start_time: task.start_time || '',
          end_time: task.end_time || '',
          date: dateStr,
          priority: task.priority,
          color: task.color || '',
          is_recurring: false,
          recurring_type: null
        })
      }

      // Tăng ngày dựa trên recurring_type
      switch (task.recurring_type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
        default:
          currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    if (tasks.length === 0) {
      return []
    }

    return await createMultipleTasks(tasks)
  } catch (error) {
    console.error('❌ Lỗi khi tạo tasks lặp lại:', error)
    return []
  }
}

// ============================================================
// 7. UTILITY FUNCTIONS
// ============================================================

/**
 * Format Date thành string 'yyyy-MM-dd'
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ============================================================
// 8. EXPORT ALL
// ============================================================

export default {
  // Get
  getTasksByDate,
  getTasksByDateRange,
  getAllTasks,
  getTaskById,
  
  // Create
  createTask,
  createMultipleTasks,
  
  // Update
  updateTask,
  updateTaskPositions,
  toggleTaskCompletion,
  
  // Delete
  deleteTask,
  deleteTasksByDate,
  deleteAllTasks,
  
  // Helpers
  taskExists,
  countTasksByDate,
  countCompletedTasksByDate,
  
  // Recurring
  generateRecurringTasks,
}