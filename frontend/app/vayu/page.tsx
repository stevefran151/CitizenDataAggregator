"use client";

import React from 'react';
import VayuChat from '@/components/vayu-chat';
import {
    Wind,
    ShieldCheck,
    Users,
    ArrowLeft,
    Share2,
    BarChart,
    CloudSun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VayuPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Wind className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-lg tracking-tighter uppercase italic">VayuChat</span>
                    </div>
                    <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-black">BETA</Badge>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">1,204 Community Nodes Active</span>
                    </div>
                    <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/5 hover:bg-white/10">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <main className="pt-24 pb-12 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Interaction */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
                            Predictive Atmosphere<br />Intelligence
                        </h1>
                        <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                            VayuChat combines satellite telemetry, community sensor networks, and deep learning models to predict air quality anomalies before they occur.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
                                <BarChart className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Hybrid Models</h3>
                            <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                                Merging Gov-API nodes with high-frequency citizen telemetry.
                            </p>
                        </div>
                        <div className="p-4 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
                            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-3">
                                <ShieldCheck className="w-5 h-5 text-teal-400" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Verified Data</h3>
                            <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                                Multi-stage neural validation to filter localized error spikes.
                            </p>
                        </div>
                        <div className="p-4 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-3">
                                <CloudSun className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Hyper-Local</h3>
                            <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                                Neighborhood-level forecasts (100m² resolution precision).
                            </p>
                        </div>
                    </div>

                    <VayuChat />
                </div>

                {/* Right Side: Sidebar */}
                <div className="hidden xl:block xl:col-span-4 space-y-6">
                    <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Anomaly Heatmap</h3>
                        <div className="aspect-square bg-slate-800 rounded-2xl border border-white/5 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/77.5946,12.9716,11,0,0/400x400?access_token=pk.eyJ1IjoibWNoZXZvbiIsImEiOiJjbDF2ZnY4ZzIwMjRkM2NsbXd4d3Rxc2R3In0.xxx')] bg-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-24 h-24 rounded-full bg-orange-500/30 animate-ping" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-lg" />
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-tighter">Likely PM2.5 Surge</p>
                                <p className="text-xs font-bold text-white">Whitefield Sector Alpha</p>
                                <p className="text-[9px] text-slate-400 mt-1">Stagnation period predicted at 04:00 AM</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-white/10 backdrop-blur-md">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Top contributors</h3>
                        <div className="space-y-3">
                            {[
                                { name: "u/aero_expert", score: "4.2k", rank: 1 },
                                { name: "u/citizen_node_42", score: "2.8k", rank: 2 },
                                { name: "u/sky_watcher", score: "1.9k", rank: 3 },
                            ].map((user) => (
                                <div key={user.name} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] text-slate-400">
                                            {user.rank}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{user.name}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{user.score} points</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] bg-white/5 text-slate-400 border-white/5">AUDITOR</Badge>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-blue-400">Full Community Leaderboard</Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
