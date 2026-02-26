"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Activity,
    Mic2,
    CheckCircle2,
    Clock,
    MapPin,
    Tag,
    Loader2,
    ChevronRight,
    TrendingUp,
    Volume2,
    VolumeX,
    Filter,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

interface Annotation {
    user: string;
    label: string;
    confidence: number;
    timestamp: string;
}

interface Recording {
    id: number;
    title: string;
    audio_url: string;
    location_name: string;
    duration_seconds: number;
    annotations: Annotation[];
    status: string;
}

export default function AcousticAnnotator() {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [currentRec, setCurrentRec] = useState<Recording | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [label, setLabel] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [vol, setVol] = useState(80);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchRecordings();
    }, []);

    const fetchRecordings = async () => {
        try {
            const res = await fetch('http://localhost:8001/api/v1/acoustic/recordings');
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data)) {
                setRecordings(data);
                if (data.length > 0 && !currentRec) setCurrentRec(data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch recordings", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayToggle = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(p);
        }
    };

    const handleSubmitLabel = async () => {
        if (!currentRec || !label.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:8001/api/v1/acoustic/label', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentRec.id,
                    label: label,
                    confidence: 0.95, // System estimated based on expertise?
                    user: "citizen_auditor"
                })
            });
            if (res.ok) {
                setLabel('');
                fetchRecordings(); // Refresh data
            }
        } catch (err) {
            console.error("Label submit error", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Player & Annotation Area */}
                <div className="lg:col-span-8 space-y-4">
                    <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-2xl">
                        <div className="relative h-48 bg-slate-950 flex items-center justify-center group">
                            {/* Waveform Visualization (Mock SVG) */}
                            <svg className="w-full h-32 px-10 opacity-60" preserveAspectRatio="none" viewBox="0 0 1000 100">
                                {Array.from({ length: 150 }).map((_, i) => (
                                    <rect
                                        key={i}
                                        x={i * 7}
                                        y={50 - Math.random() * 40}
                                        width="3"
                                        height={Math.random() * 80 + 10}
                                        rx="1.5"
                                        className={`${progress > (i / 150) * 100 ? 'fill-emerald-500' : 'fill-slate-700'} transition-all duration-300`}
                                    />
                                ))}
                            </svg>

                            <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
                                <motion.div
                                    className="w-1 h-full bg-emerald-500/30"
                                    style={{ left: `${progress}%`, position: 'absolute' }}
                                />
                            </div>

                            <div className="absolute top-4 left-6 flex items-center gap-2">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black tracking-widest uppercase">
                                    LIVE SPECTROGRAM
                                </Badge>
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> WildTrax Validated
                                </Badge>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">48kHz High-Fidelity Capture</span>
                            </div>

                            <audio
                                ref={audioRef}
                                src={currentRec?.audio_url}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={() => setIsPlaying(false)}
                            />
                        </div>

                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{currentRec?.title || "Loading..."}</h3>
                                    <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {currentRec?.location_name}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {currentRec?.duration_seconds}s Full Clip</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white"><SkipBack className="w-5 h-5" /></Button>
                                    <Button
                                        onClick={handlePlayToggle}
                                        className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white"><SkipForward className="w-5 h-5" /></Button>
                                </div>

                                <div className="flex items-center gap-3 min-w-[120px]">
                                    {vol === 0 ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
                                    <Slider
                                        value={[vol]}
                                        max={100}
                                        step={1}
                                        onValueChange={(v: number[]) => {
                                            setVol(v[0]);
                                            if (audioRef.current) audioRef.current.volume = v[0] / 100;
                                        }}
                                        className="w-24"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-8 flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <Input
                                            placeholder="Identify species or behavior..."
                                            className="h-12 bg-slate-950 border-slate-800 pl-10 text-xs font-bold uppercase tracking-widest focus:ring-emerald-500"
                                            value={label}
                                            onChange={(e) => setLabel(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSubmitLabel}
                                        disabled={isSubmitting || !label.trim()}
                                        className="h-12 px-6 bg-slate-50 hover:bg-white text-slate-900 font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Contribute Label"}
                                    </Button>
                                </div>
                                <div className="md:col-span-4 flex items-center justify-end gap-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-right">
                                        consensus required:<br />
                                        <span className="text-emerald-500">3 Verified Voters</span>
                                    </p>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                                                <Shield className="w-3 h-3 text-slate-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Scientific Protocol</span>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    "Isolate dominant species vocalizations",
                                    "Cross-verify with WildTrax distribution clusters",
                                    "Filter for anthropogenic noise interference",
                                    "Assign confidence score per time-segment"
                                ].map((step, i) => (
                                    <li key={i} className="flex items-start gap-3 text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">{i + 1}</span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-4">
                                <Mic2 className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Network Rewards</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                                Each verified consensus label grants <span className="text-indigo-400 font-black">+50 IMPACT POINTS</span> to your auditor profile.
                            </p>
                            <Button variant="outline" className="mt-4 w-full h-9 rounded-xl border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase hover:bg-indigo-500/10 transition-all">
                                View Leaderboard
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Queue & Activity */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden h-[450px] flex flex-col">
                        <CardHeader className="p-4 border-b border-slate-800">
                            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                Audit Queue
                                <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-500">{recordings.length} PENDING</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto no-scrollbar">
                            <div className="divide-y divide-slate-800/50">
                                {isLoading ? (
                                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 opacity-20" />
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Synchronizing Acoustic Cache...</p>
                                    </div>
                                ) : recordings.length > 0 ? (
                                    recordings.map((rec) => (
                                        <button
                                            key={rec.id}
                                            onClick={() => setCurrentRec(rec)}
                                            className={`w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all group ${currentRec?.id === rec.id ? 'bg-emerald-500/5 border-l-2 border-emerald-500' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 transition-colors shadow-inner">
                                                    <Activity className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`text-xs font-black uppercase tracking-tight ${currentRec?.id === rec.id ? 'text-emerald-400' : 'text-slate-300'}`}>{rec.title}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1 tracking-widest">{rec.location_name}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-slate-700 group-hover:text-emerald-400 transition-colors ${currentRec?.id === rec.id ? 'translate-x-1' : ''}`} />
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No pending audits found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 shadow-xl">
                        <CardHeader className="p-4 border-b border-slate-800">
                            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Latest Consensus</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {currentRec?.annotations.slice(-3).reverse().map((ann, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-tighter">{ann.label}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase">u/{ann.user} • {Math.round(ann.confidence * 100)}% Confidence</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase">Just Now</span>
                                </motion.div>
                            ))}
                            {currentRec?.annotations.length === 0 && (
                                <p className="text-[10px] font-bold text-slate-500 italic text-center py-4">No annotations yet. Be the first!</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
