import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, MapPin, Bell, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";

type PermStatus = "idle" | "granted" | "denied" | "requesting";

export default function TouristPermissions() {
    const navigate = useNavigate();
    const [gps, setGps] = useState<PermStatus>("idle");
    const [notif, setNotif] = useState<PermStatus>("idle");
    const [allGranted, setAllGranted] = useState(false);

    useEffect(() => {
        if (gps === "granted" && notif === "granted") {
            setAllGranted(true);
            const t = setTimeout(() => navigate("/tourist/destination"), 1500);
            return () => clearTimeout(t);
        }
    }, [gps, notif, navigate]);

    const requestGPS = () => {
        setGps("requesting");
        navigator.geolocation.getCurrentPosition(
            () => setGps("granted"),
            () => setGps("denied"),
            { timeout: 10000 }
        );
    };

    const requestNotif = async () => {
        setNotif("requesting");
        try {
            const result = await Notification.requestPermission();
            setNotif(result === "granted" ? "granted" : "denied");
        } catch {
            setNotif("denied");
        }
    };

    const permissions = [
        {
            id: "gps",
            icon: MapPin,
            title: "Location Access",
            desc: "Required to show your position on the map, provide directions, and send safety alerts.",
            status: gps,
            action: requestGPS,
            color: "blue",
        },
        {
            id: "notif",
            icon: Bell,
            title: "Notification Alerts",
            desc: "Required to send you safety alerts, emergency notifications, and travel updates.",
            status: notif,
            action: requestNotif,
            color: "yellow",
        },
    ];

    const StatusIcon = ({ status }: { status: PermStatus }) => {
        if (status === "granted") return <CheckCircle className="w-6 h-6 text-green-400" />;
        if (status === "denied") return <XCircle className="w-6 h-6 text-red-400" />;
        if (status === "requesting") return (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                <Zap className="w-6 h-6 text-yellow-400" />
            </motion.div>
        );
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 8, repeat: Infinity }} />
                <motion.div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"
                    animate={{ scale: [1.3, 1, 1.3] }} transition={{ duration: 6, repeat: Infinity }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10">

                {/* Brand */}
                <div className="text-center mb-8">
                    <motion.div className="flex items-center justify-center gap-3 mb-3"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                        <Zap className="w-9 h-9 text-yellow-400" fill="currentColor" />
                        <h1 className="text-5xl font-black tracking-widest bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">THOR</h1>
                        <Zap className="w-9 h-9 text-yellow-400" fill="currentColor" />
                    </motion.div>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Permissions Required</h2>
                        <p className="text-slate-400 text-sm">
                            THOR needs these permissions to protect you. The app <strong className="text-white">cannot open</strong> without both.
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {permissions.map((perm) => (
                            <motion.div key={perm.id} layout
                                className={`rounded-2xl border p-5 transition-all ${perm.status === "granted" ? "border-green-500/30 bg-green-500/5" :
                                        perm.status === "denied" ? "border-red-500/30 bg-red-500/5" :
                                            "border-white/10 bg-white/5"
                                    }`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-${perm.color}-500/10 flex-shrink-0`}>
                                        <perm.icon className={`w-6 h-6 text-${perm.color}-400`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-white">{perm.title}</h3>
                                            <StatusIcon status={perm.status} />
                                        </div>
                                        <p className="text-slate-400 text-xs mb-3">{perm.desc}</p>
                                        {perm.status !== "granted" && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                onClick={perm.action}
                                                disabled={perm.status === "requesting"}
                                                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-60 ${perm.status === "denied"
                                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                        : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                                                    }`}>
                                                {perm.status === "denied" ? "⚠ Enable in Browser Settings" :
                                                    perm.status === "requesting" ? "Requesting..." : "Grant Access"}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Denied warning */}
                    <AnimatePresence>
                        {(gps === "denied" || notif === "denied") && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
                                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-300 text-sm font-semibold">Permission Denied</p>
                                    <p className="text-red-400/80 text-xs mt-1">
                                        Please click the 🔒 icon in your browser's address bar and enable {gps === "denied" ? "Location" : "Notifications"} to proceed.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success state */}
                    <AnimatePresence>
                        {allGranted && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: 2 }}>
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                </motion.div>
                                <p className="text-green-400 font-bold text-lg">All set! Opening THOR...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mt-4">
                        {permissions.map((p) => (
                            <div key={p.id} className={`w-2 h-2 rounded-full transition-all ${p.status === "granted" ? "bg-green-400" :
                                    p.status === "denied" ? "bg-red-400" : "bg-white/20"
                                }`} />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
