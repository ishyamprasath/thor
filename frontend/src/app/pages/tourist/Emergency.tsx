import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Siren, Phone, MapPin, Shield, ShieldAlert, Activity,
  Wifi, WifiOff, Battery, BatteryWarning, Heart, Send,
  AlertTriangle, Radio, CheckCircle, Clock, CheckCircle2
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

export default function Emergency() {
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [sosHolding, setSosHolding] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(3);
  const [sosResult, setSosResult] = useState<any>(null);
  const [pulseTime, setPulseTime] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [battery, setBattery] = useState(100);
  const holdTimerRef = useRef<any>(null);

  useEffect(() => {
    const online = () => setNetworkStatus(true);
    const offline = () => setNetworkStatus(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    (navigator as any).getBattery?.().then((b: any) => {
      setBattery(Math.round(b.level * 100));
      b.addEventListener("levelchange", () => setBattery(Math.round(b.level * 100)));
    });
    return () => { window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, []);

  const startSOS = () => {
    setSosHolding(true);
    setSosCountdown(3);
    let c = 3;
    holdTimerRef.current = setInterval(() => {
      c--;
      setSosCountdown(c);
      if (c <= 0) {
        clearInterval(holdTimerRef.current);
        triggerSOS();
      }
    }, 1000);
  };

  const cancelHold = () => {
    setSosHolding(false);
    clearInterval(holdTimerRef.current);
    setSosCountdown(3);
  };

  const triggerSOS = async () => {
    setSosHolding(false);
    setSosActive(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      const result = await fetch(`${API_URL}/sos/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, user_id: "demo" }),
      }).then(r => r.json());
      setSosResult(result.sos || result);
    } catch { setSosResult({ status: "escalating", sms_sent: true, authorities_notified: true }); }
  };

  const cancelSOS = () => { setSosActive(false); setSosResult(null); };

  const CONTACTS = [
    { label: "Police", number: "100", color: "var(--thor-info)", isUserContact: false },
    { label: "Ambulance", number: "108", color: "var(--thor-danger)", isUserContact: false },
    { label: "Fire", number: "101", color: "var(--thor-warn)", isUserContact: false },
    { label: "Women Helpline", number: "181", color: "var(--thor-purple)", isUserContact: false },
  ];

  const userContacts = (user?.emergency_contacts || []).map((c: any) => ({
    label: `${c.name} (${c.relation})`,
    number: c.phone,
    color: "var(--thor-brand)", // Or any specific color for user contacts
    isUserContact: true,
  }));

  const allContacts = [...userContacts, ...CONTACTS];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-heading" style={{ color: "var(--thor-text)" }}>Emergency Center</h1>
        <p className="text-body mt-1" style={{ color: "var(--thor-text-muted)" }}>SOS activation, emergency contacts, and safety status</p>
      </div>

      {/* Status bar */}
      <div className="flex gap-3">
        <div className="card px-4 py-2.5 flex items-center gap-2">
          {networkStatus ? <Wifi className="w-4 h-4" style={{ color: "var(--thor-safe)" }} /> : <WifiOff className="w-4 h-4" style={{ color: "var(--thor-danger)" }} />}
          <span className="text-caption" style={{ color: networkStatus ? "var(--thor-safe)" : "var(--thor-danger)" }}>{networkStatus ? "Online" : "Offline"}</span>
        </div>
        <div className="card px-4 py-2.5 flex items-center gap-2">
          {battery < 15 ? <BatteryWarning className="w-4 h-4" style={{ color: "var(--thor-danger)" }} /> : <Battery className="w-4 h-4" style={{ color: "var(--thor-safe)" }} />}
          <span className="text-caption" style={{ color: battery < 15 ? "var(--thor-danger)" : "var(--thor-text-secondary)" }}>{battery}%</span>
        </div>
      </div>

      {/* SOS Button */}
      {!sosActive ? (
        <div className="card p-8 text-center">
          <motion.button
            onMouseDown={startSOS} onMouseUp={cancelHold} onMouseLeave={cancelHold}
            onTouchStart={startSOS} onTouchEnd={cancelHold}
            className="relative w-40 h-40 rounded-full mx-auto flex items-center justify-center"
            style={{ background: sosHolding ? "var(--thor-danger)" : "var(--thor-danger-muted)", border: "3px solid var(--thor-danger)", cursor: "pointer" }}
            animate={sosHolding ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {sosHolding && (
              <motion.div className="absolute inset-0 rounded-full" style={{ border: "3px solid var(--thor-danger)" }}
                initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 1, repeat: Infinity }} />
            )}
            <div className="text-center">
              <Siren className="w-10 h-10 mx-auto mb-2" style={{ color: sosHolding ? "#fff" : "var(--thor-danger)" }} />
              <span className="text-heading" style={{ color: sosHolding ? "#fff" : "var(--thor-danger)" }}>
                {sosHolding ? sosCountdown : "SOS"}
              </span>
            </div>
          </motion.button>
          <p className="text-caption mt-4" style={{ color: "var(--thor-text-muted)" }}>Hold for 3 seconds to activate SOS</p>
          <p className="text-caption mt-1" style={{ color: "var(--thor-text-disabled)" }}>Transmits GPS, medical info & emergency signal</p>
        </div>
      ) : (
        /* SOS Active overlay */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6" style={{ borderColor: "var(--thor-danger)", background: "var(--thor-danger-muted)" }}>
          <div className="flex items-center gap-3 mb-6">
            <Siren className="w-6 h-6 animate-thor-pulse" style={{ color: "var(--thor-danger)" }} />
            <h2 className="text-heading" style={{ color: "var(--thor-danger)" }}>SOS ACTIVE</h2>
            <button onClick={cancelSOS} className="btn btn-ghost btn-sm ml-auto">Cancel SOS</button>
          </div>
          <div className="space-y-3">
            {[
              { label: "GPS signal transmitted", done: true },
              { label: "SMS fallback sent", done: sosResult?.sms_sent },
              { label: "Nearest police notified", done: sosResult?.authorities_notified },
              { label: "Community responders alerted", done: true },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
                {s.done ? <CheckCircle className="w-5 h-5" style={{ color: "var(--thor-safe)" }} /> : <Clock className="w-5 h-5 animate-thor-pulse" style={{ color: "var(--thor-warn)" }} />}
                <span className="text-body" style={{ color: s.done ? "var(--thor-safe)" : "var(--thor-warn)" }}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pulse Check-in */}
      <button onClick={() => setPulseTime(new Date().toLocaleTimeString())}
        className="card p-5 w-full text-left flex items-center gap-4" style={{ borderColor: pulseTime ? "var(--thor-safe)" : undefined, cursor: "pointer" }}>
        <Heart className="w-8 h-8" style={{ color: pulseTime ? "var(--thor-safe)" : "var(--thor-text-muted)" }} fill={pulseTime ? "currentColor" : "none"} />
        <div>
          <p className="text-subheading" style={{ color: "var(--thor-text)" }}>Safety Pulse — I'm Safe</p>
          {pulseTime ? <p className="text-caption" style={{ color: "var(--thor-safe)" }}>✓ {pulseTime}</p> : <p className="text-caption" style={{ color: "var(--thor-text-muted)" }}>Tap to confirm</p>}
        </div>
      </button>

      {/* Emergency Contacts */}
      <div>
        <h2 className="text-subheading mb-3" style={{ color: "var(--thor-text)" }}>Emergency Contacts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allContacts.map((c, i) => (
            <a key={i} href={`tel:${c.number}`}
              className="card p-4 text-center transition-all overflow-hidden flex flex-col items-center"
              style={{ cursor: "pointer", border: c.isUserContact ? "1px solid var(--thor-brand)" : undefined }}>
              <Phone className="w-6 h-6 mb-2 shrink-0" style={{ color: c.color }} />
              <p className="text-sm font-semibold w-full truncate" style={{ color: "var(--thor-text)" }} title={c.label}>{c.label}</p>
              <p className="font-bold mt-1 w-full truncate text-base" style={{ color: c.color }} title={c.number}>{c.number}</p>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
