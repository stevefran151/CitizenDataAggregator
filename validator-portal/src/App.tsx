import { useState, useEffect } from 'react'
import {
    ShieldCheck,
    Activity,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Globe,
    Database,
    FlaskConical,
    ChevronRight,
    Search,
    RefreshCw,
    Terminal,
    Clock,
    ExternalLink
} from 'lucide-react'
import axios from 'axios'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const API_BASE = "http://localhost:8000/api"

interface Observation {
    id: number
    type: string
    value: number
    lat: number
    long: number
    is_valid: boolean
    timestamp: string
    needs_review: boolean
    is_expert: boolean
    validation_report?: any
}

export default function App() {
    const [queue, setQueue] = useState<Observation[]>([])
    const [selectedObs, setSelectedObs] = useState<Observation | null>(null)
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState<number | null>(null)
    const [filter, setFilter] = useState<'pending' | 'rejected' | 'all'>('pending')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [token, setToken] = useState("")

    useEffect(() => {
        const savedToken = localStorage.getItem("expertToken")
        if (savedToken) {
            setToken(savedToken)
            setIsAuthenticated(true)
        }
    }, [])

    const fetchQueue = async () => {
        try {
            const res = await axios.get(`${API_BASE}/v1/data`)
            const data = res.data
            let filtered = data
            if (filter === 'pending') filtered = data.filter((o: Observation) => o.needs_review)
            else if (filter === 'rejected') filtered = data.filter((o: Observation) => !o.is_valid && !o.needs_review)

            setQueue(filtered.sort((a: any, b: any) => b.id - a.id))
            // Auto-select first if none selected
            if (!selectedObs && filtered.length > 0) setSelectedObs(filtered[0])
        } catch (err) {
            console.error("Queue fetch failed", err)
        }
    }

    const handleAudit = async (isValid: boolean) => {
        if (!selectedObs || !token) return
        setProcessing(selectedObs.id)
        try {
            await axios.put(`${API_BASE}/observations/${selectedObs.id}/validate?is_valid=${isValid}&expert_token=${token}`)
            await fetchQueue()
            // Select next item in queue or null
            const nextIndex = queue.findIndex(o => o.id === selectedObs.id) + 1
            if (nextIndex < queue.length) setSelectedObs(queue[nextIndex])
            else if (queue.length > 1) setSelectedObs(queue[0])
            else setSelectedObs(null)
        } catch (err) {
            alert("Audit synchronization failed. Backend unreachable.")
        } finally {
            setProcessing(null)
        }
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (token) {
            localStorage.setItem("expertToken", token)
            setIsAuthenticated(true)
            fetchQueue()
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 p-6">
                <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-2xl shadow-indigo-500/10">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                            <ShieldCheck className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h1 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">Sentinel Authorization</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Environmental Intelligence Access Point</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Network Identity</label>
                            <input
                                disabled
                                value="EXPERT_NODE_01"
                                className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-mono text-slate-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Security Key (Physical Token)</label>
                            <input
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-12 bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 text-xs font-mono text-white outline-none transition-all"
                            />
                        </div>
                        <button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/10 transition-all">
                            Synchronize & Enter
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden select-none">
            {/* SIDEBAR: Audit Queue */}
            <aside className="w-80 border-r border-slate-800 flex flex-col bg-[#030712]">
                <header className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-black tracking-tighter uppercase italic text-sm">Sentinel Portal</h1>
                    </div>
                    <button onClick={fetchQueue} className="text-slate-500 hover:text-indigo-400 transition transform active:rotate-180 duration-500">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </header>

                <div className="p-4 flex gap-2">
                    {['pending', 'rejected', 'all'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border",
                                filter === f ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto audit-scrollbar px-3 space-y-2 pb-10">
                    {queue.length === 0 ? (
                        <div className="py-20 text-center space-y-3">
                            <div className="w-10 h-10 border-2 border-dashed border-slate-800 rounded-full mx-auto flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-slate-800" />
                            </div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">Queue Liquidated</p>
                        </div>
                    ) : queue.map((obs) => (
                        <button
                            key={obs.id}
                            onClick={() => setSelectedObs(obs)}
                            className={cn(
                                "w-full p-4 rounded-xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden",
                                selectedObs?.id === obs.id
                                    ? "bg-slate-800/80 border-indigo-500/50 shadow-lg shadow-indigo-500/5"
                                    : "bg-[#090e1a] border-slate-800/50 hover:bg-slate-800/40 hover:border-slate-700"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400">#{obs.id} {obs.type}</p>
                                    <p className="font-bold text-slate-300 capitalize">{obs.type} Station</p>
                                </div>
                                <div className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                                    obs.needs_review ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                )}>
                                    {obs.needs_review ? "Triage" : "Rejected"}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {obs.lat.toFixed(2)}, {obs.long.toFixed(2)}</span>
                            </div>

                            {selectedObs?.id === obs.id && (
                                <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
                            )}
                        </button>
                    ))}
                </div>
            </aside>

            {/* MAIN VIEW: Audit Terminal */}
            <main className="flex-1 flex flex-col h-full bg-[#020617] relative">
                {selectedObs ? (
                    <>
                        {/* Top Stat Bar */}
                        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-800">
                            <div className="flex items-center gap-6">
                                <div>
                                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1.5 flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5" /> Telemetry Focus
                                    </h2>
                                    <p className="text-2xl font-black text-slate-100 italic tracking-tighter">Obs_ID::{selectedObs.id}</p>
                                </div>
                                <div className="h-10 w-[1px] bg-slate-800" />
                                <div>
                                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1.5">Network Identity</h2>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-sm font-bold", selectedObs.is_expert ? "text-emerald-500" : "text-indigo-400")}>
                                            {selectedObs.is_expert ? "Verified Node (Expert)" : "Public Node (Citizen)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    disabled={processing !== null}
                                    onClick={() => handleAudit(false)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" /> Finalize Rejection
                                </button>
                                <button
                                    disabled={processing !== null}
                                    onClick={() => handleAudit(true)}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    {processing === selectedObs.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Verify Ground Truth
                                </button>
                            </div>
                        </div>

                        {/* Audit Grid */}
                        <div className="flex-1 p-10 overflow-y-auto audit-scrollbar grid grid-cols-12 gap-8">
                            {/* Left Col: Core Comparison */}
                            <div className="col-span-8 space-y-8">
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-[#090e1a] border border-slate-800 rounded-[1.5rem] p-6 space-y-1 group">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest group-hover:animate-pulse">Input Value</span>
                                        <p className="text-4xl font-black text-white font-mono tracking-tighter">{selectedObs.value.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-[#090e1a] border border-slate-800 rounded-[1.5rem] p-6 space-y-1">
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Satellite Reference</span>
                                        <p className="text-4xl font-black text-white font-mono tracking-tighter">
                                            {selectedObs.validation_report?.satellite_value?.toFixed(2) || "NULL"}
                                        </p>
                                    </div>
                                    <div className="bg-[#0b1224] border border-slate-700 rounded-[1.5rem] p-6 space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delta Variance</span>
                                        <p className="text-4xl font-black text-slate-100 font-mono tracking-tighter">
                                            {selectedObs.validation_report?.satellite_value
                                                ? Math.abs(selectedObs.value - selectedObs.validation_report.satellite_value).toFixed(2)
                                                : "--"}
                                        </p>
                                    </div>
                                </div>

                                {/* High Density Terminal */}
                                <div className="bg-[#030712] border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col min-h-[400px]">
                                    <div className="bg-slate-900/50 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ensemble Logic Trace</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                            <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                                        </div>
                                    </div>
                                    <div className="p-8 font-mono text-[13px] space-y-4 leading-relaxed bg-grid-slate-900">
                                        <p className="text-slate-500 italic">// Initializing audit context for coordinate [{selectedObs.lat}, {selectedObs.long}]</p>
                                        <div className="flex gap-4">
                                            <span className="text-indigo-400 shink-0 font-bold">ML_ENGINE:</span>
                                            <span className="text-slate-400">
                                                {selectedObs.validation_report?.ml_status || "Standard statistical evaluation pending."}
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-emerald-400 shink-0 font-bold">SATELLITE:</span>
                                            <span className="text-slate-400">
                                                {selectedObs.validation_report?.satellite_value
                                                    ? `Direct match found in Open-Meteo cache (Index: ${selectedObs.validation_report.satellite_value}).`
                                                    : "No authoritative satellite model found for this coordinate."}
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-amber-400 shink-0 font-bold">AUDIT_REQ:</span>
                                            <span className="text-white bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                {selectedObs.validation_report?.hitl_reason || "Anomaly threshold exceeded (Majority Vote)."}
                                            </span>
                                        </div>
                                        <div className="pt-6 border-t border-slate-800/50 text-slate-600 text-[11px] animate-pulse">
                                            &gt; Awaiting expert intervention to update global weights...
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: AI & Context */}
                            <div className="col-span-4 space-y-8">
                                <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-[2rem] p-8 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white tracking-tight">AI Synthesis</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">GraphRAG Audit Aid</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed italic">
                                        "The submitted value ({selectedObs.value}) is statistically improbable for this region given the current seasonal cluster. Potential causes include faulty sensor calibration or a localized extreme environmental event."
                                    </p>
                                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2">
                                        Query Knowledge Base <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Expert Tooling</h3>
                                    <button className="w-full py-4 px-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all text-left group">
                                        <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition">Request Retest</p>
                                        <p className="text-[10px] text-slate-500">Signal nearby citizen nodes to verify.</p>
                                    </button>
                                    <button className="w-full py-4 px-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left group">
                                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Adjust ML Threshold</p>
                                        <p className="text-[10px] text-slate-500">Shift regional anomaly detection sensitivity.</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-40">
                        <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full flex items-center justify-center animate-pulse-slow">
                            <ShieldCheck className="w-10 h-10 text-indigo-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-black tracking-tighter uppercase italic text-white mb-2 underline decoration-indigo-500 decoration-4 underline-offset-8">Terminal Idle</h3>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Pick a telemetry packet to begin auditing</p>
                        </div>
                    </div>
                )}

                {/* Floating Globe Ornament */}
                <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
            </main>
        </div>
    )
}
