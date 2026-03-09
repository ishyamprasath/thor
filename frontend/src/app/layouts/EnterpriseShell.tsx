import { useState } from "react";
import { Outlet, Navigate, useLocation, NavLink } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard, Users, Activity, ShieldAlert,
    Settings, LogOut, Zap, Bell, Search, Menu,
    MessageSquare, Mic, Globe
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/TranslationContext";
import { useTheme } from "../context/ThemeContext";
import InstallPrompt from "../components/InstallPrompt";

export default function EnterpriseShell() {
    const { token, user, logout } = useAuth();
    const location = useLocation();
    const { translate } = useTranslation();
    const { theme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const navItems = [
        { label: "Command Center", icon: LayoutDashboard, path: "/enterprise" },
        { label: "Active Trips", icon: Users, path: "/enterprise/trips" },
        { label: "Activity Feed", icon: Activity, path: "/enterprise/activity" },
        { label: "Authority / SOS", icon: ShieldAlert, path: "/enterprise/authority" },
        { label: "Community", icon: Globe, path: "/community" },
        { label: "AI Chat", icon: MessageSquare, path: "/chat" },
        { label: "Voice AI", icon: Mic, path: "/voice" },
        { label: "Settings", icon: Settings, path: "/enterprise/settings" },
    ];

    return (
        <main
            className="h-screen w-screen flex overflow-hidden transition-colors duration-300"
            style={{ background: "var(--thor-bg)", color: "var(--thor-text)" }}
        >
            {/* Ambient Background (Same as Tourist but scaled to full width) */}
            <div className="ambient-bg w-full h-full fixed inset-0 z-0 pointer-events-none">
                <div className="ambient-orb" />
                <div className="ambient-orb" />
                <div className="ambient-orb" />
            </div>

            {/* Desktop Sidebar Navigation */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 80 }}
                className="h-full flex-shrink-0 z-20 flex flex-col relative border-r"
                style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}
            >
                {/* Branding Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b" style={{ borderColor: "var(--thor-border)" }}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Zap className="w-8 h-8 flex-shrink-0" style={{ color: "var(--thor-brand)" }} fill="currentColor" />
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-2xl font-black tracking-widest uppercase whitespace-nowrap"
                                    style={{ color: "var(--thor-text)" }}
                                >
                                    THOR<span style={{ color: "var(--thor-brand)" }}>.</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/enterprise"}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/5"}`
                                }
                                style={({ isActive }) => ({
                                    color: isActive ? "var(--thor-brand)" : "var(--thor-text-secondary)",
                                    ...(isActive ? { background: "var(--thor-surface-3)" } : {})
                                })}
                            >
                                <Icon className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110" />
                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="font-semibold text-sm whitespace-nowrap"
                                            style={{ color: "var(--thor-text)" }}
                                        >
                                            {translate(item.label)}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Profile Area */}
                <div className="p-4 border-t" style={{ borderColor: "var(--thor-border)" }}>
                    <div
                        className="flex items-center gap-3 p-2 rounded-xl"
                        style={{ background: "var(--thor-surface-2)" }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0"
                            style={{ background: "var(--thor-surface-3)", color: "var(--thor-brand)", border: "1px solid var(--thor-border-glow)" }}>
                            {user?.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate" style={{ color: "var(--thor-text)" }}>{user?.name || "Enterprise Admin"}</p>
                                <p className="text-xs truncate" style={{ color: "var(--thor-text-muted)" }}>{user?.email}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => logout()}
                        className="mt-2 w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all text-red-500 hover:bg-red-500/10"
                    >
                        <LogOut className="w-6 h-6 flex-shrink-0" />
                        {sidebarOpen && <span className="font-bold text-sm">Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
                {/* Enterprise Top Bar (Landscape specific) */}
                <header className="h-20 flex items-center justify-between px-8 border-b flex-shrink-0 backdrop-blur-md"
                    style={{ background: "var(--thor-surface)", borderColor: "var(--thor-border)" }}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: "var(--thor-text-secondary)" }}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="relative w-96 hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--thor-text-disabled)" }} />
                            <input
                                type="text"
                                placeholder={translate("Search tourists, trips, alerts...")}
                                className="input text-sm h-10 w-full"
                                style={{ paddingLeft: "2.5rem", borderRadius: "8px", background: "var(--thor-surface-2)" }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--thor-text-secondary)" }}>
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2" style={{ borderColor: "var(--thor-surface)" }} />
                        </button>
                    </div>
                </header>

                {/* Dashboard Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <InstallPrompt />
        </main>
    );
}
