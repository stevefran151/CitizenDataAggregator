"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ObservationForm from "@/components/observation-form";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });
import ValidationPanel from "@/components/validation-panel";
import Link from "next/link";
import {
    ArrowRight,
    RotateCcw,
    TrendingUp,
    Activity,
    AlertTriangle,
    CheckCircle,
    Database,
    Map as MapIcon,
    FileText,
    ShieldCheck,
    MessageSquare,
    Settings,
    BookOpen,
    ExternalLink,
    HelpCircle,
    Download,
    Clock,
    Search as SearchIcon,
    Menu,
    ChevronRight,
    Globe,
} from "lucide-react";
import NewsFeed from "@/components/news-feed";
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Observation {
    id: number;
    type: string;
    value: number;
    lat: number;
    long: number;
    is_valid: boolean;
    timestamp: string;
    source?: string;
    needs_review: boolean;
    validation_status: string;
}

import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chat-interface";
import DataCatalog from "@/components/data-catalog";

export default function Dashboard() {
    const [observations, setObservations] = useState<Observation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [currentObservation, setCurrentObservation] = useState<Observation | null>(null);
    const [activeTab, setActiveTab] = useState("catalog");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchObservations();
        const role = localStorage.getItem("userRole");
        setUserRole(role);
        // Default citizens to catalog or map, experts to catalog
        if (role === 'citizen') setActiveTab("map");
    }, []);

    const fetchObservations = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/v1/data");
            if (res.ok) {
                const data = await res.json();
                setObservations(data);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const handleObservationAdded = (newObs: Observation) => {
        setObservations((prev) => [...prev, newObs]);
        setCurrentObservation(newObs);
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });
    };

    const handleDownload = () => {
        window.location.href = "http://localhost:8000/api/v1/export";
    };

    const handleAIDownload = () => {
        window.location.href = "http://localhost:8000/api/v1/export/ai-cleaned";
    };

    const handleTabSwitch = (tab: string, observation: Observation) => {
        setCurrentObservation(observation);
        setActiveTab(tab);
    };

    const navItems = [
        { id: "catalog", label: "Data Catalog", icon: Database, description: "Dataset discovery & search" },
        { id: "map", label: "Spatial Monitor", icon: MapIcon, description: "Global coordinate visualization" },
        { id: "form", label: "Data Submission", icon: FileText, description: "Contribute environmental records" },
        { id: "validate", label: "Quality Control", icon: ShieldCheck, description: "Validation & human review", expertOnly: true },
        { id: "news", label: "Environmental Intelligence", icon: Globe, description: "Real-time news & trend grounding" },
        { id: "chat", label: "Citizen Assistant", icon: MessageSquare, description: "AI-powered environmental support" },
    ].filter(item => !item.expertOnly || userRole === 'expert');

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Top Navigation Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                                <Database className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-slate-900 tracking-tight uppercase">Mechovate</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === item.id
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs font-semibold text-slate-600">
                                {userRole === 'expert' ? 'Expert Access' : 'Public Access'}
                            </span>
                        </div>
                        <button
                            onClick={handleAIDownload}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-100"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" /> AI Clean Export
                        </button>
                        <button
                            onClick={handleDownload}
                            className="bg-slate-900 text-white px-4 py-2 rounded-md text-xs font-bold hover:bg-slate-800 transition flex items-center gap-2"
                        >
                            <Download className="w-3.5 h-3.5" /> Raw CSV
                        </button>
                    </div>
                </div>
            </header>

            {/* Sub-header Stats Bar (Simplified) */}
            <div className="bg-slate-50 border-b border-slate-200 py-3">
                <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex gap-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total Samples</span>
                            <span className="text-lg font-bold text-slate-900">{observations.length}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Verified Ground Truth</span>
                            <span className="text-lg font-bold text-slate-900 text-emerald-600">
                                {observations.filter(o => o.is_valid).length}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Active Anomalies</span>
                            <span className="text-lg font-bold text-slate-900 text-rose-600">
                                {observations.filter(o => !o.is_valid).length}
                            </span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> API Status: 200 OK</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Last Sync: {mounted ? new Date().toLocaleTimeString() : "--:--"}</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto bg-white">
                <div className="max-w-[1600px] mx-auto p-6">
                    {activeTab === "catalog" && (
                        <DataCatalog
                            observations={observations}
                            onSelectObservation={setCurrentObservation}
                            onTabSwitch={handleTabSwitch}
                        />
                    )}

                    {activeTab === "map" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <MapIcon className="w-4 h-4 text-slate-400" />
                                        Spatial Monitoring Engine
                                    </h3>
                                    <Button onClick={() => setActiveTab("form")} variant="outline" size="sm" className="h-8 text-xs font-bold">
                                        Submit New Observation
                                    </Button>
                                </div>
                                <div className="h-[400px] relative">
                                    <MapView
                                        observations={observations}
                                        onLocationSelect={handleLocationSelect}
                                        onTabSwitch={handleTabSwitch}
                                    />
                                    <div className="absolute bottom-4 left-4 bg-white border border-slate-200 p-2 rounded shadow-sm z-[1000] text-[10px] font-bold text-slate-500 uppercase tracking-wider flex gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span>Valid</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                            <span>Anomaly</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                                            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Systemic Trend Analysis</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                Live Sensor Value
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-[350px] mb-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={observations.slice(-30)}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="timestamp"
                                                    hide
                                                />
                                                <YAxis
                                                    fontSize={10}
                                                    fontWeight="bold"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(val) => `${val.toFixed(0)}`}
                                                    stroke="#94a3b8"
                                                />
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ display: 'none' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#6366f1"
                                                    fillOpacity={1}
                                                    fill="url(#colorValue)"
                                                    strokeWidth={3}
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg border border-slate-200 p-6 overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Live Telemetry Feed</span>
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Real-time</span>
                                    </div>
                                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1 scrollbar-hide">
                                        {observations.slice(-5).reverse().map((obs, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{obs.type} Registry</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5 flex items-center gap-1">
                                                        <Globe className="w-2.5 h-2.5" />
                                                        {obs.lat.toFixed(2)}, {obs.long.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-slate-900 leading-none">{obs.value.toFixed(1)}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">SI Units</p>
                                                    </div>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${obs.is_valid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'} animate-pulse`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "form" && (
                        <div className="max-w-xl mx-auto py-10">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Report Environmental Data</h3>
                            <ObservationForm
                                onObservationAdded={handleObservationAdded}
                                selectedLocation={selectedLocation}
                                onNavigateToMap={() => setActiveTab("map")}
                            />
                        </div>
                    )}

                    {activeTab === "validate" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-slate-900" />
                                    Review Protocol Queue
                                </h3>
                                <Button
                                    onClick={() => {
                                        const pending = observations.find(o => o.needs_review);
                                        if (pending) setCurrentObservation(pending);
                                    }}
                                    className="bg-slate-900 text-white font-bold"
                                >
                                    Focus Next Item
                                </Button>
                            </div>
                            <ValidationPanel
                                observation={currentObservation}
                                allObservations={observations}
                                onSelectObservation={setCurrentObservation}
                            />
                        </div>
                    )}

                    {activeTab === "news" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-600" />
                                    Environmental Intelligence Feed
                                </h3>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                    Live Satellite & Press Sync
                                </span>
                            </div>
                            <NewsFeed />
                        </div>
                    )}

                    {activeTab === "chat" && (
                        <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden h-[700px]">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                                <h3 className="text-sm font-bold text-slate-900">AI Data Synthesis</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">System Status: Ready</p>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <ChatInterface observation={currentObservation} />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

