"use client";


import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Fix Leaflet marker icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

// Custom icons
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


interface Observation {
    id: number;
    type: string;
    value: number;
    lat: number;
    long: number;
    is_valid: boolean;
    timestamp: string;
    quality_label?: string;
    color_code?: string;
    health_msg?: string;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, long: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function MapView({ observations, onLocationSelect }: { observations: Observation[], onLocationSelect: (lat: number, long: number) => void }) {
    const [isMounted, setIsMounted] = useState(false);
    const [tempMarker, setTempMarker] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSelect = (lat: number, lng: number) => {
        setTempMarker({ lat, lng });
        onLocationSelect(lat, lng);
    };

    if (!isMounted) {
        return <div className="h-[400px] w-full bg-muted flex items-center justify-center">Loading Map...</div>;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Observation Map (Click to pick location)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] w-full rounded-md overflow-hidden z-0">
                    <MapContainer center={[51.505, -0.09]} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker onLocationSelect={handleSelect} />
                        {tempMarker && (
                            <Marker position={[tempMarker.lat, tempMarker.lng]} icon={new L.Icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            })} />
                        )}
                        {observations.map((obs, idx) => (
                            <Marker
                                key={idx}
                                position={[obs.lat, obs.long]}
                                icon={obs.is_valid ? greenIcon : redIcon}
                            >
                                <Popup>
                                    <div className="min-w-[200px] p-1">
                                        <h3 className="font-bold text-base capitalize mb-2 border-b pb-1">{obs.type} Station</h3>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Value:</span>
                                                <span className="font-mono font-bold">{obs.value.toFixed(1)}</span>
                                            </div>

                                            {obs.quality_label && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Quality:</span>
                                                    <span
                                                        className="px-2 py-0.5 rounded text-white text-xs font-bold shadow-sm"
                                                        style={{ backgroundColor: obs.color_code || '#888' }}
                                                    >
                                                        {obs.quality_label}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Validity:</span>
                                                <span className={obs.is_valid ? "text-green-600 font-medium" : "text-red-600 font-bold"}>
                                                    {obs.is_valid ? "Verified" : "Anomaly"}
                                                </span>
                                            </div>

                                            {obs.health_msg && (
                                                <div className="bg-slate-50 p-2 rounded border border-slate-100 mt-2 text-xs italic text-gray-600">
                                                    "{obs.health_msg}"
                                                </div>
                                            )}

                                            <div className="text-xs text-gray-400 pt-2 text-right">
                                                {new Date(obs.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        {/* Legend moved outside */}
                    </MapContainer>
                </div>
                {/* Legend Outside Map */}
                <div className="flex flex-wrap gap-6 mt-4 p-4 bg-slate-50 rounded-md border text-sm items-center shadow-sm">
                    <span className="font-bold text-gray-700 uppercase tracking-wide text-xs">Map</span>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm ring-2 ring-green-100"></span>
                        <span className="text-gray-600 font-medium">Valid Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm ring-2 ring-red-100"></span>
                        <span className="text-gray-600 font-medium">Outlier / Anomaly</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm ring-2 ring-blue-100"></span>
                        <span className="text-gray-600 font-medium">Selected Location</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
