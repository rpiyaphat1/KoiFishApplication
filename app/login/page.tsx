'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Chrome, Facebook, Mail, Lock, User,
  ArrowRight, Eye, EyeOff, ShieldCheck, Zap, CheckCircle2, Languages
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function KoiDetectAuth() {
  const [lang, setLang] = useState<'th' | 'en'>('th')
  const [isLoginView, setIsLoginView] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const content = {
    th: {
      signIn: 'เข้าสู่ระบบ',
      signUp: 'สมัครสมาชิก',
      userOrEmail: 'ชื่อผู้ใช้ หรือ อีเมล',
      pass: 'รหัสผ่าน',
      confPass: 'ยืนยันรหัสผ่าน',
      forgot: 'ลืมรหัสผ่านใช่ไหม?',
      loginBtn: 'เข้าสู่ระบบ',
      joinBtn: 'สมัครตอนนี้',
      noAcc: 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่',
      hasAcc: 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ',
      quickAccess: 'หรือ',
      checkEmail: 'เช็คอีเมลของคุณ',
      sentDetail: 'เราได้ส่งลิงก์ยืนยันตัวตนไปที่อีเมลของคุณแล้ว',
      backLogin: 'กลับไปหน้าเข้าสู่ระบบ'
    },
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      userOrEmail: 'Username or Email',
      pass: 'Password',
      confPass: 'Confirm Password',
      forgot: 'Forgot Password?',
      loginBtn: 'Login',
      joinBtn: 'Join Now',
      noAcc: "Don't have an account? Sign Up",
      hasAcc: 'Already have an account? Sign In',
      quickAccess: 'or',
      checkEmail: 'Check your email',
      sentDetail: 'We have sent a confirmation link to your email.',
      backLogin: 'Back to Login'
    }
  }

  const t = content[lang]

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) alert(error.message)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    if (isLoginView) {
      let loginEmail = identifier;
      if (!identifier.includes('@')) {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single();
        if (fetchError || !data) {
          setLoading(false);
          return alert(lang === 'th' ? 'ไม่พบชื่อผู้ใช้นี้' : 'Username not found');
        }
        loginEmail = data.email;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
      if (error) alert(error.message)
      else window.location.href = '/dashboard'
    } else {
      if (password !== confirmPassword) {
        setLoading(false)
        return alert(lang === 'th' ? 'รหัสผ่านไม่ตรงกัน!' : 'Passwords do not match!')
      }
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { display_name: username } }
      })
      if (error) alert(error.message)
      else setIsSent(true)
    }
    setLoading(false)
  }

  if (isSent) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-[450px] text-center space-y-6 bg-slate-900/40 p-12 rounded-[3rem] border border-cyan-500/20 shadow-2xl">
          <CheckCircle2 className="text-cyan-400 mx-auto" size={80} />
          <h2 className="text-3xl font-black">{t.checkEmail}</h2>
          <p className="text-slate-400 font-medium">{t.sentDetail}</p>
          <button onClick={() => setIsSent(false)} className="text-cyan-400 font-bold underline">{t.backLogin}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30">

      {/*ปุ่มสลับภาษา ขวาบน */}
      <div className="absolute top-8 right-8 z-50">
        <button
          onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
          className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 hover:bg-white/10"
        >
          <Languages size={18} className="text-cyan-400" />
          <span className="uppercase">{lang === 'th' ? 'English' : 'THAI'}</span>
        </button>
      </div>

      <main className="min-h-screen flex flex-col lg:flex-row">
        {/* --- ฝั่งซ้าย: Branding Area --- */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16 overflow-hidden bg-black">
          <div className="absolute inset-0 w-full h-full z-0">
            <img src="/koibg1.png" alt="Koi Background" className="w-full h-full object-cover blur-[10px] brightness-[0.25] scale-110" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-transparent to-cyan-900/10 z-10"></div>
          </div>
          <div className="relative z-20 flex flex-col items-center text-center">
            <div className="mb-6 animate-in zoom-in duration-1000">
              <img src="/koilogo.png" alt="KoiDetect Logo" className="w-64 h-auto drop-shadow-[0_0_60px_rgba(34,211,238,0.5)]" />
            </div>
            <h1 className="text-8xl font-black tracking-tighter mb-4 text-white drop-shadow-2xl">
              Koi<span className="text-cyan-400">.</span>Detect
            </h1>
          </div>
        </div>

        {/* --- ฝั่งขวา: Form Area --- */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-16 bg-[#020617] z-30 shadow-[-40px_0_80px_rgba(0,0,0,0.8)]">
          <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-right-10 duration-700">
            <h2 className="text-6xl font-black tracking-tight">{isLoginView ? t.signIn : t.signUp}</h2>

            <form onSubmit={handleAuth} className="space-y-4">
              {isLoginView ? (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                  <input type="text" placeholder={t.userOrEmail} className="w-full pl-12 pr-4 py-4.5 bg-slate-900/50 border border-slate-800 rounded-2xl focus:border-cyan-500 outline-none text-white font-medium" onChange={(e) => setIdentifier(e.target.value)} required />
                </div>
              ) : (
                <>
                  <div className="relative group"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} /><input type="text" placeholder="Username" className="w-full pl-12 py-4.5 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none text-white" onChange={(e) => setUsername(e.target.value)} required /></div>
                  <div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} /><input type="email" placeholder="Email Address" className="w-full pl-12 py-4.5 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none text-white" onChange={(e) => setEmail(e.target.value)} required /></div>
                </>
              )}

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input type={showPassword ? "text" : "password"} placeholder={t.pass} className="w-full pl-12 pr-14 py-4.5 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none text-white" onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400">{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}</button>
              </div>

              {!isLoginView && (
                <div className="relative group"><ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} /><input type="password" placeholder={t.confPass} className="w-full pl-12 py-4.5 bg-slate-900/50 border border-slate-800 rounded-2xl outline-none text-white" onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
              )}

              {isLoginView && (
                <div className="flex justify-end pr-1"><button type="button" onClick={() => alert('Reset link sent!')} className="text-sm font-bold text-slate-500 hover:text-cyan-400">{t.forgot}</button></div>
              )}

              <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 text-xl hover:scale-105 active:scale-95">
                {loading ? '...' : (isLoginView ? t.loginBtn : t.joinBtn)} <ArrowRight size={24} />
              </button>
            </form>

            <div className="relative py-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <span className="relative px-6 bg-[#020617] text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{t.quickAccess}</span>
            </div>

            {/* Social Buttons พร้อม Interaction เอียง+ขยาย */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-3 py-4 border border-slate-800 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:scale-105 hover:-rotate-2 active:scale-95 font-black text-xs tracking-widest"
              >
                <Chrome size={20} className="text-red-500" /> GOOGLE
              </button>
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center gap-3 py-4 bg-[#1877F2] text-white rounded-2xl hover:opacity-90 transition-all duration-300 hover:scale-105 hover:rotate-2 active:scale-95 font-black text-xs tracking-widest"
              >
                <Facebook size={20} fill="white" /> FACEBOOK
              </button>
            </div>

            <div className="text-center">
              <button onClick={() => setIsLoginView(!isLoginView)} className="text-lg font-black text-cyan-400 hover:text-cyan-300 transition-colors">
                {isLoginView ? t.noAcc : t.hasAcc}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}