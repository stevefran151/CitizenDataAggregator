"use client";

import { useState } from "react";
import {
    LiveKitRoom,
    VoiceAssistantControlBar,
    RoomAudioRenderer,
    DisconnectButton
} from "@livekit/components-react";
import { Mic, Volume2, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VoiceAgent() {
    const [roomToken, setRoomToken] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // The LiveKit URL from .env or hardcoded for the demo
    const lkUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://mechovate-0cpbzmg2.livekit.cloud";

    const connectToVoice = async () => {
        try {
            // Use the new port 8001
            const res = await fetch("http://localhost:8000/api/v1/voice/token");
            if (!res.ok) throw new Error("Backend unavailable");
            const data = await res.json();
            setRoomToken(data.token);
            setIsConnected(true);
        } catch (e) {
            console.error("Failed to get voice token", e);
            alert("Voice service currently unavailable. Make sure backend is running on port 8001 with LIVEKIT_API_KEY.");
        }
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setRoomToken(null);
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border-2 border-dashed border-indigo-100 min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                    <Mic className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Environmental Voice Assistant</h3>
                <p className="text-gray-500 text-center max-w-sm mb-8">
                    Engage in a real-time voice conversation with our AI guardian powered by GraphRAG and Gemini.
                </p>
                <Button
                    onClick={connectToVoice}
                    size="lg"
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                >
                    <Mic className="w-5 h-5" />
                    Initialize Voice Session
                </Button>
            </div>
        );
    }

    return (
        <Card className="border-indigo-600 shadow-2xl bg-slate-900 text-white overflow-hidden animate-in zoom-in duration-300 min-h-[500px] flex flex-col">
            <CardContent className="p-8 flex-grow flex flex-col relative">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <span className="w-1 h-4 bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-6 bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-3 bg-indigo-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">Mechovate Neural Voice</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleDisconnect} className="text-white/50 hover:text-white hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <LiveKitRoom
                    token={roomToken || ""}
                    serverUrl={lkUrl}
                    connect={true}
                    audio={true}
                    video={false}
                    onDisconnected={handleDisconnect}
                    className="flex-grow flex flex-col items-center justify-center"
                >
                    <div className="w-full flex flex-col items-center gap-12">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500/30 blur-[100px] rounded-full group-hover:bg-indigo-400/40 transition-all duration-1000" />
                            <div className="w-48 h-48 rounded-full bg-slate-800 border-8 border-slate-700 flex items-center justify-center relative z-10 shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 to-transparent" />
                                <Volume2 className="w-20 h-20 text-indigo-400 relative z-20" />
                                {/* Visualizer ring */}
                                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping" />
                            </div>
                        </div>

                        <div className="text-center space-y-2 relative z-10">
                            <h4 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">Agent is Active</h4>
                            <p className="text-indigo-300/70 text-sm font-medium">Listening for environmental queries...</p>
                        </div>

                        <div className="w-full max-w-sm flex flex-col gap-4">
                            <RoomAudioRenderer />
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm">
                                <VoiceAssistantControlBar controls={{ leave: false }} className="w-full justify-center" />
                            </div>
                            <DisconnectButton className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all font-bold uppercase tracking-widest text-xs">
                                End Voice Session
                            </DisconnectButton>
                        </div>
                    </div>
                </LiveKitRoom>
            </CardContent>
            <div className="bg-slate-950/50 px-8 py-4 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase letter-spacing-widest">
                    <Activity className="w-3 h-3" /> System Latency: 42ms
                </div>
                <div className="text-[10px] text-indigo-500 font-black">ENCRYPTED</div>
            </div>
        </Card>
    );
}

