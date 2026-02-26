"use client";

import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Activity, Thermometer, Droplets, Info, AlertTriangle } from "lucide-react";

interface ForecastData {
    time: string;
    hour: number;
    value: number;
    label: string;
    color: string;
    health_msg: string;
}

interface ForecastResponse {
    type: string;
    baseline: number;
    forecast: ForecastData[];
    summary: string;
}

export default function HealthForecastPanel() {
    const [data, setData] = useState<ForecastResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [forecastType, setForecastType] = useState("air");

    useEffect(() => {
        async function fetchForecast() {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:8001/api/v1/forecast/health?type=${forecastType}`);
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error("Failed to fetch forecast:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchForecast();
    }, [forecastType]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload as ForecastData;
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                        {data.hour < 0 ? 'Verified Record' : 'AI Prediction'} ({data.hour < 0 ? `${data.hour}h` : `+${data.hour}h`})
                    </p>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: data.color }}
                        />
                        <p className="text-white font-bold text-lg">{data.value}</p>
                    </div>
                    <p className="text-xs font-medium mt-1" style={{ color: data.color }}>{data.label}</p>
                    <p className="text-[10px] text-slate-300 mt-2 max-w-[150px] italic">"{data.health_msg}"</p>
                </div>
            );
        }
        return null;
    };

    if (loading && !data) {
        return (
            <Card className="w-full h-[450px] flex items-center justify-center bg-slate-950 border-slate-800">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
                    <p className="text-slate-400 animate-pulse">Running AI Prediction Service...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-slate-950 border-slate-800 shadow-2xl overflow-hidden group transition-all duration-300 hover:border-slate-700">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent text-2xl font-bold">
                            AI Health Forecast
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                            Predictive trend analysis for the next 72 hours
                        </CardDescription>
                        {data && (
                            <div className="mt-3 flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-400 text-[10px] font-black uppercase">
                                    Current Baseline: {data.baseline}
                                </Badge>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                    Based on {data.forecast.filter(f => f.hour < 0).length} Recent Records
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-[500px]">
                        {[
                            { id: "air", label: "Air Quality" },
                            { id: "water", label: "Water Safety" },
                            { id: "soil", label: "Soil Health" },
                            { id: "biodiversity", label: "Biodiversity" },
                            { id: "noise", label: "Acoustics" },
                            { id: "waste", label: "Sanitation" },
                            { id: "weather", label: "Meteorology" },
                            { id: "radiation", label: "Radiology" }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setForecastType(btn.id)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${forecastType === btn.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-[280px] w-full mt-4 relative">
                    <div className="absolute top-0 right-0 z-10 bg-slate-900/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] border border-slate-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-slate-300 uppercase tracking-tighter font-bold">Live AI projection</span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.forecast || []}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="hour"
                                stroke="#475569"
                                fontSize={10}
                                tickMargin={10}
                                tickFormatter={(val) => val < 0 ? `${val}h` : `+${val}h`}
                                interval={11}
                            />
                            <YAxis
                                stroke="#475569"
                                fontSize={10}
                                tickMargin={10}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                animationDuration={2000}
                            />
                            <ReferenceLine x={0} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'NOW', fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Info className="w-4 h-4 text-blue-400" />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">AI Forecast Summary</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            {data?.summary}
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 border-l-amber-500/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Health Advice</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold"
                                style={{ backgroundColor: data?.forecast[0].color + '20', color: data?.forecast[0].color }}
                            >
                                {data?.forecast[0].label}
                            </span>
                            <p className="text-xs text-slate-300 font-medium">
                                {data?.forecast[0].health_msg}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
