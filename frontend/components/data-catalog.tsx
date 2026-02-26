"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Download, ArrowUpDown, ShieldCheck, AlertTriangle, CheckCircle2, FlaskConical, Map as MapIcon, Calendar, Thermometer, UserCheck, Database, Leaf } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    is_expert?: boolean;
    outlier_score?: number;
    location_name?: string;
}

export default function DataCatalog({
    observations,
    onSelectObservation,
    onTabSwitch
}: {
    observations: Observation[],
    onSelectObservation: (obs: Observation) => void,
    onTabSwitch: (tab: string, obs: Observation) => void
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const filteredData = useMemo(() => {
        return observations.filter(obs => {
            const matchesSearch =
                obs.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                obs.id.toString().includes(searchQuery);

            const matchesStatus =
                filterStatus === "all" ||
                (filterStatus === "valid" && obs.is_valid && !obs.needs_review) ||
                (filterStatus === "review" && obs.needs_review) ||
                (filterStatus === "anomaly" && !obs.is_valid && !obs.needs_review);

            return matchesSearch && matchesStatus;
        });
    }, [observations, searchQuery, filterStatus]);

    const stats = useMemo(() => {
        const total = observations.length;
        const valid = observations.filter(o => o.is_valid && !o.needs_review).length;
        const experts = observations.filter(o => o.is_expert).length;
        const pending = observations.filter(o => o.needs_review).length;

        return { total, valid, experts, pending };
    }, [observations]);

    return (
        <div className="space-y-6">
            {/* Stats Overview Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Observations", value: stats.total, icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Verified Reliable", value: stats.valid, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Expert Contributions", value: stats.experts, icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Pending AHQ Review", value: stats.pending, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-4 rounded-xl border border-white/50 shadow-sm flex items-center gap-4`}>
                        <div className={`p-2 rounded-lg bg-white ${stat.color} shadow-sm`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-70">{stat.label}</p>
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Catalog Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by ID or Metric Type (e.g. Air)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {["all", "valid", "review", "anomaly"].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                            className={`capitalize text-xs font-bold rounded-lg ${filterStatus === status ? "bg-indigo-600 shadow-md" : ""}`}
                        >
                            {status}
                        </Button>
                    ))}
                    <div className="w-px h-8 bg-gray-100 mx-2 hidden md:block" />
                    <Button variant="outline" size="sm" className="gap-2 text-xs font-bold" onClick={() => window.location.href = 'http://localhost:8000/api/v1/export'}>
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Data Grid / Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Package ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Environmental Parameter</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Observed Value</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Trust status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">AI Reliability</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Geo Coverage</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredData.length > 0 ? filteredData.map((obs) => (
                            <tr key={obs.id} className="hover:bg-indigo-50/30 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">#{obs.id}</div>
                                        <span className="text-[10px] font-mono text-gray-400">{new Date(obs.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${obs.type === 'air' ? 'bg-blue-50 text-blue-600' :
                                            obs.type === 'water' ? 'bg-cyan-50 text-cyan-600' :
                                                obs.type === 'biodiversity' ? 'bg-lime-50 text-lime-600' :
                                                    'bg-amber-50 text-amber-600'
                                            }`}>
                                            {obs.type === 'biodiversity' ? <Leaf className="w-4 h-4" /> : <Thermometer className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 capitalize leading-none mb-1">
                                                {obs.type === 'biodiversity' ? 'Ecological Health' : `${obs.type} Quality`} Index
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Standardized Sensor Data</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-center">
                                        <span className="text-lg font-black font-mono text-indigo-700">{obs.value.toFixed(2)}</span>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Units/index</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex gap-2">
                                        {obs.is_expert && (
                                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-emerald-100">Expert</span>
                                        )}
                                        {obs.needs_review ? (
                                            <span className="bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-amber-100 inline-flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Audit Req
                                            </span>
                                        ) : obs.is_valid ? (
                                            <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-blue-100 inline-flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Verified
                                            </span>
                                        ) : (
                                            <span className="bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-red-100 inline-flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Anomaly
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden max-w-[80px]">
                                            <div
                                                className={`h-full transition-all duration-1000 ${(obs.outlier_score || 0) > 80 ? 'bg-emerald-500' :
                                                    (obs.outlier_score || 0) > 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                style={{ width: `${obs.outlier_score || 0}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black mt-1 text-slate-500">{Math.round(obs.outlier_score || 0)}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapIcon className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-medium truncate max-w-[150px]" title={`${obs.lat.toFixed(3)}, ${obs.long.toFixed(3)}`}>
                                            {obs.location_name || `${obs.lat.toFixed(3)}, ${obs.long.toFixed(3)}`}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onTabSwitch('validate', obs)}
                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 h-auto"
                                        >
                                            <FlaskConical className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onTabSwitch('chat', obs)}
                                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 h-auto"
                                        >
                                            <Database className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic">
                                    Zero environmental records found matching current synthesis parameters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {filteredData.length} records in current portal view</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-8 text-[10px] font-black uppercase">Prev</Button>
                        <Button variant="outline" size="sm" disabled className="h-8 text-[10px] font-black uppercase">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

