import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
    Shield, AlertTriangle, MapPin, Layers, Search, Filter,
    Hospital, Building2, Landmark, Siren, X, ChevronRight, Phone,
    Heart, ShoppingCart, Banknote, Flame, Coffee
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from "@react-google-maps/api";

import { API_URL } from "../../config/api";
const MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBS: ("places")[] = ["places"];

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0a0e1a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#060a14" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111827" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1a2332" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

const CATEGORY_META: Record<string, { icon: any; color: string; label: string }> = {
    police_station: { icon: Building2, color: "#3b82f6", label: "Police" },
    hospital: { icon: Hospital, color: "#ef4444", label: "Hospital" },
    embassy: { icon: Landmark, color: "#8b5cf6", label: "Embassy" },
    verified_shelter: { icon: Shield, color: "#22c55e", label: "Shelter" },
    fire_station: { icon: Siren, color: "#f97316", label: "Fire Station" },
    // Google Places categories
    pharmacy: { icon: Heart, color: "#8b5cf6", label: "Pharmacy" },
    grocery_or_supermarket: { icon: ShoppingCart, color: "#22c55e", label: "Grocery" },
    atm: { icon: Banknote, color: "#eab308", label: "ATM" },
    gas_station: { icon: Flame, color: "#f97316", label: "Gas" },
    restaurant: { icon: Coffee, color: "#ec4899", label: "Food" }
};

export default function SafetyMap() {
    const [zones, setZones] = useState<any[]>([]);
    const [hazards, setHazards] = useState<any[]>([]);
    const [places, setPlaces] = useState<any[]>([]);
    const [userPos, setUserPos] = useState({ lat: 11.0168, lng: 76.9558 });
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [showLegend, setShowLegend] = useState(true);
    const mapRef = useRef<google.maps.Map | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: MAPS_KEY,
        libraries: LIBS
    });

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (p) => {
                const lat = p.coords.latitude;
                const lng = p.coords.longitude;
                setUserPos({ lat, lng });

                try {
                    const [z, h, p] = await Promise.all([
                        fetch(`${API_URL}/safety/zones?lat=${lat}&lng=${lng}&radius=50000`).then(r => r.json()),
                        fetch(`${API_URL}/safety/hazards?status=active&lat=${lat}&lng=${lng}&radius=50000`).then(r => r.json()),
                        fetch(`${API_URL}/safety/nearby-places?lat=${lat}&lng=${lng}`).then(r => r.json()),
                    ]);
                    setZones(z.zones || []);
                    setHazards(h.hazards || []);
                    setPlaces(p.places || []);
                } catch (e) { console.error(e); }
            },
            () => { alert("THOR requires GPS access to monitor live safety."); }
        );
    }, []);

    const filteredZones = activeFilter ? zones.filter(z => z.category.toLowerCase() === activeFilter.toLowerCase()) : zones;
    const filteredPlaces = activeFilter ? places.filter(p => p.category.toLowerCase() === activeFilter.toLowerCase()) : places;

    return (
        <div className="h-full flex flex-col relative w-full bg-black min-h-[calc(100vh-140px)]">
            {/* Map */}
            <div className="flex-1 w-full relative min-h-[500px]">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%", minHeight: "600px" }}
                        center={userPos} zoom={13}
                        onLoad={(m) => { mapRef.current = m; }}
                        options={{ styles: darkMapStyle, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
                    >
                        {/* User position */}
                        <Marker position={userPos}
                            icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#3b82f6", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 }} />

                        {/* Safe zones */}
                        {filteredZones.map((z, i) => {
                            const meta = CATEGORY_META[z.category];
                            return (
                                <Marker key={`z-${i}`} position={{ lat: z.latitude, lng: z.longitude }}
                                    onClick={() => setSelectedZone(z)}
                                    icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: meta?.color || "#22c55e", fillOpacity: 0.9, strokeColor: "#fff", strokeWeight: 1.5 }} />
                            );
                        })}

                        {/* Real Google Places */}
                        {filteredPlaces.map((p, i) => {
                            const meta = CATEGORY_META[p.category];
                            return (
                                <Marker key={`p-${i}`} position={{ lat: p.latitude, lng: p.longitude }}
                                    onClick={() => setSelectedZone(p)}
                                    icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: meta?.color || "#8b5cf6", fillOpacity: 0.9, strokeColor: "#fff", strokeWeight: 1.5 }} />
                            );
                        })}

                        {/* Hazard zones */}
                        {hazards.map((h, i) => (
                            <Circle key={`h-${i}`} center={{ lat: h.latitude, lng: h.longitude }}
                                radius={h.danger_radius_meters}
                                options={{
                                    fillColor: h.severity_score >= 70 ? "#ef4444" : "#eab308",
                                    fillOpacity: 0.08,
                                    strokeColor: h.severity_score >= 70 ? "#ef4444" : "#eab308",
                                    strokeWeight: 1.5, strokeOpacity: 0.4,
                                }} />
                        ))}

                        {/* InfoWindow */}
                        {selectedZone && (
                            <InfoWindow position={{ lat: selectedZone.latitude, lng: selectedZone.longitude }}
                                onCloseClick={() => setSelectedZone(null)}>
                                <div style={{ color: "#000", maxWidth: 200 }}>
                                    <p style={{ fontWeight: 700, marginBottom: 4 }}>{selectedZone.name}</p>
                                    <p style={{ fontSize: 12, color: "#666" }}>{selectedZone.category?.replace(/_/g, " ")}</p>
                                    {selectedZone.address && <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{selectedZone.address}</p>}
                                    {selectedZone.rating && <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: "bold", marginTop: 2 }}>⭐ {selectedZone.rating}</p>}
                                    {selectedZone.operating_hours && <p style={{ fontSize: 12, color: "#666" }}>{selectedZone.operating_hours}</p>}
                                    {selectedZone.open_now !== undefined && <p style={{ fontSize: 12, color: selectedZone.open_now ? "#22c55e" : "#ef4444", fontWeight: "bold" }}>{selectedZone.open_now ? "Open Now" : "Closed"}</p>}
                                    {selectedZone.contact_number && (
                                        <a href={`tel:${selectedZone.contact_number}`} style={{ fontSize: 12, color: "#3b82f6", display: "block", marginTop: 4 }}>
                                            📞 {selectedZone.contact_number}
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            const q = encodeURIComponent(`${selectedZone.latitude},${selectedZone.longitude}`);
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
                                        }}
                                        style={{
                                            marginTop: 8, padding: "6px 12px", background: "#3b82f6", color: "#fff",
                                            borderRadius: 6, fontSize: 12, fontWeight: 600, width: "100%", textAlign: "center", border: "none", cursor: "pointer"
                                        }}
                                    >
                                        Get Directions
                                    </button>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><div className="skeleton w-12 h-12 rounded-full" /></div>
                )}

                {/* Filter bar overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center gap-2 z-10">
                    <div className="card px-3 py-2 flex items-center gap-2 flex-wrap" style={{ backdropFilter: "blur(12px)", background: "rgba(17,24,39,0.85)" }}>
                        <Filter className="w-4 h-4" style={{ color: "var(--thor-text-muted)" }} />
                        <button onClick={() => setActiveFilter(null)}
                            className={`badge ${!activeFilter ? "badge-brand" : ""}`}
                            style={!activeFilter ? {} : { background: "var(--thor-surface-3)", color: "var(--thor-text-muted)" }}>
                            All
                        </button>
                        {Object.entries(CATEGORY_META).map(([key, meta]) => (
                            <button key={key} onClick={() => setActiveFilter(activeFilter === key ? null : key)}
                                className={`badge ${activeFilter === key ? "badge-brand" : ""}`}
                                style={activeFilter === key ? { background: meta.color, color: "#fff" } : { background: "var(--thor-surface-3)", color: "var(--thor-text-muted)" }}>
                                {meta.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                {showLegend && (
                    <div className="absolute bottom-6 left-4 card p-4 z-10" style={{ backdropFilter: "blur(12px)", background: "rgba(17,24,39,0.9)", width: 200 }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-caption font-semibold" style={{ color: "var(--thor-text)" }}>Legend</span>
                            <button onClick={() => setShowLegend(false)} style={{ color: "var(--thor-text-muted)" }}><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: "#3b82f6" }} /><span className="text-caption" style={{ color: "var(--thor-text-muted)" }}>Your location</span></div>
                            {Object.entries(CATEGORY_META).map(([k, m]) => (
                                <div key={k} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: m.color }} /><span className="text-caption" style={{ color: "var(--thor-text-muted)" }}>{m.label}</span></div>
                            ))}
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border" style={{ borderColor: "#ef4444", background: "rgba(239,68,68,0.2)" }} /><span className="text-caption" style={{ color: "var(--thor-text-muted)" }}>Danger zone</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border" style={{ borderColor: "#eab308", background: "rgba(234,179,8,0.2)" }} /><span className="text-caption" style={{ color: "var(--thor-text-muted)" }}>Caution zone</span></div>
                        </div>
                    </div>
                )}

                {/* Zone count */}
                <div className="absolute bottom-6 right-4 card px-4 py-2.5 z-10" style={{ backdropFilter: "blur(12px)", background: "rgba(17,24,39,0.9)" }}>
                    <p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>
                        <span className="font-semibold" style={{ color: "var(--thor-safe)" }}>{filteredZones.length}</span> safe zones · <span className="font-semibold" style={{ color: "var(--thor-danger)" }}>{hazards.length}</span> hazards
                    </p>
                </div>
            </div>
        </div>
    );
}
