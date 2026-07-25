// lib/testConnection.ts
import { supabase } from './supabaseClient'

export async function testConnection() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .limit(5)
  
  if (error) {
    console.error('❌ Lỗi kết nối Supabase:', error)
    return false
  }
  
  console.log('✅ Kết nối thành công! Dữ liệu nhận được:', data)
  return true
}