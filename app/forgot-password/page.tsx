'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Hash, RefreshCcw, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()

    // States
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Control States
    const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Password
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        const emailFromUrl = searchParams.get('email')
        if (emailFromUrl) {
            setEmail(emailFromUrl)
            setStep(2) // ถ้ามีเมลมาอยู่แล้ว ให้ข้ามไปรอรับ OTP เลย
        }

        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [searchParams, cooldown])

    // 1. ส่ง OTP (จากหน้า Reset เอง กรณี User อยากเปลี่ยนเมล)
    const handleSendOTP = async () => {
        if (!email) return setErrorMessage('กรุณากรอกอีเมล!')
        setLoading(true); setErrorMessage('')
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        setLoading(false)
        if (error) setErrorMessage(error.message)
        else {
            setStep(2)
            setCooldown(60)
        }
    }

    // 2. ยืนยัน OTP
    const handleVerifyOTP = async () => {
        setLoading(true); setErrorMessage('')
        const { error } = await supabase.auth.verifyOtp({
            email, token: otp, type: 'recovery'
        })
        setLoading(false)
        if (error) setErrorMessage(error.message)
        else setStep(3) // ผ่านไปด่านตั้งรหัส
    }

    // 3. อัปเดตรหัสใหม่
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) return setErrorMessage('รหัสผ่านไม่ตรงกัน!')
        setLoading(true); setErrorMessage('')
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) {
            setErrorMessage(error.message); setLoading(false)
        } else {
            setSuccessMessage('เปลี่ยนรหัสผ่านสำเร็จ! กำลังไปหน้า Login...')
            setTimeout(() => window.location.href = '/login', 2500)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col relative overflow-hidden selection:bg-cyan-500/30">

            {/* BACK Button (โชว์เฉพาะ Step 1) */}
            {step === 1 && (
                <Link href="/login" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase italic text-sm transition-all hover:scale-110 active:scale-95">
                    <ArrowLeft size={20} className="text-cyan-400" /> BACK
                </Link>
            )}

            <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
                {/* Branding Side */}
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-black border-r border-white/5">
                    <img src="/koibg1.png" className="absolute inset-0 w-full h-full object-cover blur-[10px] brightness-[0.25]" alt="BG" />
                    <div className="relative z-20 text-center">
                        <img src="/koilogo.png" className="w-48 h-auto mx-auto mb-8 drop-shadow-[0_0_60px_rgba(34,211,238,0.5)]" alt="Logo" />
                        <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Koi<span className="text-cyan-400">.</span>Detect</h1>
                    </div>
                </div>

                {/* Form Side */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 bg-[#020617] relative z-10">
                    <div className="w-full max-w-[400px] space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
                        <h2 className="text-5xl font-black text-white italic uppercase leading-none tracking-tighter">Reset Password</h2>

                        <form onSubmit={handleUpdatePassword} className="space-y-4" autoComplete="off">
                            <input type="password" style={{ display: 'none' }} />

                            {/* --- STEP 1: EMAIL --- */}
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${step > 1 ? 'text-emerald-500' : 'text-slate-500'}`} size={20} />
                                <input
                                    type="email"
                                    placeholder="YOUR EMAIL"
                                    value={email}
                                    disabled={step > 1}
                                    className={`w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none font-bold transition-all ${step > 1 ? 'bg-slate-900/50 text-slate-500 cursor-not-allowed border-emerald-500/20' : 'text-white focus:border-cyan-500'}`}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {step > 1 && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in" size={20} />}
                            </div>

                            {step === 1 && (
                                <button type="button" onClick={handleSendOTP} disabled={loading} className="w-full py-4.5 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase italic">
                                    {loading ? '...' : 'Send OTP Code'} <ArrowRight size={20} />
                                </button>
                            )}

                            {/* --- STEP 2: OTP --- */}
                            {step >= 2 && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-500">
                                    <div className="relative group">
                                        <Hash className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${step > 2 ? 'text-emerald-400' : 'text-slate-500'}`} size={20} />
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="OTP 6-DIGIT"
                                            disabled={step > 2}
                                            value={otp}
                                            className={`w-full pl-12 pr-4 py-5 rounded-2xl outline-none font-black text-center text-3xl tracking-[0.5em] transition-all border 
                                                ${step > 2
                                                    ? 'bg-slate-900/50 border-emerald-500/50 text-emerald-400 cursor-not-allowed'
                                                    : 'bg-slate-900 border-slate-800 text-white focus:border-cyan-500'}`}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            required
                                        />
                                        {step > 2 && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in" size={24} />}
                                    </div>

                                    {step === 2 && (
                                        <>
                                            <div className="flex justify-center">
                                                <button type="button" onClick={handleSendOTP} disabled={cooldown > 0 || loading} className="text-[10px] font-black uppercase italic text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 flex items-center gap-2">
                                                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                                                    {cooldown > 0 ? `Wait ${cooldown}s` : 'Resend OTP'}
                                                </button>
                                            </div>
                                            <button type="button" onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading} className="w-full py-4.5 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase italic shadow-lg shadow-cyan-900/20">
                                                {loading ? '...' : 'Verify OTP'} <ArrowRight size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* --- STEP 3: NEW PASSWORD --- */}
                            {step === 3 && (
                                <div className="space-y-4 pt-4 animate-in slide-in-from-bottom-5 duration-500">
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
                                        <input type={showPassword ? "text" : "password"} placeholder="NEW PASSWORD" title="6+ characters" className="w-full pl-12 pr-14 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setNewPassword(e.target.value)} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400">
                                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
                                        <input type={showPassword ? "text" : "password"} placeholder="CONFIRM PASSWORD" className="w-full pl-12 pr-14 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 text-xl uppercase italic">
                                        {loading ? '...' : 'Complete Reset'} <CheckCircle2 size={24} />
                                    </button>
                                </div>
                            )}

                            {errorMessage && <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase italic px-2 animate-in slide-in-from-top-1"><AlertCircle size={14} /> {errorMessage}</div>}
                            {successMessage && <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase italic px-2 animate-in slide-in-from-top-1"><CheckCircle2 size={14} /> {successMessage}</div>}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}