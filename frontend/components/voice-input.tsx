"use client";

import { useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VoiceInput({ onParsed }: { onParsed: (data: any) => void }) {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser. Try Chrome.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log("Heard:", transcript);
            setIsProcessing(true);

            try {
                const res = await fetch("http://localhost:8000/api/parse_voice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: transcript })
                });

                if (res.ok) {
                    const data = await res.json();
                    onParsed(data);
                } else {
                    console.error("Failed to parse voice");
                }
            } catch (error) {
                console.error("Error processing voice:", error);
            } finally {
                setIsProcessing(false);
            }
        };

        recognition.start();
    };

    return (
        <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={startListening}
            disabled={isListening || isProcessing}
            className={`gap-2 ${isListening ? "bg-red-50 text-red-600 border-red-200" : ""}`}
        >
            {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isListening ? (
                <MicOff className="h-4 w-4" />
            ) : (
                <Mic className="h-4 w-4" />
            )}
            {isListening ? "Listening..." : "Voice Input"}
        </Button>
    );
}
