// lib/taskService.ts
import { supabase } from './supabaseClient'
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'

// ============================================================
// 1. GET TASKS
// ============================================================

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

export async function createTask(task: CreateTaskInput): Promise<Task | null> {
  try {
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
 * Tạo nhiều task cùng lúc (batch insert) - CÓ KIỂM TRA TRÙNG LẶP
 */
export async function createMultipleTasks(tasks: CreateTaskInput[]): Promise<Task[]> {
  if (tasks.length === 0) return []

  try {
    const dates = tasks.map(t => t.date)
    const uniqueDates = [...new Set(dates)]
    
    const { data: existingTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('date, title, start_time, recurring_group_id')
      .in('date', uniqueDates)

    if (fetchError) {
      console.error('❌ Lỗi khi kiểm tra task trùng lặp:', fetchError)
      return []
    }

    const existingKeys = new Set()
    existingTasks?.forEach(task => {
      const key = `${task.date}|${task.title}|${task.start_time || ''}`
      existingKeys.add(key)
    })

    const newTasks = tasks.filter(task => {
      const key = `${task.date}|${task.title}|${task.start_time || ''}`
      return !existingKeys.has(key)
    })

    if (newTasks.length === 0) {
      console.log('ℹ️ Không có task mới để tạo (đã tồn tại)')
      return []
    }

    const tasksWithPosition = await Promise.all(
      newTasks.map(async (task, index) => {
        const nextPosition = await getNextPosition(task.date)
        return {
          ...task,
          position: nextPosition + index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    )

    const { data, error } = await supabase
      .from('tasks')
      .insert(tasksWithPosition)
      .select()

    if (error) {
      console.error('❌ Lỗi khi tạo nhiều tasks:', error)
      return []
    }

    console.log(`✅ Tạo ${data.length} tasks mới thành công (bỏ qua ${tasks.length - newTasks.length} task trùng)`)
    return data as Task[]
  } catch (error) {
    console.error('❌ Lỗi không xác định khi tạo nhiều tasks:', error)
    return []
  }
}

// ============================================================
// 3. UPDATE TASK
// ============================================================

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

export async function toggleTaskCompletion(id: number, isCompleted: boolean): Promise<Task | null> {
  return await updateTask({
    id,
    is_completed: isCompleted
  })
}

// ============================================================
// 4. DELETE TASK
// ============================================================

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
 * Xóa tất cả task trong cùng một nhóm lặp lại
 * @param groupId - ID của nhóm lặp lại
 * @returns Số lượng task đã xóa
 */
export async function deleteTasksByRecurringGroup(groupId: string): Promise<number> {
  try {
    // Bước 1: Đếm số lượng task trong nhóm
    const { count: taskCount, error: countError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('recurring_group_id', groupId)

    if (countError) {
      console.error(`❌ Lỗi khi đếm task trong nhóm ${groupId}:`, countError)
      return -1
    }

    // Bước 2: Xóa task trong nhóm
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('recurring_group_id', groupId)

    if (error) {
      console.error(`❌ Lỗi khi xóa nhóm lặp lại ${groupId}:`, error)
      return -1
    }

    console.log(`✅ Đã xóa ${taskCount || 0} task trong nhóm ${groupId}`)
    return taskCount || 0
  } catch (error) {
    console.error('❌ Lỗi không xác định khi xóa nhóm lặp lại:', error)
    return -1
  }
}

/**
 * Xóa tất cả task (cẩn thận khi dùng)
 */
export async function deleteAllTasks(): Promise<number> {
  try {
    // Bước 1: Đếm số lượng task
    const { count: taskCount, error: countError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .neq('id', 0)

    if (countError) {
      console.error('❌ Lỗi khi đếm tasks:', countError)
      return -1
    }

    // Bước 2: Xóa tất cả
    const { error } = await supabase
      .from('tasks')
      .delete()
      .neq('id', 0)

    if (error) {
      console.error('❌ Lỗi khi xóa tất cả tasks:', error)
      return -1
    }

    console.log(`✅ Đã xóa ${taskCount || 0} task`)
    return taskCount || 0
  } catch (error) {
    console.error('❌ Lỗi không xác định khi xóa tất cả:', error)
    return -1
  }
}

// ============================================================
// 5. HELPER FUNCTIONS
// ============================================================

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