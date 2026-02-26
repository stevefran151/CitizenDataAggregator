"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Globe, ShieldCheck, Database, AlertTriangle, CheckCircle2, FlaskConical, ChevronLeft, ChevronRight } from "lucide-react";

interface Observation {
    id: number;
    type: string;
    value: number;
    lat: number;
    long: number;
    is_valid: boolean;
    timestamp: string;
    source?: string;
    needs_review: boolean;
    validation_status: string;
    is_expert?: boolean;
    validation_report?: {
        satellite_value?: number;
        standards?: Record<string, { range: string; valid: boolean }>;
        ml_status?: string;
        hitl_reason?: string;
        trust_level?: string;
        news_justification?: string;
    };
}

export default function ValidationPanel({
    observation,
    allObservations = [],
    onSelectObservation
}: {
    observation: Observation | null,
    allObservations?: Observation[],
    onSelectObservation?: (obs: Observation) => void
}) {
    const [updating, setUpdating] = useState(false);

    const currentIndex = observation ? allObservations.findIndex(o => o.id === observation.id) : -1;

    const navigate = (direction: 'next' | 'prev') => {
        if (!allObservations.length || !onSelectObservation) return;
        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        // Wrap around
        if (nextIndex >= allObservations.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = allObservations.length - 1;

        onSelectObservation(allObservations[nextIndex]);
    };

    const handleManualValidation = async (isValid: boolean) => {
        if (!observation) return;
        setUpdating(true);
        try {
            const res = await fetch(`http://localhost:8000/api/observations/${observation.id}/validate?is_valid=${isValid}`, {
                method: 'PUT'
            });
            if (res.ok) {
                alert(isValid ? "Observation approved!" : "Observation rejected.");
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to update validation", error);
        } finally {
            setUpdating(false);
        }
    };

    if (!observation) {
        return (
            <Card className="w-full mt-4 bg-muted/50 border-dashed">
                <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="max-w-[200px] text-sm font-medium">Select an observation on the map or use the button above to start reviewing.</p>
                </CardContent>
            </Card>
        );
    }

    const isOutlier = !observation.is_valid;
    const needsReview = observation.needs_review;
    const report = observation.validation_report;

    return (
        <div className="space-y-4">
            {/* Quick Navigation Header */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <button
                    onClick={() => navigate('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-indigo-600"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Observation</span>
                    <span className="font-bold text-sm text-gray-700">{currentIndex + 1} of {allObservations.length}</span>
                </div>
                <button
                    onClick={() => navigate('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-indigo-600"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <Card className={`w-full border-l-4 overflow-hidden relative ${needsReview ? "border-l-amber-500" : (isOutlier ? "border-l-red-500" : "border-l-green-500")}`}>
                {(isOutlier || needsReview) && (
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <AlertTriangle className={`w-24 h-24 ${needsReview ? "text-amber-500" : "text-red-500"}`} />
                    </div>
                )}
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-indigo-500" />
                            <span className="text-lg">Validation Report</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm flex items-center gap-1 ${needsReview ? "bg-amber-500" : (isOutlier ? "bg-red-500" : "bg-emerald-600")}`}>
                            {needsReview ? <AlertTriangle className="w-3 h-3" /> : (isOutlier ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />)}
                            {needsReview ? "Pending Review" : (isOutlier ? "Anomaly" : "Verified")}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    {needsReview && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4 animate-pulse">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                <h4 className="font-bold text-amber-800 text-sm">Human Review Required</h4>
                            </div>
                            <p className="text-xs text-amber-700 leading-relaxed mb-4">
                                <strong>Reason:</strong> {report?.hitl_reason || "Insufficient external validation sources for this region."}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleManualValidation(true)}
                                    disabled={updating}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                                >
                                    {updating ? "Processing..." : "Approve Observation"}
                                </button>
                                <button
                                    onClick={() => handleManualValidation(false)}
                                    disabled={updating}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 transition-hover hover:border-indigo-100">
                            <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1 tracking-wider">Metric Type</span>
                            <span className="font-bold text-gray-700 capitalize">{observation.type}</span>
                        </div>
                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 transition-hover hover:border-indigo-100">
                            <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1 tracking-wider">Recorded Value</span>
                            <span className="font-mono text-xl text-indigo-700 font-black">{observation.value}</span>
                        </div>
                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 transition-hover hover:border-indigo-100">
                            <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1 tracking-wider">Geocode</span>
                            <span className="text-xs font-semibold text-gray-600">{observation.lat.toFixed(3)}, {observation.long.toFixed(3)}</span>
                        </div>
                        <div className={`p-3 rounded-xl border transition-all ${observation.is_expert ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"}`}>
                            <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1 tracking-wider">Reporter Trust</span>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${observation.is_expert ? "text-emerald-700" : "text-gray-700"}`}>
                                    {observation.is_expert ? "Verified Volunteer" : "Standard Citizen"}
                                </span>
                                {observation.is_expert && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                            </div>
                        </div>
                    </div>

                    {isOutlier && (
                        <div className="p-3 bg-red-50/50 rounded-xl text-[11px] text-red-800 border border-red-100/50 flex gap-2 items-start leading-relaxed">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p><strong>Heuristic Conflict:</strong> This value deviates significantly (&gt;100 units) from independent satellite data for this coordinate. Verification rejected.</p>
                        </div>
                    )}

                    {report?.news_justification && (
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 animate-in fade-in duration-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-4 h-4 text-indigo-600" />
                                <h4 className="font-bold text-indigo-800 text-xs mt-0.5">News Trend Verification</h4>
                            </div>
                            <p className="text-[11px] text-indigo-700 italic leading-relaxed">
                                "{report.news_justification}"
                            </p>
                        </div>
                    )}

                    <div className="mt-2 pt-4 border-t border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Cross-Reference Analysis
                        </h4>
                        <div className="space-y-3">
                            {/* Open-Meteo */}
                            <div className="p-3 rounded-xl border border-transparent hover:border-indigo-50 hover:bg-indigo-50/20 transition-all group">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-xs font-bold text-gray-700">Open-Meteo Satellite</span>
                                    </div>
                                    <span className="font-mono font-black text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {typeof report?.satellite_value === 'number' ? report.satellite_value.toFixed(1) : "N/A"}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-tight">
                                    Real-time environmental model data used for accuracy cross-checking.
                                </p>
                            </div>

                            {/* Standards */}
                            <div className="p-3 rounded-xl border border-transparent hover:border-emerald-50 hover:bg-emerald-50/20 transition-all group">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs font-bold text-gray-700">WHO & EPA Standards</span>
                                    </div>
                                    <span className="font-mono font-black text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        {report?.standards?.aqi?.range || report?.standards?.value?.range || "0 - 500"}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-tight">
                                    Scientifically possible safety thresholds and physiological limits.
                                </p>
                            </div>

                            {/* ML Status */}
                            <div className="p-3 rounded-xl border border-transparent hover:border-orange-50 hover:bg-orange-50/20 transition-all group">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-xs font-bold text-gray-700">ML Anomaly Detection</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${report?.ml_status === "Passed" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                                        {report?.ml_status || "Checking..."}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-tight">
                                    Isolation Forest ensemble analyzing statistical deviation from local clusters.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-6 border-t border-gray-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        <div className="flex justify-center items-center gap-6">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/World_Health_Organization_Logo.svg" alt="WHO" className="h-4" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/U.S._Environmental_Protection_Agency_logo.svg/1200px-U.S._Environmental_Protection_Agency_logo.svg.png" alt="EPA" className="h-6" />
                            <div className="text-[8px] font-black text-gray-400 border border-gray-200 px-2 py-0.5 rounded bg-gray-50">SCIKIT-LEARN</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

