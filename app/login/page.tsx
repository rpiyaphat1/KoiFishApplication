'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  Chrome, Facebook, Lock, User,
  ArrowRight, Eye, EyeOff, Languages, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'th' | 'en'>('th')
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const initAuth = async () => {
      const savedLang = localStorage.getItem('app_lang') as 'th' | 'en'
      if (savedLang) setLang(savedLang)

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      }
    }
    initAuth()
  }, [router])

  const toggleLang = () => {
    const newLang = lang === 'th' ? 'en' : 'th'
    setLang(newLang)
    localStorage.setItem('app_lang', newLang)
  }

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
    }
  }

  const content = {
    th: {
      signIn: 'เข้าสู่ระบบ', userOrEmail: 'ชื่อผู้ใช้ หรือ อีเมล',
      pass: 'รหัสผ่าน', forgot: 'ลืมรหัสผ่านใช่ไหม?',
      loginBtn: 'เข้าสู่ระบบ', noAcc: 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่',
      quickAccess: 'หรือ', errUser: 'ไม่พบชื่อผู้ใช้นี้ในระบบ'
    },
    en: {
      signIn: 'Sign In', userOrEmail: 'Username or Email',
      pass: 'Password', forgot: 'Forgot Password?',
      loginBtn: 'Login', noAcc: "Don't have an account? Sign Up",
      quickAccess: 'or', errUser: 'Username not found'
    }
  }

  const t = content[lang]

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    setErrorMessage('')
    let loginEmail = identifier;

    if (!identifier.includes('@')) {
      const { data, error: fetchError } = await supabase.from('profiles').select('email').eq('username', identifier).single();
      if (fetchError || !data) {
        setLoading(false);
        return setErrorMessage(t.errUser);
      }
      loginEmail = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
    } else {
      router.replace('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
      {/* Language Toggle - คง UI เดิมที่พี่ทำไว้ (Rotate + Scale) */}
      <div className="absolute top-8 right-8 z-50">
        <button onClick={toggleLang} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl font-bold text-sm hover:scale-110 hover:rotate-3 active:scale-95 text-white uppercase transition-all duration-300">
          <Languages size={18} className="text-cyan-400" />
          <span className="uppercase font-black">{lang.toUpperCase()}</span>
        </button>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
        {/* ส่วน Branding ด้านซ้าย - คง UI เดิมทั้งหมด */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16 bg-black overflow-hidden border-r border-white/5">
          <img src="/koibg1.png" className="absolute inset-0 w-full h-full object-cover blur-[10px] brightness-[0.25] scale-110" alt="BG" />
          <div className="relative z-20 text-center animate-in zoom-in duration-1000">
            <img src="/koilogo.png" className="w-64 h-auto mx-auto mb-8 drop-shadow-[0_0_60px_rgba(34,211,238,0.5)]" alt="Logo" />
            <h1 className="text-8xl font-black tracking-tighter text-white uppercase italic leading-none">Koi<span className="text-cyan-400">.</span>Detect</h1>
          </div>
        </div>

        {/* ส่วน Form ด้านขวา - ปรับ Padding สำหรับมือถือ แต่คง UI Interact ไว้ */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 bg-[#020617] relative z-10 shadow-[-40px_0_80px_rgba(0,0,0,0.8)]">

          {/* เพิ่มโลโก้เล็กๆ สำหรับ Mobile เท่านั้น */}
          <div className="lg:hidden flex flex-col items-center mb-8 animate-in fade-in zoom-in duration-700">
            <img src="/koilogo.png" className="w-24 h-auto mb-4 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" alt="Logo" />
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Koi<span className="text-cyan-400">.</span>Detect</h2>
          </div>

          <div className="w-full max-w-[400px] space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
            <h2 className="text-6xl font-black tracking-tight text-white italic uppercase leading-none">{t.signIn}</h2>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input type="text" placeholder={t.userOrEmail} className="w-full pl-12 pr-4 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setIdentifier(e.target.value)} required />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input type={showPassword ? "text" : "password"} placeholder={t.pass} className="w-full pl-12 pr-14 py-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-white focus:border-cyan-500 font-bold transition-all" onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors">{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}</button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase italic px-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={14} /> {errorMessage}
                </div>
              )}

              <div className="flex justify-end pr-1">
                <Link href="/forgot-password" className="text-sm font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase italic hover:scale-105 active:scale-95">{t.forgot}</Link>
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/40 transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 text-xl uppercase italic">
                {loading ? '...' : t.loginBtn} <ArrowRight size={24} />
              </button>
            </form>

            <div className="relative py-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <span className="relative px-6 bg-[#020617] text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic">{t.quickAccess}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-3 py-4 border border-slate-800 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:scale-105 hover:-rotate-2 active:scale-95 font-black text-xs text-white italic shadow-lg"
              >
                <Chrome size={20} className="text-red-500" /> GOOGLE
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('facebook')}
                className="flex items-center justify-center gap-3 py-4 bg-[#1877F2] text-white rounded-2xl hover:opacity-90 transition-all duration-300 hover:scale-105 hover:rotate-2 active:scale-95 font-black text-xs tracking-widest text-white italic shadow-lg"
              >
                <Facebook size={20} fill="white" /> FACEBOOK
              </button>
            </div>

            <div className="text-center pt-4">
              <Link href="/register" className="text-lg font-black text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 underline underline-offset-8 decoration-cyan-400/20 italic uppercase">
                {t.noAcc}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}