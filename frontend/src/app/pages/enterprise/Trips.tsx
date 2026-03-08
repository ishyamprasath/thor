import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
    Plus, Mail, MapPin, Calendar, Users, AlertTriangle,
    Check, Send, Clock, Search, ChevronRight
} from "lucide-react";

import { API_URL } from "../../config/api";

interface TripPlan {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    tourists: { email: string; status: string }[];
    riskLevel: string;
}

export default function EnterpriseTrips() {
    const [trips, setTrips] = useState<TripPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTrip, setNewTrip] = useState({ name: "", destination: "", startDate: "", endDate: "", touristEmail: "" });
    const [addedEmails, setAddedEmails] = useState<string[]>([]);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/enterprise/trips`).then(r => r.json());
            setTrips(res.trips || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchTrips(); }, []);

    const addEmail = () => {
        if (newTrip.touristEmail.trim() && newTrip.touristEmail.includes("@")) {
            setAddedEmails([...addedEmails, newTrip.touristEmail.trim()]);
            setNewTrip({ ...newTrip, touristEmail: "" });
        }
    };

    const createTrip = async () => {
        try {
            await fetch(`${API_URL}/enterprise/trips`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newTrip.name,
                    destination: newTrip.destination,
                    start_date: newTrip.startDate,
                    end_date: newTrip.endDate,
                    tourist_emails: addedEmails
                })
            });
            await fetchTrips();
        } catch (error) {
            console.error("Failed to create trip", error);
        }

        // Reset form
        setShowCreate(false);
        setNewTrip({ name: "", destination: "", startDate: "", endDate: "", touristEmail: "" });
        setAddedEmails([]);
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Trip Planner</h1>
                    <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>Create and manage group travel plans</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className="btn btn-brand">
                    <Plus className="w-4 h-4" /> New Trip
                </button>
            </div>

            {/* Create trip form */}
            {showCreate && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card p-6">
                    <h2 className="text-subheading mb-4" style={{ color: "var(--thor-text)" }}>Create Trip Plan</h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Trip Name</label>
                            <input type="text" value={newTrip.name} onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })} placeholder="e.g. Heritage Tour Group" className="input" />
                        </div>
                        <div>
                            <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Destination</label>
                            <input type="text" value={newTrip.destination} onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })} placeholder="City, Country" className="input" />
                        </div>
                        <div>
                            <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Start Date</label>
                            <input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })} className="input" />
                        </div>
                        <div>
                            <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>End Date</label>
                            <input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })} className="input" />
                        </div>
                    </div>

                    {/* Tourist emails */}
                    <div className="mb-4">
                        <label className="text-caption block mb-2" style={{ color: "var(--thor-text-secondary)" }}>Add Tourists by Email</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                                <input type="email" value={newTrip.touristEmail} onChange={(e) => setNewTrip({ ...newTrip, touristEmail: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && addEmail()}
                                    placeholder="tourist@email.com" className="input" style={{ paddingLeft: "2.5rem" }} />
                            </div>
                            <button onClick={addEmail} className="btn btn-ghost"><Plus className="w-4 h-4" /></button>
                        </div>
                        {addedEmails.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {addedEmails.map((e, i) => (
                                    <span key={i} className="badge badge-info flex items-center gap-1">
                                        <Mail className="w-3 h-3" />{e}
                                        <button onClick={() => setAddedEmails(addedEmails.filter((_, j) => j !== i))} className="ml-1" style={{ color: "var(--thor-text-muted)" }}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <p className="text-caption mt-2" style={{ color: "var(--thor-text-disabled)" }}>
                            Tourists will receive an invitation to join this trip
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
                        <button onClick={createTrip} disabled={!newTrip.name || !newTrip.destination || addedEmails.length === 0} className="btn btn-brand">
                            <Send className="w-4 h-4" /> Create & Invite
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Trip list */}
            <div className="space-y-3">
                {trips.map((trip, i) => (
                    <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="card p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-subheading" style={{ color: "var(--thor-text)" }}>{trip.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-caption flex items-center gap-1" style={{ color: "var(--thor-text-muted)" }}>
                                        <MapPin className="w-3 h-3" />{trip.destination}
                                    </span>
                                    <span className="text-caption flex items-center gap-1" style={{ color: "var(--thor-text-muted)" }}>
                                        <Calendar className="w-3 h-3" />{trip.startDate} → {trip.endDate}
                                    </span>
                                </div>
                            </div>
                            <span className={`badge ${trip.riskLevel === "low" ? "badge-safe" : trip.riskLevel === "medium" ? "badge-warn" : "badge-danger"}`}>
                                {trip.riskLevel} risk
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Users className="w-4 h-4" style={{ color: "var(--thor-text-muted)" }} />
                            <div className="flex flex-wrap gap-2">
                                {trip.tourists ? trip.tourists.map((t, j) => (
                                    <span key={j} className={`badge ${t.status === "accepted" ? "badge-safe" : "badge-warn"}`}>
                                        {t.status === "accepted" ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {t.email}
                                    </span>
                                )) : <span className="text-caption text-zinc-500">No tourists assigned yet</span>}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
