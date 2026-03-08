import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Shield, Siren, MapPin, Phone, AlertTriangle, CheckCircle,
  Clock, Users, Building2, Hospital, Landmark, Search
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api";

import { API_URL } from "../../config/api";
const MAPS_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;
const LIBS: ("places")[] = ["places"];
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#060a14" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
];

const CAT_ICONS: Record<string, any> = { police_station: Building2, hospital: Hospital, embassy: Landmark, verified_shelter: Shield };

export default function Authority() {
  const [zones, setZones] = useState<any[]>([]);
  const [hazards, setHazards] = useState<any[]>([]);
  const [sosTourists, setSosTourists] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: MAPS_KEY,
    libraries: LIBS
  });

  useEffect(() => {
    (async () => {
      try {
        const [z, h, t] = await Promise.all([
          fetch(`${API_URL}/safety/zones`).then(r => r.json()),
          fetch(`${API_URL}/safety/hazards?status=active`).then(r => r.json()),
          fetch(`${API_URL}/enterprise/tourists`).then(r => r.json()),
        ]);
        setZones(z.zones || []);
        setHazards(h.hazards || []);
        setSosTourists((t.tourists || []).filter((x: any) => x.sos_active));
      } catch (e) { console.error(e); }
    })();
  }, []);

  const filteredZones = categoryFilter ? zones.filter(z => z.category === categoryFilter) : zones;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Authority Integration</h1>
        <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>Emergency coordination and community response network</p>
      </div>

      {/* Active SOS */}
      {sosTourists.length > 0 && (
        <div className="card p-5" style={{ borderColor: "var(--thor-danger)", background: "var(--thor-danger-muted)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Siren className="w-5 h-5 animate-thor-pulse" style={{ color: "var(--thor-danger)" }} />
            <span className="text-subheading" style={{ color: "var(--thor-danger)" }}>Active SOS Alerts ({sosTourists.length})</span>
          </div>
          <div className="space-y-3">
            {sosTourists.map((t, i) => (
              <div key={i} className="p-4 rounded-lg flex items-center gap-4" style={{ background: "rgba(0,0,0,0.2)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-body font-bold"
                  style={{ background: "var(--thor-danger)", color: "#fff" }}>{t.name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-body font-semibold" style={{ color: "var(--thor-text)" }}>{t.name}</p>
                  <p className="text-caption font-mono" style={{ color: "var(--thor-text-secondary)" }}>
                    {t.current_lat.toFixed(4)}, {t.current_long.toFixed(4)}
                  </p>
                </div>
                <div className="flex gap-3">
                  {["GPS Sent", "SMS Sent", "Authority Notified", "Response Active"].map((s, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      {j < 3 ? <CheckCircle className="w-4 h-4" style={{ color: "var(--thor-safe)" }} /> : <Clock className="w-4 h-4 animate-thor-pulse" style={{ color: "var(--thor-warn)" }} />}
                      <span className="text-caption" style={{ color: j < 3 ? "var(--thor-safe)" : "var(--thor-warn)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Map */}
        <div className="card overflow-hidden" style={{ height: 400 }}>
          {isLoaded ? (
            <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }}
              center={{ lat: 11.0168, lng: 76.9558 }} zoom={12}
              options={{ styles: darkMapStyle, zoomControl: true, mapTypeControl: false, streetViewControl: false }}>
              {filteredZones.map((z, i) => (
                <Marker key={i} position={{ lat: z.latitude, lng: z.longitude }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE, scale: 7,
                    fillColor: z.category === "police_station" ? "#3b82f6" : z.category === "hospital" ? "#ef4444" : "#22c55e",
                    fillOpacity: 0.9, strokeColor: "#fff", strokeWeight: 1.5
                  }} />
              ))}
              {hazards.map((h, i) => (
                <Circle key={i} center={{ lat: h.latitude, lng: h.longitude }} radius={h.danger_radius_meters}
                  options={{ fillColor: "#ef4444", fillOpacity: 0.06, strokeColor: "#ef4444", strokeWeight: 1 }} />
              ))}
              {sosTourists.map((t, i) => (
                <Marker key={`sos-${i}`} position={{ lat: t.current_lat, lng: t.current_long }}
                  icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: "#ef4444", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 }} />
              ))}
            </GoogleMap>
          ) : <div className="w-full h-full flex items-center justify-center"><div className="skeleton w-12 h-12 rounded-full" /></div>}
        </div>

        {/* Safe Zones list */}
        <div className="card p-5 flex flex-col" style={{ height: 400 }}>
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <span className="text-subheading" style={{ color: "var(--thor-text)" }}>Emergency Network</span>
            <span className="text-caption" style={{ color: "var(--thor-text-muted)" }}>{filteredZones.length} locations</span>
          </div>
          <div className="flex gap-1.5 mb-3 flex-shrink-0">
            {[null, "police_station", "hospital", "embassy", "verified_shelter"].map(c => (
              <button key={c || "all"} onClick={() => setCategoryFilter(c)}
                className={`badge ${categoryFilter === c ? "badge-brand" : ""}`}
                style={categoryFilter === c ? {} : { background: "var(--thor-surface-3)", color: "var(--thor-text-muted)" }}>
                {c ? c.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "All"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredZones.map((z, i) => (
              <div key={i} className="p-3 rounded-lg flex items-center gap-3" style={{ background: "var(--thor-surface-2)" }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: z.category === "hospital" ? "var(--thor-danger)" : "var(--thor-info)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-caption font-semibold truncate" style={{ color: "var(--thor-text)" }}>{z.name}</p>
                  <p className="text-caption truncate" style={{ color: "var(--thor-text-muted)" }}>{z.operating_hours}</p>
                </div>
                {z.contact_number && <a href={`tel:${z.contact_number}`} className="btn btn-ghost btn-sm"><Phone className="w-4 h-4" /></a>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active hazards */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4" style={{ color: "var(--thor-warn)" }} />
          <span className="text-subheading" style={{ color: "var(--thor-text)" }}>Active Hazards ({hazards.length})</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hazards.map((h, i) => (
            <div key={i} className="p-4 rounded-lg" style={{ background: h.severity_score >= 70 ? "var(--thor-danger-muted)" : "var(--thor-warn-muted)" }}>
              <p className="text-caption font-semibold" style={{ color: h.severity_score >= 70 ? "var(--thor-danger)" : "var(--thor-warn)" }}>
                {h.type?.replace(/_/g, " ")}
              </p>
              <p className="text-caption mt-1" style={{ color: "var(--thor-text-muted)" }}>{h.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge" style={{ background: "rgba(0,0,0,0.2)", color: h.severity_score >= 70 ? "var(--thor-danger)" : "var(--thor-warn)" }}>
                  Severity: {h.severity_score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
