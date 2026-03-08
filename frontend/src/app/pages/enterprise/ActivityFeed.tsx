import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Activity, Siren, WifiOff, BatteryWarning, Shield, Clock, AlertTriangle, ChevronRight } from "lucide-react";

import { API_URL } from "../../config/api";

export default function ActivityFeed() {
    const navigate = useNavigate();
    const [feed, setFeed] = useState<any[]>([]);
    const [filter, setFilter] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetch(`${API_URL}/enterprise/feed`).then(r => r.json());
                setFeed(data.events || []);
            } catch (e) { console.error(e); }
            setLoading(false);
        })();
        const iv = setInterval(async () => {
            try { const data = await fetch(`${API_URL}/enterprise/feed`).then(r => r.json()); setFeed(data.events || []); } catch { }
        }, 15000);
        return () => clearInterval(iv);
    }, []);

    const filtered = filter ? feed.filter(e => e.severity === filter) : feed;

    const ICON_MAP: Record<string, any> = {
        sos: Siren, offline: WifiOff, battery: BatteryWarning,
        alert: AlertTriangle, checkin: Shield,
    };

    const SEVERITY_COLORS: Record<string, string> = {
        critical: "var(--thor-danger)", warning: "var(--thor-warn)", info: "var(--thor-info)",
    };

    return (
        <div className="p-6 space-y-5 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Live Activity Feed</h1>
                    <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>Real-time system events and alerts</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-thor-pulse" style={{ background: "var(--thor-safe)" }} />
                    <span className="text-caption" style={{ color: "var(--thor-safe)" }}>Live</span>
                </div>
            </div>

            <div className="flex gap-1.5">
                {[null, "critical", "warning", "info"].map(f => (
                    <button key={f || "all"} onClick={() => setFilter(f)}
                        className={`badge ${filter === f ? "badge-brand" : ""}`}
                        style={filter === f ? {} : { background: "var(--thor-surface-3)", color: "var(--thor-text-muted)" }}>
                        {f ? f.charAt(0).toUpperCase() + f.slice(1) : "All"}
                    </button>
                ))}
                <span className="text-caption ml-auto" style={{ color: "var(--thor-text-disabled)" }}>{filtered.length} events</span>
            </div>

            <div className="space-y-2">
                {filtered.map((ev, i) => {
                    const Icon = ICON_MAP[ev.type] || Activity;
                    const color = SEVERITY_COLORS[ev.severity] || "var(--thor-text-muted)";
                    return (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                            className="card p-4 flex items-center gap-4 cursor-pointer transition-all"
                            onClick={() => ev.user_id && navigate(`/enterprise/tourist/${ev.user_id}`)}
                            style={{ borderLeft: `3px solid ${color}` }}>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: `${color}15`, color }}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body font-medium" style={{ color: "var(--thor-text)" }}>{ev.message}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    {ev.tourist_name && <span className="text-caption" style={{ color: "var(--thor-text-muted)" }}>{ev.tourist_name}</span>}
                                    <span className="text-caption flex items-center gap-1" style={{ color: "var(--thor-text-disabled)" }}>
                                        <Clock className="w-3 h-3" />{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "now"}
                                    </span>
                                </div>
                            </div>
                            <span className="badge" style={{ background: `${color}15`, color }}>{ev.severity}</span>
                            {ev.user_id && <ChevronRight className="w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />}
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-12"><p className="text-body" style={{ color: "var(--thor-text-disabled)" }}>No events</p></div>
                )}
            </div>
        </div>
    );
}
