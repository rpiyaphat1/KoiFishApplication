'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { User, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Languages, Hash, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otp, setOtp] = useState('') // มั่นใจว่าเป็น String ว่างเสมอ
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [errorMessage, setErrorMessage] = useState('')
    const [lang, setLang] = useState<'th' | 'en'>('th')
    const [cooldown, setCooldown] = useState(0)

    // สุ่มชื่อ Input แค่ครั้งเดียวตอน Mount เพื่อกันหลุด Focus
    const otpName = useMemo(() => `otp_${Math.floor(Math.random() * 10000)}`, []);

    useEffect(() => {
        const savedLang = localStorage.getItem('app_lang') as 'th' | 'en'
        if (savedLang) setLang(savedLang)
    }, [])

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const toggleLang = () => {
        const newLang = lang === 'th' ? 'en' : 'th'
        setLang(newLang)
        localStorage.setItem('app_lang', newLang)
    }

    const t = {
        th: {
            title: 'สมัครสมาชิก', step2: 'ยืนยันรหัส OTP',
            user: 'ชื่อผู้ใช้', email: 'อีเมลของคุณ', pass: 'รหัสผ่าน', conf: 'ยืนยันรหัสผ่าน',
            btn: 'ส่งรหัส OTP', btn2: 'ยืนยันการสมัคร', back: 'กลับไปหน้าเข้าสู่ระบบ',
            matchErr: 'รหัสผ่านไม่ตรงกัน!', lenErr: 'รหัสผ่านต้องมี 6 ตัวขึ้นไป',
            otpPlace: 'รหัส OTP 6 หลัก', otpDesc: `รหัสถูกส่งไปที่ ${email}`,
            resend: 'ส่งรหัสอีกครั้ง', wait: 'กรุณารอ', backBtn: 'BACK',
        },
        en: {
            title: 'Sign Up', step2: 'Verify OTP',
            user: 'Username', email: 'Your Email', pass: 'Password', conf: 'Confirm Password',
            btn: 'Send OTP Code', btn2: 'Complete Register', back: 'Back to Login',
            matchErr: 'Passwords do not match!', lenErr: 'Password must be at least 6 characters',
            otpPlace: '6-Digit OTP', otpDesc: `Code sent to ${email}`,
            resend: 'Resend OTP', wait: 'Please wait', backBtn: 'BACK',
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')
        if (password !== confirmPassword) return setErrorMessage(t[lang].matchErr)
        if (password.length < 6) return setErrorMessage(t[lang].lenErr)
        setLoading(true)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: username } },
        })

        if (error) {
            if (error.message.includes('already registered')) {
                const { error: resendError } = await supabase.auth.resend({
                    type: 'signup', email: email,
                })
                if (resendError) {
                    setErrorMessage(resendError.message); setLoading(false)
                } else {
                    setStep(2); setCooldown(30); setLoading(false)
                }
            } else {
                setErrorMessage(error.message); setLoading(false)
            }
        } else {
            setStep(2); setLoading(false); setCooldown(30)
        }
    }

    const handleResendOTP = async () => {
        if (cooldown > 0) return
        setLoading(true)
        const { error } = await supabase.auth.resend({ type: 'signup', email: email })
        setLoading(false)
        if (error) setErrorMessage(error.message)
        else { setCooldown(30); setErrorMessage('') }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setErrorMessage('')
        const { error, data } = await supabase.auth.verifyOtp({
            email, token: otp, type: 'signup'
        })
        if (error) {
            setErrorMessage(error.message); setLoading(false)
        } else {
            if (data.user) {
                const finalUsername = data.user.user_metadata.display_name || username;
                await supabase.from('profiles').insert([
                    { id: data.user.id, username: finalUsername, email: email }
                ])
            }
            window.location.replace('/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
            <div className="absolute top-8 right-8 z-50">
                <button onClick={toggleLang} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl font-bold text-sm hover:scale-110 hover:rotate-3 active:scale-95 text-white uppercase transition-all duration-300 backdrop-blur-sm">
                    <Languages size={18} className="text-cyan-400" />
                    <span className="uppercase font-black">{lang.toUpperCase()}</span>
                </button>
            </div>

            <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16 bg-black overflow-hidden border-r border-white/5">
                    <img src="/koibg1.png" className="absolute inset-0 w-full h-full object-cover blur-[10px] brightness-[0.25] scale-110" alt="BG" />
                    <div className="relative z-20 text-center animate-in zoom-in duration-1000">
                        <img src="/koilogo.png" className="w-64 h-auto mx-auto mb-8 drop-shadow-[0_0_60px_rgba(34,211,238,0.5)]" alt="Logo" />
                        <h1 className="text-8xl font-black tracking-tighter text-white uppercase italic leading-none">Koi<span className="text-cyan-400">.</span>Detect</h1>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 bg-[#020617] relative z-10 shadow-[-40px_0_80px_rgba(0,0,0,0.8)]">
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase italic text-sm transition-all hover:scale-110 active:scale-95 animate-in slide-in-from-left-5">
                            <ArrowLeft size={20} className="text-cyan-400" />
                            {t[lang].backBtn}
                        </button>
                    )}

                    <div className="w-full max-w-[400px] space-y-8 md:space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
                        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white italic uppercase leading-none">{step === 1 ? t[lang].title : t[lang].step2}</h2>

                        <form onSubmit={step === 1 ? handleRegister : handleVerifyOTP} className="space-y-4" autoComplete="off">
                            <input type="text" name="dummy_email" style={{ display: 'none' }} tabIndex={-1} />
                            <input type="password" name="dummy_password" style={{ display: 'none' }} tabIndex={-1} />

                            {step === 1 ? (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                        <input type="text" name="new-username" placeholder={t[lang].user} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setUsername(e.target.value)} required />
                                    </div>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                        <input type="email" name="new-email" placeholder={t[lang].email} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                        <input type="password" name="new-password" placeholder={t[lang].pass} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                        <input type="password" name="confirm-password" placeholder={t[lang].conf} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in zoom-in duration-300">
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest text-center italic">{t[lang].otpDesc}</p>
                                    <div className="relative group">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" size={20} />
                                        <input
                                            type="text"
                                            name={otpName}
                                            maxLength={6}
                                            autoComplete="one-time-code"
                                            inputMode="numeric"
                                            placeholder={t[lang].otpPlace}
                                            value={otp || ''} // ป้องกัน undefined
                                            className="w-full pl-12 pr-4 py-5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-black text-center text-3xl tracking-[0.5em] transition-all"
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <button type="button" onClick={handleResendOTP} disabled={cooldown > 0 || loading} className={`flex items-center gap-2 text-xs font-black uppercase italic transition-all ${cooldown > 0 ? 'text-slate-600' : 'text-cyan-400 hover:text-cyan-300 hover:scale-105 active:scale-95'}`}>
                                            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                                            {cooldown > 0 ? `${t[lang].wait} (${cooldown}s)` : t[lang].resend}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {errorMessage && (
                                <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase italic px-2 animate-in slide-in-from-top-1">
                                    <AlertCircle size={14} /> {errorMessage}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/40 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 text-xl uppercase italic">
                                {loading ? '...' : (step === 1 ? t[lang].btn : t[lang].btn2)} <ArrowRight size={24} />
                            </button>

                            <Link href="/login" className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-cyan-400 transition-all uppercase italic hover:scale-105 pt-2">
                                <ArrowLeft size={16} /> {t[lang].back}
                            </Link>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}