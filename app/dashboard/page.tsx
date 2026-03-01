'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
    LayoutDashboard, Video, Settings, LogOut,
    Languages, User as UserIcon, Activity, TrendingUp,
    ShieldCheck, Plus, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('dash')
    const [lang, setLang] = useState<'th' | 'en'>('th')
    const [userData, setUserData] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState<{ msg: string, type: 'error' | 'success' } | null>(null)
    const [cameras, setCameras] = useState<any[]>([])
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [passwords, setPasswords] = useState({ new: '', confirm: '' })

    const t = {
        th: {
            dash: "หน้าหลัก", live: "กล้องสด", set: "ตั้งค่า", out: "ออกจากระบบ",
            total: "ตรวจจับทั้งหมด", conf: "ความแม่นยำ", status: "สถานะ",
            myCam: "กล้องของฉัน", noCam: "ยังไม่ได้เชื่อมต่อกล้อง",
            profile: "จัดการโปรไฟล์", edit: "เปลี่ยนรหัสผ่าน", save: "บันทึกข้อมูล",
            passError: "รหัสผ่านไม่ตรงกัน!", success: "บันทึกสำเร็จ"
        },
        en: {
            dash: "Dashboard", live: "Live Cam", set: "Settings", out: "Sign Out",
            total: "Total Detect", conf: "Confidence", status: "Status",
            myCam: "My Cameras", noCam: "No Cameras Connected",
            profile: "User Profile", edit: "Change Pass", save: "Save Changes",
            passError: "Passwords do not match!", success: "Update Success"
        }
    }

    useEffect(() => {
        const initDashboard = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.replace('/login'); return; }
            setUserData(user)

            let { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (!profileData) {
                const def = user.email?.split('@')[0] || 'user'
                const { data: newP } = await supabase.from('profiles').upsert({ id: user.id, username: def }).select().single()
                profileData = newP
            }
            setProfile(profileData)
            fetchCameras(user.id)
            setLoading(false)
        }
        initDashboard()

        const clickOut = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsProfileOpen(false)
        }
        document.addEventListener('mousedown', clickOut)
        return () => document.removeEventListener('mousedown', clickOut)
    }, [router])

    const fetchCameras = async (userId: string) => {
        const { data } = await supabase.from('cameras').select('*').eq('user_id', userId)
        if (data) setCameras(data)
    }

    const showNotify = (msg: string, type: 'error' | 'success' = 'success') => {
        setNotification({ msg, type })
        setTimeout(() => setNotification(null), 3000)
    }

    const handleSaveProfile = async () => {
        setLoading(true)
        try {
            if (passwords.new && passwords.new === passwords.confirm) {
                const { error } = await supabase.auth.updateUser({ password: passwords.new })
                if (error) throw error
                showNotify(t[lang].success)
            } else if (passwords.new) {
                throw new Error(t[lang].passError)
            }
            setIsEditing(false)
            setPasswords({ new: '', confirm: '' })
        } catch (err: any) {
            showNotify(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/login')
    }

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="text-cyan-500 font-black animate-pulse uppercase tracking-[0.3em] italic">Syncing System...</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col lg:flex-row font-sans overflow-hidden selection:bg-cyan-500/30">

            {/* --- SIDEBAR (Desktop) --- */}
            <aside className="hidden lg:flex w-72 border-r border-white/5 bg-[#010409] flex-col p-6 fixed h-full z-[100]">
                <div className="flex items-center gap-4 mb-12 px-2">
                    <img src="/koilogo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
                    <span className="text-xl font-black italic tracking-tighter uppercase">Koi<span className="text-cyan-400">.</span>Detect</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <NavItem active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={LayoutDashboard} label={t[lang].dash} />
                    <NavItem active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon={Video} label={t[lang].live} />
                    <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label={t[lang].set} />
                </nav>
                <button onClick={handleLogout} className="mt-auto flex items-center gap-4 p-4 text-slate-500 hover:text-red-400 font-bold transition-all group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="uppercase text-[10px] font-black italic tracking-widest">{t[lang].out}</span>
                </button>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col lg:ml-72 relative h-screen overflow-hidden">

                {/* --- HEADER --- */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-[90]">
                    <div className="flex items-center gap-2 lg:hidden">
                        <img src="/koilogo.png" alt="Logo" className="w-8 h-8" />
                        <span className="font-black italic uppercase tracking-tighter text-sm">Koi<span className="text-cyan-400">.</span>D</span>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* 🌐 Interactive Language Switcher */}
                        <button
                            onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                            className="group relative flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl transition-all duration-300 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] active:scale-95 overflow-hidden"
                        >
                            <Languages size={16} className={`transition-colors duration-500 ${lang === 'th' ? 'text-cyan-400' : 'text-purple-400'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest transition-all group-hover:tracking-[0.2em]">
                                {lang === 'th' ? 'TH' : 'EN'}
                            </span>
                            <div className={`w-1 h-1 rounded-full ${lang === 'th' ? 'bg-cyan-400' : 'bg-purple-400'} animate-pulse shadow-[0_0_8px_currentColor]`} />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1.5 pr-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-900/20">
                                    <UserIcon size={16} />
                                </div>
                                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-[#0f172a] border border-white/10 rounded-2xl p-2 shadow-2xl animate-in zoom-in-95 backdrop-blur-2xl">
                                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Authenticated As</p>
                                        <p className="text-xs font-bold text-cyan-400 truncate italic">@{profile?.username}</p>
                                    </div>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-xs font-black text-red-400 hover:bg-red-500/10 rounded-xl transition-all uppercase italic">
                                        <LogOut size={16} /> {t[lang].out}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- TAB CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32">
                    {activeTab === 'dash' && (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard label={t[lang].total} value={cameras.length > 0 ? "1,240" : "0"} icon={TrendingUp} color="text-cyan-400" />
                                <StatCard label={t[lang].conf} value={cameras.length > 0 ? "98.5%" : "0%"} icon={ShieldCheck} color="text-purple-400" />
                                <StatCard label={t[lang].status} value={cameras.length > 0 ? "Active" : "Idle"} icon={Activity} color="text-emerald-400" />
                            </div>
                            {/* Placeholder for Data Viz */}
                            <div className="h-64 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center border-dashed">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-10 italic italic">Visualizing Analytics...</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'live' && (
                        <div className="animate-in fade-in slide-in-from-right-6 duration-500 space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{t[lang].live}</h2>
                                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-2">Real-time object tracking</p>
                                </div>
                                <button className="p-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-900/40 transition-all active:scale-90">
                                    <Plus size={24} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {cameras.length > 0 ? cameras.map(cam => (
                                    <div key={cam.id} className="group aspect-video bg-black rounded-[2.5rem] border border-white/5 relative overflow-hidden ring-1 ring-white/0 hover:ring-cyan-500/50 transition-all">
                                        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full shadow-lg shadow-red-900/20">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                            <span className="text-[8px] font-black uppercase italic tracking-widest">Live Stream</span>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
                                        <Video size={48} className="opacity-5 group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                )) : (
                                    <div className="col-span-full py-32 text-center">
                                        <Video size={40} className="mx-auto mb-4 opacity-10" />
                                        <p className="text-xs font-black uppercase italic tracking-[0.3em] opacity-20">{t[lang].noCam}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-in fade-in slide-in-from-right-6 duration-500 max-w-2xl mx-auto space-y-8">
                            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{t[lang].profile}</h2>
                                <button
                                    onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true) }}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-cyan-600 shadow-cyan-900/40'} shadow-lg active:scale-95`}
                                >
                                    {isEditing ? t[lang].save : t[lang].edit}
                                </button>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Account</label>
                                    <div className="p-5 bg-[#010409] rounded-2xl border border-white/5 text-sm font-bold opacity-60">
                                        {userData?.email}
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="space-y-4 pt-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">New Password</label>
                                            <input type="password" placeholder="••••••••" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full p-5 bg-slate-900 border border-white/5 focus:border-cyan-500/50 rounded-2xl text-sm outline-none transition-all font-mono" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                            <input type="password" placeholder="••••••••" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full p-5 bg-slate-900 border border-white/5 focus:border-cyan-500/50 rounded-2xl text-sm outline-none transition-all font-mono" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MOBILE NAV --- */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#010409]/90 backdrop-blur-2xl border-t border-white/10 px-6 py-4 z-[150] flex items-center justify-around">
                    <MobileNavItem active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={LayoutDashboard} label="Home" />
                    <MobileNavItem active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon={Video} label="Live" />
                    <MobileNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="Setup" />
                    <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-red-500/50 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Exit</span>
                    </button>
                </nav>
            </main>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-10 duration-500 border ${notification.type === 'error' ? 'bg-red-950 border-red-500 text-red-200' : 'bg-emerald-950 border-emerald-500 text-emerald-200'}`}>
                    {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{notification.msg}</span>
                </div>
            )}
        </div>
    )
}

// --- SUB-COMPONENTS ---

function NavItem({ active, onClick, icon: Icon, label }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-900/40' : 'text-slate-500 hover:bg-white/5'}`}>
            <Icon size={20} className={`${active ? 'scale-110' : 'group-hover:text-white transition-colors'}`} />
            <span className={`font-black uppercase text-[10px] tracking-[0.2em] italic ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{label}</span>
        </button>
    )
}

function MobileNavItem({ active, onClick, icon: Icon, label }: any) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}>
            <Icon size={22} className={active ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''} />
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        </button>
    )
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-3 mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className={`p-2 rounded-lg bg-black border border-white/5 ${color}`}>
                    <Icon size={16} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className="text-4xl font-black italic tracking-tighter group-hover:text-cyan-400 transition-colors">{value}</p>
        </div>
    )
}