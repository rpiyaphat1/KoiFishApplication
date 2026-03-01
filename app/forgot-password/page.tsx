'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft, Hash, Eye, EyeOff, CheckCircle2, Send } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

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
        const emailFromUrl = searchParams.get('email')
        if (emailFromUrl) { setEmail(emailFromUrl); setStep(2); }
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
        else { setStep(2); setCooldown(30); }
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
        <form onSubmit={handleUpdatePassword} className="space-y-5" autoComplete="off">
            <input type="password" style={{ display: 'none' }} />

            {/* STEP 1: EMAIL */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registered Email</label>
                <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${step > 1 ? 'text-emerald-500' : 'text-slate-500 group-focus-within:text-cyan-400'}`} size={18} />
                    <input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        disabled={step > 1}
                        className={`w-full pl-12 pr-4 py-4 bg-[#010409] border border-white/5 rounded-2xl outline-none font-bold transition-all ${step > 1 ? 'bg-slate-900/50 text-slate-500 cursor-not-allowed border-emerald-500/20' : 'text-white focus:border-cyan-500/50 focus:bg-slate-900 shadow-inner'}`}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            {step === 1 && (
                <button type="button" onClick={handleSendOTP} disabled={loading} className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase italic shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {loading ? 'Processing...' : 'Send OTP Code'} <Send size={18} />
                </button>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">Verification Code</label>
                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                className="w-full pl-12 pr-4 py-5 bg-slate-900 border border-cyan-500/30 rounded-2xl outline-none font-black text-center text-3xl tracking-[0.4em] text-white focus:border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button type="button" onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading} className="w-full py-4 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 transition-all uppercase italic shadow-lg shadow-cyan-900/20">
                            Verify Identity
                        </button>
                        <button type="button" onClick={handleSendOTP} disabled={cooldown > 0 || loading} className="text-[10px] font-black uppercase text-slate-500 hover:text-cyan-400 transition-colors">
                            {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Did not receive code? Resend'}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">New Secure Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-500 font-bold" onChange={(e) => setNewPassword(e.target.value)} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input type={showPassword ? "text" : "password"} placeholder="CONFIRM NEW PASSWORD" className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white outline-none focus:border-cyan-500 font-bold" onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase italic flex items-center justify-center gap-2">
                        {loading ? 'Saving...' : 'Update Password'} <CheckCircle2 size={20} />
                    </button>
                </div>
            )}

            {errorMessage && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-black text-[10px] uppercase italic text-center animate-shake">{errorMessage}</div>}
            {successMessage && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-black text-[10px] uppercase italic text-center">{successMessage}</div>}
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col relative overflow-hidden selection:bg-cyan-500/30">
            <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
                {/* ฝั่งซ้าย: รูปภาพและโลโก้ */}
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-[#010409] border-r border-white/5">
                    <div className="absolute inset-0 overflow-hidden">
                        <img src="/koibg1.png" className="w-full h-full object-cover opacity-20 blur-sm scale-110" alt="BG" />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent" />
                    </div>
                    <div className="relative z-20 text-center space-y-6">
                        <div className="inline-block p-4 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl mb-4 shadow-2xl">
                            <img src="/koilogo.png" className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" alt="Logo" />
                        </div>
                        <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Koi<span className="text-cyan-400">.</span>Detect
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Security Management System</p>
                    </div>
                </div>

                {/* ฝั่งขวา: แบบฟอร์ม */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-[#020617]">
                    <div className="w-full max-w-[420px] space-y-8">

                        <div className="flex flex-col gap-6">
                            <div className="flex justify-start">
                                <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase italic text-[11px] transition-all group">
                                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all">
                                        <ArrowLeft size={14} className="text-cyan-400" />
                                    </div>
                                    BACK TO LOGIN
                                </Link>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-5xl font-black text-white italic uppercase leading-[0.9] tracking-tighter">
                                    Reset <br />
                                    <span className="text-cyan-400">Password</span>
                                </h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Identity verification required</p>
                            </div>
                        </div>

                        {/* กล่อง Form ที่ช่วยให้ดูไม่ลอย */}
                        <div className="p-1 bg-gradient-to-b from-white/10 to-transparent rounded-[2.5rem]">
                            <div className="bg-[#020617] p-8 rounded-[2.4rem] border border-white/5 shadow-2xl">
                                <Suspense fallback={<div className="text-cyan-500 font-black italic animate-pulse uppercase text-center py-10">Initializing...</div>}>
                                    <ResetForm />
                                </Suspense>
                            </div>
                        </div>

                        <p className="text-center text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                            System Security Powered by Koi.Detect v2.0
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}