'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
    LayoutDashboard, Video, Settings, LogOut,
    Languages, User as UserIcon, Activity, TrendingUp,
    ShieldCheck, Plus, Camera, X, Info, Trash2, ShieldAlert, Lock, ChevronDown, Edit2
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
    const [isAddCamOpen, setIsAddCamOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [passwords, setPasswords] = useState({ new: '', confirm: '' })

    const t = {
        th: {
            dash: "หน้าหลัก", live: "กล้องสด", set: "ตั้งค่า", out: "ออก",
            total: "ตรวจจับทั้งหมด", conf: "ความแม่นยำ", status: "สถานะ",
            myCam: "กล้องของฉัน", noCam: "ยังไม่ได้เชื่อมต่อ",
            reg: "เพิ่มกล้อง IP", connect: "บันทึกข้อมูล",
            profile: "ข้อมูลผู้ใช้งาน", edit: "เปลี่ยนรหัสผ่าน", save: "บันทึก",
            empty: "ไม่มีข้อมูล", passError: "รหัสผ่านไม่ตรงกัน!"
        },
        en: {
            dash: "Home", live: "Live", set: "Set", out: "Exit",
            total: "Total", conf: "Confidence", status: "Status",
            myCam: "My Camera", noCam: "No Camera",
            reg: "Add IP Camera", connect: "Save & Connect",
            profile: "Settings", edit: "Edit Pass", save: "Save",
            empty: "EMPTY", passError: "Match Error!"
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
            setProfile(profileData); fetchCameras(user.id); setLoading(false)
        }
        initDashboard()
        const clickOut = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsProfileOpen(false) }
        document.addEventListener('mousedown', clickOut)
        return () => document.removeEventListener('mousedown', clickOut)
    }, [router])

    const fetchCameras = async (userId: string) => {
        const { data } = await supabase.from('cameras').select('*').eq('user_id', userId)
        if (data) setCameras(data)
    }

    const showNotify = (msg: string, type: 'error' | 'success' = 'success') => {
        setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000)
    }

    const handleSaveProfile = async () => {
        setLoading(true)
        try {
            if (passwords.new && passwords.new === passwords.confirm) {
                await supabase.auth.updateUser({ password: passwords.new })
                showNotify(lang === 'th' ? 'สำเร็จ' : 'Success')
            } else if (passwords.new) throw new Error(t[lang].passError)
            setIsEditing(false); setPasswords({ new: '', confirm: '' })
        } catch (err: any) { showNotify(err.message, 'error') }
        finally { setLoading(false) }
    }

    const handleLogout = async () => { await supabase.auth.signOut(); router.replace('/login') }

    if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-500 font-black animate-pulse uppercase">Syncing...</div>

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col lg:flex-row font-sans overflow-hidden">

            {/* --- SIDEBAR (Desktop Only) --- */}
            <aside className="hidden lg:flex w-72 border-r border-white/5 bg-[#010409] flex-col p-6 fixed h-full z-[100]">
                <div className="flex items-center gap-4 mb-12 px-2">
                    <img src="/koilogo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    <span className="text-xl font-black italic tracking-tighter uppercase">Koi<span className="text-cyan-400">.</span>Detect</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <NavItem active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={LayoutDashboard} label={t[lang].dash} />
                    <NavItem active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon={Video} label={t[lang].live} />
                    <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label={t[lang].set} />
                </nav>
                <button onClick={handleLogout} className="mt-auto flex items-center gap-4 p-4 text-slate-500 hover:text-red-400 font-bold transition-all group">
                    <LogOut size={20} /> <span className="uppercase text-xs tracking-widest font-black italic">{t[lang].out}</span>
                </button>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col lg:ml-72 relative h-screen">

                {/* Top Header (Clean) */}
                <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-[90]">
                    {/* Logo Mobile */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <img src="/koilogo.png" alt="Logo" className="w-6 h-6" />
                        <span className="text-sm font-black italic uppercase">Koi<span className="text-cyan-400">.</span>D</span>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <button onClick={() => { setLang(lang === 'th' ? 'en' : 'th') }} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-cyan-500/10 transition-all uppercase">
                            {lang}
                        </button>
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 pr-2 bg-white/5 border border-white/10 rounded-xl">
                                <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center text-white"><UserIcon size={14} /></div>
                                <ChevronDown size={12} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl p-2 shadow-2xl animate-in zoom-in-95">
                                    <p className="px-3 py-2 text-[10px] text-slate-500 font-bold truncate">@{profile?.username}</p>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><LogOut size={14} /> {t[lang].out}</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 lg:pb-8">
                    {activeTab === 'dash' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatCard label={t[lang].total} value={cameras.length > 0 ? "1,240" : "0"} icon={TrendingUp} color="text-cyan-400" />
                                <StatCard label={t[lang].conf} value={cameras.length > 0 ? "98%" : "N/A"} icon={ShieldCheck} color="text-purple-400" />
                                <StatCard label={t[lang].status} value={cameras.length > 0 ? "Online" : "Idle"} icon={Activity} color="text-green-400" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'live' && (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl lg:text-3xl font-black italic uppercase tracking-widest">{t[lang].live}</h2>
                                <button onClick={() => setIsAddCamOpen(true)} className="p-2 bg-cyan-600 rounded-lg"><Plus size={20} /></button>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {cameras.length > 0 ? cameras.map(cam => (
                                    <div key={cam.id} className="aspect-video bg-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full text-[8px] font-black animate-pulse">LIVE</div>
                                        <Video size={40} className="opacity-10" />
                                    </div>
                                )) : <div className="py-20 text-center opacity-20 italic text-xs uppercase">{t[lang].noCam}</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-in fade-in slide-in-from-right-4 max-w-xl mx-auto space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl lg:text-3xl font-black italic uppercase">{t[lang].profile}</h2>
                                <button onClick={() => { if (isEditing) handleSaveProfile(); else setIsEditing(true) }} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${isEditing ? 'bg-emerald-600' : 'bg-cyan-600'}`}>
                                    {isEditing ? t[lang].save : t[lang].edit}
                                </button>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Linked Email</p>
                                    <p className="text-sm font-bold truncate">{userData?.email}</p>
                                </div>
                                {isEditing && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <input type="password" placeholder="New Password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full p-4 bg-slate-900 border border-purple-500/30 rounded-2xl text-sm outline-none" />
                                        <input type="password" placeholder="Confirm Password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full p-4 bg-slate-900 border border-purple-500/30 rounded-2xl text-sm outline-none" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MOBILE BOTTOM NAV (Visible only on small screens) --- */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#010409]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-3 z-[150] flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                    <MobileNavItem active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={LayoutDashboard} label="Home" />
                    <MobileNavItem active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon={Video} label="Live" />
                    <MobileNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="Set" />
                    <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-500/40"><LogOut size={20} /><span className="text-[8px] font-black uppercase">Exit</span></button>
                </nav>
            </main>

            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 bg-cyan-600 rounded-full text-[10px] font-black uppercase shadow-2xl border border-white/20 animate-in slide-in-from-top-4">
                    {notification.msg}
                </div>
            )}
        </div>
    )
}

// --- Sub-Components เพื่อความเป็นระเบียบ ---
function NavItem({ active, onClick, icon: Icon, label }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <Icon size={20} /> <span className="font-bold uppercase text-xs tracking-widest">{label}</span>
        </button>
    )
}

function MobileNavItem({ active, onClick, icon: Icon, label }: any) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-cyan-400 scale-110' : 'text-slate-500'}`}>
            <Icon size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
        </button>
    )
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 opacity-50">
                <Icon size={14} className={color} />
                <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xl font-black italic">{value}</p>
        </div>
    )
}