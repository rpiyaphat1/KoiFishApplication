'use client'
// บังคับให้หน้านี้เป็น Dynamic และไม่ทำ Static Build
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Hash, RefreshCcw, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// --- 1. แยกเนื้อหาที่มีโอกาสแตะ useSearchParams ออกมา ---
function ResetForm() {
    const searchParams = useSearchParams()

    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        // ดึง Email จาก URL ถ้ามี
        const emailFromUrl = searchParams.get('email')
        if (emailFromUrl) {
            setEmail(emailFromUrl)
            setStep(2)
        }
    }, [searchParams])

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const handleSendOTP = async () => {
        if (!email) return setErrorMessage('กรุณากรอกอีเมล!')
        setLoading(true); setErrorMessage('')
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        setLoading(false)
        if (error) setErrorMessage(error.message)
        else { setStep(2); setCooldown(60); }
    }

    const handleVerifyOTP = async () => {
        setLoading(true); setErrorMessage('')
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' })
        setLoading(false)
        if (error) setErrorMessage(error.message)
        else setStep(3)
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) return setErrorMessage('รหัสผ่านไม่ตรงกัน!')
        setLoading(true); setErrorMessage('')
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) { setErrorMessage(error.message); setLoading(false); }
        else {
            setSuccessMessage('เปลี่ยนรหัสผ่านสำเร็จ! กำลังไปหน้า Login...')
            setTimeout(() => window.location.href = '/login', 2500)
        }
    }

    return (
        <form onSubmit={handleUpdatePassword} className="space-y-4" autoComplete="off">
            <input type="password" style={{ display: 'none' }} />

            {/* STEP 1: EMAIL */}
            <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${step > 1 ? 'text-emerald-500' : 'text-slate-500'}`} size={20} />
                <input
                    type="email"
                    placeholder="YOUR EMAIL"
                    value={email}
                    disabled={step > 1}
                    className={`w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none font-bold transition-all ${step > 1 ? 'bg-slate-900/50 text-slate-500 cursor-not-allowed' : 'text-white focus:border-cyan-500'}`}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            {step === 1 && (
                <button type="button" onClick={handleSendOTP} disabled={loading} className="w-full py-4.5 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase italic">
                    {loading ? '...' : 'Send OTP Code'} <ArrowRight size={20} />
                </button>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-bottom-5">
                    <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="OTP CODE"
                            value={otp}
                            className="w-full pl-12 pr-4 py-5 bg-slate-900 border border-slate-800 rounded-2xl outline-none font-black text-center text-3xl tracking-[0.5em] text-white focus:border-cyan-500"
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            required
                        />
                    </div>
                    <div className="flex justify-center">
                        <button type="button" onClick={handleSendOTP} disabled={cooldown > 0 || loading} className="text-[10px] font-black uppercase text-cyan-400">
                            {cooldown > 0 ? `Wait ${cooldown}s` : 'Resend OTP'}
                        </button>
                    </div>
                    <button type="button" onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading} className="w-full py-4.5 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 transition-all uppercase italic">
                        Verify OTP <ArrowRight size={20} />
                    </button>
                </div>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 3 && (
                <div className="space-y-4 pt-4 animate-in slide-in-from-bottom-5">
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input type={showPassword ? "text" : "password"} placeholder="NEW PASSWORD" engagement-title="6+ characters" className="w-full pl-12 pr-14 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500 font-bold" onChange={(e) => setNewPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>
                    <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input type={showPassword ? "text" : "password"} placeholder="CONFIRM PASSWORD" className="w-full pl-12 pr-14 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500 font-bold" onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all text-xl uppercase italic">
                        {loading ? '...' : 'Complete Reset'} <CheckCircle2 size={24} />
                    </button>
                </div>
            )}

            {errorMessage && <div className="text-red-500 font-bold text-xs uppercase italic text-center">{errorMessage}</div>}
            {successMessage && <div className="text-emerald-500 font-bold text-xs uppercase italic text-center">{successMessage}</div>}
        </form>
    )
}

// --- 2. Main Page ที่หุ้มด้วย Suspense ---
export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col relative overflow-hidden selection:bg-cyan-500/30">
            <Link href="/login" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase italic text-sm transition-all hover:scale-110 active:scale-95">
                <ArrowLeft size={20} className="text-cyan-400" /> BACK
            </Link>

            <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-black border-r border-white/5">
                    <img src="/koibg1.png" className="absolute inset-0 w-full h-full object-cover blur-[10px] brightness-[0.25]" alt="BG" />
                    <div className="relative z-20 text-center">
                        <img src="/koilogo.png" className="w-48 h-auto mx-auto mb-8 drop-shadow-[0_0_60px_rgba(34,211,238,0.5)]" alt="Logo" />
                        <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Koi<span className="text-cyan-400">.</span>Detect</h1>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 bg-[#020617] relative z-10">
                    <div className="w-full max-w-[400px] space-y-10">
                        <h2 className="text-5xl font-black text-white italic uppercase leading-none tracking-tighter">Reset Password</h2>

                        {/* 🔥 หุ้ม Suspense ตรงนี้เพื่อให้ Build ผ่าน */}
                        <Suspense fallback={<div className="text-cyan-500 font-black italic animate-pulse">LOADING FORM...</div>}>
                            <ResetForm />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    )
}