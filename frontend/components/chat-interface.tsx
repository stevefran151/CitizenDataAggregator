"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import VoiceAgent from "@/components/voice-agent";

interface Observation {
    id: number;
    type: string;
    value: number;
    lat: number;
    long: number;
    is_valid: boolean;
    timestamp: string;
    source?: string;
}

export default function ChatInterface({ observation }: { observation?: Observation | null }) {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!query.trim()) return;

        const newMessages = [...messages, { role: 'user' as const, text: query }];
        setMessages(newMessages);
        setLoading(true);
        setQuery("");

        try {
            const res = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: query,
                    context: observation ? {
                        type: observation.type,
                        value: observation.value,
                        is_valid: observation.is_valid,
                        lat: observation.lat,
                        long: observation.long
                    } : {}
                })
            });
            const data = await res.json();
            setMessages([...newMessages, { role: 'agent', text: data.response }]);
        } catch (e) {
            setMessages([...newMessages, { role: 'agent', text: "Error talking to AI." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">AI Assistant</h3>
                <VoiceAgent />
            </div>
            {observation && (
                <div className="bg-blue-50 p-2 rounded mb-4 text-xs text-blue-800 border border-blue-100">
                    Talking about: <span className="font-bold">{observation.type}</span> ({observation.value}) at {observation.lat.toFixed(2)}, {observation.long.toFixed(2)}
                </div>
            )}
            <div className="flex-grow bg-gray-50 rounded-xl p-4 overflow-y-auto mb-4 border border-gray-100 min-h-[300px] space-y-3">
                {messages.length === 0 && (
                    <div className="text-gray-400 italic text-center mt-10">
                        <p>Hello! I can help you analyze environmental data.</p>
                        <p className="text-sm">Try asking: "Is the air quality value safe?" or "Are there any anomalies nearby?"</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none shadow-sm'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-400">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <Input
                    className="flex-grow shadow-sm"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Ask about environmental data..."
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={handleSend} disabled={loading}>
                    Send
                </Button>
            </div>
        </div>
    );
}
