import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Map, MapPin, Calendar, Plus, ChevronRight, Users, ShieldAlert } from "lucide-react";

import { API_URL } from "../../config/api";

export default function EnterpriseHome() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/enterprise/trips`).then(r => r.json());
            setTrips(res.trips || []);
        } catch (e) {
            console.error("Failed to load trips", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display gradient-text mb-2 tracking-tight">Enterprise Missions</h1>
                    <p className="text-body text-zinc-400">Manage active operations and tourist tracking cohorts.</p>
                </div>
                <button onClick={() => navigate("/enterprise/trips")} className="btn btn-brand">
                    <Plus className="w-5 h-5" /> Initialize New Operation
                </button>
            </div>

            {/* Active Trips Grid */}
            {loading ? (
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-2xl border" style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)" }} />
                    ))}
                </div>
            ) : trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {trips.map((trip, i) => (
                        <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(`/enterprise/trip/${trip.id}`)}
                            className="border rounded-2xl p-6 transition-colors cursor-pointer group shadow-xl flex flex-col h-full"
                            style={{ background: "var(--thor-surface-2)", borderColor: "var(--thor-border)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--thor-brand)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--thor-border)")}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                                    <Map className="w-6 h-6" />
                                </div>
                                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md" style={{ background: "var(--thor-safe)", color: "#000" }}>
                                    Active Mission
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-2xl font-bold mb-2 truncate block" title={trip.name} style={{ color: "var(--thor-text)" }}>
                                    {trip.name}
                                </h4>
                                <div className="space-y-2 mt-4 text-sm" style={{ color: "var(--thor-text-muted)" }}>
                                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{trip.destination}</span></span>
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 flex-shrink-0" /> <span>{trip.start_date} to {trip.end_date}</span></span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t flex items-center justify-between font-semibold text-sm transition-colors" style={{ borderColor: "var(--thor-border)", color: "var(--thor-brand)" }}>
                                <span>Launch Command Center</span>
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-4 rounded-3xl border border-dashed" style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                    <ShieldAlert className="w-16 h-16 mx-auto mb-6 opacity-50" style={{ color: "var(--thor-text-muted)" }} />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--thor-text)" }}>No Active Operations</h3>
                    <p className="text-zinc-400 mb-8 max-w-md mx-auto">There are currently no active trip groups being monitored. Initialize a new operation to begin tracking tourists.</p>
                    <button onClick={() => navigate("/enterprise/trips")} className="btn btn-brand mx-auto">
                        <Plus className="w-5 h-5" /> Initialize New Operation
                    </button>
                </div>
            )}
        </div>
    );
}
