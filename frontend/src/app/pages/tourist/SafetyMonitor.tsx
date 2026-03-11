import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Zap, Shield, ShieldAlert, ShieldCheck, Phone, MapPin, Navigation,
    Wifi, WifiOff, Battery, BatteryWarning, AlertTriangle, Heart,
    X, ChevronUp, Radio, Siren, Send, Hospital, Building2, Landmark
} from "lucide-react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Circle } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
import { API_URL } from "../../config/api";
const LIBS: ("places")[] = ["places"];

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#1a2035" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a2035" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1726" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c3e6b" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a2542" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
];

const lightMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#e0f2fe" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#e2e8f0" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#cbd5e1" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#e2e8f0" }] },
];

const SAFE_ZONE_ICONS: Record<string, { icon: any; color: string }> = {
    police_station: { icon: Building2, color: "#3b82f6" },
    hospital: { icon: Hospital, color: "#ef4444" },
    embassy: { icon: Landmark, color: "#8b5cf6" },
    verified_shelter: { icon: Shield, color: "#22c55e" },
    fire_station: { icon: Siren, color: "#f97316" },
};

export default function SafetyMonitor() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { token } = useAuth();
    const destination = (state as any)?.destination || "Coimbatore";
    const selectedSpots = (state as any)?.selectedSpots || [];
    
    const mapStyle = theme === "dark" ? darkMapStyle : lightMapStyle;

    // Position
    const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    // Safety data
    const [safetyScore, setSafetyScore] = useState<any>(null);
    const [hazards, setHazards] = useState<any[]>([]);
    const [safeZones, setSafeZones] = useState<any[]>([]);
    const [geofenceAlerts, setGeofenceAlerts] = useState<any[]>([]);

    // SOS
    const [sosActive, setSosActive] = useState(false);
    const [sosHolding, setSosHolding] = useState(false);
    const [sosCountdown, setSosCountdown] = useState(3);
    const [sosData, setSosData] = useState<any>(null);
    const holdTimerRef = useRef<any>(null);

    // Pulse
    const [lastPulse, setLastPulse] = useState<string | null>(null);
    const [pulseFlash, setPulseFlash] = useState(false);

    // Battery simulation
    const [battery, setBattery] = useState(78);
    const [isOnline, setIsOnline] = useState(true);

    // UI
    const [showPanel, setShowPanel] = useState(true);
    const [showSafeZones, setShowSafeZones] = useState(true);
    const [alertBanner, setAlertBanner] = useState<any>(null);

    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY, libraries: LIBS });

    // --- Watch user position ---
    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setUserPos({ lat: 11.0168, lng: 76.9558 }), // Fallback: Coimbatore
            { enableHighAccuracy: true, maximumAge: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // --- Fetch safety data ---
    const fetchSafety = useCallback(async () => {
        if (!userPos) return;
        try {
            const [scoreRes, hazardRes, zonesRes, geoRes] = await Promise.all([
                fetch(`${API_URL}/safety/score?lat=${userPos.lat}&lng=${userPos.lng}`),
                fetch(`${API_URL}/safety/hazards?status=active`),
                fetch(`${API_URL}/safety/nearest?lat=${userPos.lat}&lng=${userPos.lng}&limit=10`),
                fetch(`${API_URL}/safety/geofence-check`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ lat: userPos.lat, lng: userPos.lng }),
                }),
            ]);
            const [scoreData, hazardData, zonesData, geoData] = await Promise.all([
                scoreRes.json(), hazardRes.json(), zonesRes.json(), geoRes.json(),
            ]);
            setSafetyScore(scoreData);
            setHazards(hazardData.hazards || []);
            setSafeZones(zonesData.nearest || []);
            setGeofenceAlerts(geoData.alerts || []);
            if (geoData.in_danger && geoData.alerts?.length > 0) {
                setAlertBanner(geoData.alerts[0]);
            } else {
                setAlertBanner(null);
            }
        } catch (e) { console.error("Safety fetch error:", e); }
    }, [userPos]);

    useEffect(() => { fetchSafety(); const iv = setInterval(fetchSafety, 15000); return () => clearInterval(iv); }, [fetchSafety]);

    // --- Directions ---
    useEffect(() => {
        if (!isLoaded || !userPos || !window.google) return;
        new google.maps.DirectionsService().route(
            { origin: userPos, destination, travelMode: google.maps.TravelMode.DRIVING },
            (result, status) => { if (status === "OK" && result) setDirections(result); }
        );
    }, [isLoaded, userPos, destination]);

    // --- Battery simulation ---
    useEffect(() => {
        const iv = setInterval(() => {
            setBattery((b) => {
                const next = Math.max(0, b - 1);
                if (next <= 5 && next > 0 && userPos && token) {
                    fetch(`${API_URL}/sos/battery-distress`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ battery: next, lat: userPos.lat, lng: userPos.lng }),
                    });
                }
                return next;
            });
        }, 60000);
        return () => clearInterval(iv);
    }, [userPos, token]);

    // --- Network simulation ---
    useEffect(() => {
        setIsOnline(navigator.onLine);
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);
        return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    }, []);

    // --- SOS hold-to-activate ---
    const startSosHold = () => {
        setSosHolding(true);
        setSosCountdown(3);
        let c = 3;
        holdTimerRef.current = setInterval(() => {
            c--;
            setSosCountdown(c);
            if (c <= 0) {
                clearInterval(holdTimerRef.current);
                activateSos();
            }
        }, 1000);
    };

    const cancelSosHold = () => {
        setSosHolding(false);
        setSosCountdown(3);
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };

    const activateSos = async () => {
        setSosHolding(false);
        setSosActive(true);
        if (!userPos || !token) return;
        try {
            const res = await fetch(`${API_URL}/sos/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ latitude: userPos.lat, longitude: userPos.lng, message: "Emergency SOS activated" }),
            });
            const data = await res.json();
            if (data.success) setSosData(data.sos);
        } catch (e) { console.error("SOS error:", e); }
    };

    const cancelSos = async () => {
        setSosActive(false);
        setSosData(null);
        if (token) {
            fetch(`${API_URL}/sos/cancel`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        }
    };

    // --- Pulse check-in ---
    const doPulse = async () => {
        if (!userPos || !token) return;
        setPulseFlash(true);
        setTimeout(() => setPulseFlash(false), 1500);
        try {
            await fetch(`${API_URL}/sos/pulse`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ latitude: userPos.lat, longitude: userPos.lng }),
            });
            setLastPulse(new Date().toLocaleTimeString());
        } catch (e) { console.error("Pulse error:", e); }
    };

    const scoreColor = safetyScore?.level === "safe" ? "#22c55e" : safetyScore?.level === "caution" ? "#eab308" : "#ef4444";

    return (
        <div className={`h-screen flex flex-col overflow-hidden relative ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
            {/* GEOFENCE ALERT BANNER */}
            <AnimatePresence>
                {alertBanner && (
                    <motion.div initial={{ y: -80 }} animate={{ y: 0 }} exit={{ y: -80 }}
                        className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
                        <div className="flex-1">
                            <p className="font-bold text-sm">⚠️ DANGER ZONE ALERT</p>
                            <p className="text-xs opacity-90">{alertBanner.description} — {alertBanner.distance_m}m away</p>
                        </div>
                        <button onClick={() => setAlertBanner(null)} className="p-1"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SOS ACTIVE OVERLAY */}
            <AnimatePresence>
                {sosActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-red-950/95 flex flex-col items-center justify-center text-center p-6">
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-32 h-32 rounded-full bg-red-600 flex items-center justify-center mb-8 shadow-2xl shadow-red-600/50">
                            <Siren className="w-16 h-16 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-white mb-2">SOS ACTIVE</h2>
                        <p className="text-red-200 text-sm mb-6">Emergency signal transmitted</p>

                        {sosData && (
                            <div className="w-full max-w-sm space-y-3 mb-8">
                                {sosData.escalation_details?.map((e: any, i: number) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.3 }}
                                        className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3 text-left">
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
                                        <div>
                                            <p className="text-white text-sm font-semibold">Stage {e.stage}</p>
                                            <p className="text-red-200 text-xs">{e.action}</p>
                                        </div>
                                    </motion.div>
                                ))}
                                <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <Send className="w-5 h-5 text-green-400" />
                                    <div>
                                        <p className="text-white text-sm font-semibold">SMS Fallback</p>
                                        <p className="text-green-400 text-xs">GPS coordinates sent via encrypted SMS ✓</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button onClick={cancelSos}
                            className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-all text-sm">
                            Cancel SOS — I'm Safe
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOP BAR */}
            <div className="bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 z-30">
                <button onClick={() => navigate("/tourist/trip-planner")}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
                    <X className="w-5 h-5" />
                </button>
                <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
                <span className="font-black tracking-widest text-sm bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">NAVIGATION</span>

                <div className="flex-1" />

                {/* Status indicators */}
                <div className="flex items-center gap-2">
                    {isOnline ? (
                        <div className="flex items-center gap-1 text-green-400 text-xs"><Wifi className="w-3.5 h-3.5" />Online</div>
                    ) : (
                        <div className="flex items-center gap-1 text-red-400 text-xs animate-pulse"><WifiOff className="w-3.5 h-3.5" />Offline</div>
                    )}
                    <div className={`flex items-center gap-1 text-xs ${battery < 15 ? "text-red-400 animate-pulse" : battery < 30 ? "text-yellow-400" : "text-green-400"}`}>
                        {battery < 15 ? <BatteryWarning className="w-3.5 h-3.5" /> : <Battery className="w-3.5 h-3.5" />}
                        {battery}%
                    </div>
                </div>
            </div>

            {/* MAIN MAP */}
            <div className="flex-1 relative">
                {isLoaded && userPos ? (
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={userPos} zoom={14}
                        onLoad={(map) => { mapRef.current = map; }}
                        options={{ styles: mapStyle, zoomControl: false, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, gestureHandling: "greedy" }}>

                        {directions && <DirectionsRenderer directions={directions}
                            options={{ polylineOptions: { strokeColor: "#f59e0b", strokeWeight: 5 } }} />}

                        {/* User marker */}
                        <Marker position={userPos}
                            icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#3b82f6", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 }} />

                        {/* Hazard zones */}
                        {hazards.filter(h => h.status === "active").map((h, i) => (
                            <Circle key={`hz-${i}`} center={{ lat: h.latitude, lng: h.longitude }}
                                radius={h.danger_radius_meters}
                                options={{
                                    fillColor: h.severity_score >= 70 ? "#ef4444" : "#eab308",
                                    fillOpacity: 0.15, strokeColor: h.severity_score >= 70 ? "#ef4444" : "#eab308",
                                    strokeWeight: 2, strokeOpacity: 0.6,
                                }} />
                        ))}

                        {/* Safe zone markers */}
                        {showSafeZones && safeZones.map((z, i) => (
                            <Marker key={`sz-${i}`} position={{ lat: z.latitude, lng: z.longitude }}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE, scale: 8,
                                    fillColor: SAFE_ZONE_ICONS[z.category]?.color || "#22c55e",
                                    fillOpacity: 0.9, strokeColor: "#fff", strokeWeight: 2,
                                }}
                                title={`${z.name} (${z.category})`} />
                        ))}
                    </GoogleMap>
                ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                            <Zap className="w-12 h-12 text-yellow-400" fill="currentColor" />
                        </motion.div>
                    </div>
                )}

                {/* Safety Score Badge */}
                {safetyScore && (
                    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <svg viewBox="0 0 36 36" className="w-12 h-12">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="#1e293b" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke={scoreColor} strokeWidth="3"
                                        strokeDasharray={`${safetyScore.score}, 100`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-white font-black text-xs">{safetyScore.score}</span>
                            </div>
                            <div>
                                <p className="text-white text-xs font-bold">Safety Score</p>
                                <p className="text-xs font-semibold" style={{ color: scoreColor }}>
                                    {safetyScore.level === "safe" ? "✅ Safe" : safetyScore.level === "caution" ? "⚠️ Caution" : "🚨 Danger"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Route info */}
                {directions && (
                    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-yellow-400" />
                            <div>
                                <p className="text-white text-xs font-bold">{destination}</p>
                                <p className="text-slate-400 text-xs">{directions.routes[0]?.legs[0]?.distance?.text} · {directions.routes[0]?.legs[0]?.duration?.text}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOTTOM CONTROLS */}
                <div className="absolute bottom-0 left-0 right-0 z-30">
                    <AnimatePresence>
                        {showPanel && (
                            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
                                className="bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-4 pb-6">

                                {/* Handle */}
                                <div className="flex justify-center mb-4">
                                    <button onClick={() => setShowPanel(false)} className="w-10 h-1 bg-white/20 rounded-full" />
                                </div>

                                {/* Quick actions row */}
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    {/* I'm Safe Pulse */}
                                    <motion.button onClick={doPulse} whileTap={{ scale: 0.9 }}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${pulseFlash ? "bg-green-500/30 border-green-400/50" : "bg-white/5 border-white/10"
                                            } border`}>
                                        <motion.div animate={pulseFlash ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5 }}>
                                            <Heart className={`w-6 h-6 ${pulseFlash ? "text-green-400" : "text-green-500"}`} fill={pulseFlash ? "currentColor" : "none"} />
                                        </motion.div>
                                        <span className="text-white text-[10px] font-semibold">I'm Safe</span>
                                    </motion.button>

                                    {/* Police */}
                                    <a href="tel:100" className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                                        <Building2 className="w-6 h-6 text-blue-400" />
                                        <span className="text-white text-[10px] font-semibold">Police</span>
                                    </a>

                                    {/* Hospital */}
                                    <a href="tel:108" className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                                        <Hospital className="w-6 h-6 text-red-400" />
                                        <span className="text-white text-[10px] font-semibold">Hospital</span>
                                    </a>

                                    {/* Safe Zones Toggle */}
                                    <button onClick={() => setShowSafeZones(!showSafeZones)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${showSafeZones ? "bg-green-500/20 border-green-400/30" : "bg-white/5 border-white/10"
                                            }`}>
                                        <Shield className={`w-6 h-6 ${showSafeZones ? "text-green-400" : "text-slate-400"}`} />
                                        <span className="text-white text-[10px] font-semibold">Zones</span>
                                    </button>
                                </div>

                                {/* Pulse status */}
                                {lastPulse && (
                                    <div className="bg-green-500/10 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-400" />
                                        <span className="text-green-300 text-xs">Last check-in: {lastPulse}</span>
                                    </div>
                                )}

                                {/* Nearby hazards */}
                                {safetyScore?.nearby_hazards?.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-slate-400 text-xs font-bold mb-2">⚠️ Nearby Hazards</p>
                                        <div className="space-y-1.5">
                                            {safetyScore.nearby_hazards.slice(0, 3).map((h: any, i: number) => (
                                                <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-xs font-semibold truncate">{h.type.replace(/_/g, " ")}</p>
                                                        <p className="text-red-300 text-[10px]">{h.distance_m}m away · Severity: {h.severity_score}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SOS BUTTON */}
                                <motion.button
                                    onMouseDown={startSosHold} onMouseUp={cancelSosHold} onMouseLeave={cancelSosHold}
                                    onTouchStart={startSosHold} onTouchEnd={cancelSosHold}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${sosHolding
                                            ? "bg-red-600 text-white animate-pulse"
                                            : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-2xl shadow-red-600/30"
                                        }`}>
                                    <Siren className="w-7 h-7" />
                                    {sosHolding ? `ACTIVATING SOS... ${sosCountdown}` : "HOLD FOR SOS"}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Collapsed mini bar */}
                    {!showPanel && (
                        <motion.div initial={{ y: 50 }} animate={{ y: 0 }}
                            className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center gap-3">
                            <button onClick={() => setShowPanel(true)} className="p-2 rounded-xl bg-white/10">
                                <ChevronUp className="w-5 h-5 text-white" />
                            </button>
                            <motion.button onClick={doPulse} whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-xl bg-green-500/20 border border-green-400/30">
                                <Heart className="w-5 h-5 text-green-400" fill={pulseFlash ? "currentColor" : "none"} />
                            </motion.button>
                            <div className="flex-1" />
                            <motion.button onMouseDown={startSosHold} onMouseUp={cancelSosHold} onMouseLeave={cancelSosHold}
                                onTouchStart={startSosHold} onTouchEnd={cancelSosHold}
                                className="bg-red-600 text-white font-black px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                                <Siren className="w-5 h-5" />{sosHolding ? sosCountdown : "SOS"}
                            </motion.button>
                        </motion.div>
                    )}
                </div>

                {/* Offline sentinel mode banner */}
                {!isOnline && (
                    <div className="absolute top-20 left-4 right-4 bg-yellow-600/90 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-3 z-30">
                        <Radio className="w-5 h-5 text-white animate-pulse" />
                        <div>
                            <p className="text-white text-sm font-bold">Offline Sentinel Mode</p>
                            <p className="text-yellow-100 text-xs">GPS tracking active · SMS fallback ready</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
