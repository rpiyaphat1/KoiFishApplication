'use client'
import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('System Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
            <div className="w-full max-w-[500px] text-center space-y-8 bg-slate-900/40 p-12 rounded-[3rem] border border-red-500/20 shadow-2xl animate-in zoom-in">
                <div className="flex justify-center">
                    <div className="p-5 bg-red-500/10 rounded-full">
                        <AlertCircle className="text-red-500" size={60} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black italic uppercase">System Error</h2>
                    <p className="text-slate-400 font-medium">เกิดข้อผิดพลาดบางอย่างในระบบ กรุณาลองใหม่อีกครั้ง</p>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <button
                        onClick={() => reset()}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase italic"
                    >
                        <RefreshCcw size={20} /> Try Again
                    </button>
                    <Link
                        href="/login"
                        className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-black rounded-2xl transition-all uppercase italic"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}