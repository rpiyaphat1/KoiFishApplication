import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // เมื่อ Login สำเร็จ ให้เด้งไปที่ /dashboard
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )

        // แลกเปลี่ยน Authorization Code เป็น Session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            const user = data.user

            // ตรวจสอบและสร้างโปรไฟล์ (ถ้ายังไม่มี)
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!profile) {
                await supabase.from('profiles').insert([
                    {
                        id: user.id,
                        email: user.email,
                        username: user.user_metadata.full_name || user.email?.split('@')[0],
                        avatar_url: user.user_metadata.avatar_url,
                        created_at: new Date().toISOString()
                    }
                ])
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // ถ้าเกิดข้อผิดพลาด หรือไม่มี code ให้กลับไปหน้า login
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}