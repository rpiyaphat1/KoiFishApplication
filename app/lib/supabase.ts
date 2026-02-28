import { createClient } from '@supabase/supabase-js'

// ดึงค่ามาเตรียมไว้
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(
    supabaseUrl || 'https://xyz.supabase.co',
    supabaseAnonKey || 'placeholder'
)