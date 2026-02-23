"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ObservationForm from "@/components/observation-form";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });
import ValidationPanel from "@/components/validation-panel";
import Link from "next/link";
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

import ChatInterface from "@/components/chat-interface";

export default function Dashboard() {
    const [observations, setObservations] = useState<Observation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [currentObservation, setCurrentObservation] = useState<Observation | null>(null);

    useEffect(() => {
        fetchObservations();
    }, []);

    const fetchObservations = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/v1/data");
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

    const [activeTab, setActiveTab] = useState("map");

    const handleDownload = () => {
        window.location.href = "http://localhost:8000/api/v1/export";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex justify-between items-center max-w-7xl mx-auto mb-8">
                <h1 className="text-3xl font-bold">Citizen Science Dashboard</h1>
                <div className="flex gap-4">
                    <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">Home</Link>
                    <Link href="/trends" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition">View Trends</Link>
                    <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Download CSV</button>
                    <a href="http://localhost:8000/docs" target="_blank" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition">API Docs</a>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {["map", "form", "validate", "chat", "voice"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg capitalize transition-colors ${activeTab === tab ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                        >
                            {tab === "map" ? "Map View" :
                                tab === "form" ? "Submit Data" :
                                    tab === "validate" ? "Validate" :
                                        tab === "chat" ? "AI Chat" : "Voice Agent"}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
                    {activeTab === "map" && <MapView observations={observations} onLocationSelect={handleLocationSelect} />}
                    {activeTab === "form" && <ObservationForm onObservationAdded={handleObservationAdded} selectedLocation={selectedLocation} />}
                    {activeTab === "validate" && <ValidationPanel observation={currentObservation} />}
                    {activeTab === "voice" && <VoiceAgent />}
                    {activeTab === "chat" && (
                        <div className="h-[600px] flex flex-col">
                            <ChatInterface observation={currentObservation} />
                            <div className="text-center text-gray-500 mt-4 border-t pt-2">
                                Tip: Select an observation on the map or validate tab to give the AI specific context.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
