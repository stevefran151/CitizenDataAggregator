"use client";

import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "./ui/card";
import { BarChart3, TrendingUp, Calendar, Target } from "lucide-react";
import HealthForecastPanel from "./health-forecast";

interface Observation {
    id: number;
    type: string;
    value: number;
    lat: number;
    long: number;
    is_valid: boolean;
    timestamp: string;
}

interface AnalyticsOverviewProps {
    observations: Observation[];
}

export default function AnalyticsOverview({ observations }: AnalyticsOverviewProps) {
    // Calculate weekly submissions (last 7 days)
    const weeklyData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(now.getDate() - (6 - i));
            return {
                date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: d.toDateString(),
                count: 0,
                valid: 0
            };
        });

        observations.forEach(obs => {
            const obsDate = new Date(obs.timestamp).toDateString();
            const dayIndex = last7Days.findIndex(d => d.fullDate === obsDate);
            if (dayIndex !== -1) {
                last7Days[dayIndex].count++;
                if (obs.is_valid) last7Days[dayIndex].valid++;
            }
        });

        return last7Days;
    }, [observations]);

    const totalThisWeek = weeklyData.reduce((acc, curr) => acc + curr.count, 0);
    const avgValidity = totalThisWeek > 0
        ? Math.round((weeklyData.reduce((acc, curr) => acc + curr.valid, 0) / totalThisWeek) * 100)
        : 100;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                        Analytics Command Center
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Cross-platform data ingestion and predictive health modeling</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-indigo-400">Week Volume</span>
                        <span className="text-xl font-black text-indigo-700">{totalThisWeek}</span>
                    </div>
                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-emerald-400">Trust Index</span>
                        <span className="text-xl font-black text-emerald-700">{avgValidity}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Volume Chart */}
                <Card className="lg:col-span-1 border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-indigo-600" />
                            </div>
                            <CardTitle className="text-lg font-bold">Submission Velocity</CardTitle>
                        </div>
                        <CardDescription className="text-xs">Daily observation intake for the current week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        fontWeight="bold"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        fontWeight="bold"
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {weeklyData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === 6 ? '#4f46e5' : '#e2e8f0'}
                                                className="transition-all duration-300 hover:fill-indigo-400"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                                <Target className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Target Growth</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">+12% vs LY</span>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Health Forecast Panel (Nested) */}
                <div className="lg:col-span-2">
                    <HealthForecastPanel />
                </div>
            </div>

            {/* Additional Analytics Widgets or System Logs could go here */}
        </div>
    );
}
