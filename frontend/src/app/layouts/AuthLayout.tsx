import { Outlet } from "react-router";
import { Zap } from "lucide-react";
import { motion } from "motion/react";

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex" style={{ background: "var(--thor-bg)" }}>
            {/* Left — Brand panel */}
            <div className="hidden lg:flex flex-col justify-center items-center w-[480px] flex-shrink-0 relative overflow-hidden"
                style={{ background: "var(--thor-bg-elevated)" }}>
                {/* Solid Premium Floating Elements */}
                <motion.div className="absolute top-[20%] right-[15%] w-24 h-24 rounded-2xl pointer-events-none"
                    style={{ background: "var(--thor-surface-3)", border: "1px solid var(--thor-border-hover)", boxShadow: "var(--thor-shadow-solid)" }}
                    animate={{ y: [0, -15, 0], rotate: [0, 90, 180, 270, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute bottom-[20%] left-[10%] w-16 h-16 rounded-xl pointer-events-none"
                    style={{ background: "var(--thor-brand)", boxShadow: "0 0 20px rgba(234, 179, 8, 0.4)" }}
                    animate={{ y: [0, 20, 0], rotate: [360, 270, 180, 90, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />

                <div className="relative z-10 text-center px-12">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <Zap className="w-12 h-12" style={{ color: "var(--thor-brand)" }} fill="currentColor" />
                    </div>
                    <h1 className="text-display mb-3" style={{
                        background: "linear-gradient(135deg, var(--thor-brand), #ef4444)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        THOR
                    </h1>
                    <p className="text-body" style={{ color: "var(--thor-text-muted)" }}>
                        <span style={{ textDecoration: "line-through", opacity: 0.5 }}>God of Thunder</span>
                    </p>
                    <p className="text-heading mt-1" style={{ color: "var(--thor-text-secondary)" }}>
                        Guard of Tourism
                    </p>
                </div>
            </div>

            {/* Right — Form area */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
