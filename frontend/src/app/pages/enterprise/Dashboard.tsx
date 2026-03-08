import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Zap, Users, Wifi, WifiOff, Shield, ShieldAlert, AlertTriangle,
  Battery, BatteryWarning, Siren, MapPin, Search, Eye,
  Radio, Activity, ChevronRight, RefreshCw
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api";
import { useNavigate } from "react-router";

const MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
import { API_URL } from "../../config/api";
const LIBS: ("places")[] = ["places"];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a2035" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a2035" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1726" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c3e6b" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
];

const STATUS_COLORS: Record<string, string> = {
  safe: "#22c55e", warning: "#eab308", danger: "#ef4444",
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  warning: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  info: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
};

export default function EnterpriseDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [tourists, setTourists] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [hazards, setHazards] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterSafety, setFilterSafety] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY, libraries: LIBS });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, touristsRes, feedRes, hazardsRes] = await Promise.all([
        fetch(`${API_URL}/enterprise/stats`),
        fetch(`${API_URL}/enterprise/tourists`),
        fetch(`${API_URL}/enterprise/feed`),
        fetch(`${API_URL}/safety/hazards?status=active`),
      ]);
      const [s, t, f, h] = await Promise.all([
        statsRes.json(), touristsRes.json(), feedRes.json(), hazardsRes.json(),
      ]);
      setStats(s);
      setTourists(t.tourists || []);
      setFeed(f.events || []);
      setHazards(h.hazards || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); const iv = setInterval(fetchAll, 30000); return () => clearInterval(iv); }, []);

  const filteredTourists = tourists.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.country.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSafety && t.safety_status !== filterSafety) return false;
    return true;
  });

  const mapCenter = { lat: 11.0168, lng: 76.9558 };

  const statCards = stats ? [
    { label: "Total Tourists", value: stats.total_tourists, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Online", value: stats.online, icon: Wifi, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Offline", value: stats.offline, icon: WifiOff, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "SOS Active", value: stats.sos_active, icon: Siren, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Danger", value: stats.danger, icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Warning", value: stats.warning, icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Safe", value: stats.safe, icon: Shield, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Low Battery", value: stats.low_battery, icon: BatteryWarning, color: "text-orange-400", bg: "bg-orange-500/10" },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
        <Zap className="w-6 h-6 text-yellow-400" fill="currentColor" />
        <span className="font-black tracking-widest text-lg bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">THOR</span>
        <span className="text-slate-500 text-sm font-semibold">ENTERPRISE COMMAND CENTER</span>
        <div className="flex-1" />
        <button onClick={fetchAll}
          className="flex items-center gap-2 text-slate-400 hover:text-white bg-white/5 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
        <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />LIVE
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`${s.bg} border border-white/5 rounded-2xl p-4 text-center`}>
                <Icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                <p className="text-white text-2xl font-black">{s.value}</p>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* MAP — 2 cols */}
          <div className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden" style={{ height: 500 }}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter} zoom={12}
                onLoad={(map) => { mapRef.current = map; }}
                options={{ styles: darkMapStyle, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: true }}>
                {/* Tourist markers */}
                {filteredTourists.map((t, i) => (
                  <Marker key={i} position={{ lat: t.current_lat, lng: t.current_long }}
                    onClick={() => navigate(`/enterprise/tourist/${t.user_id}`)}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE, scale: t.sos_active ? 12 : 8,
                      fillColor: STATUS_COLORS[t.safety_status] || "#22c55e",
                      fillOpacity: 1, strokeColor: t.sos_active ? "#ff0000" : "#fff",
                      strokeWeight: t.sos_active ? 4 : 2,
                    }}
                    title={`${t.name} (${t.safety_status})`} />
                ))}
                {/* Hazard zones */}
                {hazards.map((h, i) => (
                  <Circle key={`h-${i}`} center={{ lat: h.latitude, lng: h.longitude }}
                    radius={h.danger_radius_meters}
                    options={{ fillColor: "#ef4444", fillOpacity: 0.1, strokeColor: "#ef4444", strokeWeight: 1, strokeOpacity: 0.5 }} />
                ))}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-yellow-400 animate-pulse" fill="currentColor" />
              </div>
            )}
          </div>

          {/* ACTIVITY FEED — 1 col */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col" style={{ height: 500 }}>
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <Activity className="w-4 h-4 text-yellow-400" />
              <h3 className="text-white font-bold text-sm">Live Activity Feed</h3>
              <span className="text-slate-500 text-xs ml-auto">{feed.length} events</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {feed.map((ev, i) => {
                const style = SEVERITY_STYLES[ev.severity] || SEVERITY_STYLES.info;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`${style.bg} border ${style.border} rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-all`}
                    onClick={() => ev.user_id && navigate(`/enterprise/tourist/${ev.user_id}`)}>
                    <p className={`${style.text} text-xs font-semibold`}>{ev.message}</p>
                    {ev.timestamp && <p className="text-slate-500 text-[10px] mt-1">{new Date(ev.timestamp).toLocaleTimeString()}</p>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* TOURIST TABLE */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Users className="w-4 h-4 text-yellow-400" />
            <h3 className="text-white font-bold text-sm">All Tourists</h3>
            <div className="flex-1" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or country..."
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 w-56" />
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5">
              {[null, "safe", "warning", "danger"].map((f) => (
                <button key={f || "all"} onClick={() => setFilterSafety(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterSafety === f ? "bg-yellow-500 text-black" : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}>
                  {f ? f.charAt(0).toUpperCase() + f.slice(1) : "All"}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Name", "Country", "Destination", "Status", "Battery", "Network", "Last Pulse", ""].map((h) => (
                    <th key={h} className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wider py-3 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTourists.map((t, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all"
                    onClick={() => navigate(`/enterprise/tourist/${t.user_id}`)}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {t.sos_active && <Siren className="w-4 h-4 text-red-500 animate-pulse" />}
                        <span className="text-white font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{t.country}</td>
                    <td className="py-3 px-3 text-slate-400">{t.trip_destination}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${t.safety_status === "safe" ? "bg-green-500/20 text-green-400" :
                          t.safety_status === "warning" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                        }`}>{t.safety_status}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className={`flex items-center gap-1 ${t.battery_percentage < 15 ? "text-red-400" : t.battery_percentage < 30 ? "text-yellow-400" : "text-green-400"}`}>
                        {t.battery_percentage < 15 ? <BatteryWarning className="w-3.5 h-3.5" /> : <Battery className="w-3.5 h-3.5" />}
                        {t.battery_percentage}%
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`flex items-center gap-1 text-xs ${t.network_status === "online" ? "text-green-400" : "text-red-400"}`}>
                        {t.network_status === "online" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                        {t.network_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-xs">{new Date(t.last_pulse_check_ack).toLocaleTimeString()}</td>
                    <td className="py-3 px-3">
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
