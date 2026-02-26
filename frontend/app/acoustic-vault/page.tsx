"use client";

import React from 'react';
import AcousticAnnotator from '@/components/acoustic-annotator';
import {
    Mic2,
    ArrowLeft,
    Share2,
    Database,
    Binary,
    Activity,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AcousticVault() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            <Mic2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-lg tracking-tighter uppercase italic">AcousticVault</span>
                    </div>
                    <Badge variant="outline" className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase">Consensus Mode</Badge>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">42 Active Auditors Online</span>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-12 max-w-7xl mx-auto px-6 space-y-8">
                {/* Hero Header */}
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Crowd-Labeling the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Planetary Soundscape</span>
                        </h1>
                        <p className="mt-4 text-slate-400 text-lg font-medium leading-relaxed">
                            A high-trust ecological annotation network. Identify species, audit noise anomalies, and help train the next generation of bio-acoustic models.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Binary, label: "Signal Processing", text: "FFT-based spectrogram generation for precise frequency identification." },
                        { icon: Database, label: "Open Dataset", text: "All verified labels contribute to the Global Biodiversity Repository." },
                        { icon: Activity, label: "Real-time Consensus", text: "Multi-user verification system inspired by NEAL & Zooniverse protocols." }
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
                            <item.icon className="w-8 h-8 text-emerald-500 mb-4" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">{item.label}</h3>
                            <p className="text-[11px] text-slate-400 font-medium mt-2 leading-relaxed uppercase tracking-tight">{item.text}</p>
                        </div>
                    ))}
                </div>

                {/* Main Annotator Tool */}
                <AcousticAnnotator />
            </main>
        </div>
    );
}
