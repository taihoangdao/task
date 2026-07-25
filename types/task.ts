// types/task.ts
export type Priority = 'low' | 'medium' | 'high'

export type RecurringType = 'daily' | 'weekly' | 'monthly' | null

export interface Task {
  id: number
  title: string
  description: string | null
  start_time: string | null
  end_time: string | null
  duration: number | null
  date: string
  is_completed: boolean
  priority: Priority
  color: string | null
  is_recurring: boolean
  recurring_type: RecurringType
  recurring_end_date: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  start_time?: string
  end_time?: string
  duration?: number
  date: string
  priority?: Priority
  color?: string
  is_recurring?: boolean
  recurring_type?: RecurringType
  recurring_end_date?: string
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: number
  is_completed?: boolean
}