import { createClient } from '@supabase/supabase-js'

// ดึงค่าจาก Env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 🚨 จุดสำคัญ: ถ้าไม่มีค่า (ตอน Build) ให้ใส่ค่าหลอกไว้ก่อนเพื่อให้ผ่าน Prerender
// แต่ตอนใช้งานจริงบน Vercel มันจะอ่านค่าจาก Env ที่พี่ใส่ไว้ปกติครับ
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)