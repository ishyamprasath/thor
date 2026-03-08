import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
    MapPin, Navigation, Shield, Heart, Hotel, Coffee, Sun, Moon, Info, ShieldAlert,
    ExternalLink, X, Users, Star, Phone, Search
} from "lucide-react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from "@react-google-maps/api";
import { useTranslation } from "../../context/TranslationContext";

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

export default function ActiveJourney() {
    const navigate = useNavigate();
    const { translate } = useTranslation();
    const [plan, setPlan] = useState<any>(null);
    const [guides, setGuides] = useState<any[]>([]);
    const [loadingGuides, setLoadingGuides] = useState(true);

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
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("thor_active_plan");
        if (saved) {
            const p = JSON.parse(saved);
            setPlan(p);
            // Fetch local guides specific to this destination
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
                    .catch(err => {
                        console.error("Failed to load guides:", err);
                        setLoadingGuides(false);
                    });
            } else {
                setLoadingGuides(false);
            }
        } else {
            navigate("/dashboard");
        }
    }, [navigate]);

    // Background 30-minute Automated Safety Pulse
    useEffect(() => {
        const PULSE_INTERVAL = 30 * 60 * 1000; // 30 minutes

        const checkPulse = () => {
            const lastStr = localStorage.getItem("thor_last_pulse_check");
            const last = lastStr ? parseInt(lastStr, 10) : 0;
            if (Date.now() - last >= PULSE_INTERVAL) {
                setShowPulse(true);
            }
        };

        checkPulse();

        // Check constantly if 30 minutes have elapsed
        const interval = setInterval(checkPulse, 60000); // loop every 1 min

        return () => clearInterval(interval);
    }, []);

    // Route calculation
    useEffect(() => {
        if (!isLoaded || !plan || !window.google) return;

        try {
            const svc = new window.google.maps.DirectionsService();
            const days = plan.days || [];

            // Collect all meaningful lat/lng nodes
            const waypoints: google.maps.DirectionsWaypoint[] = [];

            // Add hotel as origin if present
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

                // Trim first and last from waypoints array since they are origin/dest
                const midpoints = waypoints.slice(1, -1);

                // Maps API limits to 25 waypoints
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

    const handlePulseConfirm = () => {
        setShowPulse(false);
        const now = Date.now();
        localStorage.setItem("thor_last_pulse_check", now.toString());
        setLastPulse(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    const openInGoogleMaps = () => {
        if (!plan) return;
        // Build universal query
        const query = encodeURIComponent(plan.destination);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    };

    if (!plan) return null;

    return (
        <div className="flex flex-col h-full bg-black relative pb-20">
            {/* Header / Info bar */}
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
            <div className="flex-1 relative bg-zinc-950">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        zoom={12}
                        center={{ lat: 0, lng: 0 }} // Auto-bounds via DirectionsRenderer
                        options={{ styles: darkMapStyle, disableDefaultUI: true, gestureHandling: "greedy" }}
                        onLoad={setMap}
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

            {/* Local Guides Section */}
            <div className="bg-zinc-950 px-4 py-6 border-t border-zinc-900">
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
                                        <h4 className="font-bold text-white text-[15px]">{g.name}</h4>
                                        <span className="flex items-center gap-1 text-xs text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-md">
                                            <Star className="w-3 h-3 fill-yellow-500" /> {g.rating}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mb-2">{g.role}</p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {g.languages?.map((l: string, idx: number) => (
                                            <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">{l}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
                                    <span className="text-[11px] font-semibold text-green-400 max-w-[120px] truncate" title={g.price}>{g.price}</span>
                                    <div className="flex gap-2">
                                        <a href={`https://www.google.com/maps/place/?q=place_id:${g.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                            <MapPin className="w-3.5 h-3.5" /> Map
                                        </a>
                                        {g.website ? (
                                            <a href={g.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5" /> Site
                                            </a>
                                        ) : (
                                            <a href={`https://www.google.com/search?q=${encodeURIComponent(g.name + ' tour guide ' + (plan?.destination || ''))}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                                <Search className="w-3.5 h-3.5" /> Search
                                            </a>
                                        )}
                                        {g.phone && (
                                            <a href={`tel:${g.phone}`} className="flex items-center gap-1.5 text-xs text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
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

            {/* Automated Safety Pulse Modal */}
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
                                <button
                                    onClick={handlePulseConfirm}
                                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
                                >
                                    {translate("I am Safe")}
                                </button>
                                <button
                                    onClick={() => navigate("/emergency")}
                                    className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-xl transition-all"
                                >
                                    {translate("I Need Help (SOS)")}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
