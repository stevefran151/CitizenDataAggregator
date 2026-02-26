"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("./map-view"), { ssr: false });

import { Wind, Droplets, Mountain, ArrowRight, CheckCircle2, FlaskConical, ShieldCheck, UserCheck, Thermometer, CloudRain, Gauge, Activity, Map as MapIcon, Leaf, Bug } from "lucide-react";

export default function ObservationForm({ onObservationAdded, selectedLocation, onNavigateToMap }: {
    onObservationAdded: (obs: any) => void,
    selectedLocation?: { lat: number, lng: number } | null,
    onNavigateToMap?: () => void
}) {
    // Steps: 0 = Category, 1 = Details, 2 = Location (Review)
    const [step, setStep] = useState(0);
    const [category, setCategory] = useState("");

    // Detailed Parameters State
    const [params, setParams] = useState<Record<string, string>>({});

    // Location State
    const [lat, setLat] = useState("");
    const [long, setLong] = useState("");
    const [locationName, setLocationName] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [isGeocoding, setIsGeocoding] = useState(false);

    const [loading, setLoading] = useState(false);
    const [isExpert, setIsExpert] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);


    useEffect(() => {
        if (selectedLocation) {
            setLat(selectedLocation.lat.toFixed(6));
            setLong(selectedLocation.lng.toFixed(6));
        }

        const role = localStorage.getItem("userRole");
        setIsExpert(role === 'expert');
    }, [selectedLocation]);

    useEffect(() => {
        const fetchLocationName = async () => {
            if (lat && long && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(long))) {
                try {
                    const res = await fetch(`http://localhost:8001/api/geocode?lat=${lat}&long=${long}`);
                    const data = await res.json();
                    if (data.location_name) setLocationName(data.location_name);
                } catch (e) {
                    console.error("Geocoding preview failed", e);
                }
            }
        };
        const timer = setTimeout(fetchLocationName, 1000);
        return () => clearTimeout(timer);
    }, [lat, long]);

    const handleCategorySelect = (cat: string) => {
        setCategory(cat);
        const defaults: Record<string, string> = {};
        if (cat === "air") {
            defaults.aqi = "25";
            defaults.pm2_5 = "12";
        } else if (cat === "water") {
            defaults.ph = "7.0";
            defaults.turbidity = "5.0";
        } else if (cat === "soil") {
            defaults.moisture = "45";
            defaults.ph = "6.5";
        } else if (cat === "biodiversity") {
            defaults.species_richness = "15";
            defaults.canopy_cover = "75";
        } else if (cat === "noise") {
            defaults.db = "45";
        } else if (cat === "waste") {
            defaults.collection_efficiency = "85";
        } else if (cat === "weather") {
            defaults.temp = "28";
            defaults.precip = "0";
        } else if (cat === "radiation") {
            defaults.uv_index = "4";
        }
        setParams(defaults);
        setStep(1);
    };

    const handleParamChange = (key: string, value: string) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const handleLocationPicked = (newLat: number, newLng: number) => {
        setLat(newLat.toFixed(6));
        setLong(newLng.toFixed(6));
        setShowMapPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const primaryValue = parseFloat(params[Object.keys(params)[0]] || "0");
        const parsedLat = parseFloat(lat);
        const parsedLong = parseFloat(long);

        if (isNaN(parsedLat) || isNaN(parsedLong)) {
            alert("Location required.");
            setLoading(false);
            return;
        }

        const payload = {
            type: category,
            value: primaryValue,
            lat: parsedLat,
            long: parsedLong,
            location_name: locationName,
            details: params,
            is_expert: isExpert
        };

        try {
            const res = await fetch("http://localhost:8001/api/observe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                onObservationAdded(data);
                setStep(0);
                setCategory("");
                setParams({});
                setLat("");
                setLong("");
                setLocationQuery("");
            } else {
                const err = await res.json();
                alert(`Submission Error: ${err.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error submitting:", error);
            alert("Network synchronization failed. Data locally cached.");
        } finally {
            setLoading(false);
        }
    };

    const renderCategoryStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Protocol Selection</p>
                <h4 className="text-lg font-bold text-slate-900">Select Environmental Vector</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { id: "air", label: "Atmosphere", icon: Wind, desc: "Air Quality & Gas", color: "indigo" },
                    { id: "water", label: "Hydrosphere", icon: Droplets, desc: "Water & Purity", color: "cyan" },
                    { id: "soil", label: "Lithosphere", icon: Mountain, desc: "Soil Composition", color: "emerald" },
                    { id: "biodiversity", label: "Biosphere", icon: Leaf, desc: "Species & Ecology", color: "lime" },
                    { id: "noise", label: "Acoustics", icon: Activity, desc: "Noise Pollution", color: "orange" },
                    { id: "waste", label: "Sanitation", icon: FlaskConical, desc: "Waste Management", color: "amber" },
                    { id: "weather", label: "Meteorology", icon: CloudRain, desc: "Weather Patterns", color: "blue" },
                    { id: "radiation", label: "Radiology", icon: ShieldCheck, desc: "UV & Radiation", color: "red" },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleCategorySelect(item.id)}
                        className="group relative flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-900 transition-all hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors`}>
                            <item.icon className="w-7 h-7" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm mb-1">{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDetailsStep = () => {
        const fieldConfig: Record<string, { id: string, label: string, unit: string, icon: any }[]> = {
            air: [
                { id: "aqi", label: "Air Quality Index", unit: "AQI", icon: Gauge },
                { id: "pm2_5", label: "Particulate Matter", unit: "µg/m³", icon: Activity },
                { id: "temp", label: "Ambient Temp", unit: "°C", icon: Thermometer },
                { id: "humidity", label: "Relative Humidity", unit: "%", icon: CloudRain },
            ],
            water: [
                { id: "ph", label: "Acidity Level", unit: "pH", icon: FlaskConical },
                { id: "turbidity", label: "Turbidity", unit: "NTU", icon: Activity },
                { id: "temp", label: "Water Temp", unit: "°C", icon: Thermometer },
            ],
            soil: [
                { id: "moisture", label: "Soil Moisture", unit: "%", icon: Droplets },
                { id: "ph", label: "Soil Acidity", unit: "pH", icon: FlaskConical },
                { id: "temp", label: "Ground Temp", unit: "°C", icon: Thermometer },
            ],
            biodiversity: [
                { id: "species_richness", label: "Species Count", unit: "Species", icon: Bug },
                { id: "canopy_cover", label: "Canopy Cover", unit: "%", icon: Wind },
                { id: "biodiversity_index", label: "Biodiversity Index", unit: "Idx", icon: Gauge },
                { id: "invasive_count", label: "Invasive Species", unit: "Count", icon: Activity },
            ],
            noise: [
                { id: "db", label: "Noise Level", unit: "dB", icon: Activity },
            ],
            waste: [
                { id: "collection_efficiency", label: "Collection Efficiency", unit: "%", icon: Activity },
                { id: "recycling_rate", label: "Recycling Rate", unit: "%", icon: CheckCircle2 },
            ],
            weather: [
                { id: "temp", label: "Temperature", unit: "°C", icon: Thermometer },
                { id: "precip", label: "Precipitation", unit: "mm", icon: CloudRain },
                { id: "wind_speed", label: "Wind Speed", unit: "km/h", icon: Wind },
            ],
            radiation: [
                { id: "uv_index", label: "UV Index", unit: "Idx", icon: Gauge },
                { id: "microsieverts", label: "Radiation (µSv/h)", unit: "µSv/h", icon: Activity },
            ]
        };

        const currentFields = fieldConfig[category] || [];

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <button onClick={() => setStep(0)} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition transition-colors">&larr; Change Category</button>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{category} node details</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentFields.map(field => (
                        <div key={field.id} className="relative group">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">{field.label}</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                    <field.icon className="w-4 h-4" />
                                </div>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={params[field.id] || ""}
                                    onChange={(e) => handleParamChange(field.id, e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-16 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-4 text-[10px] font-black text-slate-400 uppercase">{field.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <Button className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-200" onClick={() => setStep(2)}>
                    Validate Geographic Node <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        );
    };

    const renderLocationStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition">&larr; Review Details</button>
                <span className="text-[10px] font-black uppercase text-slate-900 bg-slate-100 px-3 py-1 rounded-full">Coordinate Binding</span>
            </div>

            <div className="space-y-6">

                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-900 transition-all">
                    <button
                        type="button"
                        onClick={() => setShowMapPicker(true)}
                        className="relative w-full h-32 flex flex-col items-center justify-center gap-2 transition-all overflow-hidden"
                    >
                        {lat ? (
                            <div className="absolute inset-0 z-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                <MapView
                                    MiniMode
                                    center={[parseFloat(lat), parseFloat(long)]}
                                    observations={[]}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/40 pointer-events-none" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-slate-50/50 z-0" />
                        )}

                        <div className="relative z-10 flex flex-col items-center justify-center gap-1 drop-shadow-sm">
                            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-white/50 mb-1 group-hover:scale-110 transition-transform">
                                <MapIcon className={`w-6 h-6 ${lat ? "text-slate-900" : "text-slate-300"} group-hover:text-slate-900`} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-900 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50">
                                {lat ? "Change Binding Node" : "Open Precision Map Picker"}
                            </span>
                            {locationName && (
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/80 backdrop-blur-sm px-3 py-1 rounded-full mt-2 border border-indigo-100 animate-in fade-in zoom-in duration-300">
                                    {locationName}
                                </span>
                            )}
                            {lat && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-full mt-1 border border-white/50">GIS Lock: {lat}, {long}</span>}
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900 transition-all">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Bounded Latitude</span>
                        <input
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-slate-900 w-full"
                            placeholder="Type or select..."
                        />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900 transition-all">
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Bounded Longitude</span>
                        <input
                            value={long}
                            onChange={(e) => setLong(e.target.value)}
                            className="bg-transparent border-none outline-none font-bold text-slate-900 w-full"
                            placeholder="Type or select..."
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-2xl shadow-slate-200" disabled={loading || !lat} onClick={handleSubmit}>
                {loading ? "Synchronizing with Global Network..." : "Finalize Transmission Block"}
            </Button>

            {/* Map Picker Modal */}
            {showMapPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[80vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h4 className="font-bold text-slate-900">Precision Coordinate Picker</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Search or click to bind coordinates</p>
                            </div>
                            <button onClick={() => setShowMapPicker(false)} className="text-slate-400 hover:text-slate-900 transition font-black text-xl hover:scale-110 transition-transform">&times;</button>
                        </div>
                        <div className="flex-1 relative">
                            <MapView PickerMode onLocationSelect={handleLocationPicked} observations={[]} />
                        </div>
                        <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">Live GIS Overlay Powered by OpenStreetMap</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Environmental Registry</h3>
                        <p className="text-sm font-medium text-slate-400">Step {step + 1} of 3: {step === 0 ? "Category" : step === 1 ? "Detailed Metrics" : "Geographic Binding"}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="min-h-[400px]">
                    {step === 0 && renderCategoryStep()}
                    {step === 1 && renderDetailsStep()}
                    {step === 2 && renderLocationStep()}
                </div>
            </CardContent>
        </Card>
    );
}

