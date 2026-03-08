import { Outlet, Navigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import InstallPrompt from "../components/InstallPrompt";

export default function AppShell() {
    const { token } = useAuth();
    const location = useLocation();

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
            </div>

            <InstallPrompt />
        </>
    );
}
