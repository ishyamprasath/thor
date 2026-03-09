import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
    MapPin, Navigation, Shield, Heart, Hotel, Coffee, Sun, Moon, Info, ShieldAlert,
    ExternalLink, X, Users, Star, Phone, Search, ChevronDown, ChevronUp, Route
} from "lucide-react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from "@react-google-maps/api";
import { useTranslation } from "../../context/TranslationContext";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBS: ("places")[] = ["places"];

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#000000" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#111111" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#222222" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111111" }] },
];

interface StopItem {
    type: "hotel" | "breakfast" | "spot" | "lunch" | "dinner";
    label: string;
    day?: number;
    lat?: number;
    lng?: number;
}

function getStopIcon(type: StopItem["type"]) {
    switch (type) {
        case "hotel": return <Hotel className="w-4 h-4 text-blue-400" />;
        case "breakfast": return <Coffee className="w-4 h-4 text-amber-400" />;
        case "lunch": return <Sun className="w-4 h-4 text-orange-400" />;
        case "dinner": return <Moon className="w-4 h-4 text-purple-400" />;
        case "spot": return <MapPin className="w-4 h-4 text-yellow-500" />;
    }
}

function getStopLabel(type: StopItem["type"]) {
    switch (type) {
        case "hotel": return "Stay";
        case "breakfast": return "Breakfast";
        case "lunch": return "Lunch";
        case "dinner": return "Dinner";
        case "spot": return "Spot";
    }
}

function buildGoogleMapsUrl(name: string, lat?: number, lng?: number): string {
    if (lat && lng) {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

export default function ActiveJourney() {
    const navigate = useNavigate();
    const { translate } = useTranslation();
    const { user, token } = useAuth();
    const [plan, setPlan] = useState<any>(null);
    const [guides, setGuides] = useState<any[]>([]);
    const [loadingGuides, setLoadingGuides] = useState(true);
    const [showDirections, setShowDirections] = useState(true);

    // Safety Pulse
    const [showPulse, setShowPulse] = useState(false);
    const [lastPulse, setLastPulse] = useState<string>(() => {
        const lastStr = localStorage.getItem("thor_last_pulse_check");
        if (lastStr) {
            return new Date(parseInt(lastStr, 10)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return "Not yet";
    });

    // Maps
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_KEY,
        libraries: LIBS
    });
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("thor_active_plan");
        if (saved) {
            const p = JSON.parse(saved);
            setPlan(p);
            if (p.destination) {
                fetch(`http://localhost:8000/trip/guides?destination=${encodeURIComponent(p.destination)}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("thor_token")}`
                    }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.guides) setGuides(data.guides);
                        setLoadingGuides(false);
                    })
                    .catch(() => setLoadingGuides(false));
            } else {
                setLoadingGuides(false);
            }
        } else {
            navigate("/dashboard");
        }
    }, [navigate]);

    // Background 30-minute Safety Pulse
    useEffect(() => {
        const PULSE_INTERVAL = 30 * 60 * 1000;
        const checkPulse = () => {
            const lastStr = localStorage.getItem("thor_last_pulse_check");
            const last = lastStr ? parseInt(lastStr, 10) : 0;
            if (Date.now() - last >= PULSE_INTERVAL) setShowPulse(true);
        };
        checkPulse();
        const interval = setInterval(checkPulse, 60000);
        return () => clearInterval(interval);
    }, []);

    // Route calculation
    useEffect(() => {
        if (!isLoaded || !plan || !window.google) return;
        try {
            const svc = new window.google.maps.DirectionsService();
            const days = plan.days || [];
            const waypoints: google.maps.DirectionsWaypoint[] = [];

            let origin: any = null;
            let dest: any = null;

            if (plan.hotel_recommendation?.latitude) {
                origin = { lat: plan.hotel_recommendation.latitude, lng: plan.hotel_recommendation.longitude };
            }

            days.forEach((day: any) => {
                if (day.breakfast?.lat) waypoints.push({ location: { lat: day.breakfast.lat, lng: day.breakfast.lng }, stopover: true });
                day.route_spots?.forEach((s: any) => {
                    if (s.lat) waypoints.push({ location: { lat: s.lat, lng: s.lng }, stopover: true });
                });
                if (day.lunch?.lat) waypoints.push({ location: { lat: day.lunch.lat, lng: day.lunch.lng }, stopover: true });
                if (day.dinner?.lat) waypoints.push({ location: { lat: day.dinner.lat, lng: day.dinner.lng }, stopover: true });
            });

            if (waypoints.length > 0) {
                if (!origin) origin = waypoints[0].location;
                dest = waypoints[waypoints.length - 1].location;
                const midpoints = waypoints.slice(1, -1);
                svc.route({
                    origin,
                    destination: dest,
                    waypoints: midpoints.slice(0, 20),
                    travelMode: google.maps.TravelMode.DRIVING
                }, (result, status) => {
                    if (status === "OK" && result) setDirections(result);
                });
            }
        } catch (e) { console.error("Directions Error", e); }
    }, [isLoaded, plan]);

    // Build ordered stop list from plan
    const buildOrderedStops = useCallback((): StopItem[] => {
        if (!plan) return [];
        const stops: StopItem[] = [];

        if (plan.hotel_recommendation) {
            stops.push({
                type: "hotel",
                label: plan.hotel_recommendation.name,
                lat: plan.hotel_recommendation.latitude,
                lng: plan.hotel_recommendation.longitude,
            });
        }

        (plan.days || []).forEach((day: any) => {
            if (day.breakfast?.name) {
                stops.push({ type: "breakfast", label: day.breakfast.name, day: day.day, lat: day.breakfast.lat, lng: day.breakfast.lng });
            }
            (day.route_spots || []).forEach((s: any) => {
                stops.push({ type: "spot", label: s.name, day: day.day, lat: s.lat, lng: s.lng });
            });
            if (day.lunch?.name) {
                stops.push({ type: "lunch", label: day.lunch.name, day: day.day, lat: day.lunch.lat, lng: day.lunch.lng });
            }
            if (day.dinner?.name) {
                stops.push({ type: "dinner", label: day.dinner.name, day: day.day, lat: day.dinner.lat, lng: day.dinner.lng });
            }
        });

        return stops;
    }, [plan]);

    const orderedStops = buildOrderedStops();

    const handlePulseConfirm = () => {
        setShowPulse(false);
        const now = Date.now();
        localStorage.setItem("thor_last_pulse_check", now.toString());
        setLastPulse(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    // ── NOT SAFE: Auto-trigger SOS + send SMS to every emergency contact ──
    const handleNotSafe = async () => {
        setShowPulse(false);

        // 1. Get GPS
        let lat = 0, lng = 0;
        try {
            const pos = await new Promise<GeolocationPosition>((res, rej) =>
                navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
        } catch { /* GPS unavailable – use 0,0 as fallback */ }

        // 2. Trigger SOS on backend (this records it in DB + marks SMS sent)
        try {
            await fetch(`${API_URL}/sos/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ latitude: lat, longitude: lng, message: "Safety Pulse: NOT SAFE" }),
            });
        } catch { /* network failure — still proceed with local alert */ }

        // 3. Send SMS to all emergency contacts
        //    window.open("sms:+NUMBER?body=MESSAGE") triggers the native SMS app
        const emergencyContacts: any[] = user?.emergency_contacts || [];
        const mapUrl = lat ? `https://maps.google.com/?q=${lat},${lng}` : "Location unavailable";
        const smsBody = encodeURIComponent(
            `🚨 EMERGENCY ALERT from THOR Safety App 🚨\n` +
            `${user?.name || "Your contact"} responded NOT SAFE in the 30-minute safety check.\n` +
            `Last known location: ${mapUrl}\n` +
            `Please contact them immediately or call 112.`
        );

        // Open SMS for each contact one by one
        emergencyContacts.forEach((contact: any, idx: number) => {
            const phone = (contact.phone || "").replace(/\s/g, "");
            if (phone) {
                setTimeout(() => {
                    window.open(`sms:${phone}?body=${smsBody}`, "_blank");
                }, idx * 600); // stagger each SMS open by 600ms
            }
        });

        // If no emergency contacts, at least open the SOS page
        if (emergencyContacts.length === 0) {
            window.open(`sms:112?body=${smsBody}`, "_blank");
        }

        // 4. Navigate to emergency page so user can see SOS is active
        setTimeout(() => navigate("/emergency"), 800);
    };


    const openInGoogleMaps = () => {
        if (!plan) return;
        const query = encodeURIComponent(plan.destination);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    };

    if (!plan) return null;

    return (
        <div className="flex flex-col h-full bg-black relative pb-20">

            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 p-4 shrink-0 flex items-center justify-between shadow-2xl z-10 relative">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">{plan.destination}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-sm uppercase tracking-wider border border-green-500/20">
                            {translate("Active Journey")}
                        </span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                            <Heart className="w-3 h-3" /> {translate("Pulse:")} {lastPulse}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => navigate("/emergency")} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20">
                        <ShieldAlert className="w-5 h-5" />
                    </button>
                    <button onClick={() => navigate("/concierge")} className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20 hover:bg-purple-500/20">
                        <Info className="w-5 h-5" />
                    </button>
                    <button onClick={openInGoogleMaps} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 hover:bg-blue-500/20">
                        <ExternalLink className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Map Area */}
            <div className="h-56 relative bg-zinc-950 shrink-0">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        zoom={12}
                        center={{ lat: plan.hotel_recommendation?.latitude || 12.9716, lng: plan.hotel_recommendation?.longitude || 77.5946 }}
                        options={{ styles: darkMapStyle, disableDefaultUI: true, gestureHandling: "greedy" }}
                    >
                        {directions && <DirectionsRenderer directions={directions} options={{
                            polylineOptions: { strokeColor: "#eab308", strokeWeight: 5, strokeOpacity: 0.8 },
                            suppressMarkers: false
                        }} />}
                    </GoogleMap>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
                        <p className="mt-4 text-xs font-bold text-yellow-500 uppercase tracking-widest animate-pulse">{translate("Initializing Comms")}</p>
                    </div>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">

                {/* ── Ordered Directions Panel ── */}
                <div className="border-b border-zinc-900">
                    <button
                        onClick={() => setShowDirections(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-4 bg-zinc-950 hover:bg-zinc-900 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Route className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-white text-sm">{translate("Your Route")} ({orderedStops.length} {translate("stops")})</span>
                        </div>
                        {showDirections ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </button>

                    <AnimatePresence>
                        {showDirections && orderedStops.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 space-y-2 bg-zinc-950">
                                    {orderedStops.map((stop, idx) => (
                                        <div key={idx} className="flex items-stretch gap-3">
                                            {/* Timeline line */}
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${stop.type === "hotel"
                                                    ? "bg-blue-500/10 border-blue-500/30"
                                                    : stop.type === "spot"
                                                        ? "bg-yellow-500/10 border-yellow-500/30"
                                                        : "bg-zinc-800 border-zinc-700"
                                                    }`}>
                                                    {getStopIcon(stop.type)}
                                                </div>
                                                {idx < orderedStops.length - 1 && (
                                                    <div className="w-px flex-1 bg-zinc-800 my-1 min-h-[12px]" />
                                                )}
                                            </div>

                                            {/* Stop info */}
                                            <div className="flex-1 flex items-center justify-between gap-2 pb-2">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                                                        {stop.day ? `Day ${stop.day} · ` : ""}{getStopLabel(stop.type)}
                                                    </p>
                                                    <p className="text-white text-sm font-semibold truncate">{stop.label}</p>
                                                </div>
                                                <a
                                                    href={buildGoogleMapsUrl(stop.label, stop.lat, stop.lng)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-yellow-500 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors"
                                                >
                                                    <Navigation className="w-3.5 h-3.5" /> {translate("Maps")}
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {showDirections && orderedStops.length === 0 && (
                            <div className="px-4 pb-4 bg-zinc-950">
                                <p className="text-sm text-zinc-500 italic">{translate("No stops selected in your plan.")}</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Local Guides Section ── */}
                <div className="px-4 py-6 border-b border-zinc-900">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-bold text-white">{translate("Local Guides")}</h3>
                    </div>

                    {loadingGuides ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 noscrollbar">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="min-w-[280px] h-32 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : guides.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 noscrollbar">
                            {guides.map((g, i) => (
                                <div key={i} className="min-w-[280px] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-white text-[15px] truncate max-w-[170px]">{g.name}</h4>
                                            <span className="flex items-center gap-1 text-xs text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-md shrink-0">
                                                <Star className="w-3 h-3 fill-yellow-500" /> {g.rating}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{g.role}</p>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {g.languages?.map((l: string, idx: number) => (
                                                <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
                                        <span className="text-[11px] font-semibold text-green-400 max-w-[100px] truncate">{g.price}</span>
                                        <div className="flex gap-2">
                                            <a href={`https://www.google.com/maps/place/?q=place_id:${g.id}`} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                                <MapPin className="w-3.5 h-3.5" /> Map
                                            </a>
                                            {g.website ? (
                                                <a href={g.website} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                                    <ExternalLink className="w-3.5 h-3.5" /> Site
                                                </a>
                                            ) : (
                                                <a href={`https://www.google.com/search?q=${encodeURIComponent(g.name + ' tour guide ' + (plan?.destination || ''))}`} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                                    <Search className="w-3.5 h-3.5" /> Search
                                                </a>
                                            )}
                                            {g.phone && (
                                                <a href={`tel:${g.phone}`}
                                                    className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                                    <Phone className="w-3.5 h-3.5" /> Call
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm italic">{translate("No guides currently available in this region.")}</p>
                    )}
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="shrink-0 bg-zinc-900 border-t border-zinc-800 p-4 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] relative z-10">
                <div className="flex gap-3 overflow-x-auto pb-2 noscrollbar">
                    <button onClick={() => navigate("/map")} className="flex items-center gap-2 shrink-0 bg-black border border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:border-yellow-500 transition-colors">
                        <Shield className="w-4 h-4 text-blue-500" /> {translate("Safety Map")}
                    </button>
                    <button onClick={openInGoogleMaps} className="flex items-center gap-2 shrink-0 bg-black border border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:border-yellow-500 transition-colors">
                        <Navigation className="w-4 h-4 text-green-500" /> {translate("Start Navigation")}
                    </button>
                </div>
            </div>

            {/* Safety Pulse Modal */}
            <AnimatePresence>
                {showPulse && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                            <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                                    <Heart className="w-12 h-12 text-red-500" fill="currentColor" />
                                </motion.div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{translate("Safety Pulse Check")}</h2>
                            <p className="text-zinc-400 mb-8">{translate("It has been 30 minutes since your last check-in. Please confirm you are safe.")}</p>
                            <div className="space-y-3">
                                <button onClick={handlePulseConfirm} className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all">
                                    ✅ {translate("I am Safe")}
                                </button>
                                <button
                                    onClick={handleNotSafe}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 animate-pulse"
                                >
                                    🚨 {translate("NOT SAFE — Send Emergency Alert")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
