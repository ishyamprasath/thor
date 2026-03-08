import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
    Users, Wifi, WifiOff, Shield, ShieldAlert, AlertTriangle,
    Battery, BatteryWarning, Siren, Search, Eye, RefreshCw, Activity, UserPlus, Send, X
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api";

import { API_URL } from "../../config/api";
const MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBS: ("places")[] = ["places"];
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0a0e1a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#060a14" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

const STATUS_COLORS: Record<string, string> = {
    safe: "var(--thor-safe)", warning: "var(--thor-warn)", danger: "var(--thor-danger)",
};

export default function CommandCenter() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [tourists, setTourists] = useState<any[]>([]);
    const [feed, setFeed] = useState<any[]>([]);
    const [hazards, setHazards] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "success">("idle");

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: MAPS_KEY,
        libraries: LIBS
    });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [s, t, f, h] = await Promise.all([
                fetch(`${API_URL}/enterprise/stats`).then(r => r.json()),
                fetch(`${API_URL}/enterprise/tourists`).then(r => r.json()),
                fetch(`${API_URL}/enterprise/feed`).then(r => r.json()),
                fetch(`${API_URL}/safety/hazards?status=active`).then(r => r.json()),
            ]);
            setStats(s); setTourists(t.tourists || []); setFeed(f.events || []); setHazards(h.hazards || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); const iv = setInterval(fetchAll, 30000); return () => clearInterval(iv); }, []);

    const filteredTourists = tourists.filter(t => {
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter && t.safety_status !== filter) return false;
        return true;
    });

    const statCards = stats ? [
        { label: "TOTAL", value: stats.total_tourists, color: "var(--thor-info)" },
        { label: "ONLINE", value: stats.online, color: "var(--thor-safe)" },
        { label: "OFFLINE", value: stats.offline, color: "var(--thor-warn)" },
        { label: "SOS", value: stats.sos_active, color: "var(--thor-danger)" },
        { label: "DANGER", value: stats.danger, color: "var(--thor-danger)" },
        { label: "SAFE", value: stats.safe, color: "var(--thor-safe)" },
    ] : [];

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        setInviteStatus("loading");
        try {
            await fetch(`${API_URL}/enterprise/invite`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail })
            });
            setInviteStatus("success");
            setTimeout(() => {
                setShowInvite(false);
                setInviteEmail("");
                setInviteStatus("idle");
            }, 1500);
        } catch (error) {
            console.error(error);
            setInviteStatus("idle");
        }
    };

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Command Center</h1>
                    <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>Live tourist monitoring & safety operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowInvite(true)} className="btn btn-brand">
                        <UserPlus className="w-4 h-4" /> Add Tourist Tracker
                    </button>
                    <button onClick={fetchAll} className="btn btn-ghost">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* Inline Invite Modal */}
            {showInvite && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card p-5 border" style={{ borderColor: "var(--thor-brand)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" style={{ color: "var(--thor-brand)" }} />
                            <h3 className="font-bold">Dispatch Tracking Request</h3>
                        </div>
                        <button onClick={() => { setShowInvite(false); setInviteStatus("idle"); setInviteEmail(""); }} className="btn btn-ghost btn-sm p-1 rounded"><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={handleInvite} className="flex gap-3">
                        <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="tourist@email.com" required disabled={inviteStatus !== "idle"}
                            className="input flex-1" autoFocus />
                        <button type="submit" disabled={inviteStatus !== "idle"} className="btn btn-brand whitespace-nowrap">
                            {inviteStatus === "loading" ? "Sending..." : inviteStatus === "success" ? "Sent ✓" : <><Send className="w-4 h-4" /> Send Request</>}
                        </button>
                    </form>
                    <p className="text-micro mt-2" style={{ color: "var(--thor-text-muted)" }}>The traveler will receive an authorization request on their Thor Mobile Dashboard.</p>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {statCards.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="card p-4 text-center">
                        <p className="text-display" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-micro mt-1" style={{ color: "var(--thor-text-muted)" }}>{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Map + Feed */}
            <div className="grid lg:grid-cols-3 gap-5">
                {/* Map */}
                <div className="lg:col-span-2 card overflow-hidden" style={{ height: 420 }}>
                    {isLoaded ? (
                        <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }}
                            center={{ lat: 11.0168, lng: 76.9558 }} zoom={12}
                            options={{ styles: darkMapStyle, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}>
                            {filteredTourists.map((t, i) => (
                                <Marker key={i} position={{ lat: t.current_lat, lng: t.current_long }}
                                    onClick={() => navigate(`/enterprise/tourist/${t.user_id}`)}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE, scale: t.sos_active ? 12 : 7,
                                        fillColor: t.safety_status === "safe" ? "#22c55e" : t.safety_status === "warning" ? "#eab308" : "#ef4444",
                                        fillOpacity: 1, strokeColor: t.sos_active ? "#ef4444" : "#fff", strokeWeight: t.sos_active ? 3 : 1.5,
                                    }} />
                            ))}
                            {hazards.map((h, i) => (
                                <Circle key={`h-${i}`} center={{ lat: h.latitude, lng: h.longitude }} radius={h.danger_radius_meters}
                                    options={{ fillColor: "#ef4444", fillOpacity: 0.06, strokeColor: "#ef4444", strokeWeight: 1, strokeOpacity: 0.3 }} />
                            ))}
                        </GoogleMap>
                    ) : <div className="w-full h-full flex items-center justify-center"><div className="skeleton w-12 h-12 rounded-full" /></div>}
                </div>

                {/* Feed */}
                <div className="card p-4 flex flex-col" style={{ height: 420 }}>
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                        <Activity className="w-4 h-4" style={{ color: "var(--thor-brand)" }} />
                        <span className="text-subheading" style={{ color: "var(--thor-text)" }}>Activity Feed</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {feed.map((ev, i) => (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                className="p-3 rounded-lg cursor-pointer transition-all"
                                style={{ background: ev.severity === "critical" ? "var(--thor-danger-muted)" : "var(--thor-surface-2)" }}
                                onClick={() => ev.user_id && navigate(`/enterprise/tourist/${ev.user_id}`)}>
                                <p className="text-caption font-semibold" style={{ color: ev.severity === "critical" ? "var(--thor-danger)" : "var(--thor-text-secondary)" }}>{ev.message}</p>
                                {ev.timestamp && <p className="text-micro mt-1" style={{ color: "var(--thor-text-disabled)", textTransform: "none" }}>{new Date(ev.timestamp).toLocaleTimeString()}</p>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tourist Table */}
            <div className="card p-5">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <Users className="w-4 h-4" style={{ color: "var(--thor-brand)" }} />
                    <span className="text-subheading" style={{ color: "var(--thor-text)" }}>All Tourists</span>
                    <div className="flex-1" />
                    <div className="relative w-52">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input" style={{ paddingLeft: "2.5rem" }} />
                    </div>
                    <div className="flex gap-1">
                        {[null, "safe", "warning", "danger"].map(f => (
                            <button key={f || "all"} onClick={() => setFilter(f)}
                                className={`badge ${filter === f ? "badge-brand" : ""}`}
                                style={filter === f ? {} : { background: "var(--thor-surface-3)", color: "var(--thor-text-muted)" }}>
                                {f ? f.charAt(0).toUpperCase() + f.slice(1) : "All"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--thor-border)" }}>
                                {["Name", "Country", "Destination", "Status", "Battery", "Network", ""].map(h => (
                                    <th key={h} className="text-left text-micro py-3 px-3" style={{ color: "var(--thor-text-muted)" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTourists.map((t, i) => (
                                <tr key={i} className="cursor-pointer transition-all"
                                    style={{ borderBottom: "1px solid var(--thor-border)" }}
                                    onClick={() => navigate(`/enterprise/tourist/${t.user_id}`)}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--thor-surface)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            {t.sos_active && <Siren className="w-4 h-4 animate-thor-pulse" style={{ color: "var(--thor-danger)" }} />}
                                            <span className="text-body font-medium" style={{ color: "var(--thor-text)" }}>{t.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-caption" style={{ color: "var(--thor-text-muted)" }}>{t.country}</td>
                                    <td className="py-3 px-3 text-caption" style={{ color: "var(--thor-text-muted)" }}>{t.trip_destination}</td>
                                    <td className="py-3 px-3">
                                        <span className={`badge badge-${t.safety_status === "safe" ? "safe" : t.safety_status === "warning" ? "warn" : "danger"}`}>
                                            {t.safety_status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="text-caption flex items-center gap-1" style={{ color: t.battery_percentage < 15 ? "var(--thor-danger)" : "var(--thor-text-muted)" }}>
                                            {t.battery_percentage < 15 ? <BatteryWarning className="w-3.5 h-3.5" /> : <Battery className="w-3.5 h-3.5" />}
                                            {t.battery_percentage}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="text-caption flex items-center gap-1" style={{ color: t.network_status === "online" ? "var(--thor-safe)" : "var(--thor-danger)" }}>
                                            {t.network_status === "online" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <button className="btn btn-ghost btn-sm"><Eye className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
