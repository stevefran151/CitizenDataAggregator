"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import Link from "next/link";

interface Observation {
    id: number;
    type: string;
    value: number;
    timestamp: string;
    is_valid: boolean;
}

export default function TrendsPage() {
    const [data, setData] = useState<Observation[]>([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/data")
            .then((res) => res.json())
            .then((data) => setData(data));
    }, []);

    // Process data for charts
    // 1. Line Chart: Value over time (grouped by type?)
    // For MVP, just plot value over time.
    const timeData = data.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        value: d.value,
        type: d.type
    }));

    // 2. Bar Chart: Count by Type
    const typeCounts = data.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(typeCounts).map(([name, count]) => ({
        name,
        count,
    }));

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Public Trends Dashboard</h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        &larr; Back to Map
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Pollution Levels Over Time</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Observations by Type</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
