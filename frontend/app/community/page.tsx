"use client";

import { useState } from "react";
import {
    ArrowUp,
    ArrowDown,
    MessageSquare,
    Share2,
    MoreHorizontal,
    Plus,
    Search,
    TrendingUp,
    Users,
    Shield,
    Zap,
    Clock,
    ExternalLink,
    ChevronRight,
    Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Post {
    id: string;
    author: string;
    authorBadge?: string;
    community: string;
    title: string;
    content: string;
    votes: number;
    comments: number;
    time: string;
    tags: string[];
    imageUrl?: string;
}

const SAMPLE_POSTS: Post[] = [
    {
        id: "1",
        author: "dr_miller_aqi",
        authorBadge: "Expert",
        community: "r/air_quality_audit",
        title: "Unusual PM2.5 spike detected in New Delhi eastern sector - correlation with local industrial activity?",
        content: "Observing a significant 15% deviation from historical norms between 02:00 and 05:00 UTC. Satellite cross-reference shows low-altitude thermal anomalies in the Okhla region. Has anyone else verified this on the ground?",
        votes: 428,
        comments: 56,
        time: "2h ago",
        tags: ["Delhi", "Anomaly", "PM2.5"],
        imageUrl: "https://images.unsplash.com/photo-1584281722572-886ec66ee555?auto=format&fit=crop&q=80&w=1200"
    },
    {
        id: "2",
        author: "citizen_zero",
        community: "r/water_watchers",
        title: "Groundwater pH levels in coastal Chennai showing signs of saline intrusion",
        content: "My local sensor just flagged a pH increase of 0.8 over the last 48 hours. I've uploaded the raw CSV to the Mechovate portal. Looking for peer review from other coastal residents.",
        votes: 156,
        comments: 24,
        time: "5h ago",
        tags: ["Salinity", "WaterQuality", "Chennai"]
    },
    {
        id: "3",
        author: "planetary_guardian",
        authorBadge: "Eco-Council",
        community: "r/mechovate_general",
        title: "March Impact Report: Our collective validation stopped 3 fraudulent industrial emissions reports!",
        content: "Thanks to the high-trust volunteer collective, we were able to audit and reject three massive data spikes that were actually sensor malfunctions, saving the ML model from catastrophic drift.",
        votes: 890,
        comments: 112,
        time: "10h ago",
        tags: ["Impact", "ML", "Audit"],
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200"
    }
];

export default function CommunityPage() {
    const [posts, setPosts] = useState(SAMPLE_POSTS);
    const [searchQuery, setSearchQuery] = useState("");

    const communities = [
        { name: "r/air_quality_audit", members: "12.4k", icon: "🌬️" },
        { name: "r/water_watchers", members: "8.1k", icon: "💧" },
        { name: "r/noise_pollution", members: "3.2k", icon: "📢" },
        { name: "r/satellite_sync", members: "5.5k", icon: "🛰️" },
        { name: "r/mechovate_general", members: "45k", icon: "⚛️" }
    ];

    return (
        <div className="min-h-screen bg-[#DAE0E6] font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Community Header */}
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-slate-300 px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-lg tracking-tighter uppercase italic text-slate-900">Mechovate</span>
                    </Link>

                    <div className="max-w-xl flex-1 relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations, audits, or anomalies..."
                            className="w-full h-10 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-500 rounded-full pl-10 pr-4 text-sm outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="hidden sm:flex text-slate-600 font-bold text-xs uppercase tracking-widest">
                        Leaderboard
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">
                        Start Discussion
                    </Button>
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300" />
                </div>
            </nav>

            <main className="pt-20 pb-12 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-6">
                {/* Left Feed */}
                <div className="flex-1 space-y-4">
                    <div className="bg-white p-3 rounded-md border border-slate-300 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                        <Input
                            placeholder="Submit a new anomaly or data audit..."
                            className="bg-slate-50 border-slate-200 h-10 hover:bg-white hover:border-indigo-400 transition-all"
                        />
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="text-slate-400"><Plus className="w-5 h-5" /></Button>
                        </div>
                    </div>

                    <div className="flex gap-4 pb-2 overflow-x-auto scrollbar-hide">
                        {['Hot', 'New', 'Top', 'Audited'].map((tab) => (
                            <Button
                                key={tab}
                                variant="ghost"
                                className={`h-9 px-4 rounded-full font-bold text-xs uppercase tracking-widest ${tab === 'Hot' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>

                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-md border border-slate-300 hover:border-slate-400 transition-colors flex overflow-hidden">
                            {/* Voting Column */}
                            <div className="w-12 bg-slate-50/50 flex flex-col items-center py-2 gap-1">
                                <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><ArrowUp className="w-6 h-6" /></button>
                                <span className="text-[10px] font-black text-slate-700">{post.votes}</span>
                                <button className="text-slate-400 hover:text-red-600 transition-colors p-1"><ArrowDown className="w-6 h-6" /></button>
                            </div>

                            {/* Post Content */}
                            <div className="flex-1 p-3 space-y-2">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span className="font-black text-slate-800 uppercase tracking-tighter">{post.community}</span>
                                    <span>•</span>
                                    <span>Posted by u/{post.author}</span>
                                    {post.authorBadge && (
                                        <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase text-[8px]">{post.authorBadge}</span>
                                    )}
                                    <span>•</span>
                                    <span>{post.time}</span>
                                </div>

                                <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight hover:underline cursor-pointer">
                                    {post.title}
                                </h3>

                                <div className="flex flex-wrap gap-2 py-1">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">#{tag}</span>
                                    ))}
                                </div>

                                <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
                                    {post.content}
                                </p>

                                {post.imageUrl && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={post.imageUrl} alt="Post content" className="w-full object-cover max-h-96" />
                                    </div>
                                )}

                                <div className="pt-4 flex items-center gap-4">
                                    <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 px-2 py-1.5 rounded transition-all text-[11px] font-black uppercase tracking-tighter">
                                        <MessageSquare className="w-4 h-4" /> {post.comments} Comments
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 px-2 py-1.5 rounded transition-all text-[11px] font-black uppercase tracking-tighter">
                                        <Share2 className="w-4 h-4" /> Share
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-100 px-2 py-1.5 rounded transition-all text-[11px] font-black uppercase tracking-tighter ml-auto">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 space-y-4">
                    <div className="bg-white rounded-md border border-slate-300 overflow-hidden">
                        <div className="h-12 bg-indigo-600 flex items-center px-4">
                            <span className="text-xs font-black text-white uppercase tracking-widest">About Community</span>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                The Mechovate Collective is a peer-to-peer verification network for environmental telemetry. Help us ground-truth planetary data!
                            </p>
                            <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100">
                                <div>
                                    <p className="text-sm font-black text-slate-900">42,183</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Activists</p>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">124</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Online Now</p>
                                </div>
                            </div>
                            <Button className="w-full bg-indigo-600 text-white rounded-full font-bold text-xs uppercase tracking-widest">Join Collective</Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-md border border-slate-300 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Auditing Circles</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {communities.map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold">{i + 1}</span>
                                        <span className="text-lg">{c.icon}</span>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 leading-none group-hover:text-indigo-600">{c.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{c.members} members</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-7 px-3 rounded-full text-[10px] font-black uppercase ring-1 ring-slate-200">Join</Button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-slate-100">
                            <Button variant="ghost" className="w-full text-indigo-600 font-black text-[10px] uppercase tracking-widest">View All Circles</Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-md border border-slate-300 p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Expert Network</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Mechovate verified experts are currently reviewing 12 anomalies in your region.
                        </p>
                        <Link href="/dashboard" className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden relative group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Contribute Data</p>
                                <p className="text-xs font-black text-emerald-900">Open Audit Map</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                            <Zap className="absolute right-[-10px] top-[-10px] w-12 h-12 text-emerald-500/10 rotate-12" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
