'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Languages } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [lang, setLang] = useState<'th' | 'en'>('th')

    useEffect(() => {
        const savedLang = localStorage.getItem('app_lang') as 'th' | 'en'
        if (savedLang) setLang(savedLang)
    }, [])

    const toggleLang = () => {
        const newLang = lang === 'th' ? 'en' : 'th'
        setLang(newLang)
        localStorage.setItem('app_lang', newLang)
    }

    const t = {
        th: {
            title: 'สมัครสมาชิก', desc: 'สร้างบัญชีใหม่เพื่อเริ่มการตรวจจับ',
            user: 'ชื่อผู้ใช้', email: 'อีเมลของคุณ', pass: 'รหัสผ่าน',
            conf: 'ยืนยันรหัสผ่าน', btn: 'สมัครสมาชิกตอนนี้', back: 'กลับไปหน้าเข้าสู่ระบบ',
            matchErr: 'รหัสผ่านไม่ตรงกัน!', lenErr: 'รหัสผ่านต้องมี 6 ตัวขึ้นไป'
        },
        en: {
            title: 'Sign Up', desc: 'Create a new account to start detection',
            user: 'Username', email: 'Your Email', pass: 'Password',
            conf: 'Confirm Password', btn: 'Register Now', back: 'Back to Login',
            matchErr: 'Passwords do not match!', lenErr: 'Password must be at least 6 characters'
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')
        if (password !== confirmPassword) return setErrorMessage(t[lang].matchErr)
        if (password.length < 6) return setErrorMessage(t[lang].lenErr)
        setLoading(true)
        const { data, error } = await supabase.auth.signUp({
            email, password, options: { data: { display_name: username } },
        })
        if (error) {
            setErrorMessage(error.message)
            setLoading(false)
        } else {
            if (data.user) {
                await supabase.from('profiles').insert([{ id: data.user.id, username, email }])
            }
            setLoading(false)
            setIsSent(true)
        }
    }

    if (isSent) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans text-center">
                <div className="w-full max-w-[450px] space-y-6 bg-slate-900/40 p-12 rounded-[3rem] border border-cyan-500/20 shadow-2xl animate-in zoom-in duration-300">
                    <CheckCircle2 className="text-cyan-400 mx-auto" size={80} />
                    <h2 className="text-3xl font-black italic uppercase">Check Your Email</h2>
                    <p className="text-slate-400 leading-relaxed font-medium">{email}</p>
                    <Link href="/login" className="inline-block pt-4 text-cyan-400 font-black uppercase tracking-widest hover:text-cyan-300 transition-all border-b border-cyan-400/20">{t[lang].back}</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
            <div className="absolute top-8 right-8 z-50">
                <button onClick={toggleLang} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl font-bold text-sm hover:scale-110 hover:rotate-3 active:scale-95 text-white uppercase transition-all duration-300">
                    <Languages size={18} className="text-cyan-400" />
                    <span className="uppercase font-black">{lang.toUpperCase()}</span>
                </button>
            </div>

            <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16 bg-black overflow-hidden">
                    <img src="/koibg1.png" className="absolute inset-0 w-full h-full object-cover blur-[10px] brightness-[0.25] scale-110" alt="BG" />
                    <div className="relative z-20 text-center animate-in zoom-in duration-1000">
                        <img src="/koilogo.png" className="w-64 h-auto mx-auto mb-8 drop-shadow-[0_0_60px_rgba(34,211,238,0.5)]" alt="Logo" />
                        <h1 className="text-8xl font-black tracking-tighter text-white uppercase italic leading-none">Koi<span className="text-cyan-400">.</span>Detect</h1>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#020617] relative z-10 shadow-[-40px_0_80px_rgba(0,0,0,0.8)]">
                    <div className="w-full max-w-[400px] space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
                        <h2 className="text-6xl font-black tracking-tight text-white italic uppercase leading-none">{t[lang].title}</h2>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                <input type="text" placeholder={t[lang].user} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                <input type="email" placeholder={t[lang].email} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                <input type="password" placeholder={t[lang].pass} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                <input type="password" placeholder={t[lang].conf} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setConfirmPassword(e.target.value)} required />
                            </div>

                            {errorMessage && (
                                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase italic px-2 animate-in slide-in-from-top-1">
                                    <AlertCircle size={16} /> {errorMessage}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/40 transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 text-xl uppercase italic">
                                {loading ? '...' : t[lang].btn} <ArrowRight size={24} />
                            </button>
                        </form>

                        <div className="text-center pt-4">
                            <Link href="/login" className="text-sm font-black text-slate-500 hover:text-cyan-400 transition-all duration-300 uppercase italic flex items-center justify-center gap-2">
                                <ArrowLeft size={16} /> {t[lang].back}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}