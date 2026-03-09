import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Plus, Mail, MapPin, Calendar, Users, Send, Clock,
    RefreshCw, ChevronRight, Loader2, AlertCircle, CheckCircle2, Hourglass, X
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

interface TouristSlot {
    name: string;
    email: string;
}

interface TripTourist {
    email: string;
    name?: string;
    status: "pending" | "accepted" | "declined";
}

interface Trip {
    id: string;
    trip_id: string;
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
    status: string;
    tourists: TripTourist[];
    created_at: string;
}

export default function EnterpriseTrips() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    // Form state
    const [tripName, setTripName] = useState("");
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [tourists, setTourists] = useState<TouristSlot[]>([{ name: "", email: "" }]);

    const authHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const loadTrips = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/enterprise/trips`, { headers: authHeaders });
            const data = await res.json();
            setTrips(data.trips || []);
        } catch {
            setError("Failed to load trips.");
        }
        setLoading(false);
    };

    useEffect(() => { loadTrips(); }, []);

    const addTouristRow = () => setTourists([...tourists, { name: "", email: "" }]);
    const removeTouristRow = (i: number) => setTourists(tourists.filter((_, idx) => idx !== i));
    const updateTourist = (i: number, field: "name" | "email", value: string) => {
        const updated = [...tourists];
        updated[i][field] = value;
        setTourists(updated);
    };

    const handleCreate = async () => {
        const validTourists = tourists.filter(t => t.email.trim().includes("@"));
        if (!tripName || !destination || !startDate || !endDate) {
            setError("Please fill in all trip details."); return;
        }
        if (validTourists.length === 0) {
            setError("Add at least one tourist with a valid email."); return;
        }

        setCreating(true); setError("");

        try {
            const res = await fetch(`${API_URL}/enterprise/trips`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    name: tripName,
                    destination,
                    start_date: startDate,
                    end_date: endDate,
                    tourist_emails: validTourists.map(t => t.email.trim()),
                    tourist_names: validTourists.map(t => t.name.trim()),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || "Failed to create trip.");
                setCreating(false);
                return;
            }

            // Reset form
            setTripName(""); setDestination(""); setStartDate(""); setEndDate("");
            setTourists([{ name: "", email: "" }]);
            setShowCreate(false);
            await loadTrips();
        } catch {
            setError("Server error. Please try again.");
        }
        setCreating(false);
    };

    const statusIcon = (s: string) => {
        if (s === "accepted") return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
        if (s === "declined") return <X className="w-3.5 h-3.5 text-red-400" />;
        return <Hourglass className="w-3.5 h-3.5 text-yellow-400" />;
    };

    const statusLabel = (s: string) => {
        if (s === "accepted") return "Accepted";
        if (s === "declined") return "Declined";
        return "Pending";
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Trip Plans</h1>
                    <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>Create trips and invite tourists by name & email</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadTrips} className="btn btn-ghost" title="Refresh">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={() => { setShowCreate(!showCreate); setError(""); }} className="btn btn-brand">
                        <Plus className="w-4 h-4" /> New Trip
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: "var(--thor-danger-muted)", color: "var(--thor-danger)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-caption">{error}</span>
                    <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
                </motion.div>
            )}

            {/* Create Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="card p-6" style={{ border: "1px solid var(--thor-brand)" }}>
                        <h2 className="text-subheading mb-5" style={{ color: "var(--thor-text)" }}>Create New Trip</h2>
                        <div className="grid md:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="text-caption block mb-1.5" style={{ color: "var(--thor-text-secondary)" }}>Trip Name *</label>
                                <input type="text" value={tripName} onChange={e => setTripName(e.target.value)}
                                    placeholder="e.g. Heritage Tour Group — Batch 2" className="input" />
                            </div>
                            <div>
                                <label className="text-caption block mb-1.5" style={{ color: "var(--thor-text-secondary)" }}>Destination *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                                        placeholder="City, Country" className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-1.5" style={{ color: "var(--thor-text-secondary)" }}>Start Date *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                        className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="text-caption block mb-1.5" style={{ color: "var(--thor-text-secondary)" }}>End Date *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                        className="input" style={{ paddingLeft: "2.5rem" }} />
                                </div>
                            </div>
                        </div>

                        {/* Tourists */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-caption" style={{ color: "var(--thor-text-secondary)" }}>Tourists * (enter name & email — they'll receive an invite)</label>
                                <button onClick={addTouristRow} className="btn btn-ghost btn-sm">
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                            <div className="space-y-3">
                                {tourists.map((t, i) => (
                                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                            <input type="text" value={t.name} onChange={e => updateTourist(i, "name", e.target.value)}
                                                placeholder="Tourist name" className="input" style={{ paddingLeft: "2.5rem" }} />
                                        </div>
                                        <div className="relative flex-1">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                            <input type="email" value={t.email} onChange={e => updateTourist(i, "email", e.target.value)}
                                                placeholder="tourist@email.com" className="input" style={{ paddingLeft: "2.5rem" }} />
                                        </div>
                                        {tourists.length > 1 && (
                                            <button onClick={() => removeTouristRow(i)} className="btn btn-ghost btn-sm p-2">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-micro mt-2" style={{ color: "var(--thor-text-disabled)" }}>
                                Each tourist will receive a tracking authorization request in their THOR app dashboard.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button onClick={() => { setShowCreate(false); setError(""); }} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleCreate} disabled={creating} className="btn btn-brand">
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {creating ? "Sending invites..." : "Create & Invite"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trips List */}
            {loading && trips.length === 0 ? (
                <div className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "var(--thor-brand)" }} />
                    <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>Loading trips...</p>
                </div>
            ) : trips.length === 0 ? (
                <div className="text-center py-20 card">
                    <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--thor-text-disabled)" }} />
                    <p className="text-subheading mb-1" style={{ color: "var(--thor-text)" }}>No trips yet</p>
                    <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>Create your first trip plan and invite tourists</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.map((trip, i) => {
                        const tid = trip.trip_id || trip.id;
                        const accepted = (trip.tourists || []).filter(t => t.status === "accepted").length;
                        const pending = (trip.tourists || []).filter(t => t.status === "pending").length;
                        return (
                            <motion.div key={tid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="card p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-subheading" style={{ color: "var(--thor-text)" }}>{trip.name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            <span className="text-caption flex items-center gap-1" style={{ color: "var(--thor-text-muted)" }}>
                                                <MapPin className="w-3 h-3" />{trip.destination}
                                            </span>
                                            <span className="text-caption flex items-center gap-1" style={{ color: "var(--thor-text-muted)" }}>
                                                <Calendar className="w-3 h-3" />{trip.start_date} → {trip.end_date}
                                            </span>
                                            <span className="badge badge-safe">{accepted} accepted</span>
                                            {pending > 0 && <span className="badge badge-warn">{pending} pending</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => navigate(`/enterprise/trip/${tid}`)}
                                        className="btn btn-ghost btn-sm flex items-center gap-1">
                                        Monitor <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {trip.tourists && trip.tourists.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {trip.tourists.map((t, j) => (
                                            <span key={j} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-caption"
                                                style={{
                                                    background: t.status === "accepted" ? "var(--thor-safe-muted)" : t.status === "declined" ? "var(--thor-danger-muted)" : "var(--thor-surface-2)",
                                                    color: t.status === "accepted" ? "var(--thor-safe)" : t.status === "declined" ? "var(--thor-danger)" : "var(--thor-text-muted)",
                                                }}>
                                                {statusIcon(t.status)}
                                                {t.name ? `${t.name} (${t.email})` : t.email}
                                                <span className="text-micro opacity-60">— {statusLabel(t.status)}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
