"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Bot,
    User,
    Wind,
    TrendingUp,
    Map as MapIcon,
    AlertCircle,
    Info,
    ChevronRight,
    Loader2,
    Sparkles,
    BarChart3,
    CloudRain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

interface Message {
    id: string;
    role: 'user' | 'vayu';
    content: string;
    timestamp: Date;
    visualData?: any;
    visualType?: 'graph' | 'map' | 'alert';
}

export default function VayuChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'vayu',
            content: "Namaste! I am Vayu, your community air quality intelligence. I combine real-time sensor data with predictive atmospheric models to help you breathe better. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Simulate AI thinking and fetching data
            const res = await fetch('http://localhost:8001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input, context: { type: 'air' } })
            });
            const data = await res.json();

            // Fetch forecast if query is related to prediction
            let visualData = null;
            let visualType: 'graph' | 'map' | 'alert' | undefined = undefined;

            if (input.toLowerCase().includes('predict') || input.toLowerCase().includes('forecast') || input.toLowerCase().includes('tomorrow')) {
                const forecastRes = await fetch('http://localhost:8001/api/v1/forecast/health?type=air');
                visualData = await forecastRes.json();
                visualType = 'graph';
            }

            const vayuMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'vayu',
                content: data.response,
                timestamp: new Date(),
                visualData: visualData,
                visualType: visualType
            };

            setMessages(prev => [...prev, vayuMsg]);
        } catch (err) {
            console.error("VayuChat error:", err);
        } finally {
            setIsTyping(false);
        }
    };

    const renderVisual = (message: Message) => {
        if (!message.visualData) return null;

        if (message.visualType === 'graph') {
            return (
                <div className="mt-4 bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Atmospheric Projection</span>
                        </div>
                        <Badge variant="outline" className="text-[8px] bg-blue-500/10 text-blue-400 border-blue-500/20">72H Forecast</Badge>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={message.visualData.forecast}>
                                <defs>
                                    <linearGradient id="vayuGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="hour"
                                    stroke="#475569"
                                    fontSize={8}
                                    tickFormatter={(val) => val < 0 ? `${val}h` : `+${val}h`}
                                    interval={11}
                                />
                                <YAxis stroke="#475569" fontSize={8} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#vayuGradient)"
                                />
                                <ReferenceLine x={0} stroke="#f43f5e" strokeDasharray="3 3" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-3 text-[10px] text-slate-400 italic font-medium">
                        "{message.visualData.summary}"
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <Card className="w-full h-[650px] flex flex-col bg-slate-950 border-slate-800 shadow-3xl overflow-hidden group">
            <CardHeader className="border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-md py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Wind className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                                <Sparkles className="w-2 h-2 text-white" />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-sm font-black text-white uppercase tracking-tighter">VayuChat AI</CardTitle>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Predictive Intelligence Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                            <Info className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col scroll-smooth no-scrollbar" ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
                                    }`}>
                                    {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-400" />}
                                </div>
                                <div className="space-y-1">
                                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-slate-900/50 border border-slate-800 text-slate-200 rounded-tl-none'
                                        }`}>
                                        {m.content}
                                        {renderVisual(m)}
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-1">
                                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Bot className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl rounded-tl-none">
                                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            <div className="p-4 border-t border-slate-800/50 bg-slate-900/20 backdrop-blur-md">
                <div className="flex gap-2">
                    <Input
                        placeholder="Ask Vayu about tomorrow's air quality..."
                        className="bg-slate-900 border-slate-700 text-white text-xs h-12 focus:ring-blue-500 rounded-xl"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        onClick={handleSend}
                        className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex items-center gap-3 mt-3 px-1">
                    <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Predictions
                    </button>
                    <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1">
                        <MapIcon className="w-3 h-3" /> Hotspots
                    </button>
                    <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Anomalies
                    </button>
                </div>
            </div>
        </Card>
    );
}
