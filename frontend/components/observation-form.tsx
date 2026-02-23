"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import VoiceInput from "@/components/voice-input";
import { Wind, Droplets, Mountain, Speaker, ArrowRight, CheckCircle2, FlaskConical } from "lucide-react";

export default function ObservationForm({ onObservationAdded, selectedLocation }: { onObservationAdded: (obs: any) => void, selectedLocation?: { lat: number, lng: number } | null }) {
    // Steps: 0 = Category, 1 = Details, 2 = Location (Review)
    const [step, setStep] = useState(0);
    const [category, setCategory] = useState("");

    // Detailed Parameters State
    const [params, setParams] = useState<Record<string, string>>({});

    // Location State
    const [lat, setLat] = useState("");
    const [long, setLong] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [isGeocoding, setIsGeocoding] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedLocation) {
            setLat(selectedLocation.lat.toFixed(6));
            setLong(selectedLocation.lng.toFixed(6));
        }
    }, [selectedLocation]);

    const handleCategorySelect = (cat: string) => {
        setCategory(cat);
        setParams({}); // Reset params
        setStep(1);
    };

    const handleParamChange = (key: string, value: string) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const handleGeocode = async () => {
        if (!locationQuery) return;
        setIsGeocoding(true);
        try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                alert("Google Maps API key is missing");
                return;
            }
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationQuery)}&key=${apiKey}`);
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setLat(lat.toFixed(6));
                setLong(lng.toFixed(6));
            } else {
                alert("Location not found");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert("Error finding location");
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Determine primary value for backward compatibility / indexing
        let primaryValue = 0;
        if (category === "air") primaryValue = parseFloat(params.aqi || "0");
        else if (category === "water") primaryValue = parseFloat(params.ph || "0"); // pH as primary? Or WQI if calculated
        else if (category === "soil") primaryValue = parseFloat(params.ph || "0");
        else if (category === "noise") primaryValue = parseFloat(params.db || "0");

        // If primary value is 0 but other params exist, pick first numeric
        if (primaryValue === 0) {
            const firstVal = Object.values(params).find(v => !isNaN(parseFloat(v)));
            if (firstVal) primaryValue = parseFloat(firstVal);
        }

        try {
            const res = await fetch("http://localhost:8001/api/observe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: category,
                    value: primaryValue,
                    lat: parseFloat(lat),
                    long: parseFloat(long),
                    details: params
                }),
            });

            if (!res.ok) {
                console.error("Failed to submit observation");
                alert("Submission failed. Validation rejected data.");
                return;
            }

            const data = await res.json();
            onObservationAdded(data);

            // Reset
            setStep(0);
            setCategory("");
            setParams({});
            setLat("");
            setLong("");
            setLocationQuery("");
        } catch (error) {
            console.error("Error submitting:", error);
            alert("Error submitting observation");
        } finally {
            setLoading(false);
        }
    };

    // Render Steps
    const renderCategoryStep = () => (
        <div className="grid grid-cols-2 gap-4">
            {[
                { id: "air", label: "Air Quality", icon: Wind, color: "text-blue-500", bg: "bg-blue-50" },
                { id: "water", label: "Water Quality", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50" },
                { id: "soil", label: "Soil Health", icon: Mountain, color: "text-amber-700", bg: "bg-amber-50" },
                { id: "noise", label: "Noise Level", icon: Speaker, color: "text-purple-600", bg: "bg-purple-50" }
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleCategorySelect(item.id)}
                    className={`${item.bg} p-4 rounded-xl border-2 border-transparent hover:border-${item.color.split('-')[1]}-500 transition-all flex flex-col items-center justify-center gap-2 h-32`}
                >
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                    <span className="font-semibold text-gray-700">{item.label}</span>
                </button>
            ))}
        </div>
    );

    const renderDetailsStep = () => {
        let fields: { id: string, label: string, placeholder: string }[] = [];
        if (category === "air") {
            fields = [
                { id: "aqi", label: "AQI (Air Quality Index)", placeholder: "0-500" },
                { id: "pm2_5", label: "PM2.5 (µg/m³)", placeholder: "0-500" },
                { id: "pm10", label: "PM10 (µg/m³)", placeholder: "0-600" },
                { id: "co", label: "CO (ppm)", placeholder: "0-50" }
            ];
        } else if (category === "water") {
            fields = [
                { id: "ph", label: "pH Level", placeholder: "0-14" },
                { id: "dissolved_oxygen", label: "Dissolved Oxygen (mg/L)", placeholder: "e.g. 6.5" },
                { id: "turbidity", label: "Turbidity (NTU)", placeholder: "e.g. 5" }
            ];
        } else if (category === "soil") {
            fields = [
                { id: "ph", label: "pH Level", placeholder: "0-14" },
                { id: "moisture", label: "Moisture Content (%)", placeholder: "0-100" }
            ];
        } else if (category === "noise") {
            fields = [
                { id: "db", label: "Decibels (dB)", placeholder: "30-140" }
            ];
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => setStep(0)}>&larr; Back</Button>
                    <h3 className="font-semibold capitalize">{category} Parameters</h3>
                </div>
                {fields.map(field => (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <Input
                            id={field.id}
                            type="number"
                            step="0.01"
                            placeholder={field.placeholder}
                            value={params[field.id] || ""}
                            onChange={(e) => handleParamChange(field.id, e.target.value)}
                        />
                    </div>
                ))}
                <Button className="w-full mt-4" onClick={() => setStep(2)}>
                    Next: Location <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        );
    };

    const renderLocationStep = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>&larr; Back</Button>
                <h3 className="font-semibold">Confirm Location</h3>
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Search Location</Label>
                <div className="flex gap-2">
                    <Input
                        id="location"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder="Enter address or city"
                    />
                    <Button type="button" variant="outline" onClick={handleGeocode} disabled={isGeocoding || !locationQuery}>
                        {isGeocoding ? "..." : "Find"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="lat">Latitude</Label>
                    <Input id="lat" type="number" step="0.000001" value={lat} onChange={(e) => setLat(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="long">Longitude</Label>
                    <Input id="long" type="number" step="0.000001" value={long} onChange={(e) => setLong(e.target.value)} required />
                </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                <p>Note: Data will be validated against World Geography standards and live satellite data.</p>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading} onClick={handleSubmit}>
                {loading ? "Validating & Submitting..." : (
                    <>Submit Observation <CheckCircle2 className="w-4 h-4 ml-2" /></>
                )}
            </Button>
        </div>
    );

    return (
        <Card className="w-full shadow-lg border-t-4 border-t-indigo-500">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>New Observation</span>
                    {step === 0 && <VoiceInput onParsed={() => { }} />}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {step === 0 && renderCategoryStep()}
                {step === 1 && renderDetailsStep()}
                {step === 2 && renderLocationStep()}
            </CardContent>
        </Card>
    );
}
