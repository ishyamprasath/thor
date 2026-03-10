import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import {
    Users, Wifi, WifiOff, Shield, ShieldAlert, AlertTriangle,
    Battery, BatteryWarning, Siren, Search, Eye, RefreshCw,
    Activity, UserPlus, Send, X, Loader2, MapPin as MapPinIcon
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

const MAPS_KEY = (import.meta as any).env?.VITE_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const LIBS: ("places")[] = ["places"];
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0a0e1a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#060a14" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

export default function CommandCenter() {
    const navigate = useNavigate();
    const { tripId } = useParams();
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [tourists, setTourists] = useState<any[]>([]);
    const [feed, setFeed] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [inviteError, setInviteError] = useState("");

    const [simulationToast, setSimulationToast] = useState<{ show: boolean, name: string }>({ show: false, name: "" });

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: MAPS_KEY,
        libraries: LIBS
    });

    const authHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const tripQ = tripId ? `?trip_id=${tripId}` : "";
            const [statsRes, touristsRes, feedRes] = await Promise.all([
                fetch(`${API_URL}/enterprise/stats${tripQ}`, { headers: authHeaders }),
                fetch(`${API_URL}/enterprise/tourists${tripQ}`, { headers: authHeaders }),
                fetch(`${API_URL}/enterprise/feed${tripQ}`, { headers: authHeaders }),
            ]);
            const [s, t, f] = await Promise.all([
                statsRes.json(), touristsRes.json(), feedRes.json(),
            ]);
            setStats(s);
            setTourists(t.tourists || []);
            setFeed(f.events || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadData(); const iv = setInterval(loadData, 30000); return () => clearInterval(iv); }, [tripId]);

    const filteredTourists = tourists.filter(t => {
        if (search && !t.name?.toLowerCase().includes(search.toLowerCase()) && !t.email?.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter && t.safety_status !== filter) return false;
        return true;
    });

    const mapCenter = tourists.length > 0
        ? { lat: tourists[0].current_lat, lng: tourists[0].current_long }
        : { lat: 11.0168, lng: 76.9558 };

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
        if (!inviteEmail || !tripId) return;
        setInviteStatus("loading"); setInviteError("");

        try {
            const res = await fetch(`${API_URL}/enterprise/invite`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ email: inviteEmail.trim(), trip_id: tripId, name: inviteName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setInviteStatus("error");
                setInviteError(data.detail || "Failed to send invite.");
                return;
            }
            setInviteStatus("success");
            setTimeout(() => {
                setShowInvite(false);
                setInviteEmail(""); setInviteName("");
                setInviteStatus("idle");
                loadData();
            }, 1500);
        } catch {
            setInviteStatus("error");
            setInviteError("Server error. Check your connection.");
        }
    };

    const handleSimulateGeofence = async (e: React.MouseEvent, t: any) => {
        e.stopPropagation(); // prevent navigation to detail page

        try {
            await fetch(`${API_URL}/enterprise/simulate-alert/${t.email}`, {
                method: "POST",
                headers: authHeaders
            });
            // Show success toast for Enterprise AND native alert just in case
            alert(`🚨 ALERT TRIGGERED: Simulated No-Go Zone Alert sent for tourist ${t.name}!`);

            setSimulationToast({ show: true, name: t.name });
            setTimeout(() => setSimulationToast({ show: false, name: "" }), 4000);
        } catch (error) {
            console.error("Failed to simulate alert:", error);
            alert("Failed to send alert to tourist device directly.");
        }
    };

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Command Center</h1>
                    <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>
                        Live tourist monitoring & safety operations
                        {tripId && <span className="ml-2 badge badge-info">Trip: {tripId}</span>}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {tripId && (
                        <button onClick={() => setShowInvite(true)} className="btn btn-brand">
                            <UserPlus className="w-4 h-4" /> Add Tourist
                        </button>
                    )}
                    <button onClick={loadData} className="btn btn-ghost">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* Inline Invite */}
            {showInvite && tripId && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card p-5" style={{ border: "1px solid var(--thor-brand)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" style={{ color: "var(--thor-brand)" }} />
                            <h3 className="font-bold" style={{ color: "var(--thor-text)" }}>Dispatch Tracking Request</h3>
                        </div>
                        <button onClick={() => { setShowInvite(false); setInviteStatus("idle"); setInviteEmail(""); setInviteName(""); }} className="btn btn-ghost btn-sm p-1 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <form onSubmit={handleInvite} className="space-y-3">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)}
                                    placeholder="Tourist name" disabled={inviteStatus !== "idle"}
                                    className="input" style={{ paddingLeft: "2.5rem" }} />
                            </div>
                            <div className="relative flex-1">
                                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                    placeholder="tourist@email.com" required disabled={inviteStatus !== "idle"}
                                    className="input" autoFocus />
                            </div>
                            <button type="submit" disabled={inviteStatus !== "idle"} className="btn btn-brand whitespace-nowrap">
                                {inviteStatus === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    inviteStatus === "success" ? "Sent ✓" :
                                        <><Send className="w-4 h-4" /> Send Request</>}
                            </button>
                        </div>
                        {inviteStatus === "error" && (
                            <p className="text-caption" style={{ color: "var(--thor-danger)" }}>{inviteError}</p>
                        )}
                    </form>
                    <p className="text-micro mt-2" style={{ color: "var(--thor-text-muted)" }}>
                        The traveler will receive an authorization request in their THOR dashboard.
                    </p>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {loading && statCards.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card p-4 text-center skeleton h-16" />
                    ))
                ) : statCards.map((s, i) => (
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
                            center={mapCenter} zoom={tourists.length > 0 ? 13 : 12}
                            options={{ styles: darkMapStyle, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}>
                            {filteredTourists.map((t, i) => (
                                <Marker key={i} position={{ lat: t.current_lat, lng: t.current_long }}
                                    onClick={() => navigate(`/enterprise/tourist/${t.user_id}`)}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE, scale: t.sos_active ? 12 : 7,
                                        fillColor: t.safety_status === "safe" ? "#22c55e" : t.safety_status === "warning" ? "#eab308" : "#ef4444",
                                        fillOpacity: 1, strokeColor: t.sos_active ? "#ef4444" : "#fff", strokeWeight: t.sos_active ? 3 : 1.5,
                                    }}
                                    title={`${t.name} (${t.safety_status})`} />
                            ))}
                        </GoogleMap>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--thor-brand)" }} />
                        </div>
                    )}
                </div>

                {/* Feed */}
                <div className="card p-4 flex flex-col" style={{ height: 420 }}>
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                        <Activity className="w-4 h-4" style={{ color: "var(--thor-brand)" }} />
                        <span className="text-subheading" style={{ color: "var(--thor-text)" }}>Activity Feed</span>
                        <span className="text-micro ml-auto" style={{ color: "var(--thor-text-muted)" }}>{feed.length} events</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {feed.length === 0 && (
                            <p className="text-caption text-center py-8" style={{ color: "var(--thor-text-disabled)" }}>
                                No events — all tourists are safe
                            </p>
                        )}
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
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input" style={{ paddingLeft: "2.5rem" }} />
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

                {loading && tourists.length === 0 ? (
                    <div className="text-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "var(--thor-brand)" }} />
                    </div>
                ) : filteredTourists.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--thor-text-disabled)" }} />
                        <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>
                            {tourists.length === 0 ? "No tourists have accepted the invite yet" : "No tourists match your search"}
                        </p>
                        <p className="text-caption" style={{ color: "var(--thor-text-disabled)" }}>
                            Tourists appear here once they accept the tracking invitation from their THOR app
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--thor-border)" }}>
                                    {["Name", "Email", "Destination", "Status", "Battery", "Network", "Simulate Alert", ""].map(h => (
                                        <th key={h} className="text-left text-micro py-3 px-3" style={{ color: "var(--thor-text-muted)" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTourists.map((t, i) => (
                                    <tr key={i} className="cursor-pointer transition-all"
                                        style={{ borderBottom: "1px solid var(--thor-border)" }}
                                        onClick={() => navigate(`/enterprise/tourist/${t.user_id}`)}
                                        onMouseEnter={e => (e.currentTarget.style.background = "var(--thor-surface)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2">
                                                {t.sos_active && <Siren className="w-4 h-4 animate-thor-pulse" style={{ color: "var(--thor-danger)" }} />}
                                                <span className="text-body font-medium" style={{ color: "var(--thor-text)" }}>{t.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-caption" style={{ color: "var(--thor-text-muted)" }}>{t.email}</td>
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
                                                {t.network_status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <button
                                                onClick={(e) => handleSimulateGeofence(e, t)}
                                                className="btn btn-sm bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <MapPinIcon className="w-3 h-3" /> Simulate No-Go
                                            </button>
                                        </td>
                                        <td className="py-3 px-3">
                                            <button className="btn btn-ghost btn-sm"><Eye className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
