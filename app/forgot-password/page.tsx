'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, ArrowRight, ArrowLeft, Languages, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [lang, setLang] = useState<'th' | 'en'>('th')
    const [errorMessage, setErrorMessage] = useState('')

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
        th: { title: 'ลืมรหัสผ่าน', desc: 'ระบุอีเมลเพื่อรับรหัส OTP', btn: 'ส่งรหัส OTP', back: 'กลับไปหน้าเข้าสู่ระบบ', place: 'อีเมลของคุณ' },
        en: { title: 'Forgot Password', desc: 'Enter email to receive OTP', btn: 'Send OTP Code', back: 'Back to Login', place: 'Your Email' }
    }

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setErrorMessage('')
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) setErrorMessage(error.message)
        else window.location.href = `/reset-password?email=${email}`
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col overflow-hidden">
            <div className="absolute top-8 right-8 z-50">
                <button onClick={toggleLang} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl font-bold text-sm hover:scale-110 hover:rotate-3 transition-all text-white uppercase italic">
                    <Languages size={18} className="text-cyan-400" /> {lang}
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
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] italic">{t[lang].desc}</p>

                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                <input type="email" placeholder={t[lang].place} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setEmail(e.target.value)} required />
                            </div>

                            {errorMessage && <div className="text-red-500 font-bold text-xs uppercase italic px-2 flex items-center gap-2 animate-bounce"><AlertCircle size={14} />{errorMessage}</div>}

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