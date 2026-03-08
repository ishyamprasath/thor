import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, MapPin, Battery, BatteryWarning, Wifi, WifiOff,
  Shield, Siren, Heart, Phone, Send, ShieldCheck, Clock,
  Activity, Navigation, AlertTriangle, Stethoscope
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

import { API_URL } from "../../config/api";
const MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBS: ("places")[] = ["places"];
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#060a14" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

export default function TouristView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourist, setTourist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkinSent, setCheckinSent] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: MAPS_KEY,
    libraries: LIBS
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetch(`${API_URL}/enterprise/tourist/${id}`).then(r => r.json());
        setTourist(data.tourist);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [id]);

  const triggerCheckin = async () => {
    await fetch(`${API_URL}/enterprise/checkin/${id}`, { method: "POST" });
    setCheckinSent(true);
    setTimeout(() => setCheckinSent(false), 5000);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="skeleton w-12 h-12 rounded-full" /></div>;
  if (!tourist) return <div className="flex items-center justify-center h-full text-body" style={{ color: "var(--thor-text-muted)" }}>Tourist not found</div>;

  const statusColor = tourist.safety_status === "safe" ? "var(--thor-safe)" : tourist.safety_status === "warning" ? "var(--thor-warn)" : "var(--thor-danger)";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/enterprise")} className="btn btn-ghost btn-sm"><ArrowLeft className="w-4 h-4" /></button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-subheading font-bold" style={{ background: statusColor, color: "#000" }}>
          {tourist.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>{tourist.name}</h1>
          <p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>{tourist.country} → {tourist.trip_destination}</p>
        </div>
        {tourist.sos_active && <div className="badge badge-danger ml-auto animate-thor-pulse"><Siren className="w-4 h-4" />SOS ACTIVE</div>}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Profile */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-subheading mb-3" style={{ color: "var(--thor-text)" }}>Status</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Safety", value: tourist.safety_status, color: statusColor },
                { label: "Battery", value: `${tourist.battery_percentage}%`, color: tourist.battery_percentage < 15 ? "var(--thor-danger)" : "var(--thor-safe)" },
                { label: "Network", value: tourist.network_status, color: tourist.network_status === "online" ? "var(--thor-safe)" : "var(--thor-danger)" },
                { label: "GPS", value: `${tourist.current_lat.toFixed(3)}°`, color: "var(--thor-text-secondary)" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-lg" style={{ background: "var(--thor-surface-2)" }}>
                  <p className="text-micro" style={{ color: "var(--thor-text-muted)" }}>{s.label}</p>
                  <p className="text-body font-semibold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {tourist.medical_profile && (
            <div className="card p-5">
              <h2 className="text-subheading mb-3 flex items-center gap-2" style={{ color: "var(--thor-text)" }}>
                <Stethoscope className="w-4 h-4" style={{ color: "var(--thor-danger)" }} />Medical
              </h2>
              <div className="space-y-2">
                {Object.entries(tourist.medical_profile).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-caption">
                    <span style={{ color: "var(--thor-text-muted)" }}>{k.replace(/_/g, " ")}</span>
                    <span style={{ color: "var(--thor-text)" }}>{v as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={triggerCheckin}
            className={`btn w-full ${checkinSent ? "btn-ghost" : "btn-brand"}`}>
            {checkinSent ? <><ShieldCheck className="w-5 h-5" />Sent!</> : <><Send className="w-5 h-5" />Request Check-in</>}
          </button>
        </div>

        {/* Center: Map */}
        <div className="card overflow-hidden" style={{ height: 400 }}>
          {isLoaded ? (
            <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }}
              center={{ lat: tourist.current_lat, lng: tourist.current_long }} zoom={15}
              options={{ styles: darkMapStyle, zoomControl: true, mapTypeControl: false, streetViewControl: false }}>
              <Marker position={{ lat: tourist.current_lat, lng: tourist.current_long }}
                icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: tourist.safety_status === "safe" ? "#22c55e" : "#ef4444", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 }} />
              {tourist.movement_history?.map((m: any, i: number) => (
                <Marker key={i} position={{ lat: m.lat, lng: m.lng }}
                  icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 3, fillColor: "#64748b", fillOpacity: 0.5, strokeWeight: 0 }} />
              ))}
            </GoogleMap>
          ) : <div className="w-full h-full flex items-center justify-center"><div className="skeleton w-12 h-12 rounded-full" /></div>}
        </div>

        {/* Right: Alerts + History */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-subheading mb-3 flex items-center gap-2" style={{ color: "var(--thor-text)" }}>
              <AlertTriangle className="w-4 h-4" style={{ color: "var(--thor-warn)" }} />Alerts
            </h2>
            {tourist.recent_alerts?.length > 0 ? (
              <div className="space-y-2">
                {tourist.recent_alerts.map((a: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: a.severity === "critical" ? "var(--thor-danger-muted)" : "var(--thor-warn-muted)" }}>
                    <p className="text-caption font-semibold" style={{ color: a.severity === "critical" ? "var(--thor-danger)" : "var(--thor-warn)" }}>{a.type}</p>
                    <p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>{a.message}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-caption" style={{ color: "var(--thor-safe)" }}>No active alerts</p>}
          </div>

          <div className="card p-5">
            <h2 className="text-subheading mb-3 flex items-center gap-2" style={{ color: "var(--thor-text)" }}>
              <Heart className="w-4 h-4" style={{ color: "var(--thor-safe)" }} />Pulse
            </h2>
            <p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>Last: {new Date(tourist.last_pulse_check_ack).toLocaleString()}</p>
            <div className="mt-2 h-1.5 rounded-full" style={{ background: "var(--thor-surface-3)" }}>
              <div className="h-full rounded-full" style={{ background: "var(--thor-safe)", width: "70%" }} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-subheading mb-3 flex items-center gap-2" style={{ color: "var(--thor-text)" }}>
              <Activity className="w-4 h-4" style={{ color: "var(--thor-brand)" }} />Movement
            </h2>
            <div className="space-y-1.5">
              {tourist.movement_history?.slice(0, 5).map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-caption">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--thor-text-disabled)" }} />
                  <span style={{ color: "var(--thor-text-muted)" }}>{new Date(m.timestamp).toLocaleTimeString()}</span>
                  <span className="font-mono" style={{ color: "var(--thor-text-secondary)" }}>{m.lat.toFixed(3)}, {m.lng.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
