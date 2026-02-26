'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
    LayoutDashboard, Video, Settings, LogOut,
    Languages, User as UserIcon, Activity, TrendingUp,
    ShieldCheck, Plus, Camera, X, Info, Edit2, Trash2, ShieldAlert, Lock, Mail
} from 'lucide-react'

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('dash')
    const [lang, setLang] = useState<'th' | 'en'>('th')
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState<{ msg: string, type: 'error' | 'success' } | null>(null)
    const [cameras, setCameras] = useState<any[]>([]) // เริ่มต้นไม่มีกล้อง
    const [isAddCamOpen, setIsAddCamOpen] = useState(false)
    const [editingCam, setEditingCam] = useState<any>(null)

    // Dictionary สำหรับเปลี่ยนภาษา
    const t = {
        th: {
            dash: "แผงควบคุม", live: "กล้องสด", set: "ตั้งค่าระบบ", out: "ออกจากระบบ",
            total: "ตรวจจับทั้งหมด", conf: "ความแม่นยำ AI", status: "สถานะระบบ",
            myCam: "กล้องของฉัน", limit: "จำกัด 1 กล้องต่อบัญชี", noCam: "ยังไม่ได้เชื่อมต่อกล้อง",
            reg: "ลงทะเบียนกล้อง IP", name: "ชื่ออุปกรณ์", ip: "ที่อยู่ IP", port: "พอร์ต",
            user: "ชื่อผู้ใช้ (Username)", pass: "รหัสผ่าน (Password)", connect: "เชื่อมต่ออุปกรณ์",
            profile: "ข้อมูลผู้ใช้งาน", changeEmail: "เปลี่ยนอีเมล", changePass: "ความปลอดภัย",
            newPass: "รหัสผ่านใหม่", confirmPass: "ยืนยันรหัสผ่านใหม่", update: "อัปเดตข้อมูล",
            verifyMsg: "ส่งลิงก์ยืนยันไปที่ Gmail ใหม่แล้ว!", passError: "รหัสผ่านไม่ตรงกัน!",
            passSuccess: "เปลี่ยนรหัสผ่านสำเร็จ!", socialTip: "* บัญชี Social ไม่สามารถเปลี่ยนรหัสผ่านที่นี่ได้",
            online: "ออนไลน์", idle: "รอการเชื่อมต่อ"
        },
        en: {
            dash: "Dashboard", live: "Live Camera", set: "Settings", out: "Logout",
            total: "Total Detected", conf: "AI Confidence", status: "System Status",
            myCam: "My Camera", limit: "1 Camera Per Account", noCam: "No Camera Connected",
            reg: "Register IP Camera", name: "Device Name", ip: "IP Address", port: "Port",
            user: "Username", pass: "Password", connect: "Authorize & Connect",
            profile: "User Profile", changeEmail: "Change Email", changePass: "Security",
            newPass: "New Password", confirmPass: "Confirm Password", update: "Apply Changes",
            verifyMsg: "Verification link sent to new Gmail!", passError: "Passwords do not match!",
            passSuccess: "Password updated!", socialTip: "* Password managed via Social Provider",
            online: "Online", idle: "Idle"
        }
    }

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) window.location.href = '/login'
            else setUserData(user)
        }
        checkUser()
    }, [])

    const showNotify = (msg: string, type: 'error' | 'success' = 'success') => {
        setNotification({ msg, type })
        setTimeout(() => setNotification(null), 3000)
    }

    const handleDelete = (id: number) => {
        setCameras([])
        showNotify(lang === 'th' ? 'ลบข้อมูลสำเร็จ' : 'Deleted Successfully')
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const isEmailUser = userData?.app_metadata?.provider === 'email'

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans selection:bg-cyan-500/30 overflow-hidden text-white">

            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className={`px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                        }`}>
                        <Info size={18} />
                        <span className="font-bold text-sm uppercase tracking-tight">{notification.msg}</span>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-72 border-r border-white/5 bg-[#010409] flex flex-col p-6 hidden lg:flex">
                <div className="flex items-center gap-4 mb-12 px-2">
                    <img src="/koilogo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    <span className="text-xl font-black italic tracking-tighter">Koi<span className="text-cyan-400">.</span>Detect</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <button onClick={() => setActiveTab('dash')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'dash' ? 'bg-cyan-600 shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}>
                        <LayoutDashboard size={20} /> <span className="font-bold uppercase text-xs tracking-widest">{t[lang].dash}</span>
                    </button>
                    <button onClick={() => setActiveTab('live')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === 'live' ? 'bg-cyan-600 shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}>
                        <Video size={20} /> <span className="font-bold uppercase text-xs tracking-widest">{t[lang].live}</span>
                    </button>
                </nav>
                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 text-slate-500 hover:text-red-400 font-bold transition-all group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> {t[lang].out}
                </button>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* TOPBAR */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl z-10">
                    <div className="font-black text-2xl text-cyan-400 uppercase tracking-tight">
                        {userData?.user_metadata?.display_name || userData?.email?.split('@')[0]}
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setLang(lang === 'th' ? 'en' : 'th')} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl font-black text-xs hover:scale-110 transition-all flex items-center gap-2">
                            <Languages size={16} className="text-cyan-400" /> {lang.toUpperCase()}
                        </button>

                        <div className="group relative cursor-pointer">
                            <div className="w-10 h-10 rounded-full border border-cyan-500/20 overflow-hidden hover:border-cyan-400 transition-all">
                                {userData?.user_metadata?.avatar_url ? (
                                    <img src={userData.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-cyan-400"><UserIcon size={20} /></div>
                                )}
                            </div>
                            <div className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-white/10 rounded-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
                                <button onClick={() => setActiveTab('settings')} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-cyan-400 rounded-xl transition-all">
                                    <Settings size={18} /> {t[lang].set}
                                </button>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
                                    <LogOut size={18} /> {t[lang].out}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 overflow-y-auto space-y-8 h-full">
                    {activeTab === 'dash' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard icon={<TrendingUp className="text-cyan-400" />} label={t[lang].total} value={cameras.length > 0 ? "1,240" : "0"} />
                                <StatCard icon={<ShieldCheck className="text-purple-400" />} label={t[lang].conf} value={cameras.length > 0 ? "98.2%" : "N/A"} />
                                <StatCard icon={<Activity className="text-green-400" />} label={t[lang].status} value={cameras.length > 0 ? t[lang].online : t[lang].idle} isStatus={cameras.length > 0} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                                <div className="lg:col-span-2 aspect-video bg-black rounded-[2.5rem] border border-white/10 relative flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                                    {cameras.length > 0 ? (
                                        <div className="absolute top-8 left-8 flex items-center gap-3 bg-red-600 px-4 py-2 rounded-full z-10 border border-white/20">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            <span className="text-xs font-black uppercase text-white tracking-widest">{lang === 'th' ? 'ถ่ายทอดสด' : 'Live'}</span>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-4 animate-pulse opacity-30">
                                            <ShieldAlert size={60} />
                                            <p className="font-black uppercase tracking-widest text-sm">{t[lang].noCam}</p>
                                        </div>
                                    )}
                                    <Video size={100} className="text-slate-800 opacity-20" />
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl h-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black italic uppercase">{t[lang].myCam}</h3>
                                        {cameras.length === 0 && (
                                            <button onClick={() => { setEditingCam(null); setIsAddCamOpen(true) }} className="p-2 bg-cyan-600 rounded-lg hover:scale-110 transition-all">
                                                <Plus size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        {cameras.length > 0 ? (
                                            cameras.map(cam => (
                                                <div key={cam.id} className="group/item flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <Camera size={18} className="text-cyan-400" />
                                                        <div className="flex flex-col"><span className="text-sm font-bold text-slate-300">{cam.name}</span><span className="text-[10px] text-slate-500 font-mono italic">{cam.ip}</span></div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                                                        <button onClick={() => { setEditingCam(cam); setIsAddCamOpen(true) }} className="p-2 text-slate-500 hover:text-cyan-400"><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDelete(cam.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex-1 flex items-center justify-center text-slate-700 italic text-xs py-10 border-2 border-dashed border-white/5 rounded-3xl">EMPTY</div>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-600 mt-4 uppercase font-bold tracking-widest text-center">{t[lang].limit}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto space-y-8 pb-20 font-sans">
                            <h2 className="text-4xl font-black italic text-center uppercase tracking-tight mb-12">{t[lang].profile}</h2>

                            {isEmailUser ? (
                                <div className="space-y-8">
                                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-2xl">
                                        <div className="flex items-center gap-4 font-black"><Mail className="text-cyan-400" /> {t[lang].changeEmail}</div>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            const newEmail = (e.target as any).newEmail.value;
                                            setLoading(true);
                                            const { error } = await supabase.auth.updateUser({ email: newEmail });
                                            setLoading(false);
                                            if (error) showNotify(error.message, 'error');
                                            else showNotify(t[lang].verifyMsg, 'success');
                                        }} className="space-y-4">
                                            <input name="newEmail" type="email" placeholder="new-gmail@gmail.com" className="w-full p-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 font-bold" required />
                                            <button type="submit" disabled={loading} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest">{t[lang].update}</button>
                                        </form>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-2xl">
                                        <div className="flex items-center gap-4 font-black"><Lock className="text-purple-400" /> {t[lang].changePass}</div>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            const p1 = (e.target as any).p1.value;
                                            const p2 = (e.target as any).p2.value;
                                            if (p1 !== p2) return showNotify(t[lang].passError, 'error');
                                            setLoading(true);
                                            const { error } = await supabase.auth.updateUser({ password: p1 });
                                            setLoading(false);
                                            if (error) showNotify(error.message, 'error');
                                            else { showNotify(t[lang].passSuccess, 'success'); (e.target as any).reset(); }
                                        }} className="space-y-4">
                                            <input name="p1" type="password" placeholder={t[lang].newPass} className="w-full p-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-purple-500 font-bold" required />
                                            <input name="p2" type="password" placeholder={t[lang].confirmPass} className="w-full p-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-purple-500 font-bold" required />
                                            <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-600 rounded-2xl font-black uppercase tracking-widest">{t[lang].update}</button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3rem] text-center space-y-6 shadow-2xl relative group">
                                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full"></div>
                                    <div className="w-32 h-32 rounded-full border-4 border-cyan-500/20 p-1 mx-auto overflow-hidden"><img src={userData?.user_metadata?.avatar_url} className="w-full h-full object-cover" /></div>
                                    <div className="space-y-1"><h3 className="text-3xl font-black">{userData?.user_metadata?.display_name}</h3><p className="text-cyan-400 font-bold text-sm tracking-widest uppercase italic">Connected via {userData?.app_metadata?.provider}</p></div>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">{t[lang].socialTip}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* REGISTER MODAL */}
            {isAddCamOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-[#020617] border border-white/10 p-10 rounded-[3rem] w-full max-w-xl relative animate-in zoom-in duration-200 shadow-2xl">
                        <button onClick={() => setIsAddCamOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24} /></button>
                        <h3 className="text-3xl font-black mb-8 italic text-white underline decoration-cyan-500 decoration-4 underline-offset-8 uppercase">{t[lang].reg}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const f = new FormData(e.target as any);
                            setCameras([{ id: Date.now(), name: f.get('name'), ip: f.get('ip') }]);
                            setIsAddCamOpen(false);
                            showNotify(lang === 'th' ? 'เชื่อมต่อสำเร็จ' : 'Success');
                        }} className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                            <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">{t[lang].name}</label><input name="name" defaultValue={editingCam?.name} type="text" placeholder="Koi Pond 1" className="w-full p-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 font-bold" required /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">{t[lang].ip}</label><input name="ip" defaultValue={editingCam?.ip} type="text" placeholder="192.168.x.x" className="w-full p-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 font-bold" required /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">{t[lang].port}</label><input name="port" type="text" defaultValue="554" className="w-full p-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 font-bold" required /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">{t[lang].user}</label><input name="user" type="text" placeholder="Username" className="w-full p-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 font-bold" required /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">{t[lang].pass}</label><input name="pass" type="password" placeholder="••••••••" className="w-full p-4.5 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-cyan-500 font-bold" required /></div>
                            <button type="submit" className="md:col-span-2 py-5 bg-cyan-600 hover:bg-cyan-500 rounded-[1.25rem] font-black text-xl transition-all shadow-xl shadow-cyan-900/40 mt-4 uppercase tracking-widest">{t[lang].connect}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({ icon, label, value, isStatus = false }: { icon: any, label: string, value: string, isStatus?: boolean }) {
    return (
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.04] transition-all group font-sans">
            <div className="flex items-center gap-4 mb-4 font-sans">
                <div className="p-3 bg-slate-900 rounded-xl group-hover:scale-110 transition-all shadow-lg">{icon}</div>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-end gap-2 leading-none font-sans">
                <span className="text-4xl font-black text-white">{value}</span>
                {isStatus && <div className="w-3 h-3 bg-green-500 rounded-full mb-2 animate-pulse" />}
            </div>
        </div>
    )
}