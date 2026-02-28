'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Lock, ArrowRight, AlertCircle, Languages, Hash, ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [step, setStep] = useState(1)
    const [lang, setLang] = useState<'th' | 'en'>('th')
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const savedLang = localStorage.getItem('app_lang') as 'th' | 'en'
        if (savedLang) setLang(savedLang)
    }, [])

    const t = {
        th: { step1: 'ตรวจสอบ OTP', step1Desc: `รหัส 6 หลักส่งไปที่ ${email}`, step2: 'ตั้งรหัสใหม่', step2Desc: 'ระบุรหัสผ่านใหม่ของคุณ', otpPlace: 'รหัส OTP', passPlace: 'รหัสผ่านใหม่', confPlace: 'ยืนยันรหัสผ่าน', btn1: 'ยืนยันรหัส', btn2: 'เปลี่ยนรหัสผ่าน', matchErr: 'รหัสผ่านไม่ตรงกัน!' },
        en: { step1: 'Verify OTP', step1Desc: `6-digit code sent to ${email}`, step2: 'New Password', step2Desc: 'Set your new password', otpPlace: 'OTP CODE', passPlace: 'NEW PASSWORD', confPlace: 'CONFIRM PASSWORD', btn1: 'VERIFY OTP', btn2: 'RESET PASSWORD', matchErr: 'Passwords do not match!' }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setErrorMessage('')
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' })
        if (error) setErrorMessage(error.message)
        else setStep(2)
        setLoading(false)
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setErrorMessage('')
        if (newPassword !== confirmPassword) {
            setLoading(false); return setErrorMessage(t[lang].matchErr)
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) setErrorMessage(error.message)
        else window.location.replace('/login')
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col overflow-hidden">
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
                        <h2 className="text-6xl font-black tracking-tight text-white italic uppercase leading-none">{step === 1 ? t[lang].step1 : t[lang].step2}</h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] italic">{step === 1 ? t[lang].step1Desc : t[lang].step2Desc}</p>

                        {step === 1 ? (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="relative group">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
                                    <input type="text" placeholder={t[lang].otpPlace} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold text-center tracking-[0.5em]" onChange={(e) => setOtp(e.target.value)} required />
                                </div>
                                {errorMessage && <div className="text-red-500 font-bold text-xs uppercase italic px-2 flex items-center gap-2"><AlertCircle size={14} />{errorMessage}</div>}
                                <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl uppercase italic text-xl transition-all hover:scale-[1.03]">{loading ? '...' : t[lang].btn1}</button>
                            </form>
                        ) : (
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input type="password" placeholder={t[lang].passPlace} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold" onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input type="password" placeholder={t[lang].confPlace} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold" onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                {errorMessage && <div className="text-red-500 font-bold text-xs uppercase italic px-2 flex items-center gap-2"><AlertCircle size={14} />{errorMessage}</div>}
                                <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl uppercase italic text-xl transition-all hover:scale-[1.03]">{loading ? '...' : t[lang].btn2}</button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}