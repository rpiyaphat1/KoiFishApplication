'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSent, setIsSent] = useState(false) // สถานะส่ง OTP/Email แล้ว

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        // 1. เช็คว่ารหัสผ่านตรงกันไหม
        if (password !== confirmPassword) {
            return alert('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')
        }

        if (password.length < 6) {
            return alert('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
        }

        setLoading(true)

        // 2. ส่งข้อมูลไปที่ Supabase (รหัสผ่านจะถูก Hash อัตโนมัติ)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: username,
                },
            },
        })

        setLoading(false)

        if (error) {
            alert(error.message)
        } else {
            setIsSent(true) // แสดงหน้าแจ้งเตือนให้ไปเช็คอีเมลเพื่อยืนยัน OTP
        }
    }

    if (isSent) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
                <div className="w-full max-w-[450px] text-center space-y-6 bg-slate-900/40 p-12 rounded-[3rem] border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                    <div className="flex justify-center">
                        <div className="p-4 bg-cyan-500/20 rounded-full">
                            <CheckCircle2 className="text-cyan-400" size={60} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black">เช็คอีเมลของคุณ</h2>
                    <p className="text-slate-400 leading-relaxed font-medium">
                        เราได้ส่งลิงก์ยืนยันตัวตน (OTP) ไปที่ <span className="text-cyan-400">{email}</span> แล้ว กรุณากดลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชี
                    </p>
                    <Link href="/login" className="inline-block pt-4 text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-[480px] space-y-8 bg-slate-900/30 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black tracking-tight">Create Account</h2>
                    <p className="text-slate-500 font-bold">เข้าร่วมระบบวิจัยพฤติกรรมปลาคาร์ป</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Username */}
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                        <input
                            type="text" placeholder="Username"
                            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 transition-all font-medium"
                            onChange={(e) => setUsername(e.target.value)} required
                        />
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                        <input
                            type="email" placeholder="Gmail Address"
                            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 transition-all font-medium"
                            onChange={(e) => setEmail(e.target.value)} required
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                        <input
                            type="password" placeholder="Password"
                            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 transition-all font-medium"
                            onChange={(e) => setPassword(e.target.value)} required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                        <input
                            type="password" placeholder="Confirm Password"
                            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 transition-all font-medium"
                            onChange={(e) => setConfirmPassword(e.target.value)} required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/40 transition-all flex items-center justify-center gap-3 text-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'กำลังส่งข้อมูล...' : 'Register Now'} <ArrowRight size={24} />
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-slate-500 font-bold">
                        มีบัญชีอยู่แล้ว?{' '}
                        <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-400/30">
                            เข้าสู่ระบบที่นี่
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}