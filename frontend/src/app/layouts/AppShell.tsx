import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/TranslationContext";
import { API_URL } from "../config/api";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import InstallPrompt from "../components/InstallPrompt";

export default function AppShell() {
    const { user, token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { translate } = useTranslation();

    const [showGeofenceWarning, setShowGeofenceWarning] = useState(false);

    useEffect(() => {
        if (!user || !user.id || !token) return;

        const checkGeofence = async () => {
            try {
                const res = await fetch(`${API_URL}/safety/my-alert`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.alert) {
                        alert("⚠️ RESTRICTED ZONE ALERT ⚠️\nYou have entered a NO-GO ZONE!");
                        setShowGeofenceWarning(true);
                    }
                }
            } catch (e) { }
        };

        // Poll every 3 seconds
        const interval = setInterval(checkGeofence, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [user, token]);

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <>
            <div className="ambient-bg">
                <div className="ambient-orb" />
                <div className="ambient-orb" />
                <div className="ambient-orb" />
            </div>

            <div className="flex flex-col h-screen overflow-hidden text-thor-text border-x mx-auto max-w-[600px] relative z-10" style={{ background: "var(--thor-bg)", borderColor: "var(--thor-border)" }}>
                {/* Fixed Header */}
                <TopBar />

                {/* Scrollable Main Area (padding bottom for BottomNav) */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-4 pb-28">
                    <AnimatePresence mode="wait">
                        <motion.div key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="min-h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Fixed Footer Navigation */}
                <BottomNav />

                {/* Geofence Alert Modal */}
                <AnimatePresence>
                    {showGeofenceWarning && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 50, rotateX: 20 }}
                                animate={{ scale: 1, y: 0, rotateX: 0 }}
                                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                                className="bg-red-600 border-4 border-red-500 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_100px_rgba(220,38,38,0.6)] text-center relative overflow-hidden"
                            >
                                {/* Flashing background effect */}
                                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" style={{ animationDuration: '0.5s' }} />

                                <div className="relative z-10 space-y-6">
                                    <div className="w-24 h-24 mx-auto bg-black rounded-full flex items-center justify-center shadow-2xl">
                                        <AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" strokeWidth={3} />
                                    </div>

                                    <div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">
                                            {translate("RESTRICTED ZONE")}
                                        </h2>
                                        <p className="text-red-100 font-bold text-lg mb-1 leading-tight">
                                            {translate("You have entered a NO-GO ZONE!")}
                                        </p>
                                        <p className="text-white text-sm font-medium bg-black/40 p-3 rounded-lg mx-auto">
                                            {translate("Escalate immediately or authorities will take action. Leave this area at once.")}
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <button
                                            onClick={() => {
                                                setShowGeofenceWarning(false);
                                                navigate("/emergency");
                                            }}
                                            className="w-full bg-black text-red-500 hover:bg-zinc-900 border border-red-500 py-4 rounded-xl flex justify-center items-center gap-2 font-black tracking-widest uppercase transition-colors"
                                        >
                                            <ShieldAlert className="w-6 h-6" /> {translate("TRIGGER SOS NOW")}
                                        </button>
                                        <button
                                            onClick={() => setShowGeofenceWarning(false)}
                                            className="text-white/70 hover:text-white font-bold text-sm underline decoration-red-400/30 underline-offset-4"
                                        >
                                            {translate("I acknowledge, navigating away")}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <InstallPrompt />
        </>
    );
}
