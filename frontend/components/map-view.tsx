"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, ShieldCheck, Database, Activity, Globe, Search as SearchIcon, MapPin, Loader2 } from "lucide-react";

function SearchControl({ map, onSearchSetMarker }: { map: L.Map, onSearchSetMarker: (pos: [number, number] | null) => void }) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        onSearchSetMarker(null);
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
                map.flyTo(newPos, 10, { duration: 2 });
                onSearchSetMarker(newPos);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-sm px-4">
            <form
                onSubmit={handleSearch}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-2 group transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white"
            >
                <div className="pl-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search locations..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                    onFocus={(e) => {
                        if (map) {
                            map.dragging.disable();
                            map.scrollWheelZoom.disable();
                        }
                    }}
                    onBlur={(e) => {
                        if (map) {
                            map.dragging.enable();
                            map.scrollWheelZoom.enable();
                        }
                    }}
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-center disabled:opacity-50"
                    disabled={loading}
                >
                    <SearchIcon className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}

function MapInstanceHandler({ setMap }: { setMap: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
        if (map) setMap(map);
    }, [map, setMap]);
    return null;
}

// Creative 'Data Pulse' Marker Styles
// These use CSS instead of external images to ensure they always load and look modern
const createPulseIcon = (color: string, isExpert: boolean = false) => {
    return L.divIcon({
        className: 'custom-data-marker',
        html: `
            <div class="relative flex items-center justify-center">
                <!-- Inner Core -->
                <div class="w-3 h-3 rounded-full shadow-lg z-10" style="background-color: ${color}"></div>
                
                <!-- Expanding Pulse Ring -->
                <div class="absolute w-full h-full rounded-full animate-ping opacity-40" style="background-color: ${color}; animation-duration: 3s"></div>
                
                <!-- Secondary Glow -->
                <div class="absolute w-6 h-6 rounded-full opacity-20" style="background-color: ${color}"></div>

                ${isExpert ? `
                <!-- Expertise Halo for Verified Volunteers -->
                <div class="absolute -inset-1 border border-white/50 rounded-full animate-spin" style="animation-duration: 10s"></div>
                <div class="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                    <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-600">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                ` : ''}
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const greenPulse = createPulseIcon('#10b981');
const redPulse = createPulseIcon('#ef4444');
const orangePulse = createPulseIcon('#f59e0b');
const expertPulse = createPulseIcon('#10b981', true);
const selectionPulse = createPulseIcon('#6366f1');

const searchMarkerIcon = L.divIcon({
    className: 'custom-search-marker',
    html: `
        <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white animate-bounce">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
            </div>
            <div class="absolute -bottom-1 w-2 h-1 bg-black/20 rounded-full blur-[1px]"></div>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

interface Observation {
    id: number;
    type: string;
    value: number;
    lat: number;
    long: number;
    is_valid: boolean;
    needs_review: boolean;
    is_expert?: boolean;
    timestamp: string;
    quality_label?: string;
    color_code?: string;
    health_msg?: string;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, long: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={selectionPulse}></Marker>
    );
}

export default function MapView({
    observations,
    onLocationSelect,
    onTabSwitch,
    PickerMode = false,
    MiniMode = false,
    center,
    zoom
}: {
    observations: Observation[],
    onLocationSelect?: (lat: number, long: number) => void,
    onTabSwitch?: (tab: string, observation: any) => void,
    PickerMode?: boolean,
    MiniMode?: boolean,
    center?: [number, number],
    zoom?: number
}) {
    const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);
    const [map, setMap] = useState<L.Map | null>(null);

    const handleInternalLocationSelect = (lat: number, lng: number) => {
        if (onLocationSelect) onLocationSelect(lat, lng);
    };

    return (
        <div className="h-full w-full relative z-0 overflow-hidden">
            {map && !MiniMode && (
                <SearchControl
                    map={map}
                    onSearchSetMarker={(pos) => {
                        setSearchMarker(pos);
                        if (pos && PickerMode && onLocationSelect) {
                            onLocationSelect(pos[0], pos[1]);
                        }
                    }}
                />
            )}

            <MapContainer
                center={center || [20.5937, 78.9629]}
                zoom={zoom || (MiniMode ? 14 : 4)}
                style={{ height: "100%", width: "100%" }}
                zoomControl={!MiniMode}
                dragging={!MiniMode}
                scrollWheelZoom={!MiniMode}
                doubleClickZoom={!MiniMode}
                attributionControl={!MiniMode}
            >
                <MapInstanceHandler setMap={setMap} />
                {!MiniMode && (
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Map View (Street)">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors'
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite View">
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution='Tiles &copy; Esri'
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                )}

                {MiniMode && (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                )}

                {!MiniMode && <LocationMarker onLocationSelect={handleInternalLocationSelect} />}

                {(MiniMode && center) && (
                    <Marker position={center} icon={selectionPulse} />
                )}

                {searchMarker && (
                    <Marker position={searchMarker} icon={searchMarkerIcon}>
                        <Popup>
                            <div className="text-center p-1">
                                <p className="text-[10px] font-black uppercase text-indigo-600">Searched Location</p>
                                <p className="text-xs font-bold text-slate-500">{PickerMode ? 'Click map to confirm' : 'Target identified via GIS'}</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {observations.map((obs, idx) => (
                    <Marker
                        key={idx}
                        position={[obs.lat, obs.long]}
                        icon={obs.is_expert ? expertPulse : (obs.needs_review ? orangePulse : (obs.is_valid ? greenPulse : redPulse))}
                    >
                        <Popup>
                            <div className="min-w-[220px] p-2">
                                <div className="border-b pb-2 mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">#{obs.id} Observation</span>
                                        {obs.is_expert && (
                                            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold border border-emerald-200 uppercase tracking-widest">Verified</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 capitalize leading-tight">
                                        {obs.type} Station
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Metric Value</span>
                                        <span className="text-xl font-black text-indigo-600 font-mono leading-none">
                                            {obs.value.toFixed(1)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Health Label</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white shadow-sm`} style={{ backgroundColor: obs.color_code || (obs.is_valid ? '#10b981' : '#ef4444') }}>
                                            {obs.quality_label || (obs.is_valid ? 'Normal' : 'Hazardous')}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1.5 pt-3 border-t">
                                        <button
                                            onClick={() => onTabSwitch?.('validate', obs)}
                                            className="w-full bg-emerald-600 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck className="w-3 h-3" /> Deep Validation
                                        </button>
                                        <button
                                            onClick={() => onTabSwitch?.('chat', obs)}
                                            className="w-full border-2 border-indigo-600 text-indigo-600 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                                        >
                                            <Database className="w-3 h-3" /> Analyze with AI
                                        </button>
                                    </div>

                                    <div className="text-[9px] text-gray-400 text-right italic font-medium">
                                        {new Date(obs.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
